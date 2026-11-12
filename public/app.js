
/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/-/g, "").slice(0, 14);
const hoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const addDias = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fmtData = iso => iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";
const fmtDataLonga = iso => iso ? new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) : "—";
const fmtNota = n => (n == null || isNaN(n)) ? "—" : Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const COLS = ["turmas", "planos", "chamadas", "avaliacoes", "atividades", "questoes", "provas", "materiais", "slides"];
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
  assistente: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  spark: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'
};
const ico = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

const VIEWS = [
  ["inicio", "Início"], ["turmas", "Turmas"], ["chamada", "Chamada"], ["notas", "Notas"],
  ["planos", "Planejamento", true], ["atividades", "Atividades", true], ["materiais", "Materiais", true], ["slides", "Slides", true], ["questoes", "Questões", true],
  ["provas", "Provas"], ["assistente", "Manu", true]
];

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
  const t1 = { id: "ex6a", nome: "6º ano A", disciplina: "Matemática", serie: "6º ano EF", ano: "2026", turno: "Manhã", cor: CORES[0], alunos: nomesA.map((n, i) => ({ id: "a" + i, nome: n })), exemplo: true };
  const t2 = { id: "ex8b", nome: "8º ano B", disciplina: "Ciências", serie: "8º ano EF", ano: "2026", turno: "Tarde", cor: CORES[1], alunos: nomesB.map((n, i) => ({ id: "b" + i, nome: n })), exemplo: true };
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
  return { turmas: [t1, t2], planos, chamadas, avaliacoes, atividades, questoes, provas, materiais: [], slides: [] };
}

/* ---------- camada de dados ---------- */
async function salvar(col, obj) {
  const arr = S[col]; const i = arr.findIndex(x => x.id === obj.id);
  if (i >= 0) arr[i] = obj; else arr.push(obj);
  render();
  $("#syncState").textContent = "Salvando…";
  try { await api("PUT", "/api/dados/" + col, obj); $("#syncState").textContent = "Tudo salvo"; return true; }
  catch (e) { erroDb(e); return false; }
}
async function apagar(col, id) {
  S[col] = S[col].filter(x => x.id !== id); render();
  try { await api("DELETE", "/api/dados/" + col + "/" + encodeURIComponent(id)); } catch (e) { erroDb(e); }
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
    S.nome = eu.nome || ""; S.escola = eu.escola || ""; cap.ia = !!eu.ia; S.usoIA = eu.usoIA; S.admin = !!eu.admin; S.googleClientId = eu.googleClientId || ""; S.googleConectado = !!eu.googleConectado;
    const listas = await Promise.all(COLS.map(c => api("GET", "/api/dados/" + c)));
    COLS.forEach((c, i) => S[c] = listas[i]);
    S.mode = "live";
    $("#syncState").textContent = "Tudo salvo";
  } catch (e) {
    if (e && e.code === "auth") return;
    S.mode = "erro";
  }
  render();
}

/* ---------- cálculos ---------- */
const turma = id => S.turmas.find(t => t.id === id);
const turmaAtual = () => turma(S.turmaSel) || S.turmas[0] || null;
function freqAluno(t, alunoId) {
  const ch = S.chamadas.filter(c => c.turmaId === t.id && c.presencas && c.presencas[alunoId]);
  if (!ch.length) return null;
  const pres = ch.filter(c => c.presencas[alunoId] !== "F").length;
  return Math.round(pres / ch.length * 100);
}
function mediaAluno(t, alunoId) {
  const avs = S.avaliacoes.filter(a => a.turmaId === t.id);
  let soma = 0, pesos = 0;
  avs.forEach(a => { const n = a.notas && a.notas[alunoId]; if (n !== undefined && n !== null && n !== "" && !isNaN(n)) { soma += Number(n) * (Number(a.peso) || 1); pesos += (Number(a.peso) || 1); } });
  return pesos ? soma / pesos : null;
}
function alertas() {
  const out = [];
  S.turmas.forEach(t => (t.alunos || []).forEach(a => {
    const f = freqAluno(t, a.id), m = mediaAluno(t, a.id);
    if (f !== null && f < FREQ_MIN) out.push({ t, a, tipo: "freq", txt: `Frequência ${f}%`, cls: "bad" });
    if (m !== null && m < MEDIA_MIN) out.push({ t, a, tipo: "nota", txt: `Média ${fmtNota(m)}`, cls: "warn" });
  }));
  return out;
}

/* ---------- renderização ---------- */
let pending = false;
function render() {
  const ae = document.activeElement;
  if (ae && $("#view").contains(ae) && ae.matches("input.grade, textarea, input[type=text], input[type=search]")) { pending = true; return; }
  pending = false;
  renderNav(); renderTurmaSel();
  const v = $("#view");
  if (S.mode === "loading") { v.innerHTML = `<div class="empty"><img class="manu sm" src="/manu/manu-boas-vindas.webp" alt=""><h3>Abrindo seu espaço…</h3><p>Carregando turmas, aulas e notas.</p></div>`; return; }
  if (S.mode === "erro") { v.innerHTML = `<div class="empty"><h3>Não foi possível carregar seus dados</h3><p>Verifique a internet e recarregue a página.</p><button class="btn primary" onclick="location.reload()">Recarregar</button></div>`; return; }
  const fn = { inicio: vInicio, turmas: vTurmas, chamada: vChamada, notas: vNotas, planos: vPlanos, atividades: vAtividades, materiais: vMateriais, slides: vSlides, questoes: vQuestoes, provas: vProvas, assistente: vAssistente }[S.view] || vInicio;
  const banner = "";
  v.innerHTML = banner + fn();
  if (S.view === "assistente") { const c = $("#chatLog"); if (c) c.scrollTop = c.scrollHeight; }
}
document.addEventListener("focusout", () => setTimeout(() => { if (pending) render(); }, 0));

function renderNav() {
  $("#nav").innerHTML = VIEWS.map(([k, n, ai]) => `<a href="#${k}" ${S.view === k ? 'aria-current="page"' : ""}>${ico(k)}<span>${n}</span>${ai ? '<span class="ai">IA</span>' : ""}</a>`).join("");
  $("#who").textContent = S.nome ? S.nome + (S.escola ? " · " + S.escola : "") : "";
  $("#adminLink").hidden = !S.admin;
  const u = S.usoIA, box = $("#usoIA");
  if (u && cap.ia) { box.hidden = false; box.innerHTML = `<span>IA este mês: <b class="num">${u.usados}</b> de <span class="num">${u.limite}</span></span><div class="bar"><i style="width:${Math.min(100, Math.round(u.usados / Math.max(1, u.limite) * 100))}%"></i></div>`; }
}
function renderTurmaSel() {
  const sel = $("#turmaSel"); const t = turmaAtual();
  sel.innerHTML = S.turmas.length ? S.turmas.map(x => `<option value="${esc(x.id)}" ${t && t.id === x.id ? "selected" : ""}>${esc(x.nome)} · ${esc(x.disciplina)}</option>`).join("") : `<option>Nenhuma turma ainda</option>`;
  sel.disabled = !S.turmas.length;
}
$("#turmaSel").addEventListener("change", e => { S.turmaSel = e.target.value; try { localStorage.setItem("cp_turma", S.turmaSel); } catch (_) {} render(); });
try { S.turmaSel = localStorage.getItem("cp_turma"); } catch (_) {}

function semTurma(msg) {
  return `<div class="empty"><img class="manu" src="/manu/manu-agenda.webp" alt=""><h3>Crie sua primeira turma</h3><p>${esc(msg || "Cadastre uma turma com a lista de alunos para usar chamada, notas e atividades.")}</p>
  <div class="toolbar" style="justify-content:center"><button class="btn primary" data-act="nova-turma">${ico("plus")}Nova turma</button>${S.mode === "live" ? `<button class="btn" data-act="seed">Carregar exemplo</button>` : ""}</div></div>`;
}

/* ----- Início ----- */
function vInicio() {
  const d0 = hoje(), em7 = addDias(d0, 7);
  const proxAulas = S.planos.filter(p => p.data >= d0 && p.data <= em7).sort((a, b) => a.data.localeCompare(b.data));
  const proxAtiv = S.atividades.filter(a => a.prazo >= d0).sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 5);
  const al = alertas();
  const totAlunos = S.turmas.reduce((s, t) => s + (t.alunos || []).length, 0);
  const saud = new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";
  if (!S.turmas.length) return `<div class="page-head"><div class="hello"><img src="/manu/manu-boas-vindas.webp" alt=""><div><span class="eyebrow">${esc(fmtDataLonga(d0))}</span><h1>${saud}${S.nome ? ", " + esc(S.nome.split(" ")[0]) : ""}</h1></div></div></div>` + semTurma("Comece cadastrando uma turma. Depois você faz a chamada, lança notas e planeja aulas com ajuda da IA.");
  return `
  <div class="page-head"><div class="hello"><img src="/manu/manu-boas-vindas.webp" alt=""><div><span class="eyebrow">${esc(fmtDataLonga(d0))}</span><h1>${saud}${S.nome ? ", " + esc(S.nome.split(" ")[0]) : ""}</h1><p class="muted">Resumo das suas turmas e do que vem pela frente.</p></div></div>
  <div class="toolbar"><a class="btn" href="#chamada">Fazer chamada</a><button class="btn ai" data-act="novo-plano-ia">${ico("spark")}Planejar aula com IA</button></div></div>
  <div class="stats">
    <div class="stat"><span class="eyebrow">Turmas</span><span class="v num">${S.turmas.length}</span><span class="small muted">${totAlunos} alunos</span></div>
    <div class="stat"><span class="eyebrow">Aulas nos próximos 7 dias</span><span class="v num">${proxAulas.length}</span><span class="small muted">planejadas</span></div>
    <div class="stat"><span class="eyebrow">Atividades abertas</span><span class="v num">${S.atividades.filter(a => a.prazo >= d0).length}</span><span class="small muted">com prazo a vencer</span></div>
    <div class="stat"><span class="eyebrow">Alunos em alerta</span><span class="v num" style="color:${al.length ? "var(--bad)" : "var(--ok)"}">${new Set(al.map(x => x.t.id + x.a.id)).size}</span><span class="small muted">frequência ou média baixa</span></div>
  </div>
  <div class="cols">
    <section class="panel"><div class="panel-head"><h2>Próximas aulas</h2><a class="btn sm ghost" href="#planos">Ver planejamento</a></div>
      ${proxAulas.length ? `<div class="list">${proxAulas.map(p => { const t = turma(p.turmaId); return `<div class="row"><span class="dot" style="background:${esc(t?.cor || "var(--muted)")}"></span><div class="grow"><div class="title">${esc(p.titulo)}</div><div class="small muted">${esc(t?.nome || "Sem turma")} · ${esc(p.duracao || "")}</div></div>${p.bncc ? `<span class="bncc">${esc(p.bncc)}</span>` : ""}<span class="chip num">${fmtData(p.data)}</span><button class="btn sm" data-act="ver-plano" data-id="${esc(p.id)}">Abrir</button></div>`; }).join("")}</div>`
        : `<p class="muted">Nenhuma aula planejada para esta semana. <button class="btn sm ai" data-act="novo-plano-ia">${ico("spark")}Planejar com IA</button></p>`}
    </section>
    <section class="panel"><div class="panel-head"><h2>Precisam de atenção</h2></div>
      ${al.length ? `<div class="list">${al.slice(0, 8).map(x => `<div class="row"><div class="grow"><div class="title">${esc(x.a.nome)}</div><div class="small muted">${esc(x.t.nome)}</div></div><span class="chip ${x.cls}">${esc(x.txt)}</span></div>`).join("")}</div>`
        : `<p class="muted">Nenhum aluno abaixo de ${FREQ_MIN}% de frequência ou média ${MEDIA_MIN}.</p>`}
    </section>
  </div>
  <section class="panel"><div class="panel-head"><h2>Prazos de atividades</h2><a class="btn sm ghost" href="#atividades">Ver todas</a></div>
    ${proxAtiv.length ? `<div class="list">${proxAtiv.map(a => { const t = turma(a.turmaId); const n = (t?.alunos || []).length; const e = Object.values(a.entregas || {}).filter(Boolean).length; return `<div class="row"><span class="dot" style="background:${esc(t?.cor || "var(--muted)")}"></span><div class="grow"><div class="title">${esc(a.titulo)}</div><div class="small muted">${esc(t?.nome || "")}</div></div><span class="small muted num">${e}/${n} entregues</span><span class="chip ${a.prazo === d0 ? "warn" : ""} num">${fmtData(a.prazo)}</span></div>`; }).join("")}</div>` : `<p class="muted">Nenhuma atividade com prazo aberto.</p>`}
  </section>`;
}

/* ----- Turmas ----- */
function vTurmas() {
  const head = `<div class="page-head"><div><h1>Turmas</h1><p class="muted">Suas turmas, alunos e o resumo de cada uma.</p></div><div class="toolbar"><button class="btn primary" data-act="nova-turma">${ico("plus")}Nova turma</button></div></div>`;
  if (!S.turmas.length) return head + semTurma();
  return head + `<div class="cards">${S.turmas.map(t => {
    const al = t.alunos || []; const meds = al.map(a => mediaAluno(t, a.id)).filter(x => x !== null);
    const fr = al.map(a => freqAluno(t, a.id)).filter(x => x !== null);
    const mm = meds.length ? meds.reduce((a, b) => a + b, 0) / meds.length : null;
    const fm = fr.length ? Math.round(fr.reduce((a, b) => a + b, 0) / fr.length) : null;
    return `<article class="card"><div class="card-top"><div style="display:flex;gap:10px;min-width:0"><span class="swatch" style="background:${esc(t.cor)}"></span><div style="min-width:0"><h3>${esc(t.nome)}</h3><p class="small muted">${esc(t.disciplina)} · ${esc(t.serie || "")}${t.turno ? " · " + esc(t.turno) : ""}</p></div></div>${t.exemplo ? '<span class="chip">exemplo</span>' : ""}</div>
      <div class="grid3" style="gap:8px"><div><span class="eyebrow">Alunos</span><div class="num" style="font-size:1.2rem">${al.length}</div></div><div><span class="eyebrow">Média</span><div class="num" style="font-size:1.2rem">${fmtNota(mm)}</div></div><div><span class="eyebrow">Freq.</span><div class="num" style="font-size:1.2rem">${fm === null ? "—" : fm + "%"}</div></div></div>
      <div class="toolbar"><button class="btn sm" data-act="editar-turma" data-id="${esc(t.id)}">Editar e alunos</button><button class="btn sm ghost" data-act="ir" data-view="chamada" data-id="${esc(t.id)}">Chamada</button><button class="btn sm ghost" data-act="ir" data-view="notas" data-id="${esc(t.id)}">Notas</button>${S.googleClientId ? `<button class="btn sm ghost" data-act="drive-pasta" data-id="${esc(t.id)}">${ico("drive")}Pasta no Drive</button>` : ""}</div></article>`;
  }).join("")}</div>`;
}

/* ----- Chamada ----- */
function vChamada() {
  const t = turmaAtual();
  const head = `<div class="page-head"><div><h1>Chamada</h1><p class="muted">Marque P (presente), F (falta) ou J (falta justificada). Salva sozinho.</p></div></div>`;
  if (!t) return head + semTurma();
  const id = t.id + "_" + S.chamadaData;
  const ch = S.chamadas.find(c => c.id === id);
  const pres = ch?.presencas || {};
  const al = t.alunos || [];
  const nP = al.filter(a => pres[a.id] === "P").length, nF = al.filter(a => pres[a.id] === "F").length, nJ = al.filter(a => pres[a.id] === "J").length;
  const hist = S.chamadas.filter(c => c.turmaId === t.id).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 8);
  return head + `
  <section class="panel">
    <div class="panel-head">
      <div class="toolbar"><div class="field"><label for="chData">Data da aula</label><input class="input" type="date" id="chData" value="${esc(S.chamadaData)}"></div>
      <div class="field" style="min-width:220px;flex:1"><label for="chConteudo">Conteúdo da aula (diário)</label><input class="input" type="text" id="chConteudo" value="${esc(ch?.conteudo || "")}" placeholder="Ex.: Frações equivalentes, p. 84"></div></div>
      <div class="toolbar"><span class="chip ok num">${nP} P</span><span class="chip bad num">${nF} F</span><span class="chip warn num">${nJ} J</span><button class="btn sm" data-act="todos-presentes">Todos presentes</button></div>
    </div>
    ${al.length ? `<div class="list">${al.map((a, i) => `<div class="row"><span class="num muted small" style="width:22px">${String(i + 1).padStart(2, "0")}</span><div class="grow"><div class="title">${esc(a.nome)}</div><div class="small muted">Frequência: ${freqAluno(t, a.id) ?? "—"}${freqAluno(t, a.id) !== null ? "%" : ""}</div></div>
      <div class="pres" role="group" aria-label="Presença de ${esc(a.nome)}">${["P", "F", "J"].map(v => `<button data-act="marcar" data-aluno="${esc(a.id)}" data-v="${v}" aria-pressed="${pres[a.id] === v}">${v}</button>`).join("")}</div></div>`).join("")}</div>`
      : `<p class="muted">Esta turma ainda não tem alunos. <button class="btn sm" data-act="editar-turma" data-id="${esc(t.id)}">Adicionar alunos</button></p>`}
  </section>
  <section class="panel"><h2>Aulas registradas</h2>
    ${hist.length ? `<div class="list">${hist.map(c => { const v = Object.values(c.presencas || {}); return `<div class="row"><span class="chip num">${fmtData(c.data)}</span><div class="grow small">${esc(c.conteudo || "Sem conteúdo registrado")}</div><span class="small muted num">${v.filter(x => x !== "F").length}/${v.length} presentes</span><button class="btn sm ghost" data-act="abrir-chamada" data-data="${esc(c.data)}">Abrir</button></div>`; }).join("")}</div>` : `<p class="muted">Nenhuma chamada registrada nesta turma.</p>`}
  </section>`;
}

/* ----- Notas ----- */
function vNotas() {
  const t = turmaAtual();
  const head = `<div class="page-head"><div><h1>Notas</h1><p class="muted">Média ponderada pelos pesos. Abaixo de ${MEDIA_MIN} fica em destaque.</p></div><div class="toolbar">${t ? `<button class="btn" data-act="exp" data-fmt="arquivo" data-turma="${esc(t.id)}">${ico("dl")}Excel</button>${S.googleClientId ? `<button class="btn" data-act="exp" data-fmt="drive" data-turma="${esc(t.id)}">${ico("drive")}Google Planilhas</button>` : ""}<button class="btn primary" data-act="nova-avaliacao">${ico("plus")}Nova avaliação</button>` : ""}</div></div>`;
  if (!t) return head + semTurma();
  const avs = S.avaliacoes.filter(a => a.turmaId === t.id).sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const al = t.alunos || [];
  if (!avs.length) return head + `<div class="empty"><img class="manu sm" src="/manu/manu-ajuda.webp" alt=""><h3>Nenhuma avaliação em ${esc(t.nome)}</h3><p>Crie uma prova, trabalho ou participação com o peso dela na média.</p><button class="btn primary" data-act="nova-avaliacao">${ico("plus")}Nova avaliação</button></div>`;
  return head + `<div class="table-wrap"><table>
    <thead><tr><th class="sticky-col">Aluno</th>${avs.map(a => `<th class="c"><button class="btn sm ghost" data-act="editar-avaliacao" data-id="${esc(a.id)}" title="Editar avaliação">${esc(a.nome)}</button><div class="num" style="text-transform:none">peso ${esc(a.peso)} · ${fmtData(a.data)}</div></th>`).join("")}<th class="c">Média</th><th class="c">Freq.</th><th class="c">Situação</th></tr></thead>
    <tbody>${al.map(s => { const m = mediaAluno(t, s.id), f = freqAluno(t, s.id);
      const sit = m === null ? `<span class="chip">sem notas</span>` : (m >= MEDIA_MIN && (f === null || f >= FREQ_MIN)) ? `<span class="chip ok">em dia</span>` : (m < MEDIA_MIN ? `<span class="chip warn">recuperação</span>` : `<span class="chip bad">frequência</span>`);
      return `<tr><td class="sticky-col">${esc(s.nome)}</td>${avs.map(a => { const n = a.notas?.[s.id]; return `<td class="c"><input class="grade" type="text" inputmode="decimal" aria-label="Nota de ${esc(s.nome)} em ${esc(a.nome)}" data-av="${esc(a.id)}" data-aluno="${esc(s.id)}" value="${n === undefined || n === null ? "" : esc(String(n).replace(".", ","))}"></td>`; }).join("")}
      <td class="c num" style="font-weight:600;color:${m !== null && m < MEDIA_MIN ? "var(--warn)" : "inherit"}">${fmtNota(m)}</td><td class="c num" style="color:${f !== null && f < FREQ_MIN ? "var(--bad)" : "inherit"}">${f === null ? "—" : f + "%"}</td><td class="c">${sit}</td></tr>`; }).join("")}</tbody></table></div>
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
    ${q.tipo !== "aberta" && q.alternativas?.length ? `<ol type="A">${q.alternativas.map((alt, i) => `<li class="${gabarito && i === q.correta ? "correct" : ""}">${esc(alt)}</li>`).join("")}</ol>` : ""}
    ${gabarito && q.tipo === "aberta" && q.resposta ? `<p class="small" style="color:var(--ok)"><b>Resposta esperada:</b> ${esc(q.resposta)}</p>` : ""}
    ${gabarito && q.tipo !== "aberta" && q.correta != null ? `<p class="small" style="color:var(--ok)"><b>Gabarito:</b> ${letras[q.correta] || ""}</p>` : ""}</div>`;
}
function vQuestoes() {
  const f = S.filtroQ;
  const discs = [...new Set(S.questoes.map(q => q.disciplina).filter(Boolean))].sort();
  const lista = S.questoes.filter(q => (!f.disc || q.disciplina === f.disc) && (!f.dif || q.dificuldade === f.dif) && (!f.txt || (q.enunciado + " " + q.tema).toLowerCase().includes(f.txt.toLowerCase())));
  const head = `<div class="page-head"><div><h1>Banco de questões</h1><p class="muted">${S.questoes.length} questões guardadas para montar provas.</p></div><div class="toolbar"><button class="btn" data-act="nova-questao">${ico("plus")}Nova questão</button><button class="btn ai" data-act="gerar-questoes">${ico("spark")}Gerar com IA</button></div></div>`;
  if (!S.questoes.length) return head + `<div class="empty"><img class="manu sm" src="/manu/manu-ajuda.webp" alt=""><h3>Seu banco está vazio</h3><p>Peça à Manu questões sobre um tema, escolha as que gostar e guarde aqui.</p><button class="btn ai" data-act="gerar-questoes">${ico("spark")}Gerar com IA</button></div>`;
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
  if (!S.provas.length) return head + `<div class="empty"><img class="manu sm" src="/manu/manu-agenda.webp" alt=""><h3>Nenhuma prova montada</h3><p>${S.questoes.length ? "Escolha questões do seu banco para montar a primeira." : "Primeiro guarde algumas questões no banco, depois monte a prova."}</p><button class="btn primary" data-act="${S.questoes.length ? "nova-prova" : "ir"}" data-view="questoes">${S.questoes.length ? "Nova prova" : "Ir ao banco de questões"}</button></div>`;
  return head + `<div class="cards">${S.provas.map(p => { const t = turma(p.turmaId); return `<article class="card"><span class="eyebrow">${fmtData(p.data)} · ${esc(t?.nome || "Sem turma")}</span><h3>${esc(p.titulo)}</h3><p class="small muted">${(p.questaoIds || []).length} questões</p><div class="toolbar"><button class="btn sm" data-act="ver-prova" data-id="${esc(p.id)}">Visualizar</button><button class="btn sm ghost" data-act="editar-prova" data-id="${esc(p.id)}">Editar</button></div></article>`; }).join("")}</div>`;
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
const turmaOpts = sel => S.turmas.map(t => `<option value="${esc(t.id)}" ${sel === t.id ? "selected" : ""}>${esc(t.nome)} · ${esc(t.disciplina)}</option>`).join("");

function dlgTurma(t) {
  t = t || { id: uid(), nome: "", disciplina: "", serie: "", ano: String(new Date().getFullYear()), turno: "", cor: CORES[S.turmas.length % CORES.length], alunos: [] };
  dlg._obj = t;
  abrirDlg(t.nome ? "Editar turma" : "Nova turma", `
    <div class="grid2"><div class="field"><label for="tNome">Nome da turma</label><input class="input" id="tNome" required value="${esc(t.nome)}" placeholder="7º ano C"></div>
    <div class="field"><label for="tDisc">Disciplina</label><input class="input" id="tDisc" required value="${esc(t.disciplina)}" placeholder="Língua Portuguesa"></div></div>
    <div class="grid3"><div class="field"><label for="tSerie">Série / etapa</label><input class="input" id="tSerie" value="${esc(t.serie)}" placeholder="7º ano EF"></div>
    <div class="field"><label for="tAno">Ano letivo</label><input class="input" id="tAno" value="${esc(t.ano)}"></div>
    <div class="field"><label for="tTurno">Turno</label><select class="input" id="tTurno">${["", "Manhã", "Tarde", "Noite", "Integral"].map(x => `<option ${t.turno === x ? "selected" : ""}>${x}</option>`).join("")}</select></div></div>
    <div class="field"><label>Cor</label><div class="toolbar">${CORES.map(c => `<label style="cursor:pointer"><input type="radio" name="tCor" value="${c}" ${t.cor === c ? "checked" : ""} style="accent-color:${c}"> <span class="dot" style="display:inline-block;background:${c}"></span></label>`).join("")}</div></div>
    <div class="field"><label for="tAlunos">Alunos, um por linha (cole da lista da secretaria)</label><textarea class="input" id="tAlunos" rows="8" placeholder="Ana Beatriz Souza&#10;Bruno Henrique Lima">${esc((t.alunos || []).map(a => a.nome).join("\n"))}</textarea><span class="small muted">Remover um nome apaga as notas e presenças dele nesta turma.</span></div>`,
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
  a = a || { id: uid(), turmaId: t.id, nome: "", peso: 1, data: hoje(), bimestre: "1", notas: {} };
  dlg._obj = a;
  abrirDlg(S.avaliacoes.some(x => x.id === a.id) ? "Editar avaliação" : "Nova avaliação", `
    <div class="field"><label for="aNome">Nome</label><input class="input" id="aNome" value="${esc(a.nome)}" placeholder="Prova 2 — Equações"></div>
    <div class="grid3"><div class="field"><label for="aPeso">Peso na média</label><input class="input" id="aPeso" type="number" min="0" step="0.5" value="${esc(a.peso)}"></div>
    <div class="field"><label for="aData">Data</label><input class="input" id="aData" type="date" value="${esc(a.data)}"></div>
    <div class="field"><label for="aBim">Bimestre</label><select class="input" id="aBim">${["1", "2", "3", "4"].map(b => `<option value="${b}" ${a.bimestre === b ? "selected" : ""}>${b}º bimestre</option>`).join("")}</select></div></div>`,
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
    `${botoesExport(`data-prova="${esc(p.id)}" data-gab="${gab ? 1 : 0}"`)}<button type="button" class="btn primary" data-act="fechar">Fechar</button>`);
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
  const salvos = S.materiais.slice().sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
  return `<div class="page-head"><div><h1>Materiais para imprimir</h1><p class="muted">Atividades prontas para imprimir e adaptações para inclusão, feitas pela Manu. Revise sempre antes de usar.</p></div></div>
  ${!cap.ia ? `<div class="banner"><b>IA ainda não configurada.</b><span>O administrador precisa definir a chave da Anthropic no servidor.</span></div>` : ""}
  <section class="panel">
    <div class="mat-tipos" role="radiogroup" aria-label="Tipo de material">${Object.entries(MAT_TIPOS).map(([k, [n, d]]) => `<button type="button" class="mat-tipo" role="radio" aria-checked="${f.subtipo === k}" data-act="mat-tipo" data-v="${k}"><b>${n}</b><span>${d}</span></button>`).join("")}</div>
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
  const salvos = S.slides.slice().sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
  return `<div class="page-head"><div><h1>Slides da aula</h1><p class="muted">A Manu monta a apresentação a partir do seu plano de aula ou de um tema. Baixe em PowerPoint e edite no PowerPoint, Google Apresentações ou Canva.</p></div></div>
  ${!cap.ia ? `<div class="banner"><b>IA ainda não configurada.</b><span>O administrador precisa definir a chave da Anthropic no servidor.</span></div>` : ""}
  <section class="panel">
    <div class="field"><label for="sPlano">Usar um plano de aula (opcional)</label><select class="input" id="sPlano"><option value="">Sem plano: só o tema</option>${S.planos.slice().sort((a, b) => (b.data || "").localeCompare(a.data || "")).map(p => `<option value="${esc(p.id)}" ${f.planoId === p.id ? "selected" : ""}>${esc(p.titulo)} · ${esc(turma(p.turmaId)?.nome || "")} · ${fmtData(p.data)}</option>`).join("")}</select></div>
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
    S.slAtual = { titulo: String(d.titulo || f.tema), slides: d.slides, bncc: String(d.bncc || ""), id: uid(), tema: f.tema, serie: f.serie, disciplina: f.disciplina, planoId: f.planoId, criadoEm: new Date().toISOString() };
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
  else if (act === "sl-do-plano") { const p = S.planos.find(x => x.id === b.dataset.id); if (p) { const t = turma(p.turmaId); Object.assign(S.slForm, { planoId: p.id, tema: p.titulo, serie: t?.serie || "", disciplina: t?.disciplina || "" }); fechar(); location.hash = "slides"; } }
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
const nomePastaTurma = t => t ? `${t.nome} · ${t.disciplina}`.replace(/[\\/]/g, "-") : "Sem turma";
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

/* ---------- ações ---------- */
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, id = b.dataset.id;
  if (b.type === "checkbox") return;
  const t = turmaAtual();
  switch (act) {
    case "fechar": fechar(); break;
    case "ir": if (id) S.turmaSel = id; location.hash = b.dataset.view; break;
    case "nova-turma": dlgTurma(); break;
    case "editar-turma": dlgTurma(JSON.parse(JSON.stringify(turma(id)))); break;
    case "salvar-turma": {
      const o = dlg._obj; o.nome = val("tNome"); o.disciplina = val("tDisc");
      if (!o.nome || !o.disciplina) { toast("Preencha o nome da turma e a disciplina."); return; }
      o.serie = val("tSerie"); o.ano = val("tAno"); o.turno = val("tTurno");
      o.cor = (dlg.querySelector('input[name="tCor"]:checked') || {}).value || o.cor;
      const nomes = val("tAlunos").split(/\n+/).map(s => s.replace(/^\s*\d+[\s.\-–)]+/, "").trim()).filter(Boolean);
      const antigos = o.alunos || [];
      o.alunos = nomes.map(n => antigos.find(a => a.nome === n) || { id: uid(), nome: n });
      delete o.exemplo;
      fechar(); S.turmaSel = o.id; await salvar("turmas", o); toast("Turma salva"); pastaAutomatica(o.id); break; }
    case "apagar-turma": {
      if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar: apagar turma e tudo dela"; return; }
      const tid = dlg._obj.id; fechar();
      for (const col of ["chamadas", "avaliacoes", "atividades", "planos"]) for (const x of S[col].filter(x => x.turmaId === tid)) await apagar(col, x.id);
      await apagar("turmas", tid); toast("Turma apagada"); break; }
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

    case "nova-prova": if (!S.questoes.length) { location.hash = "questoes"; return; } dlgProva(); break;
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
  if (el.id === "chData") { S.chamadaData = el.value || hoje(); render(); return; }
  if (el.id === "chConteudo") { const t = turmaAtual(); const cid = t.id + "_" + S.chamadaData; const ch = JSON.parse(JSON.stringify(S.chamadas.find(c => c.id === cid) || { id: cid, turmaId: t.id, data: S.chamadaData, presencas: {}, conteudo: "" })); ch.conteudo = el.value.trim(); await salvar("chamadas", ch); toast("Conteúdo registrado"); return; }
  if (el.matches("input.grade")) {
    const a = JSON.parse(JSON.stringify(S.avaliacoes.find(x => x.id === el.dataset.av))); a.notas = a.notas || {};
    const raw = el.value.trim().replace(",", ".");
    if (raw === "") delete a.notas[el.dataset.aluno];
    else { const n = Number(raw); if (isNaN(n) || n < 0 || n > 10) { toast("A nota deve ser um número de 0 a 10."); el.value = ""; return; } a.notas[el.dataset.aluno] = n; }
    await salvar("avaliacoes", a); return;
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

function rota() { const h = location.hash.slice(1); S.view = VIEWS.some(v => v[0] === h) ? h : "inicio"; render(); window.scrollTo(0, 0); }
window.addEventListener("hashchange", rota);
S.view = VIEWS.some(v => v[0] === location.hash.slice(1)) ? location.hash.slice(1) : "inicio";
iniciar();
