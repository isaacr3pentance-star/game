/* Áudio de LINHA MORTA — 100% procedural: zumbido de 50Hz, relés, apito de teste,
   estática, respiração na linha. Web Audio API. */
(function (LM) {
  'use strict';

  var A = { ctx: null, master: null, board: null, line: null, started: false, prefs: {}, captionFn: null, nodes: {} };

  function caption(t) { if (A.captionFn) A.captionFn(t); }

  function unlock(prefs, captionFn) {
    if (A.started) return Promise.resolve(true);
    var Ctor = typeof AudioContext !== 'undefined' ? AudioContext : (typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : null);
    if (!Ctor) return Promise.resolve(false);
    A.captionFn = captionFn || null;
    A.prefs = prefs || {};
    try { A.ctx = new Ctor(); } catch (e) { return Promise.resolve(false); }
    A.master = A.ctx.createGain();
    A.board = A.ctx.createGain();
    A.line = A.ctx.createGain();
    A.board.connect(A.master); A.line.connect(A.master);
    A.master.connect(A.ctx.destination);
    applyVolumes();
    // zumbido de 50Hz da central
    var o = A.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 50;
    var o2 = A.ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 100.4;
    var g = A.ctx.createGain(); g.gain.value = 0.045;
    o.connect(g); o2.connect(g); g.connect(A.board);
    o.start(); o2.start();
    A.nodes.hum = { o: o, o2: o2, g: g };
    A.started = true;
    return Promise.resolve(true);
  }

  function applyVolumes() {
    if (!A.ctx) return;
    A.master.gain.value = A.prefs.volumeMaster !== undefined ? A.prefs.volumeMaster : 0.8;
    A.board.gain.value = A.prefs.volumeBoard !== undefined ? A.prefs.volumeBoard : 0.7;
    A.line.gain.value = A.prefs.volumeLine !== undefined ? A.prefs.volumeLine : 0.8;
  }

  function noise(seconds) {
    var len = Math.floor(A.ctx.sampleRate * seconds);
    var buf = A.ctx.createBuffer(1, Math.max(1, len), A.ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // clique de relé/jack
  function relay(vol) {
    if (!A.started) return;
    var ctx = A.ctx, t = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 220;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.14, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    o.connect(g); g.connect(A.board);
    o.start(t); o.stop(t + 0.05);
    caption('[relé]');
  }

  // apito de teste: tom de 1000Hz pela linha; dead=true → só respiração
  function testTone(dead) {
    if (!A.started) return;
    var ctx = A.ctx, t = ctx.currentTime;
    if (!dead) {
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 1000;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.setValueAtTime(0.12, t + 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      o.connect(g); g.connect(A.line);
      o.start(t); o.stop(t + 0.85);
      caption('[tom de teste — limpo]');
    } else {
      var src = ctx.createBufferSource(); src.buffer = noise(1);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240;
      var g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.10, t);
      g2.gain.linearRampToValueAtTime(0.16, t + 0.4);
      g2.gain.linearRampToValueAtTime(0.10, t + 0.8);
      src.connect(f); f.connect(g2); g2.connect(A.line);
      src.start(t); src.stop(t + 0.85);
      caption('[silêncio com respiração]');
    }
  }

  // estática da linha morta ao falar
  function lineStatic(on) {
    if (!A.started) return;
    if (A.nodes.static) { A.nodes.static.g.gain.value = on ? 0.12 : 0; return; }
    if (!on) return;
    var ctx = A.ctx;
    var src = ctx.createBufferSource(); src.buffer = noise(2); src.loop = true;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900;
    var g = ctx.createGain(); g.gain.value = 0.12;
    src.connect(f); f.connect(g); g.connect(A.line);
    src.start();
    A.nodes.static = { src: src, g: g };
  }

  function ringPattern(times) {
    if (!A.started) return;
    var i = 0;
    var iv = setInterval(function () {
      if (i++ >= times * 2) { clearInterval(iv); return; }
      relay(i % 2 ? 0.1 : 0.02);
    }, 380);
    caption('[toque no painel]');
  }

  function setPrefs(p) { A.prefs = p || {}; applyVolumes(); }

  LM.Audio = {
    unlock: unlock,
    setPrefs: setPrefs,
    relay: relay,
    testTone: testTone,
    lineStatic: lineStatic,
    ringPattern: ringPattern,
    isStarted: function () { return A.started; }
  };
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
