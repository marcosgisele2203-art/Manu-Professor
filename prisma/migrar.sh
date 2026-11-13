#!/bin/sh
# Aplica as migrações do banco ao subir o sistema (substitui o antigo "prisma db push").
#
# Bancos criados antes das migrações (pelo "db push") já têm as tabelas, mas não o histórico.
# Nesse caso o Prisma recusa com o erro P3005; aí a migração inicial é marcada como já aplicada,
# uma vez só, e as seguintes rodam normalmente. Qualquer outro erro para o deploy: o sistema
# não sobe com o banco pela metade.
SCHEMA=prisma/schema.prisma

if saida=$(prisma migrate deploy --schema "$SCHEMA" 2>&1); then
  echo "$saida"
  exit 0
fi
echo "$saida"

if echo "$saida" | grep -q "P3005"; then
  echo "[migrar] Banco criado antes das migrações: registrando a migração inicial como já aplicada."
  prisma migrate resolve --applied 0_inicial --schema "$SCHEMA" || exit 1
  prisma migrate deploy --schema "$SCHEMA" || exit 1
  exit 0
fi

echo "[migrar] As migrações falharam. O sistema não foi iniciado."
exit 1
