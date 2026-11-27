# CHANGELOG TÉCNICO — Expansão 3.0

## Arquitetura

- HTML5 + CSS3 + JavaScript ES6+ puro. Sem frameworks, sem build, sem backend.
  Scripts ordenados via `<script>` (funciona em `file://` e em subdiretório do Pages).
- Namespace único `RW` (sem variáveis globais soltas). Módulos DOM-free nas camadas
  de lógica (estado, saves, puzzles, finais) → testáveis em Node.
- **Estado:** temporal vs. persistente (`RW.State`). `TEMPORAL_KEYS` restauradas pela
  rebobinada (copo, dial, ângulos, engrenagens, cena); perdas, puzzles resolvidos,
  twist e finais são permanentes. A rebobinada não desfaz o preço de Vela.
- **Saves:** IndexedDB `rewind_db`/store `saves` com chaves `current`, `legacy`,
  `ultima_rebobinada`; contingência `localStorage` prefixada `rewind_`; validação e
  sanitização (`validate`) com defaults; autosave 20s + save em batidas críticas.
  Nada de `beforeunload`.
- **Rebobinada:** `RW.Rewind.perform(origin)` — hooks registrados pelo jogo; FX
  (flash + desktop fictício 200ms) respeita "reduzir flashes"; áudio reverso real via
  `ScriptProcessor` (anel de ~2,6s do mix) invertendo os dados do canal; contingência
  reverte o buffer de vento gerado.
- **Áudio:** 100% Web Audio procedural (vento marrom, chuva bandpass, zumbido 55Hz +
  detune, gotejamento, madeira, estática do rádio, nota em lá menor sem resolução —
  versão cortada de 3 compassos no prólogo). Volumes/master/amb/radio em prefs.
- **Arte:** pintor procedural Canvas 2D top-down (plâncton de poeira, chuva, halo
  flicker, feixe varrendo no exterior) + overlays por estado (poça, copo vazio/cheio,
  retrato em camadas com `destination-out`, marcações do calendário, bilhete ausente).
  Vela: SVG top-down (de pé / sentada) com respiração. Retrato: canvas com perdas
  determinísticas. Imagens geradas (capas, retrato, telas) embutidas via `src/embedded.js`
  (data URIs) para publicação sem binários externos quebrados.
- **Interface:** cromo de janela próprio (título dinâmico `// 2` pós-twist), X falso
  (rebobinada / escolha final no Ato IV, pulsação no hover pós-twist), legendas de som
  (acessibilidade), histórico de conversas, configs (3 volumes, velocidade de texto,
  flashes, tremores, legendas). Sem HUD.
- **Acessibilidade:** reduce-flashes, reduce-shake (classe `no-shake`), legendas para
  eventos sonoros, 5 velocidades de texto, volumes separados.
- **Qualidade:** modo dev `?dev=1` (pular atos, simular estados, disparar finais);
  validação de save anti-corrupção; anti-softlock (puzzles re-jogáveis, erros
  registrados sem bloqueio, gaveta/porta dependem de estados persistentes).
- **Sessão:** ociosidade 90s/180s sensível a `visibilitychange`; timers suspensos
  com aba oculta; quarta parede a cada ~3min com dados locais reais.

## Commits (por funcionalidade)

1. `feat(rewind): scaffold expansion-3 architecture` — estrutura, estado, saves
2. `feat(rewind): expand narrative acts and dialogue database` — dados, motor, rotas
3. `feat(rewind): implement seven puzzles with deterministic solutions`
4. `feat(rewind): procedural top-down scenes, vela sprite and state overlays`
5. `feat(rewind): rewind system with real reverse audio and persistent losses`
6. `feat(rewind): legacy save twist, fourth wall and idle autonomy`
7. `feat(rewind): endings, six variations, two secrets and terminal state`
8. `art(rewind): integrate generated assets as embedded data uris`
9. `test(rewind): logic suites for node and browser`
10. `docs(rewind): bible, changelogs, test manual and completion report`

## Decisões e limitações

- **Binários via API:** o plugin GitHub disponível grava conteúdo textual; PNGs
  pesados não atravessam esse canal com qualidade. Solução: arte principal
  procedural/SVG no repositório + imagens geradas comprimidas embutidas como data
  URIs (`embedded.js`) + PNGs em alta no ZIP de entrega (`assets-src/`).
- **beforeunload:** não usado por design (política de save em batidas).
- **`ultima_rebobinada.save` / `legacy.save`:** implementados como registros no
  IndexedDB com nomes narrativos; a interface exibe os nomes de arquivo.
