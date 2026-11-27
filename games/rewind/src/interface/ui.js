/* Interface — cromo da janela do jogo, X falso, painéis, legendas, configurações,
   histórico de conversas, desktop fictício, modo de desenvolvimento interno (?dev=1). */
(function (RW) {
  'use strict';

  var U = {
    titleEl: null, xBtn: null, panelEl: null, captionEl: null,
    settingsEl: null, historyEl: null, devEl: null, devOn: false
  };

  function qs(sel) { return document.querySelector(sel); }

  function init() {
    U.titleEl = qs('#win-title');
    U.xBtn = qs('#fake-x');
    U.panelEl = qs('#panel');
    U.captionEl = qs('#caption');
    U.settingsEl = qs('#settings-modal');
    U.historyEl = qs('#history-modal');
    U.devEl = qs('#dev-panel');

    if (U.xBtn) {
      U.xBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        RW.Audio.clickSound();
        var st = RW.state;
        if (st && st.act >= 4 && !st.ending) { RW.Endings.openChoice(); return; }
        RW.Rewind.perform('own');
      });
      U.xBtn.addEventListener('mouseenter', function () {
        if (RW.state && RW.state.twist) U.xBtn.classList.add('pulse');
      });
      U.xBtn.addEventListener('mouseleave', function () {
        U.xBtn.classList.remove('pulse');
      });
    }

    var btnSettings = qs('#btn-settings');
    if (btnSettings) btnSettings.addEventListener('click', openSettings);
    var btnHistory = qs('#btn-history');
    if (btnHistory) btnHistory.addEventListener('click', openHistory);
    var btnTalk = qs('#btn-talk');
    if (btnTalk) btnTalk.addEventListener('click', function () { RW.Game.talk(); });
    var btnMute = qs('#btn-mute');
    if (btnMute) btnMute.addEventListener('click', function () {
      RW.Audio.setMuted(!RW.Audio.mutedFlag);
      btnMute.textContent = RW.Audio.mutedFlag ? 'som: off' : 'som: on';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (U.panelEl && !U.panelEl.classList.contains('hidden')) closePanel();
        else if (U.settingsEl && !U.settingsEl.classList.contains('hidden')) U.settingsEl.classList.add('hidden');
        else if (U.historyEl && !U.historyEl.classList.contains('hidden')) U.historyEl.classList.add('hidden');
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (RW.Dialogs.isOpen() && e.target === document.body) { e.preventDefault(); RW.Dialogs.next(); }
      }
    });
    U.devOn = /(?:\?|&)dev=1/.test(location.search);
    if (U.devOn && U.devEl) { U.devEl.classList.remove('hidden'); buildDev(); }
  }

  function setTitle(t) {
    if (U.titleEl) U.titleEl.textContent = t;
    try { document.title = t; } catch (e) { /* contexto de teste */ }
  }

  function openPanel(node, onClose) {
    if (!U.panelEl) return;
    U.panelEl.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'panel-card';
    var close = document.createElement('button');
    close.className = 'panel-close';
    close.textContent = '×';
    close.addEventListener('click', function () { closePanel(onClose); });
    card.appendChild(close);
    card.appendChild(node);
    U.panelEl.appendChild(card);
    U.panelEl.classList.remove('hidden');
    U.panelOnClose = onClose || null;
  }

  function closePanel(noCb) {
    if (!U.panelEl) return;
    U.panelEl.classList.add('hidden');
    U.panelEl.innerHTML = '';
    var cb = U.panelOnClose;
    U.panelOnClose = null;
    if (cb && !noCb) cb();
  }

  function caption(text) {
    if (!U.captionEl) return;
    if (!text) { U.captionEl.classList.add('hidden'); return; }
    U.captionEl.textContent = text;
    U.captionEl.classList.remove('hidden');
    clearTimeout(U._capT);
    U._capT = setTimeout(function () { U.captionEl.classList.add('hidden'); }, 7000);
  }

  function openSettings() {
    if (!U.settingsEl) return;
    var p = RW.state.prefs;
    U.settingsEl.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'settings-card';
    card.innerHTML = '<h3>Configurações</h3>';
    var mkRange = function (label, key, min, max, step) {
      var row = document.createElement('div');
      row.className = 'set-row';
      var lab = document.createElement('span'); lab.textContent = label;
      var rng = document.createElement('input');
      rng.type = 'range'; rng.min = String(min); rng.max = String(max); rng.step = String(step);
      rng.value = String(p[key]);
      rng.addEventListener('input', function () {
        p[key] = parseFloat(rng.value);
        RW.Audio.setPrefs(p);
        RW.SaveSystem.save('current', RW.state);
      });
      row.appendChild(lab); row.appendChild(rng);
      card.appendChild(row);
    };
    mkRange('Volume geral', 'volumeMaster', 0, 1, 0.05);
    mkRange('Volume ambiente', 'volumeAmbient', 0, 1, 0.05);
    mkRange('Volume do rádio', 'volumeRadio', 0, 1, 0.05);
    mkRange('Velocidade do texto', 'textSpeed', 0, 4, 1);
    var mkToggle = function (label, key) {
      var row = document.createElement('div');
      row.className = 'set-row';
      var lab = document.createElement('span'); lab.textContent = label;
      var chk = document.createElement('input');
      chk.type = 'checkbox'; chk.checked = !!p[key];
      chk.addEventListener('change', function () {
        p[key] = chk.checked;
        RW.SaveSystem.save('current', RW.state);
        if (key === 'reduceShake') applyShakePref();
      });
      row.appendChild(lab); row.appendChild(chk);
      card.appendChild(row);
    };
    mkToggle('Reduzir flashes', 'reduceFlashes');
    mkToggle('Reduzir tremores', 'reduceShake');
    mkToggle('Legendas de som', 'captions');
    var note = document.createElement('p');
    note.className = 'settings-note';
    note.textContent = 'Não há botão de sair. Aqui se sai pelo que se escolhe.';
    card.appendChild(note);
    var btnClose = document.createElement('button');
    btnClose.textContent = 'Fechar';
    btnClose.addEventListener('click', function () { U.settingsEl.classList.add('hidden'); });
    card.appendChild(btnClose);
    U.settingsEl.appendChild(card);
    U.settingsEl.classList.remove('hidden');
  }

  function openHistory() {
    if (!U.historyEl) return;
    RW.Dialogs.showHistory();
    U.historyEl.classList.remove('hidden');
    var btn = document.createElement('button');
    btn.textContent = 'Fechar';
    btn.addEventListener('click', function () { U.historyEl.classList.add('hidden'); });
    U.historyEl.appendChild(btn);
  }

  function applyShakePref() {
    var body = document.body;
    if (RW.state.prefs.reduceShake) body.classList.add('no-shake');
    else body.classList.remove('no-shake');
  }

  function applyDesaturation(level) {
    var wrap = qs('#stage');
    if (wrap) wrap.style.filter = 'saturate(' + level + ')';
  }

  function updateTitle(state) {
    var base = 'REWIND // REWIND';
    if (state.twist) base = base + ' // 2';
    if (state.ending === 'A') base = base + ' — máquina consertada';
    if (state.ending === 'B') base = base + ' — sessão encerrada';
    setTitle(base);
  }

  // legendas de som (acessibilidade): passa callback para o AudioManager
  function bindCaptions() {
    RW.Audio.captionFn = function (text) {
      if (RW.state && RW.state.prefs && RW.state.prefs.captions) caption(text);
    };
  }

  // ---------------- MODO DE DESENVOLVIMENTO (oculto no público) ----------------
  function buildDev() {
    var p = U.devEl;
    p.innerHTML = '<h3>Modo de desenvolvimento (interno)</h3>';
    var mk = function (label, fn) {
      var b = document.createElement('button');
      b.textContent = label;
      b.addEventListener('click', fn);
      p.appendChild(b);
    };
    mk('Ato 1', function () { RW.state.act = 1; RW.Game.beat('act'); });
    mk('Ato 2', function () { RW.state.act = 2; RW.Game.beat('act'); });
    mk('Ato 3 (twist)', function () { RW.Game.forceTwist(); });
    mk('Ato 4', function () { RW.state.act = 4; RW.Game.beat('act'); });
    mk('+1 rebobinada própria (simulada)', function () {
      RW.Rewind.perform('own');
    });
    mk('Capturar rádio', function () {
      RW.state.radioDial = 92.7; RW.PuzzleLogic.applyRadioCapture(RW.state);
      RW.SaveSystem.save('current', RW.state); caption('rádio capturado (dev)');
    });
    mk('Resolver retrato', function () {
      RW.state.portraitPieces = 5; RW.state.portraitFlipped = true; RW.state.chamberKey = true;
      RW.Room.refreshOverlays(); RW.SaveSystem.save('current', RW.state);
    });
    mk('Resolver calendário', function () { RW.state.calendarSolved = true; RW.state.drawerOpened = true; RW.SaveSystem.save('current', RW.state); });
    mk('Resolver fósforos', function () { RW.state.matchesSolved = true; RW.state.flags.exteriorUnlocked = true; RW.SaveSystem.save('current', RW.state); });
    mk('Resolver engrenagens', function () { RW.state.gearsSolved = true; RW.state.flags.luzUnlocked = true; RW.SaveSystem.save('current', RW.state); });
    mk('Resolver reflexos', function () { RW.state.mirrorAngles = [45, 135, 180]; RW.state.mirrorsSolved = true; RW.SaveSystem.save('current', RW.state); });
    mk('Ir: escadaria', function () { RW.Room.goto('escadaria'); });
    mk('Ir: manutenção', function () { RW.Room.goto('manutencao'); });
    mk('Ir: luz', function () { RW.Room.goto('luz'); });
    mk('Ir: exterior', function () { RW.Room.goto('exterior'); });
    mk('Final A', function () { RW.Endings.runA(); });
    mk('Final B', function () { RW.Endings.runB(); });
    mk('Vela rebobina (simulada)', function () { RW.Game.velaAutoRewind(true); });
  }

  RW.UI = {
    init: init,
    setTitle: setTitle,
    updateTitle: updateTitle,
    openPanel: openPanel,
    closePanel: closePanel,
    caption: caption,
    openSettings: openSettings,
    applyDesaturation: applyDesaturation,
    applyShakePref: applyShakePref,
    bindCaptions: bindCaptions,
    isDev: function () { return U.devOn; }
  };

  // Carimbo de progresso para o portal (o portal só lê; nunca altera o jogo).
  RW.Portal = {
    report: function (game, label) {
      try {
        localStorage.setItem('portal_progress_' + game, JSON.stringify({ ts: Date.now(), label: label }));
      } catch (e) { /* contingência */ }
    }
  };
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
