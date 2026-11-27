# REWIND // REWIND — RELATÓRIO DE CONCLUSÃO (Expansão 3.0)

Data: 26/11/2026 · Branch: `feat/rewind-expansion-3`

## O que foi desenvolvido

- **Arquitetura completa** (core/narrative/puzzles/environment/interface/endings),
  scripts ES6+ ordenados, namespace único, sem frameworks, pronta para GitHub Pages.
- **Estado global** com separação temporal/persistente e checkpoints narrativos:
  a rebobinada restaura a linha temporal do último batimento da história — nunca
  desfaz perdas, puzzles resolvidos, twist ou finais.
- **Sistema de save** IndexedDB (`rewind_db`): `current`, `legacy` (save antigo,
  determinístico, criado na 1ª execução e nunca sobrescrito), `ultima_rebobinada`
  (estado terminal). Contingência `localStorage` prefixada `rewind_`. Autosave 20s
  + gravação em batidas. Nada de `beforeunload`.
- **Rebobinada pelo X falso**: validação → flash reducível → desktop fictício ~200ms
  → retorno → restauração por checkpoint → perda permanente → retrato/cenário →
  dessaturação (+6%/rebobinada, piso 35%) → áudio reverso real (anel de ~2,6s do mix,
  canal invertido) → persistência. Origens `own` e `vela`.
- **Narrativa**: prólogo (nota cortada antes do 1º input) + 4 atos com introduções;
  9 lembranças com perdas determinísticas pareadas a objetos ambientais; micro-perdas
  após m9 (palavras apagadas nas falas); revelação intermediária (legacy) com falas
  obrigatórias verbatim; acusação do Ato III verbatim; Ato IV de escolha.
- **7 rotas** (vestígio, frequência, retrato, vigília, legado, silêncio, máquina) com
  engajamento, descoberta exclusiva, falas exclusivas e consequências (segredos de
  final dependem de rotas).
- **5 áreas top-down** (sala, escadaria/corredor, manutenção, luz, exterior impossível
  como vista narrativa) pintadas proceduralmente (Canvas) com chuva, poeira, halo
  flicker e feixe varrendo; Vela com sprite top-down (de pé/sentada) e respiração.
- **8 puzzles** (3 originais + 5 derivados): copo (estados + poça persistente), porta
  (travas gastas reveladas pela poça), rádio (dial, nota cortada 92.7, captura por
  janela temporal via rebobinada), retrato (5 camadas + verso com chave), calendário
  (9 temporais → gaveta), fósforos/luz (característica fl(3) por toque/segurar),
  engrenagens (dois pares em relação de dobro), reflexos (lei do espelho 2a−90°).
  Todos com pistas graduais, feedback, recuperação após erro e estado persistente.
- **Vela ampliada**: falas por objeto/ato/origem/ociosidade, maneirismos, humor seco,
  memórias condicionais, reconhecimento de padrões (examina tudo, repete sem
  propósito, fecha falas), rota do silêncio com cena secreta dela com a máquina.
- **Ociosidade**: 90s → senta (sem pedir nada); +90s → rebobina sozinha (origem
  `vela`, não conta na assinatura); timers suspensos com aba oculta e bloqueados em
  diálogos/transições críticas.
- **Quarta parede**: hora/dia local reais, contagens, comportamentos observados.
  Título da janela → `REWIND // REWIND // 2` após o twist; X pulsa no hover.
- **Finais**: A e B principais (linhas finais verbatim), 6 variações por faixa de
  rebobinadas próprias (A1–A3, B1–B3), 2 segredos por construção (rádio capturado →
  cena no A; legado completo → mensagem de op_3 no verso do recado.txt no B),
  epílogos por modificadores de comportamento. `recado.txt` via Blob/download;
  estado terminal persistente (desktop 8s + nota completa na reabertura).
- **Áudio 100% procedural** (Web Audio): vento, chuva, zumbido 55Hz, gotejamento,
  madeira, estática, nota em lá menor sem resolução (cortada de 3 compassos no prólogo).
- **Acessibilidade**: 3 volumes, 5 velocidades de texto, reduzir flashes/tremores,
  legendas de som. Sem HUD, contador ou inventário.
- **Modo dev interno** (`?dev=1`, nunca público): pular atos, simular rebobinadas,
  resolver puzzles, disparar finais.
- **Assets gerados e integrados**: capa REWIND, capa LINHA MORTA, retrato fotográfico
  (duas pessoas diante do farol — integrado ao jogo com degradação em camadas),
  tela de abertura do quarto e painel do segundo jogo (splash reais). PNGs em alta em
  `assets/`; versões comprimidas embutidas via `src/embedded.js` (data URIs) para
  publicação sem binários quebrados. Arte dinâmica (áreas, Vela, retrato) procedural.

## Números

- Rotas implementadas: **7** · Puzzles: **8** (3 originais preservados + 5 novos)
- Finais: **2 principais** + **6 variações** + **2 segredos** + epílogos por comportamento
- Áreas jogáveis: **5** · Lembranças: **9** + micro-perdas
- Testes automatizados: **35 casos Node** (todos passando) + **runner no navegador**
  (namespaces + linhas obrigatórias verbatim) — **7 casos**, todos passando.
- Linhas de diálogo/falas escritas: ~180 entradas (banco de dados narrativo).

## Testes executados de verdade

1. **Suíte Node** (`node tests/logic-tests.js`): 35/35 passando — estado/validação,
   perdas determinísticas m1–m9 + micro-perdas, origens own/vela, dessaturação com
   piso, snapshot/restore por checkpoint, validadores dos 8 puzzles, gate do twist
   (7 rebobinadas + 3 puzzles centrais), variações/segredos/epílogos, legacy
   determinístico, recado.txt com data local, anti-softlock.
2. **Runner no navegador** (`tests/runner.html`): 7/7 — integração dos namespaces e
   preservação verbatim das falas obrigatórias.
3. **Sessão real no navegador** (Chromium headless via agent-browser, servidor local):
   - Boot sem erros de console; prólogo completo; typewriter com pausas.
   - Copo: examinar/derramar → poça criada; rebobinada pelo X → perda m1 aplicada,
     poça **persistiu**, copo restaurado por checkpoint, dessaturação −6%.
   - Twist simulado (7 rebobinadas + puzzles centrais) → título `// 2`, ato 3.
   - Ato IV → escolha final → **Final A** completo → máquina consertada, tela
     terminal, `ultima_rebobinada` gravado; **recarregamento** → desktop fictício
     com nota (8s) e encerramento correto.
   - **Final B** completo → painel do recado com segredo de op_3 no verso
     (legado completo), exportação Blob OK, variação por faixa correta (B1).
   - Capturas de tela verificadas visualmente: sala (top-down coerente, poça,
     retrato real na mesa, Vela, cromo da janela), verso do retrato (V. & M.
     raspado + chave), escadaria (degraus, registros, cacos).

## Limitações permanentes (honestas)

- **Push de binários:** o plugin GitHub disponível grava conteúdo textual; PNGs em
  alta não atravessam o canal. Solução adotada: arte procedural/SVG no repositório +
  imagens geradas comprimidas como data URIs (`embedded.js`/`covers.js`) + PNGs
  completos nos ZIPs de entrega.
- **Duração:** estimada em 1h20–2h conforme leitura do jogador; não houve playthrough
  humano cronometrado. Conteúdo dimensionado para a faixa pedida.
- **Não testado:** dispositivos móveis reais (apenas responsividade CSS), leitores de
  tela (ARIA básico apenas), navegadores legados, áudio em hardware real (headless).
- A rebobinada **não** intercepta o fechamento real da aba (limitação de navegador
  documentada e assumida no design).

## Critérios da Etapa 1 — status

Todos os itens exigidos (sistemas, rotas, puzzles, finais, variações, segredos,
persistência, save antigo, diálogos, perdas, assets integrados, direção top-down,
áudio, interface, documentação, testes reais) estão implementados e testados nos
níveis descritos acima. **Nenhum erro crítico conhecido em aberto.**
