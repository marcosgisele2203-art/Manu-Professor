"use client";
import { useState } from "react";

type Arq = { id: string; name: string; size?: string; createdTime: string };
const kb = (n?: string | number) => (n ? (Number(n) / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " KB" : "");
const quando = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export default function Backup({ arquivos, email, erro }: { arquivos: Arq[]; email?: string; erro?: string }) {
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [lista, setLista] = useState(arquivos);

  async function enviar() {
    setOcupado(true); setMsg(null);
    const r = await fetch("/api/admin/backup", { method: "POST" }).then((x) => x.json()).catch(() => ({ ok: false, erro: "Sem conexão." }));
    setOcupado(false);
    if (r.ok) { setMsg({ tipo: "ok", txt: `Backup ${r.nome} salvo no Drive de ${r.email} (${r.professores} professores, ${r.registros} registros, ${kb(r.tamanho)}).` }); setLista((l) => [{ id: "novo", name: r.nome, size: String(r.tamanho), createdTime: new Date().toISOString() }, ...l.filter((a) => a.name !== r.nome)]); }
    else setMsg({ tipo: "erro", txt: r.erro || "Não foi possível fazer o backup." });
  }
  async function restaurar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setOcupado(true); setMsg(null);
    const r = await fetch("/api/admin/backup/restaurar", { method: "POST", body: new FormData(e.currentTarget) }).then((x) => x.json()).catch(() => ({ erro: "Sem conexão." }));
    setOcupado(false);
    setMsg(r.ok ? { tipo: "ok", txt: `Restaurado o backup de ${quando(r.de)}: ${r.professores} professores, ${r.registros} registros e ${r.usos ?? 0} usos de IA recolocados${r.pulados ? `, ${r.pulados} itens pulados` : ""}.` } : { tipo: "erro", txt: r.erro || "Não foi possível restaurar." });
  }

  return (
    <section className="panel">
      <div className="panel-head"><h2>Backup dos dados</h2><span className="small muted">Automático todo dia às 3h, no Google Drive do administrador. Ficam os últimos 30.</span></div>
      {erro ? <p className="chip bad" style={{ whiteSpace: "normal" }}>{erro}</p> : <p className="small muted">Pasta <b>Manu Professor · Backups</b> no Drive de <b>{email}</b>.</p>}
      <div className="toolbar" style={{ margin: "12px 0" }}>
        <a className="btn" href="/api/admin/backup">Baixar backup agora</a>
        <button className="btn primary" type="button" onClick={enviar} disabled={ocupado}>{ocupado ? "Aguarde…" : "Fazer backup no Drive agora"}</button>
      </div>
      {msg && <p role="status" className={"chip " + (msg.tipo === "ok" ? "" : "bad")} style={{ whiteSpace: "normal", display: "block", padding: "8px 12px" }}>{msg.txt}</p>}
      {lista.length > 0 && <div className="list" style={{ marginTop: 12 }}>{lista.slice(0, 7).map((a) => (
        <div className="row" key={a.id + a.name}><div className="grow"><div className="title">{a.name}</div><div className="small muted">{quando(a.createdTime)}</div></div><span className="chip num">{kb(a.size)}</span></div>))}
        {lista.length > 7 && <p className="small muted">e mais {lista.length - 7} no Drive.</p>}</div>}
      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Restaurar um backup</summary>
        <form onSubmit={restaurar} style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <p className="small muted">Use só se algo se perdeu. Restaurar <b>não apaga nada</b>: recoloca o que falta (inclusive o histórico de uso da IA) e volta ao conteúdo do arquivo o que já existe. É tudo ou nada: se der erro no meio, nada é alterado. Antes, o sistema guarda uma cópia do estado atual no Drive.</p>
          <input className="input" type="file" name="arquivo" accept=".gz,.json,application/gzip,application/json" required />
          <label className="check" style={{ border: 0 }}><input type="checkbox" name="confirmo" value="sim" required /><span>Entendo e quero restaurar este backup</span></label>
          <div><button className="btn danger" type="submit" disabled={ocupado}>Restaurar</button></div>
        </form>
      </details>
    </section>
  );
}
