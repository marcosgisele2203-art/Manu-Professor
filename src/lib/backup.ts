import { gzipSync, gunzipSync } from "zlib";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { renovarAcesso, decifrar, googleConfigurado } from "@/lib/google";

// Cópia de segurança de tudo: professores (sem a permissão do Google), turmas, chamadas, notas etc.
const PASTA = "Manu Professor · Backups";
const GUARDAR = 30; // quantos backups diários ficam no Drive

export async function gerarBackup() {
  const [professores, registros, usosIA] = await Promise.all([
    prisma.professor.findMany({ select: { id: true, nome: true, email: true, senhaHash: true, googleSub: true, escola: true, escolas: true, disciplinas: true, etapas: true, foto: true, criadoEm: true, aceitouTermosEm: true, limiteIA: true, bloqueado: true } }),
    prisma.registro.findMany(),
    prisma.usoIA.findMany(),
  ]);
  return { app: "manu-professor", versao: 1, geradoEm: new Date().toISOString(), professores, registros, usosIA };
}
export type Backup = Awaited<ReturnType<typeof gerarBackup>>;

export const compactar = (b: Backup) => gzipSync(Buffer.from(JSON.stringify(b)));
export const nomeArquivo = (d = new Date()) => `manu-professor-backup-${d.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" })}.json.gz`;

export function lerArquivo(buf: Buffer): Backup {
  const txt = buf[0] === 0x1f && buf[1] === 0x8b ? gunzipSync(buf).toString("utf8") : buf.toString("utf8");
  const b = JSON.parse(txt);
  if (b?.app !== "manu-professor" || !Array.isArray(b.professores) || !Array.isArray(b.registros)) throw new Error("Este arquivo não é um backup do Manu Professor.");
  return b;
}

// Restaurar nunca apaga nada: só recoloca o que falta e atualiza o que veio no arquivo
export async function restaurar(b: Backup) {
  let professores = 0, registros = 0, pulados = 0;
  for (const p of b.professores) {
    const outro = await prisma.professor.findUnique({ where: { email: p.email }, select: { id: true } });
    if (outro && outro.id !== p.id) { pulados++; continue; } // mesmo e-mail em outra conta: não mexe
    const { id, ...dados } = p;
    const d = { ...dados, criadoEm: new Date(dados.criadoEm), aceitouTermosEm: dados.aceitouTermosEm ? new Date(dados.aceitouTermosEm) : null };
    await prisma.professor.upsert({ where: { id }, create: { id, ...d }, update: d });
    professores++;
  }
  const ids = new Set((await prisma.professor.findMany({ select: { id: true } })).map((p) => p.id));
  for (const r of b.registros) {
    if (!ids.has(r.professorId)) { pulados++; continue; }
    const d = { colecao: r.colecao, dados: r.dados as Prisma.InputJsonValue, professorId: r.professorId };
    await prisma.registro.upsert({ where: { id: r.id }, create: { id: r.id, ...d, criadoEm: new Date(r.criadoEm) }, update: d });
    registros++;
  }
  return { professores, registros, pulados };
}

/* ---------- Google Drive do administrador ---------- */
async function tokenDoAdmin() {
  if (!googleConfigurado()) return { erro: "O login com Google não está configurado." };
  const emails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const adms = await prisma.professor.findMany({ where: { email: { in: emails }, googleRefresh: { not: null } }, select: { email: true, googleRefresh: true } });
  for (const a of adms) {
    const refresh = decifrar(a.googleRefresh!);
    if (!refresh) continue;
    const r = await renovarAcesso(refresh);
    if (r.ok && r.access_token) return { token: r.access_token, email: a.email };
  }
  return { erro: "Nenhum administrador está com o Google Drive conectado. Na página inicial do sistema, toque em “Conectar” no aviso do Google Drive (com o e-mail de administrador) e marque a caixinha do Drive." };
}

async function drive(token: string, url: string, init: RequestInit = {}) {
  const r = await fetch("https://www.googleapis.com/" + url, { ...init, headers: { Authorization: "Bearer " + token, ...(init.headers || {}) } });
  if (!r.ok) throw new Error(`Google Drive respondeu ${r.status}`);
  return r.status === 204 ? null : r.json();
}
const q = (s: string) => encodeURIComponent(s);

async function pastaBackups(token: string) {
  const achou = await drive(token, `drive/v3/files?q=${q(`name='${PASTA}' and mimeType='application/vnd.google-apps.folder' and trashed=false`)}&fields=files(id)`);
  if (achou.files?.[0]) return achou.files[0].id as string;
  const nova = await drive(token, "drive/v3/files?fields=id", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: PASTA, mimeType: "application/vnd.google-apps.folder" }) });
  return nova.id as string;
}

export async function listarBackupsDrive() {
  const t = await tokenDoAdmin();
  if (!t.token) return { erro: t.erro, arquivos: [] as { id: string; name: string; size?: string; createdTime: string }[] };
  const pasta = await pastaBackups(t.token);
  const l = await drive(t.token, `drive/v3/files?q=${q(`'${pasta}' in parents and trashed=false`)}&orderBy=createdTime desc&pageSize=60&fields=files(id,name,size,createdTime)`);
  return { email: t.email, arquivos: l.files as { id: string; name: string; size?: string; createdTime: string }[] };
}

export async function backupParaDrive() {
  const t = await tokenDoAdmin();
  if (!t.token) return { ok: false, erro: t.erro };
  const b = await gerarBackup(), gz = compactar(b), nome = nomeArquivo(), pasta = await pastaBackups(t.token);
  // o do mesmo dia é substituído
  const mesmo = await drive(t.token, `drive/v3/files?q=${q(`'${pasta}' in parents and name='${nome}' and trashed=false`)}&fields=files(id)`);
  for (const f of mesmo.files || []) await drive(t.token, `drive/v3/files/${f.id}`, { method: "DELETE" });
  const limite = "manu" + Date.now().toString(36);
  const corpo = Buffer.concat([
    Buffer.from(`--${limite}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: nome, parents: [pasta], mimeType: "application/gzip" })}\r\n--${limite}\r\nContent-Type: application/gzip\r\n\r\n`),
    gz, Buffer.from(`\r\n--${limite}--`),
  ]);
  await drive(t.token, "upload/drive/v3/files?uploadType=multipart&fields=id", { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${limite}` }, body: corpo });
  // mantém só os mais recentes
  const todos = await drive(t.token, `drive/v3/files?q=${q(`'${pasta}' in parents and trashed=false`)}&orderBy=createdTime desc&pageSize=200&fields=files(id)`);
  for (const f of (todos.files || []).slice(GUARDAR)) await drive(t.token, `drive/v3/files/${f.id}`, { method: "DELETE" }).catch(() => {});
  return { ok: true, nome, email: t.email, tamanho: gz.length, professores: b.professores.length, registros: b.registros.length };
}

/* ---------- agenda: todo dia às 3h (horário de Brasília) ---------- */
let agendado = false;
export function agendarBackupDiario() {
  if (agendado) return; agendado = true;
  const proxima = () => {
    const agora = new Date(), alvo = new Date(agora);
    alvo.setUTCHours(6, 0, 0, 0); // 3h em Brasília = 6h UTC
    if (alvo <= agora) alvo.setUTCDate(alvo.getUTCDate() + 1);
    return alvo.getTime() - agora.getTime();
  };
  const rodar = async () => {
    try { const r = await backupParaDrive(); console.log("[backup]", r.ok ? `ok ${r.nome} (${r.registros} registros)` : `não feito: ${r.erro}`); }
    catch (e) { console.error("[backup] falhou:", e instanceof Error ? e.message : e); }
    setTimeout(rodar, proxima());
  };
  setTimeout(rodar, proxima());
  // logo depois de cada implantação também, para não ficar um dia sem cópia
  setTimeout(() => backupParaDrive().then((r) => console.log("[backup] inicial", r.ok ? r.nome : r.erro)).catch((e) => console.error("[backup] inicial falhou:", e?.message)), 10 * 60 * 1000);
}
