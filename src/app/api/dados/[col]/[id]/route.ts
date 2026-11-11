import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { ehColecao } from "@/lib/colecoes";

type Ctx = { params: Promise<{ col: string; id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { col, id } = await params;
  const pid = await lerSessao();
  if (!pid) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  if (!ehColecao(col)) return NextResponse.json({ erro: "Coleção desconhecida." }, { status: 404 });
  await prisma.registro.deleteMany({ where: { id, professorId: pid, colecao: col } });
  return NextResponse.json({ ok: true });
}
