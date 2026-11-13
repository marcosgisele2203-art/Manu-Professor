
/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/-/g, "").slice(0, 14);
const hoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const addDias = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fmtData = iso => iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";
const fmtDataLonga = iso => iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) : "—";
const fmtNota = n => (n == null || isNaN(n)) ? "—" : Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const COLS = ["turmas", "planos", "chamadas", "avaliacoes", "atividades", "questoes", "provas", "materiais", "slides", "calendario"];
const CORES = ["#1d6b58", "#3d5a98", "#a0522d", "#7a4a8c", "#b08900", "#2f7f8f", "#b3261e"];
const MEDIA_MIN = 6, FREQ_MIN = 75;

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2600);
}

const I = {
  inicio: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  turmas: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  chamada: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  notas: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  planos: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  atividades: '<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/>',
  questoes: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
  materiais: '<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/>',
  slides: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/>',
  drive: '<path d="M8 3h8l6 11-4 7H6l-4-7z"/><path d="M8 3l6 11H2M16 3 10 14l-4 7M22 14H10"/>',
  provas: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 14.5l2 2 4-4"/>',
  horario: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
  resumo: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  alunos: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
  bimestres: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7.5 14h3M13.5 14h3M7.5 17.5h3"/>',
  lixo: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  assistente: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  spark: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'
};
const ico = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

const VIEWS = [["inicio", "Início"], ["turmas", "Turmas"], ["horario", "Meu horário"], ["calendario", "Calendário"], ["questoes", "Questões", true], ["assistente", "Manu", true]];
// Dentro de cada turma: #turma-<id>-<aba>
const ABAS = [["resumo", "Resumo"], ["alunos", "Alunos"], ["bimestres", "Bimestres"], ["chamada", "Diário"], ["notas", "Média geral"], ["provas", "Provas"], ["planos", "Planejamento"], ["atividades", "Atividades"], ["materiais", "Materiais"], ["slides", "Slides"], ["questoes", "Banco de questões"], ["enem", "Enem"], ["assistente", "Manu"]];
// ferramentas que se abrem a partir do bimestre: no menu da turma, quem fica marcado é Bimestres
const DO_BIMESTRE = ["planos", "atividades", "materiais", "slides", "questoes", "enem", "assistente"];
// link que respeita a turma aberta (banco, Enem, Manu)
const lk = v => S.dentroTurma && turmaAtual() ? linkTurma(turmaAtual().id, v) : "#" + v;
const NAV_PRINCIPAL = ["inicio", "turmas", "horario", "calendario"];
const ABAS_TOPO = ["resumo", "alunos", "bimestres", "chamada", "notas", "provas"];
// Ferramentas de IA da coluna esquerda do painel da turma
const FERRAMENTAS_IA = [
  { aba: "planos", nome: "Plano de aula", desc: "Alinhado à BNCC" },
  { aba: "atividades", nome: "Atividade com entrega", desc: "Instruções e prazo" },
  { grupo: "Materiais para imprimir" },
  { aba: "materiais", sub: "lista", nome: "Lista de exercícios" },
  { aba: "materiais", sub: "interpretacao", nome: "Interpretação de texto" },
  { aba: "materiais", sub: "cruzadinha", nome: "Cruzadinha" },
  { aba: "materiais", sub: "cacapalavras", nome: "Caça-palavras" },
  { aba: "materiais", sub: "resumo", nome: "Resumo de estudo" },
  { aba: "materiais", sub: "mapa", nome: "Mapa mental" },
  { aba: "materiais", sub: "ludica", nome: "Atividade lúdica" },
  { aba: "materiais", sub: "adaptar", nome: "Adaptar para inclusão" },
  { grupo: "Aula e avaliação" },
  { aba: "slides", nome: "Slides da aula", desc: "PowerPoint ou Google" },
  { acao: "gerar-questoes", nome: "Questões para prova", desc: "Vão para o seu banco" },
  { aba: "provas", nome: "Corrigir prova por foto", desc: "Folha de respostas" },
  { href: "#assistente", nome: "Fale com a Manu", desc: "Tire dúvidas e peça ideias" },
];
const linkTurma = (id, aba = "resumo") => `#turma-${id}-${aba}`;
const irTurma = (id, aba = "resumo") => { location.hash = linkTurma(id, aba); };

/* ---------- estado ---------- */
const S = {
  mode: "loading", // loading | live | demo
  uid: null, nome: "", base: null,
  turmas: [], planos: [], chamadas: [], avaliacoes: [], atividades: [], questoes: [], provas: [], materiais: [], slides: [],
  turmaSel: null, view: "inicio",
  chamadaData: hoje(), filtroQ: { disc: "", dif: "", txt: "" },
  chat: [], loaded: new Set()
};
const cap = { ia: false };
async function api(metodo, url, corpo) {
  const r = await fetch(url, { method: metodo, headers: corpo ? { "Content-Type": "application/json" } : {}, body: corpo ? JSON.stringify(corpo) : undefined });
  if (r.status === 401) { location.href = "/entrar"; throw { code: "auth" }; }
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw { code: r.status, message: j.erro }; }
  return r.headers.get("content-type")?.includes("json") ? r.json() : r;
}

/* ---------- dados de exemplo (modo demonstração e botão "carregar exemplo") ---------- */
function exemplo() {
  const nomesA = ["Ana Beatriz Souza", "Bruno Henrique Lima", "Carla Mendes", "Davi Oliveira", "Eduarda Ramos", "Felipe Costa", "Gabriela Nunes", "Heitor Alves"];
  const nomesB = ["Isabela Rocha", "João Pedro Martins", "Larissa Teixeira", "Mateus Ferreira", "Nicole Barbosa", "Otávio Pires", "Paula Cardoso"];
  const t1 = { id: "ex6a", nome: "6º ano A", disciplina: "Matemática", serie: "6º ano EF", ano: "2026", turno: "Matutino", cor: CORES[0], alunos: nomesA.map((n, i) => ({ id: "a" + i, nome: n })), exemplo: true };
  const t2 = { id: "ex8b", nome: "8º ano B", disciplina: "Ciências", serie: "8º ano EF", ano: "2026", turno: "Vespertino", cor: CORES[1], alunos: nomesB.map((n, i) => ({ id: "b" + i, nome: n })), exemplo: true };
  const d0 = hoje();
  const chamadas = [];
  [-9, -7, -2].forEach((off, k) => {
    [t1, t2].forEach(t => {
      const p = {}; t.alunos.forEach((a, i) => p[a.id] = ((i + k) % 7 === 3) ? "F" : ((i === 5 && t === t1) ? "F" : "P"));
      chamadas.push({ id: t.id + "_" + addDias(d0, off), turmaId: t.id, data: addDias(d0, off), presencas: p, conteudo: off === -2 ? "Correção de exercícios" : "", exemplo: true });
    });
  });
  const notasA1 = [8.5, 6, 7.5, 4.5, 9, 5, 7, 8], notasA2 = [9, 5.5, 8, 5, 9.5, 4, 6.5, 7.5];
  const avaliacoes = [
    { id: "exav1", turmaId: t1.id, nome: "Prova 1 — Frações", peso: 2, data: addDias(d0, -14), bimestre: "1", notas: Object.fromEntries(t1.alunos.map((a, i) => [a.id, notasA1[i]])), exemplo: true },
    { id: "exav2", turmaId: t1.id, nome: "Trabalho em grupo", peso: 1, data: addDias(d0, -5), bimestre: "1", notas: Object.fromEntries(t1.alunos.map((a, i) => [a.id, notasA2[i]])), exemplo: true },
    { id: "exav3", turmaId: t2.id, nome: "Relatório — Célula", peso: 1, data: addDias(d0, -6), bimestre: "1", notas: Object.fromEntries(t2.alunos.map((a, i) => [a.id, [7, 8.5, 6, 5.5, 9, 6.5, 8][i]])), exemplo: true }
  ];
  const planos = [
    { id: "expl1", turmaId: t1.id, data: addDias(d0, 1), titulo: "Frações equivalentes", duracao: "2 aulas de 50 min", bncc: "EF06MA07", objetivos: "Reconhecer frações equivalentes e simplificar frações usando a divisão pelo mesmo número.", conteudo: "Frações equivalentes; simplificação; comparação de frações.", metodologia: "1. Problema inicial com barras de chocolate (10 min).\n2. Dobraduras em tiras de papel para representar 1/2, 2/4 e 4/8 (20 min).\n3. Sistematização no quadro (15 min).\n4. Lista de exercícios em duplas (aula 2).", recursos: "Tiras de papel, régua, lápis de cor, quadro.", avaliacao: "Observação das duplas e correção coletiva da lista.", status: "planejado", exemplo: true },
    { id: "expl2", turmaId: t2.id, data: addDias(d0, 3), titulo: "Sistema circulatório", duracao: "1 aula de 50 min", bncc: "EF08CI08", objetivos: "Descrever o caminho do sangue no corpo e a função do coração.", conteudo: "Coração, vasos sanguíneos, circulação pulmonar e sistêmica.", metodologia: "Vídeo curto, esquema no quadro e medição da frequência cardíaca antes e depois de pular.", recursos: "Projetor, cronômetro.", avaliacao: "Registro da frequência cardíaca no caderno.", status: "planejado", exemplo: true }
  ];
  const atividades = [
    { id: "exat1", turmaId: t1.id, titulo: "Lista de exercícios — Frações", descricao: "Resolver as questões 1 a 12 da página 87 do livro.", prazo: addDias(d0, 2), valor: 1, entregas: { a0: true, a2: true, a4: true, a7: true }, exemplo: true },
    { id: "exat2", turmaId: t2.id, titulo: "Maquete da célula", descricao: "Em grupos de 3, montar uma maquete de célula animal com materiais recicláveis e legendas.", prazo: addDias(d0, 6), valor: 2, entregas: {}, exemplo: true }
  ];
  const questoes = [
    { id: "exq1", disciplina: "Matemática", tema: "Frações", serie: "6º ano EF", tipo: "multipla", dificuldade: "facil", enunciado: "Qual fração é equivalente a 2/4?", alternativas: ["1/3", "1/2", "3/4", "2/3"], correta: 1, resposta: "", bncc: "EF06MA07", exemplo: true },
    { id: "exq2", disciplina: "Matemática", tema: "Frações", serie: "6º ano EF", tipo: "multipla", dificuldade: "media", enunciado: "Uma pizza foi cortada em 8 pedaços iguais. Lia comeu 3 e Rui comeu 2. Que fração da pizza sobrou?", alternativas: ["5/8", "3/8", "2/8", "1/2"], correta: 1, resposta: "", bncc: "EF06MA09", exemplo: true },
    { id: "exq3", disciplina: "Matemática", tema: "Frações", serie: "6º ano EF", tipo: "aberta", dificuldade: "media", enunciado: "Explique com um desenho por que 3/6 e 1/2 representam a mesma quantidade.", alternativas: [], correta: null, resposta: "O desenho deve mostrar um inteiro dividido em 6 partes com 3 pintadas, ocupando a mesma área que metade do inteiro.", bncc: "EF06MA07", exemplo: true },
    { id: "exq4", disciplina: "Ciências", tema: "Sistema circulatório", serie: "8º ano EF", tipo: "vf", dificuldade: "facil", enunciado: "As artérias levam o sangue do coração para o resto do corpo.", alternativas: ["Verdadeiro", "Falso"], correta: 0, resposta: "", bncc: "EF08CI08", exemplo: true }
  ];
  const provas = [{ id: "expr1", titulo: "Avaliação — Frações", turmaId: t1.id, data: addDias(d0, 8), instrucoes: "Leia com atenção. Use caneta azul ou preta. Duração: 50 minutos.", questaoIds: ["exq1", "exq2", "exq3"], exemplo: true }];
  return { turmas: [t1, t2], planos, chamadas, avaliacoes, atividades, questoes, provas, materiais: [], slides: [], calendario: [] };
}

/* ---------- camada de dados ---------- */
// Sem internet: o que o professor salva fica numa fila no aparelho e é enviado quando a conexão volta
const FILA = "manu_fila";
const lerFila = () => { try { return JSON.parse(localStorage.getItem(FILA) || "[]"); } catch (_) { return []; } };
const gravarFila = f => { try { localStorage.setItem(FILA, JSON.stringify(f)); } catch (_) { toast("A memória do aparelho está cheia: conecte à internet para enviar o que falta."); } };
const semRede = e => e instanceof TypeError || (typeof navigator !== "undefined" && navigator.onLine === false && !(e && e.code));
function enfileirar(op) { gravarFila([...lerFila().filter(x => !(x.col === op.col && x.id === op.id)), { ...op, em: Date.now() }]); mostrarSync(); }
function mostrarSync(txt) {
  const n = lerFila().length, el = $("#syncState");
  document.body.classList.toggle("sem-rede", n > 0);
  if (el) el.textContent = txt || (n ? `Sem internet · ${n} ${n === 1 ? "alteração guardada" : "alterações guardadas"} no aparelho` : "Tudo salvo");
}
let enviandoFila = false;
async function enviarFila() {
  if (enviandoFila || !lerFila().length) return;
  enviandoFila = true; let enviados = 0;
  try {
    for (const op of lerFila()) {
      try {
        if (op.tipo === "put") await api("PUT", "/api/dados/" + op.col, op.obj);
        else await api("DELETE", "/api/dados/" + op.col + "/" + encodeURIComponent(op.id));
        enviados++;
      } catch (e) {
        if (semRede(e) || (e && e.code === "auth")) throw e;
        // o servidor recusou (dado inválido): não adianta tentar de novo
        toast("Uma alteração feita sem internet não pôde ser salva: " + ((e && e.message) || "dado recusado"));
      }
      gravarFila(lerFila().filter(x => !(x.col === op.col && x.id === op.id && x.em === op.em)));
    }
  } catch (_) { /* continua sem internet: tenta de novo depois */ }
  finally { enviandoFila = false; mostrarSync(); if (enviados && !lerFila().length) toast("Internet de volta: tudo o que foi feito sem conexão já foi salvo."); }
}
addEventListener("online", enviarFila);
setInterval(() => { if (lerFila().length) enviarFila(); }, 30000);
async function salvar(col, obj) {
  const arr = S[col]; const i = arr.findIndex(x => x.id === obj.id);
  if (i >= 0) arr[i] = obj; else arr.push(obj);
  render();
  if (lerFila().length) { enfileirar({ tipo: "put", col, id: obj.id, obj }); enviarFila(); return true; } // mantém a ordem
  mostrarSync("Salvando…");
  try { await api("PUT", "/api/dados/" + col, obj); mostrarSync(); return true; }
  catch (e) { if (semRede(e)) { enfileirar({ tipo: "put", col, id: obj.id, obj }); return true; } erroDb(e); return false; }
}
async function apagar(col, id) {
  S[col] = S[col].filter(x => x.id !== id); render();
  if (lerFila().length) { enfileirar({ tipo: "del", col, id }); enviarFila(); return; }
  try { await api("DELETE", "/api/dados/" + col + "/" + encodeURIComponent(id)); }
  catch (e) { if (semRede(e)) enfileirar({ tipo: "del", col, id }); else erroDb(e); }
}
function erroDb(e) {
  if (e && e.code === "auth") return;
  $("#syncState").textContent = "Erro ao salvar";
  toast((e && e.message) || "Não foi possível salvar agora. Verifique a internet e tente de novo.");
}

async function iniciar() {
  render();
  try {
    const eu = await api("GET", "/api/eu");
    S.nome = eu.nome || ""; S.escola = eu.escola || ""; S.escolas = eu.escolas || []; S.disciplinas = eu.disciplinas || []; S.etapas = eu.etapas || []; S.foto = eu.foto || ""; cap.ia = !!eu.ia; S.usoIA = eu.usoIA; S.admin = !!eu.admin; S.googleClientId = eu.googleClientId || ""; S.googleConectado = !!eu.googleConectado;
    const listas = await Promise.all(COLS.map(c => api("GET", "/api/dados/" + c)));
    COLS.forEach((c, i) => S[c] = listas[i]);
    // aplica por cima o que ainda está na fila (feito sem internet)
    for (const op of lerFila()) { if (!S[op.col]) continue; S[op.col] = S[op.col].filter(x => x.id !== op.id); if (op.tipo === "put") S[op.col].push(op.obj); }
    S.mode = "live";
    for (const t of S.turmas.filter(x => !bimestresDe(x).length)) { t.bimestres = bimestresPadrao(t.ano); api("PUT", "/api/dados/turmas", t).catch(() => {}); }
    mostrarSync(); enviarFila();
  } catch (e) {
    if (e && e.code === "auth") return;
    S.mode = "erro"; S.erroRede = semRede(e);
  }
  render();
}
// app instalável e funcionando sem internet
if ("serviceWorker" in navigator) { const reg = () => navigator.serviceWorker.register("/sw.js").catch(() => {}); if (document.readyState === "complete") reg(); else addEventListener("load", reg); }
let pedidoInstalar = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); pedidoInstalar = e; if (S.view === "inicio" || S.view === "perfil") render(); });
addEventListener("appinstalled", () => { pedidoInstalar = null; toast("Manu Professor instalado no aparelho"); render(); });
const instalado = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
async function instalarApp() {
  if (pedidoInstalar) { pedidoInstalar.prompt(); await pedidoInstalar.userChoice.catch(() => {}); pedidoInstalar = null; render(); return; }
  abrirDlg("Instalar no celular", ehIOS()
    ? `<ol><li>No Safari, toque no botão <b>Compartilhar</b> (quadrado com seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li><li>Toque em <b>Adicionar</b>. O ícone da Manu aparece junto dos outros apps.</li></ol>`
    : `<ol><li>No Chrome, toque nos <b>três pontinhos</b> no canto de cima.</li><li>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li><li>Confirme. O ícone da Manu aparece junto dos outros apps.</li></ol>`,
    `<button type="button" class="btn primary" data-act="fechar">Entendi</button>`);
}
document.addEventListener("click", e => { if (e.target.closest("[data-act='instalar-app']")) instalarApp(); if (e.target.closest("[data-act='instalar-depois']")) { try { localStorage.setItem("manu_instalar_depois", "1"); } catch (_) {} render(); } });
// ao sair: avisa se ainda há algo para enviar e apaga a cópia dos dados deste aparelho
document.addEventListener("submit", e => {
  if (!e.target.matches('form[action="/api/auth/sair"]')) return;
  const n = lerFila().length;
  if (n && !confirm(`Há ${n} ${n === 1 ? "alteração feita" : "alterações feitas"} sem internet que ainda não foram enviadas. Se sair agora, elas serão perdidas. Sair mesmo assim?`)) { e.preventDefault(); return; }
  try { localStorage.removeItem(FILA); } catch (_) {}
  navigator.serviceWorker?.controller?.postMessage("limpar-dados");
});

/* ---------- cálculos ---------- */
const turma = id => S.turmas.find(t => t.id === id);
const turmaAtual = () => turma(S.turmaSel) || S.turmas[0] || null;
const bimestresDe = t => (t && Array.isArray(t.bimestres)) ? t.bimestres : [];
const bimPorNum = (t, n) => bimestresDe(t).find(b => String(b.num) === String(n)) || null;
const bimDaData = (t, d) => bimestresDe(t).find(b => d >= b.inicio && d <= b.fim) || null;
function primeiroNome() { const n = (S.nome || "").trim().split(/\s+/)[0] || ""; return n === n.toUpperCase() ? n.charAt(0) + n.slice(1).toLocaleLowerCase("pt-BR") : n; }
function bimSelecionado(t) {
  if (!t || !bimestresDe(t).length) return "";
  S.bimSel = S.bimSel || {};
  if (S.bimSel[t.id] === undefined) { const a = bimDaData(t, hoje()); S.bimSel[t.id] = a ? String(a.num) : ""; }
  return S.bimSel[t.id];
}
function freqAluno(t, alunoId, bim) {
  const B = bim ? bimPorNum(t, bim) : null;
  const ch = S.chamadas.filter(c => c.turmaId === t.id && c.presencas && c.presencas[alunoId] && (!B || (c.data >= B.inicio && c.data <= B.fim)));
  if (!ch.length) return null;
  const pres = ch.filter(c => c.presencas[alunoId] !== "F").length;
  return Math.round(pres / ch.length * 100);
}
function mediaAluno(t, alunoId, bim) {
  const avs = S.avaliacoes.filter(a => a.turmaId === t.id && (!bim || String(a.bimestre) === String(bim)));
  let soma = 0, pesos = 0;
  avs.forEach(a => { const n = a.notas && a.notas[alunoId]; if (n !== undefined && n !== null && n !== "" && !isNaN(n)) { soma += Number(n) * (Number(a.peso) || 1); pesos += (Number(a.peso) || 1); } });
  return pesos ? soma / pesos : null;
}
function mediaAnual(t, alunoId) {
  const bs = bimestresDe(t); if (!bs.length) return mediaAluno(t, alunoId);
  const ms = bs.map(b => mediaAluno(t, alunoId, b.num)).filter(x => x !== null);
  return ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : null;
}
// Situação do aluno no ano: médias dos bimestres, média anual e quanto falta para passar
function situacaoAno(t, alunoId) {
  const bs = bimestresDe(t), n = bs.length || 1, ms = bs.length ? bs.map(b => mediaAluno(t, alunoId, b.num)) : [mediaAluno(t, alunoId)];
  const com = ms.filter(x => x !== null), soma = com.reduce((a, b) => a + b, 0), faltam = ms.length - com.length;
  const anual = com.length ? soma / com.length : null, f = freqAluno(t, alunoId);
  const precisa = faltam && com.length ? (MEDIA_MIN * n - soma) / faltam : null;
  const estado = !com.length ? "sem" : !faltam ? (soma / n >= MEDIA_MIN ? "aprovado" : "exame") : precisa <= 0 ? "garantido" : precisa > 10 ? "exame" : "andamento";
  return { ms, anual, faltam, precisa, f, estado, freqRisco: f !== null && f < FREQ_MIN };
}
// quanto o aluno precisa no bimestre "num" para fechar a média (as outras médias já lançadas)
function precisaNoBim(t, alunoId, num) {
  const bs = bimestresDe(t), outros = bs.filter(b => String(b.num) !== String(num)).map(b => mediaAluno(t, alunoId, b.num));
  if (!bs.length || outros.some(x => x === null)) return null;
  return MEDIA_MIN * bs.length - outros.reduce((a, b) => a + b, 0);
}
function alertas() {
  const out = [];
  S.turmas.forEach(t => (t.alunos || []).forEach(a => {
    const sit = situacaoAno(t, a.id), bAt = bimDaData(t, hoje()), mAt = bAt ? mediaAluno(t, a.id, bAt.num) : null;
    if (sit.freqRisco) out.push({ t, a, tipo: "freq", txt: `Frequência ${sit.f}%`, cls: "bad" });
    if (sit.estado === "exame") out.push({ t, a, tipo: "nota", txt: sit.faltam ? "Não alcança a média nem com 10: exame final" : `Exame final (média ${fmtNota(sit.ms.reduce((x, y) => x + y, 0) / sit.ms.length)})`, cls: "bad" });
    else if (mAt !== null && mAt < MEDIA_MIN) out.push({ t, a, tipo: "nota", txt: `Recuperação no ${bAt.nome} (média ${fmtNota(mAt)})`, cls: "warn" });
  }));
  return out;
}

/* ---------- renderização ---------- */
let pending = false;
function render() {
  const ae = document.activeElement;
  if (ae && $("#view").contains(ae) && ae.matches("input.grade, textarea, input[type=text], input[type=search]")) { pending = true; return; }
  pending = false;
  renderNav();
  const v = $("#view");
  if (S.mode === "loading") { v.innerHTML = `<div class="empty"><img class="manu sm" src="/manu/manu-boas-vindas.webp" alt=""><h3>Abrindo seu espaço…</h3><p>Carregando turmas, aulas e notas.</p></div>`; return; }
  if (S.mode === "erro") { v.innerHTML = `<div class="empty"><h3>${S.erroRede ? "Sem internet" : "Não foi possível carregar seus dados"}</h3><p>${S.erroRede ? "Este aparelho ainda não tem uma cópia dos seus dados. Abra o sistema uma vez com internet; depois ele funciona mesmo sem conexão." : "Verifique a internet e recarregue a página."}</p><button class="btn primary" onclick="location.reload()">Recarregar</button></div>`; return; }
  if (S.dentroTurma && !turma(S.turmaSel)) { S.dentroTurma = false; S.view = "turmas"; }
  const fn = { inicio: vInicio, turmas: vTurmas, resumo: vResumoTurma, alunos: vAlunos, horario: vHorario, bimestres: vBimestres, chamada: vChamada, notas: vNotas, planos: vPlanos, atividades: vAtividades, materiais: vMateriais, slides: vSlides, enem: vEnem, perfil: vPerfil, calendario: vCalendario, questoes: vQuestoes, provas: vProvas, assistente: vAssistente }[S.view] || vInicio;
  v.innerHTML = S.dentroTurma ? cabecalhoTurma() + `<div class="turma-conteudo">${fn()}</div>` : fn();
  if (S.view === "assistente") { const c = $("#chatLog"); if (c) c.scrollTop = c.scrollHeight; }
}
document.addEventListener("focusout", () => setTimeout(() => { if (pending) render(); }, 0));

function renderNav() {
  const tt = S.dentroTurma && turmaAtual();
  if (tt) { // dentro da turma: só Início e as seções da turma
    const sec = ABAS.filter(a => ABAS_TOPO.includes(a[0]));
    $("#nav").innerHTML = `<a href="#inicio">${ico("inicio")}<span>Início</span></a><div class="nav-turma" title="${esc(rotuloTurma(tt))}"><span class="swatch" style="background:${esc(tt.cor)}"></span><span>${esc(tt.nome)}</span></div>`
      + sec.map(([k, n]) => `<a href="${linkTurma(tt.id, k)}" class="${["chamada", "notas"].includes(k) ? "" : "so-pc"}" ${k === "notas" ? 'data-media-geral="1"' : ""} ${S.view === k || (k === "bimestres" && DO_BIMESTRE.includes(S.view)) ? 'aria-current="page"' : ""}>${ico(k)}<span>${n}</span></a>`
        + (k === "bimestres" ? bimestresDe(tt).map(b => { const at = S.view === "bimestres" && String(bimSelecionado(tt)) === String(b.num), agora = hoje() >= b.inicio && hoje() <= b.fim;
          return `<a href="${linkTurma(tt.id, "bimestres")}" class="nav-sub so-pc${agora ? " agora" : ""}" data-bim-nav="${b.num}" ${at ? 'aria-current="true"' : ""}><span>${esc(b.nome)}</span>${agora ? '<small>atual</small>' : ""}</a>`; }).join("") : "")).join("");
    document.body.classList.add("na-turma");
  } else {
    document.body.classList.remove("na-turma");
  }
  const ativo = S.dentroTurma ? "turmas" : S.view === "enem" ? "questoes" : S.view;
  if (!tt) $("#nav").innerHTML = VIEWS.filter(v => NAV_PRINCIPAL.includes(v[0])).map(([k, n, ai]) => `<a href="#${k}" ${ativo === k ? 'aria-current="page"' : ""}>${ico(k)}<span>${n}</span>${ai ? '<span class="ai">IA</span>' : ""}</a>`).join("");
  // topo do menu: foto e nome do professor
  if (S.nome) {
    const partes = S.nome.trim().split(/\s+/), curto = partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1]}` : partes[0];
    const iniciais = (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
    const cap = x => x.charAt(0).toLocaleUpperCase("pt-BR") + x.slice(1).toLocaleLowerCase("pt-BR");
    $("#brandNome").textContent = curto === curto.toUpperCase() ? curto.split(" ").map(cap).join(" ") : curto;
    $("#brandNome").title = S.nome;
    $("#brandSub").textContent = escolas().length > 1 ? `${escolas().length} escolas` : escolaPrincipal() || "Professor(a)";
    const bf = $("#brandFoto"), chave = S.foto || iniciais;
    if (bf.dataset.chave !== chave) {
      bf.dataset.chave = chave;
      bf.innerHTML = S.foto ? `<img src="${esc(S.foto)}" alt="" referrerpolicy="no-referrer">` : `<span class="iniciais">${esc(iniciais)}</span>`;
      const img = bf.querySelector("img"); if (img) img.onerror = () => { bf.innerHTML = `<span class="iniciais">${esc(iniciais)}</span>`; };
    }
  }
  $("#adminLink").hidden = !S.admin;
  const u = S.usoIA, box = $("#usoIA");
  if (u && cap.ia) { box.hidden = false; box.innerHTML = `<span>IA este mês: <b class="num">${u.usados}</b> de <span class="num">${u.limite}</span></span><div class="bar"><i style="width:${Math.min(100, Math.round(u.usados / Math.max(1, u.limite) * 100))}%"></i></div>`; }
}
function cabecalhoTurma() {
  const t = turmaAtual(); if (!t) return "";
  return `<div class="turma-head"><div class="turma-id"><span class="swatch" style="background:${esc(t.cor)}"></span><div style="min-width:0"><span class="eyebrow"><a href="#turmas">Turmas</a></span>
      <h1>${esc(t.nome)}</h1><p class="muted">${variasEscolas() && escolaDe(t) ? `<b>${esc(escolaDe(t))}</b> · ` : ""}${esc(t.disciplina)}${t.serie ? " · " + esc(t.serie) : ""}${t.turno ? " · " + esc(t.turno) : ""} · ${(t.alunos || []).length} alunos</p></div></div>
    <div class="toolbar">${S.turmas.length > 1 ? `<select class="input" id="trocaTurma" aria-label="Trocar de turma" style="width:auto">${S.turmas.map(x => `<option value="${esc(x.id)}" ${x.id === t.id ? "selected" : ""}>${esc(rotuloTurma(x))}</option>`).join("")}</select>` : ""}
      ${bimestresDe(t).length ? `<select class="input" id="bimSel" aria-label="Período" style="width:auto">${bimestresDe(t).map(b => `<option value="${b.num}" ${String(bimSelecionado(t)) === String(b.num) ? "selected" : ""}>${esc(b.nome)}</option>`).join("")}<option value="" ${bimSelecionado(t) === "" ? "selected" : ""}>Ano todo</option></select>` : `<a class="btn sm ghost" href="${linkTurma(t.id, "bimestres")}">Criar bimestres</a>`}
      <button class="btn sm" data-act="editar-turma" data-id="${esc(t.id)}">Editar turma</button>${S.googleClientId ? `<button class="btn sm ghost" data-act="drive-pasta" data-id="${esc(t.id)}">${ico("drive")}Pasta no Drive</button>` : ""}</div></div>
  <nav class="abas" aria-label="Seções da turma">${ABAS.filter(a => ABAS_TOPO.includes(a[0])).map(([k, n]) => `<a href="${linkTurma(t.id, k)}" ${S.view === k || (k === "bimestres" && DO_BIMESTRE.includes(S.view)) ? 'aria-current="page"' : ""}>${n}</a>`).join("")}</nav>
  ${DO_BIMESTRE.includes(S.view) && bimSelecionado(t) ? `<a class="voltar-bim" href="${linkTurma(t.id, "bimestres")}">← ${esc(bimPorNum(t, bimSelecionado(t))?.nome || "Bimestres")}</a>` : ""}`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act='ia-mat']"); if (!b) return;
  S.matForm.subtipo = b.dataset.v; S.matAtual = null; S.matStatus = "";
  if (S.view === "materiais") { e.preventDefault(); render(); }
});
document.addEventListener("change", e => { if (e.target.id === "trocaTurma") irTurma(e.target.value, S.view); });
try { S.turmaSel = localStorage.getItem("cp_turma"); } catch (_) {}

function semTurma(msg) {
  return `<div class="empty"><img class="manu" src="/manu/manu-agenda.webp" alt=""><h3>Crie sua primeira turma</h3><p>${esc(msg || "Cadastre uma turma com a lista de alunos para usar chamada, notas e atividades.")}</p>
  <div class="toolbar" style="justify-content:center"><button class="btn primary" data-act="nova-turma">${ico("plus")}Nova turma</button>${S.mode === "live" ? `<button class="btn" data-act="seed">Carregar exemplo</button>` : ""}</div></div>`;
}

/* ----- Meu perfil ----- */
async function salvarPerfil(dados, msg) {
  $("#syncState").textContent = "Salvando…";
  try { const p = await api("PATCH", "/api/eu", dados); S.nome = p.nome; S.escola = p.escola || ""; S.escolas = p.escolas; S.disciplinas = p.disciplinas; S.etapas = p.etapas || []; S.foto = p.foto || ""; $("#syncState").textContent = "Tudo salvo"; if (msg) toast(msg); render(); return true; }
  catch (e) { toast(e.message || "Não foi possível salvar o perfil."); $("#syncState").textContent = ""; return false; }
}
function lembrarNoPerfil(escola, disc) { // escola ou disciplina nova digitada na turma entra no perfil
  const d = {};
  if (escola && !(S.escolas || []).includes(escola)) d.escolas = [...(S.escolas || []), escola];
  if (disc && !(S.disciplinas || []).includes(disc)) d.disciplinas = [...(S.disciplinas || []), disc];
  if (Object.keys(d).length && S.mode === "live") salvarPerfil(d);
}
function dlgTirarEscola(v) {
  const ts = S.turmas.filter(t => escolaDe(t) === v), outras = escolas().filter(e => e !== v);
  if (!ts.length) { abrirDlg(`Tirar ${esc(v)}?`, `<p>Essa escola não tem turmas. Ela sai da sua lista de escolas.</p>`, `<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn danger" data-act="perfil-tira-esc-ok" data-v="${esc(v)}">Tirar escola</button>`); return; }
  abrirDlg(`Tirar ${esc(v)}?`, `<p><b>${esc(v)}</b> tem ${ts.length} ${ts.length === 1 ? "turma" : "turmas"}: ${ts.map(t => esc(t.nome)).join(", ")}.</p><p>O que fazer com ${ts.length === 1 ? "ela" : "elas"}?</p>
    <label class="check" style="border:0"><input type="radio" name="teModo" value="mover" checked><span>Passar para outra escola (alunos, diário e notas continuam)</span></label>
    <div class="field" style="margin-left:28px"><select class="input" id="teDest">${outras.map(e => `<option>${esc(e)}</option>`).join("")}<option value="__nova" ${outras.length ? "" : "selected"}>+ Outra escola…</option></select>
      <input class="input" id="teNova" placeholder="Nome da escola. Ex.: EE Caetano Pinto" ${outras.length ? "hidden" : ""} style="margin-top:8px"></div>
    <label class="check" style="border:0"><input type="radio" name="teModo" value="excluir"><span>Excluir ${ts.length === 1 ? "a turma" : "as turmas"} e tudo ${ts.length === 1 ? "dela" : "delas"} (eram só de teste)</span></label>
    <label class="check" id="teConfBox" style="border:0;margin-left:28px" hidden><input type="checkbox" id="teConf"><span>Entendo que alunos, diário e notas dessas turmas serão apagados</span></label>`,
    `<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn danger" data-act="perfil-tira-esc-ok" data-v="${esc(v)}">Tirar escola</button>`);
}
document.addEventListener("change", e => {
  if (e.target.id === "teDest") { const i = document.getElementById("teNova"); i.hidden = e.target.value !== "__nova"; if (!i.hidden) i.focus(); }
  if (e.target.name === "teModo") document.getElementById("teConfBox").hidden = e.target.value !== "excluir";
});
function vPerfil() {
  const es = S.escolas || [], ds = S.disciplinas || [], et = S.etapas || [];
  const sug = [...new Set((et.length ? et : Object.keys(COMPONENTES)).flatMap(e => COMPONENTES[e] || []))].filter(c => !ds.includes(c));
  const turmasDa = x => S.turmas.filter(t => escolaDe(t) === x);
  const lista = (itens, act, vazio) => itens.length ? `<ul class="perfil-lista">${itens.map((x, i) => `<li${act === "perfil-tira-esc" ? ' class="esc"' : ""}><span>${esc(x)}${act === "perfil-tira-esc" && i === 0 && itens.length > 1 ? ' <span class="chip">principal</span>' : ""}</span>${act === "perfil-tira-esc" && i > 0 ? `<button type="button" class="btn ghost sm" data-act="perfil-principal" data-v="${esc(x)}">Tornar principal</button>` : ""}<button type="button" class="btn ghost sm" data-act="${act}" data-v="${esc(x)}" aria-label="Tirar ${esc(x)}">×</button>${act === "perfil-tira-esc" ? `<div class="esc-turmas">${turmasDa(x).map(t => `<a class="esc-turma" href="${linkTurma(t.id)}"><span class="swatch" style="background:${esc(t.cor)}"></span>${esc(t.nome)}<small>${esc(t.disciplina)}${t.turno ? " · " + esc(t.turno) : ""}</small></a>`).join("")}<button type="button" class="btn sm" data-act="nova-turma" data-escola="${esc(x)}">${ico("plus")}Turma nesta escola</button></div>` : ""}</li>`).join("")}</ul>` : `<p class="muted small">${vazio}</p>`;
  return `<div class="page-head"><div><h1>Meu perfil</h1><p class="muted">Suas escolas e disciplinas aparecem prontas para escolher quando você cria uma turma.</p></div></div>
  <section class="panel"><div class="panel-head"><h2>Sua foto</h2></div><div class="perfil-foto"><div class="brand-mark grande">${S.foto ? `<img src="${esc(S.foto)}" alt="Sua foto" referrerpolicy="no-referrer">` : `<span class="iniciais">${esc((S.nome || "?").trim().split(/\s+/).map(x => x[0]).filter(Boolean).slice(0, 2).join("").toUpperCase())}</span>`}</div>
    <div class="toolbar"><label class="btn">Escolher foto<input type="file" id="pfFoto" accept="image/*" hidden></label>${S.foto ? `<button type="button" class="btn ghost" data-act="perfil-foto-tirar">Tirar foto</button>` : ""}</div>
    <p class="small muted" style="flex-basis:100%;margin:0">Aparece no alto do menu. Quem entra com o Google já recebe a foto da conta.</p></div></section>
  <section class="panel"><div class="panel-head"><h2>Seu nome</h2></div><form class="perfil-add" data-form="perfil-nome"><input class="input" id="pfNome" value="${esc(S.nome)}" maxlength="120" aria-label="Seu nome"><button class="btn" type="submit">Salvar nome</button></form></section>
  <section class="panel"><div class="panel-head"><h2>Escolas onde você leciona</h2><span class="small muted">${es.length} de 10</span></div>
    ${lista(es, "perfil-tira-esc", "Nenhuma escola cadastrada ainda.")}
    <form class="perfil-add" data-form="perfil-esc"><input class="input" id="pfEscola" placeholder="Nome da escola. Ex.: EM Rio Azul" maxlength="120" aria-label="Nome da escola"><button class="btn primary" type="submit">${ico("plus")}Adicionar escola</button></form></section>
  <section class="panel"><div class="panel-head"><h2>Etapas em que você leciona</h2><span class="small muted">Ao criar turma, a lista mostra só as séries dessas etapas</span></div>
    <div class="chips-esc">${ETAPAS.map(([id, n]) => `<button type="button" class="tn-op" data-act="perfil-etapa" data-v="${id}" aria-pressed="${et.includes(id)}">${et.includes(id) ? "✓ " : ""}${n}</button>`).join("")}</div></section>
  <section class="panel"><div class="panel-head"><h2>Disciplinas que você leciona</h2></div>
    ${lista(ds, "perfil-tira-disc", "Nenhuma disciplina cadastrada ainda.")}
    <form class="perfil-add" data-form="perfil-disc"><input class="input" id="pfDisc" placeholder="Digite ou escolha. Ex.: Matemática" list="pfDiscLista" maxlength="80" aria-label="Disciplina" autocomplete="off"><datalist id="pfDiscLista">${sug.map(c => `<option value="${esc(c)}">`).join("")}</datalist><button class="btn primary" type="submit">${ico("plus")}Adicionar disciplina</button></form>
    <div class="chips-esc" style="margin-top:10px"><span class="small muted">Mais comuns:</span>${sug.slice(0, 14).map(c => `<button type="button" class="tn-op" data-act="perfil-add-disc" data-v="${esc(c)}">+ ${esc(c)}</button>`).join("")}</div></section>
  <section class="panel"><div class="panel-head"><h2>App no celular</h2></div><p class="small muted">${instalado() ? "Você está usando o Manu Professor instalado neste aparelho." : "Instale para abrir com um toque e usar o diário mesmo sem internet. O que você fizer sem conexão é enviado sozinho quando a internet voltar."}</p>${instalado() ? "" : `<button class="btn" data-act="instalar-app">${ico("dl")}Instalar no celular</button>`}</section>
  <section class="panel"><div class="panel-head"><h2>Seus dados</h2></div><p class="small muted">Baixe uma cópia de tudo o que você guardou aqui: turmas, alunos, chamadas, notas, planos, provas e materiais. Os dados também têm backup automático todos os dias.</p><a class="btn" href="/api/eu/exportar" download>Baixar meus dados</a></section>`;
}
// foto: reduz no navegador para 256 px antes de enviar
document.addEventListener("change", async e => {
  if (e.target.id !== "pfFoto" || !e.target.files[0]) return;
  const arq = e.target.files[0]; e.target.value = "";
  if (!arq.type.startsWith("image/")) { toast("Escolha um arquivo de imagem."); return; }
  try {
    const bmp = await createImageBitmap(arq), lado = Math.min(bmp.width, bmp.height), c = document.createElement("canvas");
    c.width = c.height = 256;
    c.getContext("2d").drawImage(bmp, (bmp.width - lado) / 2, (bmp.height - lado) / 2, lado, lado, 0, 0, 256, 256);
    await salvarPerfil({ foto: c.toDataURL("image/jpeg", 0.85) }, "Foto salva");
  } catch (_) { toast("Não foi possível usar essa imagem. Tente outra (JPG ou PNG)."); }
});
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-form^='perfil-']"); if (!f) return; e.preventDefault();
  if (f.dataset.form === "perfil-nome") { const v = val2("pfNome").trim(); if (v) await salvarPerfil({ nome: v }, "Nome salvo"); return; }
  if (f.dataset.form === "perfil-esc") {
    const v = val2("pfEscola").trim(); if (!v) return;
    if ((S.escolas || []).some(x => x.toLowerCase() === v.toLowerCase())) { toast("Essa escola já está na lista."); return; }
    if ((S.escolas || []).length >= 10) { toast("Limite de 10 escolas."); return; }
    await salvarPerfil({ escolas: [...(S.escolas || []), v] }, "Escola adicionada"); document.getElementById("pfEscola")?.focus(); return;
  }
  const v = val2("pfDisc").trim(); if (!v) return;
  if ((S.disciplinas || []).some(x => x.toLowerCase() === v.toLowerCase())) { toast("Essa disciplina já está na lista."); return; }
  await salvarPerfil({ disciplinas: [...(S.disciplinas || []), v] }, "Disciplina adicionada"); document.getElementById("pfDisc")?.focus();
});
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act^='perfil-']"); if (!b) return;
  const v = b.dataset.v, es = S.escolas || [], ds = S.disciplinas || [];
  if (b.dataset.act === "perfil-foto-tirar") return salvarPerfil({ foto: "" }, "Foto retirada");
  if (b.dataset.act === "perfil-etapa") { const et = S.etapas || []; return salvarPerfil({ etapas: et.includes(v) ? et.filter(x => x !== v) : [...et, v] }); }
  if (b.dataset.act === "perfil-add-disc") return salvarPerfil({ disciplinas: [...ds, v] }, "Disciplina adicionada");
  if (b.dataset.act === "perfil-tira-disc") return salvarPerfil({ disciplinas: ds.filter(x => x !== v) }, "Disciplina retirada");
  if (b.dataset.act === "perfil-principal") { for (const t of S.turmas.filter(t => !t.escola && es[0])) { t.escola = es[0]; api("PUT", "/api/dados/turmas", t).catch(() => {}); } }
  if (b.dataset.act === "perfil-principal") return salvarPerfil({ escolas: [v, ...es.filter(x => x !== v)] }, `${v} agora é a principal`);
  if (b.dataset.act === "perfil-tira-esc") return dlgTirarEscola(v);
  if (b.dataset.act === "perfil-tira-esc-ok") {
    const ts = S.turmas.filter(t => escolaDe(t) === v), modo = dlg.querySelector('input[name="teModo"]:checked')?.value;
    let destino = val2("teDest") === "__nova" ? val2("teNova").trim() : val2("teDest");
    if (ts.length && !modo) { toast("Escolha o que fazer com as turmas."); return; }
    if (ts.length && modo === "mover" && !destino) { toast("Escolha para qual escola passar as turmas."); return; }
    if (modo === "excluir" && !document.getElementById("teConf")?.checked) { toast("Marque a confirmação para excluir as turmas."); return; }
    fechar();
    // a escola principal muda antes, para as turmas não ficarem presas na escola retirada
    const novas = es.filter(x => x !== v);
    if (modo === "mover" && !novas.includes(destino)) novas.unshift(destino);
    for (const t of ts) {
      if (modo === "mover") { const c = JSON.parse(JSON.stringify(t)); c.escola = destino; await salvar("turmas", c); }
      else { for (const col of COLS) if (col !== "turmas") for (const x of S[col].filter(x => x.turmaId === t.id)) await apagar(col, x.id); await apagar("turmas", t.id); }
    }
    for (const c of (S.calendario || []).filter(c => c.escola === v)) { if (modo === "mover") await salvar("calendario", { ...c, escola: destino }); else await apagar("calendario", c.id); }
    // escolas das turmas que ficaram entram no perfil (ex.: Caetano Pinto)
    for (const t of S.turmas) { const e = t.escola; if (e && e !== v && !novas.includes(e)) novas.push(e); }
    return salvarPerfil({ escolas: novas.slice(0, 10) }, ts.length ? (modo === "mover" ? `${v} retirada. ${ts.length} ${ts.length === 1 ? "turma passou" : "turmas passaram"} para ${destino}.` : `${v} retirada com ${ts.length} ${ts.length === 1 ? "turma" : "turmas"}.`) : "Escola retirada");
  }
});

/* ----- Calendário escolar ----- */
// Páscoa (algoritmo de Meeus) para os feriados móveis
function pascoa(ano) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}
function feriadosNacionais(ano) {
  const p = pascoa(ano), f = (md, nome, tipo = "feriado") => ({ id: `nac-${ano}-${md}`, data: `${ano}-${md}`, nome, tipo, nacional: true });
  const m = (n, nome, tipo = "feriado") => { const d = addDias(p, n); return { id: `nac-${d}`, data: d, nome, tipo, nacional: true }; };
  return [f("01-01", "Confraternização Universal"), m(-48, "Carnaval", "sem-aula"), m(-47, "Carnaval", "sem-aula"), m(-2, "Sexta-feira Santa"), f("04-21", "Tiradentes"), f("05-01", "Dia do Trabalho"),
    m(60, "Corpus Christi", "sem-aula"), f("09-07", "Independência do Brasil"), f("10-12", "Nossa Senhora Aparecida"), f("11-02", "Finados"), f("11-15", "Proclamação da República"), f("11-20", "Dia da Consciência Negra"), f("12-25", "Natal")];
}
const TIPOS_CAL = { feriado: "Feriado", recesso: "Recesso / férias", "sem-aula": "Sem aula", "sabado-letivo": "Sábado letivo", evento: "Evento (tem aula)", "com-aula": "Tem aula" };
// sábados letivos de uma escola num período (contam como dia de aula)
function sabadosLetivos(escola, ini, fim) {
  const out = [];
  for (const e of [...eventosDoAno(Number(ini.slice(0, 4))), ...(ini.slice(0, 4) !== fim.slice(0, 4) ? eventosDoAno(Number(fim.slice(0, 4))) : [])]) {
    if (e.tipo !== "sabado-letivo" || (e.escola && escola && e.escola !== escola)) continue;
    for (let d = e.data; d <= (e.fim || e.data); d = addDias(d, 1)) if (d >= ini && d <= fim) out.push(d);
  }
  return out;
}
// eventos de um ano: nacionais (podem ser desmarcados) + os que o professor cadastrou
let _calMemo = {};
function eventosDoAno(ano) {
  const chave = ano + ":" + JSON.stringify(S.calendario || []).length;
  if (_calMemo[chave]) return _calMemo[chave];
  if (Object.keys(_calMemo).length > 20) _calMemo = {};
  return (_calMemo[chave] = eventosDoAnoCalc(ano));
}
function eventosDoAnoCalc(ano) {
  const meus = (S.calendario || []).filter(e => (e.data || "").slice(0, 4) === String(ano) || (e.fim || "").slice(0, 4) === String(ano));
  const nac = feriadosNacionais(ano).map(n => { const o = meus.find(e => e.id === "ajuste-" + n.id); return o ? { ...n, tipo: o.tipo, ajuste: true } : n; });
  return [...nac, ...meus.filter(e => !String(e.id).startsWith("ajuste-"))].sort((a, b) => a.data.localeCompare(b.data));
}
// dia sem aula para uma escola ("" = vale para todas)? devolve o evento ou null
function semAula(data, escola) {
  for (const e of eventosDoAno(Number(data.slice(0, 4)))) {
    if (!["feriado", "recesso", "sem-aula"].includes(e.tipo)) continue;
    if (e.escola && escola && e.escola !== escola) continue;
    if (data >= e.data && data <= (e.fim || e.data)) return e;
  }
  return null;
}
S.calAno = new Date().getFullYear();
function diasLetivos(escola, ano) {
  // do início do 1º período ao fim do último, nas turmas desta escola
  const ts = S.turmas.filter(t => (!escola || escolaDe(t) === escola) && String(t.ano || ano) === String(ano)), bs = ts.flatMap(t => bimestresDe(t));
  if (!bs.length) return null;
  const ini = bs.map(b => b.inicio).sort()[0], fim = bs.map(b => b.fim).sort().pop();
  let n = 0; for (let d = ini; d <= fim; d = addDias(d, 1)) if (diaSemana(d) <= 5 && !semAula(d, escola)) n++;
  n += sabadosLetivos(escola, ini, fim).length;
  return { n, ini, fim };
}
function vCalendario() {
  const ano = S.calAno, evs = eventosDoAno(ano), es = escolas();
  const letivos = (es.length ? es : [""]).map(e => ({ e, r: diasLetivos(e, ano) })).filter(x => x.r);
  const porMes = {}; evs.forEach(e => (porMes[e.data.slice(5, 7)] ||= []).push(e));
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `<div class="page-head"><div><h1>Calendário escolar</h1><p class="muted">Feriados, recessos e dias sem aula ficam fora do diário e das aulas previstas. Os feriados nacionais já estão aqui.</p></div>
    <div class="toolbar"><button class="btn sm ghost" data-act="cal-ano" data-v="-1" aria-label="Ano anterior">‹</button><b class="num" style="font-size:1.2rem">${ano}</b><button class="btn sm ghost" data-act="cal-ano" data-v="1" aria-label="Próximo ano">›</button><button class="btn ai" data-act="cal-importar">${ico("spark")}Importar calendário da escola</button></div></div>
  ${letivos.length ? `<div class="stats">${letivos.map(({ e, r }) => `<div class="stat"><span class="eyebrow">Dias letivos${e ? " · " + esc(e) : ""}</span><span class="v num" style="color:${r.n < 200 ? "var(--warn)" : "inherit"}">${r.n}</span><span class="small muted">${r.n >= 200 ? "cumpre os 200 dias" : `faltam ${200 - r.n} para os 200 dias`} · ${fmtData(r.ini)} a ${fmtData(r.fim)}</span></div>`).join("")}</div>` : ""}
  <section class="panel"><div class="panel-head"><h2>Adicionar ao calendário</h2></div>
    <form class="cal-form" id="calForm">
      <div class="field"><label for="cNome">O que é</label><input class="input" id="cNome" required maxlength="120" placeholder="Ex.: Aniversário da cidade, recesso de julho, conselho de classe"></div>
      <div class="field"><label for="cTipo">Tipo</label><select class="input" id="cTipo">${["feriado", "recesso", "sem-aula", "sabado-letivo", "evento"].map(k => `<option value="${k}">${TIPOS_CAL[k]}</option>`).join("")}</select></div>
      <div class="field"><label for="cIni">Data</label><input class="input" type="date" id="cIni" required value="${hoje().slice(0, 4) === String(ano) ? hoje() : ano + "-01-01"}"></div>
      <div class="field"><label for="cFim">Até (se for mais de um dia)</label><input class="input" type="date" id="cFim"></div>
      ${es.length > 1 ? `<div class="field"><label for="cEsc">Vale para</label><select class="input" id="cEsc"><option value="">Todas as escolas</option>${es.map(e => `<option>${esc(e)}</option>`).join("")}</select></div>` : ""}
      <button class="btn primary" type="submit">${ico("plus")}Adicionar</button></form></section>
  ${Object.keys(porMes).sort().map(mm => `<section class="panel cal-mes"><h2>${MESES[Number(mm) - 1]}</h2><ul class="cal-lista">${porMes[mm].map(e => `<li class="cal-ev ${e.tipo}${e.ajuste && e.tipo === "com-aula" ? " riscado" : ""}">
      <span class="cal-data num">${e.data.slice(8)}${e.fim && e.fim !== e.data ? `–${fmtData(e.fim)}` : ""}</span>
      <span class="cal-nome"><b>${esc(e.nome)}</b><small>${TIPOS_CAL[e.tipo] || e.tipo}${e.nacional ? " · nacional" : ""}${e.escola ? " · " + esc(e.escola) : ""}${DIAS[diaSemana(e.data)] ? " · " + DIAS[diaSemana(e.data)].toLowerCase() : " · domingo"}</small></span>
      ${e.nacional && diaSemana(e.data) >= 6 ? "" : e.nacional ? `<button class="btn sm ghost" data-act="cal-nac" data-id="${esc(e.id)}" data-data="${e.data}" data-tipo="${e.tipo === "com-aula" ? "" : "com-aula"}">${e.tipo === "com-aula" ? "Voltar a ser sem aula" : "Teve aula neste dia"}</button>`
        : `<button class="btn sm ghost" data-act="cal-rem" data-id="${esc(e.id)}" aria-label="Tirar ${esc(e.nome)}">×</button>`}</li>`).join("")}</ul></section>`).join("")}`;
}
// Importar o calendário da escola (PDF ou foto): a Manu lê, o professor confere e salva
function dlgImportarCal() {
  const es = escolas();
  abrirDlg("Importar calendário da escola", `<p class="small muted">Envie o calendário que a escola ou a secretaria entregou, em PDF ou foto. A Manu lê os feriados, recessos, sábados letivos e as datas dos bimestres. Você confere antes de salvar.</p>
    <div class="grid2"><div class="field"><span class="small muted">Vale para as escolas</span>${es.length ? `<div class="chips-esc" id="ciEscs">${es.map(e => `<label class="check" style="border:0;padding:4px 8px 4px 0"><input type="checkbox" name="ciEsc" value="${esc(e)}" ${es.length === 1 ? "checked" : ""}><span>${esc(e)}</span></label>`).join("")}</div>` : `<input class="input" id="ciEscTxt" placeholder="Nome da escola">`}</div>
    <div class="field"><label for="ciAno">Ano</label><input class="input" id="ciAno" inputmode="numeric" value="${S.calAno}"></div></div>
    <div class="field"><label for="ciArq">Arquivo do calendário</label><input class="input" type="file" id="ciArq" accept="application/pdf,image/*"></div>
    <div class="ai-box"><div class="toolbar"><button type="button" class="btn ai" data-act="ia-cal">${ico("spark")}Ler calendário</button><button type="button" class="btn ghost sm" data-act="parar-ia" hidden id="iaStop">Parar</button><span class="ai-status" id="iaStatus">Pode levar até um minuto.</span></div></div>
    <div id="ciRes"></div>`,
    `<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="cal-imp-salvar" id="ciOk" disabled>Salvar no calendário</button>`);
}
const lerBase64 = arq => new Promise((ok, erro) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(",")[1]); fr.onerror = erro; fr.readAsDataURL(arq); });
async function iaCalendario() {
  const marcadas = [...dlg.querySelectorAll('input[name="ciEsc"]:checked')].map(x => x.value), txt = (document.getElementById("ciEscTxt")?.value || "").trim();
  const lista = marcadas.length ? marcadas : txt ? [txt] : [], escola = lista.join(" e "), ano = Number(val2("ciAno")) || S.calAno;
  const arq = document.getElementById("ciArq").files[0];
  if (!lista.length) { document.getElementById("iaStatus").textContent = "Marque para qual escola é o calendário."; return; }
  if (!arq) { document.getElementById("iaStatus").textContent = "Escolha o arquivo do calendário."; return; }
  if (arq.size > 6.5 * 1024 * 1024) { document.getElementById("iaStatus").textContent = "Arquivo grande demais (máximo 6 MB). Tente uma foto menor ou o PDF."; return; }
  const mime = arq.type === "application/pdf" ? "application/pdf" : ["image/jpeg", "image/png", "image/webp"].includes(arq.type) ? arq.type : "";
  if (!mime) { document.getElementById("iaStatus").textContent = "Use um PDF ou uma foto (JPG ou PNG)."; return; }
  await comIA(async (signal, st) => {
    const r = await iaJSON({ tipo: "calendario", arquivo: await lerBase64(arq), mime, ano, escola: escola || undefined }, signal);
    const okData = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ""));
    const per = (r?.periodos || []).filter(x => okData(x.inicio) && okData(x.fim) && x.fim >= x.inicio).map((x, i) => ({ num: i + 1, nome: String(x.nome || `${i + 1}º bimestre`).slice(0, 40), inicio: x.inicio, fim: x.fim }));
    const nacionais = new Set(feriadosNacionais(ano).map(n => n.data));
    const evs = (r?.eventos || []).filter(x => okData(x.data) && Object.keys(TIPOS_CAL).includes(x.tipo) && x.tipo !== "com-aula").map(x => ({ data: x.data, fim: okData(x.fim) && x.fim > x.data ? x.fim : "", nome: String(x.nome || "").slice(0, 120), tipo: x.tipo }))
      // feriados nacionais já estão no sistema: não repete
      .filter(x => !(x.tipo === "feriado" && !x.fim && nacionais.has(x.data)));
    if (!per.length && !evs.length) throw { message: "Não consegui ler o calendário. Tente um PDF ou uma foto mais nítida." };
    dlg._imp = { escolas: lista, ano, per, evs, total: r?.diasLetivos };
    const ts = S.turmas.filter(t => lista.includes(escolaDe(t)));
    document.getElementById("ciRes").innerHTML = `${per.length ? `<h3 class="ci-h">Bimestres</h3><div class="list">${per.map(x => `<div class="row"><div class="grow title">${esc(x.nome)}</div><span class="chip num">${fmtData(x.inicio)} a ${fmtData(x.fim)}</span></div>`).join("")}</div>
      ${ts.length ? `<label class="check" style="border:0"><input type="checkbox" id="ciBim" checked><span>Usar essas datas nos bimestres das ${ts.length} turmas (${esc(escola)})</span></label>` : ""}` : ""}
      <h3 class="ci-h">Dias do calendário <small class="muted">(desmarque o que não quiser)</small></h3>
      <div class="ci-evs">${evs.map((x, i) => `<label class="check cal-ev ${x.tipo}"><input type="checkbox" name="ciEv" value="${i}" checked><span><b>${fmtData(x.data)}${x.fim ? " a " + fmtData(x.fim) : ""}</b> · ${esc(x.nome)} <small class="muted">${TIPOS_CAL[x.tipo]}</small></span></label>`).join("")}</div>
      ${r?.diasLetivos ? `<p class="small muted">O calendário informa ${esc(String(r.diasLetivos))} dias letivos.</p>` : ""}`;
    document.getElementById("ciOk").disabled = false; st.textContent = "Confira e salve.";
  });
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act='cal-importar'],[data-act='ia-cal'],[data-act='cal-imp-salvar']"); if (!b) return;
  if (b.dataset.act === "cal-importar") return dlgImportarCal();
  if (b.dataset.act === "ia-cal") return iaCalendario();
  const imp = dlg._imp; if (!imp) return;
  const sel = [...dlg.querySelectorAll('input[name="ciEv"]:checked')].map(x => imp.evs[Number(x.value)]), usarBim = document.getElementById("ciBim")?.checked;
  fechar();
  // não duplica o que já foi importado antes para a mesma escola
  const ja = new Set((S.calendario || []).map(x => [x.data, x.fim || "", x.nome, x.escola || ""].join("|")));
  let n = 0;
  // marcou todas as escolas do professor: um item só, que vale para todas
  const todas = escolas().length > 0 && escolas().every(e => imp.escolas.includes(e)), alvos = todas ? [""] : imp.escolas;
  for (const x of sel) for (const es of alvos) { const k = [x.data, x.fim || "", x.nome, es].join("|"); if (ja.has(k)) continue; ja.add(k); await salvar("calendario", { id: uid(), ...x, escola: es, origem: "importado" }); n++; }
  let nt = 0;
  if (usarBim && imp.per.length) for (const t of S.turmas.filter(t => imp.escolas.includes(escolaDe(t)))) {
    const c = JSON.parse(JSON.stringify(t)), velhos = bimestresDe(c);
    c.bimestres = imp.per.map(p => ({ ...(velhos.find(v => v.num === p.num) || {}), ...p }));
    c.tipoPeriodo = imp.per.length === 3 ? "trimestre" : "bimestre";
    await salvar("turmas", c); nt++;
  }
  S.calAno = imp.ano; render();
  toast(`${n} ${n === 1 ? "item adicionado" : "itens adicionados"} ao calendário${nt ? ` e datas dos bimestres atualizadas em ${nt} turmas` : ""}`);
});
document.addEventListener("submit", async e => {
  if (e.target.id !== "calForm") return; e.preventDefault();
  const ini = val2("cIni"), fim = val2("cFim"), nome = val2("cNome").trim();
  if (!nome || !ini) return;
  if (fim && fim < ini) { toast("A data final precisa ser depois da inicial."); return; }
  await salvar("calendario", { id: uid(), nome, tipo: val2("cTipo"), data: ini, fim: fim && fim !== ini ? fim : "", escola: val2("cEsc") || "" });
  toast("Adicionado ao calendário");
});
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act^='cal-']"); if (!b) return;
  if (b.dataset.act === "cal-ano") { S.calAno += Number(b.dataset.v); render(); return; }
  if (b.dataset.act === "cal-rem") return apagar("calendario", b.dataset.id);
  if (b.dataset.act === "cal-nac") { const id = "ajuste-" + b.dataset.id; if (b.dataset.tipo) await salvar("calendario", { id, tipo: b.dataset.tipo, data: b.dataset.data }); else await apagar("calendario", id); }
});

/* ----- Início ----- */
function agendaHoje() {
  const d0 = hoje(), ds = diaSemana(d0), mAgora = new Date().getHours() * 60 + new Date().getMinutes();
  const aulas = S.turmas.filter(t => !semAula(d0, escolaDe(t))).flatMap(t => horarioDe(t).filter(a => a.dia === ds).map(a => ({ t, a }))).sort((x, y) => x.a.inicio.localeCompare(y.a.inicio));
  if (!S.turmas.some(t => horarioDe(t).length)) return "";
  const fer = semAula(d0, "");
  if (fer && !aulas.length) return `<section class="panel"><div class="panel-head"><h2>Hoje não tem aula</h2><span class="small muted">${DIAS[ds] || "Domingo"}</span></div><p class="muted">${esc(fer.nome)}. Bom descanso!</p></section>`;
  return `<section class="panel"><div class="panel-head"><h2>Suas aulas de hoje</h2><span class="small muted">${DIAS[ds] || "Domingo"}</span></div>
    ${aulas.length ? `<div class="agenda">${aulas.map(({ t, a }) => { const est = minutos(a.fim) <= mAgora ? "feita" : minutos(a.inicio) <= mAgora ? "agora" : "";
      return `<a class="ag-item ${est}" href="${linkTurma(t.id, "chamada")}"><span class="num ag-h">${tempoDe(t, a) ? `<b>${tempoDe(t, a)}º tempo</b> ` : ""}${a.inicio}–${a.fim}</span><span class="dot" style="background:${esc(t.cor)}"></span><span class="ag-t"><b>${esc(t.nome)}</b><small>${esc(t.disciplina)}${variasEscolas() && escolaDe(t) ? " · " + esc(escolaDe(t)) : ""}</small></span>${est === "agora" ? '<span class="chip acc">agora</span>' : est === "feita" ? '<span class="chip">encerrada</span>' : ""}</a>`; }).join("")}</div>`
      : `<p class="muted">Nenhuma aula no seu horário hoje.</p>`}</section>`;
}
function vInicio() {
  const d0 = hoje(), em7 = addDias(d0, 7);
  const proxAulas = S.planos.filter(p => p.data >= d0 && p.data <= em7).sort((a, b) => a.data.localeCompare(b.data));
  const proxAtiv = S.atividades.filter(a => a.prazo >= d0).sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 5);
  const al = alertas();
  const totAlunos = S.turmas.reduce((s, t) => s + (t.alunos || []).length, 0);
  const saud = new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";
  if (!S.turmas.length) return `<div class="page-head"><div class="hello"><img src="/manu/manu-boas-vindas.webp" alt=""><div><span class="eyebrow">${esc(fmtDataLonga(d0))}</span><h1>${saud}${S.nome ? ", " + esc(primeiroNome()) : ""}</h1></div></div></div>` + semTurma("Comece cadastrando uma turma. Depois você faz a chamada, lança notas e planeja aulas com ajuda da IA.");
  return `
  <div class="page-head"><div class="hello"><img src="/manu/manu-boas-vindas.webp" alt=""><div><span class="eyebrow">${esc(fmtDataLonga(d0))}</span><h1>${saud}${S.nome ? ", " + esc(primeiroNome()) : ""}</h1><p class="muted">Resumo das suas turmas e do que vem pela frente.</p></div></div>
  <div class="toolbar">${S.turmas.length ? `<a class="btn" href="${linkTurma((turmaAtual() || S.turmas[0]).id, "chamada")}">Diário de hoje</a>` : ""}</div></div>
  ${!(S.escolas || []).length || !(S.disciplinas || []).length || !(S.etapas || []).length ? `<a class="aviso-perfil" href="#perfil">${ico("turmas")}<span><b>Complete seu perfil</b><small>Cadastre suas escolas, as etapas (Fundamental, Médio…) e as disciplinas. Assim, ao criar uma turma, é só escolher.</small></span><span class="btn sm">Completar</span></a>` : ""}
  ${!instalado() && (pedidoInstalar || ehIOS()) && !(() => { try { return localStorage.getItem("manu_instalar_depois"); } catch (_) { return null; } })() ? `<div class="aviso-perfil">${ico("dl")}<span><b>Instale o Manu Professor no celular</b><small>Abre com um toque, em tela cheia, e o diário funciona mesmo sem internet na escola.</small></span><button class="btn sm primary" data-act="instalar-app">Instalar</button><button class="btn sm ghost" data-act="instalar-depois">Agora não</button></div>` : ""}
  ${S.googleClientId && !S.googleConectado ? `<div class="aviso-perfil">${ico("drive")}<span><b>Conecte seu Google Drive</b><small>Para criar as pastas das suas turmas e salvar planos, provas e slides no seu Drive. Na tela do Google, <b>marque a caixinha do Google Drive</b> antes de clicar em Continuar.</small></span><button class="btn sm primary" data-act="conectar-drive">Conectar</button></div>` : ""}
  ${agendaHoje()}
  <div class="stats">
    <div class="stat"><span class="eyebrow">Turmas</span><span class="v num">${S.turmas.length}</span><span class="small muted">${totAlunos} alunos</span></div>
    <div class="stat"><span class="eyebrow">Aulas nos próximos 7 dias</span><span class="v num">${proxAulas.length}</span><span class="small muted">planejadas</span></div>
    <div class="stat"><span class="eyebrow">Atividades abertas</span><span class="v num">${S.atividades.filter(a => a.prazo >= d0).length}</span><span class="small muted">com prazo a vencer</span></div>
    <div class="stat"><span class="eyebrow">Alunos em alerta</span><span class="v num" style="color:${al.length ? "var(--bad)" : "var(--ok)"}">${new Set(al.map(x => x.t.id + x.a.id)).size}</span><span class="small muted">frequência ou média baixa</span></div>
  </div>
  <div class="cols">
    <section class="panel"><div class="panel-head"><h2>Próximas aulas</h2><a class="btn sm ghost" href="#turmas">Ver turmas</a></div>
      ${proxAulas.length ? `<div class="list">${proxAulas.map(p => { const t = turma(p.turmaId); return `<div class="row"><span class="dot" style="background:${esc(t?.cor || "var(--muted)")}"></span><div class="grow"><div class="title">${esc(p.titulo)}</div><div class="small muted">${esc(t?.nome || "Sem turma")} · ${esc(p.duracao || "")}</div></div>${p.bncc ? `<span class="bncc">${esc(p.bncc)}</span>` : ""}<span class="chip num">${fmtData(p.data)}</span><button class="btn sm" data-act="ver-plano" data-id="${esc(p.id)}">Abrir</button></div>`; }).join("")}</div>`
        : `<p class="muted">Nenhuma aula planejada para esta semana. Para planejar com a IA, abra a turma e vá em Bimestres.</p>`}
    </section>
    <section class="panel"><div class="panel-head"><h2>Precisam de atenção</h2></div>
      ${al.length ? `<div class="list">${al.slice(0, 8).map(x => `<div class="row"><div class="grow"><div class="title">${esc(x.a.nome)}</div><div class="small muted">${esc(x.t.nome)}</div></div><span class="chip ${x.cls}">${esc(x.txt)}</span></div>`).join("")}</div>`
        : `<p class="muted">Nenhum aluno abaixo de ${FREQ_MIN}% de frequência ou média ${MEDIA_MIN}.</p>`}
    </section>
  </div>
  <section class="panel"><div class="panel-head"><h2>Prazos de atividades</h2><a class="btn sm ghost" href="#turmas">Ver turmas</a></div>
    ${proxAtiv.length ? `<div class="list">${proxAtiv.map(a => { const t = turma(a.turmaId); const n = (t?.alunos || []).length; const e = Object.values(a.entregas || {}).filter(Boolean).length; return `<div class="row"><span class="dot" style="background:${esc(t?.cor || "var(--muted)")}"></span><div class="grow"><div class="title">${esc(a.titulo)}</div><div class="small muted">${esc(t?.nome || "")}</div></div><span class="small muted num">${e}/${n} entregues</span><span class="chip ${a.prazo === d0 ? "warn" : ""} num">${fmtData(a.prazo)}</span></div>`; }).join("")}</div>` : `<p class="muted">Nenhuma atividade com prazo aberto.</p>`}
  </section>`;
}

/* ----- Resumo da turma ----- */
function vResumoTurma() {
  const t = turmaAtual(), d0 = hoje(), al = t.alunos || [];
  const bimR = bimSelecionado(t), Br = bimR ? bimPorNum(t, bimR) : null;
  const meds = al.map(a => mediaAluno(t, a.id, bimR)).filter(x => x !== null), fr = al.map(a => freqAluno(t, a.id, bimR)).filter(x => x !== null);
  const mm = meds.length ? meds.reduce((a, b) => a + b, 0) / meds.length : null, fm = fr.length ? Math.round(fr.reduce((a, b) => a + b, 0) / fr.length) : null;
  const aulas = S.planos.filter(p => p.turmaId === t.id && p.data >= d0).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 5);
  const ativ = S.atividades.filter(a => a.turmaId === t.id && a.prazo >= d0).sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 5);
  const al2 = alertas().filter(x => x.t.id === t.id);
  const hojeFeita = S.chamadas.some(c => c.turmaId === t.id && c.data === d0);
  const semR = Br ? semanasDo(Br) : [], semAgora = semR.findIndex(w => d0 >= w.inicio && d0 <= addDias(w.fim, 2));
  const faixa = Br ? `<a class="faixa-bim" href="${linkTurma(t.id, "bimestres")}"><b>${esc(Br.nome)}</b><span>${fmtData(Br.inicio)} a ${fmtData(Br.fim)}${semAgora >= 0 ? ` · semana ${semAgora + 1} de ${semR.length}` : ""}</span>${Br.plano && semAgora >= 0 && Br.plano.semanas[semAgora] ? `<span>Esta semana: <b>${esc(Br.plano.semanas[semAgora].tema)}</b></span>` : `<span>${Br.plano ? "" : "Planeje este período com a IA"}</span>`}</a>`
    : bimestresDe(t).length ? "" : `<a class="faixa-bim vazio" href="${linkTurma(t.id, "bimestres")}"><b>Organize o ano em bimestres</b><span>Notas, frequência e planejamento por período</span></a>`;
  const px = proximaAula(t);
  const linhaHor = px ? `<a class="faixa-hor" href="#horario">${px.agora ? `<b>Aula agora</b><span>${px.inicio}–${px.fim}</span>` : `<b>Próxima aula</b><span>${px.hoje ? "hoje" : DIAS[px.dia].toLowerCase() + ", " + fmtData(px.data)} · ${tempoDe(t, px) ? tempoDe(t, px) + "º tempo · " : ""}${px.inicio}–${px.fim}</span>`}</a>`
    : `<a class="faixa-hor vazio" href="#horario"><b>Cadastre o horário de aula</b><span>Dias e horários desta turma</span></a>`;
  return faixa + linhaHor + `<div class="atalhos">
    <a class="atalho" href="${linkTurma(t.id, "chamada")}"><b>${hojeFeita ? "Diário de hoje feito" : "Registrar a aula de hoje"}</b><span>${hojeFeita ? "Toque para revisar" : "P, F ou J para cada aluno"}</span></a>
    <a class="atalho" href="${linkTurma(t.id, "notas")}"><b>Lançar notas</b><span>Médias e boletim da turma</span></a>
    <a class="atalho" href="${linkTurma(t.id, "atividades")}"><b>Entregas</b><span>Quem entregou as atividades</span></a>
    <a class="atalho" href="${linkTurma(t.id, "provas")}"><b>Provas</b><span>Montar, imprimir e corrigir por foto</span></a>
  </div>
  <div class="stats">
    <div class="stat"><span class="eyebrow">Alunos</span><span class="v">${al.length}</span><span class="small muted"><a class="btn sm ghost" href="${linkTurma(t.id, "alunos")}" style="padding:0;min-height:0">ver e adicionar alunos</a></span></div>
    <div class="stat"><span class="eyebrow">Média${Br ? " no " + esc(Br.nome) : " da turma"}</span><span class="v">${fmtNota(mm)}</span><span class="small muted">${S.avaliacoes.filter(a => a.turmaId === t.id).length} avaliações</span></div>
    <div class="stat"><span class="eyebrow">Frequência${Br ? " no período" : " média"}</span><span class="v">${fm === null ? "—" : fm + "%"}</span><span class="small muted">${S.chamadas.filter(c => c.turmaId === t.id).length} aulas registradas</span></div>
    <div class="stat"><span class="eyebrow">Alunos em alerta</span><span class="v" style="color:${al2.length ? "var(--bad)" : "var(--ok)"}">${new Set(al2.map(x => x.a.id)).size}</span><span class="small muted">frequência ou média baixa</span></div>
  </div>
  <div class="cols">
    <section class="panel"><div class="panel-head"><h2>Próximas aulas</h2><a class="btn sm ghost" href="${linkTurma(t.id, "planos")}">Ver planejamento</a></div>
      ${aulas.length ? `<div class="list">${aulas.map(p => `<div class="row"><div class="grow"><div class="title">${esc(p.titulo)}</div><div class="small muted">${esc(p.duracao || "")}</div></div>${p.bncc ? `<span class="bncc">${esc(p.bncc.split(/[,;\s]+/)[0])}</span>` : ""}<span class="chip num">${fmtData(p.data)}</span><button class="btn sm" data-act="ver-plano" data-id="${esc(p.id)}">Abrir</button></div>`).join("")}</div>` : `<p class="muted">Nenhuma aula planejada. <a class="btn sm ai" href="${linkTurma(t.id, "bimestres")}">${ico("spark")}Planejar no bimestre</a></p>`}
    </section>
    <section class="panel"><div class="panel-head"><h2>Precisam de atenção</h2></div>
      ${al2.length ? `<div class="list">${al2.map(x => `<div class="row"><div class="grow title">${esc(x.a.nome)}</div><span class="chip ${x.cls}">${esc(x.txt)}</span></div>`).join("")}</div>` : `<p class="muted">Ninguém abaixo de ${FREQ_MIN}% de frequência ou média ${MEDIA_MIN}.</p>`}
    </section>
  </div>
  <section class="panel"><div class="panel-head"><h2>Atividades com prazo</h2><a class="btn sm ghost" href="${linkTurma(t.id, "atividades")}">Ver todas</a></div>
    ${ativ.length ? `<div class="list">${ativ.map(a => `<div class="row"><div class="grow title">${esc(a.titulo)}</div><span class="small muted num">${al.filter(s => a.entregas?.[s.id]).length}/${al.length} entregues</span><span class="chip num">${fmtData(a.prazo)}</span></div>`).join("")}</div>` : `<p class="muted">Nenhuma atividade com prazo aberto.</p>`}
  </section>`;
}

/* ----- Turmas ----- */
function vTurmas() {
  const head = `<div class="page-head"><div><h1>Turmas</h1><p class="muted">Toque numa turma para abrir o painel com alunos, chamada, notas e as ferramentas de IA.</p></div><div class="toolbar"><a class="btn" href="#perfil">Minhas escolas e disciplinas</a><button class="btn primary" data-act="nova-turma">${ico("plus")}Nova turma</button></div></div>`;
  if (!S.turmas.length) return head + semTurma();
  const cartoes = lista => `<div class="cards">${lista.map(t => {
    return `<article class="card card-turma" data-abrir="${esc(t.id)}"><div class="card-top"><div style="display:flex;gap:10px;min-width:0"><span class="swatch" style="background:${esc(t.cor)}"></span><div style="min-width:0"><h3><a class="link-turma" href="${linkTurma(t.id)}">${esc(t.nome)}</a></h3><p class="small muted">${[t.disciplina, t.serie, t.turno].filter(Boolean).map(esc).join(" · ")}</p></div></div><div class="card-top-acoes">${t.exemplo ? '<span class="chip">exemplo</span>' : ""}<button class="card-excluir" data-act="excluir-turma" data-id="${esc(t.id)}" aria-label="Excluir ${esc(t.nome)}" title="Excluir turma">${ico("lixo")}</button></div></div>
      ${bimestresDe(t).length ? `<div class="card-bims">${bimestresDe(t).map(b => { const atual = hoje() >= b.inicio && hoje() <= b.fim; return `<a class="card-bim${atual ? " atual" : ""}" href="${linkTurma(t.id)}" data-bim="${b.num}" data-turma="${esc(t.id)}" title="${esc(b.nome)}: ${fmtData(b.inicio)} a ${fmtData(b.fim)}">${esc(b.nome.replace(/\s*(bimestre|trimestre)$/i, ""))}${/bimestre/i.test(b.nome) ? "<small>bim</small>" : /trimestre/i.test(b.nome) ? "<small>tri</small>" : ""}</a>`; }).join("")}</div>` : ""}
      <div class="toolbar card-acoes"><a class="btn sm primary" href="${linkTurma(t.id)}">Abrir turma</a>${S.googleClientId ? `<button class="btn sm ghost" data-act="drive-pasta" data-id="${esc(t.id)}">${ico("drive")}Pasta no Drive</button>` : ""}</div></article>`;
  }).join("")}</div>`;
  // dentro de cada escola, separa por turno (Matutino, Vespertino, Noturno, Integral)
  // dentro do turno: separado por etapa (Fundamental, Médio...) e em ordem de série, letra e disciplina
  const ETAPA_NOME = { ei: "Educação Infantil", ef1: "Ensino Fundamental · Anos iniciais", ef2: "Ensino Fundamental · Anos finais", em: "Ensino Médio", eja: "EJA", "": "Outras turmas" }, ETAPA_ORD = ["ei", "ef1", "ef2", "em", "eja", ""];
  const etapaT = t => { const e = etapaDaSerie(t.serie || t.nome); return ETAPA_NOME[e] ? e : ""; };
  const numSerie = t => { const m = String(t.nome || t.serie || "").match(/(\d+)/); return m ? Number(m[1]) : 99; };
  const ordenar = l => l.slice().sort((a, b) => numSerie(a) - numSerie(b) || String(a.nome).localeCompare(String(b.nome), "pt-BR") || String(a.disciplina).localeCompare(String(b.disciplina), "pt-BR"));
  const variasEtapas = new Set(S.turmas.map(etapaT)).size > 1;
  const porEtapa = lista => {
    if (!variasEtapas) return cartoes(ordenar(lista));
    return ETAPA_ORD.filter(e => lista.some(t => etapaT(t) === e)).map(e => { const l = ordenar(lista.filter(t => etapaT(t) === e)); return `<h4 class="grupo-etapa etapa-${e || "outra"}">${ETAPA_NOME[e]} <small class="muted">${l.length} turma${l.length === 1 ? "" : "s"}</small></h4>` + cartoes(l); }).join("");
  };
  // botões dos turnos em que o professor tem aula: mostram só as turmas daquele turno
  const ordT = x => { const i = ORDEM_TURNO.indexOf(x); return i < 0 ? 9 : i; };
  const tnsTodos = [...new Set(S.turmas.map(turnoGrupo))].sort((a, b) => ordT(a) - ordT(b));
  if (tnsTodos.length > 1) {
    if (!S.turmasTurno || (S.turmasTurno !== "todos" && !tnsTodos.includes(S.turmasTurno))) {
      const h = new Date().getHours(), agora = h < 12 ? "Matutino" : h < 18 ? "Vespertino" : "Noturno";
      S.turmasTurno = tnsTodos.includes(agora) ? agora : tnsTodos[0];
    }
  } else S.turmasTurno = "todos";
  const filtroT = S.turmasTurno, noFiltro = t => filtroT === "todos" || turnoGrupo(t) === filtroT;
  const botoesT = tnsTodos.length > 1 ? `<div class="seg turnos-turmas" role="tablist" aria-label="Turno">${[...tnsTodos, "todos"].map(x => { const n = x === "todos" ? S.turmas.length : S.turmas.filter(t => turnoGrupo(t) === x).length; return `<button type="button" role="tab" class="${x === filtroT ? "on" : ""}" aria-selected="${x === filtroT}" data-act="turmas-turno" data-v="${esc(x)}">${x === "todos" ? "Todas" : esc(x || "Sem turno")} <small class="num">${n}</small></button>`; }).join("")}</div>` : "";
  const porTurno = lista => {
    lista = lista.filter(noFiltro);
    if (filtroT !== "todos") return porEtapa(lista);
    const ordem = x => { const i = ORDEM_TURNO.indexOf(x); return i < 0 ? 9 : i; };
    const tns = [...new Set(lista.map(turnoGrupo))].sort((a, b) => ordem(a) - ordem(b));
    if (tns.length < 2 && tns[0]) return `<h3 class="grupo-turno">${esc(tns[0])} <small class="muted">${lista.length} turma${lista.length === 1 ? "" : "s"}</small></h3>` + porEtapa(lista);
    if (tns.length < 2) return porEtapa(lista);
    return tns.map(tn => { const l = lista.filter(t => turnoGrupo(t) === tn); return `<h3 class="grupo-turno">${esc(tn || "Sem turno")} <small class="muted">${l.length} turma${l.length === 1 ? "" : "s"}</small></h3>` + porEtapa(l); }).join("");
  };
  if (!variasEscolas()) return head + botoesT + porTurno(S.turmas);
  const semEsc = S.turmas.filter(t => !escolaDe(t) && noFiltro(t));
  return head + botoesT + escolas().filter(e => S.turmas.some(t => escolaDe(t) === e && noFiltro(t))).map(e => `<section class="grupo-escola"><h2>${ico("inicio")}${esc(e)} <small class="muted">${(n => `${n} turma${n === 1 ? "" : "s"}`)(S.turmas.filter(t => escolaDe(t) === e && noFiltro(t)).length)}</small></h2>${porTurno(S.turmas.filter(t => escolaDe(t) === e))}</section>`).join("")
    + (semEsc.length ? `<section class="grupo-escola"><h2>Sem escola definida</h2>${porTurno(semEsc)}</section>` : "");
}

// botão de bimestre no cartão: abre a turma já naquele período
document.addEventListener("click", e => { const b = e.target.closest(".card-bim[data-bim]"); if (!b) return; S.bimSel[b.dataset.turma] = String(b.dataset.bim); });
// o cartão inteiro abre a turma (menos os botões dentro dele)
document.addEventListener("click", e => {
  const mg = e.target.closest("[data-media-geral]"); if (mg) { S.notasGeral = true; if (location.hash === mg.getAttribute("href")) { e.preventDefault(); render(); } return; }
  const bn = e.target.closest("[data-bim-nav]"); if (!bn) return;
  const t = turmaAtual(); if (!t) return; e.preventDefault();
  S.bimSel[t.id] = String(bn.dataset.bimNav);
  const ir = () => { const el = document.getElementById("bim-" + bn.dataset.bimNav); if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); el.querySelector(".bim-det")?.setAttribute("open", ""); } };
  if (location.hash === bn.getAttribute("href")) { render(); setTimeout(ir, 30); } else { location.hash = bn.getAttribute("href"); setTimeout(ir, 80); }
});
document.addEventListener("click", e => { const b = e.target.closest("[data-act='turmas-turno']"); if (b) { S.turmasTurno = b.dataset.v; render(); } });
document.addEventListener("click", e => { const c = e.target.closest(".card-turma[data-abrir]"); if (!c || e.target.closest("a,button")) return; irTurma(c.dataset.abrir); });

/* ----- Chamada ----- */
/* ----- Diário de classe: uma tela por aula ----- */
// dias de aula da turma num período: pelo horário (Meu horário); sem horário, dias úteis
function diasDeAula(t, ini, fim) {
  const ds = new Set(horarioDe(t).map(a => a.dia)), out = [];
  for (let d = ini; d <= fim; d = addDias(d, 1)) { const w = diaSemana(d); if ((ds.size ? ds.has(w) : w <= 5) && !semAula(d, escolaDe(t))) out.push(d); }
  return [...new Set([...out, ...sabadosLetivos(escolaDe(t), ini, fim)])].sort();
}
const chamadaDe = (t, data) => S.chamadas.find(c => c.id === t.id + "_" + data);
function statusAula(t, data) {
  const c = chamadaDe(t, data), temP = c && Object.keys(c.presencas || {}).length, temC = c && (c.conteudo || "").trim();
  if (temP && temC) return "ok"; if (temP || temC) return "meio"; return data < hoje() ? "pend" : data === hoje() ? "hoje" : "fut";
}
function periodoDiario(t) {
  const b = bimSelecionado(t) ? bimPorNum(t, bimSelecionado(t)) : null;
  if (b) return { b, ini: b.inicio, fim: b.fim };
  return { b: null, ini: addDias(hoje(), -45), fim: addDias(hoje(), 14) };
}
function diasDoDiario(t) {
  const { ini, fim } = periodoDiario(t);
  const extras = S.chamadas.filter(c => c.turmaId === t.id && c.data >= ini && c.data <= fim).map(c => c.data);
  return [...new Set([...diasDeAula(t, ini, fim), ...extras])].sort();
}
function temposDoDia(t, data) {
  const w = diaSemana(data), hs = horarioDe(t).filter(a => a.dia === w);
  if (!hs.length) return "";
  const ks = hs.map(a => tempoDe(t, a)).filter(Boolean);
  return `${ks.length ? ks.map(k => k + "º").join(" e ") + " tempo" : ""} · ${hs[0].inicio}–${hs[hs.length - 1].fim}`;
}
// sugestões de conteúdo: planejamento da semana, plano de aula do dia e a aula anterior
function sugestoesConteudo(t, data) {
  const out = [], b = bimDaData(t, data);
  if (b && b.plano) { const i = semanasDo(b).findIndex(w => data >= w.inicio && data <= addDias(w.fim, 2)); const w = b.plano.semanas?.[i]; if (w && w.tema) out.push({ rot: "Planejamento da semana", txt: w.tema + (w.atividades ? " – " + w.atividades : ""), habs: String(w.habilidades || "").split(/[,;\s]+/).filter(x => /^(EI|EF|EM)\d/i.test(x)) }); }
  for (const p of S.planos.filter(p => p.turmaId === t.id && p.data === data)) out.push({ rot: "Plano de aula do dia", txt: p.titulo + (p.conteudo && p.conteudo !== p.titulo ? " – " + p.conteudo : ""), habs: String(p.bncc || "").split(/[,;\s]+/).filter(x => /^(EI|EF|EM)\d/i.test(x)) });
  const ant = S.chamadas.filter(c => c.turmaId === t.id && c.data < data && (c.conteudo || "").trim()).sort((a, c) => c.data.localeCompare(a.data))[0];
  if (ant) out.push({ rot: `Igual à aula de ${fmtData(ant.data)}`, txt: ant.conteudo, habs: ant.habilidades || [] });
  return out.slice(0, 3);
}
async function mudarAula(t, data, fn, msg) {
  const al = t.alunos || [], cid = t.id + "_" + data;
  const c = JSON.parse(JSON.stringify(chamadaDe(t, data) || { id: cid, turmaId: t.id, data, presencas: {}, conteudo: "" }));
  // o professor só marca quem faltou: quem não foi marcado conta como presente
  al.forEach(a => { if (!c.presencas[a.id]) c.presencas[a.id] = "P"; });
  fn(c); c.atualizadoEm = new Date().toISOString();
  await salvar("chamadas", c); if (msg) toast(msg);
}
function vChamada() {
  const t = turmaAtual();
  const head = `<div class="page-head"><div><h1>Diário de classe</h1><p class="muted">Escolha a aula, marque só quem faltou e escreva o que foi trabalhado. Tudo salva sozinho.</p></div><div class="toolbar"><button class="btn" data-act="d-imprimir">${ico("dl")}Imprimir diário</button></div></div>`;
  if (!t) return head + semTurma();
  const dias = diasDoDiario(t), data = S.chamadaData, c = chamadaDe(t, data), pres = c?.presencas || {}, al = t.alunos || [];
  const { b } = periodoDiario(t), passados = dias.filter(d => d <= hoje()), feitas = passados.filter(d => statusAula(t, d) === "ok").length, pend = passados.filter(d => ["pend", "meio"].includes(statusAula(t, d)));
  const ICO_ST = { ok: "✓", meio: "•", pend: "!", hoje: "", fut: "" };
  const faixa = `<div class="d-faixa" id="dFaixa" role="list" aria-label="Aulas">${[...new Set([...dias, data])].sort().map(d => { const st = statusAula(t, d); return `<button type="button" role="listitem" class="d-dia ${st}${d === data ? " sel" : ""}" data-act="d-dia" data-data="${d}" aria-current="${d === data}" title="${st === "ok" ? "Aula registrada" : st === "meio" ? "Falta completar" : st === "pend" ? "Aula sem registro" : ""}"><small>${DIAS[diaSemana(d)]?.slice(0, 3) || ""}</small><b>${d.slice(8)}/${d.slice(5, 7)}</b><i>${ICO_ST[st]}</i></button>`; }).join("")}</div>`;
  const fechamento = `<section class="panel d-fech"><div class="d-fech-num"><b class="num">${feitas}</b><span>de ${passados.length} aulas registradas${b ? " no " + esc(b.nome) : ""}</span></div>
    <div class="d-fech-pend">${pend.length ? `<span class="small"><b>${pend.length}</b> ${pend.length === 1 ? "aula precisa" : "aulas precisam"} de registro:</span> ${pend.slice(-8).map(d => `<button class="chip ${statusAula(t, d) === "pend" ? "bad" : "warn"}" data-act="d-dia" data-data="${d}">${fmtData(d)}</button>`).join("")}${pend.length > 8 ? ` <span class="small muted">e mais ${pend.length - 8}</span>` : ""}` : `<span class="chip ok">Diário em dia</span>`}</div></section>`;
  const ini = periodoDiario(t).ini, fim = periodoDiario(t).fim;
  const foraDoPeriodo = data < ini || data > fim;
  // 1. frequência
  const nF = al.filter(a => pres[a.id] === "F").length, nJ = al.filter(a => pres[a.id] === "J").length;
  const freq = al.length ? `<div class="d-alunos">${al.map((a, i) => { const v = pres[a.id] || "P"; return `<div class="d-aluno ${v}"><button type="button" class="d-nome" data-act="d-falta" data-aluno="${esc(a.id)}" aria-pressed="${v !== "P"}"><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="nm">${esc(a.nome)}</span><span class="st">${v === "P" ? "Presente" : v === "F" ? "Faltou" : "Falta justificada"}</span></button>${v !== "P" ? `<button type="button" class="btn sm ghost" data-act="d-just" data-aluno="${esc(a.id)}">${v === "J" ? "Tirar justificativa" : "Justificar"}</button>` : ""}</div>`; }).join("")}</div>`
    : `<p class="muted">Esta turma ainda não tem alunos. <a class="btn sm" href="${linkTurma(t.id, "alunos")}">Adicionar alunos</a></p>`;
  // 2. conteúdo e habilidades
  const sug = sugestoesConteudo(t, data), bimD = bimDaData(t, data);
  const habsBim = [...new Map([...(bimD ? habsDe(bimD) : []).map(h => [h.codigo || h.descricao, h]), ...sug.flatMap(x => x.habs).map(cd => [cd.toUpperCase(), { codigo: cd.toUpperCase(), descricao: "" }])]).values()].filter(h => h.codigo);
  const habsSel = new Set(c?.habilidades || []);
  // 3. tecnologia
  const tec = c?.tecnologia || null, recTec = bimD ? (bimD.recursos || []).filter(x => TEC.has(x)) : [], ideias = bimD ? (bimD.ideiasTec || []) : [];
  const opTec = [...new Set([...recTec, ...ideias.map(x => x.titulo), ...(tec?.itens || [])])];
  const st = statusAula(t, data);
  return head + fechamento + `<section class="panel d-aula">
    ${faixa}
    <div class="d-cab"><button type="button" class="btn sm ghost" data-act="d-ant" aria-label="Aula anterior">‹</button>
      <div class="d-cab-tit"><h2>${esc(fmtDataLonga(data))}</h2><span class="small muted">${esc(temposDoDia(t, data) || "Dia fora do horário cadastrado")}${foraDoPeriodo ? " · fora do bimestre escolhido" : ""}</span></div>
      <button type="button" class="btn sm ghost" data-act="d-prox" aria-label="Próxima aula">›</button>
      <label class="btn sm ghost d-outro">Outro dia<input type="date" id="chData" value="${esc(data)}"></label></div>
    ${(x => x ? `<div class="d-status meio">Sem aula neste dia: ${esc(x.nome)}${x.nacional ? " (feriado nacional)" : ""}. Se houve aula, registre normalmente.</div>` : "")(semAula(data, escolaDe(t)))}
    <div class="d-status ${st}">${st === "ok" ? "✓ Aula registrada" : st === "meio" ? (Object.keys(pres).length ? "Falta escrever o que foi trabalhado" : "Falta a frequência") : data > hoje() ? "Aula ainda não aconteceu" : "Aula ainda não registrada"}</div>
    <div class="d-passo"><div class="d-passo-h"><span class="d-n">1</span><div><h3>Quem faltou?</h3><p class="small muted">Toque no nome de quem faltou. Os outros ficam como presentes.</p></div>
      <div class="d-cont"><span class="chip ok num">${al.length - nF - nJ} presente${al.length - nF - nJ === 1 ? "" : "s"}</span>${nF ? `<span class="chip bad num">${nF} falta${nF > 1 ? "s" : ""}</span>` : ""}${nJ ? `<span class="chip warn num">${nJ} justificada${nJ > 1 ? "s" : ""}</span>` : ""}</div></div>
      ${freq}${al.length && !c ? `<button class="btn sm" data-act="d-todos">Confirmar: todos presentes</button>` : ""}</div>
    <div class="d-passo"><div class="d-passo-h"><span class="d-n">2</span><div><h3>O que foi trabalhado?</h3><p class="small muted">Escreva com suas palavras ou toque numa sugestão.</p></div></div>
      ${sug.length ? `<div class="d-sug">${sug.map((x, i) => `<button type="button" class="d-sug-b" data-act="d-sug" data-i="${i}"><small>${esc(x.rot)}</small><span>${esc(x.txt.length > 140 ? x.txt.slice(0, 140) + "…" : x.txt)}</span></button>`).join("")}</div>` : ""}
      <textarea class="input" id="chConteudo" rows="3" placeholder="Ex.: Frações equivalentes. Leitura da página 84 e exercícios 1 a 5.">${esc(c?.conteudo || "")}</textarea>
      ${habsBim.length ? `<div class="d-sub"><span class="small muted">Habilidades da BNCC desta aula (opcional)</span><div class="chips-esc">${habsBim.map(h => `<button type="button" class="tn-op" data-act="d-hab" data-v="${esc(h.codigo)}" aria-pressed="${habsSel.has(h.codigo)}" title="${esc(h.descricao)}">${habsSel.has(h.codigo) ? "✓ " : ""}${esc(h.codigo)}</button>`).join("")}</div></div>` : ""}</div>
    <div class="d-passo"><div class="d-passo-h"><span class="d-n">3</span><div><h3>Usou tecnologia nesta aula?</h3><p class="small muted">Fica no relatório de uso de tecnologia do bimestre.</p></div></div>
      <div class="chips-esc"><button type="button" class="tn-op" data-act="d-tec" data-v="nao" aria-pressed="${tec && !tec.usou ? "true" : "false"}">Não</button><button type="button" class="tn-op" data-act="d-tec" data-v="sim" aria-pressed="${tec?.usou ? "true" : "false"}">Sim</button></div>
      ${tec?.usou ? `<div class="d-sub"><span class="small muted">O que foi usado</span><div class="chips-esc">${[...opTec, ...[...TEC].filter(x => !opTec.includes(x))].slice(0, 16).map(x => `<button type="button" class="tn-op" data-act="d-tec-item" data-v="${esc(x)}" aria-pressed="${(tec.itens || []).includes(x)}">${(tec.itens || []).includes(x) ? "✓ " : ""}${esc(x)}</button>`).join("")}</div></div>` : ""}</div>
    <div class="d-passo"><div class="d-passo-h"><span class="d-n">4</span><div><h3>Observações <span class="small muted">(opcional)</span></h3></div></div>
      <textarea class="input" id="dObs" rows="2" placeholder="Ex.: aula encurtada por reunião; turma participou bem.">${esc(c?.observacao || "")}</textarea></div>
  </section>`;
}
// rola a faixa de dias até a aula escolhida
const _rotaDiario = () => setTimeout(() => { const f = document.getElementById("dFaixa"), s = f && f.querySelector(".sel"); if (s) f.scrollLeft = s.offsetLeft - f.clientWidth / 2 + s.clientWidth / 2; }, 20);
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act^='d-']"); if (!b) return;
  const t = turmaAtual(); if (!t) return;
  const act = b.dataset.act, data = S.chamadaData;
  if (act === "d-dia") { S.chamadaData = b.dataset.data; render(); _rotaDiario(); return; }
  if (act === "d-ant" || act === "d-prox") { const ds = diasDoDiario(t), i = ds.indexOf(data); let n = act === "d-ant" ? (i < 0 ? ds.filter(d => d < data).pop() : ds[i - 1]) : (i < 0 ? ds.find(d => d > data) : ds[i + 1]); if (n) { S.chamadaData = n; render(); _rotaDiario(); } return; }
  if (act === "d-imprimir") return imprimirDiario(t);
  if (act === "d-falta") return mudarAula(t, data, c => { const v = c.presencas[b.dataset.aluno]; c.presencas[b.dataset.aluno] = v === "P" ? "F" : "P"; });
  if (act === "d-just") return mudarAula(t, data, c => { const v = c.presencas[b.dataset.aluno]; c.presencas[b.dataset.aluno] = v === "J" ? "F" : "J"; });
  if (act === "d-todos") return mudarAula(t, data, () => {}, "Frequência salva: todos presentes");
  if (act === "d-sug") { const x = sugestoesConteudo(t, data)[Number(b.dataset.i)]; if (!x) return; return mudarAula(t, data, c => { c.conteudo = x.txt; c.habilidades = [...new Set([...(c.habilidades || []), ...x.habs.map(h => h.toUpperCase())])]; }, "Conteúdo preenchido"); }
  if (act === "d-hab") return mudarAula(t, data, c => { const hs = c.habilidades || [], v = b.dataset.v; c.habilidades = hs.includes(v) ? hs.filter(x => x !== v) : [...hs, v]; });
  if (act === "d-tec") return mudarAula(t, data, c => { c.tecnologia = b.dataset.v === "sim" ? { usou: true, itens: c.tecnologia?.itens || [] } : { usou: false, itens: [] }; });
  if (act === "d-tec-item") return mudarAula(t, data, c => { const it = c.tecnologia?.itens || [], v = b.dataset.v; c.tecnologia = { usou: true, itens: it.includes(v) ? it.filter(x => x !== v) : [...it, v] }; });
});
document.addEventListener("change", async e => {
  const t = turmaAtual(); if (!t || S.view !== "chamada") return;
  if (e.target.id === "chConteudo") { const v = e.target.value.trim(); if (v !== (chamadaDe(t, S.chamadaData)?.conteudo || "")) await mudarAula(t, S.chamadaData, c => { c.conteudo = v; }, "Conteúdo salvo"); }
  if (e.target.id === "dObs") { const v = e.target.value.trim(); if (v !== (chamadaDe(t, S.chamadaData)?.observacao || "")) await mudarAula(t, S.chamadaData, c => { c.observacao = v; }, "Observação salva"); }
});

// Diário do bimestre para imprimir ou salvar em PDF
function imprimirDiario(t) {
  const { b, ini, fim } = periodoDiario(t), al = t.alunos || [];
  const aulas = S.chamadas.filter(c => c.turmaId === t.id && c.data >= ini && c.data <= fim).sort((a, c) => a.data.localeCompare(c.data));
  if (!aulas.length) { toast("Ainda não há aulas registradas neste período."); return; }
  const h = x => esc(x == null ? "" : String(x));
  const blocos = []; for (let i = 0; i < aulas.length; i += 22) blocos.push(aulas.slice(i, i + 22));
  const tabFreq = blocos.map(bl => `<table class="freq"><thead><tr><th class="n">Nº</th><th class="al">Aluno</th>${bl.map(c => `<th>${c.data.slice(8)}/${c.data.slice(5, 7)}</th>`).join("")}<th>Faltas</th><th>%</th></tr></thead><tbody>
    ${al.map((a, i) => { const fs = aulas.filter(c => ["F"].includes(c.presencas?.[a.id])).length, tot = aulas.filter(c => c.presencas?.[a.id]).length, pct = tot ? Math.round((tot - fs) / tot * 100) : null;
      return `<tr><td class="n">${i + 1}</td><td class="al">${h(a.nome)}</td>${bl.map(c => { const v = c.presencas?.[a.id] || ""; return `<td class="${v}">${v === "P" ? "•" : v}</td>`; }).join("")}<td>${fs}</td><td>${pct == null ? "—" : pct + "%"}</td></tr>`; }).join("")}</tbody></table>`).join("");
  const reg = `<table class="reg"><thead><tr><th>Data</th><th>Conteúdo trabalhado</th><th>Habilidades</th><th>Tecnologia</th><th>Pres.</th></tr></thead><tbody>${aulas.map(c => { const v = Object.values(c.presencas || {}); return `<tr><td class="dt">${fmtData(c.data)}</td><td>${h(c.conteudo) || "<i>sem registro</i>"}${c.observacao ? `<div class="obs">Obs.: ${h(c.observacao)}</div>` : ""}</td><td>${h((c.habilidades || []).join(", "))}</td><td>${c.tecnologia?.usou ? h((c.tecnologia.itens || []).join(", ") || "Sim") : "—"}</td><td>${v.filter(x => x !== "F").length}/${v.length}</td></tr>`; }).join("")}</tbody></table>`;
  const avs = S.avaliacoes.filter(a => a.turmaId === t.id && (!b || String(a.bimestre) === String(b.num))).sort((a, c) => (a.data || "").localeCompare(c.data || ""));
  const notas = avs.length ? `<h2>Avaliações e notas</h2><table class="freq"><thead><tr><th class="n">Nº</th><th class="al">Aluno</th>${avs.map(a => `<th>${h(a.nome)}<br><small>peso ${h(a.peso)}</small></th>`).join("")}<th>Média</th></tr></thead><tbody>${al.map((a, i) => `<tr><td class="n">${i + 1}</td><td class="al">${h(a.nome)}</td>${avs.map(x => `<td>${x.notas?.[a.id] == null ? "" : fmtNota(x.notas[a.id])}</td>`).join("")}<td><b>${fmtNota(mediaAluno(t, a.id, b ? b.num : undefined))}</b></td></tr>`).join("")}</tbody></table>` : "";
  const comTec = aulas.filter(c => c.tecnologia?.usou), usos = {}; comTec.forEach(c => (c.tecnologia.itens || []).forEach(x => usos[x] = (usos[x] || 0) + 1));
  const habsTodas = [...new Set(aulas.flatMap(c => c.habilidades || []))];
  const resumo = `<h2>Resumo do período</h2><div class="res"><div><b>${aulas.length}</b><span>aulas registradas</span></div><div><b>${aulas.filter(c => (c.conteudo || "").trim()).length}</b><span>com conteúdo</span></div><div><b>${comTec.length}</b><span>aulas com tecnologia (${aulas.length ? Math.round(comTec.length / aulas.length * 100) : 0}%)</span></div><div><b>${habsTodas.length}</b><span>habilidades da BNCC trabalhadas</span></div></div>
    ${comTec.length ? `<p><b>Tecnologia usada:</b> ${Object.entries(usos).sort((a, c) => c[1] - a[1]).map(([k, n]) => `${h(k)} (${n})`).join("; ") || "registrada sem detalhe"}.</p>` : ""}
    ${habsTodas.length ? `<p><b>Habilidades:</b> ${h(habsTodas.join(", "))}.</p>` : ""}`;
  const css = `@page{size:A4 landscape;margin:12mm}body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:10.5px}h1{font-size:17px;margin:0 0 4px}h2{font-size:13px;margin:16px 0 6px;border-bottom:1px solid #999;padding-bottom:2px}
    .cab{display:grid;grid-template-columns:repeat(4,1fr);gap:4px 16px;border:1px solid #999;padding:8px;margin-bottom:8px}.cab b{display:block;font-size:9px;text-transform:uppercase;color:#555}
    table{border-collapse:collapse;width:100%;margin-bottom:10px;page-break-inside:auto}th,td{border:1px solid #999;padding:2px 3px;text-align:center;vertical-align:top}th{background:#eee;font-size:9px}
    .freq td.al,.freq th.al{text-align:left;white-space:nowrap}.freq td.F{color:#b42318;font-weight:bold}.freq td.J{color:#9a6700;font-weight:bold}.n{width:22px}
    .reg td{text-align:left}.reg td.dt{white-space:nowrap}.obs{color:#555;font-style:italic;margin-top:2px}
    .res{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:6px}.res div{border:1px solid #999;padding:6px}.res b{font-size:16px;display:block}
    .leg{font-size:9px;color:#444}.ass{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:40px}.ass div{border-top:1px solid #111;text-align:center;padding-top:4px}tr{page-break-inside:avoid}`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Diário ${h(t.nome)} ${h(b ? b.nome : "")}</title><style>${css}</style></head><body>
    <h1>Diário de classe ${b ? "· " + h(b.nome) : ""}</h1>
    <div class="cab"><div><b>Escola</b>${h(escolaDe(t) || "—")}</div><div><b>Professor(a)</b>${h(S.nome)}</div><div><b>Turma</b>${h(t.nome)}${t.turno ? " · " + h(t.turno) : ""}</div><div><b>Componente</b>${h(t.disciplina)}</div>
      <div><b>Série</b>${h(t.serie || "—")}</div><div><b>Período</b>${fmtData(ini)} a ${fmtData(fim)}</div><div><b>Ano letivo</b>${h(t.ano || "")}</div><div><b>Alunos</b>${al.length}</div></div>
    ${resumo}
    <h2>Frequência</h2><p class="leg">• presente · F falta · J falta justificada</p>${tabFreq}
    <h2>Registro das aulas</h2>${reg}
    ${notas}
    <div class="ass"><div>Professor(a)</div><div>Coordenação pedagógica</div></div>
    <p class="leg">Gerado pelo Manu Professor em ${new Date().toLocaleDateString("pt-BR")}.</p></body></html>`;
  imprimir(html);
}

/* ----- Notas ----- */
function vNotas() {
  const t = turmaAtual();
  const head = `<div class="page-head"><div><h1>${S.notasGeral ? "Média geral" : "Notas"}</h1><p class="muted">${S.notasGeral ? "As médias de todos os bimestres, a média final e, embaixo, as notas de cada bimestre." : `Média ponderada pelos pesos. Abaixo de ${MEDIA_MIN} fica em destaque.`}</p></div><div class="toolbar">${t ? `<button class="btn" data-act="exp" data-fmt="arquivo" data-turma="${esc(t.id)}">${ico("dl")}Excel</button>${S.googleClientId ? `<button class="btn" data-act="exp" data-fmt="drive" data-turma="${esc(t.id)}">${ico("drive")}Google Planilhas</button>` : ""}<button class="btn primary" data-act="nova-avaliacao">${ico("plus")}Nova avaliação</button>` : ""}</div></div>`;
  if (!t) return head + semTurma();
  const bim = S.notasGeral ? "" : bimSelecionado(t), bs = bimestresDe(t);
  const avs = S.avaliacoes.filter(a => a.turmaId === t.id && (!bim || String(a.bimestre) === String(bim))).sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const al = t.alunos || [];
  if (bs.length && !bim) {
    const sits = al.map(s => ({ s, x: situacaoAno(t, s.id) }));
    const grupo = (lista, cls, tit, txt) => lista.length ? `<div class="sit-g ${cls}"><b>${tit} <span class="num">${lista.length}</span></b><div>${lista.map(({ s, x }) => `<span class="chip ${cls}">${esc(s.nome)}${txt ? " · " + txt(x) : ""}</span>`).join("")}</div></div>` : "";
    const resumo = sits.some(({ x }) => x.estado !== "sem") ? `<section class="panel sit-ano"><h2>Situação do ano</h2>
      ${grupo(sits.filter(({ x }) => x.estado === "exame"), "bad", "Exame final / recuperação final", x => x.faltam ? "não alcança 6 nem com 10 no que falta" : `média ${fmtNota(x.ms.reduce((a, b) => a + b, 0) / x.ms.length)}`)}
      ${grupo(sits.filter(({ x }) => x.estado === "andamento" && x.precisa > MEDIA_MIN), "warn", "Em risco: precisam de nota alta no que falta", x => `precisa de ${fmtNota(x.precisa)}`)}
      ${grupo(sits.filter(({ x }) => x.freqRisco), "bad", "Frequência abaixo de " + FREQ_MIN + "%", x => x.f + "%")}
      ${grupo(sits.filter(({ x }) => x.estado === "aprovado" || x.estado === "garantido"), "ok", "Aprovados ou com a média garantida", null)}</section>` : "";
    return head + chipsPeriodo(t) + resumo + `<div class="table-wrap"><table><thead><tr><th class="sticky-col">Aluno</th>${bs.map(b => `<th class="c">${esc(b.nome)}</th>`).join("")}<th class="c">Média final</th><th class="c">Freq. anual</th><th class="c">Situação</th></tr></thead><tbody>
      ${al.map(s => { const mf = mediaAnual(t, s.id), f = freqAluno(t, s.id);
        const sit = mf === null ? `<span class="chip">sem notas</span>` : (mf >= MEDIA_MIN && (f === null || f >= FREQ_MIN)) ? `<span class="chip ok">aprovado até aqui</span>` : (mf < MEDIA_MIN ? `<span class="chip warn">abaixo da média</span>` : `<span class="chip bad">frequência</span>`);
        return `<tr><td class="sticky-col">${esc(s.nome)}</td>${bs.map(b => { const m = mediaAluno(t, s.id, b.num); return `<td class="c num" style="color:${m !== null && m < MEDIA_MIN ? "var(--warn)" : "inherit"}">${fmtNota(m)}</td>`; }).join("")}<td class="c num" style="font-weight:700;color:${mf !== null && mf < MEDIA_MIN ? "var(--warn)" : "inherit"}">${fmtNota(mf)}</td><td class="c num" style="color:${f !== null && f < FREQ_MIN ? "var(--bad)" : "inherit"}">${f === null ? "—" : f + "%"}</td><td class="c">${sit}</td></tr>`; }).join("")}
      </tbody></table></div><p class="small muted">Média final = média das médias dos bimestres que já têm nota. Para lançar notas, toque no bimestre acima ou em "Lançar notas" abaixo.</p>
      ${bs.map(b => {
        const avsB = S.avaliacoes.filter(x => x.turmaId === t.id && String(x.bimestre) === String(b.num)).sort((x, y) => (x.data || "").localeCompare(y.data || ""));
        const mt = mediaTurma(t, b.num);
        return `<section class="panel notas-bim"><div class="panel-head"><div><h2>${esc(b.nome)}</h2><span class="small muted">${fmtData(b.inicio)} a ${fmtData(b.fim)} · ${avsB.length} ${avsB.length === 1 ? "avaliação" : "avaliações"}${mt !== null ? ` · média da turma ${fmtNota(mt)}` : ""}</span></div><button class="btn sm" data-act="bim-sel" data-v="${b.num}">${avsB.length ? "Editar notas" : "Lançar notas"}</button></div>
          ${avsB.length ? `<div class="table-wrap"><table><thead><tr><th class="sticky-col">Aluno</th>${avsB.map(x => `<th class="c">${esc(x.nome)}<div class="num" style="text-transform:none;font-weight:500">peso ${esc(x.peso)}</div></th>`).join("")}<th class="c">Média</th></tr></thead><tbody>
            ${al.map(s => { const m = mediaAluno(t, s.id, b.num); return `<tr><td class="sticky-col">${esc(s.nome)}</td>${avsB.map(x => { const v = x.notas?.[s.id]; return `<td class="c num" style="color:${v != null && v !== "" && Number(v) < MEDIA_MIN ? "var(--warn)" : "inherit"}">${v == null || v === "" ? "—" : fmtNota(v)}</td>`; }).join("")}<td class="c num" style="font-weight:700;color:${m !== null && m < MEDIA_MIN ? "var(--warn)" : "inherit"}">${fmtNota(m)}</td></tr>`; }).join("")}</tbody></table></div>` : `<p class="muted small">Nenhuma nota lançada neste bimestre.</p>`}</section>`;
      }).join("")}`;
  }
  if (!avs.length) return head + chipsPeriodo(t) + `<div class="empty"><img class="manu sm" src="/manu/manu-ajuda.webp" alt=""><h3>Nenhuma avaliação ${bim ? "no " + esc(bimPorNum(t, bim)?.nome || "") : "em " + esc(t.nome)}</h3><p>Crie uma prova, trabalho ou participação com o peso dela na média.${bim ? " Se o bimestre já passou e você só tem a média final de cada aluno, lance direto a média." : ""}</p><div class="toolbar" style="justify-content:center"><button class="btn primary" data-act="nova-avaliacao">${ico("plus")}Nova avaliação</button>${bim ? `<button class="btn" data-act="nota-media-bim">Já tenho a média do bimestre</button>` : ""}</div></div>`;
  const B = bim ? bimPorNum(t, bim) : null;
  // "Para passar": só faz sentido quando as médias dos outros bimestres já estão lançadas
  const temPara = B && al.some(s => precisaNoBim(t, s.id, bim) !== null);
  const rec = al.map(s => ({ s, m: mediaAluno(t, s.id, bim) })).filter(x => x.m !== null && x.m < MEDIA_MIN);
  const paraTxt = p => p === null ? "—" : p <= 0 ? `<span class="chip ok">já passou</span>` : p > 10 ? `<span class="chip bad">exame final</span>` : `<span class="chip ${p > MEDIA_MIN ? "warn" : ""} num">${fmtNota(p)}</span>`;
  const painel = rec.length ? `<section class="panel rec-aviso"><div class="rec-tit">${ico("notas")}<div><b>${rec.length} ${rec.length === 1 ? "aluno em recuperação" : "alunos em recuperação"}${B ? " no " + esc(B.nome) : ""}</b><span class="small muted">Média abaixo de ${MEDIA_MIN} com as notas lançadas até agora.</span></div></div>
    <div class="chips-esc">${rec.map(x => `<span class="chip warn">${esc(x.s.nome)} · ${fmtNota(x.m)}</span>`).join("")}</div></section>` : "";
  return head + chipsPeriodo(t) + painel + `<div class="table-wrap"><table>
    <thead><tr><th class="sticky-col">Aluno</th>${avs.map(a => `<th class="c"><button class="btn sm ghost" data-act="editar-avaliacao" data-id="${esc(a.id)}" title="Editar avaliação">${esc(a.nome)}</button><div class="num" style="text-transform:none">peso ${esc(a.peso)} · ${fmtData(a.data)}</div></th>`).join("")}<th class="c">Média</th><th class="c">Freq.</th><th class="c">Situação</th>${temPara ? `<th class="c" title="Média mínima neste bimestre para fechar o ano com ${MEDIA_MIN}">Para passar</th>` : ""}</tr></thead>
    <tbody>${al.map(s => { const m = mediaAluno(t, s.id, bim), f = freqAluno(t, s.id, bim);
      const sit = m === null ? `<span class="chip">sem notas</span>` : (m >= MEDIA_MIN && (f === null || f >= FREQ_MIN)) ? `<span class="chip ok">em dia</span>` : (m < MEDIA_MIN ? `<span class="chip warn">recuperação</span>` : `<span class="chip bad">frequência</span>`);
      return `<tr><td class="sticky-col">${esc(s.nome)}</td>${avs.map(a => { const n = a.notas?.[s.id]; return `<td class="c"><input class="grade" type="text" inputmode="decimal" aria-label="Nota de ${esc(s.nome)} em ${esc(a.nome)}" data-av="${esc(a.id)}" data-aluno="${esc(s.id)}" value="${n === undefined || n === null ? "" : esc(String(n).replace(".", ","))}"></td>`; }).join("")}
      <td class="c num" style="font-weight:600;color:${m !== null && m < MEDIA_MIN ? "var(--warn)" : "inherit"}">${fmtNota(m)}</td><td class="c num" style="color:${f !== null && f < FREQ_MIN ? "var(--bad)" : "inherit"}">${f === null ? "—" : f + "%"}</td><td class="c">${sit}</td>${temPara ? `<td class="c">${paraTxt(precisaNoBim(t, s.id, bim))}</td>` : ""}</tr>`; }).join("")}</tbody></table></div>
    ${temPara ? `<p class="small muted"><b>Para passar</b>: a média que o aluno precisa neste bimestre para fechar o ano com ${MEDIA_MIN}, contando as médias dos outros bimestres.</p>` : ""}
    <p class="small muted">Digite a nota de 0 a 10 e saia do campo para salvar. Use vírgula ou ponto.</p>`;
}

/* ----- Planejamento ----- */
function vPlanos() {
  const t = turmaAtual();
  const lista = S.planos.filter(p => !t || p.turmaId === t.id).sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const head = `<div class="page-head"><div><h1>Planejamento</h1><p class="muted">Planos de aula de ${esc(t ? t.nome : "todas as turmas")}, com habilidades da BNCC.</p></div><div class="toolbar"><button class="btn" data-act="novo-plano">${ico("plus")}Plano em branco</button><button class="btn ai" data-act="novo-plano-ia">${ico("spark")}Criar com IA</button></div></div>`;
  if (!S.turmas.length) return head + semTurma();
  if (!lista.length) return head + `<div class="empty"><img class="manu sm" src="/manu/manu-ajuda.webp" alt=""><h3>Nenhum plano de aula ainda</h3><p>Diga o tema e a Manu monta objetivos, sequência didática, recursos e avaliação. Você revisa e salva.</p><button class="btn ai" data-act="novo-plano-ia">${ico("spark")}Criar com IA</button></div>`;
  const d0 = hoje();
  return head + `<div class="cards">${lista.map(p => { const tt = turma(p.turmaId); return `<article class="card"><div class="card-top"><div style="min-width:0"><span class="eyebrow">${fmtData(p.data)} · ${esc(tt?.nome || "")}</span><h3>${esc(p.titulo)}</h3></div><span class="chip ${p.status === "dada" ? "ok" : p.data < d0 ? "warn" : "acc"}">${p.status === "dada" ? "aula dada" : p.data < d0 ? "pendente" : "planejado"}</span></div>
    <p class="small muted" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(p.objetivos || "")}</p>
    <div class="meta">${p.bncc ? p.bncc.split(/[,;\s]+/).filter(Boolean).map(c => `<span class="bncc">${esc(c)}</span>`).join("") : ""}${p.duracao ? `<span class="chip">${esc(p.duracao)}</span>` : ""}</div>
    <div class="toolbar"><button class="btn sm" data-act="ver-plano" data-id="${esc(p.id)}">Abrir</button><button class="btn sm ghost" data-act="editar-plano" data-id="${esc(p.id)}">Editar</button></div></article>`; }).join("")}</div>`;
}

/* ----- Atividades ----- */
function vAtividades() {
  const t = turmaAtual();
  const head = `<div class="page-head"><div><h1>Atividades e entregas</h1><p class="muted">Tarefas com prazo e controle de quem entregou.</p></div><div class="toolbar"><button class="btn primary" data-act="nova-atividade">${ico("plus")}Nova atividade</button></div></div>`;
  if (!t) return head + semTurma();
  const lista = S.atividades.filter(a => a.turmaId === t.id).sort((a, b) => (b.prazo || "").localeCompare(a.prazo || ""));
  if (!lista.length) return head + `<div class="empty"><img class="manu sm" src="/manu/manu-agenda.webp" alt=""><h3>Nenhuma atividade em ${esc(t.nome)}</h3><p>Crie uma tarefa, descreva o que os alunos devem fazer (a IA ajuda) e marque as entregas.</p><button class="btn primary" data-act="nova-atividade">${ico("plus")}Nova atividade</button></div>`;
  const n = (t.alunos || []).length, d0 = hoje();
  return head + lista.map(a => { const e = (t.alunos || []).filter(s => a.entregas?.[s.id]).length; const pct = n ? Math.round(e / n * 100) : 0; return `<section class="panel">
    <div class="panel-head"><div style="min-width:0"><span class="eyebrow">Prazo ${fmtData(a.prazo)}${a.valor ? " · vale " + esc(a.valor) + " ponto(s)" : ""}</span><h2>${esc(a.titulo)}</h2></div>
    <div class="toolbar"><span class="chip ${a.prazo < d0 ? (e < n ? "bad" : "ok") : "acc"}">${a.prazo < d0 ? "encerrada" : "aberta"}</span><span class="small num">${e}/${n} entregues</span><button class="btn sm" data-act="editar-atividade" data-id="${esc(a.id)}">Editar</button></div></div>
    <p style="white-space:pre-wrap">${esc(a.descricao || "")}</p>
    <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
    <details><summary class="small" style="cursor:pointer;font-weight:600">Marcar entregas</summary>
      <div class="grid2" style="margin-top:8px">${(t.alunos || []).map(s => `<label class="check" style="border:0;padding:4px 0"><input type="checkbox" data-act="entrega" data-id="${esc(a.id)}" data-aluno="${esc(s.id)}" ${a.entregas?.[s.id] ? "checked" : ""}><span>${esc(s.nome)}</span></label>`).join("")}</div>
    </details></section>`; }).join("");
}

/* ----- Banco de questões ----- */
const DIF = { facil: "Fácil", media: "Média", dificil: "Difícil" };
const TIPO = { multipla: "Múltipla escolha", vf: "Verdadeiro ou falso", aberta: "Dissertativa" };
function questaoHTML(q, idx, gabarito = true) {
  const letras = "ABCDE";
  return `<div class="q">${idx != null ? `<b>${idx}.</b> ` : ""}<span style="white-space:pre-wrap">${esc(q.enunciado)}</span>
    ${(q.imagens || []).filter(u => /^https:\/\//.test(u)).map(u => `<img class="q-img" src="${esc(u)}" alt="Figura da questão">`).join("")}
    ${q.tipo !== "aberta" && q.alternativas?.length ? `<ol type="A">${q.alternativas.map((alt, i) => `<li class="${gabarito && i === q.correta ? "correct" : ""}">${esc(alt)}${q.altImgs?.[i] && /^https:\/\//.test(q.altImgs[i]) ? `<img class="q-img" src="${esc(q.altImgs[i])}" alt="Alternativa">` : ""}</li>`).join("")}</ol>` : ""}
    ${q.fonte ? `<p class="small muted fonte">Fonte: ${esc(q.fonte)}</p>` : ""}
    ${gabarito && q.tipo === "aberta" && q.resposta ? `<p class="small" style="color:var(--ok)"><b>Resposta esperada:</b> ${esc(q.resposta)}</p>` : ""}
    ${gabarito && q.tipo !== "aberta" && q.correta != null ? `<p class="small" style="color:var(--ok)"><b>Gabarito:</b> ${letras[q.correta] || ""}</p>` : ""}</div>`;
}
function vQuestoes() {
  const f = S.filtroQ;
  const discs = [...new Set(S.questoes.map(q => q.disciplina).filter(Boolean))].sort();
  const lista = S.questoes.filter(q => (!f.disc || q.disciplina === f.disc) && (!f.dif || q.dificuldade === f.dif) && (!f.txt || (q.enunciado + " " + q.tema).toLowerCase().includes(f.txt.toLowerCase())));
  const head = `<div class="page-head"><div><h1>Banco de questões</h1><p class="muted">${S.questoes.length} questões guardadas para montar provas.</p></div><div class="toolbar"><button class="btn" data-act="nova-questao">${ico("plus")}Nova questão</button><a class="btn" href="${lk("enem")}">Banco do Enem</a><button class="btn ai" data-act="gerar-questoes">${ico("spark")}Gerar com IA</button></div></div>`;
  if (!S.questoes.length) return head + `<div class="empty"><img class="manu sm" src="/manu/manu-ajuda.webp" alt=""><h3>Seu banco está vazio</h3><p>Peça à Manu questões sobre um tema ou pegue questões oficiais do Enem.</p><div class="toolbar" style="justify-content:center"><a class="btn" href="${lk("enem")}">Banco do Enem</a><button class="btn ai" data-act="gerar-questoes">${ico("spark")}Gerar com IA</button></div></div>`;
  return head + `<section class="panel"><div class="toolbar">
      <div class="field" style="flex:1;min-width:180px"><label for="fTxt">Buscar</label><input class="input" type="search" id="fTxt" value="${esc(f.txt)}" placeholder="Tema ou trecho do enunciado"></div>
      <div class="field"><label for="fDisc">Disciplina</label><select class="input" id="fDisc"><option value="">Todas</option>${discs.map(d => `<option ${f.disc === d ? "selected" : ""}>${esc(d)}</option>`).join("")}</select></div>
      <div class="field"><label for="fDif">Dificuldade</label><select class="input" id="fDif"><option value="">Todas</option>${Object.entries(DIF).map(([k, v]) => `<option value="${k}" ${f.dif === k ? "selected" : ""}>${v}</option>`).join("")}</select></div></div>
    <div class="list">${lista.map(q => `<div class="row" style="align-items:flex-start"><div class="grow">${questaoHTML(q, null)}<div class="toolbar" style="margin-top:6px"><span class="chip">${esc(q.disciplina)}</span><span class="chip">${esc(q.tema)}</span><span class="chip">${esc(TIPO[q.tipo] || q.tipo)}</span><span class="chip ${q.dificuldade === "dificil" ? "bad" : q.dificuldade === "media" ? "warn" : "ok"}">${esc(DIF[q.dificuldade] || "")}</span>${q.bncc ? `<span class="bncc">${esc(q.bncc)}</span>` : ""}</div></div>
      <div class="toolbar" style="flex-direction:column"><button class="btn sm" data-act="editar-questao" data-id="${esc(q.id)}">Editar</button></div></div>`).join("") || `<p class="muted">Nenhuma questão com esses filtros.</p>`}</div></section>`;
}

/* ----- Provas ----- */
function vProvas() {
  const head = `<div class="page-head"><div><h1>Provas</h1><p class="muted">Monte provas com questões do banco e baixe com gabarito.</p></div><div class="toolbar"><button class="btn primary" data-act="nova-prova">${ico("plus")}Nova prova</button></div></div>`;
  const provasT = S.provas.filter(p => !S.dentroTurma || p.turmaId === S.turmaSel);
  if (!provasT.length) return head + `<div class="empty"><img class="manu sm" src="/manu/manu-agenda.webp" alt=""><h3>Nenhuma prova montada</h3><p>${S.questoes.length ? "Escolha questões do seu banco para montar a primeira." : "Primeiro guarde algumas questões no banco, depois monte a prova."}</p><button class="btn primary" data-act="${S.questoes.length ? "nova-prova" : "ir"}" data-view="questoes">${S.questoes.length ? "Nova prova" : "Ir ao banco de questões"}</button></div>`;
  return head + `<div class="cards">${provasT.map(p => { const t = turma(p.turmaId); return `<article class="card"><span class="eyebrow">${fmtData(p.data)} · ${esc(t?.nome || "Sem turma")}</span><h3>${esc(p.titulo)}</h3><p class="small muted">${(p.questaoIds || []).length} questões</p><div class="toolbar"><button class="btn sm" data-act="ver-prova" data-id="${esc(p.id)}">Visualizar</button><button class="btn sm ghost" data-act="editar-prova" data-id="${esc(p.id)}">Editar</button><button class="btn sm ghost" data-act="corrigir-foto" data-id="${esc(p.id)}">Corrigir por foto</button></div>${p.correcoes && Object.keys(p.correcoes).length ? `<span class="small muted">${Object.keys(p.correcoes).length} de ${(t?.alunos || []).length} corrigidas</span>` : ""}</article>`; }).join("")}</div>`;
}

/* ----- Assistente ----- */
function vAssistente() {
  const sugest = ["Sugira uma dinâmica de 10 minutos para começar a aula", "Como adaptar uma atividade para um aluno com TDAH?", "Escreva um bilhete para os responsáveis sobre a feira de ciências", "Ideias de avaliação formativa para minha turma"];
  return `<div class="page-head"><div><div class="hello"><img src="/manu/manu-ajuda.webp" alt=""><div><h1>Fale com a Manu</h1><p class="muted">Sua assistente pedagógica. Ela conhece o nome, a série e a disciplina das suas turmas, mas não vê os nomes dos alunos.</p></div></div></div>${S.chat.length ? `<button class="btn ghost" data-act="limpar-chat">Nova conversa</button>` : ""}</div>
  ${!cap.ia ? `<div class="banner"><b>IA ainda não configurada.</b><span>O administrador precisa definir a chave da Anthropic (ANTHROPIC_API_KEY) no servidor.</span></div>` : ""}
  <section class="panel"><div class="chat" id="chatLog">${S.chat.length ? S.chat.map(m => `<div class="msg ${m.role === "user" ? "user" : "bot"}">${esc(m.content)}</div>`).join("") : `<div class="muted">Comece com uma pergunta ou escolha uma sugestão:</div><div class="suggest">${sugest.map(s => `<button class="btn sm" data-act="sugestao" data-txt="${esc(s)}">${esc(s)}</button>`).join("")}</div>`}</div>
  <form class="chat-form" id="chatForm"><textarea class="input" id="chatInput" placeholder="Pergunte algo sobre suas aulas…" ${cap.ia ? "" : "disabled"}></textarea><button class="btn primary" id="chatSend" ${cap.ia ? "" : "disabled"}>Enviar</button></form></section>`;
}

/* ---------- diálogos ---------- */
const dlg = $("#dlg");
function abrirDlg(titulo, corpo, rodape) {
  dlg.innerHTML = `<form class="dlg" method="dialog" id="dlgForm"><div class="dlg-head"><h2>${titulo}</h2><button type="button" class="btn ghost sm" data-act="fechar" aria-label="Fechar">${ico("x")}</button></div><div class="dlg-body">${corpo}</div><div class="dlg-foot">${rodape}</div></form>`;
  if (!dlg.open) dlg.showModal();
}
const fechar = () => { if (sampleCtl) sampleCtl.abort(); dlg.close(); };
const val = id => { const el = dlg.querySelector("#" + id); return el ? el.value.trim() : ""; };
// Professor que dá aula em mais de uma escola: cada turma guarda a sua escola
const escolaPrincipal = () => (S.escolas || [])[0] || S.escola || "";
const escolaDe = t => (t && t.escola) || escolaPrincipal();
const escolas = () => [...new Set([...(S.escolas || []), ...S.turmas.map(escolaDe)].filter(Boolean))];
const variasEscolas = () => escolas().length > 1;
const rotuloTurma = t => `${t.nome} · ${t.disciplina}${variasEscolas() && escolaDe(t) ? " · " + escolaDe(t) : ""}`;
const turmaOpts = sel => S.turmas.map(t => `<option value="${esc(t.id)}" ${sel === t.id ? "selected" : ""}>${esc(rotuloTurma(t))}</option>`).join("");

// Séries da Educação Infantil ao Ensino Médio
const SERIES = [
  { id: "ei", etapa: "Educação Infantil", itens: [["Berçário", "Berçário (EI)"], ["Maternal I", "Maternal I (EI)"], ["Maternal II", "Maternal II (EI)"], ["Pré I", "Pré I (EI)"], ["Pré II", "Pré II (EI)"]] },
  { id: "ef1", etapa: "Ensino Fundamental · Anos iniciais", itens: [1, 2, 3, 4, 5].map(n => [`${n}º ano`, `${n}º ano EF`]) },
  { id: "ef2", etapa: "Ensino Fundamental · Anos finais", itens: [6, 7, 8, 9].map(n => [`${n}º ano`, `${n}º ano EF`]) },
  { id: "em", etapa: "Ensino Médio", itens: [1, 2, 3].map(n => [`${n}ª série`, `${n}ª série EM`]) },
  { id: "eja", etapa: "EJA", itens: [["EJA Fundamental", "EJA EF"], ["EJA Médio", "EJA EM"]] },
  { id: "outro", etapa: "Outros", itens: [["Reforço escolar", "Reforço escolar"], ["Curso técnico", "Curso técnico"], ["Curso livre", "Curso livre"], ["Educação Especial (AEE)", "AEE"]] },
];
const ETAPAS = [["ei", "Educação Infantil"], ["ef1", "Fundamental · Anos iniciais"], ["ef2", "Fundamental · Anos finais"], ["em", "Ensino Médio"], ["eja", "EJA"], ["outro", "Outro (reforço, técnico, AEE…)"]];
// séries que aparecem na lista da turma: só as etapas do perfil (ou todas, se não marcou nenhuma)
const seriesVisiveis = todas => todas || !(S.etapas || []).length ? SERIES.filter(g => g.id !== "outro" || (S.etapas || []).includes("outro") || todas) : SERIES.filter(g => S.etapas.includes(g.id));
const COMPONENTES = {
  ei: ["O eu, o outro e o nós", "Corpo, gestos e movimentos", "Traços, sons, cores e formas", "Escuta, fala, pensamento e imaginação", "Espaços, tempos, quantidades, relações e transformações", "Polivalente (todos os campos)"],
  ef1: ["Polivalente", "Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia", "Arte", "Educação Física", "Ensino Religioso", "Língua Inglesa"],
  ef2: ["Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia", "Arte", "Educação Física", "Língua Inglesa", "Ensino Religioso"],
  em: ["Língua Portuguesa", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Filosofia", "Sociologia", "Arte", "Educação Física", "Língua Inglesa", "Língua Espanhola", "Projeto de Vida", "Itinerário formativo"],
};
COMPONENTES.eja = [...new Set([...COMPONENTES.ef2, ...COMPONENTES.em])];
COMPONENTES.outro = ["Reforço de Língua Portuguesa", "Reforço de Matemática", "Atendimento Educacional Especializado"];
function etapaDaSerie(serie) { const s = String(serie || ""); return /\(EI\)|infantil|ber[çc]|maternal|pr[ée]/i.test(s) ? "ei" : /EJA/i.test(s) ? "eja" : /EM\b|m[ée]dio|s[ée]rie/i.test(s) ? "em" : /^[1-5]º/.test(s) ? "ef1" : /^[6-9]º/.test(s) ? "ef2" : ""; }
const componentesPara = e => e ? COMPONENTES[e] : [...new Set(Object.values(COMPONENTES).flat())];
const TURNOS = ["", "Matutino", "Vespertino", "Noturno", "Integral"];
const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "Única"];
function nomeComposto() {
  const c = dlg._tn || {}, ls = c.letras || [];
  if (!c.nome) return "";
  return ls.includes("Única") ? `${c.nome} (turma única)` : ls.length ? `${c.nome} ${ls.join(", ")}` : c.nome;
}
function compoeNomeTurma() {
  const c = dlg._tn || {}; if (!c.nome) return;
  dlg.querySelector("#tNome").value = nomeComposto();
  dlg.querySelectorAll(".tn-op[data-act='tn-serie']").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.nome === c.nome)));
  dlg.querySelectorAll(".tn-letra").forEach(b => b.setAttribute("aria-pressed", String((c.letras || []).includes(b.dataset.v))));
  renderTurnos();
}
// Várias turmas da mesma série: um turno para cada letra
function renderTurnos() {
  const c = dlg._tn || {}, ls = (c.letras || []).filter(l => l !== "Única"), box = dlg.querySelector("#tnTurnos"), campo = dlg.querySelector("#tTurno")?.closest(".field");
  if (!box) return;
  const cor = dlg.querySelector('input[name="tCor"]')?.closest(".field");
  if (ls.length < 2) { box.innerHTML = ""; if (campo) campo.hidden = false; if (cor) cor.hidden = false; return; }
  if (campo) campo.hidden = true; if (cor) cor.hidden = true;
  c.turnos = c.turnos || {};
  const padrao = dlg.querySelector("#tTurno").value || "Matutino";
  box.innerHTML = `<div class="tn-multi"><b>Vão ser criadas ${ls.length} turmas, cada uma com sua cor. Escolha o turno de cada uma:</b>${ls.map(l => { c.turnos[l] = c.turnos[l] || padrao;
    return `<label class="tn-turno"><span>${esc(c.nome)} ${l}</span><select class="input tn-tsel" data-letra="${l}" aria-label="Turno da turma ${l}">${TURNOS.filter(Boolean).map(x => `<option ${c.turnos[l] === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>`; }).join("")}</div>`;
}
document.addEventListener("change", e => { if (e.target.classList.contains("tn-tsel") && dlg._tn) dlg._tn.turnos[e.target.dataset.letra] = e.target.value; });
function abrirPopTurma(abrir) { const p = dlg.querySelector("#tnPop"), i = dlg.querySelector("#tNome"); if (!p) return; p.hidden = !abrir; i.setAttribute("aria-expanded", String(abrir)); }
document.addEventListener("focusin", e => { if (e.target.id === "tNome") abrirPopTurma(true); });
document.addEventListener("click", e => {
  if (e.target.id === "tNome") { abrirPopTurma(true); return; }
  const b = e.target.closest("[data-act='tn-serie'],[data-act='tn-letra'],[data-act='tn-ok']");
  if (!b) return;
  dlg._tn = dlg._tn || {};
  if (b.dataset.act === "tn-serie") {
    dlg._tn.nome = b.dataset.nome; if (!(dlg._tn.letras || []).length) dlg._tn.letras = ["A"];
    const se = dlg.querySelector("#tSerie"); se.value = b.dataset.serie;
    dlg.querySelector("#tDiscLista").innerHTML = [...new Set([...(S.disciplinas || []), ...componentesPara(b.dataset.etapa)])].map(c => `<option value="${esc(c)}">`).join("");
    const disc = dlg.querySelector("#tDisc"); if (b.dataset.etapa === "ei" && disc?.tagName === "INPUT" && !disc.value) disc.value = "Polivalente (todos os campos)";
    compoeNomeTurma();
  } else if (b.dataset.act === "tn-letra") {
    const v = b.dataset.v, editando = S.turmas.some(x => x.id === dlg._obj?.id);
    let ls = (dlg._tn.letras || []).filter(l => l !== "Única");
    if (editando || v === "Única") ls = [v];
    else ls = ls.includes(v) ? ls.filter(l => l !== v) : [...ls, v].sort((a, c) => LETRAS.indexOf(a) - LETRAS.indexOf(c));
    dlg._tn.letras = ls; if (!dlg._tn.nome) { toast("Escolha primeiro a série."); return; } compoeNomeTurma();
  }
  else { abrirPopTurma(false); (dlg.querySelector("#tDisc") || dlg.querySelector('input[name="tDiscs"]'))?.focus(); }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && dlg.open && !dlg.querySelector("#tnPop")?.hidden) { e.preventDefault(); abrirPopTurma(false); } });
// fecha a lista ao tocar fora dela (no início do toque, para não brigar com o foco no campo)
document.addEventListener("pointerdown", e => {
  if (!dlg.open || !dlg.querySelector("#tnPop") || dlg.querySelector("#tnPop").hidden || e.target.closest(".tn-campo, .tn-pop")) return;
  // num botão (ex.: Salvar turma), fecha só depois do clique, senão o botão sai do lugar e o clique se perde
  if (e.target.closest("button")) document.addEventListener("click", () => abrirPopTurma(false), { once: true }); else abrirPopTurma(false);
});

function campoEscola(atual) {
  const es = escolas();
  if (!es.length) return `<div class="field"><label for="tEscola">Escola</label><input class="input" id="tEscola" value="${esc(atual)}" placeholder="Nome da escola desta turma" autocomplete="off"><small class="muted">Cadastre suas escolas em <a href="#perfil" data-act="fechar">Meu perfil</a> para escolher na lista.</small></div>`;
  const outra = atual && !es.includes(atual);
  return `<div class="field"><label for="tEscolaSel">Escola</label><select class="input" id="tEscolaSel">${es.map(e => `<option ${e === atual ? "selected" : ""}>${esc(e)}</option>`).join("")}<option value="__nova" ${outra ? "selected" : ""}>+ Outra escola…</option></select>
    <input class="input" id="tEscola" value="${esc(atual || es[0])}" placeholder="Nome da outra escola" autocomplete="off" ${outra ? "" : "hidden"} style="margin-top:8px"></div>`;
}
document.addEventListener("change", e => {
  if (e.target.id !== "tEscolaSel") return;
  const i = document.getElementById("tEscola"), nova = e.target.value === "__nova";
  i.hidden = !nova; i.value = nova ? "" : e.target.value; if (nova) i.focus();
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act='t-disc']"); if (!b) return;
  document.getElementById("tDisc").value = b.dataset.v;
  b.parentElement.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
});
function gruposSeries(todas) {
  const gs = seriesVisiveis(todas), filtrado = gs.length < SERIES.length;
  return gs.map(g => `<div class="tn-grupo"><b>${g.etapa}</b><div class="tn-ops">${g.itens.map(([nome, serie]) => `<button type="button" class="tn-op" data-act="tn-serie" data-nome="${esc(nome)}" data-serie="${esc(serie)}" data-etapa="${g.id}" aria-pressed="${dlg._tn?.nome === nome}">${esc(nome)}</button>`).join("")}</div></div>`).join("")
    + (filtrado ? `<button type="button" class="link-btn small" data-act="tn-todas">Mostrar todas as etapas</button>` : "");
}
document.addEventListener("click", e => { const b = e.target.closest("[data-act='tn-todas']"); if (!b) return; document.getElementById("tnSeries").innerHTML = gruposSeries(true); });
function escolherEscolaDlg(nome) {
  const sel = document.getElementById("tEscolaSel"), i = document.getElementById("tEscola"); if (!i) return;
  i.value = nome; if (!sel) return;
  const tem = [...sel.options].some(o => o.value === nome); sel.value = tem ? nome : "__nova"; i.hidden = tem;
}
function dlgExcluirTurma(tid) {
  const t = turma(tid); if (!t) return; dlg._excluir = tid;
  const n = col => S[col].filter(x => x.turmaId === tid).length;
  const itens = [[(t.alunos || []).length, "alunos"], [n("chamadas"), "chamadas"], [n("avaliacoes"), "avaliações e notas"], [n("planos"), "planos de aula"], [n("atividades"), "atividades"], [n("provas"), "provas"], [n("materiais"), "materiais"], [n("slides"), "slides"]].filter(x => x[0]);
  abrirDlg(`Excluir ${esc(t.nome)}?`, `<p><b>${esc(rotuloTurma(t))}</b></p>
    ${itens.length ? `<p>Também serão apagados desta turma:</p><ul>${itens.map(([q, o]) => `<li><b class="num">${q}</b> ${o}</li>`).join("")}</ul>` : `<p class="muted">A turma está vazia.</p>`}
    <p class="small muted">As questões do banco não são apagadas. Arquivos já salvos no seu Google Drive continuam lá. ${S.admin ? "" : "Se excluir por engano, peça ao administrador para recuperar pelo backup diário."}</p>
    <label class="check" style="border:0"><input type="checkbox" id="exConf"><span>Entendo que a turma e tudo dela serão apagados</span></label>`,
    `<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn danger" data-act="excluir-turma-ok" disabled id="exOk">Excluir turma</button>`);
}
document.addEventListener("change", e => { if (e.target.id === "exConf") document.getElementById("exOk").disabled = !e.target.checked; });
// disciplinas marcadas no cadastro (várias) ou a escolhida/digitada (uma)
function discsEscolhidas() { const cs = [...dlg.querySelectorAll('input[name="tDiscs"]:checked')].map(x => x.value); return cs.length || dlg.querySelector('input[name="tDiscs"]') ? cs : [val("tDisc")].filter(Boolean); }
// a mesma turma em outras disciplinas (mesmo nome, escola e ano): compartilham a lista de alunos
const irmasDe = t => S.turmas.filter(o => o.id !== t.id && o.nome === t.nome && escolaDe(o) === escolaDe(t) && String(o.ano || "") === String(t.ano || ""));
function dlgTurma(t) {
  t = t || { id: uid(), nome: "", disciplina: (S.disciplinas || []).length === 1 ? S.disciplinas[0] : "", serie: "", ano: String(new Date().getFullYear()), turno: "", cor: CORES[S.turmas.length % CORES.length], alunos: [] };
  dlg._obj = t; dlg._tn = {};
  abrirDlg(t.nome ? "Editar turma" : "Nova turma", `
    <div class="grid2"><div class="field tn-campo"><label for="tNome">Nome da turma</label><input class="input" id="tNome" required value="${esc(t.nome)}" placeholder="Escolha a série e a turma" autocomplete="off" aria-haspopup="listbox" aria-expanded="false" aria-controls="tnPop">
</div>
    <div class="field"><label for="tDisc">Disciplina</label>${!S.turmas.some(x => x.id === t.id) && (S.disciplinas || []).length > 1
      ? `<div class="disc-ops" role="group" aria-label="Disciplinas desta turma">${S.disciplinas.map((d, i) => `<label class="check"><input type="checkbox" name="tDiscs" value="${esc(d)}" ${i === 0 ? "checked" : ""}><span>${esc(d)}</span></label>`).join("")}</div><small class="muted">Dá aula de mais de uma nesta turma? Marque todas: cada uma ganha seu diário e suas notas, com a mesma lista de alunos.</small><datalist id="tDiscLista" hidden>`
      : (S.disciplinas || []).length
      ? `<select class="input" id="tDisc" required>${(t.disciplina && !S.disciplinas.includes(t.disciplina) ? [t.disciplina, ...S.disciplinas] : S.disciplinas).map(d => `<option ${t.disciplina === d ? "selected" : ""}>${esc(d)}</option>`).join("")}</select><small class="muted">Só as disciplinas do <a href="#perfil" data-act="fechar">Meu perfil</a>. Para outra, acrescente lá.</small><datalist id="tDiscLista" hidden>`
      : `<input class="input" id="tDisc" required value="${esc(t.disciplina)}" placeholder="Língua Portuguesa" list="tDiscLista" autocomplete="off"><datalist id="tDiscLista">`}${[...new Set([...(S.disciplinas || []), ...componentesPara(etapaDaSerie(t.serie))])].map(c => `<option value="${esc(c)}">`).join("")}</datalist></div></div>
<div class="tn-pop" id="tnPop" hidden role="dialog" aria-label="Escolher série e turma"><div id="tnSeries">${gruposSeries(false)}</div>
        <div class="tn-grupo"><b>Turma <span class="tn-dica">${S.turmas.some(x => x.id === t.id) ? "" : "· marque várias para criar todas de uma vez"}</span></b><div class="tn-ops">${["A", "B", "C", "D", "E", "F", "G", "Única"].map(l => `<button type="button" class="tn-op tn-letra" data-act="tn-letra" data-v="${l}">${l}</button>`).join("")}</div></div>
        <div class="tn-fim"><span class="small muted">Ou digite o nome que quiser.</span><button type="button" class="btn sm primary" data-act="tn-ok">Pronto</button></div></div>
    ${campoEscola(escolaDe(t))}
    <div class="grid3"><div class="field"><label for="tSerie">Série / etapa</label><input class="input" id="tSerie" value="${esc(t.serie)}" placeholder="7º ano EF"></div>
    <div class="field"><label for="tAno">Ano letivo</label><input class="input" id="tAno" value="${esc(t.ano)}"></div>
    <div class="field"><label for="tTurno">Turno</label><select class="input" id="tTurno">${[...TURNOS, ...(t.turno && !TURNOS.includes(t.turno) ? [t.turno] : [])].map(x => `<option ${t.turno === x ? "selected" : ""}>${x}</option>`).join("")}</select></div></div>
    <div id="tnTurnos"></div>
    <div class="field"><label>Cor</label><div class="toolbar">${CORES.map(c => `<label style="cursor:pointer"><input type="radio" name="tCor" value="${c}" ${t.cor === c ? "checked" : ""} style="accent-color:${c}"> <span class="dot" style="display:inline-block;background:${c}"></span></label>`).join("")}</div></div>
    <p class="small muted">Os alunos são cadastrados depois, na aba Alunos do painel da turma.</p>`,
    `${S.turmas.some(x => x.id === t.id) ? `<button type="button" class="btn danger" data-act="apagar-turma" style="margin-right:auto">Apagar turma</button>` : ""}<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="salvar-turma">Salvar turma</button>`);
}

function dlgPlano(p, comIA) {
  const t = turmaAtual();
  p = p || { id: uid(), turmaId: t?.id || "", data: hoje(), titulo: "", duracao: "1 aula de 50 min", bncc: "", objetivos: "", conteudo: "", metodologia: "", recursos: "", avaliacao: "", status: "planejado" };
  dlg._obj = p;
  abrirDlg(S.planos.some(x => x.id === p.id) ? "Editar plano de aula" : "Novo plano de aula", `
    ${comIA ? `<div class="ai-box"><div class="grid2"><div class="field"><label for="iaTema">Tema da aula</label><input class="input" id="iaTema" placeholder="Ex.: Frações equivalentes"></div><div class="field"><label for="iaExtra">Detalhes (opcional)</label><input class="input" id="iaExtra" placeholder="Turma agitada, sem projetor, 2 aulas…"></div></div>
      <div class="toolbar"><button type="button" class="btn ai" data-act="ia-plano">${ico("spark")}Gerar plano</button><button type="button" class="btn ghost sm" data-act="parar-ia" hidden id="iaStop">Parar</button><span class="ai-status" id="iaStatus">A IA preenche os campos abaixo. Você revisa antes de salvar.</span></div></div>` : ""}
    <div class="grid3"><div class="field"><label for="pTurma">Turma</label><select class="input" id="pTurma">${turmaOpts(p.turmaId)}</select></div>
    <div class="field"><label for="pData">Data</label><input class="input" type="date" id="pData" value="${esc(p.data)}"></div>
    <div class="field"><label for="pDur">Duração</label><input class="input" id="pDur" value="${esc(p.duracao)}"></div></div>
    <div class="grid2"><div class="field"><label for="pTitulo">Título</label><input class="input" id="pTitulo" value="${esc(p.titulo)}"></div>
    <div class="field"><label for="pBncc">Habilidades BNCC</label><input class="input" id="pBncc" value="${esc(p.bncc)}" placeholder="EF06MA07, EF06MA08"></div></div>
    <div class="field"><label for="pObj">Objetivos de aprendizagem</label><textarea class="input" id="pObj" rows="3">${esc(p.objetivos)}</textarea></div>
    <div class="field"><label for="pCont">Conteúdos</label><textarea class="input" id="pCont" rows="2">${esc(p.conteudo)}</textarea></div>
    <div class="field"><label for="pMet">Metodologia / sequência didática</label><textarea class="input" id="pMet" rows="6">${esc(p.metodologia)}</textarea></div>
    <div class="grid2"><div class="field"><label for="pRec">Recursos</label><textarea class="input" id="pRec" rows="3">${esc(p.recursos)}</textarea></div>
    <div class="field"><label for="pAval">Avaliação</label><textarea class="input" id="pAval" rows="3">${esc(p.avaliacao)}</textarea></div></div>
    <label class="check" style="border:0"><input type="checkbox" id="pDada" ${p.status === "dada" ? "checked" : ""}><span>Aula já foi dada</span></label>`,
    `${S.planos.some(x => x.id === p.id) ? `<button type="button" class="btn danger" data-act="apagar-plano" style="margin-right:auto">Apagar</button>` : ""}<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="salvar-plano">Salvar plano</button>`);
}

function dlgVerPlano(p) {
  const t = turma(p.turmaId);
  const sec = (h, v) => v ? `<div class="sec"><h3>${h}</h3><div>${esc(v)}</div></div>` : "";
  abrirDlg(esc(p.titulo), `<div class="doc" style="border:0;padding:0">
    <div class="toolbar"><span class="chip">${esc(t?.nome || "")}</span><span class="chip">${esc(fmtDataLonga(p.data))}</span><span class="chip">${esc(p.duracao || "")}</span>${(p.bncc || "").split(/[,;\s]+/).filter(Boolean).map(c => `<span class="bncc">${esc(c)}</span>`).join("")}</div>
    ${sec("Objetivos", p.objetivos)}${sec("Conteúdos", p.conteudo)}${sec("Metodologia", p.metodologia)}${sec("Recursos", p.recursos)}${sec("Avaliação", p.avaliacao)}</div>`,
    `<button type="button" class="btn ai" data-act="sl-do-plano" data-id="${esc(p.id)}">${ico("spark")}Gerar slides</button>${botoesExport(`data-plano="${esc(p.id)}"`)}<button type="button" class="btn" data-act="editar-plano" data-id="${esc(p.id)}">Editar</button><button type="button" class="btn primary" data-act="fechar">Fechar</button>`);
}

function dlgAvaliacao(a) {
  const t = turmaAtual();
  a = a || { id: uid(), turmaId: t.id, nome: "", peso: 1, data: hoje(), bimestre: String(bimSelecionado(t) || bimDaData(t, hoje())?.num || "1"), notas: {} };
  const opcoesBim = bimestresDe(t).length ? bimestresDe(t).map(b => [String(b.num), b.nome]) : ["1", "2", "3", "4"].map(b => [b, b + "º bimestre"]);
  dlg._obj = a;
  abrirDlg(S.avaliacoes.some(x => x.id === a.id) ? "Editar avaliação" : "Nova avaliação", `
    <div class="field"><label for="aNome">Nome</label><input class="input" id="aNome" value="${esc(a.nome)}" placeholder="Prova 2 — Equações"></div>
    <div class="grid3"><div class="field"><label for="aPeso">Peso na média</label><input class="input" id="aPeso" type="number" min="0" step="0.5" value="${esc(a.peso)}"></div>
    <div class="field"><label for="aData">Data</label><input class="input" id="aData" type="date" value="${esc(a.data)}"></div>
    <div class="field"><label for="aBim">Período</label><select class="input" id="aBim">${opcoesBim.map(([v, n]) => `<option value="${v}" ${String(a.bimestre) === v ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div></div>`,
    `${S.avaliacoes.some(x => x.id === a.id) ? `<button type="button" class="btn danger" data-act="apagar-avaliacao" style="margin-right:auto">Apagar</button>` : ""}<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="salvar-avaliacao">Salvar</button>`);
}

function dlgAtividade(a) {
  const t = turmaAtual();
  a = a || { id: uid(), turmaId: t.id, titulo: "", descricao: "", prazo: addDias(hoje(), 7), valor: "", entregas: {} };
  dlg._obj = a;
  abrirDlg(S.atividades.some(x => x.id === a.id) ? "Editar atividade" : "Nova atividade", `
    <div class="grid3"><div class="field"><label for="atTurma">Turma</label><select class="input" id="atTurma">${turmaOpts(a.turmaId)}</select></div>
    <div class="field"><label for="atPrazo">Prazo</label><input class="input" type="date" id="atPrazo" value="${esc(a.prazo)}"></div>
    <div class="field"><label for="atValor">Vale (pontos)</label><input class="input" id="atValor" value="${esc(a.valor)}"></div></div>
    <div class="field"><label for="atTitulo">Título</label><input class="input" id="atTitulo" value="${esc(a.titulo)}" placeholder="Pesquisa sobre a Revolução Industrial"></div>
    <div class="field"><label for="atDesc">Instruções para os alunos</label><textarea class="input" id="atDesc" rows="7">${esc(a.descricao)}</textarea></div>
    <div class="ai-box"><div class="toolbar"><button type="button" class="btn ai sm" data-act="ia-atividade">${ico("spark")}Escrever instruções com IA</button><button type="button" class="btn ghost sm" data-act="parar-ia" hidden id="iaStop">Parar</button><span class="ai-status" id="iaStatus">Usa o título e a turma para redigir passo a passo e critérios.</span></div></div>`,
    `${S.atividades.some(x => x.id === a.id) ? `<button type="button" class="btn danger" data-act="apagar-atividade" style="margin-right:auto">Apagar</button>` : ""}<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="salvar-atividade">Salvar atividade</button>`);
}

function dlgQuestao(q) {
  const t = turmaAtual();
  q = q || { id: uid(), disciplina: t?.disciplina || "", tema: "", serie: t?.serie || "", tipo: "multipla", dificuldade: "media", enunciado: "", alternativas: ["", "", "", ""], correta: 0, resposta: "", bncc: "" };
  dlg._obj = q;
  abrirDlg(S.questoes.some(x => x.id === q.id) ? "Editar questão" : "Nova questão", `
    <div class="grid3"><div class="field"><label for="qDisc">Disciplina</label><input class="input" id="qDisc" value="${esc(q.disciplina)}"></div>
    <div class="field"><label for="qTema">Tema</label><input class="input" id="qTema" value="${esc(q.tema)}"></div>
    <div class="field"><label for="qBncc">BNCC</label><input class="input" id="qBncc" value="${esc(q.bncc)}"></div></div>
    <div class="grid3"><div class="field"><label for="qTipo">Tipo</label><select class="input" id="qTipo">${Object.entries(TIPO).map(([k, v]) => `<option value="${k}" ${q.tipo === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="field"><label for="qDif">Dificuldade</label><select class="input" id="qDif">${Object.entries(DIF).map(([k, v]) => `<option value="${k}" ${q.dificuldade === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="field"><label for="qSerie">Série</label><input class="input" id="qSerie" value="${esc(q.serie)}"></div></div>
    <div class="field"><label for="qEnun">Enunciado</label><textarea class="input" id="qEnun" rows="4">${esc(q.enunciado)}</textarea></div>
    <div class="field"><label for="qAlts">Alternativas, uma por linha (para dissertativa, deixe vazio)</label><textarea class="input" id="qAlts" rows="5">${esc((q.alternativas || []).join("\n"))}</textarea></div>
    <div class="grid2"><div class="field"><label for="qCorreta">Alternativa correta</label><select class="input" id="qCorreta">${"ABCDE".split("").map((l, i) => `<option value="${i}" ${q.correta === i ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    <div class="field"><label for="qResp">Resposta esperada (dissertativa)</label><input class="input" id="qResp" value="${esc(q.resposta)}"></div></div>`,
    `${S.questoes.some(x => x.id === q.id) ? `<button type="button" class="btn danger" data-act="apagar-questao" style="margin-right:auto">Apagar</button>` : ""}<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="salvar-questao">Salvar questão</button>`);
}

function dlgGerarQuestoes() {
  const t = turmaAtual();
  dlg._gerada = [];
  abrirDlg("Gerar questões com IA", `
    <div class="ai-box">
      <div class="grid2"><div class="field"><label for="gTema">Tema</label><input class="input" id="gTema" placeholder="Ex.: Ciclo da água"></div>
      <div class="field"><label for="gDisc">Disciplina</label><input class="input" id="gDisc" value="${esc(t?.disciplina || "")}"></div></div>
      <div class="grid3" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div class="field"><label for="gSerie">Série</label><input class="input" id="gSerie" value="${esc(t?.serie || "")}"></div>
      <div class="field"><label for="gTipo">Tipo</label><select class="input" id="gTipo"><option value="misto">Misto</option>${Object.entries(TIPO).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></div>
      <div class="field"><label for="gDif">Dificuldade</label><select class="input" id="gDif"><option value="variada">Variada</option>${Object.entries(DIF).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></div>
      <div class="field"><label for="gQtd">Quantidade</label><input class="input" id="gQtd" type="number" min="1" max="15" value="5"></div></div>
      <div class="toolbar"><button type="button" class="btn ai" data-act="ia-questoes">${ico("spark")}Gerar</button><button type="button" class="btn ghost sm" data-act="parar-ia" hidden id="iaStop">Parar</button><span class="ai-status" id="iaStatus">Revise cada questão e marque as que quer guardar.</span></div>
    </div><div id="gLista"></div>`,
    `<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="salvar-geradas" id="gSalvar" disabled>Guardar selecionadas</button>`);
}

function dlgProva(p) {
  const t = turmaAtual();
  p = p || { id: uid(), titulo: "", turmaId: t?.id || "", data: addDias(hoje(), 7), instrucoes: "Leia com atenção antes de responder. Duração: 50 minutos.", questaoIds: [] };
  dlg._obj = p;
  const discs = [...new Set(S.questoes.map(q => q.disciplina))];
  abrirDlg(S.provas.some(x => x.id === p.id) ? "Editar prova" : "Nova prova", `
    <div class="grid3"><div class="field"><label for="prTitulo">Título</label><input class="input" id="prTitulo" value="${esc(p.titulo)}" placeholder="Avaliação do 2º bimestre"></div>
    <div class="field"><label for="prTurma">Turma</label><select class="input" id="prTurma">${turmaOpts(p.turmaId)}</select></div>
    <div class="field"><label for="prData">Data</label><input class="input" type="date" id="prData" value="${esc(p.data)}"></div></div>
    <div class="field"><label for="prInst">Instruções</label><textarea class="input" id="prInst" rows="2">${esc(p.instrucoes)}</textarea></div>
    <div class="field"><label>Questões do banco (na ordem em que aparecem)</label>
      <div>${discs.map(d => `<div class="eyebrow" style="margin-top:8px">${esc(d)}</div>${S.questoes.filter(q => q.disciplina === d).map(q => `<label class="check"><input type="checkbox" name="prQ" value="${esc(q.id)}" ${(p.questaoIds || []).includes(q.id) ? "checked" : ""}><span><span class="small">${esc(q.enunciado.slice(0, 140))}${q.enunciado.length > 140 ? "…" : ""}</span><br><span class="chip">${esc(q.tema)}</span> <span class="chip">${esc(TIPO[q.tipo])}</span></span></label>`).join("")}`).join("") || `<p class="muted">O banco de questões está vazio.</p>`}</div></div>`,
    `${S.provas.some(x => x.id === p.id) ? `<button type="button" class="btn danger" data-act="apagar-prova" style="margin-right:auto">Apagar</button>` : ""}<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="salvar-prova">Salvar prova</button>`);
}

function provaDoc(p, gabarito) {
  const t = turma(p.turmaId);
  const qs = (p.questaoIds || []).map(id => S.questoes.find(q => q.id === id)).filter(Boolean);
  return `<div class="doc"><div><span class="eyebrow">${esc(t?.disciplina || "")} · ${esc(t?.nome || "")} · ${esc(fmtDataLonga(p.data))}</span><h2 style="margin-top:4px">${esc(p.titulo)}</h2></div>
    <div class="grid2 small"><div>Nome: ______________________________</div><div>Nº: _____ &nbsp; Nota: _____</div></div>
    ${p.instrucoes ? `<p class="small muted" style="white-space:pre-wrap">${esc(p.instrucoes)}</p>` : ""}
    ${qs.map((q, i) => questaoHTML(q, i + 1, gabarito) + (q.tipo === "aberta" && !gabarito ? `<div style="border-bottom:1px solid var(--line);height:64px"></div>` : "")).join("")}</div>`;
}
function dlgVerProva(p, gab) {
  abrirDlg(esc(p.titulo), `<div class="toolbar"><button type="button" class="btn sm ${gab ? "" : "primary"}" data-act="ver-prova" data-id="${esc(p.id)}">Versão do aluno</button><button type="button" class="btn sm ${gab ? "primary" : ""}" data-act="ver-prova-gab" data-id="${esc(p.id)}">Com gabarito</button></div>${provaDoc(p, gab)}`,
    `<button type="button" class="btn" data-act="folha-respostas" data-id="${esc(p.id)}">Folha de respostas</button><button type="button" class="btn ai" data-act="corrigir-foto" data-id="${esc(p.id)}">${ico("spark")}Corrigir por foto</button>${botoesExport(`data-prova="${esc(p.id)}" data-gab="${gab ? 1 : 0}"`)}<button type="button" class="btn primary" data-act="fechar">Fechar</button>`);
}

/* ---------- IA ---------- */
let sampleCtl = null;
function iaErro(e) {
  if (e && e.name === "AbortError") return "Parado.";
  return (e && e.message) || "Não foi possível falar com a IA agora. Tente de novo.";
}
async function comIA(fn) {
  const st = dlg.querySelector("#iaStatus"), stop = dlg.querySelector("#iaStop");
  if (!cap.ia) { if (st) st.textContent = "A IA ainda não foi configurada neste servidor. Peça ao administrador para definir a chave da Anthropic."; return; }
  const btns = dlg.querySelectorAll('[data-act^="ia-"]'); btns.forEach(b => b.disabled = true);
  sampleCtl = new AbortController(); if (stop) stop.hidden = false;
  if (st) st.textContent = "Pensando… pode levar até um minuto.";
  try { await fn(sampleCtl.signal, st); }
  catch (e) { if (st) st.textContent = iaErro(e); }
  finally { btns.forEach(b => b.disabled = false); if (stop) stop.hidden = true; sampleCtl = null; atualizarUso(); }
}
async function atualizarUso() { try { const eu = await api("GET", "/api/eu"); S.usoIA = eu.usoIA; renderNav(); } catch (_) {} }
function turmaIA(id) { const t = turma(id); return t ? { nome: t.nome, disciplina: t.disciplina, serie: t.serie || "", alunos: (t.alunos || []).length } : undefined; }
async function iaJSON(pedido, signal) {
  const r = await fetch("/api/ia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pedido), signal });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw { message: j.erro };
  return j.dados;
}
async function iaTexto(pedido, signal, onText) {
  const r = await fetch("/api/ia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pedido), signal });
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw { message: j.erro }; }
  const rd = r.body.getReader(), dec = new TextDecoder(); let txt = "";
  for (;;) { const { done, value } = await rd.read(); if (done) break; txt += dec.decode(value, { stream: true }); onText(txt); }
  return txt;
}

async function iaPlano() {
  const tema = val("iaTema"); if (!tema) { dlg.querySelector("#iaStatus").textContent = "Escreva o tema da aula primeiro."; return; }
  await comIA(async (signal, st) => {
    const r = await iaJSON({ tipo: "plano", tema, duracao: val("pDur"), detalhes: val("iaExtra"), turma: turmaIA(val("pTurma")) }, signal);
    const set = (id, v) => { const el = dlg.querySelector("#" + id); if (el && v) el.value = String(v); };
    set("pTitulo", r.titulo); set("pBncc", r.bncc); set("pObj", r.objetivos); set("pCont", r.conteudo); set("pMet", r.metodologia); set("pRec", r.recursos); set("pAval", r.avaliacao);
    st.textContent = "Pronto. Revise e ajuste antes de salvar.";
  });
}
async function iaAtividade() {
  const titulo = val("atTitulo"); if (!titulo) { dlg.querySelector("#iaStatus").textContent = "Escreva o título da atividade primeiro."; return; }
  await comIA(async (signal, st) => {
    const el = dlg.querySelector("#atDesc");
    await iaTexto({ tipo: "atividade", titulo, prazo: fmtDataLonga(val("atPrazo")), valor: val("atValor"), turma: turmaIA(val("atTurma")) }, signal, t => { el.value = t; });
    st.textContent = "Pronto. Revise antes de salvar.";
  });
}
async function iaQuestoes() {
  const tema = val("gTema"); if (!tema) { dlg.querySelector("#iaStatus").textContent = "Escreva o tema primeiro."; return; }
  const qtd = Math.max(1, Math.min(15, parseInt(val("gQtd")) || 5));
  await comIA(async (signal, st) => {
    const arr = await iaJSON({ tipo: "questoes", tema, disciplina: val("gDisc"), serie: val("gSerie"), quantidade: qtd,
      tipoQuestao: val("gTipo") === "misto" ? "misture múltipla escolha, verdadeiro ou falso e dissertativa" : TIPO[val("gTipo")],
      dificuldade: val("gDif") === "variada" ? "variada" : DIF[val("gDif")] }, signal);
    if (!Array.isArray(arr) || !arr.length) throw { message: "A resposta veio num formato inesperado. Tente de novo." };
    dlg._gerada = arr.filter(q => q && q.enunciado).map(q => ({ id: uid(), disciplina: val("gDisc"), tema, serie: val("gSerie"), tipo: TIPO[q.tipo] ? q.tipo : "multipla", dificuldade: DIF[q.dificuldade] ? q.dificuldade : "media", enunciado: String(q.enunciado), alternativas: Array.isArray(q.alternativas) ? q.alternativas.map(String) : [], correta: Number.isInteger(q.correta) ? q.correta : null, resposta: String(q.resposta || ""), bncc: String(q.bncc || "") }));
    dlg.querySelector("#gLista").innerHTML = dlg._gerada.map((q, i) => `<label class="check"><input type="checkbox" name="gSel" value="${i}" checked><div style="min-width:0;flex:1">${questaoHTML(q, i + 1)}<div class="toolbar" style="margin-top:4px"><span class="chip">${esc(TIPO[q.tipo])}</span><span class="chip">${esc(DIF[q.dificuldade])}</span>${q.bncc ? `<span class="bncc">${esc(q.bncc)}</span>` : ""}</div></div></label>`).join("");
    dlg.querySelector("#gSalvar").disabled = false;
    st.textContent = `${dlg._gerada.length} questões geradas. Desmarque as que não quiser.`;
  });
}
async function enviarChat(texto) {
  if (!texto || !cap.ia || enviarChat.busy) return;
  enviarChat.busy = true;
  S.chat.push({ role: "user", content: texto }, { role: "assistant", content: "Pensando…" });
  render();
  const contexto = `Turmas: ${S.turmas.map(t => `${t.nome} (${t.disciplina}, ${t.serie || "série não informada"}, ${(t.alunos || []).length} alunos)`).join("; ") || "nenhuma cadastrada"}.
Próximas aulas planejadas: ${S.planos.filter(p => p.data >= hoje()).slice(0, 5).map(p => `${p.titulo} em ${p.data}`).join("; ") || "nenhuma"}.`;
  const hist = S.chat.slice(0, -1).slice(-12).filter(m => !m.erro);
  const bubble = () => document.querySelectorAll("#chatLog .msg.bot");
  try {
    const text = await iaTexto({ tipo: "chat", contexto, mensagens: hist.map(({ role, content }) => ({ role, content })) }, undefined, text => { S.chat[S.chat.length - 1].content = text; const b = bubble(); if (b.length) b[b.length - 1].textContent = text; const c = $("#chatLog"); if (c) c.scrollTop = c.scrollHeight; });
    S.chat[S.chat.length - 1].content = text || "(sem resposta)";
  } catch (e) { const m = S.chat[S.chat.length - 1]; m.content = "⚠ " + iaErro(e); m.erro = true; }
  enviarChat.busy = false; render(); atualizarUso();
}

/* ---------- exportações ---------- */
async function baixar(nome, conteudo) {
  const tipo = nome.endsWith(".csv") ? "text/csv;charset=utf-8" : "text/html;charset=utf-8";
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a"); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
const htmlArquivo = (titulo, corpo) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:32px auto;padding:0 16px;color:#111;line-height:1.5}h1,h2{margin:0 0 8px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#555}.q{margin:18px 0}ol{margin:6px 0}.correct{font-weight:bold;color:#1f7a4a}.chip,.bncc{display:inline-block;border:1px solid #ccc;border-radius:4px;padding:0 6px;margin-right:4px;font-size:12px}.sec h3{font-size:13px;text-transform:uppercase;color:#1d6b58;margin:16px 0 4px}.sec div{white-space:pre-wrap}.grid2{display:flex;gap:24px}.small{font-size:14px}.muted{color:#555}.toolbar{display:flex;gap:6px;flex-wrap:wrap}</style></head><body>${corpo}</body></html>`;
const slug = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "arquivo";

/* ---------- Materiais para imprimir e adaptação para inclusão ---------- */
const MAT_TIPOS = {
  lista: ["Lista de exercícios", "Questões variadas para fazer em sala ou em casa."],
  interpretacao: ["Interpretação de texto", "Um texto original com perguntas de compreensão."],
  cruzadinha: ["Cruzadinha", "Palavras do tema com dicas, montada automaticamente."],
  cacapalavras: ["Caça-palavras", "Grade com as palavras do tema escondidas."],
  ludica: ["Atividade lúdica", "Desenhar, pintar, ligar e contar, para os pequenos."],
  adaptar: ["Adaptar uma atividade", "Cole uma atividade que você já tem e a Manu adapta."],
  resumo: ["Resumo de estudo", "Tópicos claros e perguntas de revisão, do tema ou de um texto."],
  mapa: ["Mapa mental", "O tema no centro e as ideias em ramos, desenhado automaticamente."]
};
const ADAPT = { "": "Nenhuma adaptação", tdah: "TDAH", dislexia: "Dislexia", tea: "TEA (autismo)", visual: "Baixa visão", intelectual: "Deficiência intelectual" };
S.matForm = { subtipo: "lista", turmaId: "", serie: "", disciplina: "", tema: "", quantidade: 8, adaptacao: "", observacoes: "", texto: "" };
S.matAtual = null; S.matStatus = ""; S.matBusy = false;
let matCtl = null;

const semAcento = w => String(w).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");

function montarCruzadinha(lista) {
  const vistos = new Set();
  const itens = lista.map(x => ({ w: semAcento(x.palavra), palavra: String(x.palavra || ""), dica: String(x.dica || "") }))
    .filter(x => x.w.length >= 2 && !vistos.has(x.w) && vistos.add(x.w)).sort((a, b) => b.w.length - a.w.length);
  const cel = new Map(), dirDe = new Map(), postos = [];
  const k = (r, c) => r + "," + c;
  const pode = (w, r, c, d) => {
    const dr = d === "v" ? 1 : 0, dc = d === "h" ? 1 : 0; let cruz = 0;
    if (cel.has(k(r - dr, c - dc)) || cel.has(k(r + dr * w.length, c + dc * w.length))) return -1;
    for (let i = 0; i < w.length; i++) {
      const rr = r + dr * i, cc = c + dc * i, x = cel.get(k(rr, cc));
      if (x) { if (x !== w[i] || (dirDe.get(k(rr, cc)) || "").includes(d)) return -1; cruz++; }
      else if (d === "h" ? (cel.has(k(rr - 1, cc)) || cel.has(k(rr + 1, cc))) : (cel.has(k(rr, cc - 1)) || cel.has(k(rr, cc + 1)))) return -1;
    }
    return cruz;
  };
  const por = (it, r, c, d) => {
    const dr = d === "v" ? 1 : 0, dc = d === "h" ? 1 : 0;
    for (let i = 0; i < it.w.length; i++) { const kk = k(r + dr * i, c + dc * i); cel.set(kk, it.w[i]); dirDe.set(kk, (dirDe.get(kk) || "") + d); }
    postos.push({ ...it, r, c, d });
  };
  let resto = itens.slice();
  if (resto.length) por(resto.shift(), 0, 0, "h");
  for (let volta = 0; volta < 3 && resto.length; volta++) {
    const falta = [];
    for (const it of resto) {
      let melhor = null;
      for (const [kk, letra] of cel) {
        const [r0, c0] = kk.split(",").map(Number);
        for (let i = 0; i < it.w.length; i++) {
          if (it.w[i] !== letra) continue;
          for (const d of ["h", "v"]) {
            const r = d === "v" ? r0 - i : r0, c = d === "h" ? c0 - i : c0;
            const n = pode(it.w, r, c, d);
            if (n > 0 && (!melhor || n > melhor.n)) melhor = { r, c, d, n };
          }
        }
      }
      if (melhor) por(it, melhor.r, melhor.c, melhor.d); else falta.push(it);
    }
    resto = falta;
  }
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  for (const kk of cel.keys()) { const [r, c] = kk.split(",").map(Number); minR = Math.min(minR, r); minC = Math.min(minC, c); maxR = Math.max(maxR, r); maxC = Math.max(maxC, c); }
  const celulas = {}; for (const [kk, v] of cel) { const [r, c] = kk.split(",").map(Number); celulas[(r - minR) + "," + (c - minC)] = v; }
  const ps = postos.map(p => ({ ...p, r: p.r - minR, c: p.c - minC })).sort((a, b) => a.r - b.r || a.c - b.c);
  const nums = new Map(); let n = 0;
  ps.forEach(p => { const kk = p.r + "," + p.c; if (!nums.has(kk)) nums.set(kk, ++n); p.num = nums.get(kk); });
  return { linhas: maxR - minR + 1, colunas: maxC - minC + 1, celulas, palavras: ps.map(p => ({ num: p.num, d: p.d, r: p.r, c: p.c, w: p.w, palavra: p.palavra, dica: p.dica })), fora: resto.map(x => x.palavra) };
}

function montarCaca(palavras, diagonais) {
  const ws = [...new Set(palavras.map(semAcento).filter(w => w.length >= 2))].sort((a, b) => b.length - a.length);
  const n = Math.max(10, Math.min(16, (ws[0] || "").length + 3, Math.ceil(Math.sqrt(ws.join("").length * 2.2))));
  const g = Array.from({ length: n }, () => Array(n).fill(""));
  const dirs = [[0, 1], [1, 0]].concat(diagonais ? [[1, 1], [-1, 1]] : []);
  const pos = {}, fora = [];
  for (const w of ws) {
    if (w.length > n) { fora.push(w); continue; }
    let ok = false;
    for (let t = 0; t < 300 && !ok; t++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * n), c = Math.floor(Math.random() * n);
      const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
      if (er < 0 || er >= n || ec >= n) continue;
      let cabe = true;
      for (let i = 0; i < w.length; i++) { const x = g[r + dr * i][c + dc * i]; if (x && x !== w[i]) { cabe = false; break; } }
      if (!cabe) continue;
      pos[w] = [];
      for (let i = 0; i < w.length; i++) { g[r + dr * i][c + dc * i] = w[i]; pos[w].push([r + dr * i, c + dc * i]); }
      ok = true;
    }
    if (!ok) fora.push(w);
  }
  const letras = "AAAEEEIIOOOUUBCDFGLMNPRRSSTTV";
  return { n, grade: g.map(l => l.map(x => x || letras[Math.floor(Math.random() * letras.length)]).join("")), pos, palavras: ws.filter(w => pos[w]), fora };
}

function linhasResp(n) { return n > 0 ? `<div class="linhas">${'<div></div>'.repeat(Math.min(n, 12))}</div>` : ""; }
function questoesHTML(qs, gab) {
  return `<ol class="qs">${(qs || []).map(q => `<li><div class="enun">${esc(q.enunciado)}</div>${(q.alternativas || []).length ? `<ol class="alts" type="a">${q.alternativas.map(a => `<li>${esc(a)}</li>`).join("")}</ol>` : linhasResp(q.linhas ?? 3)}${gab && q.resposta ? `<div class="gab">Resposta: ${esc(q.resposta)}</div>` : ""}</li>`).join("")}</ol>`;
}
function quebrar(txt, max) {
  const linhas = []; let atual = "";
  String(txt).split(/\s+/).forEach(p => { if ((atual + " " + p).trim().length > max && atual) { linhas.push(atual); atual = p; } else atual = (atual + " " + p).trim(); });
  if (atual) linhas.push(atual); return linhas;
}
function mapaSVG(m) {
  const cores = ["#0b7c8a", "#a8205a", "#8a5208", "#3a4f8c", "#1f6b3b", "#7a4a8c", "#b3261e", "#2f7f8f"];
  const ramos = (m.ramos || []).slice(0, 8).map((r, i) => {
    const tit = quebrar(r.titulo || "", 26), itens = (r.itens || []).slice(0, 6).map(x => quebrar(x, 34));
    const h = 14 + tit.length * 18 + 10 + itens.reduce((a, l) => a + l.length * 17 + 6, 0) + 8;
    return { tit, itens, h, cor: cores[i % cores.length], lado: i % 2 === 0 ? 1 : -1 };
  });
  const W = 1000, gap = 22, BW = 280, cx = W / 2;
  const total = s => ramos.filter(r => r.lado === s).reduce((a, r) => a + r.h + gap, -gap);
  const H = Math.max(total(1), total(-1), 180) + 40, cy = H / 2;
  const centro = quebrar(m.centro || m.titulo || "", 18);
  let out = "";
  [1, -1].forEach(s => {
    let y = cy - total(s) / 2;
    ramos.filter(r => r.lado === s).forEach(r => {
      const bx = s > 0 ? cx + 150 : cx - 150 - BW, ex = s > 0 ? bx : bx + BW, ey = y + 16;
      out += `<path d="M${cx + s * 105},${cy} C${cx + s * 140},${cy} ${ex - s * 40},${ey} ${ex},${ey}" fill="none" stroke="${r.cor}" stroke-width="3"/>`;
      out += `<rect x="${bx}" y="${y}" width="${BW}" height="${r.h}" rx="12" fill="#fff" stroke="${r.cor}" stroke-width="2"/>`;
      out += `<rect x="${bx}" y="${y}" width="${BW}" height="${14 + r.tit.length * 18}" rx="12" fill="${r.cor}"/><rect x="${bx}" y="${y + 10}" width="${BW}" height="${4 + r.tit.length * 18}" fill="${r.cor}"/>`;
      let ty = y + 26;
      r.tit.forEach(l => { out += `<text x="${bx + 14}" y="${ty}" font-size="15" font-weight="700" fill="#fff">${esc(l)}</text>`; ty += 18; });
      ty += 12;
      r.itens.forEach(ls => { ls.forEach((l, k) => { out += `<text x="${bx + 14}" y="${ty}" font-size="13.5" fill="#1f3140">${k === 0 ? "• " : "  "}${esc(l)}</text>`; ty += 17; }); ty += 6; });
      y += r.h + gap;
    });
  });
  const ch = 30 + centro.length * 22;
  out += `<rect x="${cx - 105}" y="${cy - ch / 2}" width="210" height="${ch}" rx="${Math.min(40, ch / 2)}" fill="#1f3140"/>`;
  centro.forEach((l, i) => { out += `<text x="${cx}" y="${cy - ch / 2 + 24 + i * 22}" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">${esc(l)}</text>`; });
  return `<svg class="mapa" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, Helvetica, sans-serif" role="img" aria-label="Mapa mental: ${esc(m.centro || m.titulo)}">${out}</svg>`;
}
function materialCorpo(m, gab) {
  const t = turma(m.turmaId);
  let corpo = "";
  if (m.subtipo === "lista" || m.subtipo === "adaptar") corpo = questoesHTML(m.questoes, gab);
  else if (m.subtipo === "interpretacao") corpo = `<div class="texto">${esc(m.texto).split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("")}${m.autoria ? `<p class="autoria">${esc(m.autoria)}</p>` : ""}</div>${questoesHTML(m.questoes, gab)}`;
  else if (m.subtipo === "cruzadinha" && m.grade) {
    const G = m.grade, inicio = {}; G.palavras.forEach(p => inicio[p.r + "," + p.c] = p.num);
    let tab = '<table class="cruz">';
    for (let r = 0; r < G.linhas; r++) { tab += "<tr>"; for (let c = 0; c < G.colunas; c++) { const v = G.celulas[r + "," + c]; tab += v ? `<td class="on">${inicio[r + "," + c] ? `<sup>${inicio[r + "," + c]}</sup>` : ""}${gab ? v : ""}</td>` : "<td></td>"; } tab += "</tr>"; }
    tab += "</table>";
    const dicas = d => G.palavras.filter(p => p.d === d).map(p => `<li value="${p.num}">${esc(p.dica)} <span class="nl">(${p.w.length} letras)</span></li>`).join("");
    corpo = `<div class="cruz-wrap">${tab}</div><div class="dicas"><div><h3>Horizontais</h3><ol>${dicas("h")}</ol></div><div><h3>Verticais</h3><ol>${dicas("v")}</ol></div></div>`;
  } else if (m.subtipo === "cacapalavras" && m.grade) {
    const G = m.grade, marc = new Set(); if (gab) Object.values(G.pos).forEach(ps => ps.forEach(([r, c]) => marc.add(r + "," + c)));
    corpo = `<table class="caca">${G.grade.map((l, r) => `<tr>${[...l].map((x, c) => `<td class="${marc.has(r + "," + c) ? "achou" : ""}">${x}</td>`).join("")}</tr>`).join("")}</table>
      <div class="banco"><b>Encontre:</b> ${G.palavras.map(w => `<span>${w}</span>`).join("")}</div>${m.tarefa ? `<p class="enun">${esc(m.tarefa)}</p>${linhasResp(4)}` : ""}`;
  } else if (m.subtipo === "resumo") corpo = `${m.introducao ? `<p class="instr">${esc(m.introducao)}</p>` : ""}${(m.topicos || []).map(t => `<div class="sec"><h3>${esc(t.titulo)}</h3><div>${esc(t.texto)}</div></div>`).join("")}
      ${(m.palavrasChave || []).length ? `<div class="banco"><b>Palavras-chave:</b> ${m.palavrasChave.map(w => `<span>${esc(w)}</span>`).join("")}</div>` : ""}
      ${(m.perguntas || []).length ? `<h3 class="rev">Para revisar</h3>${questoesHTML(m.perguntas.map(q => ({ enunciado: q.enunciado, alternativas: [], linhas: 2, resposta: q.resposta })), gab)}` : ""}`;
  else if (m.subtipo === "mapa") corpo = `<div class="mapa-wrap">${mapaSVG(m)}</div><div class="so-docx"><ul>${(m.ramos || []).map(r => `<li><b>${esc(r.titulo)}</b><ul>${(r.itens || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></li>`).join("")}</ul></div>`;
  else if (m.subtipo === "ludica") corpo = `<ol class="qs ludica">${(m.itens || []).map(it => `<li><div class="enun">${esc(it.comando)}</div>${it.espaco === "desenho" ? '<div class="quadro"></div>' : it.espaco === "linhas" ? linhasResp(3) : ""}</li>`).join("")}</ol>`;
  return `<div class="cab"><div>Escola: ________________________________</div><div>Data: ____/____/______</div><div>Nome: ____________________________________</div><div>Turma: ${t ? esc(t.nome) : "_______"}</div></div>
    <h1>${esc(m.titulo)}${gab ? " · Gabarito" : ""}</h1>${m.instrucoes ? `<p class="instr">${esc(m.instrucoes)}</p>` : ""}${corpo}`;
}
const CSS_FOLHA = `.folha{font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff;font-size:12pt;line-height:1.45}
.folha .cab{display:grid;grid-template-columns:2fr 1fr;gap:6px 16px;font-size:10.5pt;border-bottom:1.5px solid #111;padding-bottom:8px;margin-bottom:12px}
.folha h1{font-size:16pt;margin:4px 0 6px;font-family:Arial,Helvetica,sans-serif;font-weight:700}
.folha .instr{font-style:italic;margin:0 0 10px}
.folha .texto{border:1px solid #999;border-radius:6px;padding:10px 14px;margin-bottom:12px}.folha .texto p{margin:0 0 8px}.folha .autoria{font-size:9pt;color:#555}
.folha .qs{padding-left:22px;margin:0}.folha .qs>li{margin:0 0 14px;break-inside:avoid}.folha .enun{white-space:pre-wrap}
.folha .alts{margin:6px 0 0;padding-left:22px}.folha .alts li{margin:2px 0}
.folha .linhas div{border-bottom:1px solid #888;height:26px}
.folha .gab{color:#1f6b3b;font-weight:700;margin-top:4px}
.folha .cruz-wrap{overflow-x:auto;margin:6px 0 12px}.folha table.cruz{border-collapse:collapse;margin:0 auto}
.folha .cruz td{width:26px;height:26px;padding:0;border:0;text-align:center;font-weight:700;font-size:12pt;position:relative;white-space:normal}
.folha .cruz td.on{border:1.5px solid #111}.folha .cruz sup{position:absolute;top:1px;left:2px;font-size:7pt;font-weight:400;line-height:1}
.folha .dicas{display:grid;grid-template-columns:1fr 1fr;gap:16px}.folha .dicas h3{font-size:12pt;margin:0 0 4px;color:#111;text-transform:none;letter-spacing:0}.folha .dicas ol{margin:0;padding-left:26px}.folha .nl{color:#666;font-size:9pt}
.folha table.caca{border-collapse:collapse;margin:6px auto 12px}.folha .caca td{width:26px;height:26px;text-align:center;font-weight:700;font-size:13pt;border:1px solid #ccc;padding:0}
.folha .caca td.achou{background:#ffe08a}
.folha .banco{display:flex;flex-wrap:wrap;gap:6px 12px;margin-bottom:10px}.folha .banco span{border:1px solid #999;border-radius:4px;padding:1px 8px}
.folha .quadro{border:1.5px dashed #888;border-radius:10px;height:150px;margin-top:6px}
.folha .q-img{display:block;max-width:100%;max-height:9cm;margin:6px 0}.folha .fonte{font-size:8.5pt;color:#666;margin:2px 0 0}
.folha .mapa-wrap{margin:8px 0}.folha svg.mapa{width:100%;height:auto;display:block}.folha .so-docx{display:none}
.folha .sec{margin:0 0 10px;break-inside:avoid}.folha .sec h3{font-size:12.5pt;margin:0 0 3px;color:#0b7c8a;text-transform:none;letter-spacing:0}.folha h3.rev{font-size:13pt;margin:14px 0 6px;color:#111}
.folha.ampliado{font-size:18pt;line-height:1.6}.folha.ampliado h1{font-size:24pt}.folha.ampliado .cab{font-size:14pt;grid-template-columns:1fr}.folha.ampliado .linhas div{height:38px}.folha.ampliado .cruz td,.folha.ampliado .caca td{width:38px;height:38px;font-size:18pt}
.folha.dislexia{font-family:Verdana,Arial,sans-serif;font-size:14pt;line-height:1.9;letter-spacing:.03em;word-spacing:.12em}.folha.dislexia .qs>li{margin-bottom:20px}`;
document.head.insertAdjacentHTML("beforeend", `<style>${CSS_FOLHA}</style>`);
const estiloFolha = m => m.adaptacao === "visual" ? "ampliado" : m.adaptacao === "dislexia" ? "dislexia" : "";
function folhaHTML(m, gab) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(m.titulo)}</title><style>@page{size:A4;margin:14mm}body{margin:0}${CSS_FOLHA}</style></head><body><div class="folha ${estiloFolha(m)}">${materialCorpo(m, gab)}</div></body></html>`;
}
function imprimir(html) {
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(f);
  f.onload = () => { setTimeout(() => { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 60000); }, 200); };
  f.srcdoc = html;
}
const serieInicial = s => /infantil|pr[ée]|creche|\b[1-5]\s*[ºo°]?\s*ano\b/i.test(s || "") && !/m[ée]dio|EM\b/i.test(s || "");

function vMateriais() {
  const f = S.matForm, cur = S.matAtual;
  if (S.dentroTurma && f._turmaDe !== S.turmaSel) { const t = turmaAtual(); Object.assign(f, { _turmaDe: t.id, turmaId: t.id, serie: t.serie || "", disciplina: t.disciplina || "" }); }
  const salvos = S.materiais.filter(m => !S.dentroTurma || !m.turmaId || m.turmaId === S.turmaSel).slice().sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
  return `<div class="page-head"><div><h1>Materiais para imprimir</h1><p class="muted">Atividades prontas para imprimir e adaptações para inclusão, feitas pela Manu. Revise sempre antes de usar.</p></div></div>
  ${!cap.ia ? `<div class="banner"><b>IA ainda não configurada.</b><span>O administrador precisa definir a chave da Anthropic no servidor.</span></div>` : ""}
  <section class="panel">
    ${S.dentroTurma ? `<div class="mat-escolhido">${ico("spark")}<div><b>${MAT_TIPOS[f.subtipo][0]}</b><span>${MAT_TIPOS[f.subtipo][1]} Troque o tipo na coluna Criar com IA.</span></div></div>`
      : `<div class="mat-tipos" role="radiogroup" aria-label="Tipo de material">${Object.entries(MAT_TIPOS).map(([k, [n, d]]) => `<button type="button" class="mat-tipo" role="radio" aria-checked="${f.subtipo === k}" data-act="mat-tipo" data-v="${k}"><b>${n}</b><span>${d}</span></button>`).join("")}</div>`}
    <div class="grid3">
      <div class="field"><label for="mTurma">Turma (opcional)</label><select class="input" id="mTurma"><option value="">Sem turma</option>${S.turmas.map(t => `<option value="${esc(t.id)}" ${f.turmaId === t.id ? "selected" : ""}>${esc(t.nome)} · ${esc(t.disciplina)}</option>`).join("")}</select></div>
      <div class="field"><label for="mSerie">Série ou etapa</label><input class="input" id="mSerie" value="${esc(f.serie)}" placeholder="Ex.: 3º ano EF, Pré II, 1ª série EM"></div>
      <div class="field"><label for="mDisc">Componente ou campo de experiência</label><input class="input" id="mDisc" value="${esc(f.disciplina)}" placeholder="Ex.: Ciências, Língua Portuguesa"></div>
    </div>
    ${f.subtipo === "resumo" || f.subtipo === "mapa"
      ? `<div class="field"><label for="mTema">Tema</label><input class="input" id="mTema" value="${esc(f.tema)}" placeholder="Ex.: Revolução Industrial, Sistema digestório"></div>
         <div class="field"><label for="mTexto">Texto base (opcional)</label><textarea class="input" id="mTexto" rows="5" placeholder="Cole aqui um trecho do livro ou da sua aula para a Manu resumir. Se deixar vazio, ela usa o tema.">${esc(f.texto)}</textarea></div>`
      : f.subtipo === "adaptar"
      ? `<div class="field"><label for="mTexto">Atividade original (cole o texto)</label><textarea class="input" id="mTexto" rows="8" placeholder="Cole aqui o enunciado e as questões da atividade que você quer adaptar.">${esc(f.texto)}</textarea></div>`
      : `<div class="grid2" style="grid-template-columns:minmax(0,3fr) minmax(0,1fr)"><div class="field"><label for="mTema">Tema</label><input class="input" id="mTema" value="${esc(f.tema)}" placeholder="Ex.: Ciclo da água, Adição com reserva, Animais da fazenda"></div>
         <div class="field"><label for="mQtd">${f.subtipo === "cruzadinha" || f.subtipo === "cacapalavras" ? "Palavras" : f.subtipo === "ludica" ? "Propostas" : "Questões"}</label><input class="input" id="mQtd" type="number" min="3" max="20" value="${esc(f.quantidade)}"></div></div>`}
    <div class="grid2">
      <div class="field"><label for="mAdapt">Adaptar para</label><select class="input" id="mAdapt">${Object.entries(ADAPT).map(([k, v]) => `<option value="${k}" ${f.adaptacao === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
      <div class="field"><label for="mObs">Pedido extra (opcional)</label><input class="input" id="mObs" value="${esc(f.observacoes)}" placeholder="Ex.: usar exemplos da nossa cidade, nível fácil"></div>
    </div>
    <div class="toolbar"><button class="btn ai" data-act="mat-gerar" ${S.matBusy || !cap.ia ? "disabled" : ""}>${ico("spark")}${S.matBusy ? "Gerando…" : "Gerar material"}</button>${S.matBusy ? `<button class="btn ghost sm" data-act="mat-parar">Parar</button>` : ""}<span class="ai-status" id="mStatus">${esc(S.matStatus)}</span></div>
  </section>
  ${cur ? `<section class="panel" id="matResultado">
    <div class="panel-head"><div><span class="eyebrow">${esc(MAT_TIPOS[cur.subtipo][0])}${cur.adaptacao ? " · adaptado para " + esc(ADAPT[cur.adaptacao]) : ""}</span><h2>${esc(cur.titulo)}</h2></div>
      <div class="toolbar"><button class="btn primary" data-act="mat-imprimir">Imprimir</button>${cur.subtipo !== "ludica" && cur.subtipo !== "mapa" ? `<button class="btn" data-act="mat-imprimir-gab">Imprimir gabarito</button>` : ""}${botoesExport(`data-material="1"`)}${S.materiais.some(x => x.id === cur.id) ? `<span class="chip ok">Salvo nos materiais</span>` : `<button class="btn" data-act="mat-salvar">Salvar</button>`}</div></div>
    ${cur.grade && cur.grade.fora && cur.grade.fora.length ? `<div class="banner"><span>Não couberam na grade: ${esc(cur.grade.fora.join(", "))}.</span></div>` : ""}
    ${cur.orientacoes || cur.mudancas ? `<div class="ai-box small">${cur.mudancas ? `<div><b>O que foi adaptado:</b> ${esc(cur.mudancas)}</div>` : ""}${cur.orientacoes ? `<div><b>Dicas para aplicar:</b> ${esc(Array.isArray(cur.orientacoes) ? cur.orientacoes.join(" ") : cur.orientacoes)}</div>` : ""}${cur.bncc ? `<div><b>BNCC:</b> ${esc(cur.bncc)}</div>` : ""}</div>` : (cur.bncc ? `<div class="toolbar">${String(cur.bncc).split(/[,;\s]+/).filter(Boolean).map(c => `<span class="bncc">${esc(c)}</span>`).join("")}</div>` : "")}
    <div class="folha-wrap"><div class="folha ${estiloFolha(cur)}">${materialCorpo(cur, false)}</div></div>
  </section>` : ""}
  <section class="panel"><h2>Meus materiais</h2>
    ${salvos.length ? `<div class="list">${salvos.map(m => `<div class="row"><div class="grow"><div class="title">${esc(m.titulo)}</div><div class="small muted">${esc(MAT_TIPOS[m.subtipo]?.[0] || "")} · ${esc(m.tema || m.serie || "")} · ${fmtData((m.criadoEm || "").slice(0, 10))}</div></div>${m.adaptacao ? `<span class="chip acc">${esc(ADAPT[m.adaptacao])}</span>` : ""}<button class="btn sm" data-act="mat-abrir" data-id="${esc(m.id)}">Abrir</button><button class="btn sm ghost danger" data-act="mat-apagar" data-id="${esc(m.id)}">Apagar</button></div>`).join("")}</div>` : `<p class="muted">Os materiais que você salvar aparecem aqui para imprimir de novo.</p>`}
  </section>`;
}

async function gerarMaterial() {
  const f = S.matForm;
  const comTexto = f.subtipo === "adaptar" || f.subtipo === "resumo" || f.subtipo === "mapa";
  if (f.subtipo === "adaptar" ? f.texto.trim().length < 20 : f.tema.trim().length < 2 && !(comTexto && f.texto.trim().length >= 20)) { S.matStatus = f.subtipo === "adaptar" ? "Cole a atividade que você quer adaptar." : "Escreva o tema primeiro."; render(); return; }
  S.matBusy = true; S.matStatus = "A Manu está preparando o material… pode levar até um minuto."; render();
  matCtl = new AbortController();
  try {
    const d = await iaJSON({ tipo: "material", subtipo: f.subtipo, tema: f.tema, serie: f.serie, disciplina: f.disciplina, quantidade: Number(f.quantidade) || 8, adaptacao: f.adaptacao, observacoes: f.observacoes, texto: comTexto && f.texto.trim() ? f.texto : undefined }, matCtl.signal);
    if (!d || typeof d !== "object" || !d.titulo) throw { message: "A resposta veio num formato inesperado. Tente de novo." };
    const m = { ...d, id: uid(), subtipo: f.subtipo, tema: f.tema, serie: f.serie, disciplina: f.disciplina, turmaId: f.turmaId, adaptacao: f.adaptacao, criadoEm: new Date().toISOString() };
    if (f.subtipo === "cruzadinha") m.grade = montarCruzadinha(Array.isArray(d.palavras) ? d.palavras : []);
    if (f.subtipo === "cacapalavras") m.grade = montarCaca((Array.isArray(d.palavras) ? d.palavras : []).map(x => typeof x === "string" ? x : x.palavra || ""), !serieInicial(f.serie) && f.adaptacao === "");
    S.matAtual = m; S.matStatus = "Pronto. Revise antes de imprimir.";
  } catch (e) { S.matStatus = iaErro(e); }
  S.matBusy = false; matCtl = null; render(); atualizarUso();
  setTimeout(() => document.getElementById("matResultado")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

document.addEventListener("input", e => {
  const id = e.target.id, f = S.matForm;
  const mapa = { mSerie: "serie", mDisc: "disciplina", mTema: "tema", mQtd: "quantidade", mObs: "observacoes", mTexto: "texto" };
  if (mapa[id]) f[mapa[id]] = e.target.value;
});
document.addEventListener("change", e => {
  const id = e.target.id, f = S.matForm;
  if (id === "mAdapt") f.adaptacao = e.target.value;
  if (id === "mTurma") { f.turmaId = e.target.value; const t = turma(f.turmaId); if (t) { f.serie = t.serie || f.serie; f.disciplina = t.disciplina || f.disciplina; } render(); }
});
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act^='mat-']"); if (!b) return;
  const act = b.dataset.act, cur = S.matAtual;
  if (act === "mat-tipo") { S.matForm.subtipo = b.dataset.v; render(); }
  else if (act === "mat-gerar") gerarMaterial();
  else if (act === "mat-parar") matCtl?.abort();
  else if (act === "mat-imprimir" && cur) imprimir(folhaHTML(cur, false));
  else if (act === "mat-imprimir-gab" && cur) imprimir(folhaHTML(cur, true));
  else if (act === "mat-baixar" && cur) baixar(`${slug(cur.titulo)}.html`, folhaHTML(cur, false));
  else if (act === "mat-salvar" && cur) { await salvar("materiais", JSON.parse(JSON.stringify(cur))); toast("Material salvo"); }
  else if (act === "mat-abrir") { const m = S.materiais.find(x => x.id === b.dataset.id); if (m) { S.matAtual = JSON.parse(JSON.stringify(m)); render(); setTimeout(() => document.getElementById("matResultado")?.scrollIntoView({ behavior: "smooth" }), 50); } }
  else if (act === "mat-apagar") { if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar"; return; } if (S.matAtual?.id === b.dataset.id) S.matAtual = null; await apagar("materiais", b.dataset.id); toast("Material apagado"); }
});

/* ---------- Slides com IA ---------- */
const SL_ROTULO = { capa: "", objetivo: "Objetivo da aula", conteudo: "", pergunta: "Pergunta para a turma", atividade: "Atividade", resumo: "Para lembrar" };
S.slForm = { planoId: "", tema: "", serie: "", disciplina: "", quantidade: 10, observacoes: "" };
S.slAtual = null; S.slStatus = ""; S.slBusy = false; S.slShow = -1;
let slCtl = null;

function slideHTML(s, d, i) {
  const t = s.tipo || "conteudo", rot = SL_ROTULO[t] || "";
  if (t === "capa") return `<div class="sl capa"><div class="sl-in"><div class="sl-t">${esc(s.titulo || d.titulo)}</div>${(s.topicos || []).length ? `<div class="sl-sub">${esc(s.topicos.join(" · "))}</div>` : `<div class="sl-sub">${esc([d.serie, d.disciplina].filter(Boolean).join(" · "))}</div>`}</div></div>`;
  return `<div class="sl ${t}"><div class="sl-in">${rot ? `<div class="sl-rot">${rot}</div>` : ""}<div class="sl-t">${esc(s.titulo)}</div>
    ${(s.topicos || []).length ? `<ul>${s.topicos.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${s.destaque ? `<div class="sl-dest">${esc(s.destaque)}</div>` : ""}<div class="sl-n">${i + 1}</div></div></div>`;
}

function vSlides() {
  const f = S.slForm, d = S.slAtual;
  if (S.dentroTurma && f._turmaDe !== S.turmaSel) { const t = turmaAtual(); Object.assign(f, { _turmaDe: t.id, serie: f.planoId ? f.serie : t.serie || "", disciplina: f.planoId ? f.disciplina : t.disciplina || "" }); }
  const salvos = S.slides.filter(x => !S.dentroTurma || !x.turmaId || x.turmaId === S.turmaSel).slice().sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
  return `<div class="page-head"><div><h1>Slides da aula</h1><p class="muted">A Manu monta a apresentação a partir do seu plano de aula ou de um tema. Baixe em PowerPoint e edite no PowerPoint, Google Apresentações ou Canva.</p></div></div>
  ${!cap.ia ? `<div class="banner"><b>IA ainda não configurada.</b><span>O administrador precisa definir a chave da Anthropic no servidor.</span></div>` : ""}
  <section class="panel">
    <div class="field"><label for="sPlano">Usar um plano de aula (opcional)</label><select class="input" id="sPlano"><option value="">Sem plano: só o tema</option>${S.planos.filter(p => !S.dentroTurma || p.turmaId === S.turmaSel).sort((a, b) => (b.data || "").localeCompare(a.data || "")).map(p => `<option value="${esc(p.id)}" ${f.planoId === p.id ? "selected" : ""}>${esc(p.titulo)} · ${esc(turma(p.turmaId)?.nome || "")} · ${fmtData(p.data)}</option>`).join("")}</select></div>
    <div class="grid2" style="grid-template-columns:minmax(0,3fr) minmax(0,1fr)"><div class="field"><label for="sTema">Tema da aula</label><input class="input" id="sTema" value="${esc(f.tema)}" placeholder="Ex.: Sistema solar, Frações equivalentes"></div>
      <div class="field"><label for="sQtd">Slides</label><input class="input" id="sQtd" type="number" min="5" max="20" value="${esc(f.quantidade)}"></div></div>
    <div class="grid3"><div class="field"><label for="sSerie">Série ou etapa</label><input class="input" id="sSerie" value="${esc(f.serie)}" placeholder="Ex.: 4º ano EF"></div>
      <div class="field"><label for="sDisc">Componente</label><input class="input" id="sDisc" value="${esc(f.disciplina)}" placeholder="Ex.: Ciências"></div>
      <div class="field"><label for="sObs">Pedido extra (opcional)</label><input class="input" id="sObs" value="${esc(f.observacoes)}" placeholder="Ex.: incluir um jogo de perguntas"></div></div>
    <div class="toolbar"><button class="btn ai" data-act="sl-gerar" ${S.slBusy || !cap.ia ? "disabled" : ""}>${ico("spark")}${S.slBusy ? "Gerando…" : "Gerar slides"}</button>${S.slBusy ? `<button class="btn ghost sm" data-act="sl-parar">Parar</button>` : ""}<span class="ai-status">${esc(S.slStatus)}</span></div>
  </section>
  ${d ? `<section class="panel" id="slResultado">
    <div class="panel-head"><div><span class="eyebrow">${d.slides.length} slides${d.bncc ? " · " + esc(d.bncc) : ""}</span><h2>${esc(d.titulo)}</h2></div>
      <div class="toolbar"><button class="btn" data-act="sl-apresentar">Apresentar</button><button class="btn primary" data-act="sl-pptx">${ico("dl")}Baixar PowerPoint</button>${S.googleClientId ? `<button class="btn" data-act="exp" data-fmt="drive" data-slides="1">${ico("drive")}Google Apresentações</button>` : ""}${S.slides.some(x => x.id === d.id) ? `<span class="chip ok">Salvo</span>` : `<button class="btn" data-act="sl-salvar">Salvar</button>`}</div></div>
    <div class="deck">${d.slides.map((s, i) => `<figure class="deck-item">${slideHTML(s, d, i)}${s.notas ? `<figcaption><b>Fala do professor:</b> ${esc(s.notas)}</figcaption>` : ""}</figure>`).join("")}</div>
  </section>` : ""}
  <section class="panel"><h2>Minhas apresentações</h2>
    ${salvos.length ? `<div class="list">${salvos.map(x => `<div class="row"><div class="grow"><div class="title">${esc(x.titulo)}</div><div class="small muted">${x.slides.length} slides · ${esc(x.serie || "")} · ${fmtData((x.criadoEm || "").slice(0, 10))}</div></div><button class="btn sm" data-act="sl-abrir" data-id="${esc(x.id)}">Abrir</button><button class="btn sm ghost danger" data-act="sl-apagar" data-id="${esc(x.id)}">Apagar</button></div>`).join("")}</div>` : `<p class="muted">As apresentações que você salvar aparecem aqui.</p>`}
  </section>
  ${d && S.slShow >= 0 ? `<div class="show" role="dialog" aria-label="Apresentação"><div class="show-sl">${slideHTML(d.slides[S.slShow], d, S.slShow)}</div>
    <div class="show-bar"><button class="btn sm" data-act="sl-ant" ${S.slShow === 0 ? "disabled" : ""}>Anterior</button><span class="num">${S.slShow + 1} / ${d.slides.length}</span><button class="btn sm" data-act="sl-prox" ${S.slShow === d.slides.length - 1 ? "disabled" : ""}>Próximo</button><button class="btn sm" data-act="sl-fechar">Sair (Esc)</button></div></div>` : ""}`;
}

function textoPlano(p) {
  return [`Título: ${p.titulo}`, p.duracao && `Duração: ${p.duracao}`, p.bncc && `BNCC: ${p.bncc}`, p.objetivos && `Objetivos: ${p.objetivos}`, p.conteudo && `Conteúdos: ${p.conteudo}`, p.metodologia && `Metodologia: ${p.metodologia}`, p.recursos && `Recursos: ${p.recursos}`, p.avaliacao && `Avaliação: ${p.avaliacao}`].filter(Boolean).join("\n").slice(0, 7500);
}
async function gerarSlides() {
  const f = S.slForm;
  if (f.tema.trim().length < 2) { S.slStatus = "Escreva o tema da aula primeiro."; render(); return; }
  S.slBusy = true; S.slStatus = "A Manu está montando os slides… pode levar até um minuto."; render();
  slCtl = new AbortController();
  try {
    const p = S.planos.find(x => x.id === f.planoId);
    const d = await iaJSON({ tipo: "slides", tema: f.tema, serie: f.serie, disciplina: f.disciplina, quantidade: Math.max(5, Math.min(20, Number(f.quantidade) || 10)), observacoes: f.observacoes, plano: p ? textoPlano(p) : undefined }, slCtl.signal);
    if (!d || !Array.isArray(d.slides) || !d.slides.length) throw { message: "A resposta veio num formato inesperado. Tente de novo." };
    d.slides = d.slides.filter(s => s && (s.titulo || (s.topicos || []).length)).map(s => ({ tipo: SL_ROTULO[s.tipo] !== undefined ? s.tipo : "conteudo", titulo: String(s.titulo || ""), topicos: Array.isArray(s.topicos) ? s.topicos.map(String).slice(0, 6) : [], destaque: String(s.destaque || ""), notas: String(s.notas || "") }));
    S.slAtual = { titulo: String(d.titulo || f.tema), slides: d.slides, bncc: String(d.bncc || ""), id: uid(), tema: f.tema, serie: f.serie, disciplina: f.disciplina, planoId: f.planoId, turmaId: S.planos.find(x => x.id === f.planoId)?.turmaId || (S.dentroTurma ? S.turmaSel : ""), criadoEm: new Date().toISOString() };
    S.slStatus = "Pronto. Confira os slides e baixe o PowerPoint.";
  } catch (e) { S.slStatus = iaErro(e); }
  S.slBusy = false; slCtl = null; render(); atualizarUso();
  setTimeout(() => document.getElementById("slResultado")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

async function carregarPptx() {
  if (window.PptxGenJS) return;
  await new Promise((ok, erro) => { const s = document.createElement("script"); s.src = "/vendor/pptxgen-3.12.0.bundle.js"; s.onload = ok; s.onerror = erro; document.head.appendChild(s); });
}
async function baixarPptx(d) {
  try { await carregarPptx(); } catch (_) { toast("Não foi possível preparar o PowerPoint. Verifique a internet e tente de novo."); return; }
  await montarPptx(d).writeFile({ fileName: slug(d.titulo) + ".pptx" });
}
function montarPptx(d) {
  const C = { teal: "0B7C8A", tealEsc: "075E69", ink: "1F3140", muted: "556676", soft: "E3F5F6", rosa: "FDE8F0", rosaInk: "A8205A", ouro: "FDF0DC", ouroInk: "8A5208", branco: "FFFFFF" };
  const F = "Arial";
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; pptx.title = d.titulo; pptx.author = S.nome || "Manu Professor";
  d.slides.forEach((s, i) => {
    const sl = pptx.addSlide(), t = s.tipo;
    if (t === "capa") {
      sl.background = { color: C.teal };
      sl.addText(s.titulo || d.titulo, { x: 0.8, y: 2.3, w: 11.7, h: 1.8, fontFace: F, fontSize: 44, bold: true, color: C.branco, valign: "bottom" });
      const sub = (s.topicos || []).length ? s.topicos.join(" · ") : [d.serie, d.disciplina].filter(Boolean).join(" · ");
      if (sub) sl.addText(sub, { x: 0.8, y: 4.2, w: 11.7, h: 0.8, fontFace: F, fontSize: 22, color: C.soft });
    } else if (t === "pergunta") {
      sl.background = { color: C.soft };
      sl.addText(SL_ROTULO.pergunta.toUpperCase(), { x: 0.8, y: 0.6, w: 11.7, h: 0.5, fontFace: F, fontSize: 16, bold: true, color: C.tealEsc, charSpacing: 2 });
      sl.addText(s.titulo, { x: 0.8, y: 1.6, w: 11.7, h: 2.6, fontFace: F, fontSize: 40, bold: true, color: C.ink, align: "center", valign: "middle" });
      if ((s.topicos || []).length) sl.addText(s.topicos.map(x => ({ text: x, options: { bullet: true } })), { x: 1.5, y: 4.4, w: 10.3, h: 2.4, fontFace: F, fontSize: 22, color: C.ink, paraSpaceAfter: 8 });
    } else {
      sl.background = { color: C.branco };
      const fundo = t === "atividade" ? C.rosa : t === "resumo" ? C.ouro : null, rotCor = t === "atividade" ? C.rosaInk : t === "resumo" ? C.ouroInk : C.teal;
      if (fundo) sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 2.0, fill: { color: fundo }, line: { color: fundo } });
      let y = 0.45;
      if (SL_ROTULO[t]) { sl.addText(SL_ROTULO[t].toUpperCase(), { x: 0.7, y, w: 11.9, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: rotCor, charSpacing: 2 }); y += 0.4; }
      sl.addText(s.titulo, { x: 0.7, y, w: 11.9, h: 0.9, fontFace: F, fontSize: 32, bold: true, color: C.ink, valign: "middle" });
      const temDest = !!s.destaque;
      if ((s.topicos || []).length) sl.addText(s.topicos.map(x => ({ text: x, options: { bullet: { indent: 24 } } })), { x: 0.8, y: 2.25, w: 11.7, h: temDest ? 3.4 : 4.6, fontFace: F, fontSize: 24, color: C.ink, valign: "top", paraSpaceAfter: 12 });
      if (temDest) sl.addText(s.destaque, { x: 0.8, y: 5.8, w: 11.7, h: 1.0, fontFace: F, fontSize: 22, bold: true, color: C.tealEsc, fill: { color: C.soft }, rectRadius: 0.15, shape: pptx.ShapeType.roundRect, margin: 14 });
      sl.addText(String(i + 1), { x: 12.2, y: 6.95, w: 0.8, h: 0.4, fontFace: F, fontSize: 12, color: C.muted, align: "right" });
    }
    if (s.notas) sl.addNotes(s.notas);
  });
  return pptx;
}

document.addEventListener("input", e => {
  const mapa = { sTema: "tema", sSerie: "serie", sDisc: "disciplina", sQtd: "quantidade", sObs: "observacoes" };
  if (mapa[e.target.id]) S.slForm[mapa[e.target.id]] = e.target.value;
});
document.addEventListener("change", e => {
  if (e.target.id !== "sPlano") return;
  const f = S.slForm; f.planoId = e.target.value; const p = S.planos.find(x => x.id === f.planoId);
  if (p) { const t = turma(p.turmaId); f.tema = p.titulo; if (t) { f.serie = t.serie || f.serie; f.disciplina = t.disciplina || f.disciplina; } }
  render();
});
document.addEventListener("keydown", e => {
  if (S.slShow < 0 || !S.slAtual) return;
  if (e.key === "Escape") { S.slShow = -1; render(); }
  else if ((e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") && S.slShow < S.slAtual.slides.length - 1) { e.preventDefault(); S.slShow++; render(); }
  else if ((e.key === "ArrowLeft" || e.key === "PageUp") && S.slShow > 0) { e.preventDefault(); S.slShow--; render(); }
});
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act^='sl-']"); if (!b) return;
  const act = b.dataset.act, d = S.slAtual;
  if (act === "sl-gerar") gerarSlides();
  else if (act === "sl-parar") slCtl?.abort();
  else if (act === "sl-pptx" && d) { b.disabled = true; await baixarPptx(d); b.disabled = false; }
  else if (act === "sl-salvar" && d) { await salvar("slides", JSON.parse(JSON.stringify(d))); toast("Apresentação salva"); }
  else if (act === "sl-apresentar" && d) { S.slShow = 0; render(); document.documentElement.requestFullscreen?.().catch(() => {}); }
  else if (act === "sl-prox" && d) { S.slShow = Math.min(d.slides.length - 1, S.slShow + 1); render(); }
  else if (act === "sl-ant" && d) { S.slShow = Math.max(0, S.slShow - 1); render(); }
  else if (act === "sl-fechar") { S.slShow = -1; render(); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); }
  else if (act === "sl-abrir") { const x = S.slides.find(y => y.id === b.dataset.id); if (x) { S.slAtual = JSON.parse(JSON.stringify(x)); render(); setTimeout(() => document.getElementById("slResultado")?.scrollIntoView({ behavior: "smooth" }), 50); } }
  else if (act === "sl-apagar") { if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar"; return; } if (S.slAtual?.id === b.dataset.id) S.slAtual = null; await apagar("slides", b.dataset.id); toast("Apresentação apagada"); }
  else if (act === "sl-do-plano") { const p = S.planos.find(x => x.id === b.dataset.id); if (p) { const t = turma(p.turmaId); Object.assign(S.slForm, { planoId: p.id, tema: p.titulo, serie: t?.serie || "", disciplina: t?.disciplina || "" }); fechar(); irTurma(p.turmaId, "slides"); } }
});
document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && S.slShow >= 0) { S.slShow = -1; render(); } });

/* ---------- Exportar para Word, Excel e Google Drive ---------- */
const MIME = {
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.google-apps.document", "Google Docs"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.google-apps.presentation", "Google Apresentações"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.google-apps.spreadsheet", "Google Planilhas"]
};
const scriptsCarregados = {};
function carregarScript(src) {
  return scriptsCarregados[src] ||= new Promise((ok, erro) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => { delete scriptsCarregados[src]; erro(new Error("script")); }; document.head.appendChild(s); });
}
function baixarBlob(nome, blob) {
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Converte o HTML das folhas (plano, material, prova) num documento Word
async function htmlParaDocx(html, estilo) {
  await carregarScript("/vendor/docx-9.5.1.umd.js");
  const D = window.docx;
  const fonte = estilo === "dislexia" ? "Verdana" : "Arial", tam = estilo === "ampliado" ? 36 : estilo === "dislexia" ? 28 : 24;
  const raiz = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html").body.firstChild;
  // o desenho do mapa mental vira uma imagem PNG dentro do documento
  const imagens = new Map();
  for (const w of raiz.querySelectorAll(".mapa-wrap")) {
    const svg = w.querySelector("svg"); if (!svg) continue;
    try {
      const vb = svg.viewBox.baseVal, esc2 = 2, img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
      await img.decode();
      const cv = document.createElement("canvas"); cv.width = vb.width * esc2; cv.height = vb.height * esc2;
      const g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
      const png = await new Promise(ok => cv.toBlob(ok, "image/png"));
      imagens.set(w, { data: new Uint8Array(await png.arrayBuffer()), w: vb.width, h: vb.height });
    } catch (_) {}
  }
  const BLOCO = new Set(["DIV", "P", "H1", "H2", "H3", "OL", "UL", "LI", "TABLE", "SECTION", "FIGURE"]);
  const temBloco = el => [...el.children].some(c => BLOCO.has(c.tagName));
  const runs = (el, fmt = {}) => {
    const out = [];
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, " "); if (t.trim() || out.length) out.push(new D.TextRun({ text: t, font: fonte, size: fmt.size || tam, bold: fmt.bold, italics: fmt.it, color: fmt.cor, superScript: fmt.sup })); }
      else if (n.nodeType === 1 && !BLOCO.has(n.tagName)) {
        if (n.tagName === "BR") out.push(new D.TextRun({ break: 1 }));
        else if (n.tagName === "IMG") out.push(new D.TextRun({ text: " [figura: veja a versão impressa] ", font: fonte, size: 18, italics: true, color: "666666" }));
        else out.push(...runs(n, { ...fmt, bold: fmt.bold || /^(B|STRONG)$/.test(n.tagName), it: fmt.it || /^(I|EM)$/.test(n.tagName), sup: n.tagName === "SUP", size: n.tagName === "SUP" ? 14 : fmt.size, cor: n.classList.contains("nl") ? "666666" : fmt.cor }));
      }
    });
    return out;
  };
  const par = (rs, o = {}) => new D.Paragraph({ children: rs, spacing: { after: o.after ?? 120, line: estilo === "dislexia" ? 400 : 300 }, indent: o.indent ? { left: o.indent } : undefined, border: o.border, alignment: o.align });
  const linhasTexto = (txt, fmt = {}) => String(txt).split("\n").map(l => par([new D.TextRun({ text: l, font: fonte, size: fmt.size || tam, bold: fmt.bold, color: fmt.cor })], { after: 60 }));
  const blocos = (el, nivel = 0) => {
    const out = [];
    let buf = null;
    const flush = () => { if (buf && buf.textContent.trim()) out.push(par(runs(buf), { indent: nivel })); buf = null; };
    for (const c of el.childNodes) {
      if (c.nodeType === 3 || (c.nodeType === 1 && !BLOCO.has(c.tagName))) { (buf ||= document.createElement("span")).appendChild(c.cloneNode(true)); continue; }
      flush();
      if (c.nodeType !== 1) continue;
      const tag = c.tagName, cls = c.classList;
      if (cls.contains("mapa-wrap")) { const im = imagens.get(c); if (im) out.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 160 }, children: [new D.ImageRun({ type: "png", data: im.data, transformation: { width: 640, height: Math.round(640 * im.h / im.w) } })] })); continue; }
      if (tag.toLowerCase() === "svg") continue;
      if (tag === "H1") out.push(par(runs(c, { bold: true, size: Math.round(tam * 1.4) }), { after: 160 }));
      else if (tag === "H2" || tag === "H3") out.push(par(runs(c, { bold: true, size: Math.round(tam * 1.1), cor: tag === "H3" ? "0B7C8A" : undefined }), { after: 80 }));
      else if (cls.contains("linhas")) [...c.children].forEach(() => out.push(par([new D.TextRun({ text: " ", font: fonte, size: tam })], { after: 80, indent: nivel, border: { bottom: { style: D.BorderStyle.SINGLE, size: 6, color: "888888", space: 1 } } })));
      else if (cls.contains("quadro")) out.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, rows: [new D.TableRow({ height: { value: 2400, rule: D.HeightRule.ATLEAST }, children: [new D.TableCell({ children: [par([])], borders: Object.fromEntries(["top", "bottom", "left", "right"].map(k => [k, { style: D.BorderStyle.DASHED, size: 8, color: "888888" }])) })] })] }), par([]));
      else if (cls.contains("gab")) out.push(par(runs(c, { bold: true, cor: "1F6B3B" }), { indent: nivel }));
      else if (tag === "OL" || tag === "UL") {
        const tipoL = c.getAttribute("type"), letra = tipoL === "a" || tipoL === "A" || cls.contains("alts"), base = tipoL === "A" ? 65 : 97;
        [...c.children].filter(li => li.tagName === "LI").forEach((li, i) => {
          const num = li.getAttribute("value") || (i + 1);
          const pre = tag === "UL" ? "• " : letra ? String.fromCharCode(base + i) + ") " : num + ". ";
          const prim = [...li.childNodes].filter(n => n.nodeType === 3 || !BLOCO.has(n.tagName));
          const tmp = document.createElement("span"); prim.forEach(n => tmp.appendChild(n.cloneNode(true)));
          const resto = [...li.children].filter(n => BLOCO.has(n.tagName));
          const primeiroBloco = !tmp.textContent.trim() && resto[0] && !/^(OL|UL|TABLE)$/.test(resto[0].tagName) && !resto[0].classList.contains("linhas") ? resto.shift() : null;
          const fonteRuns = primeiroBloco ? runs(primeiroBloco) : runs(tmp);
          out.push(par([new D.TextRun({ text: pre, font: fonte, size: tam, bold: !letra }), ...fonteRuns], { indent: nivel + (letra ? 360 : 0), after: 80 }));
          const sub = document.createElement("div"); resto.forEach(n => sub.appendChild(n.cloneNode(true)));
          out.push(...blocos(sub, nivel + 360));
        });
        out.push(par([], { after: 60 }));
      } else if (tag === "TABLE") {
        const rows = [...c.querySelectorAll("tr")];
        const cruz = cls.contains("cruz"), caca = cls.contains("caca");
        const lado = cruz || caca ? 440 : undefined;
        const ncol = Math.max(...rows.map(tr => tr.children.length));
        out.push(new D.Table({ alignment: D.AlignmentType.CENTER, ...(lado ? { layout: D.TableLayoutType.FIXED, columnWidths: Array(ncol).fill(lado), width: { size: ncol * lado, type: D.WidthType.DXA } } : {}), rows: rows.map(tr => new D.TableRow({ height: lado ? { value: lado, rule: D.HeightRule.EXACT } : undefined, children: [...tr.children].map(td => {
          const on = !cruz || td.classList.contains("on");
          const sup = td.querySelector("sup")?.textContent || "", txt = td.textContent.replace(sup, "").trim();
          const b = on ? { style: D.BorderStyle.SINGLE, size: cruz ? 12 : 4, color: cruz ? "111111" : "BBBBBB" } : { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" };
          const filhos = [];
          if (sup) filhos.push(new D.TextRun({ text: sup + " ", font: fonte, size: 12 }));
          if (txt) filhos.push(new D.TextRun({ text: txt, font: fonte, size: cruz || caca ? 22 : tam, bold: cruz || caca || td.tagName === "TH" }));
          return new D.TableCell({ width: lado ? { size: lado, type: D.WidthType.DXA } : undefined, borders: { top: b, bottom: b, left: b, right: b }, shading: td.classList.contains("achou") ? { fill: "FFE08A", type: D.ShadingType.CLEAR, color: "auto" } : undefined, verticalAlign: D.VerticalAlign.CENTER, children: [new D.Paragraph({ alignment: lado ? D.AlignmentType.CENTER : undefined, children: filhos })] });
        }) })) }), par([]));
      } else if (cls.contains("banco")) out.push(par(runs(c)));
      else if (cls.contains("sec")) { const h = c.querySelector("h3"), d = c.querySelector("div,p"); if (h) out.push(par(runs(h, { bold: true, cor: "0B7C8A" }), { after: 40 })); if (d) out.push(...linhasTexto(d.textContent)); out.push(par([], { after: 60 })); }
      else if (cls.contains("enun") || cls.contains("texto") && !temBloco(c)) out.push(...linhasTexto(c.textContent));
      else if (temBloco(c)) out.push(...blocos(c, nivel));
      else if (c.textContent.trim()) out.push(par(runs(c, { it: cls.contains("instr") || cls.contains("autoria") }), { indent: nivel }));
    }
    flush();
    return out;
  };
  const doc = new D.Document({ styles: { default: { document: { run: { font: fonte, size: tam } } } }, sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } }, children: blocos(raiz) }] });
  return D.Packer.toBlob(doc);
}

const corpoPlano = p => { const t = turma(p.turmaId); const sec = (h, v) => v ? `<div class="sec"><h3>${h}</h3><div>${esc(v)}</div></div>` : "";
  return `<div class="instr">${esc(t?.disciplina || "")} · ${esc(t?.nome || "")} · ${esc(fmtDataLonga(p.data))} · ${esc(p.duracao || "")}</div><h1>${esc(p.titulo)}</h1>${p.bncc ? `<p>BNCC: ${esc(p.bncc)}</p>` : ""}${sec("Objetivos", p.objetivos)}${sec("Conteúdos", p.conteudo)}${sec("Metodologia", p.metodologia)}${sec("Recursos", p.recursos)}${sec("Avaliação", p.avaliacao)}`; };

async function boletimXlsx(t) {
  await carregarScript("/vendor/exceljs-4.4.0.min.js");
  const wb = new ExcelJS.Workbook(); wb.creator = "Manu Professor";
  const avs = S.avaliacoes.filter(a => a.turmaId === t.id).sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const ws = wb.addWorksheet("Boletim", { views: [{ state: "frozen", xSplit: 1, ySplit: 2 }] });
  ws.addRow([`${t.nome} · ${t.disciplina}${t.ano ? " · " + t.ano : ""}`]).font = { bold: true, size: 14 };
  const cab = ws.addRow(["Aluno", ...avs.map(a => `${a.nome} (peso ${a.peso})`), "Média", "Frequência", "Situação"]);
  cab.eachCell(c => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B7C8A" } }; c.alignment = { vertical: "middle", horizontal: "center", wrapText: true }; });
  cab.height = 32;
  (t.alunos || []).forEach(s => {
    const m = mediaAluno(t, s.id), f = freqAluno(t, s.id);
    const sit = m === null ? "sem notas" : (m >= MEDIA_MIN && (f === null || f >= FREQ_MIN)) ? "em dia" : m < MEDIA_MIN ? "recuperação" : "frequência";
    const r = ws.addRow([s.nome, ...avs.map(a => { const n = a.notas?.[s.id]; return n == null || n === "" ? null : Number(n); }), m === null ? null : Math.round(m * 10) / 10, f === null ? null : f / 100, sit]);
    r.eachCell((c, i) => { if (i > 1 && i <= avs.length + 2) c.numFmt = "0.0"; });
    r.getCell(avs.length + 3).numFmt = "0%";
    if (m !== null && m < MEDIA_MIN) r.getCell(avs.length + 2).font = { bold: true, color: { argb: "FFA33A25" } };
    if (f !== null && f < FREQ_MIN) r.getCell(avs.length + 3).font = { bold: true, color: { argb: "FFA33A25" } };
  });
  ws.getColumn(1).width = 34; for (let i = 2; i <= avs.length + 4; i++) ws.getColumn(i).width = 16;
  const bs = bimestresDe(t);
  if (bs.length) {
    const wb2 = wb.addWorksheet("Médias por período", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    const h = wb2.addRow(["Aluno", ...bs.map(b => b.nome), "Média final", "Frequência anual"]);
    h.eachCell(c => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B7C8A" } }; });
    (t.alunos || []).forEach(s => {
      const ms = bs.map(b => { const m = mediaAluno(t, s.id, b.num); return m === null ? null : Math.round(m * 10) / 10; });
      const mf = mediaAnual(t, s.id), f = freqAluno(t, s.id);
      const row = wb2.addRow([s.nome, ...ms, mf === null ? null : Math.round(mf * 10) / 10, f === null ? null : f / 100]);
      row.eachCell((c, i) => { if (i > 1 && i <= bs.length + 2) c.numFmt = "0.0"; });
      row.getCell(bs.length + 3).numFmt = "0%";
    });
    wb2.getColumn(1).width = 34; for (let i = 2; i <= bs.length + 3; i++) wb2.getColumn(i).width = 16;
  }
  const ch = S.chamadas.filter(c => c.turmaId === t.id).sort((a, b) => a.data.localeCompare(b.data));
  if (ch.length) {
    const wf = wb.addWorksheet("Frequência", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    const h = wf.addRow(["Aluno", ...ch.map(c => fmtData(c.data))]); h.font = { bold: true };
    (t.alunos || []).forEach(s => wf.addRow([s.nome, ...ch.map(c => c.presencas?.[s.id] || "")]));
    wf.getColumn(1).width = 34;
  }
  return new Blob([await wb.xlsx.writeBuffer()], { type: MIME.xlsx[0] });
}

// Google Drive: o arquivo vai para o Drive do professor e abre convertido no app do Google
let gToken = null, gTokenAte = 0;
let gServidorSem = false;
async function conectarDrive() {
  await carregarScript("https://accounts.google.com/gsi/client");
  google.accounts.oauth2.initCodeClient({ client_id: S.googleClientId, scope: "https://www.googleapis.com/auth/drive.file", ux_mode: "popup", select_account: false,
    callback: async resp => {
      if (!resp.code) { toast("A conexão com o Google foi cancelada."); return; }
      try { await api("POST", "/api/google/conectar", { code: resp.code }); S.googleConectado = true; gServidorSem = false; render(); toast("Google Drive conectado"); }
      catch (e) { abrirDlg("Falta um passo", `<p>${esc(e.message || "Não foi possível conectar o Google Drive.")}</p>`, `<button type="button" class="btn" data-act="fechar">Fechar</button><button type="button" class="btn primary" data-act="conectar-drive">Tentar de novo</button>`); }
    } }).requestCode();
}
document.addEventListener("click", e => { if (e.target.closest("[data-act='conectar-drive']")) { if (dlg.open) fechar(); conectarDrive().catch(() => toast("Não foi possível abrir a janela do Google. Permita pop-ups.")); } });
async function tokenGoogle() {
  if (gToken && Date.now() < gTokenAte) return gToken;
  if (!gServidorSem) {
    const r = await fetch("/api/google/token").catch(() => null);
    if (r && r.ok) { const j = await r.json(); gToken = j.access_token; gTokenAte = Date.now() + (Number(j.expires_in || 3600) - 120) * 1000; return gToken; }
    gServidorSem = true;
  }
  await carregarScript("https://accounts.google.com/gsi/client");
  return new Promise((ok, erro) => {
    const cli = google.accounts.oauth2.initTokenClient({ client_id: S.googleClientId, scope: "https://www.googleapis.com/auth/drive.file",
      callback: r => { if (r.error) return erro(new Error(r.error)); gToken = r.access_token; gTokenAte = Date.now() + (Number(r.expires_in || 3000) - 120) * 1000; ok(gToken); },
      error_callback: e => erro(new Error(e.type || "popup")) });
    cli.requestAccessToken();
  });
}
// Pastas no Drive do professor: Manu Professor / <turma> / <tipo>. Com a permissão drive.file,
// o sistema só enxerga as pastas e arquivos que ele mesmo criou.
const PASTA = "application/vnd.google-apps.folder", gPastas = {};
async function gFetch(url, token, opt = {}) {
  const r = await fetch(url, { ...opt, headers: { Authorization: "Bearer " + token, ...(opt.headers || {}) } });
  if (r.status === 401) { gToken = null; throw new Error("auth"); }
  if (!r.ok) throw new Error("drive " + r.status);
  return r.json();
}
async function pastaDrive(nome, pai, token) {
  const chave = (pai || "raiz") + "/" + nome;
  if (gPastas[chave]) return gPastas[chave];
  const q = `mimeType='${PASTA}' and name='${nome.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}' and '${pai || "root"}' in parents and trashed=false`;
  const lista = await gFetch("https://www.googleapis.com/drive/v3/files?fields=files(id)&pageSize=1&q=" + encodeURIComponent(q), token);
  const id = lista.files?.[0]?.id || (await gFetch("https://www.googleapis.com/drive/v3/files?fields=id", token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nome, mimeType: PASTA, ...(pai ? { parents: [pai] } : {}) }) })).id;
  return gPastas[chave] = id;
}
const nomePastaTurma = t => t ? `${t.nome} · ${t.disciplina}${t.escola && t.escola !== escolaPrincipal() ? " · " + t.escola : ""}`.replace(/[\\/]/g, "-") : "Sem turma";
async function pastaDaTurma(turmaId, sub, token) {
  const raiz = await pastaDrive("Manu Professor", null, token);
  const pt = await pastaDrive(nomePastaTurma(turma(turmaId)), raiz, token);
  return { turma: pt, sub: sub ? await pastaDrive(sub, pt, token) : pt };
}
async function pastaAutomatica(turmaId) {
  if (!S.googleConectado || !S.googleClientId) return;
  try {
    const r = await fetch("/api/google/token"); if (!r.ok) return;
    const j = await r.json(); gToken = j.access_token; gTokenAte = Date.now() + (Number(j.expires_in || 3600) - 120) * 1000;
    const p = await pastaDaTurma(turmaId, "", gToken);
    for (const sub of ["Planos de aula", "Materiais", "Provas", "Slides", "Boletins"]) await pastaDrive(sub, p.turma, gToken);
    toast("Pasta da turma criada no seu Google Drive");
  } catch (_) {}
}
async function enviarDrive(nome, blob, tipo, turmaId, sub) {
  const [origem, destino, app] = MIME[tipo];
  let token;
  try { token = await tokenGoogle(); } catch (_) { toast("A conexão com o Google foi cancelada ou bloqueada. Permita a janela do Google e tente de novo."); return; }
  toast("Enviando para o seu Google Drive…");
  let pastas;
  try { pastas = await pastaDaTurma(turmaId, sub, token); } catch (_) { toast("Não foi possível criar a pasta no seu Google Drive. Tente de novo."); return; }
  const b = "manu" + Date.now();
  const corpo = new Blob([`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: nome, mimeType: destino, parents: [pastas.sub] })}\r\n--${b}\r\nContent-Type: ${origem}\r\n\r\n`, blob, `\r\n--${b}--`]);
  const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "multipart/related; boundary=" + b }, body: corpo }).catch(() => null);
  if (!r || !r.ok) { if (r && r.status === 401) gToken = null; toast("O Google não aceitou o arquivo agora. Tente de novo."); return; }
  const j = await r.json();
  abrirDlg("Salvo no seu Google Drive", `<p><b>${esc(nome)}</b> foi salvo na pasta <b>Manu Professor / ${esc(nomePastaTurma(turma(turmaId)))}${sub ? " / " + esc(sub) : ""}</b> do seu Google Drive e já pode ser editado no ${app}.</p>`,
    `<button type="button" class="btn" data-act="fechar">Fechar</button><a class="btn" href="https://drive.google.com/drive/folders/${esc(pastas.sub)}" target="_blank" rel="noopener">Abrir a pasta</a><a class="btn primary" href="${esc(j.webViewLink)}" target="_blank" rel="noopener">Abrir no ${app}</a>`);
}

async function exportar(alvo, formato, el) {
  if (el) el.disabled = true;
  try {
    let nome, blob, tipo, turmaId = "", sub = "";
    if (alvo.plano) { const p = alvo.plano; nome = p.titulo; tipo = "docx"; turmaId = p.turmaId; sub = "Planos de aula"; blob = await htmlParaDocx(corpoPlano(p)); }
    else if (alvo.material) { const m = alvo.material; nome = m.titulo + (alvo.gab ? " - gabarito" : ""); tipo = "docx"; turmaId = m.turmaId; sub = "Materiais"; blob = await htmlParaDocx(materialCorpo(m, !!alvo.gab), estiloFolha(m)); }
    else if (alvo.prova) { const p = alvo.prova; nome = p.titulo + (alvo.gab ? " - gabarito" : ""); tipo = "docx"; turmaId = p.turmaId; sub = "Provas"; blob = await htmlParaDocx(provaDoc(p, !!alvo.gab)); }
    else if (alvo.slides) { const d = alvo.slides; nome = d.titulo; tipo = "pptx"; turmaId = S.planos.find(x => x.id === d.planoId)?.turmaId || ""; sub = "Slides"; await carregarPptx(); blob = await montarPptx(d).write({ outputType: "blob" }); }
    else if (alvo.turma) { const t = alvo.turma; nome = "Boletim " + t.nome + " - " + new Date().toLocaleDateString("pt-BR"); tipo = "xlsx"; turmaId = t.id; sub = "Boletins"; blob = await boletimXlsx(t); }
    if (formato === "drive") await enviarDrive(nome, blob, tipo, turmaId, sub);
    else baixarBlob(slug(nome) + "." + tipo, blob);
  } catch (e) { console.error(e); toast("Não foi possível gerar o arquivo. Tente de novo."); }
  if (el) el.disabled = false;
}
const botoesExport = (dados, extra = "") => `<button type="button" class="btn" data-act="exp" data-fmt="arquivo" ${dados}${extra}>${ico("dl")}Word</button>${S.googleClientId ? `<button type="button" class="btn" data-act="exp" data-fmt="drive" ${dados}${extra}>${ico("drive")}Google Docs</button>` : ""}`;
document.addEventListener("click", async e => {
  const bp = e.target.closest("[data-act='drive-pasta']"); if (!bp) return;
  bp.disabled = true;
  try {
    const token = await tokenGoogle();
    const pastas = await pastaDaTurma(bp.dataset.id, "", token);
    for (const sub of ["Planos de aula", "Materiais", "Provas", "Slides", "Boletins"]) await pastaDrive(sub, pastas.turma, token);
    abrirDlg("Pasta da turma no Google Drive", `<p>A pasta <b>Manu Professor / ${esc(nomePastaTurma(turma(bp.dataset.id)))}</b> está pronta no seu Google Drive, com as subpastas Planos de aula, Materiais, Provas, Slides e Boletins. Tudo o que você salvar no Drive desta turma vai para lá.</p>`,
      `<button type="button" class="btn" data-act="fechar">Fechar</button><a class="btn primary" href="https://drive.google.com/drive/folders/${esc(pastas.turma)}" target="_blank" rel="noopener">Abrir a pasta</a>`);
  } catch (_) { toast("Não foi possível acessar o seu Google Drive. Permita a janela do Google e tente de novo."); }
  bp.disabled = false;
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act='exp']"); if (!b) return;
  const d = b.dataset, gab = d.gab === "1";
  const alvo = d.plano ? { plano: S.planos.find(x => x.id === d.plano) }
    : d.material ? { material: S.matAtual, gab }
    : d.prova ? { prova: S.provas.find(x => x.id === d.prova), gab }
    : d.slides ? { slides: S.slAtual }
    : d.turma ? { turma: turma(d.turma) } : null;
  if (alvo && Object.values(alvo)[0]) exportar(alvo, d.fmt, b);
});

/* ---------- Correção por foto ---------- */
// Questões objetivas da prova, na numeração da prova impressa
function objetivas(p) {
  return (p.questaoIds || []).map((id, i) => ({ q: S.questoes.find(x => x.id === id), n: i + 1 })).filter(x => x.q)
    .filter(x => x.q.tipo !== "aberta" && (x.q.alternativas || []).length >= 2)
    .map(x => { const vf = x.q.tipo === "vf"; const opcoes = vf ? "VF" : "ABCDE".slice(0, Math.min(5, x.q.alternativas.length));
      return { n: x.n, opcoes, certa: x.q.correta == null ? null : opcoes[x.q.correta] || null }; });
}
function folhaRespostasHTML(p) {
  const t = turma(p.turmaId), obj = objetivas(p);
  const metade = Math.ceil(obj.length / 2), cols = [obj.slice(0, metade), obj.slice(metade)];
  return `<div class="cab"><div>Escola: ________________________________</div><div>Data: ____/____/______</div><div>Nome: ____________________________________</div><div>Turma: ${t ? esc(t.nome) : "_______"}</div></div>
    <h1>Folha de respostas · ${esc(p.titulo)}</h1><p class="instr">Pinte totalmente UMA bolinha por questão, com caneta azul ou preta. Não rasure. As questões dissertativas são respondidas na prova.</p>
    <div class="fr"><span class="mk tl"></span><span class="mk tr"></span><span class="mk bl"></span><span class="mk br"></span>
    <div class="fr-cols">${cols.map(c => `<div class="fr-col">${c.map(o => `<div class="fr-q"><b>${String(o.n).padStart(2, "0")}</b>${[...o.opcoes].map(l => `<span class="bol">${l}</span>`).join("")}</div>`).join("")}</div>`).join("")}</div></div>`;
}
const CSS_FR = `.folha .fr{position:relative;border:1.5px solid #111;border-radius:6px;padding:26px 30px;margin-top:10px}
.folha .fr .mk{position:absolute;width:16px;height:16px;background:#111}.folha .fr .tl{top:6px;left:6px}.folha .fr .tr{top:6px;right:6px}.folha .fr .bl{bottom:6px;left:6px}.folha .fr .br{bottom:6px;right:6px}
.folha .fr-cols{display:grid;grid-template-columns:1fr 1fr;gap:0 40px}.folha .fr-q{display:flex;align-items:center;gap:12px;padding:7px 0;border-bottom:1px dotted #bbb;break-inside:avoid}
.folha .fr-q b{width:30px;font-size:14pt}.folha .bol{width:26px;height:26px;border:1.6px solid #111;border-radius:50%;display:inline-grid;place-items:center;font-size:10pt;font-weight:700;color:#555}`;
document.head.insertAdjacentHTML("beforeend", `<style>${CSS_FR}</style>`);

async function prepararFoto(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

function dlgCorrigir(p) {
  const t = turma(p.turmaId);
  if (!t || !(t.alunos || []).length) { toast("Associe a prova a uma turma com alunos para corrigir por foto."); return; }
  const obj = objetivas(p);
  if (!obj.length) { toast("Esta prova não tem questões de múltipla escolha ou V/F para corrigir por foto."); return; }
  const ja = S.avaliacoes.find(a => a.turmaId === t.id && a.provaId === p.id);
  dlg._cor = { provaId: p.id, alunoId: (t.alunos.find(a => !p.correcoes?.[a.id]) || t.alunos[0]).id, foto: "", leitura: null, marcadas: {}, avalId: ja ? ja.id : "nova", nota: "", status: "" };
  renderCorrecao();
}
function renderCorrecao() {
  const c = dlg._cor, p = S.provas.find(x => x.id === c.provaId), t = turma(p.turmaId), obj = objetivas(p);
  const abertas = (p.questaoIds || []).length - obj.length;
  const avs = S.avaliacoes.filter(a => a.turmaId === t.id);
  let corpo = `<div class="grid2"><div class="field"><label for="cAluno">Aluno</label><select class="input" id="cAluno">${t.alunos.map(a => `<option value="${esc(a.id)}" ${a.id === c.alunoId ? "selected" : ""}>${esc(a.nome)}${p.correcoes?.[a.id] ? " ✓ corrigida (" + fmtNota(p.correcoes[a.id].nota) + ")" : ""}</option>`).join("")}</select></div>
    <div class="field"><label for="cFoto">Foto da folha de respostas</label><input class="input" id="cFoto" type="file" accept="image/*" capture="environment"></div></div>
    <p class="small muted">Fotografe a folha inteira, de cima, com boa luz, mostrando os quatro quadradinhos pretos dos cantos.</p>`;
  if (c.foto) corpo += `<div class="cor-wrap"><img class="cor-foto" src="${c.foto}" alt="Foto da folha de respostas">
    <div class="ai-box"><div class="toolbar"><button type="button" class="btn ai" data-act="ia-corrigir" ${cap.ia ? "" : "disabled"}>${ico("spark")}${c.leitura ? "Ler de novo" : "Ler respostas"}</button><span class="ai-status" id="iaStatus">${esc(c.status || "A Manu lê as bolinhas marcadas. Você confere antes de lançar.")}</span></div></div></div>`;
  if (c.leitura) {
    const acertos = obj.filter(o => o.certa && c.marcadas[o.n] === o.certa).length;
    const duvidas = obj.filter(o => !c.marcadas[o.n]).length;
    if (c.nota === "") c.nota = String(Math.round(acertos / obj.length * 100) / 10).replace(".", ",");
    corpo += `${c.leitura.observacao ? `<div class="banner"><span>${esc(c.leitura.observacao)}</span></div>` : ""}
      ${c.leitura.nome ? `<p class="small">Nome lido na folha: <b>${esc(c.leitura.nome)}</b></p>` : ""}
      <div class="table-wrap"><table><thead><tr><th class="c">Questão</th><th class="c">Marcada</th><th class="c">Gabarito</th><th class="c">Resultado</th></tr></thead><tbody>
      ${obj.map(o => { const m = c.marcadas[o.n] || ""; const ok = m && m === o.certa;
        return `<tr><td class="c num">${o.n}</td><td class="c"><select class="input cor-sel" data-n="${o.n}" aria-label="Resposta marcada na questão ${o.n}" style="width:auto;min-height:34px;padding:2px 8px"><option value="">—</option>${[...o.opcoes].map(l => `<option ${m === l ? "selected" : ""}>${l}</option>`).join("")}</select></td><td class="c num">${o.certa || "?"}</td><td class="c">${!m ? '<span class="chip warn">conferir</span>' : ok ? '<span class="chip ok">certa</span>' : '<span class="chip bad">errada</span>'}</td></tr>`; }).join("")}
      </tbody></table></div>
      <p><b class="num">${acertos} de ${obj.length}</b> questões objetivas certas${duvidas ? ` · <span style="color:var(--warn)">${duvidas} para conferir na foto</span>` : ""}.${abertas ? ` Esta prova tem ${abertas} questão(ões) dissertativa(s), fora da correção automática: ajuste a nota se precisar.` : ""}</p>
      <div class="grid2"><div class="field"><label for="cNota">Nota (0 a 10)</label><input class="input" id="cNota" inputmode="decimal" value="${esc(c.nota)}"></div>
      <div class="field"><label for="cAval">Lançar na avaliação</label><select class="input" id="cAval"><option value="nova" ${c.avalId === "nova" ? "selected" : ""}>Nova avaliação: ${esc(p.titulo)}</option>${avs.map(a => `<option value="${esc(a.id)}" ${c.avalId === a.id ? "selected" : ""}>${esc(a.nome)}</option>`).join("")}</select></div></div>`;
  }
  abrirDlg("Corrigir por foto · " + esc(p.titulo), corpo, `<button type="button" class="btn" data-act="fechar">Fechar</button>${c.leitura ? `<button type="button" class="btn primary" data-act="cor-lancar">Lançar nota e ir para o próximo</button>` : ""}`);
}
async function lerFolha() {
  const c = dlg._cor, p = S.provas.find(x => x.id === c.provaId), obj = objetivas(p);
  await comIA(async (signal, st) => {
    const [cab, dados] = c.foto.split(",");
    const r = await iaJSON({ tipo: "correcao", imagem: dados, mime: cab.includes("png") ? "image/png" : "image/jpeg", questoes: obj.map(o => ({ n: o.n, opcoes: o.opcoes })) }, signal);
    if (!r || typeof r.respostas !== "object") throw { message: "Não consegui ler a folha. Tire outra foto, mais de perto e com boa luz." };
    c.leitura = r; c.marcadas = {}; c.nota = "";
    obj.forEach(o => { const v = r.respostas[String(o.n)]; if (typeof v === "string" && o.opcoes.includes(v.toUpperCase())) c.marcadas[o.n] = v.toUpperCase(); });
    st.textContent = c.status = "Leitura feita. Confira as marcações com a foto antes de lançar.";
  });
  const stEl = dlg.querySelector("#iaStatus"); if (stEl) c.status = stEl.textContent;
  renderCorrecao();
}
document.addEventListener("change", async e => {
  const c = dlg._cor; if (!c || !dlg.open) return;
  const el = e.target;
  if (el.id === "cAluno") { c.alunoId = el.value; c.foto = ""; c.leitura = null; c.marcadas = {}; c.nota = ""; c.status = ""; renderCorrecao(); }
  else if (el.id === "cFoto" && el.files[0]) { try { c.foto = await prepararFoto(el.files[0]); c.leitura = null; c.marcadas = {}; c.nota = ""; c.status = ""; renderCorrecao(); } catch (_) { toast("Não consegui abrir essa imagem. Tente uma foto em JPG ou PNG."); } }
  else if (el.classList.contains("cor-sel")) { c.marcadas[el.dataset.n] = el.value; c.nota = ""; renderCorrecao(); }
  else if (el.id === "cAval") c.avalId = el.value;
});
document.addEventListener("input", e => { if (e.target.id === "cNota" && dlg._cor) dlg._cor.nota = e.target.value; });
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act='ia-corrigir'],[data-act='cor-lancar'],[data-act='folha-respostas'],[data-act='corrigir-foto']"); if (!b) return;
  const act = b.dataset.act;
  if (act === "folha-respostas") { const p = S.provas.find(x => x.id === b.dataset.id); if (!objetivas(p).length) { toast("Esta prova não tem questões objetivas."); return; } imprimir(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Folha de respostas</title><style>@page{size:A4;margin:14mm}body{margin:0}${CSS_FOLHA}${CSS_FR}</style></head><body><div class="folha">${folhaRespostasHTML(p)}</div></body></html>`); return; }
  if (act === "corrigir-foto") { dlgCorrigir(S.provas.find(x => x.id === b.dataset.id)); return; }
  if (act === "ia-corrigir") { lerFolha(); return; }
  const c = dlg._cor, p = S.provas.find(x => x.id === c.provaId), t = turma(p.turmaId);
  const nota = Number(String(c.nota).replace(",", "."));
  if (!(nota >= 0 && nota <= 10)) { toast("A nota deve ser um número de 0 a 10."); return; }
  let av = c.avalId === "nova" ? null : JSON.parse(JSON.stringify(S.avaliacoes.find(a => a.id === c.avalId) || null));
  if (!av) { av = { id: uid(), turmaId: t.id, nome: p.titulo, peso: 1, data: p.data || hoje(), bimestre: "1", provaId: p.id, notas: {} }; c.avalId = av.id; }
  av.notas = av.notas || {}; av.notas[c.alunoId] = Math.round(nota * 10) / 10;
  await salvar("avaliacoes", av);
  const pr = JSON.parse(JSON.stringify(p)); pr.correcoes = pr.correcoes || {};
  pr.correcoes[c.alunoId] = { respostas: c.marcadas, nota: av.notas[c.alunoId], em: new Date().toISOString() };
  await salvar("provas", pr);
  const aluno = t.alunos.find(a => a.id === c.alunoId);
  toast(`Nota de ${aluno ? aluno.nome.split(" ")[0] : "aluno"} lançada: ${fmtNota(av.notas[c.alunoId])}`);
  const prox = t.alunos.find(a => !pr.correcoes[a.id]);
  if (!prox) { fechar(); toast("Todas as provas da turma foram corrigidas"); return; }
  Object.assign(c, { alunoId: prox.id, foto: "", leitura: null, marcadas: {}, nota: "", status: "" });
  renderCorrecao();
});

/* ---------- Banco de questões do Enem (dados do INEP via enem.dev) ---------- */
const AREA_CURTA = { linguagens: "Linguagens", "ciencias-humanas": "Ciências Humanas", "ciencias-natureza": "Ciências da Natureza", matematica: "Matemática" };
S.enemF = { ano: 2023, area: "", busca: "", pagina: 0 }; S.enemRes = null; S.enemBusy = false; S.enemErro = "";
const urlOk = u => typeof u === "string" && /^https:\/\//.test(u);
function jaGuardada(ano, q) { return S.questoes.some(x => x.enem && x.enem.ano === ano && x.enem.i === q.i && (x.enem.lingua || null) === (q.lingua || null)); }
function vEnem() {
  const f = S.enemF, r = S.enemRes;
  const anos = Array.from({ length: 15 }, (_, i) => 2023 - i);
  return `<div class="page-head"><div><span class="eyebrow"><a href="${lk("questoes")}">Banco de questões</a> / Enem</span><h1>Questões do Enem</h1><p class="muted">Provas oficiais de 2009 a 2023, publicadas pelo INEP. Guarde as que quiser no seu banco para usar nas provas.</p></div></div>
  <section class="panel"><form class="toolbar" id="enemForm" style="align-items:flex-end">
    <div class="field"><label for="eAno">Ano</label><select class="input" id="eAno">${anos.map(a => `<option ${f.ano === a ? "selected" : ""}>${a}</option>`).join("")}</select></div>
    <div class="field"><label for="eArea">Área</label><select class="input" id="eArea"><option value="">Todas</option>${Object.entries(AREA_CURTA).map(([k, v]) => `<option value="${k}" ${f.area === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="field" style="flex:1;min-width:200px"><label for="eBusca">Palavra-chave (opcional)</label><input class="input" id="eBusca" type="search" value="${esc(f.busca)}" placeholder="Ex.: porcentagem, fotossíntese, modernismo"></div>
    <button class="btn primary" type="submit" ${S.enemBusy ? "disabled" : ""}>${S.enemBusy ? "Buscando…" : "Buscar"}</button></form>
    ${S.enemBusy ? `<p class="muted small">Buscando as questões do Enem ${f.ano}. A primeira busca de cada ano pode levar até 30 segundos; as próximas são instantâneas.</p>` : ""}
    ${S.enemErro ? `<p class="auth-erro">${esc(S.enemErro)}</p>` : ""}
  </section>
  ${r ? `<section class="panel"><div class="panel-head"><h2>${r.total} ${r.total === 1 ? "questão" : "questões"} · Enem ${r.ano}</h2>
    ${r.total > r.porPagina ? `<div class="toolbar"><button class="btn sm" data-act="enem-pag" data-d="-1" ${r.pagina === 0 ? "disabled" : ""}>Anterior</button><span class="small num">Página ${r.pagina + 1} de ${Math.ceil(r.total / r.porPagina)}</span><button class="btn sm" data-act="enem-pag" data-d="1" ${(r.pagina + 1) * r.porPagina >= r.total ? "disabled" : ""}>Próxima</button></div>` : ""}</div>
    ${r.questoes.length ? `<div class="list">${r.questoes.map((q, k) => `<article class="row enem-q" style="align-items:flex-start"><div class="grow">
      <div class="toolbar" style="margin-bottom:6px"><span class="chip acc">Enem ${r.ano} · questão ${q.i}</span><span class="chip">${esc(AREA_CURTA[q.area] || q.area)}</span>${q.lingua ? `<span class="chip">${q.lingua === "ingles" ? "Inglês" : "Espanhol"}</span>` : ""}</div>
      ${q.texto ? `<div class="enem-txt">${esc(q.texto)}</div>` : ""}${(q.imagens || []).filter(urlOk).map(u => `<img class="q-img" src="${esc(u)}" alt="Figura da questão ${q.i}" loading="lazy">`).join("")}
      ${q.intro ? `<p class="enem-intro"><b>${esc(q.intro)}</b></p>` : ""}
      <ol type="A" class="enem-alts">${q.alts.map(a => `<li class="${a.l === q.certa ? "correct" : ""}">${esc(a.t)}${urlOk(a.img) ? `<img class="q-img" src="${esc(a.img)}" alt="Alternativa ${a.l}" loading="lazy">` : ""}</li>`).join("")}</ol>
      <p class="small" style="color:var(--ok)"><b>Gabarito:</b> ${esc(q.certa)}</p></div>
      ${jaGuardada(r.ano, q) ? `<span class="chip ok">No seu banco</span>` : `<button class="btn sm primary" data-act="enem-guardar" data-k="${k}">Guardar no meu banco</button>`}</article>`).join("")}</div>`
      : `<p class="muted">Nenhuma questão encontrada com esses filtros. Tente outra palavra ou outra área.</p>`}
  </section>` : `<div class="empty"><img class="manu sm" src="/manu/manu-ajuda.webp" alt=""><h3>Escolha o ano e a área</h3><p>As questões aparecem com texto, imagens, alternativas e gabarito oficiais.</p></div>`}
  <p class="small muted">Questões do Exame Nacional do Ensino Médio, elaboradas e publicadas pelo INEP/MEC. Organização dos dados: projeto aberto enem.dev.</p>`;
}
async function buscarEnem() {
  const f = S.enemF; S.enemBusy = true; S.enemErro = ""; render();
  try { S.enemRes = await api("GET", `/api/enem?ano=${f.ano}&area=${encodeURIComponent(f.area)}&busca=${encodeURIComponent(f.busca)}&pagina=${f.pagina}`); }
  catch (e) { S.enemErro = (e && e.message) || "Não foi possível buscar agora. Tente de novo."; }
  S.enemBusy = false; render(); window.scrollTo(0, 0);
}
document.addEventListener("submit", e => { if (e.target.id !== "enemForm") return; e.preventDefault(); const f = S.enemF; f.ano = Number($("#eAno").value); f.area = $("#eArea").value; f.busca = $("#eBusca").value.trim(); f.pagina = 0; buscarEnem(); });
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act^='enem-']"); if (!b) return;
  if (b.dataset.act === "enem-pag") { S.enemF.pagina = Math.max(0, S.enemF.pagina + Number(b.dataset.d)); buscarEnem(); return; }
  const r = S.enemRes, q = r && r.questoes[Number(b.dataset.k)]; if (!q) return;
  const letras = q.alts.map(a => a.l);
  const nova = { id: uid(), disciplina: AREA_CURTA[q.area] || q.area, tema: "Enem " + r.ano, serie: "Ensino Médio", tipo: "multipla", dificuldade: "media",
    enunciado: [q.texto, q.intro].filter(Boolean).join("\n\n"), imagens: (q.imagens || []).filter(urlOk),
    alternativas: q.alts.map(a => a.t || "(alternativa em imagem)"), altImgs: q.alts.map(a => urlOk(a.img) ? a.img : null),
    correta: Math.max(0, letras.indexOf(q.certa)), resposta: "", bncc: "",
    fonte: `Enem ${r.ano}, questão ${q.i}${q.lingua ? (q.lingua === "ingles" ? " (inglês)" : " (espanhol)") : ""} · INEP/MEC`, enem: { ano: r.ano, i: q.i, lingua: q.lingua || null } };
  b.disabled = true; await salvar("questoes", nova); toast("Questão guardada no seu banco");
});

/* ---------- Bimestres da turma ---------- */
const MODELOS_PERIODO = {
  bimestre: [["1º bimestre", "02-02", "04-17"], ["2º bimestre", "04-20", "07-10"], ["3º bimestre", "07-27", "10-02"], ["4º bimestre", "10-05", "12-18"]],
  trimestre: [["1º trimestre", "02-02", "05-15"], ["2º trimestre", "05-18", "08-28"], ["3º trimestre", "08-31", "12-18"]]
};
function bimestresPadrao(ano, tipo = "bimestre") {
  const a = /^\d{4}$/.test(String(ano || "")) ? String(ano) : String(new Date().getFullYear());
  return MODELOS_PERIODO[tipo].map(([nome, i, f], k) => ({ num: k + 1, nome, inicio: a + "-" + i, fim: a + "-" + f }));
}
S.bimSel = {}; S.bimNovo = { tipo: "bimestre", ano: String(new Date().getFullYear()) };
function semanasDo(b) {
  const out = []; const d = new Date(b.inicio + "T12:00:00"); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const fim = new Date(b.fim + "T12:00:00"); let n = 1;
  while (d <= fim) {
    const seg = d.toISOString().slice(0, 10), sex = new Date(d); sex.setDate(sex.getDate() + 4);
    const ini = seg < b.inicio ? b.inicio : seg, f = sex.toISOString().slice(0, 10) > b.fim ? b.fim : sex.toISOString().slice(0, 10);
    out.push({ n: n++, inicio: ini, fim: f, rotulo: `${fmtData(ini)} a ${fmtData(f)}` });
    d.setDate(d.getDate() + 7);
  }
  return out;
}
function statusBim(b) { const d = hoje(); return d < b.inicio ? ["próximo", ""] : d > b.fim ? ["encerrado", "ok"] : ["em andamento", "acc"]; }
const mediaTurma = (t, bim) => { const ms = (t.alunos || []).map(a => mediaAluno(t, a.id, bim)).filter(x => x !== null); return ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : null; };
const freqTurma = (t, bim) => { const fs = (t.alunos || []).map(a => freqAluno(t, a.id, bim)).filter(x => x !== null); return fs.length ? Math.round(fs.reduce((a, b) => a + b, 0) / fs.length) : null; };
function chipsPeriodo(t) {
  const bs = bimestresDe(t); if (!bs.length) return "";
  const sel = S.view === "notas" && S.notasGeral ? "" : String(bimSelecionado(t));
  return `<div class="periodos" role="group" aria-label="Período">${bs.map(b => `<button type="button" class="per" data-act="bim-sel" data-v="${b.num}" aria-pressed="${sel === String(b.num)}">${esc(b.nome)}</button>`).join("")}<button type="button" class="per" data-act="bim-sel" data-v="" aria-pressed="${sel === ""}">${S.view === "notas" ? "Média geral" : "Ano todo"}</button></div>`;
}

/* Habilidades, recursos e tecnologia de cada bimestre */
const RECURSOS = [["Na sala", ["Livro didático", "Quadro", "Material impresso", "Material concreto", "Jogos de tabuleiro ou cartas", "Cartazes", "Biblioteca"]],
  ["Tecnologia", ["Projetor ou TV", "Computador do professor", "Caixa de som", "Laboratório de informática", "Chromebooks ou tablets", "Celular dos alunos", "Internet na sala", "Lousa digital", "Kit de robótica"]]];
const TEC = new Set(RECURSOS[1][1]);
S.bimAberto = {};
document.addEventListener("toggle", e => { const d = e.target; if (d.classList && d.classList.contains("bim-det")) S.bimAberto[d.dataset.chave] = d.open; }, true);
const habsDe = b => Array.isArray(b.habs) ? b.habs : [];
const textoHab = h => (h.codigo ? h.codigo + " – " : "") + h.descricao;
function lerHab(txt) { const m = String(txt).trim().match(/^((?:EI|EF|EM)\d{2}[A-Z]{2,4}\d{2,3})\s*[-–:.)]?\s*(.*)$/i); return m ? { codigo: m[1].toUpperCase(), descricao: m[2].trim() } : { codigo: "", descricao: String(txt).trim() }; }
async function mudarBim(num, fn, msg) { const t = turmaAtual(), nt = JSON.parse(JSON.stringify(t)), nb = bimPorNum(nt, num); fn(nb, nt); await salvar("turmas", nt); if (msg) toast(msg); }
// "Criar com IA" do bimestre: tudo que usa IA abre a partir daqui, já com o bimestre escolhido
function bimIA(b) {
  const t = turmaAtual(), sel = String(bimSelecionado(t)), ativo = sel === String(b.num);
  if (!ativo) return `<div class="toolbar"><button class="btn ai sm" data-act="bim-ativar" data-num="${b.num}">${ico("spark")}Criar com IA no ${esc(b.nome)}</button></div>`;
  const item = f => {
    const href = f.acao ? "" : f.href ? linkTurma(t.id, f.href.replace("#", "")) : linkTurma(t.id, f.aba);
    const attrs = f.acao ? `data-act="${f.acao}" data-num="${b.num}" data-bim-ir="${b.num}"` : `href="${href}" data-bim-ir="${b.num}" ${f.sub ? `data-act="ia-mat" data-v="${f.sub}"` : ""}`;
    return `<${f.acao ? "button type=\"button\"" : "a"} class="ia-card${f.sub ? " sub" : ""}" ${attrs}><b>${f.nome}</b>${f.desc ? `<small>${f.desc}</small>` : ""}</${f.acao ? "button" : "a"}>`;
  };
  const grupos = [], ferr = [{ grupo: "Planejamento do bimestre" }, { acao: "bim-ia", nome: "Planejar o bimestre", desc: "Semana a semana, BNCC" }, { acao: "bim-hab-ia", nome: "Habilidades da BNCC", desc: "Sugestões para o período" }, { acao: "bim-tec-ia", nome: "Ideias de tecnologia", desc: "Com e sem internet" },
    { grupo: "Aulas" }, ...FERRAMENTAS_IA.slice(0, 2), ...FERRAMENTAS_IA.slice(2)];
  let atual = null;
  for (const f of ferr) { if (f.grupo) { atual = { nome: f.grupo, itens: [] }; grupos.push(atual); } else atual.itens.push(f); }
  grupos.push({ nome: "Banco e Enem", itens: [{ href: "#questoes", nome: "Banco de questões", desc: "Suas questões guardadas" }, { href: "#enem", nome: "Questões do Enem", desc: "Provas oficiais do INEP" }] });
  return `<div class="bim-ia"><div class="bim-ia-tit">${ico("spark")}<b>Criar com IA no ${esc(b.nome)}</b></div>${grupos.map(g => `<div class="bim-ia-grupo"><span>${esc(g.nome)}</span><div class="bim-ia-itens">${g.itens.map(item).join("")}</div></div>`).join("")}</div>`;
}
document.addEventListener("click", e => {
  const a = e.target.closest("[data-bim-ir]"); if (a) { const t = turmaAtual(); if (t) S.bimSel[t.id] = String(a.dataset.bimIr); }
  const at = e.target.closest("[data-act='bim-ativar']"); if (at) { const t = turmaAtual(); S.bimSel[t.id] = String(at.dataset.num); render(); setTimeout(() => document.getElementById("bim-" + at.dataset.num)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
}, true);
function bimExtras(b) {
  const hs = habsDe(b), rec = b.recursos || [], ids = b.ideiasTec || [], outros = rec.filter(x => !RECURSOS.some(g => g[1].includes(x)));
  const t = turmaAtual(), chave = t.id + ":" + b.num, sel = bimSelecionado(t);
  const aberto = S.bimAberto[chave] ?? (String(sel) === String(b.num) || (!sel && hoje() >= b.inicio && hoje() <= b.fim));
  return `<details class="bim-det" data-chave="${esc(chave)}" ${aberto ? "open" : ""}><summary><b>Habilidades, recursos e tecnologia</b><span class="small muted">${hs.length} habilidade${hs.length === 1 ? "" : "s"} · ${rec.length} recurso${rec.length === 1 ? "" : "s"} · ${ids.length} ideia${ids.length === 1 ? "" : "s"} de tecnologia</span></summary><div class="bim-extras">
    <div class="bim-box"><div class="bim-box-h"><h3>Habilidades (BNCC)</h3><button class="btn ai sm" data-act="bim-hab-ia" data-num="${b.num}">${ico("spark")}Sugerir com IA</button></div>
      ${hs.length ? `<ul class="bim-habs">${hs.map((h, i) => `<li>${h.codigo ? `<span class="bncc">${esc(h.codigo)}</span>` : ""}<span>${esc(h.descricao)}</span><button type="button" class="btn ghost sm" data-act="bim-hab-rem" data-num="${b.num}" data-i="${i}" aria-label="Tirar habilidade">×</button></li>`).join("")}</ul>` : `<p class="small muted">Nenhuma habilidade ainda. Digite abaixo ou peça sugestões à Manu.</p>`}
      <form class="perfil-add" data-form="bim-hab" data-num="${b.num}"><input class="input" name="hab" placeholder="Ex.: EF07MA01 – Resolver problemas com números naturais" maxlength="400" aria-label="Nova habilidade"><button class="btn sm" type="submit">${ico("plus")}Adicionar</button></form></div>
    <div class="bim-box"><div class="bim-box-h"><h3>O que vou usar nas aulas</h3></div>
      ${RECURSOS.map(([g, xs]) => `<div class="rec-grupo"><span class="small muted">${g}</span><div class="chips-esc">${xs.map(x => `<button type="button" class="tn-op" data-act="bim-rec" data-num="${b.num}" data-v="${esc(x)}" aria-pressed="${rec.includes(x)}">${rec.includes(x) ? "✓ " : ""}${esc(x)}</button>`).join("")}</div></div>`).join("")}
      ${outros.length ? `<div class="chips-esc">${outros.map(x => `<button type="button" class="tn-op" data-act="bim-rec" data-num="${b.num}" data-v="${esc(x)}" aria-pressed="true">✓ ${esc(x)} ×</button>`).join("")}</div>` : ""}
      <form class="perfil-add" data-form="bim-rec" data-num="${b.num}" style="margin-top:8px"><input class="input" name="rec" placeholder="Outro recurso. Ex.: horta da escola" maxlength="80" aria-label="Outro recurso"><button class="btn sm" type="submit">${ico("plus")}Adicionar</button></form></div>
    <div class="bim-box bim-tec"><div class="bim-box-h"><div><h3>Tecnologia nas aulas</h3><p class="small muted">Ideias ligadas às habilidades e aos recursos marcados, com pelo menos uma sem internet.</p></div><button class="btn ai sm" data-act="bim-tec-ia" data-num="${b.num}">${ico("spark")}${ids.length ? "Mais ideias com IA" : "Ideias com IA"}</button></div>
      ${ids.length ? `<div class="tec-ideias">${ids.map((x, i) => `<article class="tec-ideia"><div class="tec-tags">${x.eixo ? `<span class="chip">${esc(x.eixo)}</span>` : ""}${x.precisa ? `<span class="chip acc">${esc(x.precisa)}</span>` : ""}${x.habilidade ? `<span class="bncc">${esc(x.habilidade)}</span>` : ""}</div>
        <h4>${esc(x.titulo)}</h4>${x.objetivo ? `<p class="small">${esc(x.objetivo)}</p>` : ""}${x.ferramentas ? `<p class="small"><b>Usa:</b> ${esc(x.ferramentas)}</p>` : ""}
        ${(x.passos || []).length ? `<ol class="small">${x.passos.map(p => `<li>${esc(p)}</li>`).join("")}</ol>` : ""}
        <p class="small muted">${x.duracao ? esc(x.duracao) : ""}${x.avaliacao ? ` · Avaliação: ${esc(x.avaliacao)}` : ""}</p>
        <div class="toolbar"><button class="btn sm primary" data-act="bim-tec-plano" data-num="${b.num}" data-i="${i}">Virar plano de aula</button><button class="btn sm ghost" data-act="bim-tec-rem" data-num="${b.num}" data-i="${i}">Tirar</button></div></article>`).join("")}</div>` : ""}</div>
  </div></details>`;
}
function dlgHabIA(num) {
  const t = turmaAtual(), b = bimPorNum(t, num); dlg._bim = num; dlg._habs = [];
  abrirDlg(`Habilidades do ${esc(b.nome)}`, `<p class="small muted">${esc(t.nome)} · ${esc(t.disciplina)}${t.serie ? " · " + esc(t.serie) : ""}</p>
    <div class="field"><label for="hbCont">Conteúdos do bimestre (opcional)</label><textarea class="input" id="hbCont" rows="3" placeholder="Ex.: frações e números decimais. Se deixar vazio, a Manu segue o esperado para a série.">${esc(b.conteudos || "")}</textarea></div>
    <div class="ai-box"><div class="toolbar"><button type="button" class="btn ai" data-act="ia-habs">${ico("spark")}Sugerir habilidades</button><button type="button" class="btn ghost sm" data-act="parar-ia" hidden id="iaStop">Parar</button><span class="ai-status" id="iaStatus">Confira os códigos antes de usar.</span></div></div>
    <div id="hbLista"></div>`,
    `<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="bim-hab-salvar" disabled id="hbOk">Adicionar marcadas</button>`);
}
async function iaHabs() {
  const t = turmaAtual(), bs = bimestresDe(t), b = bimPorNum(t, dlg._bim);
  await comIA(async (signal, st) => {
    const r = await iaJSON({ tipo: "habilidades", periodo: b.nome, numero: Math.max(1, bs.indexOf(b) + 1), total: Math.max(1, bs.length), conteudos: val("hbCont") || undefined, turma: turmaIA(t.id) }, signal);
    const hs = (r && Array.isArray(r.habilidades) ? r.habilidades : []).map(h => ({ codigo: String(h.codigo || "").toUpperCase().slice(0, 20), descricao: String(h.descricao || "").slice(0, 380) })).filter(h => h.descricao);
    if (!hs.length) throw { message: "A resposta veio vazia. Tente de novo." };
    const ja = new Set(habsDe(b).map(h => h.codigo).filter(Boolean));
    dlg._habs = hs;
    document.getElementById("hbLista").innerHTML = `<div class="list">${hs.map((h, i) => `<label class="check"><input type="checkbox" name="hbSel" value="${i}" ${ja.has(h.codigo) ? "disabled" : "checked"}><span>${h.codigo ? `<span class="bncc">${esc(h.codigo)}</span> ` : ""}${esc(h.descricao)}${ja.has(h.codigo) ? ' <span class="small muted">(já está)</span>' : ""}</span></label>`).join("")}</div>`;
    document.getElementById("hbOk").disabled = false; st.textContent = "Marque as que vai usar.";
  });
}
function dlgTecIA(num) {
  const t = turmaAtual(), b = bimPorNum(t, num); dlg._bim = num;
  const tec = (b.recursos || []).filter(x => TEC.has(x));
  abrirDlg(`Tecnologia no ${esc(b.nome)}`, `<p class="small muted">${esc(t.nome)} · ${esc(t.disciplina)} · ${habsDe(b).length || (b.plano?.habilidades || []).length} habilidades · ${tec.length ? "tecnologia marcada: " + tec.map(esc).join(", ") : "nenhuma tecnologia marcada (a Manu vai sugerir atividades sem equipamento)"}</p>
    <div class="grid2"><div class="field"><label for="tcQtd">Quantas ideias</label><select class="input" id="tcQtd">${[3, 4, 5, 6].map(n => `<option ${n === 4 ? "selected" : ""}>${n}</option>`).join("")}</select></div>
    <div class="field"><label for="tcObs">Algo a considerar (opcional)</label><input class="input" id="tcObs" placeholder="Ex.: só 10 computadores; internet fraca; turma agitada"></div></div>
    <div class="ai-box"><div class="toolbar"><button type="button" class="btn ai" data-act="ia-tec">${ico("spark")}Gerar ideias</button><button type="button" class="btn ghost sm" data-act="parar-ia" hidden id="iaStop">Parar</button><span class="ai-status" id="iaStatus">As ideias ficam guardadas no bimestre.</span></div></div>`,
    `<button type="button" class="btn" data-act="fechar">Fechar</button>`);
}
async function iaTec() {
  const t = turmaAtual(), b = bimPorNum(t, dlg._bim);
  const habs = habsDe(b).length ? habsDe(b).map(textoHab) : (b.plano?.habilidades || []);
  await comIA(async (signal, st) => {
    const r = await iaJSON({ tipo: "tecnologia", periodo: b.nome, habilidades: habs.slice(0, 25).map(x => String(x).slice(0, 400)), recursos: (b.recursos || []).slice(0, 40), quantidade: Number(val("tcQtd")) || 4, observacoes: val("tcObs") || undefined, turma: turmaIA(t.id) }, signal);
    const ids = (r && Array.isArray(r.ideias) ? r.ideias : []).map(x => ({ id: uid(), titulo: String(x.titulo || "Atividade").slice(0, 160), eixo: String(x.eixo || "").slice(0, 60), habilidade: String(x.habilidade || "").slice(0, 40), precisa: String(x.precisa || "").slice(0, 60),
      ferramentas: String(x.ferramentas || "").slice(0, 300), objetivo: String(x.objetivo || "").slice(0, 400), passos: (Array.isArray(x.passos) ? x.passos : []).slice(0, 8).map(p => String(p).slice(0, 300)), duracao: String(x.duracao || "").slice(0, 80), avaliacao: String(x.avaliacao || "").slice(0, 300) }));
    if (!ids.length) throw { message: "A resposta veio vazia. Tente de novo." };
    await mudarBim(b.num, nb => { nb.ideiasTec = [...(nb.ideiasTec || []), ...ids].slice(-20); });
    st.textContent = "Pronto."; fechar(); toast(`${ids.length} ideias de tecnologia no ${b.nome}`);
    setTimeout(() => document.querySelector(`#bim-${b.num} .bim-tec`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  });
}
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-form='bim-hab'],[data-form='bim-rec']"); if (!f) return; e.preventDefault();
  const num = Number(f.dataset.num), v = (f.elements.hab || f.elements.rec).value.trim(); if (!v) return;
  if (f.dataset.form === "bim-hab") await mudarBim(num, nb => { nb.habs = [...habsDe(nb), lerHab(v)]; }, "Habilidade adicionada");
  else await mudarBim(num, nb => { const rc = nb.recursos || []; if (!rc.includes(v)) nb.recursos = [...rc, v]; }, "Recurso adicionado");
  document.querySelector(`[data-form='${f.dataset.form}'][data-num='${num}'] input`)?.focus();
});
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act^='bim-hab'],[data-act='bim-rec'],[data-act^='bim-tec'],[data-act='ia-habs'],[data-act='ia-tec']"); if (!b) return;
  const act = b.dataset.act, num = Number(b.dataset.num || dlg._bim), t = turmaAtual(); if (!t) return;
  if (act === "bim-hab-ia") return dlgHabIA(num);
  if (act === "ia-habs") return iaHabs();
  if (act === "bim-tec-ia") return dlgTecIA(num);
  if (act === "ia-tec") return iaTec();
  if (act === "bim-hab-salvar") {
    const sel = [...dlg.querySelectorAll('input[name="hbSel"]:checked')].map(x => dlg._habs[Number(x.value)]); fechar();
    if (sel.length) await mudarBim(num, nb => { nb.habs = [...habsDe(nb), ...sel]; }, `${sel.length} habilidades adicionadas`);
    return;
  }
  if (act === "bim-hab-rem") return mudarBim(num, nb => { nb.habs = habsDe(nb).filter((_, i) => i !== Number(b.dataset.i)); });
  if (act === "bim-rec") return mudarBim(num, nb => { const rc = nb.recursos || [], v = b.dataset.v; nb.recursos = rc.includes(v) ? rc.filter(x => x !== v) : [...rc, v]; });
  if (act === "bim-tec-rem") return mudarBim(num, nb => { nb.ideiasTec = (nb.ideiasTec || []).filter((_, i) => i !== Number(b.dataset.i)); });
  if (act === "bim-tec-plano") {
    const bi = bimPorNum(t, num), x = (bi.ideiasTec || [])[Number(b.dataset.i)]; if (!x) return;
    const dia = hoje() < bi.inicio ? bi.inicio : hoje() > bi.fim ? bi.inicio : hoje();
    dlgPlano({ id: uid(), turmaId: t.id, data: dia, titulo: x.titulo, duracao: x.duracao || "1 aula de 50 min", bncc: x.habilidade, objetivos: x.objetivo, conteudo: [x.eixo && "Tecnologia: " + x.eixo, x.ferramentas].filter(Boolean).join(" · "),
      metodologia: (x.passos || []).map((p, i) => `${i + 1}. ${p}`).join("\n"), recursos: [x.ferramentas, x.precisa].filter(Boolean).join(" · "), avaliacao: x.avaliacao, status: "planejado" });
  }
});
function vBimestres() {
  const t = turmaAtual(), bs = bimestresDe(t);
  const head = `<div class="page-head"><div><h1>Bimestres</h1><p class="muted">Divida o ano letivo da turma em períodos. As notas, a frequência e o planejamento passam a ser organizados por período.</p></div>${bs.length ? `<div class="toolbar"><button class="btn" data-act="bim-editar">Editar períodos</button></div>` : ""}</div>`;
  if (!bs.length) {
    const n = S.bimNovo, mod = MODELOS_PERIODO[n.tipo];
    return head + `<section class="panel"><h2>Como o ano letivo é dividido?</h2>
      <div class="toolbar">${Object.keys(MODELOS_PERIODO).map(k => `<label class="per-op"><input type="radio" name="perTipo" value="${k}" ${n.tipo === k ? "checked" : ""}> ${k === "bimestre" ? "4 bimestres" : "3 trimestres"}</label>`).join("")}
        <div class="field" style="width:120px"><label for="perAno">Ano letivo</label><input class="input" id="perAno" inputmode="numeric" value="${esc(n.ano)}"></div></div>
      <div class="list">${mod.map(([nome, i, f]) => `<div class="row"><div class="grow title">${nome}</div><span class="chip num">${fmtData(n.ano + "-" + i)} a ${fmtData(n.ano + "-" + f)}</span></div>`).join("")}</div>
      <p class="small muted">Essas são datas sugeridas. Depois de criar, ajuste pelo calendário da sua escola em Editar períodos.</p>
      <div><button class="btn primary" data-act="bim-criar">Criar ${n.tipo === "bimestre" ? "bimestres" : "trimestres"}</button></div></section>`;
  }
  return head + bs.map(b => {
    const [st, cls] = statusBim(b), sem = semanasDo(b);
    const aulas = S.chamadas.filter(c => c.turmaId === t.id && c.data >= b.inicio && c.data <= b.fim).length, prev = aulasPrevistas(t, b);
    const planos = S.planos.filter(p => p.turmaId === t.id && p.data >= b.inicio && p.data <= b.fim).length;
    const avs = S.avaliacoes.filter(a => a.turmaId === t.id && String(a.bimestre) === String(b.num)).length;
    const m = mediaTurma(t, b.num), f = freqTurma(t, b.num), pl = b.plano;
    const criados = new Set(S.planos.filter(p => p.turmaId === t.id && p.origem && p.origem.bim === b.num).map(p => p.origem.semana));
    return `<section class="panel bim-card" id="bim-${b.num}">
      <div class="panel-head"><div><span class="eyebrow">${fmtData(b.inicio)} a ${fmtData(b.fim)} · ${sem.length} semanas</span><h2>${esc(b.nome)}</h2></div><span class="chip ${cls}">${st}</span></div>
      <div class="bim-nums"><div><b class="num">${aulas}${prev !== null ? `<small> de ${prev}</small>` : ""}</b><span>${prev !== null ? "dias de aula com chamada" : "aulas registradas"}</span></div><div><b class="num">${planos}</b><span>planos de aula</span></div><div><b class="num">${avs}</b><span>avaliações</span></div><div><b class="num">${fmtNota(m)}</b><span>média da turma</span></div><div><b class="num">${f === null ? "—" : f + "%"}</b><span>frequência</span></div></div>
      ${bimIA(b)}
      ${bimExtras(b)}
      ${pl ? `<div class="bim-plano"><p>${esc(pl.visaoGeral || "")}</p>${(pl.habilidades || []).length ? `<div class="toolbar">${pl.habilidades.map(h => `<span class="bncc">${esc(h)}</span>`).join("")}</div>` : ""}
        <div class="table-wrap"><table class="tab-sem"><thead><tr><th>Semana</th><th>Tema</th><th>BNCC</th><th>Objetivos</th><th>Atividades</th><th>Avaliação</th><th></th></tr></thead><tbody>
        ${(pl.semanas || []).map((s, i) => `<tr><td class="num"><b>${i + 1}</b><div class="small muted">${esc(sem[i]?.rotulo || "")}</div></td><td><b>${esc(s.tema)}</b></td><td class="small">${esc(s.habilidades || "")}</td><td class="small">${esc(s.objetivos || "")}</td><td class="small">${esc(s.atividades || "")}</td><td class="small">${esc(s.avaliacao || "")}</td><td>${criados.has(i + 1) ? '<span class="chip ok">plano criado</span>' : ""}</td></tr>`).join("")}
        </tbody></table></div>
        <div class="toolbar"><button class="btn primary" data-act="bim-planos" data-num="${b.num}" ${criados.size >= (pl.semanas || []).length ? "disabled" : ""}>${criados.size ? "Criar os planos que faltam" : "Criar os planos de aula das semanas"}</button><button class="btn ai sm" data-act="bim-ia" data-num="${b.num}">${ico("spark")}Refazer com IA</button></div></div>`
      : `<div class="toolbar"><button class="btn ai" data-act="bim-ia" data-num="${b.num}">${ico("spark")}Planejar o ${esc(b.nome)} com IA</button><span class="small muted">A Manu distribui as habilidades da BNCC pelas ${sem.length} semanas.</span></div>`}
    </section>`;
  }).join("");
}

function dlgBimIA(num) {
  const t = turmaAtual(), b = bimPorNum(t, num);
  dlg._bim = num;
  abrirDlg(`Planejar o ${esc(b.nome)} com IA`, `
    <p class="small muted">${esc(t.nome)} · ${esc(t.disciplina)}${t.serie ? " · " + esc(t.serie) : ""} · ${semanasDo(b).length} semanas (${fmtData(b.inicio)} a ${fmtData(b.fim)})</p>
    <div class="field" style="max-width:220px"><label for="biAulas">Aulas por semana</label><input class="input" id="biAulas" type="number" min="1" max="20" value="${esc(t.aulasSemana || horarioDe(t).length || 2)}"></div>
    <div class="field"><label for="biCont">Conteúdos que você precisa trabalhar (opcional)</label><textarea class="input" id="biCont" rows="5" placeholder="Ex.: capítulos 3 a 5 do livro; frações, números decimais e porcentagem. Se deixar vazio, a Manu segue o esperado para a série.">${esc(b.conteudos || "")}</textarea></div>
    <div class="field"><label for="biObs">Observações (opcional)</label><input class="input" id="biObs" placeholder="Ex.: feira de ciências na semana 6, turma com dificuldade em leitura"></div>
    <div class="ai-box"><div class="toolbar"><button type="button" class="btn ai" data-act="ia-bimestre">${ico("spark")}Gerar planejamento</button><button type="button" class="btn ghost sm" data-act="parar-ia" hidden id="iaStop">Parar</button><span class="ai-status" id="iaStatus">Pode levar até um minuto. Você revisa antes de criar os planos.</span></div></div>`,
    `<button type="button" class="btn" data-act="fechar">Cancelar</button>`);
}
async function iaBimestre() {
  const t = turmaAtual(), b = bimPorNum(t, dlg._bim), sem = semanasDo(b);
  const aulas = Math.max(1, Math.min(20, parseInt(val("biAulas")) || 2)), cont = val("biCont");
  await comIA(async (signal, st) => {
    const fer = []; for (let d = b.inicio; d <= b.fim; d = addDias(d, 1)) { const x = semAula(d, escolaDe(t)); if (x && diaSemana(d) <= 5) fer.push(`${fmtData(d)} (${x.nome})`); }
    const extras = [fer.length ? "Dias sem aula no período: " + fer.join(", ") + "." : "", habsDe(b).length ? "Habilidades escolhidas pelo professor para o período: " + habsDe(b).map(textoHab).join("; ") : "", (b.recursos || []).length ? "Recursos disponíveis: " + b.recursos.join(", ") + ". Inclua uso de tecnologia quando houver." : ""].filter(Boolean).join("\n");
    const r = await iaJSON({ tipo: "bimestre", periodo: b.nome, semanas: sem.map(s => `Semana ${s.n} (${s.rotulo})`), aulasPorSemana: aulas, conteudos: [cont, extras].filter(Boolean).join("\n").slice(0, 3000) || undefined, observacoes: val("biObs") || undefined, turma: turmaIA(t.id) }, signal);
    if (!r || !Array.isArray(r.semanas) || !r.semanas.length) throw { message: "A resposta veio num formato inesperado. Tente de novo." };
    const nt = JSON.parse(JSON.stringify(t)); nt.aulasSemana = aulas;
    const nb = bimPorNum(nt, b.num); nb.conteudos = cont;
    nb.plano = { visaoGeral: String(r.visaoGeral || ""), habilidades: Array.isArray(r.habilidades) ? r.habilidades.map(String).slice(0, 20) : [], aulasPorSemana: aulas,
      semanas: r.semanas.slice(0, sem.length).map(s => ({ tema: String(s.tema || ""), habilidades: String(s.habilidades || ""), objetivos: String(s.objetivos || ""), atividades: String(s.atividades || ""), avaliacao: String(s.avaliacao || "") })) };
    await salvar("turmas", nt);
    st.textContent = "Pronto.";
    fechar(); toast(`Planejamento do ${b.nome} pronto`);
    setTimeout(() => document.getElementById("bim-" + b.num)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  });
}
function dlgBimDatas() {
  dlg._bims = JSON.parse(JSON.stringify(bimestresDe(turmaAtual())));
  abrirDlg("Períodos da turma", `<p class="small muted">Ajuste pelo calendário da sua escola. Você pode renomear, mudar as datas, adicionar um período (ex.: Recuperação final) ou remover.</p><div id="bimRows"></div>
    <div class="toolbar"><button type="button" class="btn sm" data-act="bim-add">${ico("plus")}Adicionar período</button><span class="small muted">Trocar o modelo:</span><button type="button" class="btn sm ghost" data-act="bim-modelo" data-v="bimestre">4 bimestres</button><button type="button" class="btn sm ghost" data-act="bim-modelo" data-v="trimestre">3 trimestres</button></div>`,
    `<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="bim-salvar-datas">Salvar períodos</button>`);
  renderBimRows();
}
function renderBimRows() {
  const box = dlg.querySelector("#bimRows"); if (!box) return;
  box.innerHTML = dlg._bims.length ? dlg._bims.map((b, i) => `<div class="bim-row"><div class="field"><label for="bn${i}">Nome</label><input class="input bim-in" data-i="${i}" data-k="nome" id="bn${i}" value="${esc(b.nome)}"></div>
      <div class="field"><label for="bi${i}">Início</label><input class="input bim-in" type="date" data-i="${i}" data-k="inicio" id="bi${i}" value="${esc(b.inicio)}"></div>
      <div class="field"><label for="bf${i}">Fim</label><input class="input bim-in" type="date" data-i="${i}" data-k="fim" id="bf${i}" value="${esc(b.fim)}"></div>
      <button type="button" class="btn sm ghost danger" data-act="bim-rem" data-i="${i}" aria-label="Remover ${esc(b.nome)}">Remover</button></div>`).join("")
    : `<p class="muted">Nenhum período. Adicione um ou escolha um modelo.</p>`;
}
document.addEventListener("input", e => { if (e.target.classList.contains("bim-in") && dlg._bims) dlg._bims[Number(e.target.dataset.i)][e.target.dataset.k] = e.target.value; });
document.addEventListener("change", e => {
  if (e.target.name === "perTipo") { S.bimNovo.tipo = e.target.value; render(); }
  if (e.target.id === "perAno") { S.bimNovo.ano = e.target.value.replace(/\D/g, "").slice(0, 4); render(); }
  if (e.target.id === "bimSel") { S.bimSel[S.turmaSel] = e.target.value; render(); }
});
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act^='bim-'],[data-act='ia-bimestre']"); if (!b) return;
  const act = b.dataset.act, t = turmaAtual(); if (!t) return;
  if (act === "bim-sel") {
    if (S.view === "notas") { S.notasGeral = b.dataset.v === ""; if (b.dataset.v !== "") S.bimSel[t.id] = b.dataset.v; render(); return; }
    S.bimSel[t.id] = b.dataset.v; render(); return;
  }
  if (act === "bim-ia") { dlgBimIA(Number(b.dataset.num)); return; }
  if (act === "ia-bimestre") { iaBimestre(); return; }
  if (act === "bim-editar") { dlgBimDatas(); return; }
  if (act === "bim-criar") {
    const ano = /^\d{4}$/.test(S.bimNovo.ano) ? S.bimNovo.ano : String(new Date().getFullYear());
    const nt = JSON.parse(JSON.stringify(t)); nt.tipoPeriodo = S.bimNovo.tipo;
    nt.bimestres = MODELOS_PERIODO[S.bimNovo.tipo].map(([nome, i, f], k) => ({ num: k + 1, nome, inicio: ano + "-" + i, fim: ano + "-" + f }));
    delete S.bimSel[t.id]; await salvar("turmas", nt); toast("Períodos criados. Ajuste as datas se precisar."); return;
  }
  if (act === "bim-add") {
    const ult = dlg._bims[dlg._bims.length - 1], inicio = ult ? addDias(ult.fim, 1) : hoje();
    dlg._bims.push({ num: Math.max(0, ...dlg._bims.map(x => x.num), ...bimestresDe(t).map(x => x.num)) + 1, nome: `Período ${dlg._bims.length + 1}`, inicio, fim: addDias(inicio, 30) });
    renderBimRows(); dlg.querySelector(`#bn${dlg._bims.length - 1}`)?.select(); return;
  }
  if (act === "bim-rem") { dlg._bims.splice(Number(b.dataset.i), 1); renderBimRows(); return; }
  if (act === "bim-modelo") { dlg._bims = bimestresPadrao(t.ano, b.dataset.v); renderBimRows(); return; }
  if (act === "bim-salvar-datas") {
    for (const x of dlg._bims) { x.nome = String(x.nome || "").trim() || "Período"; if (!x.inicio || !x.fim || x.fim < x.inicio) { toast(`${x.nome}: confira as datas, o fim precisa ser depois do início.`); return; } }
    const nt = JSON.parse(JSON.stringify(t)); nt.bimestres = dlg._bims.slice().sort((a, c) => a.inicio.localeCompare(c.inicio));
    fechar(); delete S.bimSel[t.id]; await salvar("turmas", nt); toast("Períodos salvos"); return;
  }
  if (act === "bim-apagar") {
    if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar: apagar períodos e planejamentos"; return; }
    const nt = JSON.parse(JSON.stringify(t)); delete nt.bimestres; delete nt.tipoPeriodo; fechar(); delete S.bimSel[t.id]; await salvar("turmas", nt); toast("Períodos apagados"); return;
  }
  if (act === "bim-planos") {
    const bi = bimPorNum(t, Number(b.dataset.num)), sem = semanasDo(bi), pl = bi.plano; if (!pl) return;
    const criados = new Set(S.planos.filter(p => p.turmaId === t.id && p.origem && p.origem.bim === bi.num).map(p => p.origem.semana));
    b.disabled = true; let n = 0;
    for (let i = 0; i < pl.semanas.length; i++) {
      if (criados.has(i + 1)) continue;
      const s = pl.semanas[i], w = sem[i] || sem[sem.length - 1];
      await salvar("planos", { id: uid(), turmaId: t.id, data: w.inicio, titulo: s.tema || `Semana ${i + 1}`, duracao: `${pl.aulasPorSemana || 2} aulas na semana`, bncc: s.habilidades, objetivos: s.objetivos, conteudo: s.tema, metodologia: s.atividades, recursos: "", avaliacao: s.avaliacao, status: "planejado", origem: { bim: bi.num, semana: i + 1 } });
      n++;
    }
    toast(`${n} planos de aula criados no Planejamento. Abra cada um para detalhar com a IA.`); return;
  }
});

/* ---------- Alunos da turma ---------- */
S.alEdit = null;
const limparNome = s => String(s).replace(/^\s*\d+[\s.\-–)]+/, "").replace(/\s+/g, " ").trim();
function vAlunos() {
  const t = turmaAtual(), al = t.alunos || [], bim = bimSelecionado(t);
  return `<div class="page-head"><div><h1>Alunos</h1><p class="muted">${al.length ? `${al.length} ${al.length === 1 ? "aluno" : "alunos"} nesta turma.` : "Cadastre os alunos para fazer chamada e lançar notas."}${irmasDe(t).length ? ` A mesma lista vale para ${irmasDe(t).map(o => esc(o.nome + " · " + o.disciplina)).join(", ")}.` : ""}</p></div>${al.length > 1 ? `<div class="toolbar"><button class="btn sm" data-act="al-ordenar">Ordenar A a Z</button></div>` : ""}</div>
  <section class="panel">
    <form class="toolbar" id="alForm" style="align-items:flex-end"><div class="field" style="flex:1;min-width:220px"><label for="alNome">Nome do aluno</label><input class="input" id="alNome" type="text" autocomplete="off" placeholder="Ex.: Ana Beatriz Souza"></div><button class="btn primary" type="submit">${ico("plus")}Adicionar</button></form>
    <details class="al-colar"><summary>Colar a lista da secretaria (vários nomes de uma vez)</summary>
      <div class="field" style="margin-top:8px"><label for="alLista">Um nome por linha. Números no começo são ignorados.</label><textarea class="input" id="alLista" rows="6" placeholder="1. Ana Beatriz Souza&#10;2. Bruno Henrique Lima"></textarea></div>
      <div><button class="btn" data-act="al-colar">Adicionar todos</button></div></details>
  </section>
  ${al.length ? `<section class="panel"><div class="list">${al.map((a, i) => { const m = mediaAluno(t, a.id, bim), f = freqAluno(t, a.id, bim);
    return S.alEdit === a.id
      ? `<form class="row al-ren" data-id="${esc(a.id)}"><span class="num muted small" style="width:26px">${String(i + 1).padStart(2, "0")}</span><input class="input grow" id="alRen" type="text" value="${esc(a.nome)}" aria-label="Novo nome"><button class="btn sm primary" type="submit">Salvar</button><button class="btn sm ghost" type="button" data-act="al-cancelar">Cancelar</button></form>`
      : `<div class="row"><span class="num muted small" style="width:26px">${String(i + 1).padStart(2, "0")}</span><div class="grow"><div class="title">${esc(a.nome)}</div><div class="small muted">Média ${fmtNota(m)} · Frequência ${f === null ? "—" : f + "%"}</div></div>
        <button class="btn sm ghost" data-act="al-renomear" data-id="${esc(a.id)}">Renomear</button><button class="btn sm ghost danger" data-act="al-remover" data-id="${esc(a.id)}">Remover</button></div>`; }).join("")}</div>
    <p class="small muted">Remover um aluno tira o nome dele da chamada, das notas e das entregas desta turma.</p></section>`
    : `<div class="empty"><img class="manu sm" src="/manu/manu-agenda.webp" alt=""><h3>Nenhum aluno ainda</h3><p>Digite o nome acima ou cole a lista da secretaria.</p></div>`}`;
}
async function salvarAlunos(alunos, msg) {
  const t = turmaAtual(), nt = JSON.parse(JSON.stringify(t)); nt.alunos = alunos; S.alEdit = null;
  await salvar("turmas", nt);
  // mesma turma em outras disciplinas: a lista de alunos é a mesma
  for (const o of irmasDe(t)) { const c = JSON.parse(JSON.stringify(o)); c.alunos = JSON.parse(JSON.stringify(alunos)); await salvar("turmas", c); }
  if (msg) toast(msg);
}
function adicionarNomes(nomes) {
  const t = turmaAtual(), atuais = (t.alunos || []).slice(), vistos = new Set(atuais.map(a => a.nome.toLowerCase()));
  const novos = nomes.map(limparNome).filter(n => n && !vistos.has(n.toLowerCase()) && vistos.add(n.toLowerCase()));
  if (!novos.length) { toast(nomes.length ? "Esses nomes já estão na turma." : "Digite um nome."); return false; }
  salvarAlunos([...atuais, ...novos.map(n => ({ id: uid(), nome: n }))], novos.length === 1 ? `${novos[0]} adicionado(a)` : `${novos.length} alunos adicionados`);
  return true;
}
document.addEventListener("submit", e => {
  if (e.target.id === "alForm") { e.preventDefault(); const i = $("#alNome"); if (adicionarNomes([i.value])) { i.value = ""; i.blur(); setTimeout(() => $("#alNome")?.focus(), 50); } }
  if (e.target.classList.contains("al-ren")) { e.preventDefault(); const n = limparNome($("#alRen").value); if (!n) return; const id = e.target.dataset.id;
    $("#alRen").blur(); salvarAlunos(turmaAtual().alunos.map(a => a.id === id ? { ...a, nome: n } : a), "Nome atualizado"); }
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act^='al-']"); if (!b) return;
  const t = turmaAtual(); if (!t) return;
  const act = b.dataset.act;
  if (act === "al-colar") { const l = $("#alLista"); if (adicionarNomes(l.value.split(/\n+/))) l.value = ""; }
  else if (act === "al-ordenar") salvarAlunos(t.alunos.slice().sort((a, c) => a.nome.localeCompare(c.nome, "pt-BR")), "Lista em ordem alfabética");
  else if (act === "al-renomear") { S.alEdit = b.dataset.id; render(); setTimeout(() => { const i = $("#alRen"); if (i) { i.focus(); i.select(); } }, 30); }
  else if (act === "al-cancelar") { S.alEdit = null; render(); }
  else if (act === "al-remover") {
    if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar remoção"; return; }
    const a = t.alunos.find(x => x.id === b.dataset.id); salvarAlunos(t.alunos.filter(x => x.id !== b.dataset.id), `${a ? a.nome : "Aluno"} removido(a)`);
  }
});

/* ---------- Horário de aula da turma ---------- */
const DIAS = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const horarioDe = t => (t && Array.isArray(t.horario) ? t.horario : []).slice().sort((a, b) => a.dia - b.dia || a.inicio.localeCompare(b.inicio));
const minutos = h => { const [a, b] = String(h).split(":").map(Number); return a * 60 + (b || 0); };
const hhmm = m => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const diaSemana = iso => { const d = new Date(iso + "T12:00:00").getDay(); return d === 0 ? 7 : d; }; // 1 = segunda
function aulasPrevistas(t, b) { // dias de aula previstos no período, pelo horário da turma
  const h = horarioDe(t); if (!h.length) return null;
  let n = 0; for (let d = b.inicio; d <= b.fim; d = addDias(d, 1)) if (h.some(x => x.dia === diaSemana(d)) && !semAula(d, escolaDe(t))) n++;
  return n;
}
function proximaAula(t) {
  const h = horarioDe(t); if (!h.length) return null;
  const agora = new Date(), hojeIso = hoje(), mAgora = agora.getHours() * 60 + agora.getMinutes();
  for (let k = 0; k < 8; k++) {
    const d = addDias(hojeIso, k), ds = diaSemana(d);
    const a = h.find(x => x.dia === ds && (k > 0 || minutos(x.fim) > mAgora));
    if (a) return { data: d, ...a, hoje: k === 0, agora: k === 0 && minutos(a.inicio) <= mAgora };
  }
  return null;
}
// Grade de tempos da escola: 1º ao 6º tempo, recreio depois do 3º
const INICIO_TURNO = { Matutino: "07:00", Manhã: "07:00", Vespertino: "13:00", Tarde: "13:00", Noturno: "19:00", Noite: "19:00", Integral: "07:00" };
function gradeDe(t) {
  const g = t.grade || {};
  const integral = t.turno === "Integral"; // integral: manhã e tarde, com almoço depois do 6º tempo
  return { inicio: g.inicio || INICIO_TURNO[t.turno] || "07:00", duracao: Number(g.duracao) || 50, tempos: Number(g.tempos) || (integral ? 9 : 6), recreioApos: Number(g.recreioApos ?? 3), recreio: Number(g.recreio ?? 10),
    almocoApos: Number(g.almocoApos ?? (integral ? 6 : 0)), almoco: Number(g.almoco ?? 60), sabado: !!g.sabado };
}
function horaDoTempo(g, k) { // k = 1, 2, 3...
  const ini = minutos(g.inicio) + (k - 1) * g.duracao + (g.recreioApos && k > g.recreioApos ? g.recreio : 0) + (g.almocoApos && k > g.almocoApos ? g.almoco : 0);
  return { inicio: hhmm(ini), fim: hhmm(ini + g.duracao) };
}
function tempoDe(t, a) { // horários antigos (sem número do tempo) são encaixados pelo início
  if (a.tempo) return a.tempo;
  const g = gradeDe(t); for (let k = 1; k <= g.tempos; k++) if (horaDoTempo(g, k).inicio === a.inicio) return k;
  return null;
}
const val2 = id => { const el = document.getElementById(id); return el ? el.value : ""; };
// Meu horário: a semana do professor, com todas as turmas
const TURNO_SIN = { Manhã: "Matutino", Tarde: "Vespertino", Noite: "Noturno" }, ORDEM_TURNO = ["Matutino", "Vespertino", "Noturno", "Integral"];
const turnoGrupo = t => TURNO_SIN[t.turno] || t.turno || "";
function gruposTurno() { const o = x => { const i = ORDEM_TURNO.indexOf(x); return i < 0 ? 9 : i; }; return [...new Set(["Matutino", "Vespertino", "Noturno", "Integral", ...S.turmas.map(turnoGrupo)])].sort((a, b) => o(a) - o(b)); }
function turnoHor() { const gs = gruposTurno(); return gs.includes(S.horTurno) ? S.horTurno : gs.find(x => turmasDoTurno(x).length) || gs[0]; }
function gradeTurno(tn) { const t = turmasDoTurno(tn)[0]; return t ? gradeDe(t) : gradeDe({ turno: tn }); }
const turmasDoTurno = tn => S.turmas.filter(t => turnoGrupo(t) === tn);
function ocupadaFora(tn, d, k) { // aula em outra escola (ou outro turno) que bate com este horário
  const x = horaDoTempo(gradeTurno(tn), k), meus = new Set(turmasDoTurno(tn).map(t => t.id));
  return S.turmas.find(o => !meus.has(o.id) && horarioDe(o).some(b => b.dia === d && minutos(x.inicio) < minutos(b.fim) && minutos(b.inicio) < minutos(x.fim))) || null;
}
const naCelula = (tn, d, k) => turmasDoTurno(tn).filter(t => horarioDe(t).some(a => a.dia === d && tempoDe(t, a) === k));
function vHorario() {
  if (!S.turmas.length) return `<div class="page-head"><div><h1>Meu horário</h1></div></div>` + semTurma("Crie suas turmas e depois monte aqui o horário da semana.");
  const gs = gruposTurno(), tn = turnoHor(), g = gradeTurno(tn), dias = g.sabado ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5], hj = diaSemana(hoje());
  const linhas = [];
  for (let k = 1; k <= g.tempos; k++) {
    const x = horaDoTempo(g, k);
    linhas.push(`<tr><th class="tp"><b>${k}º tempo</b><small class="num">${x.inicio}–${x.fim}</small></th>${dias.map(d => { const ts = naCelula(tn, d, k), aberto = S.horPop && S.horPop.d === d && S.horPop.k === k;
      return `<td class="${hj === d ? "hoje" : ""}"><button type="button" class="cel${ts.length ? " on" : ""}${ts.length > 1 ? " choque" : ""}" data-act="hor-cel" data-dia="${d}" data-tempo="${k}" aria-haspopup="true" aria-expanded="${aberto}" aria-label="${DIAS[d]}, ${k}º tempo${ts.length ? ": " + ts.map(t => esc(t.nome)).join(", ") : ", vago"}">${ts.length ? ts.map(t => `<span class="cel-turma" style="--c:${esc(t.cor || "#0f766e")}"><b>${esc(t.nome)}</b><small>${esc(t.disciplina || "")}</small>${variasEscolas() && escolaDe(t) ? `<small class="cel-esc">${esc(escolaDe(t))}</small>` : ""}</span>`).join("") : (fo => fo ? `<span class="cel-fora">Ocupado: ${esc(fo.nome)} · ${esc(fo.turno || "outro turno")}</span>` : `<span class="mais">+</span>`)(ocupadaFora(tn, d, k))}</button></td>`; }).join("")}</tr>`);
    if (g.almocoApos === k && g.almoco > 0 && k < g.tempos) linhas.push(`<tr class="recreio almoco"><th class="tp"><b>Almoço</b><small class="num">${x.fim}–${hhmm(minutos(x.fim) + g.almoco)}</small></th><td colspan="${dias.length}">Intervalo de almoço · ${g.almoco} minutos</td></tr>`);
  }
  const tot = turmasDoTurno(tn).map(t => ({ t, n: horarioDe(t).filter(a => tempoDe(t, a)).length }));
  return `<div class="page-head"><div><h1>Meu horário</h1><p class="muted">Toque num tempo e escolha a turma. Cada tempo tem ${g.duracao} minutos${g.recreioApos ? `, com recreio de ${g.recreio} minutos depois do ${g.recreioApos}º tempo` : ""}${g.almocoApos && g.almocoApos < g.tempos ? ` e almoço depois do ${g.almocoApos}º tempo` : ""}.</p></div><div class="toolbar"><button class="btn sm" data-act="hor-config">Configurar tempos</button></div></div>
  ${gs.length ? `<div class="seg" role="tablist" aria-label="Turno">${gs.map(x => `<button type="button" role="tab" class="${x === tn ? "on" : ""}" aria-selected="${x === tn}" data-act="hor-turno" data-v="${esc(x)}">${esc(x || "Sem turno")}${turmasDoTurno(x).length ? "" : ' <small class="muted">(vazio)</small>'}</button>`).join("")}</div>` : ""}
  <div class="table-wrap"><table class="grade-tempos"><thead><tr><th></th>${dias.map(d => `<th class="${hj === d ? "hoje" : ""}">${DIAS[d]}</th>`).join("")}</tr></thead><tbody>${linhas.join("")}</tbody></table></div>
  <div class="hor-tot">${tot.map(({ t, n }) => `<a href="${linkTurma(t.id, "resumo")}"><span class="swatch" style="background:${esc(t.cor)}"></span>${esc(rotuloTurma(t))} <b class="num">${n}</b> ${n === 1 ? "tempo" : "tempos"}/semana</a>`).join("")}</div>
  ${S.horPop ? popHorario(tn) : ""}`;
}
function popHorario(tn) {
  const { d, k } = S.horPop, ts = turmasDoTurno(tn), sel = naCelula(tn, d, k).map(t => t.id), x = horaDoTempo(gradeTurno(tn), k);
  return `<div class="hor-pop" id="horPop" role="dialog" aria-label="Escolher turma"><div class="hor-pop-tit"><b>${DIAS[d]}, ${k}º tempo</b><small class="num muted">${x.inicio}–${x.fim}</small></div>
    ${(fo => fo ? `<p class="small aviso-pop">Neste horário você já tem ${esc(fo.nome)}${escolaDe(fo) ? " na " + esc(escolaDe(fo)) : ""}.</p>` : "")(naCelula(tn, d, k).length ? null : ocupadaFora(tn, d, k))}
    ${ts.length ? "" : `<p class="small muted" style="margin:6px 8px">Você ainda não tem turma no turno ${esc(tn || "sem turno").toLowerCase()}.</p><button type="button" class="hor-op" data-act="nova-turma" data-turno="${esc(tn)}">${ico("plus")}<span><b>Criar turma</b></span></button>`}
    ${ts.map(t => `<button type="button" class="hor-op${sel.includes(t.id) ? " on" : ""}" data-act="hor-escolher" data-turma="${esc(t.id)}"><span class="swatch" style="background:${esc(t.cor)}"></span><span><b>${esc(t.nome)}</b><small>${esc(t.disciplina || "")}${variasEscolas() && escolaDe(t) ? " · " + esc(escolaDe(t)) : t.serie ? " · " + esc(t.serie) : ""}</small></span>${sel.includes(t.id) ? "✓" : ""}</button>`).join("")}
    ${sel.length ? `<button type="button" class="hor-op vago" data-act="hor-escolher" data-turma="">Deixar vago</button>` : ""}</div>`;
}
function posicionarPop() {
  const pop = document.getElementById("horPop"); if (!pop || !S.horPop) return;
  const cel = document.querySelector(`.cel[data-dia="${S.horPop.d}"][data-tempo="${S.horPop.k}"]`); if (!cel) return;
  const r = cel.getBoundingClientRect(), w = Math.min(280, innerWidth - 24);
  pop.style.width = w + "px";
  pop.style.left = Math.max(12, Math.min(r.left + scrollX, scrollX + innerWidth - w - 12)) + "px";
  const abaixo = r.bottom + 6 + pop.offsetHeight < innerHeight;
  pop.style.top = (abaixo ? r.bottom + 6 : Math.max(8, r.top - pop.offsetHeight - 6)) + scrollY + "px";
  pop.querySelector(".hor-op")?.focus({ preventScroll: true });
}
function fecharPop() { if (S.horPop) { S.horPop = null; render(); } }
document.addEventListener("pointerdown", e => { if (S.horPop && !e.target.closest("#horPop,[data-act='hor-cel']")) fecharPop(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && S.horPop) { const c = S.horPop; fecharPop(); document.querySelector(`.cel[data-dia="${c.d}"][data-tempo="${c.k}"]`)?.focus(); } });
addEventListener("resize", posicionarPop);
document.addEventListener("scroll", e => { if (S.horPop && e.target.classList && e.target.classList.contains("table-wrap")) fecharPop(); }, true);
function dlgGrade() {
  const tn = turnoHor(), g = gradeTurno(tn);
  abrirDlg("Configurar tempos", `<p class="small muted">Use a grade de horários da sua escola${tn ? " no turno " + esc(tn).toLowerCase() : ""}. Vale para todas as turmas desse turno.</p>
    <div class="grid3"><div class="field"><label for="gIni">Início do 1º tempo</label><input class="input" id="gIni" type="time" value="${esc(g.inicio)}"></div>
    <div class="field"><label for="gDur">Duração de cada tempo</label><select class="input" id="gDur">${[40, 45, 50, 55, 60].map(n => `<option value="${n}" ${g.duracao === n ? "selected" : ""}>${n} minutos</option>`).join("")}</select></div>
    <div class="field"><label for="gTempos">Tempos por dia</label><select class="input" id="gTempos">${[4, 5, 6, 7, 8, 9, 10].map(n => `<option ${g.tempos === n ? "selected" : ""}>${n}</option>`).join("")}</select></div></div>
    <div class="grid3"><div class="field"><label for="gRecApos">Recreio depois do</label><select class="input" id="gRecApos"><option value="0" ${!g.recreioApos ? "selected" : ""}>Sem recreio</option>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<option value="${n}" ${g.recreioApos === n ? "selected" : ""}>${n}º tempo</option>`).join("")}</select></div>
    <div class="field"><label for="gRec">Duração do recreio</label><select class="input" id="gRec">${[10, 15, 20, 30].map(n => `<option value="${n}" ${g.recreio === n ? "selected" : ""}>${n} minutos</option>`).join("")}</select></div>
    <label class="check" style="border:0;align-self:end"><input type="checkbox" id="gSab" ${g.sabado ? "checked" : ""}><span>Tem aula no sábado</span></label></div>
    <div class="grid3"><div class="field"><label for="gAlmApos">Almoço depois do</label><select class="input" id="gAlmApos"><option value="0" ${!g.almocoApos ? "selected" : ""}>Sem almoço</option>${[3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${g.almocoApos === n ? "selected" : ""}>${n}º tempo</option>`).join("")}</select></div>
    <div class="field"><label for="gAlm">Duração do almoço</label><select class="input" id="gAlm">${[30, 45, 60, 75, 90, 120].map(n => `<option value="${n}" ${g.almoco === n ? "selected" : ""}>${n} minutos</option>`).join("")}</select></div></div>`,
    `<button type="button" class="btn" data-act="fechar">Cancelar</button><button type="button" class="btn primary" data-act="hor-grade-salvar">Salvar</button>`);
}
const comTempos = t => horarioDe(t).map(a => ({ ...a, tempo: tempoDe(t, a) })).filter(a => a.tempo);
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act='hor-cel'],[data-act='hor-config'],[data-act='hor-grade-salvar'],[data-act='hor-escolher'],[data-act='hor-turno']"); if (!b) return;
  const act = b.dataset.act, tn = turnoHor();
  if (act === "hor-turno") { S.horTurno = b.dataset.v; S.horPop = null; render(); return; }
  if (act === "hor-config") { S.horPop = null; dlgGrade(); return; }
  if (act === "hor-grade-salvar") {
    const grade = { inicio: val2("gIni") || "07:00", duracao: Number(val2("gDur")), tempos: Number(val2("gTempos")), recreioApos: Number(val2("gRecApos")), recreio: Number(val2("gRec")), almocoApos: Number(val2("gAlmApos")), almoco: Number(val2("gAlm")), sabado: document.getElementById("gSab").checked };
    fechar();
    for (const t of turmasDoTurno(tn)) {
      const nt = JSON.parse(JSON.stringify(t)); nt.grade = grade;
      nt.horario = comTempos(t).filter(a => a.tempo <= grade.tempos && (grade.sabado || a.dia < 6)).map(a => ({ ...a, ...horaDoTempo(grade, a.tempo) }));
      await salvar("turmas", nt);
    }
    toast("Grade de tempos salva"); return;
  }
  if (act === "hor-cel") {
    const d = Number(b.dataset.dia), k = Number(b.dataset.tempo);
    S.horPop = S.horPop && S.horPop.d === d && S.horPop.k === k ? null : { d, k };
    render(); posicionarPop(); return;
  }
  // hor-escolher: a turma escolhida fica com o tempo; quem estava nele sai
  const { d, k } = S.horPop, alvo = b.dataset.turma; S.horPop = null;
  const g = gradeTurno(tn);
  for (const t of turmasDoTurno(tn)) {
    const atual = comTempos(t), tem = atual.some(a => a.dia === d && a.tempo === k), quer = t.id === alvo;
    if (tem === quer) continue;
    const nt = JSON.parse(JSON.stringify(t)); nt.grade = gradeDe(t);
    nt.horario = quer ? [...atual, { id: uid(), dia: d, tempo: k, ...horaDoTempo(g, k) }] : atual.filter(a => !(a.dia === d && a.tempo === k));
    await salvar("turmas", nt);
  }
  render();
  const t = turma(alvo); toast(t ? `${t.nome} na ${DIAS[d].toLowerCase()}, ${k}º tempo` : `${DIAS[d]}, ${k}º tempo vago`);
  document.querySelector(`.cel[data-dia="${d}"][data-tempo="${k}"]`)?.focus();
});
/* ---------- ações ---------- */
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id;
  if (b.type === "checkbox") return;
  const t = turmaAtual();
  switch (act) {
    case "fechar": fechar(); break;
    case "ir": if (id) irTurma(id, b.dataset.view); else location.hash = lk(b.dataset.view); break;
    case "nova-turma": S.horPop = null; dlgTurma(); if (b.dataset.turno) { const sel = document.getElementById("tTurno"); if (sel) sel.value = b.dataset.turno; } if (b.dataset.escola) escolherEscolaDlg(b.dataset.escola); setTimeout(() => abrirPopTurma(true), 30); break;
    case "editar-turma": dlgTurma(JSON.parse(JSON.stringify(turma(id)))); break;
    case "salvar-turma": {
      const ls = (dlg._tn?.letras || []).filter(l => l !== "Única"), discs = discsEscolhidas(), novaT = !S.turmas.some(x => x.id === dlg._obj.id);
      if (novaT && !discs.length) { toast("Marque a disciplina."); return; }
      if (novaT && (ls.length > 1 && val("tNome") === nomeComposto() || discs.length > 1)) {
        if (!val("tNome")) { toast("Preencha o nome da turma."); return; }
        const nomes = ls.length > 1 && val("tNome") === nomeComposto() ? ls.map(l => ({ nome: `${dlg._tn.nome} ${l}`, l })) : [{ nome: val("tNome"), l: null }];
        const combos = nomes.flatMap(n => discs.map(d => ({ ...n, d })));
        const base = S.turmas.length, criadas = combos.map(({ nome, l, d }, i) => ({ id: uid(), nome, disciplina: d, serie: val("tSerie"), ano: val("tAno"), turno: (l && dlg._tn.turnos?.[l]) || val("tTurno") || "", escola: val("tEscola"), cor: CORES[(base + i) % CORES.length], alunos: [], bimestres: bimestresPadrao(val("tAno")) }));
        lembrarNoPerfil(val("tEscola"), discs[0]);
        fechar();
        for (const o of criadas) { const irma = [...irmasDe(o), ...criadas.filter(x => x !== o && x.nome === o.nome)].find(x => (x.alunos || []).length); if (irma) o.alunos = JSON.parse(JSON.stringify(irma.alunos)); await salvar("turmas", o); }
        toast(`${criadas.length} turmas criadas: ${criadas.map(o => (ls.length > 1 ? o.nome.split(" ").pop() : o.nome) + (discs.length > 1 ? " · " + o.disciplina : "")).join(", ")}`);
        for (const o of criadas) await pastaAutomatica(o.id);
        location.hash = "turmas"; break;
      }
      const o = dlg._obj; o.nome = val("tNome"); o.disciplina = novaT ? discs[0] : val("tDisc");
      if (!o.nome || !o.disciplina) { toast("Preencha o nome da turma e a disciplina."); return; }
      o.serie = val("tSerie"); o.ano = val("tAno"); o.turno = val("tTurno"); o.escola = val("tEscola");
      o.cor = (dlg.querySelector('input[name="tCor"]:checked') || {}).value || o.cor;
      o.alunos = o.alunos || [];
      if (!bimestresDe(o).length) o.bimestres = bimestresPadrao(o.ano);
      delete o.exemplo;
      const nova = !S.turmas.some(x => x.id === o.id);
      if (nova && !(o.alunos || []).length) { const irma = irmasDe(o).find(x => (x.alunos || []).length); if (irma) { o.alunos = JSON.parse(JSON.stringify(irma.alunos)); toast(`Alunos copiados de ${irma.nome} · ${irma.disciplina}`); } }
      lembrarNoPerfil(o.escola, o.disciplina);
      fechar(); S.turmaSel = o.id; await salvar("turmas", o); toast("Turma salva"); pastaAutomatica(o.id); if (nova) irTurma(o.id, "alunos"); break; }
    case "apagar-turma": dlgExcluirTurma(dlg._obj.id); break;
    case "excluir-turma": dlgExcluirTurma(id); break;
    case "excluir-turma-ok": {
      const tid = dlg._excluir, tt = turma(tid); if (!tt || !document.getElementById("exConf")?.checked) return;
      fechar();
      for (const col of COLS) if (col !== "turmas") for (const x of S[col].filter(x => x.turmaId === tid)) await apagar(col, x.id);
      await apagar("turmas", tid);
      if (S.turmaSel === tid) S.turmaSel = null;
      toast(`${tt.nome} excluída`); if (S.dentroTurma) location.hash = "turmas"; break; }
    case "seed": {
      if (S.mode !== "live") return; b.disabled = true;
      const sfx = uid().slice(0, 6); const ex = JSON.parse(JSON.stringify(exemplo()).replace(/"(ex(?:6a|8b|pl\d+|av\d+|at\d+|q\d+|pr\d+))(_|")/g, (m, id, fim) => `"${id}-${sfx}${fim}`)); for (const col of COLS) for (const o of ex[col]) await salvar(col, o);
      toast("Exemplo carregado. Apague ou edite quando quiser."); break; }

    case "marcar": {
      const cid = t.id + "_" + S.chamadaData;
      const ch = JSON.parse(JSON.stringify(S.chamadas.find(c => c.id === cid) || { id: cid, turmaId: t.id, data: S.chamadaData, presencas: {}, conteudo: "" }));
      ch.presencas[b.dataset.aluno] = b.dataset.v; await salvar("chamadas", ch); break; }
    case "todos-presentes": {
      const cid = t.id + "_" + S.chamadaData;
      const ch = JSON.parse(JSON.stringify(S.chamadas.find(c => c.id === cid) || { id: cid, turmaId: t.id, data: S.chamadaData, presencas: {}, conteudo: "" }));
      (t.alunos || []).forEach(a => { if (!ch.presencas[a.id]) ch.presencas[a.id] = "P"; }); await salvar("chamadas", ch); toast("Chamada salva"); break; }
    case "abrir-chamada": S.chamadaData = b.dataset.data; render(); window.scrollTo(0, 0); break;

    case "nova-avaliacao": dlgAvaliacao(); break;
    case "nota-media-bim": {
      const bi = bimPorNum(t, bimSelecionado(t)); if (!bi) return;
      await salvar("avaliacoes", { id: uid(), turmaId: t.id, nome: "Média do bimestre", peso: 1, data: bi.fim, bimestre: String(bi.num), notas: {} });
      toast("Digite a média de cada aluno na coluna e saia do campo para salvar."); break; }
    case "editar-avaliacao": dlgAvaliacao(JSON.parse(JSON.stringify(S.avaliacoes.find(a => a.id === id)))); break;
    case "salvar-avaliacao": { const o = dlg._obj; o.nome = val("aNome"); if (!o.nome) { toast("Dê um nome à avaliação."); return; } o.peso = Number(val("aPeso")) || 1; o.data = val("aData"); o.bimestre = val("aBim"); delete o.exemplo; fechar(); await salvar("avaliacoes", o); toast("Avaliação salva"); break; }
    case "apagar-avaliacao": if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar: apagar com as notas"; return; } { const aid = dlg._obj.id; fechar(); await apagar("avaliacoes", aid); toast("Avaliação apagada"); } break;
    case "exportar-notas": {
      const avs = S.avaliacoes.filter(a => a.turmaId === t.id).sort((a, b) => (a.data || "").localeCompare(b.data || ""));
      const q = s => `"${String(s).replace(/"/g, '""')}"`;
      const linhas = [["Aluno", ...avs.map(a => `${a.nome} (peso ${a.peso})`), "Média", "Frequência %"].map(q).join(";")];
      (t.alunos || []).forEach(s => { const m = mediaAluno(t, s.id), f = freqAluno(t, s.id); linhas.push([q(s.nome), ...avs.map(a => { const n = a.notas?.[s.id]; return n == null ? "" : String(n).replace(".", ","); }), m == null ? "" : m.toFixed(1).replace(".", ","), f == null ? "" : f].join(";")); });
      await baixar(`boletim-${slug(t.nome)}.csv`, "﻿" + linhas.join("\n")); break; }

    case "novo-plano": dlgPlano(null, false); break;
    case "novo-plano-ia": if (!S.turmas.length) { dlgTurma(); toast("Crie uma turma antes de planejar."); return; } dlgPlano(null, true); setTimeout(() => dlg.querySelector("#iaTema")?.focus(), 50); break;
    case "editar-plano": dlgPlano(JSON.parse(JSON.stringify(S.planos.find(p => p.id === id))), true); break;
    case "ver-plano": dlgVerPlano(S.planos.find(p => p.id === id)); break;
    case "ia-plano": iaPlano(); break;
    case "parar-ia": sampleCtl?.abort(); break;
    case "salvar-plano": { const o = dlg._obj; o.titulo = val("pTitulo"); if (!o.titulo) { toast("Dê um título ao plano."); return; }
      Object.assign(o, { turmaId: val("pTurma"), data: val("pData"), duracao: val("pDur"), bncc: val("pBncc"), objetivos: val("pObj"), conteudo: val("pCont"), metodologia: val("pMet"), recursos: val("pRec"), avaliacao: val("pAval"), status: dlg.querySelector("#pDada").checked ? "dada" : "planejado" }); delete o.exemplo;
      fechar(); await salvar("planos", o); toast("Plano salvo"); break; }
    case "apagar-plano": if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar exclusão"; return; } { const pid = dlg._obj.id; fechar(); await apagar("planos", pid); toast("Plano apagado"); } break;
    case "baixar-plano": { const p = S.planos.find(x => x.id === id); const tt = turma(p.turmaId); const sec = (h, v) => v ? `<div class="sec"><h3>${h}</h3><div>${esc(v)}</div></div>` : "";
      await baixar(`plano-${slug(p.titulo)}.html`, htmlArquivo(p.titulo, `<div class="eyebrow">${esc(tt?.disciplina || "")} · ${esc(tt?.nome || "")} · ${esc(fmtDataLonga(p.data))} · ${esc(p.duracao || "")}</div><h1>${esc(p.titulo)}</h1>${p.bncc ? `<p>BNCC: ${esc(p.bncc)}</p>` : ""}${sec("Objetivos", p.objetivos)}${sec("Conteúdos", p.conteudo)}${sec("Metodologia", p.metodologia)}${sec("Recursos", p.recursos)}${sec("Avaliação", p.avaliacao)}`)); break; }

    case "nova-atividade": dlgAtividade(); break;
    case "editar-atividade": dlgAtividade(JSON.parse(JSON.stringify(S.atividades.find(a => a.id === id)))); break;
    case "ia-atividade": iaAtividade(); break;
    case "salvar-atividade": { const o = dlg._obj; o.titulo = val("atTitulo"); if (!o.titulo) { toast("Dê um título à atividade."); return; } Object.assign(o, { turmaId: val("atTurma"), prazo: val("atPrazo"), valor: val("atValor"), descricao: val("atDesc") }); delete o.exemplo; fechar(); await salvar("atividades", o); toast("Atividade salva"); break; }
    case "apagar-atividade": if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar exclusão"; return; } { const aid = dlg._obj.id; fechar(); await apagar("atividades", aid); toast("Atividade apagada"); } break;

    case "nova-questao": dlgQuestao(); break;
    case "editar-questao": dlgQuestao(JSON.parse(JSON.stringify(S.questoes.find(q => q.id === id)))); break;
    case "salvar-questao": { const o = dlg._obj; o.enunciado = val("qEnun"); if (!o.enunciado) { toast("Escreva o enunciado."); return; }
      Object.assign(o, { disciplina: val("qDisc"), tema: val("qTema"), bncc: val("qBncc"), tipo: val("qTipo"), dificuldade: val("qDif"), serie: val("qSerie"), alternativas: val("qAlts").split("\n").map(s => s.trim()).filter(Boolean), resposta: val("qResp") });
      o.correta = o.tipo === "aberta" ? null : Number(val("qCorreta")); delete o.exemplo; fechar(); await salvar("questoes", o); toast("Questão salva"); break; }
    case "apagar-questao": if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar exclusão"; return; } { const qid = dlg._obj.id; fechar(); await apagar("questoes", qid); toast("Questão apagada"); } break;
    case "gerar-questoes": dlgGerarQuestoes(); setTimeout(() => dlg.querySelector("#gTema")?.focus(), 50); break;
    case "ia-questoes": iaQuestoes(); break;
    case "salvar-geradas": { const sel = [...dlg.querySelectorAll('input[name="gSel"]:checked')].map(x => dlg._gerada[Number(x.value)]); fechar(); for (const q of sel) await salvar("questoes", q); toast(`${sel.length} questões guardadas no banco`); break; }

    case "nova-prova": if (!S.questoes.length) { location.hash = lk("questoes"); return; } dlgProva(); break;
    case "editar-prova": dlgProva(JSON.parse(JSON.stringify(S.provas.find(p => p.id === id)))); break;
    case "salvar-prova": { const o = dlg._obj; o.titulo = val("prTitulo"); if (!o.titulo) { toast("Dê um título à prova."); return; }
      Object.assign(o, { turmaId: val("prTurma"), data: val("prData"), instrucoes: val("prInst"), questaoIds: [...dlg.querySelectorAll('input[name="prQ"]:checked')].map(x => x.value) }); delete o.exemplo;
      fechar(); await salvar("provas", o); toast("Prova salva"); break; }
    case "apagar-prova": if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar exclusão"; return; } { const pid = dlg._obj.id; fechar(); await apagar("provas", pid); toast("Prova apagada"); } break;
    case "ver-prova": dlgVerProva(S.provas.find(p => p.id === id), false); break;
    case "ver-prova-gab": dlgVerProva(S.provas.find(p => p.id === id), true); break;
    case "baixar-prova": { const p = S.provas.find(x => x.id === id); const g = b.dataset.gab === "1"; await baixar(`${slug(p.titulo)}${g ? "-gabarito" : ""}.html`, htmlArquivo(p.titulo, provaDoc(p, g))); break; }

    case "sugestao": enviarChat(b.dataset.txt); break;
    case "limpar-chat": S.chat = []; render(); break;
  }
});

document.addEventListener("change", async e => {
  const el = e.target;
  if (el.id === "chData") { S.chamadaData = el.value || hoje(); render(); _rotaDiario(); return; }
  if (el.matches("input.grade")) {
    const a = JSON.parse(JSON.stringify(S.avaliacoes.find(x => x.id === el.dataset.av))); a.notas = a.notas || {};
    const raw = el.value.trim().replace(",", ".");
    if (raw === "") delete a.notas[el.dataset.aluno];
    else { const n = Number(raw); if (isNaN(n) || n < 0 || n > 10) { toast("A nota deve ser um número de 0 a 10."); el.value = ""; return; } a.notas[el.dataset.aluno] = n; }
    await salvar("avaliacoes", a);
    // aviso de recuperação quando o aluno já tem todas as notas do bimestre
    const t = turma(a.turmaId), al = (t?.alunos || []).find(x => x.id === el.dataset.aluno);
    if (t && al && raw !== "") {
      const avsB = S.avaliacoes.filter(x => x.turmaId === t.id && String(x.bimestre) === String(a.bimestre));
      const completo = avsB.every(x => x.notas && x.notas[al.id] != null && x.notas[al.id] !== "");
      const m = mediaAluno(t, al.id, a.bimestre), sit = situacaoAno(t, al.id), B = bimPorNum(t, a.bimestre);
      if (completo && sit.estado === "exame" && !sit.faltam) toast(`Atenção: ${al.nome} fechou o ano com média ${fmtNota(sit.ms.reduce((x, y) => x + y, 0) / sit.ms.length)} e vai para o exame final.`);
      else if (completo && m !== null && m < MEDIA_MIN) toast(`Atenção: ${al.nome} ficou em recuperação${B ? " no " + B.nome : ""} (média ${fmtNota(m)}).`);
    }
    return;
  }
  if (el.dataset.act === "entrega") { const a = JSON.parse(JSON.stringify(S.atividades.find(x => x.id === el.dataset.id))); a.entregas = a.entregas || {}; a.entregas[el.dataset.aluno] = el.checked; await salvar("atividades", a); return; }
  if (el.id === "fDisc") { S.filtroQ.disc = el.value; render(); }
  if (el.id === "fDif") { S.filtroQ.dif = el.value; render(); }
});
document.addEventListener("input", e => {
  if (e.target.id === "fTxt") { S.filtroQ.txt = e.target.value; clearTimeout(document._ft); document._ft = setTimeout(() => { const pos = e.target.selectionStart; e.target.blur(); render(); const f = $("#fTxt"); if (f) { f.focus(); f.setSelectionRange(pos, pos); } }, 300); }
});
document.addEventListener("submit", e => {
  if (e.target.id === "chatForm") { e.preventDefault(); const i = $("#chatInput"); const v = i.value.trim(); i.value = ""; i.blur(); enviarChat(v); }
});
document.addEventListener("keydown", e => {
  if (e.target.id === "chatInput" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chatForm").requestSubmit(); }
});
dlg.addEventListener("close", () => { if (sampleCtl) sampleCtl.abort(); });

function lerRota() {
  let h = location.hash.slice(1);
  if (/^turma-.+-horario$/.test(h)) h = "horario"; // links antigos da aba Horário
  const m = h.match(new RegExp("^turma-(.+)-(" + ABAS.map(a => a[0]).join("|") + ")$"));
  if (m) { S.dentroTurma = true; S.turmaSel = m[1]; S.view = m[2]; try { localStorage.setItem("cp_turma", m[1]); } catch (_) {} return; }
  S.dentroTurma = false; S.horPop = null; S.view = VIEWS.some(v => v[0] === h) || h === "enem" || h === "perfil" ? h : "inicio";
}
function rota() {
  lerRota(); render(); window.scrollTo(0, 0);
  // na aba Bimestres, já mostra o bimestre escolhido (onde fica o Criar com IA)
  if (S.view === "bimestres") { const t = turmaAtual(), n = t && bimSelecionado(t); if (n && n !== "1") setTimeout(() => document.getElementById("bim-" + n)?.scrollIntoView({ block: "start" }), 30); }
}
window.addEventListener("hashchange", rota);
lerRota();
iniciar();
