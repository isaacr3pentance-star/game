/* DialogManager — fila, texto caractere a caractere, tons, histórico, micro-perdas. */
(function (RW) {
  'use strict';

  var D = {
    queue: [],
    current: null,
    currentCb: null,
    charIndex: 0,
    timer: null,
    history: [],
    el: null, textEl: null, nameEl: null, historyEl: null,
    open: false
  };

  var SPEEDS = [42, 28, 18, 10, 4]; // ms por caractere (prefs.textSpeed 0..4)

  function init(els) {
    D.el = els.box; D.textEl = els.text; D.nameEl = els.name; D.historyEl = els.history;
    if (D.el) {
      var btn = D.el.querySelector('.dlg-continue');
      if (btn) btn.addEventListener('click', next);
      D.el.addEventListener('click', function (e) {
        if (e.target === D.el || e.target === D.textEl || e.target === D.nameEl) next();
      });
    }
  }

  function speed() {
    var p = RW.state && RW.state.prefs ? RW.state.prefs.textSpeed : 2;
    return SPEEDS[Math.max(0, Math.min(4, p | 0))];
  }

  function say(entry, onDone) {
    if (!entry) return;
    if (typeof entry === 'string') entry = { who: 'vela', text: entry };
    D.queue.push({ entry: entry, onDone: onDone || null });
    if (!D.current && !D.timer) next();
  }

  function sayMany(list, onDone) {
    if (!list || !list.length) { if (onDone) onDone(); return; }
    var i = 0;
    function chain() {
      if (i >= list.length) { if (onDone) onDone(); return; }
      say(list[i], function () { i++; chain(); });
    }
    chain();
  }

  function next() {
    if (D.timer) { clearTimeout(D.timer); D.timer = null; }
    if (D.current && D.charIndex < D.current.text.length) {
      // primeira batida fecha o texto de uma vez
      D.charIndex = D.current.text.length;
      renderFull();
      return;
    }
    if (D.current) {
      D.history.push(D.current);
      if (D.history.length > 60) D.history.shift();
      var cb = D.currentCb;
      D.current = null;
      D.currentCb = null;
      if (cb) {
        cb();
        // se o encadeamento não trouxe nova fala, fecha
        if (!D.current && D.queue.length === 0) close();
        return;
      }
    }
    var item = D.queue.shift();
    if (!item) {
      close();
      return;
    }
    D.current = item.entry;
    D.currentCb = item.onDone || null;
    D.open = true;
    if (D.el) D.el.classList.remove('hidden');
    if (D.nameEl) {
      D.nameEl.textContent = D.current.who === 'vela' ? 'VELA' : 'O QUARTO';
      D.nameEl.classList.toggle('room', D.current.who !== 'vela');
    }
    if (D.current.tone) D.el.setAttribute('data-tone', D.current.tone);
    else D.el.removeAttribute('data-tone');
    type();
  }

  function type() {
    if (!D.current) return;
    var full = D.current.text;
    D.charIndex += 1;
    if (D.textEl) D.textEl.textContent = microLossTransform(full.slice(0, D.charIndex));
    if (D.charIndex < full.length) {
      var ms = speed();
      // pausas naturais em pontuação
      var ch = full[D.charIndex - 1];
      if (ch === '.' || ch === '…') ms += speed() * 4;
      else if (ch === ',' || ch === ';') ms += speed() * 2;
      D.timer = setTimeout(type, ms);
    } else {
      D.timer = null;
    }
  }

  function renderFull() {
    if (D.textEl && D.current) D.textEl.textContent = microLossTransform(D.current.text);
    D.timer = null;
  }

  // Micro-perdas: após as 9 lembranças, palavras são apagadas das falas de forma
  // determinística conforme microLosses cresce.
  function microLossTransform(text) {
    var state = RW.state;
    if (!state || state.microLosses <= 0 || !text) return text;
    var idx = (state.microLosses * 37) % Math.max(1, text.split(' ').length);
    var words = text.split(' ');
    if (words.length > 3 && words[idx] && words[idx].length > 2) {
      words[idx] = words[idx].replace(/[aeiou]/, '–');
    }
    return words.join(' ');
  }

  function skip() {
    if (!D.current) return;
    if (D.charIndex < D.current.text.length) {
      renderFull();
    } else {
      next();
    }
  }

  function close() {
    // Fechamento externo (rebobinada durante digitação): o checkpoint vai
    // re-exibir a cadeia inteira, então fila, timer e callback em curso são
    // descartados de forma determinística (AUD-02). Fala corrente descartada
    // sem ser lida conta como ignorada para o contador de atenção (AUD-04).
    if (D.current) onDialogClosedEarly();
    if (D.timer) { clearTimeout(D.timer); D.timer = null; }
    D.queue.length = 0;
    D.current = null;
    D.currentCb = null;
    D.charIndex = 0;
    D.open = false;
    if (D.el) D.el.classList.add('hidden');
  }

  function isOpen() { return D.open; }

  function showHistory() {
    if (!D.historyEl) return;
    var html = '';
    D.history.slice(-40).forEach(function (h) {
      html += '<p><strong>' + (h.who === 'vela' ? 'Vela' : 'Quarto') + ':</strong> ' + h.text + '</p>';
    });
    D.historyEl.innerHTML = html || '<p>Sem conversas ainda.</p>';
  }

  // Contador de atenção: fecha diálogo sem ler = ignorado.
  function onDialogClosedEarly() {
    if (RW.state && RW.state.behavior) RW.state.behavior.ignored += 1;
  }

  RW.Dialogs = {
    init: init,
    say: say,
    sayMany: sayMany,
    next: next,
    skip: skip,
    close: close,
    isOpen: isOpen,
    showHistory: showHistory,
    onDialogClosedEarly: onDialogClosedEarly,
    microLossTransform: microLossTransform,
    isTyping: function () { return D.timer !== null; }
  };
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
