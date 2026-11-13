#!/bin/sh
# Aplica as migrações do banco ao subir o sistema (substitui o antigo "prisma db push").
#
# Bancos criados antes das migrações (pelo "db push") já têm as tabelas, mas não o histórico.
# Nesse caso o Prisma recusa com o erro P3005. Antes de marcar a migração inicial como já
# aplicada (uma vez só), o banco é comparado com o schema daquela migração
# (prisma/base/schema-0_inicial.prisma): só segue se for igual. Qualquer diferença ou outro
# erro para o deploy: o sistema não sobe com o banco pela metade.
SCHEMA=prisma/schema.prisma
BASE=prisma/base/schema-0_inicial.prisma

if saida=$(prisma migrate deploy --schema "$SCHEMA" 2>&1); then
  echo "$saida"
  exit 0
fi
echo "$saida"

if echo "$saida" | grep -q "P3005"; then
  echo "[migrar] Banco criado antes das migrações: conferindo se ele é igual à migração inicial."
  diferenca=$(prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel "$BASE" --exit-code 2>&1)
  codigo=$?
  if [ "$codigo" -ne 0 ]; then
    echo "$diferenca"
    echo "[migrar] O banco NÃO é igual à migração inicial (diferença acima). Nada foi alterado."
    echo "[migrar] O sistema não foi iniciado. Faça um backup e acerte o banco antes de publicar de novo."
    exit 1
  fi
  echo "[migrar] Banco igual à migração inicial: registrando-a como já aplicada."
  prisma migrate resolve --applied 0_inicial --schema "$SCHEMA" || exit 1
  prisma migrate deploy --schema "$SCHEMA" || exit 1
  exit 0
fi

echo "[migrar] As migrações falharam. O sistema não foi iniciado."
exit 1
