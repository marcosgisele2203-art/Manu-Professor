-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT,
    "googleSub" TEXT,
    "googleRefresh" TEXT,
    "escola" TEXT,
    "escolas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disciplinas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "etapas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trocarSenha" BOOLEAN NOT NULL DEFAULT false,
    "foto" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aceitouTermosEm" TIMESTAMP(3),
    "limiteIA" INTEGER,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "sessaoVersao" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsoIA" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tokensEntrada" INTEGER NOT NULL DEFAULT 0,
    "tokensSaida" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsoIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registro" (
    "id" TEXT NOT NULL,
    "colecao" TEXT NOT NULL,
    "dados" JSONB NOT NULL,
    "professorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnemProva" (
    "ano" INTEGER NOT NULL,
    "questoes" JSONB NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnemProva_pkey" PRIMARY KEY ("ano")
);

-- CreateIndex
CREATE UNIQUE INDEX "Professor_email_key" ON "Professor"("email");

-- CreateIndex
CREATE INDEX "Professor_googleSub_idx" ON "Professor"("googleSub");

-- CreateIndex
CREATE INDEX "UsoIA_professorId_criadoEm_idx" ON "UsoIA"("professorId", "criadoEm");

-- CreateIndex
CREATE INDEX "UsoIA_criadoEm_idx" ON "UsoIA"("criadoEm");

-- CreateIndex
CREATE INDEX "Registro_professorId_colecao_idx" ON "Registro"("professorId", "colecao");

-- CreateIndex
CREATE UNIQUE INDEX "Registro_professorId_colecao_id_key" ON "Registro"("professorId", "colecao", "id");

-- AddForeignKey
ALTER TABLE "UsoIA" ADD CONSTRAINT "UsoIA_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

