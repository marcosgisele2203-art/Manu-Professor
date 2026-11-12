import Script from "next/script";

export const dynamic = "force-dynamic";

export default function Inicio() {
  return (
    <>
      <div className="app">
        <aside className="rail" aria-label="Navegação">
          <div className="brand"><div className="brand-mark"><img src="/manu/manu-boas-vindas.webp" alt="" /></div><div><b>Manu</b><span className="small muted">Professor</span></div></div>
          <nav className="nav" id="nav"></nav>
          <div className="rail-foot">
            <div className="uso-ia small" id="usoIA" hidden></div>
            <a className="btn sm ghost" id="adminLink" href="/admin" hidden>Administração</a>
            <span className="small muted" id="who"></span>
            <form action="/api/auth/sair" method="post"><button className="btn sm ghost" type="submit">Sair</button></form>
          </div>
        </aside>
        <div className="main">
          <header className="top">
            <div className="top-left"><span className="small muted" id="topoTitulo">Manu Professor</span></div>
            <div className="toolbar"><span className="small muted" id="syncState"></span><form className="so-celular" action="/api/auth/sair" method="post"><button className="btn sm ghost" type="submit">Sair</button></form></div>
          </header>
          <main className="content" id="view" aria-live="polite"></main>
        </div>
      </div>
      <dialog id="dlg"></dialog>
      <div className="toast" id="toast" hidden></div>
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
