/* RoomManager — cenas (sala, escadaria, manutenção, luz, exterior), hotspots,
   overlays de estado, Vela (sprite top-down, posturas), camada animada. */
(function (RW) {
  'use strict';

  var P = RW.Painter;
  var R = {
    canvas: null, overlay: null, wrap: null,
    scene: 'sala', raf: null, time: 0,
    hotspots: [], velaEl: null, velaMode: 'stand',
    rainT: 0, dust: []
  };

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function init(wrapId) {
    R.wrap = document.getElementById(wrapId);
    R.canvas = document.createElement('canvas');
    R.canvas.width = P.W; R.canvas.height = P.H;
    R.canvas.className = 'scene-canvas';
    R.wrap.appendChild(R.canvas);
    R.overlay = document.createElement('canvas');
    R.overlay.width = P.W; R.overlay.height = P.H;
    R.overlay.className = 'scene-overlay';
    R.wrap.appendChild(R.overlay);
    R.hotspotLayer = el('div', 'hotspot-layer', R.wrap);
    R.velaEl = el('div', 'vela', R.wrap);
    R.fxLayer = el('div', 'fx-layer', R.wrap);
    buildDust();
    animate();
  }

  function buildDust() {
    R.dust = [];
    for (var i = 0; i < 70; i++) {
      R.dust.push({ x: Math.random() * P.W, y: Math.random() * P.H, s: 0.6 + Math.random() * 1.8, v: 4 + Math.random() * 12, o: 0.05 + Math.random() * 0.16 });
    }
  }

  function paintScene() {
    var ctx = R.canvas.getContext('2d');
    ctx.clearRect(0, 0, P.W, P.H);
    var st = RW.state || RW.State.defaults();
    if (R.scene === 'sala') P.paintRoom(ctx);
    else if (R.scene === 'escadaria') P.paintStairs(ctx);
    else if (R.scene === 'manutencao') P.paintMaintenance(ctx);
    else if (R.scene === 'luz') P.paintLight(ctx);
    else if (R.scene === 'exterior') P.paintExterior(ctx);
    // overlays persistentes por estado
    if (R.scene === 'sala') {
      if (st.puddle) drawPuddle(ctx);
      if (st.glassState === 'empty') drawEmptyGlass(ctx);
      if (st.glassState === 'full') drawFullGlass(ctx);
      drawPortraitOnTable(ctx, st);
      drawCalendarMarks(ctx, st);
      if (st.lostObjects.indexOf('bilhete_navio') >= 0) hideBilhete(ctx);
    }
  }

  function drawPuddle(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.82;
    var g = ctx.createLinearGradient(180, 480, 420, 620);
    g.addColorStop(0, PAL_REF('water'));
    g.addColorStop(1, PAL_REF('waterHi'));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(300, 600, 150, 52, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(220,235,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(280, 590, 60, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // reflexo sinalizando travas gastas
    ctx.fillStyle = 'rgba(201,178,60,0.5)';
    [0, 2, 4].forEach(function (t) {
      ctx.fillRect(150 + t * 6, 560 + t * 10, 4, 26);
    });
    ctx.restore();
  }

  function PAL_REF(k) { return P.PAL[k]; }

  function drawEmptyGlass(ctx) {
    ctx.clearRect(P.RECTS.glass[0] - 20, P.RECTS.glass[1] - 20, 100, 100);
    ctx.fillStyle = 'rgba(120,150,190,0.25)';
    ctx.beginPath();
    ctx.arc((P.RECTS.glass[0] + P.RECTS.glass[2]) / 2, (P.RECTS.glass[1] + P.RECTS.glass[3]) / 2, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFullGlass(ctx) {
    ctx.fillStyle = P.PAL.water;
    ctx.beginPath();
    ctx.arc((P.RECTS.glass[0] + P.RECTS.glass[2]) / 2, (P.RECTS.glass[1] + P.RECTS.glass[3]) / 2, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPortraitOnTable(ctx, st) {
    if (st.lostObjects.indexOf('moldura_promessa') >= 0) return;
    ctx.save();
    ctx.translate(P.RECTS.portrait[0] + 36, P.RECTS.portrait[1] + 40);
    var pic = RW.Portrait ? RW.Portrait.renderCanvas(st.portraitPieces, st.portraitFlipped) : null;
    if (pic) ctx.drawImage(pic, -36, -40, 72, 72);
    else {
      ctx.fillStyle = '#c9c2b0';
      ctx.fillRect(-36, -40, 72, 82);
    }
    ctx.restore();
  }

  function drawCalendarMarks(ctx, st) {
    var cal = P.RECTS.calendar;
    ctx.strokeStyle = 'rgba(60,55,44,0.85)';
    RW.PuzzleLogic.CALENDAR_MARKED.forEach(function (d, i) {
      ctx.beginPath();
      ctx.moveTo(cal[0] + 10 + (i % 4) * 27, cal[1] + 40 + Math.floor(i / 4) * 20);
      ctx.lineTo(cal[0] + 24 + (i % 4) * 27, cal[1] + 44 + Math.floor(i / 4) * 20);
      ctx.stroke();
    });
  }

  function hideBilhete(ctx) {
    var sh = P.RECTS.shelf;
    ctx.fillStyle = P.PAL.wood2;
    ctx.fillRect(sh[0] + 88, sh[1] + 24, 30, 40);
  }

  // ---------------- camada animada: chuva, poeira, flicker ---------------------
  function animate() {
    R.raf = requestAnimationFrame(animate);
    R.time += 1 / 60;
    var ctx = R.overlay.getContext('2d');
    ctx.clearRect(0, 0, P.W, P.H);
    var st = RW.state;
    if (!st) return;

    // chuva na janela (para de cima quando m7 perdido → chuva parou)
    var rainOn = RW.State.hasMemory(st, 'm7') && R.scene === 'sala';
    if (rainOn || (R.scene === 'luz')) {
      R.rainT += 1;
      ctx.strokeStyle = 'rgba(190,205,230,0.28)';
      var win = R.scene === 'sala' ? P.RECTS.window : [140, 100, 1800, 300];
      for (var i = 0; i < 26; i++) {
        var rx = win[0] + ((i * 73 + R.rainT * 3) % (win[2] - win[0]));
        var ry = win[1] + ((i * 37 + R.rainT * 7) % (win[3] - win[1]));
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 16);
        ctx.stroke();
      }
    }

    // poeira
    ctx.fillStyle = 'rgba(220,225,240,0.5)';
    R.dust.forEach(function (d) {
      d.y -= d.v / 60; d.x += Math.sin(R.time + d.s) * 0.3;
      if (d.y < -10) { d.y = P.H + 10; d.x = Math.random() * P.W; }
      ctx.globalAlpha = d.o;
      ctx.fillRect(d.x, d.y, d.s, d.s);
    });
    ctx.globalAlpha = 1;

    // flicker da lâmpada (m9 perde o flicker → luz estável e fria)
    if (R.scene === 'sala') {
      var flick = RW.State.hasMemory(st, 'm9');
      var halo = R.fxLayer.querySelector('.lamp-halo');
      if (!halo) {
        halo = el('div', 'lamp-halo', R.fxLayer);
        halo.style.left = '44%'; halo.style.top = '8%';
      }
      var a = 0.16 + (flick ? (Math.random() * 0.10) : 0.02);
      halo.style.background = 'radial-gradient(circle, rgba(201,178,60,' + a + ') 0%, rgba(201,178,60,0) 60%)';
      halo.style.filter = flick ? 'none' : 'hue-rotate(30deg)';
    }

    // máquina: sino de vidro pulsando
    if (R.scene === 'sala' && st.machineState === 'broken') {
      ctx.fillStyle = 'rgba(201,178,60,' + (0.10 + 0.06 * Math.sin(R.time * 2.2)) + ')';
      ctx.beginPath();
      ctx.arc(1575, 720, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // feixe do farol no exterior
    if (R.scene === 'exterior') {
      var sweep = (Math.sin(R.time * 0.8) + 1) / 2;
      var beam = ctx.createLinearGradient(1480, 300, sweep * 1900, 100 + sweep * 300);
      beam.addColorStop(0, 'rgba(201,178,60,0.5)');
      beam.addColorStop(1, 'rgba(201,178,60,0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(1480, 300);
      ctx.lineTo(sweep * 1900, 60 + sweep * 260);
      ctx.lineTo(sweep * 1900, 260 + sweep * 260);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---------------- VELA --------------------------------------------------------
  function velaSVG(mode) {
    if (mode === 'sit') {
      return '<svg viewBox="0 0 120 120" class="vela-svg sit">' +
        '<ellipse cx="60" cy="66" rx="40" ry="30" fill="#333b4a"/>' + // casaco
        '<ellipse cx="60" cy="72" rx="30" ry="20" fill="#2b3342"/>' + // pernas dobradas
        '<circle cx="60" cy="52" r="17" fill="#1d222b"/>' + // cabelo
        '<path d="M50 46 q10 -8 20 0" stroke="#141821" stroke-width="2" fill="none"/>' +
        '<ellipse cx="38" cy="60" rx="8" ry="14" fill="#333b4a" transform="rotate(20 38 60)"/>' +
        '<ellipse cx="82" cy="60" rx="8" ry="14" fill="#333b4a" transform="rotate(-20 82 60)"/>' +
        '</svg>';
    }
    return '<svg viewBox="0 0 120 120" class="vela-svg stand">' +
      '<ellipse cx="60" cy="72" rx="26" ry="34" fill="#333b4a"/>' + // casaco de cima
      '<ellipse cx="60" cy="96" rx="18" ry="14" fill="#2b3342"/>' + // saia/pés
      '<circle cx="60" cy="40" r="16" fill="#1d222b"/>' + // cabelo
      '<path d="M48 36 q12 -9 24 0" stroke="#141821" stroke-width="2" fill="none"/>' +
      '<ellipse cx="34" cy="66" rx="7" ry="16" fill="#333b4a" transform="rotate(12 34 66)"/>' +
      '<ellipse cx="86" cy="66" rx="7" ry="16" fill="#333b4a" transform="rotate(-12 86 66)"/>' +
      '</svg>';
  }

  function showVela(mode, scene) {
    if (scene !== 'sala') { R.velaEl.classList.add('hidden'); return; }
    R.velaEl.classList.remove('hidden');
    R.velaMode = mode;
    R.velaEl.innerHTML = velaSVG(mode);
    if (mode === 'sit') {
      R.velaEl.style.left = '49%';
      R.velaEl.style.top = '71%';
    } else {
      R.velaEl.style.left = '43%';
      R.velaEl.style.top = '60%';
    }
  }

  // ---------------- RETRATO (camadas de perda) ---------------------------------
  var Portrait = {
    // peças removidas da segunda pessoa (a da lanterna), em coordenadas relativas
    PIECES: [
      [0.605, 0.30, 0.055], // rosto
      [0.560, 0.46, 0.070], // ombro
      [0.680, 0.80, 0.070], // mão e lanterna
      [0.610, 0.23, 0.050], // cabelo
      [0.610, 0.64, 0.095]  // traje
    ],
    renderCanvas: function (pieces, flipped) {
      var c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#c9c2b0';
      ctx.fillRect(0, 0, 512, 512);
      if (flipped) {
        ctx.fillStyle = '#5d5142';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#cfc6b0';
        ctx.font = '52px Georgia, serif';
        ctx.fillText('V. &', 90, 210);
        ctx.strokeStyle = '#3c3428';
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(240, 170); ctx.lineTo(380, 250); ctx.stroke();
        ctx.font = '26px Georgia, serif';
        ctx.fillText('(raspado por unha)', 100, 330);
        ctx.fillStyle = '#8d7c2a';
        ctx.fillRect(200, 400, 96, 34);
        return c;
      }
      var img = (RW.Embedded && RW.Embedded.fotoImg) ? RW.Embedded.fotoImg : null;
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, 0, 0, 512, 512);
        // grão de dano da foto
        for (var g = 0; g < 900; g++) {
          ctx.fillStyle = 'rgba(30,34,42,' + (Math.random() * 0.05) + ')';
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }
      } else {
        // contingência procedural antes do decode da foto real
        ctx.fillStyle = '#8fa0b5';
        ctx.fillRect(0, 0, 512, 340);
        ctx.fillStyle = '#2b3542';
        ctx.fillRect(0, 340, 512, 172);
        ctx.fillStyle = '#3e4c5e';
        ctx.fillRect(380, 40, 50, 300);
        ctx.fillStyle = '#c9b23c';
        ctx.fillRect(380, 30, 50, 22);
        ctx.fillStyle = '#333b4a';
        ctx.beginPath(); ctx.arc(180, 200, 32, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(150, 232, 60, 140);
        ctx.fillStyle = '#262e3a';
        ctx.beginPath(); ctx.arc(310, 205, 28, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(282, 233, 56, 136);
      }
      ctx.globalCompositeOperation = 'destination-out';
      for (var i = 0; i < Math.min(5, pieces); i++) {
        var p = this.PIECES[i];
        ctx.beginPath();
        ctx.ellipse(p[0] * 512, p[1] * 512, p[2] * 512 * 1.35, p[2] * 512 * 1.7, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      // borda de papel
      ctx.strokeStyle = 'rgba(90,80,60,0.8)';
      ctx.strokeRect(1.5, 1.5, 509, 509);
      return c;
    },
    render: function (pieces, flipped) {
      var img = document.createElement('canvas');
      img.width = 512; img.height = 512;
      img.getContext('2d').drawImage(this.renderCanvas(pieces, flipped), 0, 0);
      return img;
    }
  };

  // ---------------- HOTSPOTS -----------------------------------------------------
  function hs(rect, label, action) {
    return { rect: rect, label: label, action: action };
  }

  function sceneHotspots(scene) {
    var st = RW.state;
    var list = [];
    var objAct = function (id) {
      return function () { RW.Room.objectInteraction(id); };
    };
    if (scene === 'sala') {
      list.push(
        hs(P.RECTS.window, 'Janela', objAct('janela')),
        hs(P.RECTS.calendar, 'Calendário', function () { RW.Puzzles.calendario.open(); }),
        hs(P.RECTS.door, 'Porta', function () { RW.Puzzles.porta.open(); }),
        hs(P.RECTS.radio, 'Rádio', function () { RW.Puzzles.radio.open(); }),
        hs(P.RECTS.glass, 'Copo', function () { RW.Puzzles.copo.open(); }),
        hs(P.RECTS.portrait, 'Retrato', function () { RW.Puzzles.retrato.open(); }),
        hs(P.RECTS.caderno, 'Gaveta da mesa', function () { RW.Puzzles.gaveta.open(); }),
        hs(P.RECTS.table, 'Mesa', objAct('mesa')),
        hs(P.RECTS.chair, 'Casaco', objAct('casaco')),
        hs(P.RECTS.bed, 'Cama', objAct('cama')),
        hs(P.RECTS.rug, 'Tapete', objAct('tapete')),
        hs(P.RECTS.shelf, 'Prateleira', objAct('prateleira')),
        hs(P.RECTS.machine, 'Máquina', objAct('maquina')),
        hs([920, 40, 1000, 160], 'Lâmpada', objAct('lampada'))
      );
      if (st.doorUnlocked) {
        list.push(hs([80, 560, 320, 660], 'Descer a escadaria', function () { RW.Room.goto('escadaria'); }));
      }
    } else if (scene === 'escadaria') {
      list.push(
        hs(P.RECTS_STAIRS.records, 'Caixa de registros', function () { RW.Puzzles.registros.open(); }),
        hs(P.RECTS_STAIRS.mirror, 'Espelho do corredor', function () {
          RW.Room.objectInteraction('espelho');
        }),
        hs(P.RECTS_STAIRS.alcove, 'Cacos de espelho', function () { RW.Puzzles.reflexos.open(); }),
        hs([360, 160, 980, 940], 'Subir de volta ao quarto', function () { RW.Room.goto('sala'); })
      );
      if (st.chamberKey && !st.gearsSolved) {
        list.push(hs([1420, 900, 1700, 1020], 'Porta da câmara de manutenção', function () {
          RW.Dialogs.say({ who: 'vela', text: 'A chave antiga serve. Desça. Não me espere lá; eu não passo da metade.', tone: 'CORDIAL' }, function () {
            RW.Room.goto('manutencao');
          });
        }));
      } else if (st.gearsSolved) {
        list.push(hs([1420, 900, 1700, 1020], 'Continuar até a câmara de manutenção', function () { RW.Room.goto('manutencao'); }));
      }
    } else if (scene === 'manutencao') {
      list.push(
        hs(P.RECTS_MAINT.plate, 'Mecânica (dois pares)', function () { RW.Puzzles.engrenagens.open(); }),
        hs(P.RECTS_MAINT.bench, 'Bancada', function () {
          RW.UI.caption('A bancada guarda chave de fenda, arruela frouxa e marcas de ferramenta em direções que não combinam.');
          RW.Routes.engage('maquina');
        }),
        hs([300, 900, 700, 1030], 'Tubulações', function () {
          RW.UI.caption('As tubulações sobem morno até a máquina lá em cima. O barulho delas é o pulso do farol.');
        }),
        hs([360, 160, 980, 940], 'Voltar à escadaria', function () { RW.Room.goto('escadaria'); })
      );
      if (st.gearsSolved) {
        list.push(hs([1200, 900, 1600, 1030], 'Subir à câmara da luz', function () { RW.Room.goto('luz'); }));
      }
    } else if (scene === 'luz') {
      list.push(
        hs(P.RECTS_LIGHT.lens, 'Lente de fressnel', function () {
          RW.UI.caption('A lente dorme com sete lampiões ao redor. A placa do corredor pede a característica: 3 clarões, pausa, 1 longo.');
          RW.Puzzles.fosforos.open();
        }),
        hs([360, 160, 980, 940], 'Descer à manutenção', function () { RW.Room.goto('manutencao'); })
      );
      if (st.matchesSolved || (st.flags && st.flags.exteriorUnlocked)) {
        list.push(hs([1400, 120, 1760, 300], 'Olhar pelo vidro (exterior)', function () { RW.Room.goto('exterior'); }));
      }
    } else if (scene === 'exterior') {
      list.push(hs([700, 940, 1220, 1040], 'Voltar à câmara da luz', function () { RW.Room.goto('luz'); }));
    }
    return list;
  }

  function renderHotspots() {
    R.hotspotLayer.innerHTML = '';
    R.hotspots = sceneHotspots(R.scene);
    R.hotspots.forEach(function (h) {
      var b = el('button', 'hotspot', R.hotspotLayer);
      b.style.left = ((h.rect[0] / P.W) * 100) + '%';
      b.style.top = ((h.rect[1] / P.H) * 100) + '%';
      b.style.width = ((h.rect[2] - h.rect[0]) / P.W * 100) + '%';
      b.style.height = ((h.rect[3] - h.rect[1]) / P.H * 100) + '%';
      b.setAttribute('aria-label', h.label);
      b.title = h.label;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        RW.Audio.clickSound();
        h.action();
      });
    });
  }

  function goto(scene) {
    if (R.scene === scene) return;
    var st = RW.state;
    R.wrap.classList.add('fade-out');
    setTimeout(function () {
      R.scene = scene;
      st.scene = scene;
      st.sceneEnteredAt = Date.now();
      if (!st.visited) st.visited = {};
      st.visited[scene] = true;
      if (scene === 'escadaria') RW.Routes.engage('legado');
      paintScene();
      renderHotspots();
      showVela('stand', scene);
      R.wrap.classList.remove('fade-out');
      if (scene === 'exterior') {
        RW.Dialogs.sayMany([
          { who: 'room', text: 'Pelo vidro, o mar existe de verdade. Ondas contadas, horizonte reto, farol acesos ao longe. Lá dentro era a mentira; aqui fora é só distância.' },
          { who: 'vela', text: 'Eu não venho aqui. Venho de longe, olhando de cima, como você agora. É bonito demais para vigiar de perto.', tone: 'RESIGNADO' },
          { who: 'room', text: 'O feixe varre a chuva em arco lento. Três clarões, pausa, um longo. O ritmo dela, repetido para o mar até alguém voltar a contar.' }
        ]);
        RW.Audio.setRain(true);
      }
      if (scene === 'manutencao') {
        RW.Dialogs.say({ who: 'vela', text: 'Você está dentro de mim agora, sabia? A manutenção é o meu peito. Cuidado com os dedos.', tone: 'BARGAIN' });
      }
      if (scene === 'luz') {
        RW.Dialogs.say({ who: 'vela', text: 'A câmara da luz é a única sala que eu respeito. Aqui o farol fala sozinho e eu escuto.', tone: 'RESIGNADO' });
      }
      RW.Game.saveCheckpoint();
      RW.SaveSystem.save('current', RW.state);
    }, 220);
  }

  function refreshOverlays() {
    paintScene();
  }

  // Interação com objeto: descrição do quarto + fala de Vela por ato.
  function objectInteraction(id) {
    var st = RW.state;
    var def = RW.Data.objects[id];
    if (!def) return;
    st.examined[id] = (st.examined[id] || 0) + 1;
    if (st.behavior) st.behavior.attentive += 1;
    var desc = def.room[Math.floor(Math.random() * def.room.length)];
    var node = { who: 'room', text: desc };
    var act = Math.min(4, Math.max(1, st.act || 1));
    var lines = def.vela[act] || def.vela[1];
    var pick = lines[Math.floor(Math.random() * lines.length)];
    RW.UI.caption(desc);
    var queue = [node];
    if (id === 'maquina' && st.act >= 3 && st.rewindsOwn >= 7) {
      // no ato III, fala obrigatória priorizada
      queue.push({ who: 'vela', text: RW.Data.objects.maquina.vela[3][0], tone: 'ACUSACAO' });
    } else if (id !== 'retrato' || st.portraitPieces < 5) {
      queue.push({ who: 'vela', text: pick, tone: act >= 3 ? 'ACUSACAO' : (act === 2 ? 'BARGAIN' : 'CORDIAL') });
    }
    // memórias condicionais: objetos relacionados a lembranças perdidas mudam
    if (id === 'prateleira' && st.lostObjects.indexOf('bilhete_navio') >= 0) {
      queue.push({ who: 'room', text: 'O bilhete de papel de navio não está mais na prateleira. O lugar dele parece ligeiramente menos empoeirado que o resto.' });
    }
    if (id === 'janela' && !RW.State.hasMemory(st, 'm7')) {
      queue.push({ who: 'room', text: 'O vidro está seco. Chuva nenhuma corre mais aqui. O silêncio tem bordas.' });
    }
    RW.Dialogs.sayMany(queue, function () {
      if (st.examined[id] === 3) {
        st.behavior.repetitive += 1;
        var fw = fourthWallPick('repetitive');
        if (fw) RW.Dialogs.say({ who: 'vela', text: fw, tone: 'BARGAIN' });
      }
      RW.SaveSystem.save('current', RW.state);
    });
  }

  function fourthWallPick(cond) {
    var arr = RW.Data.fourthWall.filter(function (f) { return f.cond === cond; });
    if (!arr.length) return null;
    var f = arr[Math.floor(Math.random() * arr.length)];
    return f.text;
  }

  function setVela(mode) { showVela(mode, R.scene); }

  RW.Room = {
    init: init,
    goto: goto,
    refreshOverlays: refreshOverlays,
    objectInteraction: objectInteraction,
    setVela: setVela,
    showVela: showVela,
    renderHotspots: renderHotspots,
    paintScene: paintScene,
    currentScene: function () { return R.scene; }
  };
  RW.Portrait = Portrait;
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
