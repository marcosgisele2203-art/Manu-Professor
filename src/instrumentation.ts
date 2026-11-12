export async function register() {
  // backup diário só no servidor Node (nunca no runtime edge do middleware)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { agendarBackupDiario } = await import("./lib/backup");
    if (process.env.DATABASE_URL) agendarBackupDiario();
  }
}
