import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { ehAdmin } from "@/lib/uso";

export async function adminAtual() {
  const id = await lerSessao();
  if (!id) return null;
  const p = await prisma.professor.findUnique({ where: { id }, select: { id: true, email: true, nome: true } });
  return p && ehAdmin(p.email) ? p : null;
}
