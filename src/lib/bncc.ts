// Catálogo oficial da BNCC 2018 (Ensino Fundamental e Médio), extraído das planilhas do MEC.
// Veja data/bncc/README.md. A Educação Infantil não está no catálogo: os códigos EI passam sem conferência.
import catalogo from "../../data/bncc/2018.json";

type Bruta = { c: string; k: string; a: string[]; d: string; o?: string };
export type Habilidade = { codigo: string; componente: string; anos: string[]; descricao: string; objeto: string };

const TODAS: Habilidade[] = (catalogo.habilidades as Bruta[]).map((h) => ({ codigo: h.c, componente: h.k, anos: h.a, descricao: h.d, objeto: h.o || "" }));
const POR_CODIGO = new Map(TODAS.map((h) => [h.codigo, h]));

export const habilidadePorCodigo = (codigo: string) => POR_CODIGO.get(String(codigo || "").trim().toUpperCase());
// Só EF e EM estão no catálogo; outros códigos (EI, currículos estaduais) não dá para conferir aqui.
// Qualquer código que comece com EF ou EM é conferido, mesmo mal escrito (ex.: "EFMA07"), para não passar inventado.
export const codigoConferivel = (codigo: string) => /^E[FM]/i.test(String(codigo || "").trim());

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Disciplina da turma → componentes do catálogo. No Médio, a BNCC organiza por área.
function componentesDe(disciplina: string, medio: boolean): string[] | null {
  const d = semAcento(disciplina || "");
  if (!d || /polivalente|itinerario|projeto de vida/.test(d)) return null;
  if (!medio) {
    // nomes como a turma costuma escrever: "Português", "Artes", "Ed. Física", "Religião"…
    const ef: [RegExp, string][] = [[/ingl/, "Língua Inglesa"], [/portugu/, "Língua Portuguesa"], [/matem/, "Matemática"], [/ciencia/, "Ciências"], [/histori/, "História"], [/geograf/, "Geografia"], [/fisica/, "Educação Física"], [/religi/, "Ensino Religioso"], [/arte/, "Arte"]];
    const c = ef.find(([r]) => r.test(d));
    return c ? [c[1]] : null;
  }
  if (/portugu/.test(d)) return ["Língua Portuguesa", "Linguagens e suas Tecnologias"];
  if (/matem/.test(d)) return ["Matemática"];
  if (/fisica$|^fisica|quimica|biologia|ciencias/.test(d) && !/educacao fisica/.test(d)) return ["Ciências da Natureza e suas Tecnologias"];
  if (/historia|geografia|filosofia|sociologia/.test(d)) return ["Ciências Humanas e Sociais Aplicadas"];
  if (/arte|educacao fisica|ingl|espanhol/.test(d)) return ["Linguagens e suas Tecnologias"];
  return null;
}

// Série digitada na turma ("8º ano", "8º ano A", "2ª série", "1º ano EM") → ano do catálogo e etapa.
function anoDe(serie: string): { ano: string | null; medio: boolean } {
  const s = semAcento(serie || "");
  const medio = /\bem\b|medio|serie/.test(s);
  const n = s.match(/(\d+)/)?.[1];
  if (medio) return { ano: null, medio };
  return { ano: n && Number(n) >= 1 && Number(n) <= 9 ? `${Number(n)}º ano` : null, medio };
}

// Busca por código, palavra do descritor ou objeto de conhecimento, filtrando pela turma quando dá.
export function buscarHabilidades({ texto = "", serie = "", disciplina = "", limite = 40 }: { texto?: string; serie?: string; disciplina?: string; limite?: number }) {
  const { ano, medio } = anoDe(serie);
  const comps = componentesDe(disciplina, medio);
  const termos = semAcento(texto).split(/\s+/).filter((t) => t.length > 1);
  const exato = habilidadePorCodigo(texto);
  const lista = TODAS.filter((h) => {
    if (serie && medio !== h.codigo.startsWith("EM")) return false;
    if (ano && !h.anos.includes(ano)) return false;
    if (comps && !comps.includes(h.componente)) return false;
    if (!termos.length) return true;
    const alvo = semAcento(`${h.codigo} ${h.descricao} ${h.objeto}`);
    return termos.every((t) => alvo.includes(t));
  });
  // o código digitado por inteiro vem primeiro, mesmo de outra série ou disciplina
  const res = exato ? [exato, ...lista.filter((h) => h !== exato)] : lista;
  return { total: res.length, habilidades: res.slice(0, limite) };
}

// Confere a sugestão da IA: tira os códigos EF/EM que não existem e põe a descrição oficial nos que existem.
export function conferirHabilidades(lista: unknown): { habilidades: { codigo: string; descricao: string; oficial?: boolean }[]; retiradas: string[] } {
  const habilidades: { codigo: string; descricao: string; oficial?: boolean }[] = [], retiradas: string[] = [];
  for (const h of Array.isArray(lista) ? lista : []) {
    // maiúsculas só na parte da BNCC: o final do currículo de MS (".s.01") fica como veio
    const codigo = String((h as { codigo?: unknown })?.codigo || "").trim().replace(/^[a-z]{2}\d{2}[a-z]{2,4}\d{2,3}|^[a-z]+/i, (m) => m.toUpperCase());
    const descricao = String((h as { descricao?: unknown })?.descricao || "");
    if (codigoConferivel(codigo)) {
      // códigos do currículo de MS têm um final a mais (EF06MA07.s.01): confere a parte da BNCC
      const base = codigo.match(/^E[FM]\d{2}[A-Z]{2,4}\d{2,3}/)?.[0] || codigo, o = habilidadePorCodigo(base);
      if (!o) { retiradas.push(codigo); continue; }
      // só aceita o final no formato do currículo de MS; qualquer outro final some e fica o código oficial
      const final = codigo.slice(base.length);
      const cod = /^\.[a-z]\.\d{1,3}$/i.test(final) ? codigo : o.codigo;
      if (!habilidades.some((x) => x.codigo === cod)) habilidades.push({ codigo: cod, descricao: o.descricao, oficial: true });
    } else habilidades.push({ codigo, descricao });
  }
  return { habilidades, retiradas };
}
