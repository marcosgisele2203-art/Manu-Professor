import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { adminAtual } from "@/lib/admin";
import { custoUSD, inicioDoMes, limitePadrao } from "@/lib/uso";
import { listarBackupsDrive } from "@/lib/backup";
import Backup from "./Backup";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administração · Manu Professor" };

const usd = (v: number) => "US$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const data = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const NOMES: Record<string, string> = { plano: "Planos de aula", atividade: "Atividades", questoes: "Questões", chat: "Conversas com a Manu", material: "Materiais", slides: "Slides", correcao: "Correção por foto", bimestre: "Planejamento do bimestre" };

export default async function Admin({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  const adm = await adminAtual();
  if (!adm) redirect("/");
  const mes = inicioDoMes();
  const semana = new Date(Date.now() - 7 * 864e5);
  const [profs, usoMes, usoTotal, porTipo, turmas, novos] = await Promise.all([
    prisma.professor.findMany({ orderBy: { criadoEm: "desc" }, select: { id: true, nome: true, email: true, escola: true, escolas: true, criadoEm: true, limiteIA: true, bloqueado: true } }),
    prisma.usoIA.groupBy({ by: ["professorId"], where: { criadoEm: { gte: mes } }, _count: true, _sum: { tokensEntrada: true, tokensSaida: true } }),
    prisma.usoIA.aggregate({ _count: true, _sum: { tokensEntrada: true, tokensSaida: true } }),
    prisma.usoIA.groupBy({ by: ["tipo"], where: { criadoEm: { gte: mes } }, _count: true, _sum: { tokensEntrada: true, tokensSaida: true } }),
    prisma.registro.groupBy({ by: ["professorId"], where: { colecao: "turmas" }, _count: true }),
    prisma.professor.count({ where: { criadoEm: { gte: semana } } }),
  ]);
  const bk = await listarBackupsDrive().catch((e) => ({ erro: "Não foi possível ver o Drive: " + (e instanceof Error ? e.message : ""), arquivos: [], email: undefined }));
  const uso = new Map(usoMes.map((u) => [u.professorId, u]));
  const nTurmas = new Map(turmas.map((t) => [t.professorId, t._count]));
  const usosMes = usoMes.reduce((s, u) => s + u._count, 0);
  const custoMes = usoMes.reduce((s, u) => s + custoUSD(u._sum.tokensEntrada ?? 0, u._sum.tokensSaida ?? 0), 0);
  const custoTotal = custoUSD(usoTotal._sum.tokensEntrada ?? 0, usoTotal._sum.tokensSaida ?? 0);
  const padrao = limitePadrao();
  const mesNome = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <main className="content" style={{ marginInline: "auto" }}>
      <div className="page-head">
        <div><span className="eyebrow">Manu Professor · Administração</span><h1>Professores e uso da IA</h1>
          <p className="muted">Uso de {mesNome}. Os custos são estimados pelo preço do modelo e podem variar um pouco da fatura da Anthropic.</p></div>
        <Link className="btn" href="/">Voltar ao sistema</Link>
      </div>
      {msg && <p role="status" className="chip" style={{ display: "block", whiteSpace: "normal", padding: "10px 14px", marginBottom: 16 }}>{msg}</p>}
      <div className="stats">
        <div className="stat"><span className="eyebrow">Professores</span><span className="v">{profs.length}</span><span className="small muted">{novos} novos nos últimos 7 dias</span></div>
        <div className="stat"><span className="eyebrow">Pedidos de IA no mês</span><span className="v">{usosMes}</span><span className="small muted">limite padrão: {padrao} por professor</span></div>
        <div className="stat"><span className="eyebrow">Custo estimado no mês</span><span className="v">{usd(custoMes)}</span><span className="small muted">média {usd(usosMes ? custoMes / usosMes : 0)} por pedido</span></div>
        <div className="stat"><span className="eyebrow">Custo estimado total</span><span className="v">{usd(custoTotal)}</span><span className="small muted">{usoTotal._count} {usoTotal._count === 1 ? "pedido" : "pedidos"} desde o início</span></div>
      </div>
      <Backup arquivos={bk.arquivos} email={"email" in bk ? bk.email : undefined} erro={"erro" in bk ? bk.erro : undefined} />
      <section className="panel">
        <h2>Uso da IA por função neste mês</h2>
        {porTipo.length ? <div className="list">{porTipo.sort((a, b) => b._count - a._count).map((t) => (
          <div className="row" key={t.tipo}><div className="grow"><div className="title">{NOMES[t.tipo] || t.tipo}</div></div>
            <span className="num">{t._count} {t._count === 1 ? "pedido" : "pedidos"}</span><span className="chip num">{usd(custoUSD(t._sum.tokensEntrada ?? 0, t._sum.tokensSaida ?? 0))}</span></div>))}</div>
          : <p className="muted">Nenhum pedido de IA neste mês ainda.</p>}
      </section>
      <section className="panel">
        <div className="panel-head"><h2>Professores</h2><span className="small muted">Deixe o limite vazio para usar o padrão ({padrao}).</span></div>
        <div className="table-wrap"><table>
          <thead><tr><th>Professor</th><th>Escolas</th><th>Cadastro</th><th className="c">Turmas</th><th className="c">IA no mês</th><th className="c">Custo no mês</th><th>Limite mensal</th><th>Acesso à IA</th><th>Conta</th></tr></thead>
          <tbody>{profs.map((p) => { const u = uso.get(p.id); const lim = p.limiteIA ?? padrao; const usados = u?._count ?? 0;
            return (<tr key={p.id} id={"p-" + p.id}>
              <td><div style={{ fontWeight: 600 }}>{p.nome}</div><div className="small muted">{p.email}</div></td>
              <td>{(p.escolas.length ? p.escolas : p.escola ? [p.escola] : []).map((e) => <div key={e} className="small">{e}</div>)}{!p.escolas.length && !p.escola && <span className="muted">—</span>}</td>
              <td className="num">{data(p.criadoEm)}</td>
              <td className="c num">{nTurmas.get(p.id) ?? 0}</td>
              <td className="c num"><span className={"chip " + (usados >= lim ? "bad" : usados >= lim * 0.8 ? "warn" : "")}>{usados} de {lim}</span></td>
              <td className="c num">{usd(custoUSD(u?._sum.tokensEntrada ?? 0, u?._sum.tokensSaida ?? 0))}</td>
              <td><form action="/api/admin/professor" method="post" className="toolbar" style={{ flexWrap: "nowrap" }}>
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="acao" value="limite" />
                <input className="input" name="limite" type="number" min={0} max={10000} defaultValue={p.limiteIA ?? ""} placeholder={String(padrao)} aria-label={"Limite mensal de " + p.nome} style={{ width: 90, minHeight: 36, padding: "4px 8px" }} />
                <button className="btn sm" type="submit">Salvar</button></form></td>
              <td><form action="/api/admin/professor" method="post">
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="acao" value={p.bloqueado ? "liberar" : "bloquear"} />
                {p.bloqueado ? <button className="btn sm" type="submit">Liberar</button> : <button className="btn sm danger" type="submit">Suspender</button>}
                {p.bloqueado && <span className="chip bad" style={{ marginLeft: 6 }}>suspenso</span>}</form></td>
              <td>{profs.length > 1 && <details><summary className="small" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>Juntar com…</summary>
                <form action="/api/admin/professor" method="post" style={{ display: "grid", gap: 6, marginTop: 6, minWidth: 220 }}>
                  <input type="hidden" name="id" value={p.id} /><input type="hidden" name="acao" value="juntar" />
                  <span className="small muted">Levar tudo desta conta para:</span>
                  <select className="input" name="destino" required defaultValue="" style={{ minHeight: 36, padding: "4px 8px" }}><option value="" disabled>Escolha a conta que fica</option>
                    {profs.filter((o) => o.id !== p.id).map((o) => <option key={o.id} value={o.id}>{o.nome} · {o.email}</option>)}</select>
                  <label className="small" style={{ display: "flex", gap: 6, alignItems: "flex-start" }}><input type="checkbox" name="confirmo" value="sim" required /><span>Mover turmas e dados e apagar a conta {p.email}</span></label>
                  <button className="btn sm danger" type="submit">Juntar contas</button></form></details>}</td>
            </tr>); })}</tbody></table></div>
      </section>
    </main>
  );
}
