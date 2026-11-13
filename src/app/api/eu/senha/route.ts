import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { lerSessaoCompleta, criarSessao } from "@/lib/auth";

// Trocar a senha (ou criar a primeira, para quem entra com Google ou com senha provisória)
export async function POST(req: Request) {
  const sessao = await lerSessaoCompleta();
  const id = sessao?.id;
  if (!id) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  const { atual, nova } = await req.json().catch(() => ({}));
  if (typeof nova !== "string" || nova.length < 8) return NextResponse.json({ erro: "A senha nova precisa ter pelo menos 8 caracteres." }, { status: 400 });
  if (nova.length > 200) return NextResponse.json({ erro: "Senha longa demais." }, { status: 400 });
  const p = await prisma.professor.findUnique({ where: { id }, select: { senhaHash: true, trocarSenha: true } });
  if (!p) return NextResponse.json({ erro: "Conta não encontrada." }, { status: 404 });
  // quem já tem senha própria confirma a atual; senha provisória ou conta só do Google não precisa
  if (p.senhaHash && !p.trocarSenha && !(typeof atual === "string" && (await bcrypt.compare(atual, p.senhaHash))))
    return NextResponse.json({ erro: "A senha atual não confere." }, { status: 400 });
  await prisma.professor.update({ where: { id }, data: { senhaHash: await bcrypt.hash(nova, 10), trocarSenha: false, sessaoVersao: { increment: 1 } } });
  // os outros aparelhos saem; este continua conectado
  await criarSessao(id, { google: sessao.google });
  return NextResponse.json({ ok: true });
}
