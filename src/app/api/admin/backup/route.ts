import { NextResponse } from "next/server";
import { adminAtual } from "@/lib/admin";
import { gerarBackup, compactar, nomeArquivo, backupParaDrive } from "@/lib/backup";

export const dynamic = "force-dynamic";

// Baixar o backup agora (arquivo .json.gz)
export async function GET() {
  if (!(await adminAtual())) return NextResponse.json({ erro: "Só administradores." }, { status: 403 });
  const gz = compactar(await gerarBackup());
  return new Response(new Uint8Array(gz), { headers: { "Content-Type": "application/gzip", "Content-Disposition": `attachment; filename="${nomeArquivo()}"`, "Cache-Control": "no-store" } });
}

// Enviar um backup para o Google Drive do administrador agora
export async function POST() {
  if (!(await adminAtual())) return NextResponse.json({ erro: "Só administradores." }, { status: 403 });
  try { return NextResponse.json(await backupParaDrive()); }
  catch (e) { return NextResponse.json({ ok: false, erro: e instanceof Error ? e.message : "Falha no backup." }, { status: 502 }); }
}
