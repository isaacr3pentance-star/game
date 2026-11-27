# REWIND // REWIND

Terror psicológico, mistério e meta-narrativa em 2D top-down. Uma vigia de farol que sabe
que morreu. Um X falso em uma janela de jogo. E o preço de cada rebobinada.

## Como executar

- **Opção direta:** abra `index.html` no navegador (funciona por `file://`).
- **Servidor local:** `python3 -m http.server 8000` dentro de `games/rewind/` e visite
  `http://localhost:8000/`.
- **Produção:** GitHub Pages a partir da raiz do repositório (`games/rewind/index.html`).

## Como jogar

- Clique nos objetos do quarto (visão de cima, câmera fixa — sem WASD, sem avatar móvel).
- O **X falso** na barra de título rebobina o tempo do quarto — e cobra uma lembrança de Vela.
- `config` abre volume, velocidade de texto, redução de flashes/tremores e legendas de som.
- `histórico` reabre as conversas. `conversar` fala com Vela sem objetivo de puzzle.
- Não há HUD, contador ou inventário. As perdas são percebidas no mundo.

## Estrutura

```text
rewind/
├── index.html
├── styles/main.css
├── src/
│   ├── core/        estado (temporal/persistente), saves IndexedDB, rebobinada, áudio
│   ├── narrative/   banco de diálogos, motor de diálogo, rotas, lembranças
│   ├── puzzles/     copo, rádio, retrato + calendário, fósforos, engrenagens, reflexos
│   ├── environment/ pintor procedural das áreas + cenas/hotspots/overlays
│   ├── interface/   cromo da janela, X falso, configurações, modo dev (?dev=1)
│   └── endings/     finais A/B, seis variações, dois segredos, terminal
├── assets/          imagens geradas + fontes de arte
├── docs/            bíblia, changelogs, manual de testes, relatório de conclusão
└── tests/           suítes de lógica (Node + navegador)
```

## Saves

IndexedDB `rewind_db` (store `saves`) com chaves `current`, `legacy` (save antigo,
nunca sobrescrito) e `ultima_rebobinada` (estado terminal). Contingência em
`localStorage` com prefixo `rewind_`. Nada é compartilhado com o outro jogo do portal.

## Como apagar / reiniciar

No console do navegador (no jogo):

```js
RW.SaveSystem.wipeAll().then(() => location.reload());
```

Isso apaga save atual, save antigo e estado terminal, reiniciando a narrativa do zero.

## Limitações do navegador

- O jogo não impede fechar a aba real (e não tenta). A rebobinada é simulada dentro
  do jogo, pelo X falso da barra de título.
- Áudio começa após a primeira interação (política de autoplay dos navegadores).
- O `recado.txt` do Final B é exportado por download (Blob) — navegadores não
  gravam arquivos em pastas arbitrárias sem ação explícita do jogador.
- O estado terminal do Final A é narrativo: limpar os dados do navegador o desfaz,
  e abrir em outro navegador começa uma sessão nova. Isso é honesto e documentado.

## Modo de desenvolvimento

`index.html?dev=1` expõe painel interno (pular atos, simular rebobinadas, resolver
puzzles, disparar finais). Nunca fica ativado para o público — só com querystring.
