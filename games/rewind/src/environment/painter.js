/* Painter — direção de arte procedural 2D top-down (Canvas).
   Paleta azul-acinzentada, madeira envelhecida, amarelo doentio, chuva, poeira.
   Cenas estáticas pintadas uma vez; camada animada (chuva/poeira/flicker/feixe) por rAF. */
(function (RW) {
  'use strict';

  var W = 1920, H = 1080;
  var PAL = {
    floorA: '#3a4150', floorB: '#343b49', plank: '#2e3542', grain: '#272d38',
    wallA: '#232833', wallB: '#1b202a', stone: '#262c37',
    wood: '#4a4238', wood2: '#3e372e', metal: '#3c434e', metal2: '#2b313a',
    rust: '#5d4433', brass: '#6b5a35', brass2: '#57481f',
    yellow: '#c9b23c', yellowDim: '#8d7c2a', glass: '#47556b',
    water: '#41556e', waterHi: '#5a7292', shadow: 'rgba(8,10,14,0.55)',
    velaHair: '#1d222b', velaCoat: '#333b4a', velaSkin: '#8a7a6b', rug: '#2c3340', rug2: '#252b36'
  };

  function rnd(seed) { // pseudo-aleatório determinístico
    var s = seed;
    return function () {
      s = (s * 16807 + 11) % 2147483647;
      return (s & 0xffff) / 0xffff;
    };
  }

  function plankFloor(ctx, x0, y0, x1, y1, seed) {
    var r = rnd(seed);
    var h = 46;
    for (var y = y0; y < y1; y += h) {
      var off = (r() * 300) | 0;
      for (var x = x0 - off; x < x1; x += 300 + (r() * 90 | 0)) {
        var w = 280 + (r() * 100 | 0);
        ctx.fillStyle = r() > 0.5 ? PAL.floorA : PAL.floorB;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(Math.max(x0, x), y, Math.min(w, x1 - x), h - 2);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = PAL.plank;
        ctx.strokeRect(Math.max(x0, x) + 0.5, y + 0.5, Math.min(w, x1 - x) - 1, h - 2);
        // veios
        ctx.strokeStyle = PAL.grain;
        ctx.beginPath();
        var gy = y + 8 + r() * (h - 20);
        ctx.moveTo(Math.max(x0, x), gy);
        ctx.lineTo(Math.max(x0, x) + w - 2, gy + (r() - 0.5) * 6);
        ctx.stroke();
      }
    }
  }

  function stoneWall(ctx, rect, seed) {
    var r = rnd(seed);
    ctx.fillStyle = PAL.wallA;
    ctx.fillRect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]);
    for (var i = 0; i < 90; i++) {
      ctx.fillStyle = r() > 0.5 ? PAL.stone : PAL.wallB;
      ctx.globalAlpha = 0.35 + r() * 0.3;
      ctx.fillRect(rect[0] + r() * (rect[2] - rect[0]), rect[1] + r() * (rect[3] - rect[1]), 18 + r() * 40, 10 + r() * 22);
      ctx.globalAlpha = 1;
    }
  }

  function shadowUnder(ctx, x, y, rx, ry) {
    var g = ctx.createRadialGradient(x, y, 4, x, y, rx);
    g.addColorStop(0, PAL.shadow);
    g.addColorStop(1, 'rgba(8,10,14,0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(0, 0);
    ctx.scale(1, ry / rx);
    ctx.beginPath();
    ctx.arc(x, y / (ry / rx), rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------------- SALA PRINCIPAL -------------------------------------------
  var RECTS = {
    window: [330, 30, 610, 125],
    calendar: [680, 35, 800, 125],
    door: [120, 170, 300, 560],
    table: [340, 470, 700, 700],
    radio: [360, 480, 500, 590],
    glass: [540, 560, 600, 620],
    portrait: [604, 528, 676, 610],
    caderno: [588, 636, 676, 684],
    chair: [730, 470, 830, 680],
    rug: [760, 720, 1240, 930],
    bed: [1180, 240, 1680, 560],
    machine: [1350, 600, 1800, 1010],
    shelf: [1690, 170, 1870, 390],
    velaStand: [810, 640, 930, 760],
    velaSit: [940, 760, 1060, 880]
  };

  function paintRoom(ctx) {
    ctx.fillStyle = PAL.wallB;
    ctx.fillRect(0, 0, W, H);
    plankFloor(ctx, 90, 150, 1830, 1080, 7);
    stoneWall(ctx, [0, 0, W, 150], 11);
    stoneWall(ctx, [0, 0, 90, 1080], 13);
    stoneWall(ctx, [1830, 0, W, 1080], 17);

    // janela
    var win = RECTS.window;
    ctx.fillStyle = PAL.metal2;
    ctx.fillRect(win[0] - 12, win[1] - 12, win[2] - win[0] + 24, win[3] - win[1] + 24);
    ctx.fillStyle = PAL.glass;
    ctx.fillRect(win[0], win[1], win[2] - win[0], win[3] - win[1]);
    ctx.strokeStyle = 'rgba(200,215,235,0.18)';
    for (var i = 0; i < 9; i++) {
      ctx.beginPath();
      var wx = win[0] + 14 + i * ((win[2] - win[0]) / 9);
      ctx.moveTo(wx, win[1]);
      ctx.lineTo(wx - 6, win[3]);
      ctx.stroke();
    }
    ctx.fillStyle = PAL.metal2;
    ctx.fillRect(win[0], (win[1] + win[3]) / 2 - 4, win[2] - win[0], 8);

    // calendário
    var cal = RECTS.calendar;
    ctx.fillStyle = '#d8d2c4';
    ctx.globalAlpha = 0.85;
    ctx.fillRect(cal[0], cal[1], cal[2] - cal[0], cal[3] - cal[1]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#7c7568';
    for (var d = 0; d < 12; d++) {
      ctx.fillRect(cal[0] + 8 + (d % 4) * 27, cal[1] + 34 + Math.floor(d / 4) * 20, 18, 12);
    }
    ctx.strokeStyle = '#4a4438';
    ctx.strokeRect(cal[0] + 0.5, cal[1] + 0.5, cal[2] - cal[0] - 1, cal[3] - cal[1] - 1);

    // porta de ferro
    var door = RECTS.door;
    ctx.fillStyle = PAL.metal;
    ctx.fillRect(door[0], door[1], door[2] - door[0], door[3] - door[1]);
    ctx.strokeStyle = PAL.metal2;
    for (var t = 0; t < 5; t++) {
      var ly = door[1] + 44 + t * 66;
      ctx.fillStyle = PAL.rust;
      ctx.fillRect(door[0] + 18, ly, 48, 14);
      ctx.fillRect(door[2] - 66, ly, 48, 14);
    }
    ctx.fillStyle = PAL.metal2;
    ctx.fillRect(door[0], door[1], door[2] - door[0], 10);
    ctx.fillRect(door[0], door[3] - 10, door[2] - door[0], 10);

    // mesa
    var tab = RECTS.table;
    shadowUnder(ctx, (tab[0] + tab[2]) / 2, tab[3] + 14, (tab[2] - tab[0]) / 2, 30);
    ctx.fillStyle = PAL.wood;
    ctx.fillRect(tab[0], tab[1], tab[2] - tab[0], tab[3] - tab[1]);
    ctx.strokeStyle = PAL.wood2;
    ctx.strokeRect(tab[0] + 0.5, tab[1] + 0.5, tab[2] - tab[0] - 1, tab[3] - tab[1] - 1);
    // rádio
    var ra = RECTS.radio;
    ctx.fillStyle = PAL.wood2;
    ctx.fillRect(ra[0], ra[1], ra[2] - ra[0], ra[3] - ra[1]);
    ctx.fillStyle = PAL.brass;
    ctx.beginPath();
    ctx.arc(ra[0] + 34, ra[1] + 38, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.metal2;
    ctx.fillRect(ra[0] + 74, ra[1] + 22, 56, 32);
    ctx.fillStyle = PAL.glass;
    ctx.fillRect(ra[0] + 74, ra[1] + 62, 56, 22);
    // copo
    ctx.fillStyle = PAL.water;
    ctx.beginPath();
    ctx.arc((RECTS.glass[0] + RECTS.glass[2]) / 2, (RECTS.glass[1] + RECTS.glass[3]) / 2, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.waterHi;
    ctx.beginPath();
    ctx.arc((RECTS.glass[0] + RECTS.glass[2]) / 2 - 6, (RECTS.glass[1] + RECTS.glass[3]) / 2 - 6, 10, 0, Math.PI * 2);
    ctx.fill();
    // retrato
    ctx.fillStyle = '#c9c2b0';
    ctx.fillRect(RECTS.portrait[0], RECTS.portrait[1], 72, 82);
    ctx.strokeStyle = PAL.brass2;
    ctx.strokeRect(RECTS.portrait[0] + 3.5, RECTS.portrait[1] + 3.5, 65, 75);
    // caderno
    ctx.fillStyle = '#4d3f34';
    ctx.fillRect(RECTS.caderno[0], RECTS.caderno[1], 88, 48);
    ctx.strokeStyle = '#2e261f';
    ctx.strokeRect(RECTS.caderno[0] + 0.5, RECTS.caderno[1] + 0.5, 87, 47);

    // cadeira + casaco
    var ch = RECTS.chair;
    shadowUnder(ctx, (ch[0] + ch[2]) / 2, ch[3] + 10, 60, 22);
    ctx.fillStyle = PAL.wood2;
    ctx.fillRect(ch[0], ch[1], ch[2] - ch[0], ch[3] - ch[1]);
    ctx.fillStyle = '#3d4451';
    ctx.fillRect(ch[0] + 8, ch[1] + 8, ch[2] - ch[0] - 16, ch[3] - ch[1] - 16);

    // tapete
    var rug = RECTS.rug;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse((rug[0] + rug[2]) / 2, (rug[1] + rug[3]) / 2, (rug[2] - rug[0]) / 2, (rug[3] - rug[1]) / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = PAL.rug;
    ctx.fill();
    ctx.strokeStyle = PAL.rug2;
    ctx.beginPath();
    ctx.ellipse((rug[0] + rug[2]) / 2, (rug[1] + rug[3]) / 2, (rug[2] - rug[0]) / 2 - 26, (rug[3] - rug[1]) / 2 - 22, 0, 0, Math.PI * 2.6);
    ctx.stroke();
    ctx.restore();

    // cama
    var bed = RECTS.bed;
    shadowUnder(ctx, (bed[0] + bed[2]) / 2, bed[3] + 14, (bed[2] - bed[0]) / 2, 34);
    ctx.fillStyle = PAL.wood;
    ctx.fillRect(bed[0], bed[1], bed[2] - bed[0], bed[3] - bed[1]);
    ctx.fillStyle = '#424a58';
    ctx.fillRect(bed[0] + 14, bed[1] + 14, bed[2] - bed[0] - 28, bed[3] - bed[1] - 28);
    ctx.fillStyle = '#5a6373';
    ctx.fillRect(bed[0] + 24, bed[1] + 24, 150, bed[3] - bed[1] - 48);

    // máquina do farol
    var ma = RECTS.machine;
    shadowUnder(ctx, (ma[0] + ma[2]) / 2, ma[3], (ma[2] - ma[0]) / 2, 40);
    ctx.fillStyle = PAL.metal;
    ctx.fillRect(ma[0], ma[1], ma[2] - ma[0], ma[3] - ma[1]);
    ctx.fillStyle = PAL.brass;
    ctx.beginPath();
    ctx.arc((ma[0] + ma[2]) / 2, ma[1] + 120, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.brass2;
    ctx.beginPath();
    ctx.arc((ma[0] + ma[2]) / 2, ma[1] + 120, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.metal2;
    ctx.fillRect(ma[0] + 40, ma[1] + 260, ma[2] - ma[0] - 80, 130);
    ctx.fillStyle = PAL.rust;
    for (var p = 0; p < 4; p++) {
      ctx.fillRect(ma[0] + 60 + p * 90, ma[3] - 90, 22, 60);
    }
    ctx.fillStyle = PAL.glass;
    ctx.beginPath();
    ctx.arc((ma[0] + ma[2]) / 2, ma[1] + 120, 26, 0, Math.PI * 2);
    ctx.fill();

    // prateleira
    var sh = RECTS.shelf;
    ctx.fillStyle = PAL.wood2;
    ctx.fillRect(sh[0], sh[1], sh[2] - sh[0], 18);
    ctx.fillRect(sh[0] + 10, sh[1] + 90, sh[2] - sh[0] - 20, 18);
    ctx.fillStyle = PAL.water;
    ctx.beginPath();
    ctx.arc(sh[0] + 44, sh[1] + 46, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfc6b0';
    ctx.fillRect(sh[0] + 90, sh[1] + 26, 26, 36);
    ctx.fillStyle = '#55503f';
    ctx.fillRect(sh[0] + 140, sh[1] + 118, 34, 10);

    // lâmpada pendente + halo
    var g = ctx.createRadialGradient(960, 340, 40, 960, 420, 700);
    g.addColorStop(0, 'rgba(201,178,60,0.30)');
    g.addColorStop(0.4, 'rgba(201,178,60,0.10)');
    g.addColorStop(1, 'rgba(201,178,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(200, 120, 1500, 940);
    ctx.fillStyle = PAL.metal2;
    ctx.fillRect(950, 0, 20, 110);
    ctx.fillStyle = PAL.yellow;
    ctx.beginPath();
    ctx.arc(960, 128, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------------- ESCADARIA / CORREDOR DA MEMÓRIA ---------------------------
  var RECTS_STAIRS = {
    alcove: [1230, 470, 1650, 830],
    records: [280, 680, 520, 880],
    mirror: [1330, 560, 1560, 760]
  };
  function paintStairs(ctx) {
    ctx.fillStyle = PAL.wallB;
    ctx.fillRect(0, 0, W, H);
    plankFloor(ctx, 140, 120, 1780, 1060, 23);
    stoneWall(ctx, [0, 0, W, 120], 29);
    // degraus descendo para dentro do farol (top-down: faixas escurecendo)
    for (var i = 0; i < 7; i++) {
      ctx.fillStyle = 'rgba(10,13,18,' + (0.10 + i * 0.09) + ')';
      ctx.fillRect(360, 160 + i * 110, 620, 100);
      ctx.strokeStyle = PAL.metal2;
      ctx.strokeRect(360, 160 + i * 110, 620, 100);
    }
    // guarda-corpo
    ctx.fillStyle = PAL.metal2;
    ctx.fillRect(980, 150, 26, 900);
    // recuo do corredor
    ctx.fillStyle = PAL.wallA;
    ctx.fillRect(1030, 150, 760, 860);
    plankFloor(ctx, 1030, 150, 1790, 1010, 31);
    // alcova dos cacos
    var al = RECTS_STAIRS.alcove;
    ctx.fillStyle = PAL.metal2;
    ctx.fillRect(al[0], al[1], al[2] - al[0], al[3] - al[1]);
    ctx.fillStyle = PAL.glass;
    ctx.fillRect(al[0] + 14, al[1] + 14, al[2] - al[0] - 28, al[3] - al[1] - 28);
    // três cacos em suportes
    var r = rnd(41);
    for (var c = 0; c < 3; c++) {
      var cx = al[0] + 60 + c * 90, cy = al[1] + 70 + c * 60;
      ctx.fillStyle = '#6d7d95';
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((r() - 0.5) * 1.2);
      ctx.beginPath();
      ctx.moveTo(0, -34); ctx.lineTo(20, 18); ctx.lineTo(-18, 14); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // caixa de registros
    var rc = RECTS_STAIRS.records;
    shadowUnder(ctx, (rc[0] + rc[2]) / 2, rc[3], 120, 34);
    ctx.fillStyle = '#4a4234';
    ctx.fillRect(rc[0], rc[1], rc[2] - rc[0], rc[3] - rc[1]);
    ctx.strokeStyle = '#2e2820';
    ctx.strokeRect(rc[0] + 0.5, rc[1] + 0.5, rc[2] - rc[0] - 1, rc[3] - rc[1] - 1);
    ctx.fillStyle = '#cfc6b0';
    for (var f = 0; f < 3; f++) ctx.fillRect(rc[0] + 18 + f * 14, rc[1] + 22, 10, 64);
    // janela alta com facho
    var lg = ctx.createRadialGradient(1360, 200, 20, 1360, 300, 520);
    lg.addColorStop(0, 'rgba(210,220,240,0.22)');
    lg.addColorStop(1, 'rgba(210,220,240,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(1030, 120, 780, 900);
  }

  // ---------------- CÂMARA DE MANUTENÇÃO --------------------------------------
  var RECTS_MAINT = { bench: [180, 150, 920, 360], plate: [1000, 300, 1760, 720] };
  function paintMaintenance(ctx) {
    ctx.fillStyle = PAL.wallB;
    ctx.fillRect(0, 0, W, H);
    // piso metálico
    for (var x = 120; x < 1800; x += 90) {
      for (var y = 120; y < 1060; y += 90) {
        ctx.fillStyle = ((x + y) % 180 === 0) ? PAL.metal : PAL.metal2;
        ctx.fillRect(x, y, 88, 88);
        ctx.strokeStyle = '#20252d';
        ctx.strokeRect(x + 0.5, y + 0.5, 88, 88);
      }
    }
    stoneWall(ctx, [0, 0, W, 120], 43);
    // bancada
    var b = RECTS_MAINT.bench;
    shadowUnder(ctx, (b[0] + b[2]) / 2, b[3] + 10, 380, 40);
    ctx.fillStyle = PAL.wood2;
    ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
    ctx.fillStyle = '#3a332b';
    ctx.fillRect(b[0] + 12, b[1] + 12, b[2] - b[0] - 24, b[3] - b[1] - 24);
    ctx.fillStyle = PAL.rust;
    ctx.fillRect(b[0] + 60, b[1] + 40, 120, 26);
    ctx.fillRect(b[0] + 220, b[1] + 70, 40, 90);
    // placa dos dois pares
    var pl = RECTS_MAINT.plate;
    ctx.fillStyle = PAL.metal;
    ctx.fillRect(pl[0], pl[1], pl[2] - pl[0], pl[3] - pl[1]);
    ctx.strokeStyle = PAL.brass2;
    ctx.strokeRect(pl[0] + 10.5, pl[1] + 10.5, pl[2] - pl[0] - 21, pl[3] - pl[1] - 21);
    // dois eixos com espaço para pares
    ctx.fillStyle = PAL.metal2;
    ctx.beginPath();
    ctx.arc(pl[0] + 220, pl[1] + 200, 120, 0, Math.PI * 2);
    ctx.arc(pl[0] + 560, pl[1] + 200, 120, 0, Math.PI * 2);
    ctx.fill();
    // engrenagens soltas
    var gs = [12, 24, 18, 36];
    for (var g = 0; g < 4; g++) {
      var gx = 330 + g * 210, gy = 860;
      ctx.fillStyle = PAL.brass;
      ctx.beginPath();
      ctx.arc(gx, gy, 26 + gs[g] / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.metal2;
      ctx.beginPath();
      ctx.arc(gx, gy, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    // tubulações
    ctx.strokeStyle = PAL.rust;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(120, 960);
    ctx.bezierCurveTo(600, 990, 1200, 930, 1800, 980);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  // ---------------- CÂMARA DA LUZ ---------------------------------------------
  var RECTS_LIGHT = { lens: [640, 260, 1280, 800] };
  function paintLight(ctx) {
    ctx.fillStyle = PAL.wallB;
    ctx.fillRect(0, 0, W, H);
    // piso gradeado
    for (var x = 140; x < 1800; x += 60) {
      ctx.fillStyle = PAL.metal2;
      ctx.fillRect(x, 100, 14, 940);
      ctx.fillStyle = PAL.metal;
      ctx.fillRect(x + 30, 100, 8, 940);
    }
    // painéis de vidro com chuva lá fora
    ctx.strokeStyle = PAL.glass;
    ctx.lineWidth = 6;
    ctx.strokeRect(120, 90, 1680, 880);
    ctx.lineWidth = 1;
    // lente central
    var le = RECTS_LIGHT.lens;
    var cx = (le[0] + le[2]) / 2, cy = (le[1] + le[3]) / 2;
    var g = ctx.createRadialGradient(cx, cy, 60, cx, cy, 330);
    g.addColorStop(0, 'rgba(201,178,60,0.55)');
    g.addColorStop(0.55, 'rgba(141,124,42,0.35)');
    g.addColorStop(1, 'rgba(141,124,42,0)');
    ctx.fillStyle = g;
    ctx.fillRect(le[0] - 260, le[1] - 260, (le[2] - le[0]) + 520, (le[3] - le[1]) + 520);
    ctx.fillStyle = PAL.glass;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.brass;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    // anel de sete lampiões
    for (var i = 0; i < 7; i++) {
      var a = (i / 7) * Math.PI * 2 - Math.PI / 2;
      var lx = cx + Math.cos(a) * 330, ly = cy + Math.sin(a) * 330;
      ctx.fillStyle = PAL.metal2;
      ctx.beginPath();
      ctx.arc(lx, ly, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.yellowDim;
      ctx.beginPath();
      ctx.arc(lx, ly, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------------- EXTERIOR IMPOSSÍVEL ----------------------------------------
  function paintExterior(ctx) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#10141c');
    g.addColorStop(0.6, '#182030');
    g.addColorStop(1, '#0c0f16');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // mar
    var sea = ctx.createLinearGradient(0, H * 0.55, 0, H);
    sea.addColorStop(0, '#1d2b3c');
    sea.addColorStop(1, '#0a0e14');
    ctx.fillStyle = sea;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    var r = rnd(97);
    // estrelas
    for (var i = 0; i < 130; i++) {
      ctx.fillStyle = 'rgba(200,210,230,' + (0.15 + r() * 0.5) + ')';
      ctx.fillRect(r() * W, r() * H * 0.5, 2, 2);
    }
    // farol distante
    ctx.fillStyle = '#141922';
    ctx.fillRect(1450, 300, 60, 260);
    ctx.fillStyle = PAL.yellow;
    ctx.fillRect(1450, 270, 60, 34);
  }

  RW.Painter = {
    W: W, H: H, PAL: PAL, RECTS: RECTS,
    RECTS_STAIRS: RECTS_STAIRS, RECTS_MAINT: RECTS_MAINT, RECTS_LIGHT: RECTS_LIGHT,
    paintRoom: paintRoom,
    paintStairs: paintStairs,
    paintMaintenance: paintMaintenance,
    paintLight: paintLight,
    paintExterior: paintExterior
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = RW.Painter;
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
