# Caderno do Professor

Sistema para professores: turmas e alunos, chamada, notas com média ponderada, planejamento de aulas alinhado à BNCC, atividades com controle de entregas, banco de questões, montagem de provas com gabarito e um assistente pedagógico. A IA (Claude, da Anthropic) gera planos de aula, instruções de atividades e questões.

Cada professor cria a própria conta (e-mail e senha) e só vê os próprios dados.

## Tecnologia

- Next.js 15 (telas + API) em TypeScript
- Postgres com Prisma
- Login com cookie assinado (JWT)
- IA no servidor com o SDK oficial da Anthropic

## Deploy no EasyPanel

1. **Crie um projeto** no EasyPanel (ex.: `caderno`).
2. **Adicione um serviço Postgres** (+ Service → Postgres). Depois de criado, copie a *Internal Connection URL*.
3. **Adicione um serviço App** (+ Service → App):
   - Source: **GitHub**, escolha este repositório e o branch `main`.
   - Build: **Dockerfile** (o arquivo já está na raiz).
4. Na aba **Environment** do App, defina:
   ```
   DATABASE_URL=<Internal Connection URL do Postgres>
   AUTH_SECRET=<texto aleatório longo, gere com: openssl rand -hex 32>
   ANTHROPIC_API_KEY=<sua chave em console.anthropic.com>
   ```
5. Na aba **Domains**, aponte seu domínio para a **porta 3000** (o EasyPanel gera o HTTPS).
6. Clique em **Deploy**. Na primeira subida o app cria as tabelas sozinho (`prisma db push`).
7. Ative **Auto Deploy** para publicar a cada push no GitHub.

Verificação: `https://seu-dominio/api/saude` deve responder `{"ok":true}`.

Sem `ANTHROPIC_API_KEY` o sistema funciona normalmente, só os botões de IA avisam que ela não está configurada.

## Rodar no computador

```bash
cp .env.example .env   # preencha DATABASE_URL e AUTH_SECRET
npm install
npx prisma db push
npm run dev
```

## Organização do código

- `src/app/api/auth/*` cadastro, login e sair
- `src/app/api/dados/[col]` leitura e gravação dos registros do professor (turmas, planos, chamadas, avaliações, atividades, questões, provas)
- `src/app/api/ia` chamadas à IA (plano, atividade, questões, assistente)
- `public/app.js` e `public/app.css` a interface principal
- `prisma/schema.prisma` o banco
