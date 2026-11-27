/* Night — máquina de estados dos cinco turnos: intro, fichas, evento da linha
   morta, relatório; escolhas finais e detecção da falha EM ESCUTA. */
(function (LM) {
  'use strict';

  var N = { active: false };

  function startNight(n) {
    var st = LM.state;
    st.night = n;
    st.phase = 'intro';
    st.ticketsQueue = JSON.parse(JSON.stringify(LM.Data.ticketsByNight[n]));
    st.connections = [];
    st.wrongConnections = 0;
    LM.Board.resetCords();
    LM.Board.renderTickets(st.ticketsQueue);
    LM.UI.setNightBadge(n);
    var introList = (n === 1) ? LM.Data.intro : LM.Data.nightIntros[n];
    LM.Terminal.pushMany(introList, function () {
      var begin = function () {
        st.phase = 'calls';
        LM.Terminal.push({ who: 'manual', text: 'Fichas na bandeja: ' + st.ticketsQueue.length + '. Conecte na ordem do manual. Clique na ficha, depois na entrada (A) e na saída (B).' });
        LM.SaveSystem.save('current', st);
      };
      // Turno 5: codinome opcional, exclusivamente ficcional (§6.6) — nunca um
      // nome real; o campo alimenta a ficha de ponto da bandeja.
      if (n === 5 && LM.UI.showCodinomePrompt) {
        LM.UI.showCodinomePrompt(function () { begin(); });
      } else {
        begin();
      }
    });
  }

  function onTicketDone() {
    var st = LM.state;
    var pending = st.ticketsQueue.filter(function (t) { return !t.done; });
    if (pending.length === 0) {
      LM.Terminal.push({ who: 'manual', text: 'Todas as fichas do turno estão conectadas. O painel respira fundo.' }, function () {
        runDeadEvent();
      });
    }
  }

  // evento da linha morta do turno
  function runDeadEvent() {
    var st = LM.state;
    var ev = LM.Data.deadLineEvents[st.night];
    if (!ev) { endReport(); return; }
    st.phase = 'event';
    if (st.night === 2) LM.Board.openToneTest();
    if (st.night === 3) {
      // ficha antiga na bandeja (indício)
      LM.State.addFact(st, 'ficha');
      LM.Board.openCabinet();
    }
    if (st.night === 4) {
      LM.State.addFact(st, 'manual');
      LM.Board.openCounter(st.connections.length);
    }
    LM.Audio.ringPattern(3);
    LM.Board.lightDead();
    LM.Terminal.push({ who: 'manual', text: ev.text }, function () {
      showEventOptions(ev);
    });
  }

  function showEventOptions(ev) {
    LM.UI.showChoices(ev.options.map(function (o) {
      return { id: o.id, label: o.label, effect: o.effect };
    }), function (choice) {
      applyEventEffect(ev, choice);
    });
  }

  function applyEventEffect(ev, choice) {
    var st = LM.state;
    if (choice.effect === 'listen') {
      st.listened += 1;
      LM.Audio.lineStatic(true);
      setTimeout(function () { LM.Audio.lineStatic(false); }, 1500);
    }
    if (choice.effect === 'line' || choice.effect === 'ivone') {
      st.spokeToLine += 1;
      st.deadLineEvents += 1;
      (ev.lineWords || []).forEach(function (w) {
        if (st.lineWords.indexOf(w) < 0) st.lineWords.push(w);
      });
    }
    if (choice.effect === 'cut') st.cutObeyed = true;
    if (choice.effect === 'keep') st.cutObeyed = false;
    var after = ev.after[choice.effect];
    if (after) {
      LM.Terminal.push(after, function () {
        postEvent(ev, choice);
      });
    } else {
      postEvent(ev, choice);
    }
  }

  function postEvent(ev, choice) {
    var st = LM.state;
    // falha EM ESCUTA: três fios abertos e a central aprende a operadora
    if (LM.State.isCaughtThreshold(st) && st.night >= 4) {
      st.caughtListening = true;
      st.ending = 'ESCUITA';
      st.terminal = true;
      LM.SaveSystem.save('current', st).then(function () {
        LM.Endings.runEnding('ESCUITA');
      });
      return;
    }
    // noite 5: escolha final acontece no próprio evento
    if (st.night === 5) {
      var usedIvone = choice.effect === 'ivone';
      var end = LM.Logic.computeEnding(st, choice.effect === 'cut' ? 'cut' : 'connect', usedIvone);
      if (end && end.id) {
        st.ending = end.id;
        st.terminal = true;
        LM.SaveSystem.save('current', st).then(function () {
          LM.Endings.runEnding(end.id, end);
        });
        return;
      }
    }
    endReport();
  }

  // conectou a ficha branca / do nome no jack morto (via board)
  function onDeadConnected(ticket) {
    var st = LM.state;
    var ev = LM.Data.deadLineEvents[st.night];
    st.spokeToLine += 1;
    st.deadLineEvents += 1;
    var words = ev.lineWords || [];
    words.forEach(function (w) {
      if (st.lineWords.indexOf(w) < 0) st.lineWords.push(w);
    });
    var talk = LM.Data.lineTalk[st.night];
    LM.Terminal.push({ who: 'linha', text: talk ? talk[talk.length - 1] : '...zumbido.' }, function () {
      postEvent(ev, { id: 'connect', effect: 'line' });
    });
  }

  // conectou a ficha de ponto ao jack B6 (via board) — rota física de Ivone
  function onIvoneConnected(ticket) {
    var st = LM.state;
    var ev = LM.Data.deadLineEvents[st.night];
    st.spokeToLine += 1;
    st.deadLineEvents += 1;
    (ev.lineWords || []).forEach(function (w) {
      if (st.lineWords.indexOf(w) < 0) st.lineWords.push(w);
    });
    var talk = LM.Data.lineTalk[st.night];
    LM.Terminal.push({ who: 'linha', text: talk ? talk[talk.length - 1] : '...zumbido.' }, function () {
      postEvent(ev, { id: 'ivone', effect: 'ivone' });
    });
  }

  function endReport() {
    var st = LM.state;
    st.phase = 'report';
    var lines = [
      { who: 'manual', text: 'Relatório do turno ' + st.night + ': fichas conectadas ' + st.connections.length + ', conexões recusadas ' + st.wrongConnections + ', fios abertos acumulados ' + st.listened + '.' }
    ];
    if (st.listened > 0 && st.night < 5) {
      lines.push({ who: 'ferreira', text: '"O livro registra ' + st.listened + ' anomalias de escuta. Continua registrando e o painel vai registrar você." — Ferreira' });
    }
    if (st.night < 5) {
      lines.push({ who: 'manual', text: 'O ponto é encerrado às 06:00. A central guarda o turno na memória de cobre. Volte às 22h.' });
    }
    LM.Terminal.pushMany(lines, function () {
      if (st.night >= 5) {
        // sem evento final processado (rota alternativa)
        return;
      }
      LM.UI.showAdvance('Começar o turno ' + (st.night + 1), function () {
        startNight(st.night + 1);
      });
      LM.SaveSystem.save('current', st);
    });
  }

  LM.Night = {
    startNight: startNight,
    onTicketDone: onTicketDone,
    onDeadConnected: onDeadConnected,
    onIvoneConnected: onIvoneConnected,
    runDeadEvent: runDeadEvent,
    endReport: endReport
  };
})(typeof LM !== 'undefined' ? LM : (typeof globalThis !== 'undefined' ? globalThis.LM = {} : {}));
