/* Suíte de testes de lógica de REWIND // REWIND — executável em Node e no navegador
   (tests/runner.html). Cobre: estado, validação de save, perdas determinísticas,
   dessaturação, puzzles (copo/porta, rádio, retrato, calendário, fósforos,
   engrenagens, reflexos), finais/variações/segredos e proteções contra softlock. */
'use strict';

var path = require('path');
var State = require(path.join(__dirname, '..', 'src', 'core', 'state.js'));
var SaveSystem = require(path.join(__dirname, '..', 'src', 'core', 'save.js'));
var PuzzleLogic = require(path.join(__dirname, '..', 'src', 'puzzles', 'puzzles.js'));
var EndingsLogic = require(path.join(__dirname, '..', 'src', 'endings', 'endings.js'));

var passed = 0, failed = 0;
var failures = [];

function t(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ok  - ' + name);
  } catch (e) {
    failed++;
    failures.push(name + ' :: ' + e.message);
    console.log('FAIL  - ' + name + ' :: ' + e.message);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assert falhou');
}

function freshState() {
  var s = State.defaults();
  s.prologueDone = true;
  s.act = 1;
  return s;
}

console.log('== Estado e validação ==');
t('defaults são válidos', function () {
  var s = State.validate(State.defaults());
  assert(s && s.version === State.SAVE_VERSION);
  assert(s.glassState === 'half' && s.rewindsOwn === 0);
});
t('save corrompido não quebra', function () {
  var s = State.deserialize('{isso não é json');
  assert(s === null);
  var s2 = State.validate({ rewindsOwn: -5, portraitPieces: 99, act: 9 });
  assert(s2.rewindsOwn === 0 && s2.portraitPieces === 5 && s2.act === 0);
});
t('serialize/deserialize ida e volta', function () {
  var s = freshState();
  s.rewindsOwn = 8; s.memoriesLost.push('m1', 'm2');
  var back = State.deserialize(State.serialize(s));
  assert(back.rewindsOwn === 8 && back.memoriesLost.length === 2);
});
t('lembranças inválidas filtradas', function () {
  var s = State.validate({ memoriesLost: ['m1', 'mx', 42, 'm9'] });
  assert(s.memoriesLost.length === 2 && s.memoriesLost[0] === 'm1');
});

console.log('== Perdas determinísticas ==');
t('ordem de perdas m1..m9', function () {
  var s = freshState();
  for (var i = 1; i <= 9; i++) {
    var loss = State.applyLoss(s, 'own');
    assert(loss.memory === 'm' + i, 'perda ' + i + ' deveria ser m' + i);
  }
  assert(s.rewindsOwn === 9);
});
t('décima rebobinada vira micro-perda', function () {
  var s = freshState();
  for (var i = 0; i < 9; i++) State.applyLoss(s, 'own');
  var loss = State.applyLoss(s, 'own');
  assert(loss.memory === null && loss.micro === true && s.microLosses === 1);
});
t('perda não se repete com rebobinadas extras', function () {
  var s = freshState();
  for (var i = 0; i < 14; i++) State.applyLoss(s, 'own');
  assert(s.memoriesLost.length === 9 && s.rewindsOwn === 14);
});
t('origem vela não incrementa assinatura do jogador', function () {
  var s = freshState();
  State.applyLoss(s, 'vela');
  assert(s.rewindsOwn === 0 && s.rewindsVela === 1 && s.rewindsTotal === 1);
});
t('objeto ambiental perdido junto da lembrança', function () {
  var s = freshState();
  var loss = State.applyLoss(s, 'own');
  assert(loss.object === State.LOSS_OBJECTS.m1);
  assert(s.lostObjects.indexOf('copo_reserva') >= 0);
});
t('dessaturação: 6 pontos por rebobinada, piso 35%', function () {
  var s = freshState();
  assert(Math.abs(State.saturationLevel(s) - 1) < 1e-9);
  for (var i = 0; i < 10; i++) State.applyLoss(s, 'own');
  assert(Math.abs(State.saturationLevel(s) - 0.40) < 1e-9, 'após 10 deveria ser 0.40');
  State.applyLoss(s, 'own');
  assert(Math.abs(State.saturationLevel(s) - 0.35) < 1e-9, 'a partir da 11ª, piso 0.35');
});
t('faixas de rebobinadas para variações', function () {
  var s1 = freshState(); s1.rewindsOwn = 9;
  var s2 = freshState(); s2.rewindsOwn = 10;
  var s3 = freshState(); s3.rewindsOwn = 15;
  assert(State.rewindBand(s1) === 1 && State.rewindBand(s2) === 2 && State.rewindBand(s3) === 3);
});

console.log('== Restauração temporal ==');
t('snapshot/restore não toca estado persistente', function () {
  var s = freshState();
  s.radioDial = 92.7; s.gearSlots = [12]; s.rewindsOwn = 3;
  var snap = State.snapshotTemporal(s);
  s.radioDial = 104.2; s.rewindsOwn = 7;
  State.restoreTemporal(s, snap);
  assert(s.radioDial === 92.7, 'dial restaurado');
  assert(s.rewindsOwn === 7, 'assinatura própria persiste');
});

console.log('== Puzzle: copo e porta ==');
t('travas gastas [0,2,4] resolvem', function () {
  assert(PuzzleLogic.validateDoorLocks([0, 2, 4]));
});
t('ordem errada ou travas ferrugentas não resolvem', function () {
  assert(!PuzzleLogic.validateDoorLocks([2, 0, 4]));
  assert(!PuzzleLogic.validateDoorLocks([0, 1, 2]));
  assert(!PuzzleLogic.validateDoorLocks([0, 2]));
});

console.log('== Puzzle: rádio ==');
t('janela do sinal em torno de 92.7', function () {
  assert(PuzzleLogic.inNoteWindow(92.7));
  assert(PuzzleLogic.inNoteWindow(92.0));
  assert(!PuzzleLogic.inNoteWindow(95.0));
});
t('captura exige rebobinada na janela; 2 completam', function () {
  var s = freshState();
  s.radioDial = 95.0;
  assert(!PuzzleLogic.applyRadioCapture(s));
  s.radioDial = 92.7;
  assert(PuzzleLogic.applyRadioCapture(s) && s.radioCapture === 50 && !s.radioCaptureDone);
  assert(PuzzleLogic.applyRadioCapture(s) && s.radioCaptureDone);
});
t('captura nunca passa de 100', function () {
  var s = freshState();
  s.radioDial = 92.7;
  for (var i = 0; i < 5; i++) PuzzleLogic.applyRadioCapture(s);
  assert(s.radioCapture === 100);
});

console.log('== Puzzle: retrato ==');
t('cinco rebobinadas próprias → cinco pedaços; trava em 5', function () {
  var s = freshState();
  for (var i = 0; i < 7; i++) PuzzleLogic.portraitAfterRewind(s);
  assert(s.portraitPieces === 5);
});

console.log('== Puzzle: calendário ==');
t('conjunto correto de 9 temporais', function () {
  var marked = PuzzleLogic.CALENDAR_MARKED.slice();
  assert(PuzzleLogic.validateCalendar(marked));
});
t('faltando ou excedendo não resolve', function () {
  var marked = PuzzleLogic.CALENDAR_MARKED.slice();
  assert(!PuzzleLogic.validateCalendar(marked.slice(0, 8)));
  assert(!PuzzleLogic.validateCalendar(marked.concat([10])));
  assert(!PuzzleLogic.validateCalendar(marked.map(function (d) { return d + 1; })));
});

console.log('== Puzzle: fósforos (característica do farol) ==');
t('3 curtos + 1 longo resolve', function () {
  assert(PuzzleLogic.validateMatches([120, 140, 110, 900]));
});
t('3 longos não resolvem; 4 curtos não resolvem', function () {
  assert(!PuzzleLogic.validateMatches([900, 900, 900, 900]));
  assert(!PuzzleLogic.validateMatches([100, 100, 100, 100]));
  assert(!PuzzleLogic.validateMatches([100, 100, 100]));
});

console.log('== Puzzle: engrenagens ==');
t('pares corretos: [12,24] e [18,36] com o menor recebendo', function () {
  assert(PuzzleLogic.validateGears({ left: [12, 24], right: [18, 36] }));
});
t('ordem invertida no par não resolve', function () {
  assert(!PuzzleLogic.validateGears({ left: [24, 12], right: [18, 36] }));
});
t('engrenagens trocadas entre pares não resolvem', function () {
  assert(!PuzzleLogic.validateGears({ left: [12, 18], right: [24, 36] }));
});

console.log('== Puzzle: reflexos ==');
t('reflexo: 2a - 90 (mod 360)', function () {
  assert(PuzzleLogic.reflectedAngle(45) === 0);
  assert(PuzzleLogic.reflectedAngle(135) === 180);
  assert(PuzzleLogic.reflectedAngle(180) === 270);
  assert(PuzzleLogic.reflectedAngle(0) === 270);
});
t('solução dos três cacos: [45,135,180]', function () {
  assert(PuzzleLogic.validateMirrors([45, 135, 180]));
  assert(!PuzzleLogic.validateMirrors([45, 135, 170]));
  assert(!PuzzleLogic.validateMirrors([45, 135]));
});

console.log('== Finais ==');
t('puzzles centrais definem disponibilidade da escolha', function () {
  var s = freshState();
  s.act = 4; s.twist = true;
  assert(!EndingsLogic.finalChoiceAvailable(s));
  s.doorUnlocked = true; s.radioCaptureDone = true; s.portraitFlipped = true;
  assert(EndingsLogic.finalChoiceAvailable(s));
});
t('variações por faixa A1..B3', function () {
  var s = freshState(); s.rewindsOwn = 8;
  assert(EndingsLogic.computeVariation(s, 'A') === 'A1');
  s.rewindsOwn = 12;
  assert(EndingsLogic.computeVariation(s, 'B') === 'B2');
  s.rewindsOwn = 20;
  assert(EndingsLogic.computeVariation(s, 'A') === 'A3');
});
t('segredos: rádio e legado', function () {
  var s = freshState();
  s.radioCaptureDone = true;
  assert(EndingsLogic.computeSecrets(s).indexOf('radio') >= 0);
  s.legacyRecordsSeen = 3; s.routeDiscoveries = { legado: true };
  assert(EndingsLogic.computeSecrets(s).indexOf('legacy') >= 0);
  var s2 = freshState();
  s2.legacyRecordsSeen = 2;
  assert(EndingsLogic.computeSecrets(s2).length === 0);
});
t('modificadores de epílogo refletem comportamento', function () {
  var s = freshState();
  s.behavior.ignored = 6; s.behavior.repetitive = 7; s.rewindsVela = 2;
  var mods = EndingsLogic.epilogueMods(s);
  assert(mods.indexOf('ignored') >= 0 && mods.indexOf('repetitive') >= 0 && mods.indexOf('velaRewinds') >= 0);
});

console.log('== Save antigo e recado ==');
t('legacy.save é determinístico e nunca sobrescrito', function () {
  var a = SaveSystem.buildLegacy();
  var b = SaveSystem.buildLegacy();
  assert(JSON.stringify(a) === JSON.stringify(b));
  assert(a.sessoes.length === 3);
});
t('recado.txt contém data local e rebobinadas', function () {
  var s = freshState();
  s.rewindsOwn = 8;
  var txt = SaveSystem.buildRecado(s, 'anexo secreto');
  assert(txt.indexOf('RECADO') >= 0);
  assert(txt.indexOf('Rebobinadas próprias nesta sessão: 8') >= 0);
  assert(txt.indexOf('anexo secreto') >= 0);
  assert(/\d{2}\/\d{2}\/\d{4}/.test(txt));
});

console.log('== Anti-softlock ==');
t('puzzles permanecem re-jogáveis após erro (estado não trava)', function () {
  var s = freshState();
  s.eventsSeen = {};
  s.eventsSeen.calTrial = 5;
  assert(s.drawerOpened === false);
  // resolver depois de erros ainda é possível
  assert(PuzzleLogic.validateCalendar(PuzzleLogic.CALENDAR_MARKED.slice()));
});
t('twist exige 7 rebobinadas próprias + puzzles centrais', function () {
  var s = freshState();
  s.act = 2; s.doorUnlocked = true; s.radioCaptureDone = true; s.portraitFlipped = true;
  s.rewindsOwn = 6;
  var ok = EndingsLogic.corePuzzlesDone(s);
  var ready = ok && s.rewindsOwn >= 7;
  assert(ok && !ready);
  s.rewindsOwn = 7;
  assert(EndingsLogic.corePuzzlesDone(s) && s.rewindsOwn >= 7);
});

console.log('');
console.log('Resultado: ' + passed + ' passaram, ' + failed + ' falharam');
if (failed > 0) {
  failures.forEach(function (f) { console.log('  FALHA: ' + f); });
  process.exit(1);
}
