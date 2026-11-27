# MANUAL DE TESTES — REWIND // REWIND

## 1. Suítes automatizadas (lógica)

**Node:** `node tests/logic-tests.js` — 35 casos.
**Navegador:** abra `tests/runner.html` — integração dos namespaces + conteúdo
narrativo (linhas obrigatórias verbatim).

Cobertura: validação/sanitização de save, perdas determinísticas m1–m9 + micro-perdas,
origem `vela` vs. `own`, dessaturação com piso, snapshot/restore temporal, travas da
porta, janela/captura do rádio, retrato (teto de 5), calendário, fósforos, engrenagens,
reflexos, disponibilidade da escolha final, variações por faixa, segredos, epílogos por
comportamento, legacy determinístico, recado.txt, anti-softlock, gate do twist.

## 2. Checklist manual (navegador)

### Inicialização
- [ ] Abre por `file://` e por `http://` sem erros no console.
- [ ] Áudio desbloqueia na primeira interação (política de autoplay).
- [ ] Prólogo roda: quarto → Vela ("o de fora") → nota cortada → instrução do copo.

### Visual
- [ ] Câmera top-down coerente em todas as áreas; nenhum objeto frontal incompatível.
- [ ] 1920×1080, 1366×768 e 1024×640: stage mantém 16:9 com letterbox.
- [ ] Vela respirando; senta no círculo do tapete; sprite coerente com a vista de cima.

### Rebobinada (X falso)
- [ ] Flash + desktop fictício ~200ms + retorno; áudio reverso distinto de whoosh.
- [ ] Perda aplicada: fala da lembrança perdida + fala obrigatória por faixa.
- [ ] Dessaturação cai 6% por rebobinada (inspecionar `filter` no #stage).
- [ ] Recarregar a página mantém rebobinadas e perdas (persistência).
- [ ] Prólogo bloqueia rebobinada (`RW.Rewind.allowed` → prologue).

### Puzzles
- [ ] Copo: examinar/derramar/encher; poça persiste após rebobinar; copo volta.
- [ ] Porta: travas [1,3,5] na ordem; erro dá pista gradual; sem sorte envolvida.
- [ ] Rádio: nota cortada em 92.7; rebobinar fora da janela não captura; 2 dentro completam.
- [ ] Retrato: 5 pedaços por rebobinadas próprias; verso revela chave; fala obrigatória.
- [ ] Calendário: 9 dias corretos → gaveta; erro dá pistas.
- [ ] Fósforos: 3 curtos + 1 longo (segurar ≥600ms) → lente gira → exterior liberado.
- [ ] Engrenagens: [12,24]/[18,36] com o menor primeiro → sobe à luz.
- [ ] Reflexos: 45°/135°/180° → símbolos acendem → eco de memória.

### Narrativa
- [ ] 4 atos com intros; transição Ato II em 2 rebobinadas; Ato IV com 8+ próprias.
- [ ] Twist: corredor + 7 próprias + 3 puzzles centrais → legacy, título `// 2`, X pulsa.
- [ ] Inatividade: 90s senta; +90s rebobina (origem vela; assinatura não incrementa).
- [ ] Quarta parede: hora/dia reais nas falas; nada pessoal inventado.

### Finais
- [ ] Escolha no Ato IV; Final A restaura tudo, grava terminal; reabrir = desktop 8s + nota.
- [ ] Final B: recado.txt baixa com data local; jogo não rebobina mais.
- [ ] Variações mudam por faixa (testável via dev mode `?dev=1`).
- [ ] Segredos: rádio capturado → cena no A; legado completo → verso do recado no B.

### Portal/saves
- [ ] `rewind_*` nunca mistura com `second_horror_*` (IndexedDB e localStorage separados).

## 3. O que NÃO foi possível testar

- Dispositivos móveis reais/touch multiplataforma (checagem por responsividade CSS apenas).
- Leitores de tela (ARIA básico nos hotspots; sem auditoria completa).
- Browsers legados (target: navegadores com ES6 + Web Audio modernos).
- Duração real de 1h30–2h em playthrough humano completo — estimada por volume de
  conteúdo; registrada como estimativa honesta no relatório de conclusão.
