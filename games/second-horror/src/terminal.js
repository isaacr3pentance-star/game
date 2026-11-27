/* Terminal — registro de texto com máquina de escrever, tons por autor,
   quadro de bilhetes, gaveta de indícios. */
(function (LM) {
  'use strict';

  var T = { el: null, queue: [], current: null, charIndex: 0, timer: null, history: [], SPEEDS: [42, 28, 18, 10, 4] };

  function init(elId) {
    T.el = document.getElementById(elId);
    if (T.el) {
      var btn = T.el.querySelector('.term-next');
      if (btn) btn.addEventListener('click', next);
    }
  }

  function speed() {
    var p = LM.state && LM.state.prefs ? LM.state.prefs.textSpeed : 2;
    return T.SPEEDS[Math.max(0, Math.min(4, p | 0))];
  }

  function push(entry, onDone) {
    if (typeof entry === 'string') entry = { who: 'manual', text: entry };
    T.queue.push({ entry: entry, onDone: onDone || null });
    if (!T.current && !T.timer) next();
  }

  function pushMany(list, onDone) {
    if (!list || !list.length) { if (onDone) onDone(); return; }
    var i = 0;
    (function chain() {
      if (i >= list.length) { if (onDone) onDone(); return; }
      push(list[i], function () { i++; chain(); });
    })();
  }

  function next() {
    if (T.timer) { clearTimeout(T.timer); T.timer = null; }
    if (T.current && T.charIndex < T.current.text.length) {
      T.charIndex = T.current.text.length;
      render();
      return;
    }
    if (T.current) {
      T.history.push(T.current);
      var cb = T.currentCb;
      T.current = null; T.currentCb = null;
      if (cb) {
        cb();
        if (!T.current && T.queue.length === 0) hide();
        return;
      }
    }
    var item = T.queue.shift();
    if (!item) { hide(); return; }
    T.current = item.entry;
    T.currentCb = item.onDone;
    T.charIndex = 0;
    show();
    type();
  }

  function show() {
    if (!T.el) return;
    T.el.classList.remove('hidden');
    var who = T.el.querySelector('.term-who');
    if (who) {
      var names = { manual: 'MANUAL', ferreira: 'FERREIRA', ivone: 'IVONE', linha: 'A LINHA', player: 'VOCÊ' };
      who.textContent = names[T.current.who] || 'MANUAL';
      who.setAttribute('data-who', T.current.who);
    }
  }

  function hide() {
    if (T.el) T.el.classList.add('hidden');
  }

  function render() {
    if (T.el && T.current) T.el.querySelector('.term-text').textContent = T.current.text;
  }

  function type() {
    if (!T.current) return;
    var full = T.current.text;
    T.charIndex += 1;
    if (T.el) T.el.querySelector('.term-text').textContent = full.slice(0, T.charIndex);
    if (T.charIndex < full.length) {
      var ms = speed();
      var ch = full[T.charIndex - 1];
      if (ch === '.' || ch === '…') ms += speed() * 4;
      else if (ch === ',' || ch === ';') ms += speed() * 2;
      T.timer = setTimeout(type, ms);
    } else T.timer = null;
  }

  function isOpen() { return !!T.current || T.queue.length > 0; }

  LM.Terminal = { init: init, push: push, pushMany: pushMany, next: next, isOpen: isOpen };
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
