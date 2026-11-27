/* Estado de LINHA MORTA — turnos, fichas, escutas, indícios de Ivone, finais.
   Sem DOM (testável em Node). Prefixo de armazenamento: second_horror_*. */
(function (LM) {
  'use strict';

  var SAVE_VERSION = 1;

  function defaults() {
    return {
      version: SAVE_VERSION,
      night: 1,                    // 1..5
      phase: 'intro',              // intro | calls | event | report | ending
      shiftLog: [],                // {night, text, at}

      // chamadas do turno atual
      ticketsQueue: [],            // fichas pendentes {id, from, to, color, num, special}
      connections: [],             // {ticketId, a, b}
      wrongConnections: 0,
      solvedRouting: false,

      // a linha morta
      deadLineEvents: 0,           // eventos atendidos/conectados
      spokeToLine: 0,              // respostas dadas à linha
      listened: 0,                 // fio aberto (proibido)
      caughtListening: false,
      cutOrdered: false,           // ordem da chefia (noite 4)
      cutObeyed: null,             // null | true | false

      // indícios de Ivone (segredo)
      ivoneFacts: [],              // ids dos 6 indícios
      notebookPages: 0,

      // vocabulário que a linha usou (mecânica de resposta)
      lineWords: [],

      // codinome opcional, exclusivamente ficcional (nunca um nome real)
      codinome: null,

      // metadados
      examined: {},
      ending: null,                // 'REGRA' | 'LINHA' | 'IVONE' | 'ESCUITA'
      terminal: false,
      prefs: {
        volumeMaster: 0.8, volumeBoard: 0.7, volumeLine: 0.8,
        textSpeed: 2, reduceFlashes: false, captions: true
      },
      meta: { createdAt: 0, updatedAt: 0, sessions: 0 }
    };
  }

  var IVONE_FACTS_TOTAL = 6;

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
    if (!Array.isArray(out.shiftLog)) out.shiftLog = [];
    if (!Array.isArray(out.ticketsQueue)) out.ticketsQueue = [];
    if (!Array.isArray(out.connections)) out.connections = [];
    if (!Array.isArray(out.ivoneFacts)) out.ivoneFacts = [];
    if (!Array.isArray(out.lineWords)) out.lineWords = [];
    if (out.night < 1 || out.night > 5) out.night = 1;
    if (out.listened < 0) out.listened = 0;
    if (out.spokeToLine < 0) out.spokeToLine = 0;
    if (out.terminal && !out.ending) out.ending = 'LINHA';
    if (typeof out.codinome === 'string') {
      out.codinome = out.codinome.trim().slice(0, 18) || null;
    } else {
      out.codinome = null;
    }
    return out;
  }

  function serialize(s) { return JSON.stringify(s); }
  function deserialize(str) {
    try { return validate(JSON.parse(str)); } catch (e) { return null; }
  }

  function addFact(state, factId) {
    if (state.ivoneFacts.indexOf(factId) < 0) {
      state.ivoneFacts.push(factId);
      return true;
    }
    return false;
  }

  function hasFact(state, factId) {
    return state.ivoneFacts.indexOf(factId) >= 0;
  }

  function ivoneReady(state) {
    return state.ivoneFacts.length >= IVONE_FACTS_TOTAL;
  }

  // Escutar demais tem consequência: a linha percebe.
  function isCaughtThreshold(state) {
    return state.listened >= 3;
  }

  LM.State = {
    SAVE_VERSION: SAVE_VERSION,
    IVONE_FACTS_TOTAL: IVONE_FACTS_TOTAL,
    defaults: defaults,
    validate: validate,
    serialize: serialize,
    deserialize: deserialize,
    addFact: addFact,
    hasFact: hasFact,
    ivoneReady: ivoneReady,
    isCaughtThreshold: isCaughtThreshold
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LM.State;
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
