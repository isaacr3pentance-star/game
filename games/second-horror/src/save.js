/* Save de LINHA MORTA — IndexedDB `second_horror_db`, store `saves`, prefixo second_horror_.
   Isolado dos saves do REWIND (rewind_db / rewind_*). */
(function (LM) {
  'use strict';

  var DB_NAME = 'second_horror_db';
  var STORE = 'saves';
  var LS_PREFIX = 'second_horror_';
  var dbPromise = null;

  function hasIDB() { return typeof indexedDB !== 'undefined'; }

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('IndexedDB indisponível')); };
    });
    return dbPromise;
  }

  function save(id, data) {
    data.meta = data.meta || {};
    data.meta.updatedAt = Date.now();
    var ok = false;
    try { localStorage.setItem(LS_PREFIX + id, JSON.stringify(data)); ok = true; } catch (e) { /* contingência */ }
    if (!hasIDB()) return Promise.resolve(ok);
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id: id, data: data, at: Date.now() });
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error || new Error('falha ao gravar')); };
      });
    }).catch(function () { return ok; });
  }

  function load(id) {
    if (!hasIDB()) {
      try {
        var raw = localStorage.getItem(LS_PREFIX + id);
        return Promise.resolve(raw ? JSON.parse(raw) : null);
      } catch (e) { return Promise.resolve(null); }
    }
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readonly');
        var req = tx.objectStore(STORE).get(id);
        req.onsuccess = function () { resolve(req.result ? req.result.data : null); };
        req.onerror = function () { reject(req.error || new Error('falha ao ler')); };
      });
    }).catch(function () {
      try {
        var raw = localStorage.getItem(LS_PREFIX + id);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    });
  }

  function wipeAll() {
    try { localStorage.removeItem(LS_PREFIX + 'current'); } catch (e) { /* noop */ }
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

  LM.SaveSystem = { DB_NAME: DB_NAME, save: save, load: load, wipeAll: wipeAll };
  if (typeof module !== 'undefined' && module.exports) module.exports = LM.SaveSystem;
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
