/* Board — painel de jacks (SVG), cabos de ligação, fichas, lâmpadas, apito de teste,
   armário do registrador, sincronização e eventos da linha morta. */
(function (LM) {
  'use strict';

  var B = { svg: null, tray: null, log: null, selectedTicket: null, selA: null, cords: [], sequence: [], lamps: [] };

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function init(boardId, trayId, logId) {
    B.svg = document.getElementById(boardId);
    B.tray = document.getElementById(trayId);
    B.log = document.getElementById(logId);
    buildPanel();
  }

  function jackPos(row, i) {
    if (row === 'A') return { x: 90 + i * 128, y: 300 };
    return { x: 90 + i * 128, y: 560 };
  }

  function buildPanel() {
    B.svg.innerHTML = '';
    // fundo
    svgEl('rect', { x: 0, y: 0, width: 1200, height: 700, fill: '#1d2126', rx: 10 }, B.svg);
    // filete de madeira
    svgEl('rect', { x: 20, y: 40, width: 1160, height: 620, fill: '#2a2320', rx: 6 }, B.svg);
    // lâmpadas normais
    B.lamps = [];
    for (var i = 0; i < 8; i++) {
      var lx = 90 + i * 128;
      var lamp = svgEl('circle', { cx: lx, cy: 110, r: 13, fill: '#3a3f47', stroke: '#565e6a' }, B.svg);
      B.lamps.push(lamp);
    }
    // lâmpada isolada (linha morta)
    var deadLamp = svgEl('circle', { cx: 1108, cy: 110, r: 15, fill: '#4a2b28', stroke: '#7a4a42', 'stroke-dasharray': '3,3' }, B.svg);
    B.deadLamp = deadLamp;
    svgEl('text', { x: 1108, y: 150, fill: '#8b96a6', 'font-size': 11, 'text-anchor': 'middle' }, B.svg).textContent = 'sem jack';
    // jacks
    ['A', 'B'].forEach(function (row) {
      for (var j = 0; j < 8; j++) {
        (function (r, idx) {
          var p = jackPos(r, idx);
          var g = svgEl('g', { 'data-jack': r + (idx + 1), class: 'jack' }, B.svg);
          svgEl('circle', { cx: p.x, cy: p.y, r: 19, fill: '#191d22', stroke: '#6b5a35', 'stroke-width': 3 }, g);
          svgEl('circle', { cx: p.x, cy: p.y, r: 8, fill: '#0e1114' }, g);
          svgEl('text', { x: p.x, y: p.y + (r === 'A' ? -30 : 38), fill: '#8b96a6', 'font-size': 12, 'text-anchor': 'middle' }, g).textContent = r + (idx + 1);
          svgEl('circle', { cx: p.x, cy: p.y, r: 26, fill: 'transparent', cursor: 'pointer' }, g).addEventListener('click', function () {
            LM.Board.jackClick(r, idx);
          });
        })(row, j);
      }
    });
    // jack solto da linha morta
    var dj = svgEl('g', { 'data-jack': 'morto', class: 'jack jack-dead' }, B.svg);
    svgEl('circle', { cx: 1108, cy: 430, r: 19, fill: '#191d22', stroke: '#7a4a42', 'stroke-width': 3, 'stroke-dasharray': '4,4' }, dj);
    svgEl('circle', { cx: 1108, cy: 430, r: 8, fill: '#0e1114' }, dj);
    svgEl('text', { x: 1108, y: 480, fill: '#8b96a6', 'font-size': 12, 'text-anchor': 'middle' }, dj).textContent = 'solto';
    svgEl('circle', { cx: 1108, cy: 430, r: 26, fill: 'transparent', cursor: 'pointer' }, dj).addEventListener('click', function () {
      LM.Board.deadJackClick();
    });
    // rótulos
    svgEl('text', { x: 30, y: 300, fill: '#8d7c2a', 'font-size': 14 }, B.svg).textContent = 'ENTRADAS';
    svgEl('text', { x: 30, y: 560, fill: '#8d7c2a', 'font-size': 14 }, B.svg).textContent = 'SAÍDAS';
    svgEl('text', { x: 30, y: 70, fill: '#8b96a6', 'font-size': 11 }, B.svg).textContent = 'CENTRAL RIACHUELO 4 — PAINEL 7';
  }

  function lightLamp(idx, color) {
    if (B.lamps[idx]) B.lamps[idx].setAttribute('fill', color || '#c9b23c');
  }
  function dimLamps() {
    B.lamps.forEach(function (l) { l.setAttribute('fill', '#3a3f47'); });
    if (B.deadLamp) B.deadLamp.setAttribute('fill', '#4a2b28');
  }
  function lightDead() {
    if (B.deadLamp) B.deadLamp.setAttribute('fill', '#a83f36');
  }

  function renderTickets(tickets) {
    B.tray.innerHTML = '';
    tickets.forEach(function (t) {
      var card = el('div', 'ticket ' + t.color + (t.personal ? ' personal' : ''), B.tray);
      var name = t.personal ? ('ficha de ponto — ' + ((LM.state && LM.state.codinome) || 'OP. 7')) : ('ficha ' + t.num);
      var route = t.from + ' → ' + (t.to ? t.to : 'sem destino');
      var inPart = t.entrada ? (' · entrada ' + t.entrada) : '';
      card.innerHTML = '<strong>' + name + '</strong><span>' + route + inPart + '</span>';
      card.setAttribute('data-ticket', t.id);
      card.addEventListener('click', function () {
        selectTicket(t.id);
      });
      if (B.selectedTicket === t.id) card.classList.add('selected');
      if (t.done) card.classList.add('done');
    });
    if (!tickets.length) {
      var empty = el('div', 'tray-empty', B.tray);
      empty.textContent = 'Bandeja vazia. Todas as fichas do turno foram conectadas.';
    }
  }

  function selectTicket(id) {
    B.selectedTicket = id;
    B.selA = null;
    deadArmed = false;
    var st = LM.state;
    var t = st.ticketsQueue.filter(function (x) { return x.id === id; })[0];
    if (t && !t.done) {
      LM.Audio.relay(0.08);
      var label = t.personal ? ('ficha de ponto — ' + (st.codinome || 'OP. 7')) : ('Ficha ' + t.num);
      var ends = [];
      ends.push(t.entrada ? ('entrada ' + t.entrada) : 'sem entrada registrada');
      ends.push(t.to ? ('saída ' + t.to) : 'sem saída impressa');
      LM.Terminal.push({ who: 'manual', text: label + ' selecionada: ' + ends.join(', ') + '. Escolha no painel.' });
    }
    renderTickets(st.ticketsQueue);
  }

  function jackClick(row, idx) {
    if (LM.Terminal.isOpen()) {
      LM.Terminal.push({ who: 'manual', text: 'Termine a leitura antes de mexer nos cabos. A central não pressiona ninguém — mas registra.' });
      return;
    }
    LM.Audio.relay();
    var st = LM.state;
    if (!B.selectedTicket) {
      LM.Terminal.push({ who: 'manual', text: 'Selecione uma ficha na bandeja antes de conectar.' });
      return;
    }
    var t = st.ticketsQueue.filter(function (x) { return x.id === B.selectedTicket; })[0];
    if (!t || t.done) return;
    if (row === 'A') {
      B.selA = idx;
      LM.Terminal.push({ who: 'manual', text: 'Entrada A' + (idx + 1) + ' presa. Escolha a saída.' });
      return;
    }
    if (B.selA === null) {
      LM.Terminal.push({ who: 'manual', text: 'Escolha primeiro a entrada (A).' });
      return;
    }
    attemptConnect(t, B.selA, idx);
  }

  // Jack morto (AUD-01): a conexão física acontece no próprio painel — clique
  // com uma ficha na mão arma a intenção; o segundo clique conecta (§6.5).
  var deadArmed = false;
  function deadJackClick() {
    if (LM.Terminal.isOpen()) {
      LM.Terminal.push({ who: 'manual', text: 'Termine a leitura antes de mexer nos cabos. O painel espera.' });
      return;
    }
    LM.Audio.relay(0.1);
    var st = LM.state;
    var t = B.selectedTicket ? st.ticketsQueue.filter(function (x) { return x.id === B.selectedTicket; })[0] : null;
    if (!t || t.done) {
      deadArmed = false;
      LM.Terminal.push({ who: 'manual', text: 'O jack solto não consta no inventário. Conectar algo nele é escolha de operadora, não de manual.' });
      return;
    }
    if (!deadArmed) {
      deadArmed = true;
      LM.Terminal.push({ who: 'manual', text: 'Ficha ' + (t.personal ? 'de ponto' : t.num) + ' na mão, jack solto no painel. Conectar fora do inventário é decisão sua, não do manual. Clique de novo para confirmar.' });
      return;
    }
    deadArmed = false;
    connectTicketToDead(t);
    renderTickets(st.ticketsQueue);
  }

  function drawCord(a, b, color) {
    var pa = jackPos('A', a), pb = jackPos('B', b);
    var mx = (pa.x + pb.x) / 2;
    var path = svgEl('path', {
      d: 'M ' + pa.x + ' ' + pa.y + ' C ' + mx + ' ' + (pa.y + 90) + ', ' + mx + ' ' + (pb.y - 90) + ', ' + pb.x + ' ' + pb.y,
      fill: 'none', stroke: color || '#5d4433', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.9
    }, B.svg);
    B.cords.push(path);
  }

  function drawToDead(color) {
    var pa = { x: 1108, y: 300 };
    var path = svgEl('path', {
      d: 'M 1108 300 C 1108 350, 1108 380, 1108 430',
      fill: 'none', stroke: color || '#7a4a42', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.9
    }, B.svg);
    B.cords.push(path);
  }

  function attemptConnect(t, a, b) {
    var st = LM.state;
    var isFirstOfDay = st.connections.length === 0;
    var check = LM.Logic.validateConnection(t, a, b, st.night, isFirstOfDay);
    if (!check.ok) {
      st.wrongConnections += 1;
      LM.Audio.lineStatic(true);
      setTimeout(function () { LM.Audio.lineStatic(false); }, 700);
      LM.Terminal.push({ who: 'manual', text: 'Conexão recusada pelo manual: ' + check.rule });
      B.selA = null;
      return;
    }
    var expected = LM.Logic.correctOrder(st.ticketsQueue.filter(function (x) { return !x.done; }));
    if (expected[0] !== t.id) {
      st.wrongConnections += 1;
      var expectedT = st.ticketsQueue.filter(function (x) { return x.id === expected[0]; })[0];
      LM.Terminal.push({ who: 'ferreira', text: 'Precedência errada. O manual: "' + LM.Logic.MANUAL_RULES.ORDER + '" — a próxima é a ficha ' + expectedT.num + '.' });
      B.selA = null;
      return;
    }
    // conexão aceita
    t.done = true;
    st.connections.push({ ticketId: t.id, a: a, b: b });
    B.sequence.push(t.id);
    drawCord(a, b, t.color === 'vermelha' ? '#6e3f38' : '#3f5568');
    LM.Audio.relay(0.16);
    lightLamp(b, '#c9b23c');
    LM.Terminal.push({ who: 'manual', text: 'Ficha ' + (t.personal ? 'de ponto' : t.num) + ' conectada: A' + (a + 1) + ' → B' + (b + 1) + '. Chamada em curso.' });
    st.shiftLog.push({ night: st.night, text: 'ficha ' + t.num + ' A' + (a + 1) + '→B' + (b + 1) });
    renderTickets(st.ticketsQueue);
    B.selectedTicket = null; B.selA = null;
    LM.SaveSystem.save('current', st);
    // Ficha de ponto no jack B6 (turno 5): rota física para o segredo de Ivone.
    if (t.personal && st.night === 5 && b === 5) { LM.Night.onIvoneConnected(t); return; }
    LM.Night.onTicketDone();
  }

  function connectTicketToDead(t) {
    var st = LM.state;
    t.done = true;
    st.connections.push({ ticketId: t.id, a: -1, b: -1 });
    B.sequence.push(t.id);
    drawToDead(t.color === 'vermelha' ? '#6e3f38' : '#3f5568');
    LM.Audio.lineStatic(true);
    setTimeout(function () { LM.Audio.lineStatic(false); }, 1200);
    lightDead();
    LM.SaveSystem.save('current', st);
    renderTickets(st.ticketsQueue);
    LM.Night.onDeadConnected(t);
  }

  function resetCords() {
    B.cords.forEach(function (c) { if (c.parentNode) c.parentNode.removeChild(c); });
    B.cords = [];
    B.sequence = [];
    B.selectedTicket = null; B.selA = null;
    dimLamps();
    renderTickets(LM.state.ticketsQueue);
  }

  // ---------------- APITO DE TESTE (noite 2) ----------------------------------
  var toneProfiles = [
    { freq: 1000, noise: 0.1 }, { freq: 0, noise: 0 }, { freq: 1000, noise: 0.2 }, { freq: 1000, noise: 0.1 }
  ];
  var toneOpened = false;

  function openToneTest() {
    if (toneOpened) { LM.Terminal.push({ who: 'ferreira', text: 'Apito de teste já usado esta noite. Feche o painel de diagnóstico.' }); return; }
    toneOpened = true;
    var wrap = el('div', 'puzzle-panel');
    wrap.innerHTML = '<h3>Apito de teste</h3><p class="puzzle-intro">Quatro linhas na bancada de diagnóstico. O manual: linha viva devolve tom de 1000Hz limpo; linha morta devolve silêncio com respiração. Identifique a linha morta e registre no livro.</p>';
    var btns = el('div', 'puzzle-actions', wrap);
    for (var i = 0; i < 4; i++) {
      (function (idx) {
        var b = el('button', '', btns);
        b.textContent = 'Testar linha ' + (idx + 1);
        b.addEventListener('click', function () {
          var res = LM.Logic.analyzeTone(toneProfiles[idx]);
          LM.Audio.testTone(res.dead);
          LM.Terminal.push({ who: 'manual', text: 'Linha ' + (idx + 1) + ': ' + res.label + '.' });
        });
      })(i);
    }
    var report = el('button', '', btns);
    report.textContent = 'Registrar no livro a linha morta';
    report.addEventListener('click', function () {
      var inp = el('input', '', wrap);
      inp.placeholder = 'número da linha morta (1-4)';
      var ok = el('button', '', wrap);
      ok.textContent = 'Confirmar registro';
      ok.addEventListener('click', function () {
        var guess = parseInt(inp.value, 10);
        if (LM.Logic.findDeadLine(toneProfiles) + 1 === guess) {
          LM.Terminal.push({ who: 'ferreira', text: '"Registro aceito. Linha morta na bancada é fadiga. Não é novidade." — Ferreira, sem convicção.' });
          LM.State.addFact(LM.state, 'manual_teste');
          LM.SaveSystem.save('current', LM.state);
          LM.UI.closePanel();
        } else {
          LM.Terminal.push({ who: 'manual', text: 'Registro inconsistente com o diagnóstico. Teste de novo.' });
          inp.value = '';
        }
      });
    });
    LM.UI.openPanel(wrap);
  }

  // ---------------- ARMÁRIO DO REGISTRADOR (noite 3, fichas de cor) ------------
  function openCabinet() {
    var wrap = el('div', 'puzzle-panel');
    wrap.innerHTML = '<h3>Armário do registrador</h3>' +
      '<p class="puzzle-intro">Quatro fichas de cor travam o armário. No caderno da Ivone, rabiscado na contracapa: <em>"azul, azul, vermelha, azul — a ordem que aprendi dela"</em>.</p>';
    var picked = [];
    var slots = el('div', 'chip-slots', wrap);
    for (var i = 0; i < 4; i++) {
      var s = el('div', 'chip-slot', slots);
      s.textContent = '?';
    }
    var colors = el('div', 'puzzle-actions', wrap);
    ['azul', 'vermelha'].forEach(function (c) {
      var b = el('button', 'chip-' + c, colors);
      b.textContent = 'ficha ' + c;
      b.addEventListener('click', function () {
        if (picked.length >= 4) return;
        picked.push(c);
        slots.children[picked.length - 1].textContent = c;
        slots.children[picked.length - 1].className = 'chip-slot chip-' + c;
        LM.Audio.relay(0.1);
        if (picked.length === 4) {
          setTimeout(function () {
            if (LM.Logic.validateChips(picked)) {
              LM.Terminal.push({ who: 'manual', text: 'O armário cede com um estalo duplo. Dentro: o caderno da Ivone, uma fita gravada, e um relé gravado com I.C.' });
              LM.State.addFact(LM.state, 'caderno');
              LM.State.addFact(LM.state, 'fita');
              LM.State.addFact(LM.state, 'relé');
              LM.SaveSystem.save('current', LM.state);
            } else {
              LM.Terminal.push({ who: 'manual', text: 'A ordem não abre. O armário devolve as fichas com desdém mecânico.' });
              picked.length = 0;
              for (var j = 0; j < 4; j++) {
                slots.children[j].textContent = '?';
                slots.children[j].className = 'chip-slot';
              }
            }
          }, 250);
        }
      });
      colors.appendChild(b);
    });
    LM.UI.openPanel(wrap);
  }

  // ---------------- REGISTRADOR (noite 4) ---------------------------------------
  function openCounter(expected) {
    var wrap = el('div', 'puzzle-panel');
    wrap.innerHTML = '<h3>Registrador mecânico</h3>' +
      '<p class="puzzle-intro">O contador derivou <strong>' + (expected + 7) + '</strong> do real. O manual: "sincronize com o total de chamadas conectadas no turno, conferido no livro." Quantas chamadas você conectou hoje?</p>';
    var inp = el('input', '', wrap);
    inp.placeholder = 'total do turno';
    var ok = el('button', '', wrap);
    ok.textContent = 'Sincronizar';
    ok.addEventListener('click', function () {
      if (LM.Logic.validateCounter(expected, inp.value)) {
        LM.Terminal.push({ who: 'manual', text: 'O registrador engata no número certo. Dentro, o relé I.C. fica à vista por um segundo antes de a tampa fechar.' });
        LM.State.addFact(LM.state, 'manual');
        LM.SaveSystem.save('current', LM.state);
        LM.UI.closePanel();
      } else {
        LM.Terminal.push({ who: 'ferreira', text: 'O registrador range em desacordo com o livro. Conte de novo.' });
      }
    });
    LM.UI.openPanel(wrap);
  }

  LM.Board = {
    init: init,
    renderTickets: renderTickets,
    selectTicket: selectTicket,
    jackClick: jackClick,
    deadJackClick: deadJackClick,
    attemptConnect: attemptConnect,
    connectTicketToDead: connectTicketToDead,
    resetCords: resetCords,
    lightLamp: lightLamp,
    lightDead: lightDead,
    dimLamps: dimLamps,
    openToneTest: openToneTest,
    openCabinet: openCabinet,
    openCounter: openCounter,
    resetTone: function () { toneOpened = false; },
    state: function () { return B; }
  };
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
