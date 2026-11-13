import { prisma } from "@/lib/db";

// Preço do modelo usado (US$ por milhão de tokens). Usado só para estimar o custo no painel.
export const PRECO = { entrada: 4, saida: 20 };
export const custoUSD = (entrada: number, saida: number) => (entrada * PRECO.entrada + saida * PRECO.saida) / 1_000_000;

export const limitePadrao = () => {
  const n = Number(process.env.LIMITE_IA_MENSAL);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60;
};

export const inicioDoMes = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); };

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
