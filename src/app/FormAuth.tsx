"use client";
import { useState } from "react";

type Campo = { nome: string; rotulo: string; tipo?: string; auto?: string; opcional?: boolean };

export default function FormAuth({ titulo, sub, campos, url, botao, rodape }: {
  titulo: string; sub: string; campos: Campo[]; url: string; botao: string; rodape: React.ReactNode;
}) {
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
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
  return (
    <div className="auth">
      <form className="auth-card" onSubmit={enviar}>
        <div className="brand" style={{ padding: 0 }}><div className="brand-mark">C</div><div><b>Caderno</b><span className="small muted">do Professor</span></div></div>
        <div><h1>{titulo}</h1><p className="muted" style={{ marginTop: 4 }}>{sub}</p></div>
        {campos.map((c) => (
          <div className="field" key={c.nome}>
            <label htmlFor={c.nome}>{c.rotulo}{c.opcional ? " (opcional)" : ""}</label>
            <input className="input" id={c.nome} name={c.nome} type={c.tipo || "text"} autoComplete={c.auto} required={!c.opcional} />
          </div>
        ))}
        {erro && <p className="auth-erro" role="alert">{erro}</p>}
        <button className="btn primary" type="submit" disabled={enviando}>{enviando ? "Aguarde…" : botao}</button>
        <p className="small muted">{rodape}</p>
      </form>
    </div>
  );
}
