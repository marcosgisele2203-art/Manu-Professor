import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { googleConfigurado, renovarAcesso, decifrar } from "@/lib/google";

export const dynamic = "force-dynamic";

// Entrega ao navegador um acesso curto ao Google Drive, usando a permissão guardada no cadastro
export async function GET() {
  const pid = await lerSessao();
  if (!pid) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  if (!googleConfigurado()) return NextResponse.json({ erro: "Google não configurado." }, { status: 404 });
  const p = await prisma.professor.findUnique({ where: { id: pid }, select: { googleRefresh: true } });
  const refresh = p?.googleRefresh ? decifrar(p.googleRefresh) : null;
  if (!refresh) return NextResponse.json({ erro: "Sem permissão guardada." }, { status: 404 });
  const r = await renovarAcesso(refresh);
  if (r.invalido) { await prisma.professor.update({ where: { id: pid }, data: { googleRefresh: null } }); return NextResponse.json({ erro: "Permissão retirada." }, { status: 404 }); }
  if (!r.ok || !r.access_token) return NextResponse.json({ erro: "O Google não respondeu." }, { status: 502 });
  return NextResponse.json({ access_token: r.access_token, expires_in: r.expires_in ?? 3600 }, { headers: { "Cache-Control": "no-store" } });
}
