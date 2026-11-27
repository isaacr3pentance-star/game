/* GameState — estado único, temporal vs. persistente, validação.
   Sem dependências de DOM (executável em Node para testes). */
(function (RW) {
  'use strict';

  var SAVE_VERSION = 3;

  // Chaves restauradas pela rebobinada (linha temporal).
  var TEMPORAL_KEYS = [
    'glassState', 'radioDial', 'radioWindowOpen', 'lampPattern', 'lampCycle',
    'mirrorAngles', 'gearSlots', 'scene', 'sceneEnteredAt', 'doorTrial'
  ];

  function defaults() {
    return {
      version: SAVE_VERSION,
      act: 0,                       // 0 prólogo, 1..4 atos
      scene: 'sala',
      sceneEnteredAt: 0,

      // rebobinadas
      rewindsOwn: 0,
      rewindsVela: 0,
      rewindsTotal: 0,
      lastRewindOrigin: null,
      rewindsThisAct: 0,

      // perdas
      memoriesLost: [],             // ids 'm1'..'m9'
      microLosses: 0,               // perdas menores após as 9
      lostObjects: [],              // ids visuais removidos
      lostLines: [],                // ids de falas removidas

      // puzzles — estado temporal (manipulação) e persistente (resolvido)
      glassState: 'half',           // half | full | empty
      puddle: false,                // vestígio persistente
      puddleShown: false,
      doorUnlocked: false,
      doorTrial: 0,
      radioDial: 87.5,
      radioCapture: 0,              // 0..100
      radioCaptureDone: false,
      radioWindowOpen: false,
      radioHeardCut: false,
      portraitPieces: 0,            // 0..5
      portraitFlipped: false,
      calendarSolved: false,
      drawerOpened: false,
      matchesSolved: false,
      gearsSolved: false,
      gearSlots: [],                // temporal
      mirrorAngles: [],             // temporal
      mirrorsSolved: false,
      machineState: 'broken',       // broken | repaired
      chamberKey: false,

      // áreas
      visited: {},
      stairsUnlocked: false,

      // twist / save antigo
      twist: false,
      twistSeen: false,
      legacyRecordsSeen: 0,

      // narrativa
      prologueDone: false,
      actIntroSeen: {},
      talked: 0,
      examined: {},                 // id -> contador
      eventsSeen: {},               // flag -> 1
      routeFlags: {},               // rota -> true quando engajada
      routeDiscoveries: {},         // rota -> descoberta feita
      choices: [],                  // {id, value, at}
      behavior: {
        talkedWith: false,
        examinedPersonal: false,
        attentive: 0,               // pistas lidas/objetos examinados com calma
        repetitive: 0,              // interações repetidas sem propósito
        ignored: 0                  // falas ignoradas (fechou diálogo sem ler)
      },

      // finais
      ending: null,                 // 'A' | 'B'
      endingVariation: null,        // 'A1'..'B3'
      endingSecrets: [],            // 'radio'|'legacy'
      terminal: false,

      // preferências (persistem sempre)
      prefs: {
        volumeMaster: 0.8, volumeAmbient: 0.7, volumeRadio: 0.8,
        textSpeed: 2, reduceFlashes: false, reduceShake: false, captions: true
      },

      meta: { createdAt: 0, updatedAt: 0, sessions: 0 },
      checkpoint: {} // estado temporal do último batimento narrativo
    };
  }

  function validId(id) {
    return typeof id === 'string' && /^m[1-9]$/.test(id);
  }

  function validate(s) {
    if (!s || typeof s !== 'object') return null;
    var d = defaults();
    var out = d;
    var k, i;
    for (k in d) {
      if (Object.prototype.hasOwnProperty.call(s, k) && s[k] !== undefined) {
        if (k === 'prefs' && s.prefs && typeof s.prefs === 'object') {
          for (i in d.prefs) {
            if (Object.prototype.hasOwnProperty.call(s.prefs, i)) out.prefs[i] = s.prefs[i];
          }
        } else if (k === 'behavior' && s.behavior && typeof s.behavior === 'object') {
          for (i in d.behavior) {
            if (Object.prototype.hasOwnProperty.call(s.behavior, i)) out.behavior[i] = s.behavior[i];
          }
        } else if (k === 'meta' && s.meta && typeof s.meta === 'object') {
          for (i in d.meta) {
            if (Object.prototype.hasOwnProperty.call(s.meta, i)) out.meta[i] = s.meta[i];
          }
        } else {
          out[k] = s[k];
        }
      }
    }
    out.version = SAVE_VERSION;
    if (!Array.isArray(out.memoriesLost)) out.memoriesLost = [];
    out.memoriesLost = out.memoriesLost.filter(validId);
    ['lostObjects', 'lostLines', 'endingSecrets', 'choices'].forEach(function (key) {
      if (!Array.isArray(out[key])) out[key] = [];
    });
    if (typeof out.rewindsOwn !== 'number' || out.rewindsOwn < 0) out.rewindsOwn = 0;
    if (typeof out.rewindsVela !== 'number' || out.rewindsVela < 0) out.rewindsVela = 0;
    if (typeof out.rewindsTotal !== 'number' || out.rewindsTotal < 0) out.rewindsTotal = out.rewindsOwn + out.rewindsVela;
    if (out.portraitPieces < 0 || out.portraitPieces > 5) out.portraitPieces = Math.max(0, Math.min(5, out.portraitPieces | 0));
    if (out.radioCapture < 0 || out.radioCapture > 100) out.radioCapture = Math.max(0, Math.min(100, out.radioCapture | 0));
    if (['half', 'full', 'empty'].indexOf(out.glassState) < 0) out.glassState = 'half';
    if (['broken', 'repaired'].indexOf(out.machineState) < 0) out.machineState = 'broken';
    if (out.act < 0 || out.act > 4) out.act = 0;
    if (out.ending !== 'A' && out.ending !== 'B') { out.ending = null; out.endingVariation = null; }
    if (out.terminal) { out.ending = out.ending || 'A'; }
    return out;
  }

  function serialize(s) {
    return JSON.stringify(s);
  }

  function deserialize(str) {
    try {
      return validate(JSON.parse(str));
    } catch (e) {
      return null;
    }
  }

  // ---- perdas determinísticas ------------------------------------------------
  var LOSS_ORDER = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'];
  // Objeto ambiental perdido junto de cada lembrança.
  var LOSS_OBJECTS = {
    m1: 'copo_reserva', m2: 'retrato_nome', m3: 'bilhete_navio', m4: 'estacao_musica',
    m5: 'pagina_central', m6: 'espelho_claro', m7: 'chuva_janela', m8: 'moldura_promessa', m9: 'luz_flicker'
  };

  function nextLossId(state) {
    // número de perdas já aplicadas = rewindsTotal (próprias + de Vela)
    if (state.rewindsTotal < LOSS_ORDER.length) return LOSS_ORDER[state.rewindsTotal];
    return null; // depois da 9ª: micro-perdas
  }

  function applyLoss(state, origin) {
    var loss = { memory: null, object: null, micro: false };
    var id = nextLossId(state);
    if (id && state.memoriesLost.indexOf(id) < 0) {
      state.memoriesLost.push(id);
      loss.memory = id;
      var obj = LOSS_OBJECTS[id];
      if (obj && state.lostObjects.indexOf(obj) < 0) state.lostObjects.push(obj);
      loss.object = obj;
    } else {
      state.microLosses += 1;
      loss.micro = true;
    }
    if (origin === 'own') state.rewindsOwn += 1;
    if (origin === 'vela') state.rewindsVela += 1;
    state.rewindsTotal = state.rewindsOwn + state.rewindsVela;
    state.lastRewindOrigin = origin;
    state.rewindsThisAct += 1;
    return loss;
  }

  // Dessaturação: 6 pontos percentuais por rebobinada, piso em 35%.
  function saturationLevel(state) {
    return Math.max(0.35, 1 - state.rewindsTotal * 0.06);
  }

  // Faixa de rebobinadas próprias (variações de finais).
  function rewindBand(state) {
    var n = state.rewindsOwn;
    if (n <= 9) return 1;      // 7-9 esperado; menos também cai aqui
    if (n <= 14) return 2;     // 10-14
    return 3;                  // 15+
  }

  function hasMemory(state, id) { return state.memoriesLost.indexOf(id) < 0; }

  // ---- restauração temporal ---------------------------------------------------
  function snapshotTemporal(state) {
    var snap = {}, i;
    for (i = 0; i < TEMPORAL_KEYS.length; i++) {
      var k = TEMPORAL_KEYS[i];
      if (k === 'gearSlots' || k === 'mirrorAngles') {
        snap[k] = (state[k] || []).slice();
      } else {
        snap[k] = state[k];
      }
    }
    return snap;
  }

  function restoreTemporal(state, snap) {
    if (!snap) return;
    var i, k;
    for (i = 0; i < TEMPORAL_KEYS.length; i++) {
      k = TEMPORAL_KEYS[i];
      if (Object.prototype.hasOwnProperty.call(snap, k)) {
        if (k === 'gearSlots' || k === 'mirrorAngles') {
          state[k] = (snap[k] || []).slice();
        } else {
          state[k] = snap[k];
        }
      }
    }
  }

  RW.State = {
    SAVE_VERSION: SAVE_VERSION,
    TEMPORAL_KEYS: TEMPORAL_KEYS,
    LOSS_ORDER: LOSS_ORDER,
    LOSS_OBJECTS: LOSS_OBJECTS,
    defaults: defaults,
    validate: validate,
    serialize: serialize,
    deserialize: deserialize,
    nextLossId: nextLossId,
    applyLoss: applyLoss,
    saturationLevel: saturationLevel,
    rewindBand: rewindBand,
    hasMemory: hasMemory,
    snapshotTemporal: snapshotTemporal,
    restoreTemporal: restoreTemporal
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = RW.State;
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
