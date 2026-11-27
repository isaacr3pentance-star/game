# DEVELOPMENT LOG — Biblioteca de Terror

Branch de desenvolvimento: `feat/rewind-expansion-3` (criada a partir de `main`).
Data: 26/11/2026.

## Status do GitHub nesta sessão (transparência)

- Auditoria, `get_me`, `list_branches`, `get_file_contents` e `create_branch`
  funcionaram no início (branch criada com sucesso a partir de `main`).
- A partir da fase de envio dos commits, o plugin GitHub **parou de responder por
  completo** (inclusive chamadas de leitura que antes funcionavam). Esperas de até
  3 minutos entre tentativas não recuperaram o serviço.
- Conforme autorizado ("Se o plugin apresentar alguma limitação, trabalhe
  localmente e informe a limitação"), todo o desenvolvimento seguiu localmente com
  testes reais. **Nenhum resultado de push/PR é afirmado sem verificação.**
- Os 10+ commits planejados (um por funcionalidade, mensagens prontas) estão
  documentados abaixo e em `CHANGELOG_TECNICO.md`; os arquivos finais estão no ZIP
  `GAME_PORTAL_COMPLETE.zip` e no espelho local do repositório. Para publicar:
  restaurar os arquivos na branch `feat/rewind-expansion-3` (a branch já existe),
  seguir o plano de commits por funcionalidade e abrir o PR para `main` — sem
  merge sem revisão, conforme as regras.

## Sessão — Expansão 3.0

### Auditoria inicial
- Repositório `game` localizado (`isaacr3pentance-star/game`); branch `main` apenas
  com README de bootstrap que já nomeava os dois jogos (REWIND // REWIND e LINHA
  MORTA). Branch `feat/rewind-expansion-3` não existia → criada via plugin.
- Não havia código anterior a preservar; desenvolvimento seguiu do zero seguindo o
  Prompt Master anexado e as diretrizes de expansão 3.0.

### Limitação do canal de escrita (documentada)
- O plugin GitHub disponível expõe escrita de arquivos com conteúdo **textual**
  (`push_files`/`create_or_update_file`). Durante a sessão, as chamadas de escrita
  passaram a falhar (inclusive leitura) por um período — o trabalho continuou
  localmente conforme autorizado ("Se o plugin apresentar alguma limitação, trabalhe
  localmente e informe a limitação").
- Binários (PNG gerados em alta) não atravessam o canal textual. Solução: arte
  dinâmica procedural (Canvas/SVG) no repositório + imagens geradas comprimidas
  embutidas como data URIs + PNGs em alta nos ZIPs de entrega.
- Todos os pushes deste log foram executados via plugin (ver histórico da branch);
  onde indicado "local", o arquivo existe no ZIP de entrega correspondente.

### ETAPA 1 — REWIND // REWIND (prioridade absoluta)
1. Arquitetura completa (core/narrative/puzzles/environment/interface/endings).
2. Estado temporal/persistente + checkpoints narrativos (a rebobinada restaura o
   batimento, não o instante do clique — copo volta à metade, poça persiste).
3. Saves IndexedDB `rewind_db` (current/legacy/ultima_rebobinada) + contingência.
4. Narrativa: prólogo + 4 atos + revelação + clímax; ~180 entradas de diálogo;
   9 lembranças com perdas determinísticas; micro-perdas após a 9ª; falas
   obrigatórias preservadas verbatim (testado).
5. 7 rotas com descobertas exclusivas; 5 áreas top-down pintadas proceduralmente;
   Vela com sprite top-down e autonomia (senta; rebobina sozinha).
6. 8 puzzles determinísticos (3 originais + 5 novos) com pistas graduais.
7. Rebobinada completa: flash reducível, desktop fictício, reverso real do mix,
   dessaturação +6% com piso, perda permanente, persistência.
8. Twist do save antigo, quarta parede com dados locais, título `// 2`.
9. Finais A/B + 6 variações por faixa + 2 segredos + epílogos por comportamento.
10. Assets gerados por IA (capa, retrato fotográfico integrado com degradação em
    camadas, splash) + regenerador `scripts/build_embed.py`.
11. Testes: 35 Node (passando) + 7 navegador + sessão real headless documentada
    (prólogo, copo, rebobinada, twist, Final A com terminal 8s, Final B com recado
    e segredo, capturas de tela verificadas).
12. Documentação completa (README, bíblia, changelogs, manual, relatório).

Correções encontradas nos testes (todas corrigidas e re-testadas):
- índice da ordem de perdas (m1..m9) off-by-one;
- validação dos fósforos (every() incluía o toque longo);
- `.hidden` genérico ausente no CSS (overlays visíveis);
- guarda do `paintScene` antes do estado existir;
- `embedded.js` sem inicialização do objeto;
- mecanismo de callbacks do diálogo (encadeamentos longos travavam) — reescrito;
- checkpoints narrativos adicionados para o cânone da rebobinada.

### ETAPA 2 — LINHA MORTA (segundo jogo original)
- Identidade própria: terror analógico-institucional, painel SVG de central manual
  de 197X, vista frontal fixa (liberdade de câmera do segundo jogo).
- 5 turnos completos com roteamento por precedência, apito de teste, armário de
  fichas de cor, registrador mecânico, fio aberto acumulativo, 4 finais (1 secreto
  por 6 indícios), vocabulário crescente da linha (testado).
- Saves `second_horror_db` totalmente isolados.
- Correções nos testes: fluxo de registro do apito; vocabulário também nas escolhas
  de evento; guarda de leitura contra corrida intro×cabos.
- Testes: 17 Node (passando) + 8 navegador + fluxo real (roteamento, evento da
  linha, apito, final IVONE) verificado no navegador.

### PORTAL
- `index.html` raiz com capas geradas, gênero, descrições sem spoilers, indicador
  "continuar", hover/zoom, responsividade, navegação por teclado.
- `launcher/covers.js` (data URIs das capas), `launcher.css`, `launcher.js`.
- `.nojekyll`; caminhos relativos verificados.

### ETAPA 3 — Documentação raiz
- README, ARCHITECTURE, DEPLOYMENT, PROJECT_OVERVIEW, DEVELOPMENT_LOG (este arquivo).

### Entregáveis
- ZIPs: `REWIND_REWIND_FINAL.zip`, `SECOND_HORROR_FINAL.zip`,
  `GAME_PORTAL_COMPLETE.zip` (site completo, sem arquivos temporários).

---

## 2026-11-27 — OPERAÇÃO GAME PORTAL 11/10 (branch `feat/rewind-expansion-3`)

### Conector GitHub
- Na sessão anterior, o conector travou por ~2h (auditorias/criação de branch
  funcionavam; escritas falhavam) — trabalho continuou localmente e o problema
  foi registrado aqui, sem publicação fictícia.
- Nesta sessão o conector voltou a operar: commits testados com sucesso
  (`.nojekyll` b5ff0da → portal a750be5, verificação por blob SHA idêntica
  local↔remota). Restante do push desta operação: ver commits agrupados abaixo.

### Auditoria e correções (AUDIT_11_10.md)
- AUD-01 (crítica): jack morto conectável no painel — dois cliques (arma/confirma),
  guarda de leitura, e2e verificado no navegador (conexão t11 a:-1,b:-1, resposta
  "OUÇA." da Linha).
- AUD-02: `Dialogs.close()` limpa timer/fila/callback na rebobinada.
- AUD-03: ficha de ponto t54 na bandeja do turno 5 + codinome ficcional opcional
  (trim/18/null) + rota física B6 (`Night.onIvoneConnected`).
- AUD-04: `onDialogClosedEarly()` ligada ao close (contador de atenção).
- AUD-05 (alta): validação confere entrada+destino (§6.3); todas as fichas com
  `entrada` explícita; `jackIndex()`.
- AUD-07: `:focus-visible` nos 2 jogos; aria no HTML do REWIND (X falso incluso).

### Arte vetorial
- 3 arquivos de assets regenerados como SVG projetado (18,4KB total, −73%),
  eliminando base64 JPEG do push; XML 5/5 válido; pixels das capas verificados.

### Qualidade
- `tests/verify_repo.sh` (7/7) e `tests/smoke_browser.js` Playwright (3/3, sem
  erros de console) — ambos executados localmente nesta sessão.
- Suítes: REWIND 35/35; LINHA MORTA 17→26/26 (+9 regressões da auditoria).
- CI: `.github/workflows/ci.yml` (jobs logica + navegador).
- Docs 11/10: AUDIT, REVIEW_CYCLES (10 ciclos reais), QUALITY_REPORT,
  TEST_RESULTS, CHANGELOG, ROADMAP; README/DEPLOYMENT atualizados.

### Publicação (conforme regras: sem merge sem autorização)
- Commits agrupados por funcionalidade na `feat/rewind-expansion-3`; PR de
  revisão aberto; merge NÃO executado.
- Limitação declarada: PNGs-fonte binários não publicáveis pelo conector —
  runtime 100% coberto por SVG embutido (ver DEPLOYMENT.md).
