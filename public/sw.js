// Manu Professor: funciona sem internet.
// - Telas e arquivos do sistema ficam guardados no aparelho.
// - Os dados do professor (turmas, diário, notas...) são buscados na internet e, sem conexão, vêm da última cópia.
// - O que for salvo sem internet fica numa fila no próprio app (app.js) e é enviado quando a conexão volta.
// v2: as artes da Manu mudaram, e o activate apaga a casca antiga para ninguém continuar vendo as imagens velhas
const CASCA = "manu-casca-v2", DADOS = "manu-dados";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CASCA).then((c) => c.addAll(["/app.js", "/app.css", "/manu/manu-boas-vindas.webp", "/icones/icone-192.png"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const antigas = (await caches.keys()).filter((k) => k !== CASCA && k !== DADOS);
    await Promise.all(antigas.map((k) => caches.delete(k)));
    await self.clients.claim();
    // troca de versão: avisa as abas abertas, que ainda rodam o app.js antigo, para recarregarem.
    // na primeira instalação não há casca antiga, e recarregar seria à toa
    if (antigas.length) for (const c of await self.clients.matchAll({ type: "window" })) c.postMessage("versao-nova");
  })());
});
self.addEventListener("message", (e) => { if (e.data === "limpar-dados") e.waitUntil(caches.delete(DADOS)); });

// primeiro a internet; sem conexão, a última cópia guardada
async function redePrimeiro(req, cache, chave) {
  try {
    const r = await fetch(req);
    if (r.ok && !r.redirected) (await caches.open(cache)).put(chave || req, r.clone());
    return r;
  } catch (err) {
    const c = await caches.match(chave || req);
    if (c) return c;
    throw err;
  }
}
const arteDaManu = (req) => { const u = new URL(req.url); return u.origin === location.origin && u.pathname.startsWith("/manu/"); };
// a aba aberta desde antes de uma versão nova continua pedindo a arte pelo nome antigo, que já saiu do servidor e do cache:
// devolve a Manu de boas-vindas até a pessoa recarregar, porque imagem quebrada é pior que a imagem errada
const manuAtual = async () => (await caches.match("/manu/manu-boas-vindas.webp")) || fetch("/manu/manu-boas-vindas.webp");

async function cachePrimeiro(req) {
  const c = await caches.match(req);
  if (c) return c;
  try {
    const r = await fetch(req);
    if (r.ok) { (await caches.open(CASCA)).put(req, r.clone()); return r; }
    return arteDaManu(req) ? manuAtual() : r;
  } catch (err) {
    if (arteDaManu(req)) return manuAtual(); // sem internet, idem
    throw err;
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return; // salvar, apagar e IA sempre vão direto para a internet
  if (url.origin === location.origin) {
    if (url.pathname.startsWith("/api/dados/") || url.pathname === "/api/eu") return e.respondWith(redePrimeiro(req, DADOS));
    if (url.pathname.startsWith("/api/")) return;
    if (req.mode === "navigate") {
      if (url.pathname === "/") return e.respondWith(redePrimeiro(req, CASCA, "/"));
      return; // entrar, cadastro, admin: só com internet
    }
    if (url.pathname === "/app.js" || url.pathname === "/app.css") return e.respondWith(redePrimeiro(req, CASCA));
    if (/^\/(_next\/static|manu|vendor|icones)\//.test(url.pathname)) return e.respondWith(cachePrimeiro(req));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") e.respondWith(cachePrimeiro(req));
});
