import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";

export const dynamic = "force-dynamic";

// LGPD: o professor baixa tudo o que é dele
export async function GET() {
  const id = await lerSessao();
  if (!id) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  const [perfil, registros] = await Promise.all([
    prisma.professor.findUnique({ where: { id }, select: { nome: true, email: true, escolas: true, disciplinas: true, etapas: true, criadoEm: true } }),
    prisma.registro.findMany({ where: { professorId: id }, select: { colecao: true, dados: true, atualizadoEm: true } }),
  ]);
  const dados: Record<string, unknown[]> = {};
  for (const r of registros) (dados[r.colecao] ||= []).push(r.dados);
  // a coleção "perfil" guarda a entrevista "Meu jeito de dar aula": sai com outro nome para não sobrescrever o perfil acima
  const { perfil: jeitoDeDarAula, ...colecoes } = dados;
  const corpo = JSON.stringify({ app: "manu-professor", exportadoEm: new Date().toISOString(), perfil, ...(jeitoDeDarAula ? { jeitoDeDarAula } : {}), ...colecoes }, null, 2);
  const dia = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  return new Response(corpo, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="meus-dados-manu-professor-${dia}.json"`, "Cache-Control": "no-store" } });
}
