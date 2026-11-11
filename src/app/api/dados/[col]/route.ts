import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { ehColecao, ID_OK } from "@/lib/colecoes";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ col: string }> };

// Lista todos os registros do professor numa coleção
export async function GET(_req: Request, { params }: Ctx) {
  const { col } = await params;
  const pid = await lerSessao();
  if (!pid) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  if (!ehColecao(col)) return NextResponse.json({ erro: "Coleção desconhecida." }, { status: 404 });
  const regs = await prisma.registro.findMany({ where: { professorId: pid, colecao: col }, orderBy: { criadoEm: "asc" } });
  return NextResponse.json(regs.map((r) => ({ ...(r.dados as object), id: r.id })));
}

// Cria ou substitui um registro (o id vem do navegador)
export async function PUT(req: Request, { params }: Ctx) {
  const { col } = await params;
  const pid = await lerSessao();
  if (!pid) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  if (!ehColecao(col)) return NextResponse.json({ erro: "Coleção desconhecida." }, { status: 404 });
  const corpo = await req.json().catch(() => null);
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo) || typeof corpo.id !== "string" || !ID_OK.test(corpo.id))
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  if (JSON.stringify(corpo).length > 500_000) return NextResponse.json({ erro: "Registro grande demais." }, { status: 413 });
  const { id, ...dados } = corpo as { id: string } & Record<string, unknown>;
  const existente = await prisma.registro.findUnique({ where: { id } });
  if (existente && (existente.professorId !== pid || existente.colecao !== col))
    return NextResponse.json({ erro: "Identificador já usado." }, { status: 409 });
  await prisma.registro.upsert({
    where: { id },
    create: { id, colecao: col, professorId: pid, dados: dados as Prisma.InputJsonValue },
    update: { dados: dados as Prisma.InputJsonValue },
  });
  return NextResponse.json({ ok: true });
}
