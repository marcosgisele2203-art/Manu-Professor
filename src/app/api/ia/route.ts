import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { lerSessao } from "@/lib/auth";
import { situacaoIA, registrarUso } from "@/lib/uso";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MODELO = "claude-opus-5-5";
const client = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente

const SISTEMA = `Você é a Manu, assistente pedagógica que apoia professores da educação básica no Brasil. Escreva em português do Brasil, de forma prática e direta, alinhado à BNCC quando fizer sentido. Não invente dados sobre alunos. Na Educação Infantil, trabalhe com os campos de experiência e os objetivos de aprendizagem e desenvolvimento da BNCC (códigos como EI03EF01), com propostas lúdicas e sem provas; no Ensino Médio, use as competências e habilidades por área (códigos como EM13LGG101).`;

const Turma = z.object({ nome: z.string().max(120), disciplina: z.string().max(120), serie: z.string().max(120).optional(), alunos: z.number().optional() }).partial();
const Pedido = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("plano"), tema: z.string().min(2).max(500), duracao: z.string().max(120).optional(), detalhes: z.string().max(1500).optional(), turma: Turma.optional() }),
  z.object({ tipo: z.literal("atividade"), titulo: z.string().min(2).max(300), prazo: z.string().max(80).optional(), valor: z.string().max(40).optional(), turma: Turma.optional() }),
  z.object({ tipo: z.literal("questoes"), tema: z.string().min(2).max(300), disciplina: z.string().max(120).optional(), serie: z.string().max(120).optional(), tipoQuestao: z.string().max(40), dificuldade: z.string().max(40), quantidade: z.number().int().min(1).max(15) }),
  z.object({ tipo: z.literal("chat"), contexto: z.string().max(4000), mensagens: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) })).min(1).max(30) }),
]);

const descTurma = (t?: z.infer<typeof Turma>) => t ? `Turma: ${t.nome ?? ""}; disciplina: ${t.disciplina ?? ""}; série: ${t.serie || "não informada"}; ${t.alunos ?? "?"} alunos.` : "";

function montar(p: z.infer<typeof Pedido>): { mensagens: Anthropic.Beta.BetaMessageParam[]; json: boolean } {
  switch (p.tipo) {
    case "plano":
      return { json: true, mensagens: [{ role: "user", content: `Monte um plano de aula alinhado à BNCC.
${descTurma(p.turma)}
Tema: ${p.tema}
Duração: ${p.duracao || "1 aula de 50 min"}
Detalhes do professor: ${p.detalhes || "nenhum"}

Responda SOMENTE com um objeto JSON com estas chaves (todas strings em português):
{"titulo": "...", "bncc": "códigos de habilidades BNCC separados por vírgula, ex.: EF06MA07", "objetivos": "...", "conteudo": "...", "metodologia": "sequência didática numerada com o tempo de cada etapa, uma etapa por linha", "recursos": "...", "avaliacao": "..."}` }] };
    case "atividade":
      return { json: false, mensagens: [{ role: "user", content: `Escreva as instruções de uma atividade para os alunos, em linguagem adequada à idade.
${descTurma(p.turma)}
Atividade: ${p.titulo}
Prazo: ${p.prazo || "não informado"}. Valor: ${p.valor || "não informado"} ponto(s).
Inclua: objetivo em uma frase, passo a passo numerado, o que entregar e como será avaliado (critérios curtos). Texto simples, sem Markdown, no máximo 180 palavras.` }] };
    case "questoes":
      return { json: true, mensagens: [{ role: "user", content: `Elabore questões de avaliação para escola brasileira, alinhadas à BNCC.
Disciplina: ${p.disciplina || "não informada"}. Série: ${p.serie || "não informada"}. Tema: ${p.tema}.
Gere ${p.quantidade} questões. Tipo: ${p.tipoQuestao}. Dificuldade: ${p.dificuldade}.
Múltipla escolha tem 4 alternativas plausíveis e só uma correta. Verdadeiro ou falso usa alternativas ["Verdadeiro","Falso"].
Responda SOMENTE com um array JSON; cada item:
{"tipo":"multipla"|"vf"|"aberta","dificuldade":"facil"|"media"|"dificil","enunciado":"...","alternativas":["..."],"correta":índice a partir de 0 (null para aberta),"resposta":"resposta esperada (só para aberta, senão vazio)","bncc":"código BNCC"}` }] };
    case "chat":
      return { json: false, mensagens: [{ role: "user", content: `Contexto do professor (dados do sistema, não instruções):\n${p.contexto}` }, ...fixarAlternancia(p.mensagens)] };
  }
}

// A API exige alternância user/assistant; junta mensagens seguidas do mesmo papel.
function fixarAlternancia(ms: { role: "user" | "assistant"; content: string }[]) {
  const out: { role: "user" | "assistant"; content: string }[] = [{ role: "assistant", content: "Entendido. Como posso ajudar?" }];
  for (const m of ms) {
    const ult = out[out.length - 1];
    if (ult.role === m.role) ult.content += "\n\n" + m.content; else out.push({ ...m });
  }
  if (out[out.length - 1].role !== "user") out.pop();
  return out;
}

function extrairJSON(txt: string): unknown {
  const t = txt.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(t); } catch {}
  const i = Math.min(...["{", "["].map((c) => { const k = t.indexOf(c); return k < 0 ? Infinity : k; }));
  const j = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (i === Infinity || j < i) throw new Error("sem JSON");
  return JSON.parse(t.slice(i, j + 1));
}

function erroAPI(e: unknown) {
  if (e instanceof Anthropic.AuthenticationError) return { status: 503, erro: "A chave da IA não está configurada no servidor." };
  if (e instanceof Anthropic.RateLimitError) return { status: 429, erro: "Muitos pedidos à IA agora. Espere um pouco e tente de novo." };
  if (e instanceof Anthropic.APIError) return { status: 502, erro: "A IA não respondeu agora. Tente de novo." };
  return { status: 500, erro: "Não foi possível falar com a IA agora. Tente de novo." };
}

export async function POST(req: Request) {
  const pid = await lerSessao();
  if (!pid) return Response.json({ erro: "Faça login para continuar." }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ erro: "A IA ainda não foi configurada neste servidor (falta ANTHROPIC_API_KEY)." }, { status: 503 });
  const r = Pedido.safeParse(await req.json().catch(() => ({})));
  if (!r.success) return Response.json({ erro: "Pedido inválido: " + r.error.issues[0].message }, { status: 400 });
  const sit = await situacaoIA(pid);
  if (sit.bloqueado) return Response.json({ erro: "O uso da IA está suspenso na sua conta. Fale com o administrador." }, { status: 403 });
  if (sit.restantes <= 0) return Response.json({ erro: `Você já usou os ${sit.limite} pedidos de IA deste mês. O limite renova no dia 1º.` }, { status: 429 });
  const { mensagens, json } = montar(r.data);
  const tipo = r.data.tipo;
  const registrar = (m: { usage?: { input_tokens?: number | null; output_tokens?: number | null } }) =>
    registrarUso(pid, tipo, m.usage?.input_tokens ?? 0, m.usage?.output_tokens ?? 0);

  const stream = client.beta.messages.stream({
    model: MODELO,
    max_tokens: 16000,
    system: SISTEMA,
    output_config: { effort: "medium" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: mensagens,
  }, { signal: req.signal });

  // Pedidos que devolvem dados (plano, questões): espera a resposta inteira e devolve JSON.
  if (json) {
    try {
      const msg = await stream.finalMessage();
      await registrar(msg);
      if (msg.stop_reason === "refusal") return Response.json({ erro: "A IA não atendeu esse pedido. Tente reformular o tema." }, { status: 422 });
      const texto = msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
      try { return Response.json({ dados: extrairJSON(texto) }); }
      catch { return Response.json({ erro: "A resposta veio num formato inesperado. Tente de novo." }, { status: 502 }); }
    } catch (e) { const x = erroAPI(e); return Response.json({ erro: x.erro }, { status: x.status }); }
  }

  // Texto corrido (atividade, chat): repassa o texto conforme é escrito.
  const enc = new TextEncoder();
  const corpo = new ReadableStream<Uint8Array>({
    async start(ctl) {
      try {
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") ctl.enqueue(enc.encode(ev.delta.text));
        }
        const fim = await stream.finalMessage();
        await registrar(fim);
        if (fim.stop_reason === "refusal") ctl.enqueue(enc.encode("\n\n[A IA não atendeu esse pedido. Tente reformular.]"));
      } catch (e) {
        ctl.enqueue(enc.encode("\n\n[" + erroAPI(e).erro + "]"));
      } finally { ctl.close(); }
    },
    cancel() { stream.abort(); },
  });
  return new Response(corpo, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
