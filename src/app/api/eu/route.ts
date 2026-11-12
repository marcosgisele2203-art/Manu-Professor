import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { situacaoIA, ehAdmin } from "@/lib/uso";

export async function GET() {
  const id = await lerSessao();
  const p = id ? await prisma.professor.findUnique({ where: { id }, select: { nome: true, email: true, escola: true, escolas: true, disciplinas: true, etapas: true, googleRefresh: true } }) : null;
  if (!p) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  const sit = await situacaoIA(id!);
  const { googleRefresh: _g, ...dados } = p;
  // contas antigas: a escola do cadastro vira a primeira da lista
  const escolas = dados.escolas.length ? dados.escolas : dados.escola ? [dados.escola] : [];
  return NextResponse.json({ ...dados, escolas, ia: Boolean(process.env.ANTHROPIC_API_KEY), usoIA: sit, admin: ehAdmin(p.email), googleClientId: process.env.GOOGLE_CLIENT_ID || "", googleConectado: Boolean(p.googleRefresh) });
}

const texto = (max: number) => z.string().trim().min(1).max(max);
const Perfil = z.object({
  nome: texto(120).optional(),
  escolas: z.array(texto(120)).max(10).optional(),
  disciplinas: z.array(texto(80)).max(30).optional(),
  etapas: z.array(z.enum(["ei", "ef1", "ef2", "em", "eja", "outro"])).max(6).optional(),
});

export async function PATCH(req: Request) {
  const id = await lerSessao();
  if (!id) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  const r = Perfil.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ erro: "Dados do perfil inválidos." }, { status: 400 });
  const unico = (xs: string[]) => [...new Map(xs.map(x => [x.toLocaleLowerCase("pt-BR"), x])).values()];
  const d: { nome?: string; escolas?: string[]; escola?: string | null; disciplinas?: string[]; etapas?: string[] } = {};
  if (r.data.nome) d.nome = r.data.nome;
  if (r.data.escolas) { d.escolas = unico(r.data.escolas); d.escola = d.escolas[0] || null; }
  if (r.data.disciplinas) d.disciplinas = unico(r.data.disciplinas);
  if (r.data.etapas) d.etapas = [...new Set(r.data.etapas)];
  const p = await prisma.professor.update({ where: { id }, data: d, select: { nome: true, escola: true, escolas: true, disciplinas: true, etapas: true } });
  return NextResponse.json(p);
}
