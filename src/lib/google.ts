import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

export const googleConfigurado = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const ESCOPOS = "openid email profile https://www.googleapis.com/auth/drive.file";

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

// Troca o código do botão do Google (fluxo de popup do Google Identity Services) pelos tokens
export async function trocarCodigo(code: string) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: "postmessage", grant_type: "authorization_code" }),
  });
  if (!r.ok) throw new Error("troca " + r.status);
  return (await r.json()) as { id_token: string; access_token: string; refresh_token?: string; expires_in: number; scope?: string };
}

export async function verificarIdToken(idToken: string) {
  const { payload } = await jwtVerify(idToken, JWKS, { audience: process.env.GOOGLE_CLIENT_ID!, issuer: ["https://accounts.google.com", "accounts.google.com"] });
  return payload as { sub: string; email?: string; email_verified?: boolean; name?: string };
}

export async function renovarAcesso(refresh: string) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ refresh_token: refresh, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, grant_type: "refresh_token" }),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, invalido: j.error === "invalid_grant", access_token: j.access_token as string | undefined, expires_in: j.expires_in as number | undefined };
}

// A permissão guardada é criptografada com uma chave derivada do AUTH_SECRET
const chave = () => createHash("sha256").update((process.env.AUTH_SECRET || "") + ":google").digest();
export function cifrar(texto: string) {
  const iv = randomBytes(12), c = createCipheriv("aes-256-gcm", chave(), iv);
  const dados = Buffer.concat([c.update(texto, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), dados].map((b) => b.toString("base64url")).join(".");
}
export function decifrar(guardado: string) {
  try {
    const [iv, tag, dados] = guardado.split(".").map((p) => Buffer.from(p, "base64url"));
    const d = createDecipheriv("aes-256-gcm", chave(), iv); d.setAuthTag(tag);
    return Buffer.concat([d.update(dados), d.final()]).toString("utf8");
  } catch { return null; }
}
