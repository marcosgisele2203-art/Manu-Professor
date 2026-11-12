import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { criarSessao, guardarGooglePendente } from "@/lib/auth";
import { googleConfigurado, trocarCodigo, verificarIdToken, cifrar, temDrive } from "@/lib/google";

// "Continuar com Google": entra ou cria a conta e guarda a permissão do Drive
export async function POST(req: Request) {
  if (!googleConfigurado()) return NextResponse.json({ erro: "O login com Google ainda não foi configurado." }, { status: 503 });
  const { code, aceite } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || !code) return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  let tokens, perfil;
  try { tokens = await trocarCodigo(code); perfil = await verificarIdToken(tokens.id_token); }
  catch { return NextResponse.json({ erro: "Não foi possível confirmar sua conta Google. Tente de novo." }, { status: 401 }); }
  if (!perfil.email || !perfil.email_verified) return NextResponse.json({ erro: "Sua conta Google não tem e-mail confirmado." }, { status: 400 });
  const email = perfil.email.toLowerCase();
  const fotoGoogle = typeof perfil.picture === "string" && perfil.picture.startsWith("https://") ? perfil.picture.slice(0, 500) : undefined;
  const refresh = tokens.refresh_token && temDrive(tokens.scope) ? cifrar(tokens.refresh_token) : undefined;
  let p = await prisma.professor.findFirst({ where: { OR: [{ googleSub: perfil.sub }, { email }] } });
  if (!p) {
    if (aceite !== true) {
      // Guarda a conta confirmada pelo Google por 10 minutos, para o professor só marcar o aceite
      await guardarGooglePendente({ sub: perfil.sub, email, nome: perfil.name || email.split("@")[0], refresh, foto: fotoGoogle });
      return NextResponse.json({ precisaAceite: true, email, nome: perfil.name || "" });
    }
    p = await prisma.professor.create({ data: { nome: perfil.name || email.split("@")[0], email, googleSub: perfil.sub, googleRefresh: refresh, foto: fotoGoogle, aceitouTermosEm: new Date() } });
  } else {
    p = await prisma.professor.update({ where: { id: p.id }, data: { googleSub: perfil.sub, ...(refresh ? { googleRefresh: refresh } : {}), ...(!p.foto && fotoGoogle ? { foto: fotoGoogle } : {}) } });
  }
  await criarSessao(p.id);
  return NextResponse.json({ ok: true });
}
