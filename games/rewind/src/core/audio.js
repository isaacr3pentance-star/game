/* AudioManager — Web Audio API, tudo procedural (sem arquivos).
   Ambiente: vento, chuva, gotejamento, zumbido do farol, madeira.
   Rádio: estática + nota cortada/nota completa. Rebobinada: buffer real reverso. */
(function (RW) {
  'use strict';

  var A = {
    ctx: null, master: null, ambient: null, radioBus: null,
    started: false, muted: false,
    nodes: {}, recorder: { chunks: [], size: 0, active: false },
    captionFn: null, prefs: null
  };

  function caption(text) {
    if (A.captionFn) A.captionFn(text);
  }

  function unlock(prefs, captionFn) {
    if (A.started) return Promise.resolve(true);
    var Ctor = typeof AudioContext !== 'undefined' ? AudioContext :
      (typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : null);
    if (!Ctor) return Promise.resolve(false);
    A.captionFn = captionFn || null;
    A.prefs = prefs || {};
    try {
      A.ctx = new Ctor();
    } catch (e) { return Promise.resolve(false); }
    A.master = A.ctx.createGain();
    A.ambient = A.ctx.createGain();
    A.radioBus = A.ctx.createGain();
    A.ambient.connect(A.master);
    A.radioBus.connect(A.master);
    A.master.connect(A.ctx.destination);
    applyVolumes();
    // gravador circular do master (últimos ~2.6s) para o reverso da rebobinada
    try {
      var rec = A.ctx.createScriptProcessor(4096, 2, 2);
      rec.onaudioprocess = function (ev) {
        if (!A.recorder.active) return;
        A.recorder.chunks.push(new Float32Array(ev.inputBuffer.getChannelData(0).slice(0)));
        if (A.recorder.chunks.length > 64) A.recorder.chunks.shift();
      };
      A.master.connect(rec);
      var sink = A.ctx.createGain();
      sink.gain.value = 0;
      rec.connect(sink);
      sink.connect(A.ctx.destination);
      A.recorder.active = true;
      A.recorderNode = rec;
    } catch (e) { A.recorder.active = false; }
    A.started = true;
    startAmbient();
    return Promise.resolve(true);
  }

  function applyVolumes() {
    if (!A.ctx) return;
    var p = A.prefs || {};
    A.master.gain.value = A.muted ? 0 : (p.volumeMaster !== undefined ? p.volumeMaster : 0.8);
    A.ambient.gain.value = p.volumeAmbient !== undefined ? p.volumeAmbient : 0.7;
    A.radioBus.gain.value = p.volumeRadio !== undefined ? p.volumeRadio : 0.8;
  }

  function noiseBuffer(seconds, brown) {
    var ctx = A.ctx;
    var len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      else d[i] = w;
    }
    return buf;
  }

  function loopSource(buf, gainValue, filterType, freq, q) {
    var ctx = A.ctx;
    var src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    var g = ctx.createGain(); g.gain.value = gainValue;
    var node = src;
    if (filterType) {
      var f = ctx.createBiquadFilter();
      f.type = filterType; f.frequency.value = freq || 800; f.Q.value = q || 0.7;
      src.connect(f); node = f;
    }
    node.connect(g); g.connect(A.ambient);
    src.start();
    return { src: src, gain: g };
  }

  function startAmbient() {
    if (!A.started || A.nodes.wind) return;
    var ctx = A.ctx;
    // vento (marrom, filtrado)
    var wind = loopSource(noiseBuffer(4, true), 0.5, 'lowpass', 340, 0.6);
    A.nodes.wind = wind;
    // chuva (branco, bandpass)
    var rain = loopSource(noiseBuffer(3, false), 0.16, 'bandpass', 2400, 0.4);
    A.nodes.rain = rain;
    // zumbido do farol
    var hum = ctx.createOscillator();
    hum.type = 'sine'; hum.frequency.value = 55;
    var hum2 = ctx.createOscillator();
    hum2.type = 'sine'; hum2.frequency.value = 55.7;
    var humG = ctx.createGain(); humG.gain.value = 0.05;
    hum.connect(humG); hum2.connect(humG); humG.connect(A.ambient);
    hum.start(); hum2.start();
    A.nodes.hum = { osc: hum, osc2: hum2, gain: humG };
    // gotejamento periódico
    scheduleDrip();
    // range de madeira ocasional
    scheduleCreak();
  }

  function scheduleDrip() {
    if (!A.started) return;
    var delay = 2600 + Math.random() * 7000;
    A.dripTimer = setTimeout(function () {
      blip(1240 + Math.random() * 420, 0.06, 0.05, '[gota]');
      scheduleDrip();
    }, delay);
  }

  function scheduleCreak() {
    if (!A.started) return;
    var delay = 14000 + Math.random() * 22000;
    A.creakTimer = setTimeout(function () {
      var ctx = A.ctx;
      var o = ctx.createOscillator();
      o.type = 'sawtooth';
      var t = ctx.currentTime;
      o.frequency.setValueAtTime(70 + Math.random() * 40, t);
      o.frequency.linearRampToValueAtTime(52 + Math.random() * 30, t + 0.7);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
      o.connect(f); f.connect(g); g.connect(A.ambient);
      o.start(t); o.stop(t + 0.8);
      caption('[madeira cede]');
      scheduleCreak();
    }, delay);
  }

  function blip(freq, dur, vol, cap) {
    if (!A.started) return;
    var ctx = A.ctx;
    var o = ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = freq;
    var g = ctx.createGain();
    var t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(A.ambient);
    o.start(t); o.stop(t + dur + 0.02);
    if (cap) caption(cap);
  }

  function setRain(on) {
    if (A.nodes.rain) A.nodes.rain.gain.value = on ? 0.16 : 0.0;
    if (A.nodes.wind) A.nodes.wind.gain.value = on ? 0.5 : 0.32;
  }

  function setFlicker(on) {
    if (A.nodes.hum) A.nodes.hum.gain.value = on ? 0.05 : 0.032;
  }

  // ---- rádio ------------------------------------------------------------------
  function radioStatic(on) {
    if (!A.started) return null;
    if (A.nodes.radioStatic) {
      A.nodes.radioStatic.gain.value = on ? 0.5 : 0;
      return A.nodes.radioStatic;
    }
    var ctx = A.ctx;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(2, false); src.loop = true;
    var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800;
    var g = ctx.createGain(); g.gain.value = on ? 0.5 : 0;
    src.connect(f); f.connect(g); g.connect(A.radioBus);
    src.start();
    A.nodes.radioStatic = g;
    return g;
  }

  // Nota do rádio: melodia curta em lá menor que nunca resolve.
  // cut=true interrompe abruptamente antes da resolução (prólogo).
  function playNote(full, onEnd) {
    if (!A.started) { if (onEnd) onEnd(); return; }
    var ctx = A.ctx;
    var t0 = ctx.currentTime + 0.05;
    var notes = full
      ? [440.0, 523.25, 493.88, 440.0, 392.0, 415.30, 440.0, 349.23]
      : [440.0, 523.25, 493.88];
    var dur = 0.42;
    var total = 0;
    for (var i = 0; i < notes.length; i++) {
      (function (idx) {
        var o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = notes[idx] * (idx >= 2 ? 1.003 : 1); // ligeira desafinação
        var g = ctx.createGain();
        var t = t0 + idx * dur;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
        g.gain.setValueAtTime(0.22, t + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        // grão de estática sob a nota
        var st = radioStatic(true);
        if (st) st.gain.value = 0.22;
        o.connect(g); g.connect(A.radioBus);
        o.start(t); o.stop(t + dur + 0.02);
      })(i);
    }
    total = notes.length * dur;
    caption(full ? '[nota completa — lá menor, sem resolução]' : '[nota cortada]');
    setTimeout(function () {
      var st = A.nodes.radioStatic;
      if (st) st.gain.value = 0;
      if (onEnd) onEnd();
    }, (total + 0.15) * 1000);
  }

  // ---- reverso real -----------------------------------------------------------
  function playReversed() {
    if (!A.started) return false;
    var ctx = A.ctx;
    var chunks = A.recorder.chunks;
    var srcBuf;
    if (A.recorder.active && chunks.length > 2) {
      var len = chunks.length * chunks[0].length;
      srcBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = srcBuf.getChannelData(0);
      var pos = 0;
      for (var i = 0; i < chunks.length; i++) {
        d.set(chunks[i], pos);
        pos += chunks[i].length;
      }
    } else {
      // contingência: reverte o buffer de vento gerado
      srcBuf = noiseBuffer(2.2, true);
    }
    // inverte efetivamente os dados do canal
    var rev = ctx.createBuffer(1, srcBuf.length, ctx.sampleRate);
    var src = srcBuf.getChannelData(0);
    var dst = rev.getChannelData(0);
    for (var j = 0; j < src.length; j++) dst[j] = src[src.length - 1 - j];
    var s = ctx.createBufferSource();
    s.buffer = rev;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
    s.connect(g); g.connect(A.master);
    s.start();
    caption('[áudio da cena ao contrário]');
    return true;
  }

  function setPrefs(p) {
    A.prefs = p || {};
    applyVolumes();
  }

  function setMuted(m) { A.muted = m; applyVolumes(); }

  function clickSound(vol) {
    blip(880, 0.03, vol || 0.08, null);
  }

  function shutdown() {
    if (A.dripTimer) clearTimeout(A.dripTimer);
    if (A.creakTimer) clearTimeout(A.creakTimer);
    if (A.ctx) { try { A.ctx.close(); } catch (e) { /* noop */ } }
    A.started = false;
  }

  RW.Audio = {
    unlock: unlock,
    setPrefs: setPrefs,
    setMuted: setMuted,
    setRain: setRain,
    setFlicker: setFlicker,
    radioStatic: radioStatic,
    playNote: playNote,
    playReversed: playReversed,
    blip: blip,
    clickSound: clickSound,
    shutdown: shutdown,
    isStarted: function () { return A.started; }
  };
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
