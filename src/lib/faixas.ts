// Faixa etária da turma, tirada da série/etapa que o professor digitou (texto livre: "4º ano EF", "Pré II (EI)", "2ª série EM", "EJA EF"...)
// Serve para o "jeito Manu de ensinar" falar a língua de cada idade.

export type Faixa = "ei" | "ef1" | "ef2" | "em" | "eja";

// Letras com acento contam como letra, para "pré" não casar dentro de "preço"
const solto = (re: string) => new RegExp(`(^|[^a-zà-ú])(${re})([^a-zà-ú]|$)`, "i");

export function faixaDaSerie(...textos: (string | undefined)[]): Faixa | null {
  for (const bruto of textos) {
    const s = String(bruto || "").trim();
    if (!s) continue;
    if (solto("eja|supletivo").test(s) || /jovens e adultos/i.test(s)) return "eja";
    // Cursinho pré-vestibular/pré-Enem é público de Ensino Médio, não pré-escola
    if (/vestibular|pr[ée][\s-]*enem/i.test(s)) return "em";
    // "1º período", "2º período" são nomes comuns de turmas da pré-escola
    if (/\(EI\)|infantil|creche|ber[çc][áa]rio|maternal|jardim|\d\s*[ºª°o]?\s*per[íi]odo/i.test(s) || solto("pr[ée](-?escola)?").test(s)) return "ei";
    // A sigla EM só em maiúsculas e sem outra palavra logo depois, para não confundir com a preposição
    // ("4º ano em tempo integral", "4º ANO EM TEMPO INTEGRAL"); vale em "2ª série EM", "EM - 1º ano", "1º ano (EM)"
    if (/m[ée]dio/i.test(s) || /(^|[^A-Za-zÀ-ú])EM(?=\s*$|\s*[-–—()[\],/·|:;]|\s+\d)/.test(s)) return "em";
    // "Fundamental I/II", "EF I/II", "Fund. 1/2"
    const romano = s.match(/(?:fundamental|fund\.?|(?:^|[^a-zà-ú])EF)\s*(II|I|2|1)(?![a-zà-ú\dº°ª])/i);
    if (romano) return /^(II|2)$/i.test(romano[1]) ? "ef2" : "ef1";
    // "série" sem "fundamental" é o nome atual do Ensino Médio (1ª a 3ª série)
    const serieAntiga = s.match(/([1-8])\s*[ªa°]?\s*s[ée]rie/i);
    if (serieAntiga) {
      if (!/fundamental|\bEF\b/i.test(s)) return Number(serieAntiga[1]) <= 3 ? "em" : null;
      return Number(serieAntiga[1]) + 1 <= 5 ? "ef1" : "ef2"; // nomenclatura antiga do fundamental: 4ª série = 5º ano
    }
    if (/anos? iniciais/i.test(s)) return "ef1";
    if (/anos? finais/i.test(s)) return "ef2";
    const ano = s.match(/(?:^|[^\d])([1-9])\s*(?:[ºª°o]|\s*ano)/i);
    if (ano) return Number(ano[1]) <= 5 ? "ef1" : "ef2";
  }
  return null;
}

const NOME: Record<Faixa, string> = {
  ei: "Educação Infantil (0 a 5 anos)",
  ef1: "Ensino Fundamental, anos iniciais (1º ao 5º ano, 6 a 10 anos)",
  ef2: "Ensino Fundamental, anos finais (6º ao 9º ano, 11 a 14 anos)",
  em: "Ensino Médio (15 a 17 anos)",
  eja: "EJA, Educação de Jovens e Adultos",
};

// Regras para conteúdo de aula (plano e slides)
const AULA: Record<Faixa, string> = {
  ei: `- Não há prova nem texto para a criança ler. Tudo acontece por brincadeira, música, história contada, movimento e exploração com os sentidos (tocar, cheirar, ouvir, provar, olhar).
- O que for dito às crianças vai em frases curtíssimas (até 8 palavras), com repetição e gestos.
- O gancho é um objeto, um personagem (fantoche, bicho, boneco) ou uma surpresa (caixa misteriosa, som escondido).
- A explicação é uma história curta contada pelo professor ou uma conversa em roda, não um conceito formal. A curiosidade é para o professor encantar as crianças, dita de um jeito simples.
- A missão é uma brincadeira (procurar, imitar, construir, cantar), nunca uma tarefa escrita.
- Use os campos de experiência e os objetivos de aprendizagem e desenvolvimento da BNCC, com códigos EI (EI01 bebês, EI02 crianças bem pequenas, EI03 crianças pequenas; ex.: EI03ET04), nunca códigos EF. Avaliação por observação e registro (fotos, falas, desenhos), nunca prova.`,
  ef1: `- Concreto e visual: objetos, desenhos, material para manipular, personagens e histórias.
- Jogos e desafios em dupla ou em grupo.
- Frases curtas, vocabulário simples, uma ideia por vez. Explique palavras novas com um exemplo.
- A missão é um jogo ou desafio que caiba na aula.`,
  ef2: `- Mistério, desafios e competição saudável (equipes, placar, recorde da turma).
- Use temas do mundo deles (games, esporte, música, redes sociais, séries) com respeito e sem forçar gírias.
- Dê mais autonomia: os alunos levantam hipóteses, argumentam e defendem ideias.
- Nunca infantilize: nada de mascote fofinho, diminutivos ou tom de criança pequena.`,
  em: `- Parta de problemas reais: dados, notícias e atualidades, escolhas da vida adulta e projeto de vida.
- Conecte com o Enem e o vestibular quando fizer sentido (tipo de questão, competência cobrada).
- Debates, análise de dados e de fontes, pensamento crítico e aprofundamento.
- Tom de conversa entre pessoas que pensam: respeite a inteligência deles, sem tom escolar infantil. Use as competências e habilidades da BNCC do Ensino Médio (códigos como EM13MAT101).`,
  eja: `- Respeite a experiência de vida: muitos trabalham, cuidam da casa e da família. Parta do que eles já sabem.
- Exemplos do trabalho, da casa, do dinheiro do mês, da saúde e da cidadania (direitos, documentos, contas, eleições).
- Tom de adulto para adulto, com clareza e acolhimento. Nunca infantilize: nada de personagens infantis, brincadeiras de criança nem diminutivos.
- Atividades práticas e úteis no dia a dia, que valorizem o tempo de quem estuda à noite.`,
};

// Regras para questões de avaliação
const QUESTOES: Record<Faixa, string> = {
  ei: `Na Educação Infantil não existe prova. Gere propostas para o professor fazer oralmente, em roda ou numa brincadeira, observando como as crianças respondem: no "enunciado", o que o professor diz ou mostra (frase curtíssima, até 8 palavras, pode citar um objeto ou figura); alternativas curtas como objetos ou figuras ("a bola", "o sapo"); "explicacao" e "erroComum" são para o professor (o que observar e o que as crianças costumam confundir). Use códigos EI no campo "bncc".`,
  ef1: `Enunciados curtos, uma ideia por vez, vocabulário simples. Use personagens e situações concretas (a turma, a casa, a feira, o recreio). Alternativas curtas. A "explicacao" fala direto com a criança, em frases curtas.`,
  ef2: `Situações do mundo deles (games, esporte, música, redes sociais) quando fizer sentido, com respeito e sem infantilizar. Peça raciocínio, não só memória. Alternativas erradas plausíveis.`,
  em: `Estilo Enem quando couber: uma situação-problema real ou um texto-base curto (dado, notícia, trecho), e o comando pedindo análise ou relação, não decoreba. Alternativas plausíveis. Tom adulto. Use habilidades do Ensino Médio (EM13...).`,
  eja: `Situações da vida adulta: trabalho, contas da casa, compras, saúde, documentos, direitos. Linguagem clara e respeitosa, de adulto para adulto. Nunca infantilize: nada de personagens infantis.`,
};

// A série digitada já aparece no prompt; aqui não é repetida, para texto do professor não virar instrução
const QUAL = (serie: string) => `A série/etapa ${serie ? "informada não deixa clara a idade" : "não foi informada"}. Escolha a faixa etária mais provável pelo tema e pelo componente, diga qual escolheu no começo do campo "conteudo" (plano) ou nas notas da capa (slides), e siga só as regras dessa faixa:`;

export function regrasFaixa(uso: "aula" | "questoes", serie: string | undefined, ...extras: (string | undefined)[]): string {
  const f = faixaDaSerie(serie, ...extras);
  const regras = uso === "aula" ? AULA : QUESTOES;
  if (f) return `Idade da turma: ${NOME[f]}. Adapte tudo a essa idade:\n${regras[f]}`;
  const qual = uso === "aula" ? QUAL(serie || "") : `A série não está clara${serie ? "" : " (não informada)"}. Escolha a faixa etária mais provável pelo tema e siga só as regras dela:`;
  return `${qual}\n${(Object.keys(NOME) as Faixa[]).map((k) => `* ${NOME[k]}:\n${regras[k]}`).join("\n")}`;
}
