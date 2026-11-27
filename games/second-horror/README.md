# LINHA MORTA

Terror analógico de central telefônica manual, 197X. Cinco turnos na Central Riachuelo 4.
Você é a operadora substituta de Ivone Custódio, que não fechou o último ponto. A central
conecta chamadas. A central escuta pela operadora. E há uma linha que não consta no
inventário.

## Identidade

- **Câmera:** vista frontal fixa do painel de jacks (liberdade criativa do segundo jogo —
  sem relação com a direção top-down de REWIND).
- **Mecânica central:** conectar fichas com cabos (clique na ficha → entrada A → saída B),
  seguindo o manual da central. Erros de precedência e pares cruzados são recusados e
  registrados.
- **A linha morta:** jack solto, lâmpada sem ficha, eventos por turno com escolhas reais.
  Abrir o fio (escutar) é falta grave — três escutas e a central aprende a operadora.
- **Puzzles:** roteamento por precedência (todas as noites), apito de teste (diagnóstico
  da linha morta), armário do registrador (sequência de fichas de cor da Ivone),
  sincronização do registrador mecânico.
- **Finais:** REGRA (cortar e seguir o manual), LINHA MORTA (conectar-se), IVONE
  (segredo: 6 indícios + jack B6), EM ESCUTA (falha por escuta excessiva).
- **Áudio:** 100% procedural — zumbido de 50Hz, relés, apito de 1000Hz, respiração na linha.

## Como executar

Abra `index.html` (funciona por `file://`) ou sirva a pasta com um servidor estático.
No portal: `games/second-horror/index.html`.

## Saves

IndexedDB `second_horror_db` (store `saves`, chave `current`) + contingência
`localStorage` prefixada `second_horror_`. Completamente isolado dos saves do REWIND
(`rewind_db` / `rewind_*`).

## Estrutura

```text
second-horror/
├── index.html
├── styles/main.css
├── src/
│   ├── state.js       turno, fichas, escutas, indícios, finais
│   ├── save.js        IndexedDB próprio (second_horror_db)
│   ├── logic.js       manual (roteamento), apito, armário, registrador, finais
│   ├── data.js        cinco turnos: intros, fichas, eventos da linha, epílogos
│   ├── audio.js       zumbido, relés, apito, estática (procedural)
│   ├── terminal.js    texto por máquina de escrever com autores
│   ├── board.js       painel SVG de jacks, cabos, lâmpadas, puzzles
│   ├── night.js       máquina de estados dos turnos
│   ├── endings.js     quatro finais
│   ├── ui.js          painéis, escolhas, config, portal
│   └── embedded.js    splash gerado (data URI)
├── assets/            capa e splash gerados por IA
├── docs/
└── tests/             suíte Node (17 casos)
```

## Documentação

- `docs/BIBLIA_LINHA_MORTA.md` — cânone e estrutura dos turnos.
- `docs/CHANGELOG_TECNICO.md` — decisões de implementação.
- `docs/MANUAL_DE_TESTES.md` — o que foi testado e como reproduzir.
