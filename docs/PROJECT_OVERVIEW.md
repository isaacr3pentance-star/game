# PROJECT OVERVIEW — Biblioteca de Terror

Este repositório é uma pequena biblioteca de dois jogos de terror, hospedada como um
site estático único com página de seleção. Os dois jogos são independentes em
identidade, mecânica, arte e armazenamento.

## 1. REWIND // REWIND — `games/rewind/`

- **Gênero:** terror psicológico com meta-narrativa; 2D top-down com câmera fixa.
- **Centro emocional:** a relação entre o jogador ("o de fora") e Vela, vigia que sabe
  que morreu. A rebobinada pelo X falso da janela restaura o tempo e cobra lembranças
  permanentes.
- **Sistemas:** estado temporal vs. persistente com checkpoints narrativos; IndexedDB
  próprio; 9 lembranças com perdas determinísticas; 7 rotas com conteúdo exclusivo;
  8 puzzles determinísticos; save antigo (`legacy.save`) com twist; 2 finais + 6
  variações + 2 segredos; áudio 100% procedural com reverso real; acessibilidade
  (flashes, tremores, legendas, velocidade de texto); modo dev oculto (`?dev=1`).
- **Documentação:** `games/rewind/docs/` (bíblia, changelogs, manual de testes,
  relatório de conclusão).

## 2. LINHA MORTA — `games/second-horror/`

- **Gênero:** terror analógico-institucional; painel de central telefônica manual em
  vista frontal fixa (identidade visual e de câmera próprias, sem reaproveitar REWIND).
- **Centro:** procedimento e escuta. O jogador conecta chamadas seguindo o manual da
  Central Riachuelo 4 durante cinco turnos e descobre a linha morta — um jack que não
  consta no inventário e que aprende quem responde.
- **Sistemas:** roteamento por precedência com validação incremental; apito de teste
  (diagnóstico por tom); armário com sequência de fichas de cor; registrador mecânico;
  mecânica de fio aberto com falha acumulativa; 4 finais (um por protocolo, um por
  conversa, um secreto por indícios, uma falha por escuta excessiva); IndexedDB próprio.
- **Documentação:** `games/second-horror/docs/`.

## 3. Portal — `index.html` + `launcher/`

- Página de seleção com capas, gênero, descrição sem spoilers, botões de jogo e
  indicador de progresso ("continuar") lido de `portal_progress_*` (escrito apenas
  pelos jogos; o portal nunca altera estados narrativos).
- Identidade visual própria (biblioteca noturna, latão, poeira); hover com zoom suave;
  responsivo; navegação por teclado nos cards.

## 4. Isolamento de dados

| Jogo | IndexedDB | localStorage | Exporta |
|---|---|---|---|
| REWIND | `rewind_db` | `rewind_*` | `recado.txt`, `legacy.save`, `ultima_rebobinada.save` (nomes narrativos) |
| LINHA MORTA | `second_horror_db` | `second_horror_*` | — |

Limpar o progresso de um jogo não afeta o outro. O portal só lê carimbos de progresso
(`portal_progress_*`).

## 5. Assets

Arte dinâmica procedural (Canvas/SVG) nos dois jogos + imagens geradas por IA (capas,
retrato do REWIND, telas de abertura) comprimidas e embutidas via data URIs
(`embedded.js`/`covers.js`), com PNGs em alta nos ZIPs de entrega. Nenhum asset
externo; o site funciona offline após o primeiro carregamento.

## 6. Testes

- REWIND: 35 casos Node + 7 no navegador (runner) + sessão real documentada.
- LINHA MORTA: 17 casos Node + 8 no navegador + fluxo manual verificado.
- Portal: navegação, caminhos relativos, indicadores de progresso, responsividade
  (verificados manualmente no navegador; sem spoilers exibidos).
