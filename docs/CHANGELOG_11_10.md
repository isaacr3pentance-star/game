# CHANGELOG 11/10 — OPERAÇÃO GAME PORTAL

Data: 2026-11-27 · Branch: `feat/rewind-expansion-3`

## Correções (auditadas — ver AUDIT_11_10.md)

- **AUD-01 (crítica):** jack morto conectável no painel — clique arma,
  segundo clique conecta (`deadJackClick` → `connectTicketToDead`), com
  guarda de leitura e re-renderização da bandeja.
- **AUD-02:** `Dialogs.close()` externo (rebobinada) agora limpa timer,
  fila, callback e índice — a cadeia é reinstaurada do checkpoint, sem
  fantasma de digitação nem fila duplicada.
- **AUD-03:** ficha de ponto (`t54`, branca, sem número/origem/destino)
  na bandeja do turno 5 + **codinome opcional ficcional** (máx. 18
  caracteres, nunca nome real, sanitizado no estado) + conexão física
  da ficha de ponto ao B6 roteando para a rota de Ivone
  (`Night.onIvoneConnected`).
- **AUD-04:** `onDialogClosedEarly()` conectada ao `close()` — o
  contador de atenção de Vela volta a funcionar.
- **AUD-05 (alta):** validação de conexão confere **os dois extremos**
  (`entrada` + `to`) com regras de manual específicas; todas as fichas
  documentam a correspondência estabelecimento↔entrada física (§6.3).
- **AUD-06:** rota física de B6 para o final IVONE.
- **AUD-07:** `:focus-visible` nos dois jogos + `aria-*` no HTML do
  REWIND (X falso incluso), `role`/`aria-live` em diálogo e legenda.

## Arte vetorial (§7.4/§12)

- Os 3 arquivos de assets embutidos foram regenerados como **arte SVG
  projetada** (2 capas do portal, retrato com "V. & M." e a lanterna
  que não ilumina, 2 splashes): 18,4KB no total, ~73% menores que os
  data URIs JPEG anteriores, nítidos em qualquer resolução, zero
  hotlink. A arte JPEG/PNG original permanece em `assets/` e nos ZIPs
  de distribuição.

## Qualidade (§16/§18)

- **tests/verify_repo.sh** — rotina de qualidade reutilizável:
  sintaxe de todos os JS, suítes de lógica, arquivos essenciais,
  referências de caminho, XML dos assets embutidos, isolamento de
  armazenamento, placeholders. 7/7 verde.
- **tests/smoke_browser.js** — smoke test Playwright nos 3 componentes
  (erros de console/page + elementos essenciais). 3/3 verde.
- **.github/workflows/ci.yml** — rotina automatizada com os dois jobs
  acima em cada push/PR.
- Suíte LINHA MORTA: 17 → **26 testes** (9 regressões da auditoria);
  REWIND mantém 35/35.

## Documentação (§19)

- Novos: `docs/AUDIT_11_10.md`, `docs/REVIEW_CYCLES_11_10.md`,
  `docs/QUALITY_REPORT.md`, `docs/TEST_RESULTS.md`,
  `docs/ROADMAP_11_10.md`, este changelog.
- Atualizados: README raiz, `docs/DEVELOPMENT_LOG.md`,
  `docs/DEPLOYMENT.md`.

## Publicação

- Branch `feat/rewind-expansion-3` recebe os commits agrupados por
  funcionalidade (conector GitHub operante nesta sessão — ver
  DEVELOPMENT_LOG). PR de revisão aberto **sem merge**.
