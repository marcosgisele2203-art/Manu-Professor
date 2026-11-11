# ---- dependências ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- execução ----
FROM node:22-alpine AS run
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
# Prisma CLI completo (com dependências) só para criar/atualizar as tabelas ao subir
RUN npm install -g prisma@6.19.3 && npm cache clean --force
EXPOSE 3000
# Cria/atualiza as tabelas no Postgres e sobe o servidor
CMD ["sh", "-c", "prisma db push --skip-generate --schema prisma/schema.prisma && node server.js"]
