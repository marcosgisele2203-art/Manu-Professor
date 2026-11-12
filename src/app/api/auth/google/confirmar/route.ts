import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { criarSessao, lerGooglePendente, limparGooglePendente } from "@/lib/auth";

// Cria a conta de quem acabou de passar pelo Google e marcou o aceite da política
export async function POST(req: Request) {
  const { aceite } = await req.json().catch(() => ({}));
  if (aceite !== true) return NextResponse.json({ erro: "Para criar a conta, marque o aceite da política de privacidade." }, { status: 400 });
  const g = await lerGooglePendente();
  if (!g) return NextResponse.json({ erro: "O tempo para concluir o cadastro acabou. Clique de novo em Continuar com Google." }, { status: 410 });
  let p = await prisma.professor.findFirst({ where: { OR: [{ googleSub: g.sub }, { email: g.email }] } });
  if (!p) p = await prisma.professor.create({ data: { nome: g.nome, email: g.email, googleSub: g.sub, googleRefresh: g.refresh, foto: g.foto, aceitouTermosEm: new Date() } });
  else p = await prisma.professor.update({ where: { id: p.id }, data: { googleSub: g.sub, ...(g.refresh ? { googleRefresh: g.refresh } : {}), ...(!p.foto && g.foto ? { foto: g.foto } : {}) } });
  await limparGooglePendente();
  await criarSessao(p.id);
  return NextResponse.json({ ok: true });
}
