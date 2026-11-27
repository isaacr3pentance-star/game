# ROADMAP 11/10 — OPERAÇÃO GAME PORTAL

Estado em 2026-11-27 (branch `feat/rewind-expansion-3`).

## Concluído nesta operação

- [x] Auditoria completa com correções (AUD-01…07 — ver AUDIT_11_10.md)
- [x] Arte vetorial de referência (capas, retrato, splashes)
- [x] Validação dos dois extremos no roteamento (§6.3)
- [x] Jack morto conectável no painel (§6.5) + rota física B6 (§6.2)
- [x] Ficha de ponto + codinome ficcional (§6.6)
- [x] Foco visível + aria no REWIND (§15)
- [x] Rotina de qualidade automatizada (verify_repo + smoke + CI §18)
- [x] Documentação 11/10 completa (§19) e 10 ciclos (§20)

## Em revisão (aguardando merge autorizado)

- [ ] PR da branch `feat/rewind-expansion-3` → `main` (sem merge
      automático; revisão humana exigida pelo manual do projeto)

## Próximos passos recomendados (pós-merge)

1. **Ativar GitHub Pages** (Settings → Pages → branch `main`).
   Caminhos: portal em `…/game/`, REWIND em `…/game/games/rewind/`,
   LINHA MORTA em `…/game/games/second-horror/`. `.nojekyll` já presente.
2. **Re-executar o CI no GitHub Actions** (workflow criado; primeira
   execução real acontece no push do PR).
3. **Bateria de navegador por final** (turno 5 até cada um dos 4 finais
   + finais A/B do REWIND) na revisão do PR.
4. **Publicação dos PNGs-fonte** por canal adequado (release artifact
   ou LFS) — opcional; runtime independe deles.
5. **Simulação com leitor de tela (NVDA/VoiceOver)** e certificação
   mobile em dispositivos físicos.
6. **Estudo de PWA/Service Worker** (§18: só prometer offline após
   testar HTTP vs file:// — hoje o jogo funciona 100% offline por
   ser estático e sem dependências).

## Fora de escopo (proibido pelo manual §21)

Multiplayer, combate, inventário RPG, mundo aberto, backend, tracking,
IA generativa em runtime, terceiro jogo antes de finalizar os dois.

## Linha de base de qualidade para futuras expansões

- Suítes: 35 (REWIND) + 26 (LM) + verify_repo 7/7 + smoke 3/3.
- Toda alteração em narrativa/meânica deve atualizar: Bíblia afetada,
  CHANGELOG, e adicionar teste de regressão na suíte correspondente.
