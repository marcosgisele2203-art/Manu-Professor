import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { ANOS_ENEM, AREAS, questoesDoAno } from "@/lib/enem";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Busca no banco do Enem: ?ano=2022&area=matematica&busca=porcentagem&pagina=0
export async function GET(req: Request) {
  if (!(await lerSessao())) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  const u = new URL(req.url);
  const ano = Number(u.searchParams.get("ano"));
  if (!ANOS_ENEM.includes(ano)) return NextResponse.json({ erro: "Escolha um ano entre 2009 e 2023." }, { status: 400 });
  const area = u.searchParams.get("area") || "";
  const busca = semAcento((u.searchParams.get("busca") || "").trim());
  const pagina = Math.max(0, Number(u.searchParams.get("pagina")) || 0);
  let qs;
  try { qs = await questoesDoAno(ano); }
  catch { return NextResponse.json({ erro: "Não foi possível buscar as questões do Enem agora. Tente de novo em alguns minutos." }, { status: 502 }); }
  const filtradas = qs.filter((q) => (!area || q.area === area) && (!busca || semAcento(`${q.texto} ${q.intro} ${q.alts.map((a) => a.t).join(" ")}`).includes(busca)));
  const porPagina = 10;
  return NextResponse.json({ ano, total: filtradas.length, pagina, porPagina, areas: AREAS, questoes: filtradas.slice(pagina * porPagina, (pagina + 1) * porPagina) }, { headers: { "Cache-Control": "private, max-age=300" } });
}
