import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLICAS = ["/entrar", "/cadastro", "/privacidade", "/api/auth/google", "/api/auth/login", "/api/auth/cadastro", "/api/saude"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLICAS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const token = req.cookies.get("manu_sessao")?.value;
  let ok = false;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      ok = true;
    } catch {}
  }
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  return NextResponse.redirect(new URL("/entrar", req.url));
}

export const config = { matcher: ["/((?!_next|favicon.ico|app.js|app.css|manu/|vendor/|icones/|sw.js|manifest.webmanifest).*)"] };
