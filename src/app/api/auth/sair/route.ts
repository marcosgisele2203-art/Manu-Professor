import { encerrarSessao } from "@/lib/auth";

export async function POST() {
  await encerrarSessao();
  return new Response(null, { status: 303, headers: { Location: "/entrar" } });
}
