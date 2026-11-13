import { prisma } from "@/lib/db";
import { lerSessaoCompleta } from "@/lib/auth";
import { ehAdminConfirmado } from "@/lib/uso";

// Administrador: e-mail em ADMIN_EMAILS, confirmado pelo Google (conta ligada ao Google e sessão aberta pelo Google).
// Quem cadastra com senha um e-mail da lista não vira administrador.
export async function adminAtual() {
  const s = await lerSessaoCompleta();
  if (!s) return null;
  const p = await prisma.professor.findUnique({ where: { id: s.id }, select: { id: true, email: true, nome: true, googleSub: true } });
  return p && ehAdminConfirmado(p, s.google) ? { id: p.id, email: p.email, nome: p.nome } : null;
}
