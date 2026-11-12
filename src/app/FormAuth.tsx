"use client";
import { useRef, useState } from "react";

type Campo = { nome: string; rotulo: string; tipo?: string; auto?: string; opcional?: boolean };
type GoogleCodeClient = { requestCode: () => void };
declare global { interface Window { google?: { accounts: { oauth2: { initCodeClient: (o: Record<string, unknown>) => GoogleCodeClient } } } } }

const ESCOPOS = "openid email profile https://www.googleapis.com/auth/drive.file";
let gsi: Promise<void> | null = null;
const carregarGsi = () => gsi ||= new Promise((ok, erro) => { const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.onload = () => ok(); s.onerror = () => { gsi = null; erro(new Error("gsi")); }; document.head.appendChild(s); });

export default function FormAuth({ titulo, sub, campos, url, botao, rodape, extra, googleClientId, cadastro, aviso }: {
  titulo: string; sub: string; campos: Campo[]; url: string; botao: string; rodape: React.ReactNode; extra?: React.ReactNode;
  googleClientId?: string; cadastro?: boolean; aviso?: string;
}) {
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pendente, setPendente] = useState<{ email: string; nome: string } | null>(null);
  const [aceitePendente, setAceitePendente] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const topo = useRef<HTMLDivElement>(null);
  const mostrarErro = (m: string) => { setErro(m); setTimeout(() => topo.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30); };

  async function confirmarCadastro() {
    if (!aceitePendente) { mostrarErro("Marque o aceite da política de privacidade para criar a conta."); return; }
    setErro(""); setEnviando(true);
    const r = await fetch("/api/auth/google/confirmar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aceite: true }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && j.ok) { location.href = "/"; return; }
    if (r?.status === 410) setPendente(null);
    mostrarErro(j.erro || "Não foi possível criar a conta agora. Tente de novo.");
    setEnviando(false);
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(""); setEnviando(true);
    const dados = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) }).catch(() => null);
    if (r?.ok) { location.href = "/"; return; }
    const j = r ? await r.json().catch(() => ({})) : {};
    setErro(j.erro || "Não foi possível conectar. Verifique a internet e tente de novo.");
    setEnviando(false);
  }

  async function comGoogle() {
    setErro("");
    const aceite = !!(form.current?.elements.namedItem("aceite") as HTMLInputElement | null)?.checked;
    try { await carregarGsi(); } catch { mostrarErro("Não foi possível abrir o Google. Verifique a internet e tente de novo."); return; }
    const cli = window.google!.accounts.oauth2.initCodeClient({
      client_id: googleClientId, scope: ESCOPOS, ux_mode: "popup", select_account: true,
      callback: async (resp: { code?: string; error?: string }) => {
        if (!resp.code) { mostrarErro("O acesso com o Google foi cancelado."); return; }
        setEnviando(true);
        const r = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: resp.code, aceite }) }).catch(() => null);
        const j = r ? await r.json().catch(() => ({})) : {};
        if (r?.ok && j.ok) { location.href = "/"; return; }
        if (j.precisaAceite) { setPendente({ email: j.email || "", nome: j.nome || "" }); setAceitePendente(aceite); setEnviando(false); setTimeout(() => topo.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30); return; }
        mostrarErro(j.erro || "Não foi possível entrar com o Google. Tente de novo.");
        setEnviando(false);
      },
      error_callback: () => mostrarErro("A janela do Google foi fechada ou bloqueada. Permita janelas pop-up e tente de novo."),
    });
    cli.requestCode();
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={enviar} ref={form}>
        <div ref={topo} />
        <img className="manu" src="/manu/manu-boas-vindas.webp" alt="Manu, acenando" width={120} height={180} />
        <div><span className="eyebrow">Manu Professor</span><h1>{titulo}</h1><p className="muted" style={{ marginTop: 4 }}>{sub}</p></div>
        {aviso && !pendente && <p className="banner" role="status">{aviso}</p>}
        {erro && <p className="auth-erro" role="alert">{erro}</p>}
        {pendente && (
          <div className="auth-pendente">
            <b>Falta só um passo para criar sua conta</b>
            <span>Conta Google: {pendente.email}</span>
            <label className="auth-check"><input type="checkbox" checked={aceitePendente} onChange={(e) => setAceitePendente(e.target.checked)} /><span>Li e aceito a <a href="/privacidade" target="_blank">política de privacidade e os termos de uso</a>.</span></label>
            <button type="button" className="btn primary" onClick={confirmarCadastro} disabled={enviando}>{enviando ? "Aguarde…" : "Criar minha conta"}</button>
          </div>
        )}
        {cadastro && extra}
        {googleClientId && !pendente && (<>
          <button type="button" className="btn btn-google" onClick={comGoogle} disabled={enviando}>
            <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
            Continuar com Google
          </button>
          <p className="small muted" style={{ marginTop: -8 }}>Com o Google você entra sem senha e já libera o Manu Professor a salvar seus arquivos no seu Google Drive.</p>
          <div className="auth-ou"><span>ou com e-mail e senha</span></div>
        </>)}
        {campos.map((c) => (
          <div className="field" key={c.nome}>
            <label htmlFor={c.nome}>{c.rotulo}{c.opcional ? " (opcional)" : ""}</label>
            <input className="input" id={c.nome} name={c.nome} type={c.tipo || "text"} autoComplete={c.auto} required={!c.opcional} />
          </div>
        ))}
        {!cadastro && extra}
        <button className="btn primary" type="submit" disabled={enviando}>{enviando ? "Aguarde…" : botao}</button>
        <p className="small muted">{rodape}</p>
      </form>
    </div>
  );
}
