import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { googleConfigurado, trocarCodigo, cifrar, temDrive } from "@/lib/google";

// Conectar (ou reconectar) o Google Drive de quem já está logado
export async function POST(req: Request) {
  const id = await lerSessao();
  if (!id) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  if (!googleConfigurado()) return NextResponse.json({ erro: "O Google ainda não foi configurado." }, { status: 503 });
  const { code } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || !code) return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  let tokens;
  try { tokens = await trocarCodigo(code); } catch { return NextResponse.json({ erro: "Não foi possível falar com o Google. Tente de novo." }, { status: 502 }); }
  if (!temDrive(tokens.scope)) return NextResponse.json({ erro: "Faltou marcar a caixinha do Google Drive na tela do Google. Tente de novo e marque a caixinha antes de clicar em Continuar.", semDrive: true }, { status: 400 });
  if (!tokens.refresh_token) return NextResponse.json({ erro: "O Google não enviou a permissão. Tente de novo." }, { status: 400 });
  await prisma.professor.update({ where: { id }, data: { googleRefresh: cifrar(tokens.refresh_token) } });
  return NextResponse.json({ ok: true });
}
