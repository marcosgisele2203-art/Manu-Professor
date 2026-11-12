import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { criarSessao } from "@/lib/auth";
import { loginBloqueado, loginErrou, loginOk } from "@/lib/limite";

export async function POST(req: Request) {
  const { email, senha } = await req.json().catch(() => ({}));
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const chave = `${ip}|${typeof email === "string" ? email.trim().toLowerCase() : ""}`;
  const min = loginBloqueado(chave);
  if (min) return NextResponse.json({ erro: `Muitas tentativas erradas. Espere ${min} minuto${min > 1 ? "s" : ""} e tente de novo.` }, { status: 429 });
  const p = typeof email === "string" ? await prisma.professor.findUnique({ where: { email: email.trim().toLowerCase() } }) : null;
  if (p && !p.senhaHash) return NextResponse.json({ erro: "Esta conta entra com o Google. Use o botão Continuar com Google." }, { status: 401 });
  if (!p || typeof senha !== "string" || !(await bcrypt.compare(senha, p.senhaHash!))) {
    loginErrou(chave);
    return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
  }
  loginOk(chave);
  await criarSessao(p.id);
  return NextResponse.json({ ok: true });
}
