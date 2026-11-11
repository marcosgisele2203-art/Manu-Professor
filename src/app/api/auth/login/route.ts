import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { criarSessao } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, senha } = await req.json().catch(() => ({}));
  const p = typeof email === "string" ? await prisma.professor.findUnique({ where: { email: email.trim().toLowerCase() } }) : null;
  if (!p || typeof senha !== "string" || !(await bcrypt.compare(senha, p.senhaHash)))
    return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
  await criarSessao(p.id);
  return NextResponse.json({ ok: true });
}
