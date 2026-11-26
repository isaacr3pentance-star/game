/* Endings de LINHA MORTA — REGRA, LINHA MORTA, IVONE (segredo), EM ESCUTA (falha). */
(function (LM) {
  'use strict';

  function runEnding(id, meta) {
    var st = LM.state;
    var txt = LM.Data.endingsText[id];
    if (!txt) return;
    var nodes = [{ who: 'manual', text: txt.title }].concat(
      txt.body.map(function (p) { return { who: 'manual', text: p }; })
    );
    if (id === 'REGRA' && meta && meta.clean) {
      nodes.push({ who: 'ivone', text: txt.clean });
    }
    LM.Terminal.pushMany(nodes, function () {
      LM.UI.showEndingScreen(id, st);
    });
    LM.SaveSystem.save('current', st);
  }

  LM.Endings = { runEnding: runEnding };
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
