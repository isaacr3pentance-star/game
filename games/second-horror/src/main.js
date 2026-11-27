/* main — boot de LINHA MORTA: save, painel, terminal, desbloqueio de áudio,
   quadro de bilhetes e gaveta de indícios. */
(function (LM) {
  'use strict';

  function boot() {
    LM.UI.init();
    LM.Terminal.init('terminal');
    LM.Board.init('board', 'tray', 'terminal');
    LM.UI.bindCaptions();
    bindAudioUnlock();
    showSplash();

    LM.SaveSystem.load('current').then(function (saved) {
      var state = LM.State.validate(saved) || LM.State.defaults();
      LM.state = state;
      state.meta.sessions = (state.meta.sessions || 0) + 1;
      LM.Audio.setPrefs(state.prefs);

      // finais persistentes reabrem na tela do final
      if (state.terminal && state.ending) {
        LM.UI.setNightBadge(state.night);
        LM.Endings.runEnding(state.ending);
        return;
      }

      LM.UI.setNightBadge(state.night);
      bindSideFurniture();
      LM.Night.startNight(state.night);
      LM.SaveSystem.save('current', state);
      setInterval(function () {
        if (LM.state && !LM.state.terminal) LM.SaveSystem.save('current', LM.state);
      }, 20000);
    });
  }

  // desbloqueio do áudio na primeira interação
  function bindAudioUnlock() {
    var done = false;
    var unlock = function () {
      if (done) return;
      done = true;
      LM.Audio.unlock(LM.state ? LM.state.prefs : {}, function (t) {
        if (LM.state && LM.state.prefs && LM.state.prefs.captions) LM.UI.caption(t);
      });
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
  }

  // splash com a arte gerada da central
  function showSplash() {
    if (!LM.Embedded || !LM.Embedded.splash) return;
    var stage = document.getElementById('stage');
    if (!stage) return;
    var sp = document.createElement('div');
    sp.className = 'splash';
    sp.style.backgroundImage = 'url(' + LM.Embedded.splash + ')';
    stage.appendChild(sp);
    setTimeout(function () {
      sp.classList.add('fade');
      setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 900);
    }, 1500);
  }

  // quadro de bilhetes (bilhete rasgado da Ivone) e fichas antigas
  function bindSideFurniture() {
    var quadro = document.getElementById('btn-quadro');
    if (quadro) quadro.addEventListener('click', function () {
      LM.Audio.relay(0.06);
      if (LM.State.hasFact(LM.state, 'bilhete')) {
        LM.Terminal.push({ who: 'manual', text: 'O bilhete rasgado continua no quadro: "...se eu não der o ponto hoje, ela vai..." — letra da Ivone. Já lido, ainda incômodo.' });
      } else {
        LM.State.addFact(LM.state, 'bilhete');
        LM.Terminal.push({ who: 'manual', text: 'Metade de um bilhete, rasgado de propósito: "...se eu não der o ponto hoje, ela vai..." — a letra é da Ivone. O resto foi levado com o papel.' });
        LM.SaveSystem.save('current', LM.state);
      }
    });
    var bandeja = document.getElementById('btn-bandeja');
    if (bandeja) bandeja.addEventListener('click', function () {
      if (LM.state.night < 3) {
        LM.Terminal.push({ who: 'manual', text: 'A bandeja de fichas antigas está empoeirada e presa por uma cunha de madeira. O armário do registrador, ali ao lado, também.' });
        return;
      }
      if (LM.State.hasFact(LM.state, 'ficha')) {
        LM.Terminal.push({ who: 'manual', text: 'A ficha amarela da Ivone segue na bandeja: ramal B6, cor amarela — a única amarela do inventário.' });
        return;
      }
      LM.State.addFact(LM.state, 'ficha');
      LM.Terminal.push({ who: 'manual', text: 'Na bandeja de fichas antigas, uma ficha amarela isolada: ramal B6, cor amarela — a única amarela do inventário. No verso, dois pontos de dedo Gordos de tinta violeta.' });
      LM.SaveSystem.save('current', LM.state);
    });
    var caderno = document.getElementById('btn-caderno');
    if (caderno) caderno.addEventListener('click', function () {
      var st = LM.state;
      if (!LM.State.hasFact(st, 'caderno')) {
        LM.Terminal.push({ who: 'manual', text: 'A gaveta do registrador está travada por quatro fichas de cor. Noite 3 em diante, o armário pode ser aberto com a ordem certa.' });
        return;
      }
      var clues = LM.Data.ivoneClues;
      LM.Terminal.push({ who: 'ivone', text: clues.caderno.text });
      if (LM.State.hasFact(st, 'fita')) LM.Terminal.push({ who: 'ivone', text: clues.fita.text });
      if (LM.State.hasFact(st, 'relé')) LM.Terminal.push({ who: 'manual', text: clues.relé.text });
    });
    var apito = document.getElementById('btn-apito');
    if (apito) apito.addEventListener('click', function () {
      LM.Board.openToneTest();
    });
  }

  LM.Game = { boot: boot };
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', boot);
  }
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
