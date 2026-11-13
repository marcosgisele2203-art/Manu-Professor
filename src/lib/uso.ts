import { prisma } from "@/lib/db";

// Modelo de IA por função: Opus em todo conteúdo criativo; as instruções de atividade são texto curto e simples, então vão para um modelo mais barato
export const PRECOS = {
  "claude-opus-5-5": { entrada: 4, saida: 20 },
  "claude-sonnet-5-5": { entrada: 2, saida: 10 },
} as const; // US$ por milhão de tokens, só para estimar o custo no painel
export type Modelo = keyof typeof PRECOS;
const MODELO_PADRAO: Modelo = "claude-opus-5-5";
const MODELO_POR_TIPO: Partial<Record<string, Modelo>> = { atividade: "claude-sonnet-5-5" };
export const modeloDe = (tipo: string): Modelo => MODELO_POR_TIPO[tipo] ?? MODELO_PADRAO;
// Estimativa: pedidos antigos de atividade (feitos com Opus) aparecem pelo preço do modelo atual
export const custoUSD = (entrada: number, saida: number, tipo: string) => {
  const p = PRECOS[modeloDe(tipo)];
  return (entrada * p.entrada + saida * p.saida) / 1_000_000;
};

export const limitePadrao = () => {
  const n = Number(process.env.LIMITE_IA_MENSAL);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60;
};

// Dia 1º à meia-noite no horário de Brasília (UTC-3, sem horário de verão desde 2019), seja qual for o fuso do servidor
export const inicioDoMes = () => {
  const br = new Date(Date.now() - 3 * 3600_000);
  return new Date(Date.UTC(br.getUTCFullYear(), br.getUTCMonth(), 1, 3));
};

export async function situacaoIA(professorId: string) {
  const p = await prisma.professor.findUnique({ where: { id: professorId }, select: { limiteIA: true, bloqueado: true } });
  const usados = await prisma.usoIA.count({ where: { professorId, criadoEm: { gte: inicioDoMes() } } });
  const limite = p?.limiteIA ?? limitePadrao();
  return { usados, limite, restantes: Math.max(0, limite - usados), bloqueado: !!p?.bloqueado };
}

export async function registrarUso(professorId: string, tipo: string, entrada: number, saida: number) {
  await prisma.usoIA.create({ data: { professorId, tipo, tokensEntrada: entrada, tokensSaida: saida } }).catch(() => {});
}

// Administradores: e-mails listados em ADMIN_EMAILS (separados por vírgula).
// Só vale com e-mail confirmado: conta ligada ao Google e sessão aberta pelo Google (ver adminAtual)
export function ehAdminConfirmado(p: { email: string; googleSub?: string | null }, sessaoGoogle: boolean) {
  return Boolean(p.googleSub) && sessaoGoogle && ehAdmin(p.email);
}
export function ehAdmin(email: string) {
  return (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
