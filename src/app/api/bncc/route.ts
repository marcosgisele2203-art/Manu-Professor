import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { buscarHabilidades } from "@/lib/bncc";

// Busca no catálogo oficial da BNCC, sem IA. Só para quem está logado.
export async function GET(req: Request) {
  if (!(await lerSessao())) return NextResponse.json({ erro: "Faça login para continuar." }, { status: 401 });
  const u = new URL(req.url).searchParams, campo = (k: string, max: number) => (u.get(k) || "").trim().slice(0, max);
  const r = buscarHabilidades({ texto: campo("q", 120), serie: campo("serie", 60), disciplina: campo("disciplina", 80), limite: 40 });
  return NextResponse.json({ total: r.total, habilidades: r.habilidades.map((h) => ({ codigo: h.codigo, descricao: h.descricao, componente: h.componente, anos: h.anos })) });
}
