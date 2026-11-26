/* Lógica pura de LINHA MORTA — manual da central (roteamento), apito de teste,
   fichas de Ivone, registrador mecânico e computação de finais. Testável em Node. */
(function (LM) {
  'use strict';

  var MANUAL_RULES = {
    ORDER: 'Ordem de precedência: fichas azuis primeiro, depois as vermelhas; dentro da mesma cor, pela numeração crescente.',
    FORBIDDEN: 'O cruzamento A7–B8 e A8–B7 é proibido (pares cruzados ouvem o que não devem).',
    THIRTEEN: 'A ficha 13 nunca responde antes das 03:00 — conecte-a por último.',
    LISTEN: 'Fio aberto é falta grave. A central escuta de volta.',
    ENTRADA: 'Cada estabelecimento tem linha própria: a ficha entra pela entrada impressa nela. A central não improvisa pontos.',
    DESTINO: 'A ficha sai pela saída impressa nela. Destino trocado é chamada perdida — e chamada perdida é falta no livro.'
  };

  function sortKey(t) {
    var colorWeight = { azul: 0, vermelha: 1, branca: 2 };
    return (colorWeight[t.color] || 0) * 1000 + t.num;
  }

  // Ordem correta de conexão das fichas do turno.
  function correctOrder(tickets) {
    return tickets.slice().sort(function (a, b) { return sortKey(a) - sortKey(b); })
      .map(function (t) { return t.id; });
  }

  function validateOrder(tickets, sequence) {
    if (!Array.isArray(sequence) || sequence.length !== tickets.length) return false;
    var expected = correctOrder(tickets);
    for (var i = 0; i < expected.length; i++) {
      if (expected[i] !== sequence[i]) return false;
    }
    return true;
  }

  // Pares proibidos: A7→B8 e A8→B7 (a = índice de saída da linha A, b = de B).
  function isForbiddenPair(a, b) {
    return (a === 7 && b === 8) || (a === 8 && b === 7);
  }

  // Índice físico de um jack rotulado ('A4' → 3, 'B2' → 1; sem rótulo → −1).
  function jackIndex(label) {
    if (!label || typeof label !== 'string') return -1;
    var m = /^([AB])(\d+)$/.exec(label);
    return m ? (parseInt(m[2], 10) - 1) : -1;
  }

  // Valida uma conexão individual contra o manual — os dois extremos (AUD-05).
  function validateConnection(ticket, a, b, night, isFirstOfDay) {
    if (isForbiddenPair(a, b)) return { ok: false, rule: MANUAL_RULES.FORBIDDEN };
    if (ticket.num === 13 && night >= 3 && isFirstOfDay) {
      return { ok: false, rule: MANUAL_RULES.THIRTEEN };
    }
    var wantIn = jackIndex(ticket.entrada);
    if (wantIn >= 0 && a !== wantIn) {
      return { ok: false, rule: MANUAL_RULES.ENTRADA + ' Ficha ' + ticket.num + ' entra pela ' + ticket.entrada + '.' };
    }
    var wantOut = jackIndex(ticket.to);
    if (wantOut >= 0 && b !== wantOut) {
      return { ok: false, rule: MANUAL_RULES.DESTINO + ' Ficha ' + ticket.num + ' pede a ' + ticket.to + '.' };
    }
    return { ok: true };
  }

  // ---- apito de teste --------------------------------------------------------
  // perfis: linha viva devolve tom limpo; a linha morta devolve silêncio com respiração.
  function analyzeTone(profile) {
    if (!profile || profile.freq === 0) return { dead: true, label: 'silêncio com respiração' };
    if (profile.noise > 0.5) return { dead: false, label: 'tom limpo com falha de isolamento' };
    return { dead: false, label: 'tom limpo' };
  }

  function findDeadLine(profiles) {
    for (var i = 0; i < profiles.length; i++) {
      if (analyzeTone(profiles[i]).dead) return i;
    }
    return -1;
  }

  // ---- fichas de cor da Ivone (armário do registrador) ------------------------
  var CHIP_SOLUTION = ['azul', 'azul', 'vermelha', 'azul'];
  function validateChips(selected) {
    if (!selected || selected.length !== CHIP_SOLUTION.length) return false;
    for (var i = 0; i < selected.length; i++) {
      if (selected[i] !== CHIP_SOLUTION[i]) return false;
    }
    return true;
  }

  // ---- registrador mecânico ----------------------------------------------------
  function validateCounter(expected, entered) {
    return parseInt(entered, 10) === expected;
  }

  // ---- finais -------------------------------------------------------------------
  function computeEnding(state, choice, usedIvoneJack) {
    if (state.caughtListening || LM.State.isCaughtThreshold(state) && state.caughtListening) {
      return { id: 'ESCUITA' };
    }
    if (choice === 'cut') {
      return { id: 'REGRA', clean: state.listened === 0 };
    }
    if (choice === 'connect') {
      if (usedIvoneJack && LM.State.ivoneReady(state)) return { id: 'IVONE' };
      return { id: 'LINHA' };
    }
    return null;
  }

  LM.Logic = {
    MANUAL_RULES: MANUAL_RULES,
    CHIP_SOLUTION: CHIP_SOLUTION,
    correctOrder: correctOrder,
    validateOrder: validateOrder,
    isForbiddenPair: isForbiddenPair,
    jackIndex: jackIndex,
    validateConnection: validateConnection,
    analyzeTone: analyzeTone,
    findDeadLine: findDeadLine,
    validateChips: validateChips,
    validateCounter: validateCounter,
    computeEnding: computeEnding
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LM.Logic;
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
