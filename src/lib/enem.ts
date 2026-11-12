import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const ANOS_ENEM = Array.from({ length: 15 }, (_, i) => 2023 - i); // 2023 a 2009
export const AREAS: Record<string, string> = {
  linguagens: "Linguagens, Códigos e suas Tecnologias",
  "ciencias-humanas": "Ciências Humanas e suas Tecnologias",
  "ciencias-natureza": "Ciências da Natureza e suas Tecnologias",
  matematica: "Matemática e suas Tecnologias",
};

export type QuestaoEnem = { i: number; area: string; lingua: string | null; texto: string; intro: string; imagens: string[]; alts: { l: string; t: string; img: string | null }[]; certa: string };

type QApi = { index: number; discipline: string; language: string | null; context: string | null; files: string[]; correctAlternative: string; alternativesIntroduction: string | null; alternatives: { letter: string; text: string | null; file: string | null }[] };

const BASE = process.env.ENEM_API_URL || "https://api.enem.dev/v1";
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const carregando = new Map<number, Promise<QuestaoEnem[]>>();

async function baixarAno(ano: number): Promise<QuestaoEnem[]> {
  const vistos = new Map<string, QuestaoEnem>();
  for (const lingua of ["ingles", "espanhol"]) {
    for (let offset = 0; offset <= 180; offset += 50) {
      let r: Response | null = null;
      for (let t = 0; t < 4; t++) {
        r = await fetch(`${BASE}/exams/${ano}/questions?limit=50&offset=${offset}&language=${lingua}`, { headers: { Accept: "application/json" } }).catch(() => null);
        if (r && r.status === 429) { await espera(Number(r.headers.get("retry-after")) || 2000); continue; }
        break;
      }
      if (!r || !r.ok) throw new Error(`enem.dev respondeu ${r?.status ?? "sem conexão"}`);
      const j = (await r.json()) as { questions: QApi[]; metadata: { hasMore: boolean } };
      for (const q of j.questions) {
        const chave = q.index + "-" + (q.language || "");
        // imagens dentro do texto viram lista à parte; o texto fica limpo
        const imgsTexto: string[] = [];
        const limpar = (t: string) => t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/(^|\s)\*(\S.*?\S|\S)\*(?=\s|$|[.,;:!?])/g, "$1$2");
        const texto = limpar((q.context || "").replace(/!\[[^\]]*\]\(([^)]+)\)/g, (_, u) => { imgsTexto.push(u); return ""; }).replace(/\n{3,}/g, "\n\n").trim());
        vistos.set(chave, {
          i: q.index, area: q.discipline, lingua: q.language, texto, intro: limpar(q.alternativesIntroduction || ""),
          imagens: [...new Set([...imgsTexto, ...(q.files || [])])],
          alts: (q.alternatives || []).map((a) => ({ l: a.letter, t: limpar(a.text || ""), img: a.file })), certa: q.correctAlternative,
        });
      }
      await espera(1100); // a API pede no máximo 1 pedido por segundo
      if (!j.metadata?.hasMore || lingua === "espanhol") break; // as questões de espanhol são só as primeiras
    }
  }
  return [...vistos.values()].sort((a, b) => a.i - b.i || (a.lingua || "").localeCompare(b.lingua || ""));
}

export async function questoesDoAno(ano: number): Promise<QuestaoEnem[]> {
  const salvo = await prisma.enemProva.findUnique({ where: { ano } });
  if (salvo) return salvo.questoes as unknown as QuestaoEnem[];
  if (!carregando.has(ano)) {
    carregando.set(ano, baixarAno(ano).then(async (qs) => {
      if (qs.length) await prisma.enemProva.upsert({ where: { ano }, create: { ano, questoes: qs as unknown as Prisma.InputJsonValue }, update: { questoes: qs as unknown as Prisma.InputJsonValue } });
      return qs;
    }).finally(() => carregando.delete(ano)));
  }
  return carregando.get(ano)!;
}
