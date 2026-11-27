# TEST RESULTS — OPERAÇÃO GAME PORTAL 11/10

Data: 2026-11-27 · Branch: `feat/rewind-expansion-3` · Ambiente: Node 24
(POSIX) + Chromium/Playwright + agent-browser (verificação interativa).

## Totais

| Suíte | Total | Aprovados | Falhos | Ignorados |
|---|---|---|---|---|
| REWIND — lógica (Node) | 35 | 35 | 0 | 0 |
| LINHA MORTA — lógica (Node) | 26 | 26 | 0 | 0 |
| verify_repo.sh (integração) | 7 seções | 7 | 0 | 0 |
| smoke_browser.js (navegador) | 3 páginas | 3 | 0 | 0 |
| **Total desta sessão** | **71** | **71** | **0** | **0** |

Linha de base anterior da sessão de desenvolvimento: 35 + 17 (as 17 da
LINHA MORTA seguem incluídas nas 26 atuais, 9 novas de regressão).

## Suíte REWIND (35) — cobertura declarada

Estado e validação de save; perdas determinísticas (sequência das nove);
dessaturação 6%/rebobinada com piso 35%; puzzles copo/porta/rádio/
retrato/calendário/fósforos/engrenagens/reflexos (soluções canônicas:
[0,2,4], dial 92.7, 5 fragmentos, 9 dias, 3 clarões + 1 longo,
[12,24]/[18,36], regra 2a−90°); finais A/B com variações por faixa
(7–9/10–14/15+) e segredos (rádio capturado, legado completo);
rebobinadas próprias vs de Vela; proteções anti-softlock; checkpoint
narrativo; proteção de `legacy.save`.

## Suíte LINHA MORTA (26) — cobertura declarada

Precedência (azuis→vermelhas, crescente); pares proibidos A7–B8/A8–B7;
ficha 13 (não responde antes das 03:00, por último); **regressões 11/10:
validação dos dois extremos (entrada/destino), ficha 13 com qualquer
entrada e B6 fixo, ficha de ponto pessoal/sem destino, pares físicos
livres exceto proibidos, ordem t51→t54, jackIndex, sanitização do
codinome**; chips azul/azul/vermelha/azul; registrador; apito de teste;
computação dos 4 finais (REGRA/LINHA/IVONE/ESCUITA) com condições;
conteúdo das 5 noites; vocabulário crescente; epílogos.

## Browser (interativo — agent-browser)

- Portal: carregado sem erros de console; 2 cards + capas renderizando
  (verificadas por análise de pixels: conteúdo, variância e paleta).
- REWIND: carregado sem erros; 14 hotspots; caixa de diálogo presente;
  título correto.
- LINHA MORTA: carregado sem erros; 3 fichas da noite 1 com entrada
  impressa ("Farmácia Sao Jorge → B2 · entrada A1"); painel SVG.
- **E2E do jack morto (AUD-01):** armar → conectar → `connections:
  [{ticketId:'t11',a:-1,b:-1}]`, ficha concluída, resposta da Linha
  ("OUÇA."), guarda de leitura respeitada durante diálogo aberto.

## Playwright (smoke) — 3/3

Sem `console.error` e sem `pageerror` nas 3 páginas; seletores
essenciais presentes (`#fake-x`, `#dialog-box`, `#stage`, `#board`,
`.ticket`×3, `svg`).

## Não executados nesta sessão

- Bateria completa de navegador por final (turno 5 até REGRA/LINHA/
  IVONE/ESCUITA) — cobertos por lógica + revisão; executar na revisão
  do PR. Evidência de navegador da sessão anterior (pré-11/10) cobre
  IVONE end-to-end e Final A/B do REWIND.
- Media físicas móveis (CSS @media verificado estaticamente).
- CI no GitHub Actions (workflow criado; executará no push do PR).
