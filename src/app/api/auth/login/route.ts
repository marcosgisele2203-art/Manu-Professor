import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { criarSessao } from "@/lib/auth";
import { loginBloqueado, loginErrou, loginOk } from "@/lib/limite";

export async function POST(req: Request) {
  const { email, senha } = await req.json().catch(() => ({}));
  // O proxy do EasyPanel acrescenta o IP verdadeiro no FIM do x-forwarded-for; o começo pode ser inventado pelo navegador.
  const ip = (req.headers.get("x-forwarded-for") || "").split(",").pop()!.trim();
  const em = typeof email === "string" ? email.trim().toLowerCase() : "";
  // Dois limites: por aparelho (IP) e por conta (e-mail), para que trocar de IP não libere tentativas sem fim
  const chaves = [["ip|" + ip, 8], ["email|" + em, 20]] as const;
  const min = Math.max(...chaves.map(([c, max]) => loginBloqueado(c, max)));
  if (min) return NextResponse.json({ erro: `Muitas tentativas erradas. Espere ${min} minuto${min > 1 ? "s" : ""} e tente de novo.` }, { status: 429 });
  const p = typeof email === "string" ? await prisma.professor.findUnique({ where: { email: em } }) : null;
  if (p && !p.senhaHash) return NextResponse.json({ erro: "Esta conta entra com o Google. Use o botão Continuar com Google." }, { status: 401 });
  if (!p || typeof senha !== "string" || !(await bcrypt.compare(senha, p.senhaHash!))) {
    for (const [c] of chaves) loginErrou(c);
    return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
  }
  loginOk(chaves[0][0]);
  await criarSessao(p.id);
  return NextResponse.json({ ok: true });
}
