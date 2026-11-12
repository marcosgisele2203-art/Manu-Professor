import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE = "manu_sessao";
const DIAS = 30;

function segredo() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET ausente ou curto demais");
  return new TextEncoder().encode(s);
}

export async function criarSessao(professorId: string) {
  const token = await new SignJWT({ sub: professorId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DIAS}d`)
    .sign(segredo());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS * 24 * 3600,
  });
}

export async function lerSessao(token?: string): Promise<string | null> {
  const t = token ?? (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, segredo());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

const PENDENTE = "manu_google_pendente";
export type GooglePendente = { sub: string; email: string; nome: string; refresh?: string };
export async function guardarGooglePendente(d: GooglePendente) {
  const token = await new SignJWT({ ...d }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(segredo());
  (await cookies()).set(PENDENTE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/api/auth/google", maxAge: 600 });
}
export async function lerGooglePendente(): Promise<GooglePendente | null> {
  const t = (await cookies()).get(PENDENTE)?.value;
  if (!t) return null;
  try { const { payload } = await jwtVerify(t, segredo()); return payload as unknown as GooglePendente; } catch { return null; }
}
export async function limparGooglePendente() {
  (await cookies()).set(PENDENTE, "", { path: "/api/auth/google", maxAge: 0 });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE);
}
