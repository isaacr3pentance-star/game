# CHANGELOG TÉCNICO — LINHA MORTA

## Arquitetura

- HTML5 + CSS3 + JS ES6+ puro, sem build, sem backend, scripts ordenados (roda em
  `file://` e em subdiretório do Pages). Namespace próprio `LM` — não compartilha
  código nem estado com REWIND (`RW`).
- **Painel:** SVG inline (jacks A/B, jack morto, lâmpadas) + cabos desenhados como
  paths curvos ao conectar; fichas como cartões HTML na bandeja; interação
  ficha → entrada → saída com validação incremental contra `correctOrder`.
- **Lógica pura** (`logic.js`) separada da UI e testável em Node: precedência do
  manual, pares proibidos, ficha 13, perfis de tom do apito, sequência do armário,
  registrador, computação dos quatro finais.
- **Áudio procedural** (Web Audio): zumbido 50Hz + 100.4Hz (ruído de rede), cliques
  de relé, tom de teste 1000Hz, "silêncio com respiração" (ruído lowpass modulado),
  estática da linha. Legendas de som para acessibilidade.
- **Terminal** de texto com autores distintos (MANUAL/FERREIRA/IVONE/A LINHA) e
  máquina de escrever com pausas em pontuação.
- **Saves:** IndexedDB `second_horror_db` + contingência `second_horror_*` no
  localStorage; autosave 20s + gravação em eventos.
- **Splash e capa** gerados por IA, comprimidos e embutidos via `src/embedded.js`
  (data URIs) — PNGs em alta em `assets/` e nos ZIPs de entrega.
- **Finais persistentes:** `terminal` + `ending` no save; reabrir mostra o epílogo
  de novo, com opção de recomeçar (wipe).

## Decisões

- Vista frontal fixa do painel: o segundo jogo tem liberdade de câmera e a identidade
  "analógico-institucional" pede o painel como protagonista.
- A falha EM ESCUTA é estado, não game over arbitrária: três escutas acumuladas
  desencadeiam a cena na noite 4+, mantendo os turnos anteriores jogáveis.
- O vocabulário da linha cresce estritamente por noite (testado) — a mecânica de
  "só falar o que ela já disse" guia o tom dos eventos.
