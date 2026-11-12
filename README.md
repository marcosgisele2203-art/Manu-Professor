# Manu Professor

A Manu para professores: turmas e alunos, chamada, notas com média ponderada, planejamento de aulas alinhado à BNCC, atividades com controle de entregas, banco de questões, montagem de provas com gabarito e a Manu como assistente pedagógica. A IA (Claude, da Anthropic) gera planos de aula, instruções de atividades e questões.

Também tem horário semanal por escola e turno, várias escolas por professor, bimestres, materiais para imprimir, slides, correção por foto, Banco do Enem, Google Drive (pastas das turmas) e backup automático.

Cada professor cria a própria conta (e-mail e senha, ou "Continuar com Google") e só vê os próprios dados.

## Tecnologia

- Next.js 15 (telas + API) em TypeScript
- Postgres com Prisma
- Login com cookie assinado (JWT)
- IA no servidor com o SDK oficial da Anthropic

## Deploy no EasyPanel

1. **Crie um projeto** no EasyPanel (ex.: `manu-professor`).
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

As outras variáveis (administradores, limite de IA, Google) estão explicadas no `.env.example`.

## Backup

Todo dia às 3h (Brasília), e 10 minutos depois de cada implantação, o sistema salva uma cópia de todos os dados na pasta **Manu Professor · Backups** do Google Drive de um administrador (e-mail em `ADMIN_EMAILS` que tenha conectado o Drive). Ficam os 30 mais recentes. Em `/admin` dá para baixar um backup, fazer um na hora e restaurar (restaurar não apaga nada). Cada professor baixa os próprios dados em **Meu perfil → Baixar meus dados**.

## Rodar no computador

```bash
cp .env.example .env   # preencha DATABASE_URL e AUTH_SECRET
npm install
npx prisma db push
npm run dev
```

## Organização do código

- `src/app/api/auth/*` cadastro, login (com senha ou Google) e sair
- `src/app/api/dados/[col]` leitura e gravação dos registros do professor (turmas, planos, chamadas, avaliações, atividades, questões, provas, materiais, slides)
- `src/app/api/eu` perfil do professor (escolas, etapas, disciplinas) e exportação dos dados
- `src/app/api/ia` chamadas à IA (planos, atividades, questões, materiais, slides, correção por foto, bimestre, assistente)
- `src/app/api/enem` questões do Enem (API pública enem.dev)
- `src/app/api/google/*` permissão do Google Drive
- `src/app/admin` e `src/app/api/admin/*` painel do administrador, backup e restauração
- `src/lib/backup.ts` backup diário (agendado em `src/instrumentation.ts`)
- `public/app.js` e `public/app.css` a interface principal (cores e fonte do design system da Manu)
- `public/manu/` as artes da Manu
- `prisma/schema.prisma` o banco
