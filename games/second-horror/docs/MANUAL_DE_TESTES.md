# MANUAL DE TESTES — LINHA MORTA

## Automatizado (Node)

`node tests/logic-tests.js` — 17 casos: estado/validação, indícios (6, sem duplicar),
ordem do manual (cores + numeração), pares cruzados, ficha 13 por noite, apito (linha
morta), armário (sequência), registrador, computação dos 4 finais (REGRA limpo/sujo,
LINHA, IVONE com e sem jack, EM ESCUTA), conteúdo dos 5 turnos (fichas, eventos,
intros), vocabulário crescente, epílogos.

## Navegador

`tests/runner.html` — 8 casos de integração dos namespaces + conteúdo.

## Checklist manual (navegador)

- [ ] Boot sem erros; splash da central; turno 1 com intro e fichas na bandeja.
- [ ] Conectar ficha fora da ordem → recusa citando a regra; contagem de recusas sobe.
- [ ] Par proibido A7–B8 → recusa; ficha 13 como primeira (noites 3+) → recusa.
- [ ] Cabo desenhado de A(n) a B(n); lâmpada da saída acende; ficha marca "done".
- [ ] Evento da linha morta por noite com opções reais e consequência narrada.
- [ ] Noite 2: apito de teste; linha 2 devolve respiração; registro correto aceito.
- [ ] Noite 3: armário com azul-azul-vermelha-azul → 3 indícios; bandeja → ficha amarela.
- [ ] Noite 4: registrador sincroniza com o total real de conexões do turno.
- [ ] Três fios abertos → noite 4+ dispara EM ESCUTA (terminal, tela de final).
- [ ] Noite 5: cut → REGRA; connect → LINHA; 6 indícios + jack da Ivone → IVONE.
- [ ] Final persiste no save; reabrir mostra o epílogo com recomeço.
- [ ] `second_horror_*` isolado de `rewind_*` (IndexedDB e localStorage separados).

## Não testado

- Mobile real/touch; leitores de tela; navegadores legados; áudio em hardware real.
- Duração por playthrough humano (estimada: 35–55 min por partida completa).
