# Módulo Natureza — como gerar o banco de plantas e animais

1. `pip install requests`
2. `python enriquecer.py` (na pasta `natureza/`). Gera `natureza.json` de forma incremental — pode interromper e retomar.
3. Abra o app por um servidor local: na pasta do protótipo, `python -m http.server` e acesse `http://localhost:8000/mente_ativa_prototipo.html`.
4. Revise `pendencias.txt`: itens sem texto, com menos de 5 fotos livres, ou cujo nome científico o GBIF marcou como sinônimo/duvidoso. Para plantas, confira na Flora e Funga do Brasil (floradobrasil.jbrj.gov.br).

## Fontes e licenças (obrigatório manter a atribuição no app)
- Texto: Wikipédia em português — CC BY-SA 4.0.
- Fotos: Wikimedia Commons — o script só aceita CC BY, CC BY-SA, CC0 e domínio público; guarda autor, licença e link de cada foto.
- Validação de nomes: GBIF Backbone Taxonomy (api.gbif.org).
- `sementes.csv`: 595 itens (367 plantas/árvores, 80 aves, 59 raças de cães, 28 de gatos, 33 de gado/ruminantes, 28 de cavalos/asininos). Nomes populares e locais de ocorrência foram curados manualmente e precisam de conferência botânica/zootécnica antes da publicação.
