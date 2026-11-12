// Limites simples em memória (um só servidor): tentativas de login e pedidos de IA em andamento
const tentativas = new Map<string, { n: number; ate: number }>();
const JANELA = 15 * 60 * 1000, MAX_ERROS = 8;

export function loginBloqueado(chave: string) {
  const t = tentativas.get(chave);
  if (!t || t.ate < Date.now()) { tentativas.delete(chave); return 0; }
  return t.n >= MAX_ERROS ? Math.ceil((t.ate - Date.now()) / 60000) : 0;
}
export function loginErrou(chave: string) {
  const t = tentativas.get(chave);
  if (!t || t.ate < Date.now()) tentativas.set(chave, { n: 1, ate: Date.now() + JANELA });
  else t.n++;
  if (tentativas.size > 5000) for (const [k, v] of tentativas) if (v.ate < Date.now()) tentativas.delete(k);
}
export const loginOk = (chave: string) => tentativas.delete(chave);

const emAndamento = new Map<string, number>();
export const iaEmAndamento = (pid: string) => emAndamento.get(pid) ?? 0;
export function iaComecou(pid: string) { emAndamento.set(pid, iaEmAndamento(pid) + 1); }
export function iaTerminou(pid: string) { const n = iaEmAndamento(pid) - 1; if (n > 0) emAndamento.set(pid, n); else emAndamento.delete(pid); }
