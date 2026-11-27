/* MemorySystem — nove lembranças, perdas determinísticas, memórias condicionais,
   falas perdidas, micro-perdas e memória restaurada (save antigo). */
(function (RW) {
  'use strict';

  function isLost(id) {
    var st = RW.state;
    return st.memoriesLost.indexOf(id) >= 0;
  }

  function memoryTitle(id) {
    var m = RW.Data.memories[id];
    return m ? m.title : id;
  }

  function lostList() {
    return RW.state.memoriesLost.slice();
  }

  function availableCount() {
    return 9 - RW.state.memoriesLost.length;
  }

  // Linha de Vela percebendo a perda (usada após rebobinada própria).
  function noticedLine(loss) {
    if (!loss || !loss.memory) return null;
    var m = RW.Data.memories[loss.memory];
    return m ? m.noticed : null;
  }

  // Falas removidas pela perda (DialogDatabase filtra por removed keys).
  function removedLines(loss) {
    if (!loss || !loss.memory) return [];
    var m = RW.Data.memories[loss.memory];
    return m ? (m.removes || []) : [];
  }

  // A memória "restaurada" pelo save antigo: estado temporário narrativo.
  function restoredEcho() {
    var st = RW.state;
    var first = st.memoriesLost.length ? st.memoriesLost[0] : null;
    if (!first) return null;
    var m = RW.Data.memories[first];
    return m ? { id: first, title: m.title, line: 'Por um segundo, com o legacy aberto, ela diz: "' + m.noticed + '"' } : null;
  }

  RW.Memories = {
    isLost: isLost,
    memoryTitle: memoryTitle,
    lostList: lostList,
    availableCount: availableCount,
    noticedLine: noticedLine,
    removedLines: removedLines,
    restoredEcho: restoredEcho
  };
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
