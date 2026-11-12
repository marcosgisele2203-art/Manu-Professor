import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { adminAtual } from "@/lib/admin";
import { backupParaDrive } from "@/lib/backup";

const voltar = (msg: string, id = "") => new Response(null, { status: 303, headers: { Location: "/admin?msg=" + encodeURIComponent(msg) + (id ? "#p-" + id : "") } });

// Formulário do painel: muda o limite mensal de IA ou suspende/libera um professor
export async function POST(req: Request) {
  const adm = await adminAtual();
  if (!adm) return NextResponse.json({ erro: "Acesso restrito ao administrador." }, { status: 403 });
  const f = await req.formData();
  const id = String(f.get("id") || "");
  const acao = String(f.get("acao") || "");
  const p = await prisma.professor.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ erro: "Professor não encontrado." }, { status: 404 });
  if (acao === "limite") {
    const v = String(f.get("limite") || "").trim();
    const n = v === "" ? null : Math.max(0, Math.min(10000, Math.floor(Number(v))));
    if (n !== null && !Number.isFinite(n)) return NextResponse.json({ erro: "Limite inválido." }, { status: 400 });
    await prisma.professor.update({ where: { id }, data: { limiteIA: n } });
  } else if (acao === "juntar") {
    // Junta duas contas da mesma pessoa: tudo de "p" vai para "destino" e a conta "p" é apagada
    const destino = await prisma.professor.findUnique({ where: { id: String(f.get("destino") || "") } });
    if (!destino || destino.id === p.id) return voltar("Escolha a conta que vai ficar.", id);
    if (f.get("confirmo") !== "sim") return voltar("Marque a confirmação para juntar as contas.", id);
    if (p.id === adm.id) return voltar("Você está usando a conta que seria apagada. Junte no sentido contrário ou entre com a outra conta.", id);
    await backupParaDrive().catch(() => null); // cópia antes de mexer
    const escolaOrigem = p.escolas[0] || p.escola || "";
    const uni = (a: string[], b: string[]) => [...new Map([...a, ...b].filter(Boolean).map((x) => [x.toLocaleLowerCase("pt-BR"), x])).values()];
    const regs = await prisma.registro.findMany({ where: { professorId: p.id } });
    await prisma.$transaction([
      // turmas sem escola definida ficam com a escola principal da conta de origem
      ...regs.map((r) => {
        const d = r.dados as Record<string, unknown>;
        const dados = r.colecao === "turmas" && !d.escola && escolaOrigem ? { ...d, escola: escolaOrigem } : d;
        return prisma.registro.update({ where: { id: r.id }, data: { professorId: destino.id, dados: dados as Prisma.InputJsonValue } });
      }),
      prisma.usoIA.updateMany({ where: { professorId: p.id }, data: { professorId: destino.id } }),
      prisma.professor.update({ where: { id: destino.id }, data: {
        escolas: uni(destino.escolas.length ? destino.escolas : destino.escola ? [destino.escola] : [], p.escolas.length ? p.escolas : p.escola ? [p.escola] : []),
        disciplinas: uni(destino.disciplinas, p.disciplinas), etapas: uni(destino.etapas, p.etapas),
        escola: destino.escola || p.escola, googleRefresh: destino.googleRefresh || p.googleRefresh,
      } }),
      prisma.professor.delete({ where: { id: p.id } }),
    ]);
    return voltar(`Contas juntadas: ${regs.length} ${regs.length === 1 ? "item" : "itens"} de ${p.email} agora ${regs.length === 1 ? "está" : "estão"} em ${destino.email}. A conta ${p.email} foi apagada.`, destino.id);
  } else if (acao === "bloquear" || acao === "liberar") {
    await prisma.professor.update({ where: { id }, data: { bloqueado: acao === "bloquear" } });
  }
  // Redireciona com caminho relativo: atrás do proxy do EasyPanel, req.url traz o endereço interno do contêiner
  return new Response(null, { status: 303, headers: { Location: "/admin#p-" + id } });
}
