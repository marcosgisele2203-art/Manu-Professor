import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminAtual } from "@/lib/admin";

// Formulário do painel: muda o limite mensal de IA ou suspende/libera um professor
export async function POST(req: Request) {
  if (!(await adminAtual())) return NextResponse.json({ erro: "Acesso restrito ao administrador." }, { status: 403 });
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
  } else if (acao === "bloquear" || acao === "liberar") {
    await prisma.professor.update({ where: { id }, data: { bloqueado: acao === "bloquear" } });
  }
  // Redireciona com caminho relativo: atrás do proxy do EasyPanel, req.url traz o endereço interno do contêiner
  return new Response(null, { status: 303, headers: { Location: "/admin#p-" + id } });
}
