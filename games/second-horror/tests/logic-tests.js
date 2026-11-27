/* Suíte de lógica de LINHA MORTA — Node. Manual, apito, fichas, registrador, finais. */
'use strict';

var path = require('path');
var State = require(path.join(__dirname, '..', 'src', 'state.js'));
var Logic = require(path.join(__dirname, '..', 'src', 'logic.js'));
var Data = require(path.join(__dirname, '..', 'src', 'data.js'));

var passed = 0, failed = 0, failures = [];
function t(name, fn) {
  try { fn(); passed++; console.log('  ok  - ' + name); }
  catch (e) { failed++; failures.push(name + ' :: ' + e.message); console.log('FAIL  - ' + name + ' :: ' + e.message); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assert falhou'); }

console.log('== Estado ==');
t('defaults válidos', function () {
  var s = State.validate(State.defaults());
  assert(s.night === 1 && s.listened === 0 && !s.terminal);
});
t('save corrompido vira null e valores absurdos são sanados', function () {
  assert(State.deserialize('lixo{') === null);
  var s = State.validate({ night: 9, listened: -2, ivoneFacts: 'não-lista' });
  assert(s.night === 1 && s.listened === 0 && Array.isArray(s.ivoneFacts));
});
t('indícios de Ivone: 6 preenchem o segredo', function () {
  var s = State.defaults();
  Object.keys(Data.ivoneClues).forEach(function (k) { State.addFact(s, k); });
  assert(State.ivoneReady(s) && s.ivoneFacts.length === 6);
  assert(!State.addFact(s, 'caderno'), 'não duplica');
});

console.log('== Manual: roteamento ==');
t('ordem correta: azuis primeiro, vermelhas depois, numeração crescente', function () {
  var tickets = [
    { id: 'a', num: 8, color: 'vermelha' },
    { id: 'b', num: 2, color: 'vermelha' },
    { id: 'c', num: 9, color: 'azul' },
    { id: 'd', num: 1, color: 'azul' }
  ];
  assert(JSON.stringify(Logic.correctOrder(tickets)) === JSON.stringify(['d', 'c', 'b', 'a']));
  assert(Logic.validateOrder(tickets, ['d', 'c', 'b', 'a']));
  assert(!Logic.validateOrder(tickets, ['c', 'd', 'b', 'a']));
});
t('pares cruzados A7–B8 e A8–B7 são proibidos', function () {
  assert(Logic.isForbiddenPair(7, 8));
  assert(Logic.isForbiddenPair(8, 7));
  assert(!Logic.isForbiddenPair(7, 7));
});
t('ficha 13 não pode ser a primeira depois da noite 3', function () {
  var t13 = { num: 13, color: 'vermelha' };
  assert(!Logic.validateConnection(t13, 5, 5, 3, true).ok);
  assert(Logic.validateConnection(t13, 5, 5, 3, false).ok, 'se não for a primeira, permite');
  assert(Logic.validateConnection(t13, 5, 5, 2, true).ok, 'antes da noite 3, permite');
});
t('par proibido é recusado com regra citada', function () {
  var r = Logic.validateConnection({ num: 3 }, 7, 8, 1, true);
  assert(!r.ok && r.rule.indexOf('cruzados') >= 0);
});

console.log('== Apito de teste ==');
t('linha morta = silêncio com respiração', function () {
  var profiles = [{ freq: 1000, noise: 0.1 }, { freq: 0, noise: 0 }];
  assert(Logic.analyzeTone(profiles[0]).dead === false);
  assert(Logic.analyzeTone(profiles[1]).dead === true);
  assert(Logic.findDeadLine(profiles) === 1);
});
t('tom com isolamento ruim não é linha morta', function () {
  assert(Logic.analyzeTone({ freq: 1000, noise: 0.8 }).dead === false);
});

console.log('== Armário e registrador ==');
t('sequência de fichas da Ivone: azul, azul, vermelha, azul', function () {
  assert(Logic.validateChips(['azul', 'azul', 'vermelha', 'azul']));
  assert(!Logic.validateChips(['azul', 'vermelha', 'azul', 'azul']));
  assert(!Logic.validateChips(['azul', 'azul', 'vermelha']));
});
t('registrador sincroniza com total exato', function () {
  assert(Logic.validateCounter(3, '3'));
  assert(!Logic.validateCounter(3, '4'));
  assert(!Logic.validateCounter(3, 'abc'));
});

console.log('== Finais ==');
t('cortar = REGRA; limpo se nunca escutou', function () {
  var s = State.defaults(); s.night = 5;
  var e = Logic.computeEnding(s, 'cut', false);
  assert(e.id === 'REGRA' && e.clean === true);
  s.listened = 2;
  var e2 = Logic.computeEnding(s, 'cut', false);
  assert(e2.id === 'REGRA' && e2.clean === false);
});
t('conectar = LINHA; com 6 indícios e jack da Ivone = IVONE', function () {
  var s = State.defaults(); s.night = 5;
  assert(Logic.computeEnding(s, 'connect', false).id === 'LINHA');
  Object.keys(Data.ivoneClues).forEach(function (k) { State.addFact(s, k); });
  assert(Logic.computeEnding(s, 'connect', true).id === 'IVONE');
  assert(Logic.computeEnding(s, 'connect', false).id === 'LINHA', 'sem o jack não vira IVONE');
});
t('três escutas com flag = EM ESCUTA', function () {
  var s = State.defaults();
  s.listened = 3; s.caughtListening = true;
  assert(Logic.computeEnding(s, 'cut', false).id === 'ESCUITA');
});

console.log('== Conteúdo ==');
t('cinco noites completas: fichas, eventos, intros', function () {
  for (var n = 1; n <= 5; n++) {
    assert(Data.ticketsByNight[n].length >= 3, 'noite ' + n + ' com fichas');
    assert(Data.deadLineEvents[n].options.length >= 2, 'noite ' + n + ' com escolhas');
    assert(Data.nightIntros[n].length >= 1, 'noite ' + n + ' com intro');
  }
});
t('vocabulário da linha cresce por noite', function () {
  var prev = 0;
  for (var n = 1; n <= 5; n++) {
    assert(Data.deadLineEvents[n].lineWords.length > prev, 'noite ' + n);
    prev = Data.deadLineEvents[n].lineWords.length;
  }
});
t('epílogos escritos para os quatro finais', function () {
  ['REGRA', 'LINHA', 'IVONE', 'ESCUITA'].forEach(function (k) {
    assert(Data.endingsText[k].body.length >= 2, k);
  });
});

console.log('== Regressões da auditoria 11/10 ==');
t('AUD-05: conexão rejeitada com entrada errada (dois extremos)', function () {
  var t11 = Data.ticketsByNight[1][0];
  var r = Logic.validateConnection(t11, 2, 1, 1, false);
  assert(!r.ok && /entra pela/.test(r.rule), 'deveria rejeitar entrada errada');
});
t('AUD-05: conexão rejeitada com destino errado', function () {
  var t11 = Data.ticketsByNight[1][0];
  var r = Logic.validateConnection(t11, 0, 3, 1, false);
  assert(!r.ok && /pede a B2/.test(r.rule), 'deveria rejeitar destino errado');
});
t('AUD-05: extremos corretos (A1→B2) são aceitos', function () {
  var t11 = Data.ticketsByNight[1][0];
  assert(Logic.validateConnection(t11, 0, 1, 1, false).ok, 'A1→B2 deveria passar');
});
t('AUD-05: ficha 13 (sem origem) aceita qualquer entrada; destino B6 fixo', function () {
  var t33 = Data.ticketsByNight[3][2];
  assert(Logic.validateConnection(t33, 2, 5, 3, false).ok, 'qualquer A com B6');
  assert(Logic.validateConnection(t33, 4, 5, 3, false).ok, 'outra A com B6');
  var r = Logic.validateConnection(t33, 2, 4, 3, false);
  assert(!r.ok, 'B5 não é o destino da 13');
});
t('AUD-03: turno 5 tem 4 fichas e a de ponto é pessoal e sem destino', function () {
  var n5 = Data.ticketsByNight[5];
  assert(n5.length === 4, 'três comuns + ficha de ponto');
  var per = n5.filter(function (t) { return t.personal; })[0];
  assert(per && per.id === 't54' && per.to === null && per.entrada === null, 'ficha de ponto t54');
});
t('AUD-03: ficha de ponto aceita qualquer par físico (exceto proibido)', function () {
  var per = Data.ticketsByNight[5].filter(function (t) { return t.personal; })[0];
  assert(Logic.validateConnection(per, 0, 5, 5, false).ok, 'A1→B6 livre');
  assert(Logic.validateConnection(per, 3, 2, 5, false).ok, 'A4→B3 livre');
  assert(!Logic.validateConnection(per, 7, 8, 5, false).ok, 'par cruzado continua proibido');
});
t('AUD-03: ordem correta do turno 5 termina na ficha de ponto', function () {
  var order = Logic.correctOrder(Data.ticketsByNight[5]);
  assert(order.join(',') === 't51,t52,t53,t54', 'ordem: ' + order.join(','));
});
t('AUD-05: jackIndex converte rótulos físicos', function () {
  assert(Logic.jackIndex('A4') === 3, 'A4→3');
  assert(Logic.jackIndex('B2') === 1, 'B2→1');
  assert(Logic.jackIndex(null) === -1 && Logic.jackIndex('X9') === -1, 'sem rótulo');
});
t('AUD-03: codinome ficcional é sanitizado (trim/18)', function () {
  var s = State.validate({ codinome: '   Voz De Prata Do Turno   ' });
  assert(s.codinome === 'Voz De Prata Do Turno'.slice(0, 18), 'codinome: ' + s.codinome);
  assert(State.validate({}).codinome === null, 'ausente vira null');
});

console.log('');
console.log('Resultado: ' + passed + ' passaram, ' + failed + ' falharam');
if (failed > 0) { failures.forEach(function (f) { console.log('  FALHA: ' + f); }); process.exit(1); }
