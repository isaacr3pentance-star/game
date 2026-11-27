/* LINHA MORTA — namespace raiz do segundo jogo */
(function () {
  'use strict';
  if (typeof window !== 'undefined') {
    window.LM = window.LM || {};
  } else if (typeof globalThis !== 'undefined') {
    globalThis.LM = globalThis.LM || {};
  }
})();
