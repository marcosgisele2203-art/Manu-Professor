import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { criarSessao } from "@/lib/auth";

const Corpo = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  escola: z.string().trim().optional(),
  aceite: z.literal("on", { errorMap: () => ({ message: "Para criar a conta, aceite a política de privacidade." }) }),
});

export async function POST(req: Request) {
  const r = Corpo.safeParse(await req.json().catch(() => ({})));
  if (!r.success) return NextResponse.json({ erro: r.error.issues[0].message }, { status: 400 });
  const { nome, email, senha, escola } = r.data;
  if (await prisma.professor.findUnique({ where: { email } }))
    return NextResponse.json({ erro: "Já existe uma conta com este e-mail. Entre com sua senha." }, { status: 409 });
  const p = await prisma.professor.create({ data: { nome, email, escola: escola || null, escolas: escola ? [escola] : [], aceitouTermosEm: new Date(), senhaHash: await bcrypt.hash(senha, 10) } });
  await criarSessao(p.id);
  return NextResponse.json({ ok: true });
}
