/* Interface de LINHA MORTA — painéis, escolhas, badge do turno, configurações,
   legendas, tela de final, integração com o portal. */
(function (LM) {
  'use strict';

  var U = { panelEl: null, choicesEl: null, badgeEl: null, settingsEl: null, captionEl: null };

  function qs(s) { return document.querySelector(s); }

  function init() {
    U.panelEl = qs('#panel');
    U.choicesEl = qs('#choices');
    U.badgeEl = qs('#night-badge');
    U.settingsEl = qs('#settings-modal');
    U.captionEl = qs('#caption');
    var btnSettings = qs('#btn-settings');
    if (btnSettings) btnSettings.addEventListener('click', openSettings);
    var btnMute = qs('#btn-mute');
    if (btnMute) btnMute.addEventListener('click', function () {
      LM.Audio.setPrefs(Object.assign({}, LM.state.prefs, { volumeMaster: LM.state.prefs.volumeMaster > 0 ? 0 : 0.8 }));
      LM.state.prefs.volumeMaster = LM.state.prefs.volumeMaster > 0 ? 0 : 0.8;
      btnMute.textContent = LM.state.prefs.volumeMaster === 0 ? 'som: off' : 'som: on';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && U.panelEl) {
        if (!U.panelEl.classList.contains('hidden')) closePanel();
        else if (U.settingsEl) U.settingsEl.classList.add('hidden');
      }
      if ((e.key === 'Enter' || e.key === ' ') && LM.Terminal.isOpen() && e.target === document.body) {
        e.preventDefault();
        LM.Terminal.next();
      }
    });
  }

  function setNightBadge(n) {
    if (U.badgeEl) U.badgeEl.textContent = 'TURNO ' + n + '/5 — CENTRAL RIACHUELO 4';
  }

  function caption(text) {
    if (!U.captionEl) return;
    if (!text) { U.captionEl.classList.add('hidden'); return; }
    U.captionEl.textContent = text;
    U.captionEl.classList.remove('hidden');
    clearTimeout(U._capT);
    U._capT = setTimeout(function () { U.captionEl.classList.add('hidden'); }, 6000);
  }

  function openPanel(node) {
    if (!U.panelEl) return;
    U.panelEl.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'panel-card';
    var close = document.createElement('button');
    close.className = 'panel-close';
    close.textContent = '×';
    close.addEventListener('click', closePanel);
    card.appendChild(close);
    card.appendChild(node);
    U.panelEl.appendChild(card);
    U.panelEl.classList.remove('hidden');
  }

  function closePanel() {
    if (U.panelEl) {
      U.panelEl.classList.add('hidden');
      U.panelEl.innerHTML = '';
    }
  }

  function showChoices(options, onPick) {
    if (!U.choicesEl) return;
    U.choicesEl.innerHTML = '';
    options.forEach(function (o) {
      var b = document.createElement('button');
      b.textContent = o.label;
      b.addEventListener('click', function () {
        U.choicesEl.classList.add('hidden');
        U.choicesEl.innerHTML = '';
        onPick(o);
      });
      U.choicesEl.appendChild(b);
    });
    U.choicesEl.classList.remove('hidden');
  }

  function showAdvance(label, onGo) {
    if (!U.choicesEl) return;
    U.choicesEl.innerHTML = '';
    var b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', function () {
      U.choicesEl.classList.add('hidden');
      U.choicesEl.innerHTML = '';
      onGo();
    });
    U.choicesEl.appendChild(b);
    U.choicesEl.classList.remove('hidden');
  }

  function showEndingScreen(id, st) {
    var wrap = document.createElement('div');
    wrap.className = 'ending-choice';
    var txt = LM.Data.endingsText[id];
    var h = document.createElement('h3');
    h.textContent = txt.title;
    var p = document.createElement('p');
    p.textContent = 'Fim registrado no livro da Central Riachuelo 4. Feche a aba quando quiser — a central guarda.';
    var acts = document.createElement('div');
    acts.className = 'puzzle-actions';
    var again = document.createElement('button');
    again.textContent = 'Recomeçar a substituição';
    again.addEventListener('click', function () {
      LM.SaveSystem.wipeAll().then(function () { location.reload(); });
    });
    acts.appendChild(again);
    wrap.appendChild(h);
    wrap.appendChild(p);
    wrap.appendChild(acts);
    openPanel(wrap);
    try {
      localStorage.setItem('portal_progress_second_horror', JSON.stringify({
        ts: Date.now(),
        label: 'LINHA MORTA — final ' + id
      }));
    } catch (e) { /* contingência */ }
  }

  function openSettings() {
    if (!U.settingsEl) return;
    var p = LM.state.prefs;
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
        LM.Audio.setPrefs(p);
        LM.SaveSystem.save('current', LM.state);
      });
      row.appendChild(lab); row.appendChild(rng);
      card.appendChild(row);
    };
    mkRange('Volume geral', 'volumeMaster', 0, 1, 0.05);
    mkRange('Volume do painel', 'volumeBoard', 0, 1, 0.05);
    mkRange('Volume da linha', 'volumeLine', 0, 1, 0.05);
    mkRange('Velocidade do texto', 'textSpeed', 0, 4, 1);
    var mkToggle = function (label, key) {
      var row = document.createElement('div');
      row.className = 'set-row';
      var lab = document.createElement('span'); lab.textContent = label;
      var chk = document.createElement('input');
      chk.type = 'checkbox'; chk.checked = !!p[key];
      chk.addEventListener('change', function () {
        p[key] = chk.checked;
        LM.SaveSystem.save('current', LM.state);
      });
      row.appendChild(lab); row.appendChild(chk);
      card.appendChild(row);
    };
    mkToggle('Reduzir flashes', 'reduceFlashes');
    mkToggle('Legendas de som', 'captions');
    var btnClose = document.createElement('button');
    btnClose.textContent = 'Fechar';
    btnClose.addEventListener('click', function () { U.settingsEl.classList.add('hidden'); });
    card.appendChild(btnClose);
    U.settingsEl.appendChild(card);
    U.settingsEl.classList.remove('hidden');
  }

  function bindCaptions() {
    LM.Audio.captionFn = function (t) {
      if (LM.state && LM.state.prefs && LM.state.prefs.captions) caption(t);
    };
  }

  // Codinome opcional do turno 5 — exclusivamente ficcional (§6.6). Nunca um
  // nome real: o campo só alimenta a ficha de ponto da bandeja.
  function showCodinomePrompt(onDone) {
    if (!U.choicesEl) { if (onDone) onDone(); return; }
    U.choicesEl.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'codinome-box';
    var p = document.createElement('p');
    p.className = 'codinome-note';
    p.textContent = 'O caderno de ponto aceita um codinome de operadora — ficção sua, nada além. Opcional: pode seguir sem nenhum.';
    var input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 18;
    input.placeholder = 'codinome ficcional (opcional)';
    input.setAttribute('aria-label', 'Codinome ficcional opcional');
    var row = document.createElement('div');
    row.className = 'codinome-actions';
    var ok = document.createElement('button');
    ok.textContent = 'Registrar codinome';
    var skip = document.createElement('button');
    skip.textContent = 'Seguir sem codinome';
    function finish() {
      var v = (input.value || '').trim().slice(0, 18);
      if (LM.state) LM.state.codinome = v || null;
      LM.SaveSystem.save('current', LM.state);
      U.choicesEl.classList.add('hidden');
      U.choicesEl.innerHTML = '';
      if (onDone) onDone();
    }
    ok.addEventListener('click', finish);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); finish(); }
    });
    skip.addEventListener('click', function () {
      U.choicesEl.classList.add('hidden');
      U.choicesEl.innerHTML = '';
      if (onDone) onDone();
    });
    row.appendChild(ok); row.appendChild(skip);
    box.appendChild(p); box.appendChild(input); box.appendChild(row);
    U.choicesEl.appendChild(box);
    U.choicesEl.classList.remove('hidden');
    setTimeout(function () { input.focus(); }, 40);
  }

  LM.UI = {
    init: init,
    setNightBadge: setNightBadge,
    caption: caption,
    openPanel: openPanel,
    closePanel: closePanel,
    showChoices: showChoices,
    showAdvance: showAdvance,
    showCodinomePrompt: showCodinomePrompt,
    showEndingScreen: showEndingScreen,
    openSettings: openSettings,
    bindCaptions: bindCaptions
  };
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
