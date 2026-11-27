/* EndingManager — decisão de finais, seis variações, dois segredos, estado terminal,
   recado.txt e ultima_rebobinada.save. */
(function (RW) {
  'use strict';

  var E = { busy: false };

  function corePuzzlesDone(state) {
    return state.doorUnlocked && state.radioCaptureDone && state.portraitFlipped;
  }

  function finalChoiceAvailable(state) {
    return state.act >= 4 && !state.ending && corePuzzlesDone(state) && state.twist;
  }

  // Variações por faixa de rebobinadas próprias + modificadores de comportamento.
  function computeVariation(state, ending) {
    var band = RW.State.rewindBand(state);
    return ending + band; // A1|A2|A3 / B1|B2|B3
  }

  function computeSecrets(state) {
    var sec = [];
    if (state.radioCaptureDone) sec.push('radio');
    if ((state.legacyRecordsSeen || 0) >= 3 && state.routeDiscoveries && state.routeDiscoveries.legado) sec.push('legacy');
    return sec;
  }

  function epilogueMods(state) {
    var b = state.behavior;
    var mods = [];
    if (b.talkedWith || state.talked >= 6) mods.push('talkedWith');
    if (b.examinedPersonal) mods.push('examinedPersonal');
    if (b.attentive >= 12) mods.push('attentive');
    if (b.ignored >= 5) mods.push('ignored');
    if (b.repetitive >= 6) mods.push('repetitive');
    if (state.rewindsVela > 0) mods.push('velaRewinds');
    return mods;
  }

  function openChoice() {
    if (!finalChoiceAvailable(RW.state) || E.busy) return;
    var st = RW.state;
    var wrap = document.createElement('div');
    wrap.className = 'ending-choice';
    var h = document.createElement('h3');
    h.textContent = 'A última rebobinada';
    var p = document.createElement('p');
    p.className = 'puzzle-intro';
    p.textContent = 'A máquina espera com a paciência de coisa que já pagou tudo. Você pode consertá-la — o que custa uma última rebobinada — ou pode parar. Não há terceira porta. Há terceiro silêncio, mas ele não é porta.';
    wrap.appendChild(h);
    wrap.appendChild(p);
    var acts = document.createElement('div');
    acts.className = 'puzzle-actions';
    var a = document.createElement('button');
    a.textContent = 'Consertar a máquina (rebobinada final)';
    a.addEventListener('click', function () { RW.UI.closePanel(true); runA(); });
    var b = document.createElement('button');
    b.textContent = 'Parar. Não rebobinar mais.';
    b.addEventListener('click', function () { RW.UI.closePanel(true); runB(); });
    acts.appendChild(a); acts.appendChild(b);
    wrap.appendChild(acts);
    RW.UI.openPanel(wrap);
  }

  function applyEndingState(st, ending) {
    st.ending = ending;
    st.endingVariation = computeVariation(st, ending);
    st.endingSecrets = computeSecrets(st);
    return st.endingVariation;
  }

  // ---------------- FINAL A ------------------------------------------------------
  function runA() {
    if (E.busy) return;
    var st = RW.state;
    if (!finalChoiceAvailable(st)) return;
    E.busy = true;
    var variation = applyEndingState(st, 'A');
    var D = RW.Data.endings;
    RW.Dialogs.sayMany(D.A_intro, function () {
      // rebobinada final: restaura tudo
      st.machineState = 'repaired';
      st.rewindsTotal += 0;
      st.memoriesLost = [];
      st.lostObjects = [];
      st.microLosses = 0;
      var secs = st.endingSecrets;
      var body = D.A_body[variation] || D.A_body.A1;
      var nodes = body.map(function (t) { return { who: 'room', text: t }; });
      if (secs.indexOf('radio') >= 0) {
        D.A_secret_radio.forEach(function (n) { nodes.push(n); });
      }
      RW.Dialogs.sayMany(nodes, function () {
        RW.Dialogs.say({ who: 'vela', text: D.A_final_line, tone: 'RESIGNADO' }, function () {
          var mods = epilogueMods(st);
          var ep = mods.map(function (m) { return RW.Data.epilogueMods[m]; }).filter(Boolean);
          if (ep.length) {
            RW.Dialogs.sayMany(ep.map(function (t) { return { who: 'room', text: t }; }), function () {
              finishA();
            });
          } else finishA();
        });
      });
    });
  }

  function finishA() {
    var st = RW.state;
    st.terminal = true;
    if (RW.Portal) RW.Portal.report('rewind', 'REWIND — final A (' + st.endingVariation + ')');
    var save = {
      nome: 'ultima_rebobinada.save',
      final: 'A — máquina consertada',
      variacao: st.endingVariation,
      segredos: st.endingSecrets,
      rebobinadas_proprias: st.rewindsOwn,
      rebobinadas_da_vela: st.rewindsVela,
      lembrancas_restauradas: true,
      nota: 'o jogo entra em estado terminal. abrir de novo apresenta o desktop fictício e a nota completa.',
      at: new Date().toISOString()
    };
    RW.SaveSystem.save('ultima_rebobinada', save).then(function () {
      RW.SaveSystem.save('current', st).then(function () {
        RW.UI.updateTitle(st);
        RW.Room.setVela('stand');
        RW.Audio.playNote(true, null);
        RW.UI.caption('ultima_rebobinada.save gravado.');
        E.busy = false;
        showTerminalScreen('A');
      });
    });
  }

  // ---------------- FINAL B ------------------------------------------------------
  function runB() {
    if (E.busy) return;
    var st = RW.state;
    if (!finalChoiceAvailable(st)) return;
    E.busy = true;
    var variation = applyEndingState(st, 'B');
    var D = RW.Data.endings;
    RW.Dialogs.sayMany(D.B_intro, function () {
      var body = D.B_body[variation] || D.B_body.B1;
      var nodes = body.map(function (t) { return { who: 'room', text: t }; });
      RW.Dialogs.sayMany(nodes, function () {
        var extra = (st.endingSecrets.indexOf('legacy') >= 0) ? D.B_secret_legacy[0] : null;
        var recado = RW.SaveSystem.buildRecado(st, extra);
        showFinalB(recado, st);
      });
    });
  }

  function showFinalB(recadoText, st) {
    var wrap = document.createElement('div');
    wrap.className = 'ending-choice';
    var h = document.createElement('h3');
    h.textContent = 'recado.txt';
    var pre = document.createElement('pre');
    pre.className = 'recado-preview';
    pre.textContent = recadoText;
    var p = document.createElement('p');
    p.textContent = 'Ela deixou um recado para quem abrir depois de você. Baixe o arquivo e guarde — ou não. O jogo não vai rebobinar mais nada. Quando quiser encerrar de verdade, feche a aba você mesmo.';
    var acts = document.createElement('div');
    acts.className = 'puzzle-actions';
    var dl = document.createElement('button');
    dl.textContent = 'Baixar recado.txt';
    dl.addEventListener('click', function () {
      RW.SaveSystem.exportBlob('recado.txt', recadoText);
      RW.UI.caption('recado.txt exportado pelo navegador.');
    });
    var close = document.createElement('button');
    close.textContent = 'Ficar mais um pouco';
    close.addEventListener('click', function () { RW.UI.closePanel(); });
    acts.appendChild(dl); acts.appendChild(close);
    wrap.appendChild(h); wrap.appendChild(p); wrap.appendChild(pre); wrap.appendChild(acts);
    st.terminal = false;
    if (RW.Portal) RW.Portal.report('rewind', 'REWIND — final B (' + st.endingVariation + ')');
    RW.SaveSystem.save('current', st).then(function () {
      RW.UI.updateTitle(st);
      E.busy = false;
      RW.UI.openPanel(wrap);
    });
  }

  // ---------------- TELA TERMINAL -------------------------------------------------
  function showTerminalScreen(ending) {
    var stage = document.getElementById('stage');
    if (!stage) return;
    var t = document.createElement('div');
    t.className = 'terminal-screen';
    var label = ending === 'A'
      ? 'A máquina foi consertada. Esta história terminou.'
      : 'Você parou. O recado ficou.';
    t.innerHTML = '<p class="terminal-line">' + label + '</p>' +
      '<p class="terminal-sub">Abrir de novo apresenta o desktop fictício — o quarto não volta.</p>';
    stage.appendChild(t);
  }

  function terminalBoot(cb) {
    var fx = document.getElementById('rewindfx');
    var desktop = fx ? fx.querySelector('.fake-desktop') : null;
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      if (desktop) desktop.classList.remove('visible');
      if (fx) fx.classList.add('hidden');
      if (cb) cb();
    };
    if (fx && desktop) {
      fx.classList.remove('hidden');
      desktop.classList.add('visible');
      // 8 segundos com a nota tocando
      try { RW.Audio.playNote(true, null); } catch (e) { /* áudio bloqueado sem interação */ }
      var clock = desktop.querySelector('.fake-clock');
      if (clock) {
        var tick = setInterval(function () {
          clock.textContent = new Date().toLocaleTimeString();
        }, 1000);
        setTimeout(function () { clearInterval(tick); }, 8200);
      }
      setTimeout(finish, 8000);
      desktop.addEventListener('click', finish);
    } else finish();
  }

  RW.Endings = {
    openChoice: openChoice,
    runA: runA,
    runB: runB,
    computeVariation: computeVariation,
    computeSecrets: computeSecrets,
    epilogueMods: epilogueMods,
    corePuzzlesDone: corePuzzlesDone,
    finalChoiceAvailable: finalChoiceAvailable,
    terminalBoot: terminalBoot,
    isBusy: function () { return E.busy; }
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { computeVariation: computeVariation, computeSecrets: computeSecrets, corePuzzlesDone: corePuzzlesDone, finalChoiceAvailable: finalChoiceAvailable, epilogueMods: epilogueMods };
  }
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
