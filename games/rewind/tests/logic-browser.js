/* Mesma suíte de logic-tests.js adaptada para o navegador (usa RW global).
   logic-tests.js em Node testa os módulos direto; aqui valida a integração dos
   namespaces carregados pelos <script> tags. */
(function () {
  'use strict';
  var out = document.getElementById('out');
  var passed = 0, failed = 0;
  function log(cls, text) {
    var p = document.createElement('div');
    p.className = cls;
    p.textContent = text;
    out.appendChild(p);
  }
  function assert(c, m) { if (!c) throw new Error(m || 'falhou'); }
  function t(name, fn) {
    try { fn(); passed++; log('ok', 'ok  - ' + name); }
    catch (e) { failed++; log('fail', 'FAIL - ' + name + ' :: ' + e.message); }
  }
  var State = RW.State, L = RW.PuzzleLogic, E = RW.Endings;

  t('namespaces carregados', function () {
    assert(State && L && E && RW.Data && RW.Puzzles && RW.Painter && RW.Room);
  });
  t('perdas determinísticas m1..m9', function () {
    var s = State.defaults(); s.prologueDone = true;
    for (var i = 1; i <= 9; i++) {
      var loss = State.applyLoss(s, 'own');
      assert(loss.memory === 'm' + i);
    }
    var l10 = State.applyLoss(s, 'own');
    assert(l10.micro === true);
  });
  t('janela do rádio e captura', function () {
    var s = State.defaults();
    s.radioDial = 92.7;
    assert(L.inNoteWindow(s.radioDial));
    assert(L.applyRadioCapture(s) && s.radioCapture === 50);
    assert(L.applyRadioCapture(s) && s.radioCaptureDone);
  });
  t('soluções dos puzzles novos', function () {
    assert(L.validateCalendar(L.CALENDAR_MARKED.slice()));
    assert(L.validateMatches([120, 140, 110, 900]));
    assert(L.validateGears({ left: [12, 24], right: [18, 36] }));
    assert(L.validateMirrors([45, 135, 180]));
    assert(L.validateDoorLocks([0, 2, 4]));
  });
  t('variações e segredos de finais', function () {
    var s = State.defaults(); s.rewindsOwn = 12;
    assert(E.computeVariation(s, 'B') === 'B2');
    s.radioCaptureDone = true;
    assert(E.computeSecrets(s).indexOf('radio') >= 0);
  });
  t('dessaturação com piso', function () {
    var s = State.defaults();
    for (var i = 0; i < 12; i++) State.applyLoss(s, 'own');
    assert(Math.abs(State.saturationLevel(s) - 0.35) < 1e-9);
  });
  t('conteúdo narrativo íntegro', function () {
    var D = RW.Data;
    assert(D.rewindReactions.first.indexOf('Onde eu estava agora') === 0);
    assert(D.rewindReactions.mid[0].indexOf('Você fez de novo') === 0);
    assert(D.rewindReactions.late.indexOf('Tudo bem') === 0);
    assert(D.twist.discover.some(function (n) { return n.text.indexOf('Você não é o primeiro') >= 0; }));
    assert(D.endings.A_final_line.indexOf('Obrigada por me lembrar') === 0);
    assert(D.endings.B_intro.some(function (n) { return n.text.indexOf('Você foi o primeiro que ficou') >= 0; }));
    assert(Object.keys(D.memories).length === 9);
    assert(D.routes.retrato.vela[1] === 'Você não precisava disso.');
  });

  var sum = document.createElement('div');
  sum.textContent = 'Resultado: ' + passed + ' passaram, ' + failed + ' falharam';
  sum.style.marginTop = '12px';
  out.appendChild(sum);
})();
