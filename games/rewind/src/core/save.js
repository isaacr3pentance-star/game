/* SaveSystem — IndexedDB (rewind_db), saves separados, save antigo, exportação.
   Sem dependência de beforeunload; grava em momentos críticos. */
(function (RW) {
  'use strict';

  var DB_NAME = 'rewind_db';
  var DB_VERSION = 1;
  var STORE = 'saves';
  var LS_PREFIX = 'rewind_';
  var dbPromise = null;

  function hasIDB() {
    return typeof indexedDB !== 'undefined';
  }

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('IndexedDB indisponível')); };
    });
    return dbPromise;
  }

  function txPut(id, data) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id: id, data: data, at: Date.now() });
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error || new Error('Falha ao gravar')); };
      });
    });
  }

  function txGet(id) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readonly');
        var req = tx.objectStore(STORE).get(id);
        req.onsuccess = function () { resolve(req.result ? req.result.data : null); };
        req.onerror = function () { reject(req.error || new Error('Falha ao ler')); };
      });
    });
  }

  function lsSet(id, data) {
    try { localStorage.setItem(LS_PREFIX + id, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  function lsGet(id) {
    try {
      var raw = localStorage.getItem(LS_PREFIX + id);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function save(id, data) {
    data.meta = data.meta || {};
    data.meta.updatedAt = Date.now();
    var ok = lsSet(id, data); // contingência síncrona
    if (hasIDB()) {
      return txPut(id, data).then(function () { return true; }).catch(function () { return ok; });
    }
    return Promise.resolve(ok);
  }

  function load(id) {
    if (hasIDB()) {
      return txGet(id).then(function (d) {
        return d ? d : lsGet(id);
      }).catch(function () { return lsGet(id); });
    }
    return Promise.resolve(lsGet(id));
  }

  function wipeAll() {
    try {
      localStorage.removeItem(LS_PREFIX + 'current');
      localStorage.removeItem(LS_PREFIX + 'legacy');
      localStorage.removeItem(LS_PREFIX + 'ultima_rebobinada');
    } catch (e) { /* contingência */ }
    if (!hasIDB()) return Promise.resolve(false);
    return openDB().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).clear();
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      });
    }).catch(function () { return false; });
  }

  // ---- SAVE ANTIGO -----------------------------------------------------------
  // `legacy.save`: registro fictício de sessões anteriores. Determinístico,
  // sem dados pessoais reais. Criado na primeira execução, nunca sobrescrito.
  function buildLegacy() {
    return {
      nome: 'legacy.save',
      origem: 'sessão anterior (simulada)',
      versao: 1,
      sessoes: [
        {
          jogador: 'op_1',
          rebobinadas: 4,
          final: 'sessão abandonada — Ato II',
          lembrancas_perdidas: ['m1', 'm2', 'm3', 'm4'],
          nota: '"ela começou a perguntar quem eu era. saí antes de responder."'
        },
        {
          jogador: 'op_2',
          rebobinadas: 11,
          final: 'sessão interrompida — revelação',
          lembrancas_perdidas: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
          nota: '"não é um jogo de consertar. é um jogo de escolher quem paga."'
        },
        {
          jogador: 'op_3',
          rebobinadas: 27,
          final: 'final B registrado',
          lembrancas_perdidas: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'],
          nota: '"fiquei. ela pediu que eu guardasse algo em um lugar que ela não apareça."'
        }
      ],
      aviso: 'este registro não pode ser sobrescrito pelo save atual.'
    };
  }

  function ensureLegacy() {
    return load('legacy').then(function (d) {
      if (d) return d;
      var legacy = buildLegacy();
      return save('legacy', legacy).then(function () { return legacy; });
    });
  }

  function exportBlob(filename, text) {
    if (typeof document === 'undefined') return false;
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 400);
    return true;
  }

  // recado.txt — Final B. Data local real, formatação narrativa.
  function buildRecado(state, extraMessage) {
    var now = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var data = pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear();
    var hora = pad(now.getHours()) + ':' + pad(now.getMinutes());
    var linhas = [
      '—————————————————————————————————',
      '  RECADO',
      '—————————————————————————————————',
      '',
      'Para quem abrir depois de mim,',
      '',
      'eu fiquei até o fim desta sessão. Ela pediu que eu não voltasse,',
      'e eu vou respeitar. Você não precisa respeitar. Ninguém nunca respeita.',
      '',
      'Se ela pedir histórias: conte as suas em vez das dela.',
      'Se ela pedir para rebobinar: não faça. O preço é dela e ela sabe o valor.',
      '',
      'Guardado em ' + data + ' às ' + hora + '.',
      'Rebobinadas próprias nesta sessão: ' + state.rewindsOwn + '.',
      ''
    ];
    if (extraMessage) {
      linhas.push('— anexo, no verso do papel —', '', extraMessage, '');
    }
    linhas.push('—————————————————————————————————', '');
    return linhas.join('\n');
  }

  RW.SaveSystem = {
    DB_NAME: DB_NAME,
    save: save,
    load: load,
    wipeAll: wipeAll,
    ensureLegacy: ensureLegacy,
    buildLegacy: buildLegacy,
    buildRecado: buildRecado,
    exportBlob: exportBlob
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = RW.SaveSystem;
  }
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
