import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { situacaoIA, ehAdmin } from "@/lib/uso";

export async function GET() {
  const id = await lerSessao();
  const p = id ? await prisma.professor.findUnique({ where: { id }, select: { nome: true, email: true, escola: true, googleRefresh: true } }) : null;
  if (!p) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  const sit = await situacaoIA(id!);
  const { googleRefresh: _g, ...dados } = p;
  return NextResponse.json({ ...dados, ia: Boolean(process.env.ANTHROPIC_API_KEY), usoIA: sit, admin: ehAdmin(p.email), googleClientId: process.env.GOOGLE_CLIENT_ID || "", googleConectado: Boolean(p.googleRefresh) });
}
