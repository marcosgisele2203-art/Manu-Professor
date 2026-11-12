import { NextResponse } from "next/server";
import { adminAtual } from "@/lib/admin";
import { lerArquivo, restaurar, backupParaDrive } from "@/lib/backup";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await adminAtual())) return NextResponse.json({ erro: "Só administradores." }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const arq = form?.get("arquivo");
  if (!(arq instanceof File) || form?.get("confirmo") !== "sim") return NextResponse.json({ erro: "Escolha o arquivo e confirme." }, { status: 400 });
  let b;
  try { b = lerArquivo(Buffer.from(await arq.arrayBuffer())); } catch (e) { return NextResponse.json({ erro: e instanceof Error ? e.message : "Arquivo inválido." }, { status: 400 }); }
  // antes de mexer, guarda uma cópia do estado atual no Drive (se der)
  await backupParaDrive().catch(() => null);
  const r = await restaurar(b);
  return NextResponse.json({ ok: true, ...r, de: b.geradoEm });
}
