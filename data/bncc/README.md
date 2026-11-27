# Catálogo BNCC 2018

`2018.json` tem os códigos, descritores e anos/séries das 1.487 habilidades oficiais da BNCC: 1.304 do Ensino Fundamental e 183 do Ensino Médio. A Educação Infantil não está no catálogo.

Os dados vêm das planilhas oficiais do MEC, conferidas no PDF homologado (hashes das fontes no próprio JSON). O arquivo foi gerado a partir do catálogo do projeto Professor Nota Mil (`data/bncc/2018.json` e `scripts/extract-bncc.py` de lá), com os campos encurtados: `c` código, `k` componente, `a` anos/séries, `d` descritor, `o` objeto de conhecimento.

- [MEC · planilhas oficiais da BNCC](https://downloadbncc.mec.gov.br/)
- [MEC · Base Nacional Comum Curricular](https://basenacionalcomum.mec.gov.br/a-base)

Uso no sistema: `src/lib/bncc.ts` (busca e conferência), `GET /api/bncc` (busca sem IA) e a conferência das habilidades sugeridas pela IA em `src/app/api/ia/route.ts`.
