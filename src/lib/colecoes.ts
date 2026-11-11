export const COLECOES = ["turmas", "planos", "chamadas", "avaliacoes", "atividades", "questoes", "provas", "materiais", "slides"] as const;
export type Colecao = (typeof COLECOES)[number];
export const ehColecao = (c: string): c is Colecao => (COLECOES as readonly string[]).includes(c);
export const ID_OK = /^[A-Za-z0-9_-]{1,80}$/;
