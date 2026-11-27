/* RewindManager — a rebobinada pelo X falso.
   Sequência: validar → registrar origem → preservar → efeitos (flash, desktop 200ms)
   → restaurar temporal → perda permanente → retrato/cenário/dessaturação → persistir. */
(function (RW) {
  'use strict';

  var R = {
    busy: false,
    hooks: {},
    origin: null
  };

  function registerHooks(h) {
    R.hooks = h || {};
  }

  function allowed(state) {
    if (R.busy) return { ok: false, reason: 'busy' };
    if (state.terminal) return { ok: false, reason: 'terminal' };
    if (state.ending) return { ok: false, reason: 'ended' };
    if (R.hooks.blocked && R.hooks.blocked()) return { ok: false, reason: 'blocked' };
    if (!state.prologueDone) return { ok: false, reason: 'prologue' };
    return { ok: true };
  }

  // Toda a sequência da rebobinada. Retorna a perda aplicada (ou null).
  function perform(origin) {
    var State = RW.State;
    var state = RW.state;
    var check = allowed(state);
    if (!check.ok) return Promise.resolve(null);
    R.busy = true;
    R.origin = origin;
    var reduceFx = state.prefs.reduceFlashes;

    // restaura a linha temporal do último checkpoint narrativo (não do instante do clique)
    var pre = (state.checkpoint && Object.keys(state.checkpoint).length)
      ? state.checkpoint
      : State.snapshotTemporal(state);

    if (R.hooks.onBegin) R.hooks.onBegin(origin);

    var fx = R.hooks.fx ? R.hooks.fx : defaultFx;

    return fx(reduceFx).then(function () {
      var loss = State.applyLoss(state, origin);
      State.restoreTemporal(state, pre);
      if (R.hooks.afterLoss) R.hooks.afterLoss(loss, origin);
      return RW.SaveSystem.save('current', state).then(function () {
        R.busy = false;
        if (R.hooks.onEnd) R.hooks.onEnd(loss, origin);
        return loss;
      });
    }).catch(function () {
      R.busy = false;
      return null;
    });
  }

  function defaultFx(reduceFlashes) {
    return new Promise(function (resolve) {
      var el = document.getElementById('rewindfx');
      if (!el) { setTimeout(resolve, 250); return; }
      el.classList.remove('hidden');
      el.classList.toggle('gentle', !!reduceFlashes);
      var desktop = el.querySelector('.fake-desktop');
      if (desktop) desktop.classList.add('visible');
      setTimeout(function () {
        if (desktop) desktop.classList.remove('visible');
        el.classList.add('hidden');
        resolve(true);
      }, reduceFlashes ? 320 : (250 + 200));
    });
  }

  function isBusy() { return R.busy; }

  RW.Rewind = {
    perform: perform,
    registerHooks: registerHooks,
    allowed: allowed,
    isBusy: isBusy
  };
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
