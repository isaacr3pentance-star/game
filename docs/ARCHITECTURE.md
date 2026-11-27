# ARCHITECTURE — Biblioteca de Terror

## Visão

Site estático único (GitHub Pages): raiz = portal de seleção; cada jogo é uma
aplicação isolada em `games/<nome>/`. Sem backend, sem build, sem dependências
externas. JavaScript ES6+ em scripts ordenados via `<script>` (compatível com
`file://` e subdiretórios).

```text
index.html ──► launcher/launcher.js (+ covers.js, launcher.css)
   │
   ├──► games/rewind/index.html      (namespace RW)
   │      ├── src/core/       state · save · rewind · audio
   │      ├── src/narrative/  data · dialog · memories · routes
   │      ├── src/puzzles/    puzzles (+ PuzzleLogic puro)
   │      ├── src/environment painter · room
   │      ├── src/interface/  ui (cromo, X falso, dev mode)
   │      ├── src/endings/    endings (+ lógica pura)
   │      ├── src/embedded.js (data URIs gerados)
   │      └── tests/          logic-tests.js (Node) · runner.html
   │
   └──► games/second-horror/index.html   (namespace LM)
          ├── src/ state · save · logic · data · audio · terminal
          │        board · night · endings · ui · embedded.js
          └── tests/ logic-tests.js (Node) · runner.html
```

## Isolamento entre jogos

- Namespaces distintos (`RW` vs `LM`); nenhum script compartilhado.
- IndexedDB por jogo (`rewind_db`, `second_horror_db`), stores e chaves separadas.
- localStorage com prefixos `rewind_` / `second_horror_`.
- O portal só lê carimbos `portal_progress_*` escritos pelos jogos.

## Padrões internos (ambos os jogos)

- **Estado central validado** (`State.validate`) com defaults e sanitização.
- **Lógica pura separada da UI** — módulos sem DOM, testáveis em Node
  (`tests/logic-tests.js`) e no navegador (`tests/runner.html`).
- **Save em batidas** + autosave 20s; nunca `beforeunload`.
- **Áudio procedural** via Web Audio (sem arquivos); desbloqueio na 1ª interação.
- **Assets**: procedurais (Canvas/SVG) + imagens geradas embutidas como data URIs
  (regeneradas por `scripts/build_embed.py`).
- **Acessibilidade**: volumes separados, velocidade de texto, redução de
  flashes/tremores, legendas de som.

## REWIND — detalhes que importam

- `TEMPORAL_KEYS` + `checkpoint`: a rebobinada restaura o último batimento narrativo
  (ex.: copo volta à metade) e **nunca** desfaz perdas/puzzles/twist/finais.
- Perdas determinísticas m1→m9 pareadas a objetos ambientais; micro-perdas após m9.
- Rebobinada: flash → desktop fictício ~200ms → reverso real do mix (anel ~2,6s)
  → restauração → perda → dessaturação (+6%/rebobinada, piso 35%).
- Twist: ≥7 rebobinadas próprias + 3 puzzles centrais + corredor visitado →
  `legacy.save` revelado, título `// 2`, X pulsante.
- Finais: A/B por escolha no Ato IV; variação por faixa de rebobinadas (7–9/10–14/15+)
  + modificadores de comportamento; segredos por rádio capturado e legado completo;
  estado terminal persistente.

## LINHA MORTA — detalhes que importam

- Roteamento validado contra o manual (precedência cor × numeração, pares cruzados,
  ficha 13); recusas contam para o relatório do turno.
- Guarda de leitura: ações no painel são bloqueadas enquanto há texto pendente —
  evita corrida entre intro do turno e manipulação de cabos.
- Escutas (fio aberto) acumulam; 3+ com flag dispara a falha EM ESCUTA.
- Vocabulário da linha cresce por turno (testado); segredo IVONE exige os 6 indícios.

## Publicação

Caminhos 100% relativos; `.nojekyll` na raiz; nenhum módulo ES (evita problemas de
CORS em `file://`); imagens embutidas (nenhum binário faltando). Ver
`docs/DEPLOYMENT.md`.
