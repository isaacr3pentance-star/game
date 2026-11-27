/* Puzzles — copo, rádio, retrato (originais) + calendário, fósforos, engrenagens, reflexos.
   Cada puzzle: introdução, pistas, interação, lógica, feedback, solução, consequência,
   estado persistente e recuperação após erro. Validadores puros para testes em Node. */
(function (RW) {
  'use strict';

  var NOTA_FREQ = 92.7;
  var NOTA_WINDOW = [91.8, 93.6]; // janela temporal do sinal
  var DOOR_WORN = [0, 2, 4];      // travas gastas (marcas de uso)
  var CALENDAR_MARKED = [3, 4, 5, 12, 13, 19, 20, 27, 28];
  var GEARS = [12, 24, 18, 36];
  var MIRROR_TARGETS = [0, 180, 270];

  // ---------------------------------------------------------------- validadores
  function validateDoorLocks(order) {
    // deve tocar exatamente as travas gastas, da esquerda para a direita
    if (!order || order.length !== DOOR_WORN.length) return false;
    for (var i = 0; i < DOOR_WORN.length; i++) {
      if (order[i] !== DOOR_WORN[i]) return false;
    }
    return true;
  }

  function inNoteWindow(dial) {
    return dial >= NOTA_WINDOW[0] && dial <= NOTA_WINDOW[1];
  }

  function applyRadioCapture(state) {
    // rebobinar com o dial na janela captura o sinal: 2 rebobinadas completam
    if (!inNoteWindow(state.radioDial)) return false;
    state.radioCapture = Math.min(100, state.radioCapture + 50);
    if (state.radioCapture >= 100) state.radioCaptureDone = true;
    return true;
  }

  function portraitAfterRewind(state) {
    // cada rebobinada própria remove um pedaço da segunda pessoa, até 5
    if (state.portraitPieces < 5) state.portraitPieces += 1;
    return state.portraitPieces;
  }

  function validateCalendar(selected) {
    if (!selected || selected.length !== CALENDAR_MARKED.length) return false;
    var a = selected.slice().sort(function (x, y) { return x - y; });
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== CALENDAR_MARKED[i]) return false;
    }
    return true;
  }

  function isShort(ms) { return ms > 0 && ms < 600; }
  function isLong(ms) { return ms >= 600; }

  function validateMatches(pattern) {
    // padrão do farol: 3 clarões curtos, pausa, 1 longo
    if (!pattern || pattern.length !== 4) return false;
    if (!isShort(pattern[0]) || !isShort(pattern[1]) || !isShort(pattern[2])) return false;
    if (!isLong(pattern[3])) return false;
    return true;
  }

  function validateGears(slots) {
    // slots: { left: [a,b], right: [c,d] }; o menor do par recebe o movimento (primeiro)
    if (!slots || !Array.isArray(slots.left) || !Array.isArray(slots.right)) return false;
    var l = slots.left, r = slots.right;
    if (l.length !== 2 || r.length !== 2) return false;
    var used = l.concat(r).slice().sort(function (a, b) { return a - b; });
    var expected = GEARS.slice().sort(function (a, b) { return a - b; });
    for (var i = 0; i < expected.length; i++) if (used[i] !== expected[i]) return false;
    return l[0] === 12 && l[1] === 24 && r[0] === 18 && r[1] === 36;
  }

  function reflectedAngle(mirrorAngle, incidence) {
    incidence = (incidence === undefined) ? 90 : incidence;
    return ((2 * mirrorAngle - incidence) % 360 + 360) % 360;
  }

  function validateMirrors(angles) {
    if (!angles || angles.length !== MIRROR_TARGETS.length) return false;
    for (var i = 0; i < MIRROR_TARGETS.length; i++) {
      var refl = reflectedAngle(angles[i]);
      // tolerância de um passo (15°) evita tentativa-e-erro cego demais? Não:
      // exige exato para ser determinístico com a régua visível de 15°.
      if (refl !== MIRROR_TARGETS[i]) return false;
    }
    return true;
  }

  // ---------------------------------------------------------------- UI helpers
  function panel(title, intro, clue) {
    var wrap = document.createElement('div');
    wrap.className = 'puzzle-panel';
    var h = document.createElement('h3');
    h.textContent = title;
    wrap.appendChild(h);
    var p = document.createElement('p');
    p.className = 'puzzle-intro';
    p.textContent = intro;
    wrap.appendChild(p);
    if (clue) {
      var c = document.createElement('p');
      c.className = 'puzzle-clue';
      c.textContent = 'Pista: ' + clue;
      wrap.appendChild(c);
    }
    return wrap;
  }

  function feedback(el, ok, msgOk, msgNo) {
    var f = document.createElement('p');
    f.className = 'puzzle-feedback ' + (ok ? 'ok' : 'no');
    f.textContent = ok ? msgOk : msgNo;
    el.appendChild(f);
  }

  function hint(state, n) {
    // pistas graduais conforme tentativas
    var hints = {
      porta: ['A poça reflete três travas. Olhe pela água, não pela porta.', 'As travas gastas estão em posições alternadas: uma, três e cinco.'],
      calendario: ['Nove riscos. Eles agrupam: três, dois, dois, dois.', 'Temporais: começo de mês, meio, virada da terceira semana e fim.'],
      matches: ['A placa diz: três clarões e um longo. Conta o tempo do seu dedo.', 'Toque rápido para clarão curto. Segure mais de meio segundo para o longo.'],
      gears: ['A arruela frouxa esconde a regra: cada par é uma relação de dobro.', 'No par, o menor recebe o movimento e vem primeiro.'],
      mirrors: ['O raio vem de cima (90°). O espelho dobra o caminho em torno do próprio ângulo.', 'Alvo à direita pede espelho a 45°. Esquerda, 135°. Para cima, 180°.']
    };
    var arr = hints[state];
    if (!arr) return null;
    return arr[Math.min(arr.length - 1, Math.max(0, (n || 1) - 1))];
  }

  var P = {};

  // ------------------------------------------------ PUZZLE 1: COPO + PORTA
  P.copo = {
    id: 'copo',
    title: 'O copo pela metade',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title, 'O copo balança sozinho. Há três ações possíveis com ele — e o chão fica com as consequências.', null);
      var acts = document.createElement('div');
      acts.className = 'puzzle-actions';
      var mk = function (label, fn) {
        var b = document.createElement('button');
        b.textContent = label;
        b.addEventListener('click', fn);
        acts.appendChild(b);
      };
      mk('Examinar a água', function () {
        RW.Routes.engage('vestigio');
        RW.State && (RW.state.behavior.attentive += 1);
        feedback(el, true, 'A água olha para cima. Dá para ver o fundo dela do lado de dentro. Estranhamente, ela lembra.', null);
        RW.Dialogs.say({ who: 'vela', text: 'Cuidado com a água. Ela lembra mais que eu.', tone: 'CORDIAL' });
      });
      mk('Derramar no chão', function () {
        st.glassState = 'empty';
        st.puddle = true;
        RW.Routes.engage('vestigio');
        RW.Room.refreshOverlays();
        feedback(el, true, 'A água escorre até a base da porta e forma uma poça rasa que não seca.', null);
        RW.Dialogs.say({ who: 'vela', text: 'A poça fica. Mesmo depois de rebobinar. Vestígios não voltam no tempo — é por isso que valem.', tone: 'CORDIAL' });
        RW.SaveSystem.save('current', RW.state);
      });
      mk('Encher até a borda', function () {
        st.glassState = 'full';
        RW.Room.refreshOverlays();
        feedback(el, true, 'O copo enche. Fica instável, cheio, desonesto.', null);
        RW.SaveSystem.save('current', RW.state);
      });
      el.appendChild(acts);
      RW.UI.openPanel(el);
    }
  };

  P.porta = {
    id: 'porta',
    title: 'As travas da porta',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title,
        'Cinco travas horizontais na porta de ferro. A poça derramada no chão reflete luz sobre a porta — algumas travas têm brilho de uso, outras só ferrugem parada.',
        hint('porta', st.doorTrial + 1));
      if (st.doorUnlocked) {
        feedback(el, true, 'A porta já está livre. A escadaria desce para dentro do farol.', null);
        RW.UI.openPanel(el);
        return;
      }
      var order = [];
      var grid = document.createElement('div');
      grid.className = 'locks';
      for (var i = 0; i < 5; i++) {
        (function (idx) {
          var b = document.createElement('button');
          b.className = 'lock';
          b.textContent = 'trava ' + (idx + 1);
          b.addEventListener('click', function () {
            order.push(idx);
            b.classList.add('pressed');
            RW.Audio.clickSound();
            if (order.length === 3) {
              if (validateDoorLocks(order)) {
                st.doorUnlocked = true;
                st.stairsUnlocked = true;
                feedback(el, true, 'As três travas gastas cedem na ordem da poça. A porta abre para baixo.', null);
                RW.Dialogs.say({ who: 'vela', text: 'A escadaria desce para dentro do farol. Acompanha-me até a metade.', tone: 'CORDIAL' });
                if (done) done(true);
                RW.SaveSystem.save('current', RW.state);
              } else {
                st.doorTrial += 1;
                st.behavior.repetitive += 1;
                order.length = 0;
                grid.querySelectorAll('.lock').forEach(function (x) { x.classList.remove('pressed'); });
                feedback(el, false, 'As travas erradas rangem e voltam. ' + (hint('porta', st.doorTrial + 1) || 'Tente a ordem que a água indica.'), null);
                RW.Dialogs.say({ who: 'vela', text: 'Deixa a água te guiar. Ela não erra; só anota.', tone: 'BARGAIN' });
                RW.SaveSystem.save('current', RW.state);
              }
            }
          });
          grid.appendChild(b);
        })(i);
      }
      el.appendChild(grid);
      RW.UI.openPanel(el);
    }
  };

  // ------------------------------------------------ PUZZLE 2: RÁDIO
  P.radio = {
    id: 'radio',
    title: 'O rádio de válvulas',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title,
        'O dial vai de 87.5 a 108. Há uma marca de unha entre 92 e 93 — sintonia da casa, alguém chamou. A nota cortada do prólogo mora aqui.',
        'A nota completa só existe em uma janela temporal. Capturá-la exige rebobinar com o dial na janela.');
      var dial = document.createElement('input');
      dial.type = 'range';
      dial.min = '87.5'; dial.max = '108'; dial.step = '0.1';
      dial.value = String(st.radioDial);
      var val = document.createElement('div');
      val.className = 'radio-dial-value';
      val.textContent = st.radioDial.toFixed(1) + ' MHz';
      var inWin = inNoteWindow(st.radioDial);
      if (inWin) RW.Audio.radioStatic(true);
      dial.addEventListener('input', function () {
        st.radioDial = parseFloat(dial.value);
        val.textContent = st.radioDial.toFixed(1) + ' MHz';
        var nowWin = inNoteWindow(st.radioDial);
        RW.Audio.radioStatic(nowWin || Math.random() < 0.4);
        RW.Audio.setRain(RW.State.hasMemory(st, 'm7'));
        if (nowWin !== inWin) {
          inWin = nowWin;
          if (nowWin) RW.UI.caption('A estática aqui quase vira música. A marca de unha fica sob o ponteiro.');
        }
      });
      var acts = document.createElement('div');
      acts.className = 'puzzle-actions';
      var listen = document.createElement('button');
      listen.textContent = 'Ouvir a nota';
      listen.addEventListener('click', function () {
        if (!inNoteWindow(st.radioDial)) {
          feedback(el, false, 'Estática. Ruído de mar sem mar. Nada.', null);
          return;
        }
        st.radioHeardCut = true;
        st.behavior.attentive += 1;
        RW.Audio.playNote(st.radioCaptureDone, function () {
          feedback(el, true, st.radioCaptureDone
            ? 'A nota completa toca inteira e não resolve — resolve só o que é ido.'
            : 'A nota corta no terceiro compasso, como no prólogo. Para capturá-la inteira: rebobine com o dial nesta janela.', null);
        });
        RW.Routes.engage('frequencia');
        RW.SaveSystem.save('current', RW.state);
      });
      acts.appendChild(listen);
      if (st.radioCaptureDone) {
        var replay = document.createElement('button');
        replay.textContent = 'Reproduzir a nota completa';
        replay.addEventListener('click', function () {
          RW.Audio.playNote(true, null);
        });
        acts.appendChild(replay);
      }
      var cap = document.createElement('p');
      cap.className = 'puzzle-status';
      cap.textContent = 'Captura do sinal: ' + st.radioCapture + '%';
      el.appendChild(dial); el.appendChild(val); el.appendChild(acts); el.appendChild(cap);
      RW.UI.openPanel(el);
    }
  };

  // ------------------------------------------------ PUZZLE 3: RETRATO
  P.retrato = {
    id: 'retrato',
    title: 'O retrato de duas pessoas',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title,
        'Duas pessoas na fotografia. Uma segura uma lanterna que não ilumina nada. Cada rebobinada sua arranca um pedaço da segunda pessoa.',
        'Cinco perdas acumuladas permitem virar a moldura.');
      var img = RW.Portrait.render(st.portraitPieces, st.portraitFlipped);
      img.className = 'portrait-view';
      el.appendChild(img);
      var info = document.createElement('p');
      info.className = 'puzzle-status';
      info.textContent = st.portraitFlipped
        ? 'No verso da moldura: um M. raspado e uma chave antiga, presa com fita.'
        : 'Pedaços perdidos da segunda pessoa: ' + st.portraitPieces + '/5';
      el.appendChild(info);
      if (!st.portraitFlipped && st.portraitPieces >= 5) {
        var flip = document.createElement('button');
        flip.textContent = 'Virar a moldura';
        flip.addEventListener('click', function () {
          st.portraitFlipped = true;
          st.chamberKey = true;
          RW.Routes.discover('retrato');
          RW.Dialogs.say({ who: 'vela', text: 'Você não precisava disso.', tone: 'ACUSACAO' });
          feedback(el, true, 'Verso da moldura: "V. & M." — o M. foi raspado por unha humana. Uma chave pequena cai no seu bolso narrativo (abre a câmara de manutenção).', null);
          RW.Room.refreshOverlays();
          RW.SaveSystem.save('current', RW.state);
        });
        el.appendChild(flip);
      }
      if (st.portraitFlipped && st.chamberKey) {
        feedback(el, true, 'A chave da câmara de manutenção está com você. A escadaria tem a porta dela.', null);
      }
      RW.UI.openPanel(el);
    }
  };

  // ------------------------------------------------ PUZZLE 4: CALENDÁRIO
  P.calendario = {
    id: 'calendario',
    title: 'A vigília no calendário',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title,
        'Um mês único pregado com prego torto. Trinta e um dias. Selecione os dias de temporal marcados por Vela — o caderno na gaveta da mesa conta os temporais.',
        hint('calendario', st.eventsSeen.calTrial || 1));
      if (st.calendarSolved) {
        feedback(el, true, 'A vigília está marcada: nove dias, todo mês a mesma folha.', null);
        RW.UI.openPanel(el);
        return;
      }
      var sel = [];
      var grid = document.createElement('div');
      grid.className = 'calendar';
      for (var d = 1; d <= 31; d++) {
        (function (day) {
          var b = document.createElement('button');
          b.textContent = String(day);
          b.addEventListener('click', function () {
            var ix = sel.indexOf(day);
            if (ix >= 0) { sel.splice(ix, 1); b.classList.remove('marked'); }
            else { sel.push(day); b.classList.add('marked'); }
            RW.Audio.clickSound();
          });
          grid.appendChild(b);
        })(d);
      }
      var check = document.createElement('button');
      check.textContent = 'Confirmar marcação';
      check.addEventListener('click', function () {
        st.eventsSeen.calTrial = (st.eventsSeen.calTrial || 0) + 1;
        if (validateCalendar(sel)) {
          st.calendarSolved = true;
          st.drawerOpened = true;
          RW.Routes.discover('vigilia');
          feedback(el, true, 'Os nove dias acertam. A gaveta da mesa abre: o caderno de rotinas e uma cartela de fósforos.', null);
          RW.Dialogs.say({ who: 'vela', text: 'Vigília não é espera. Vigília é repetição com coragem. A gaveta era dos fósforos — leve-os.', tone: 'CORDIAL' });
          if (done) done(true);
          RW.SaveSystem.save('current', RW.state);
        } else {
          st.behavior.repetitive += 1;
          feedback(el, false, 'A marcação não bate com os temporais. ' + (hint('calendario', st.eventsSeen.calTrial + 1) || 'Conte de novo.'), null);
          RW.SaveSystem.save('current', RW.state);
        }
      });
      el.appendChild(grid); el.appendChild(check);
      RW.UI.openPanel(el);
    }
  };

  // ------------------------------------------------ PUZZLE 5: FÓSFOROS / LUZ
  P.fosforos = {
    id: 'fosforos',
    title: 'A característica do farol',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title,
        'No centro da câmara da luz, uma lente enorme de fressnel dorme. Ao redor, sete lampiões esperam a mão certa. A placa do corredor diz: CARACTERÍSTICA — 3 clarões, pausa, 1 longo.',
        hint('matches', st.eventsSeen.mtTrial || 1));
      if (st.matchesSolved) {
        feedback(el, true, 'A lente gira. A luz do farol pisca no ritmo correto lá fora: três clarões, pausa, um longo.', null);
        RW.UI.openPanel(el);
        return;
      }
      var pattern = [];
      var pressStart = 0;
      var lampBtn = document.createElement('button');
      lampBtn.className = 'lamp-btn';
      lampBtn.textContent = 'Acender lampião (toque = clarão curto · segurar = longo)';
      lampBtn.addEventListener('mousedown', function () { pressStart = Date.now(); });
      lampBtn.addEventListener('mouseup', function () {
        var dur = Date.now() - pressStart;
        pattern.push(Math.max(60, dur));
        RW.Audio.blip(660, isLong(dur) ? 0.6 : 0.12, 0.12, null);
        var seq = pattern.map(isLong).map(function (l) { return l ? 'L' : 'S'; }).join(' ');
        feedback(el, true, 'Padrão atual: ' + seq, null);
        if (pattern.length === 4) {
          st.eventsSeen.mtTrial = (st.eventsSeen.mtTrial || 0) + 1;
          if (validateMatches(pattern)) {
            st.matchesSolved = true;
            st.flags.exteriorUnlocked = true;
            RW.Routes.discover('maquina');
            feedback(el, true, 'A lente acorda. Três clarões, pausa, um longo — o farol volta a dizer "casa" para o mar.', null);
            RW.Dialogs.say({ who: 'vela', text: 'A luz não é minha. Mas o ritmo é meu. Obrigada por devolverem o ritmo.', tone: 'RESIGNADO' });
            if (done) done(true);
            RW.SaveSystem.save('current', RW.state);
          } else {
            pattern.length = 0;
            st.behavior.repetitive += 1;
            feedback(el, false, 'A lente engasga e apaga tudo. ' + (hint('matches', st.eventsSeen.mtTrial + 1) || 'Três curtos e um longo.'), null);
          }
        }
      });
      el.appendChild(lampBtn);
      RW.UI.openPanel(el);
    }
  };

  // ------------------------------------------------ PUZZLE 6: ENGRENAGENS
  P.engrenagens = {
    id: 'engrenagens',
    title: 'Os dois pares da máquina',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title,
        'Quatro engrenagens descansam na bancada: 12, 24, 18 e 36 dentes. Dois eixos à espera, cada um com espaço para um par.',
        hint('gears', st.eventsSeen.gearTrial || 1));
      if (st.gearsSolved) {
        feedback(el, true, 'A mecânica trava corretamente. O sino de vidro pulsa em passo constante.', null);
        RW.UI.openPanel(el);
        return;
      }
      var assign = { left: [], right: [] };
      var pool = document.createElement('div');
      pool.className = 'gear-pool';
      var placeBtn = function (gear) {
        var b = document.createElement('button');
        b.className = 'gear';
        b.textContent = gear + ' dentes';
        b.addEventListener('click', function () {
          var target = assign.left.length < 2 ? 'left' : (assign.right.length < 2 ? 'right' : null);
          if (!target) return;
          var used = assign.left.concat(assign.right);
          if (used.indexOf(gear) < 0) { // engrenagem ainda não usada
            assign[target].push(gear);
            b.disabled = true;
            RW.Audio.clickSound();
            statusEl.textContent = 'Par esquerdo: ' + assign.left.join(', ') + ' · Par direito: ' + assign.right.join(', ');
          }
        });
        return b;
      };
      GEARS.forEach(function (g) { pool.appendChild(placeBtn(g)); });
      var statusEl = document.createElement('p');
      statusEl.className = 'puzzle-status';
      statusEl.textContent = 'Par esquerdo: vazio · Par direito: vazio';
      var test = document.createElement('button');
      test.textContent = 'Testar mecânica';
      test.addEventListener('click', function () {
        st.eventsSeen.gearTrial = (st.eventsSeen.gearTrial || 0) + 1;
        if (validateGears(assign)) {
          st.gearsSolved = true;
          st.flags.luzUnlocked = true;
          RW.Routes.engage('maquina');
          feedback(el, true, 'Os pares engrenam: dobro sobre dobro, o menor recebendo o movimento. A subida para a câmara da luz fica livre.', null);
          if (done) done(true);
          RW.SaveSystem.save('current', RW.state);
        } else {
          st.behavior.repetitive += 1;
          feedback(el, false, 'A mecânica engasga e range. ' + (hint('gears', st.eventsSeen.gearTrial + 1) || 'Relação de dobro; o menor primeiro.'), null);
          RW.SaveSystem.save('current', RW.state);
        }
      });
      el.appendChild(pool); el.appendChild(statusEl); el.appendChild(test);
      RW.UI.openPanel(el);
    }
  };

  // ------------------------------------------------ PUZZLE 7: REFLEXOS
  P.reflexos = {
    id: 'reflexos',
    title: 'Os três cacos do corredor',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title,
        'Três cacos de espelho presos em suportes giratórios. A luz da janela alta do corredor entra a 90°. Três símbolos de memória esperam nas paredes: à direita, à esquerda e para cima.',
        hint('mirrors', st.eventsSeen.mirTrial || 1));
      if (st.mirrorsSolved) {
        feedback(el, true, 'Os três símbolos brilham: o corredor lembra em seu lugar.', null);
        RW.UI.openPanel(el);
        return;
      }
      if (!st.mirrorAngles || st.mirrorAngles.length !== 3) st.mirrorAngles = [90, 90, 90];
      var wrap = document.createElement('div');
      wrap.className = 'mirrors';
      var info = document.createElement('p');
      info.className = 'puzzle-status';
      function reflectInfo() {
        return st.mirrorAngles.map(function (a, i) {
          return 'caco ' + (i + 1) + ': espelho ' + a + '° → raio ' + reflectedAngle(a) + '°';
        }).join(' · ');
      }
      info.textContent = reflectInfo();
      st.mirrorAngles.forEach(function (a, i) {
        (function (idx) {
          var row = document.createElement('div');
          row.className = 'mirror-row';
          var lab = document.createElement('span');
          lab.textContent = 'Caco ' + (idx + 1);
          var rng = document.createElement('input');
          rng.type = 'range'; rng.min = '0'; rng.max = '345'; rng.step = '15';
          rng.value = String(st.mirrorAngles[idx]);
          var out = document.createElement('span');
          out.textContent = st.mirrorAngles[idx] + '°';
          rng.addEventListener('input', function () {
            st.mirrorAngles[idx] = parseInt(rng.value, 10);
            out.textContent = rng.value + '°';
            info.textContent = reflectInfo();
            if (validateMirrors(st.mirrorAngles)) {
              st.mirrorsSolved = true;
              st.eventsSeen.mirTrial = (st.eventsSeen.mirTrial || 0) + 1;
              RW.Routes.engage('vestigio');
              var echo = RW.Memories.restoredEcho();
              feedback(el, true, 'Os três símbolos acendem em sequência. ' + (echo ? echo.line : 'O corredor lembra.'), null);
              RW.Dialogs.say({ who: 'vela', text: 'O corredor me devolveu um pedaço por um segundo. Isso é gentileza de geometria.', tone: 'CORDIAL' });
              RW.SaveSystem.save('current', RW.state);
              if (done) done(true);
            }
          });
          row.appendChild(lab); row.appendChild(rng); row.appendChild(out);
          wrap.appendChild(row);
        })(i);
      });
      el.appendChild(wrap); el.appendChild(info);
      RW.UI.openPanel(el);
    }
  };

  // ------------------------------------------------ PUZZLE: GAVETA (caderno)
  P.gaveta = {
    id: 'gaveta',
    title: 'A gaveta da mesa',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title, 'A gaveta guarda o caderno de rotinas, fósforos e um lápis mordido.', null);
      if (!st.drawerOpened) {
        feedback(el, false, 'A gaveta está presa. Algo no calendário a relaciona aos temporais.', null);
        RW.UI.openPanel(el);
        return;
      }
      var list = document.createElement('ul');
      list.className = 'puzzle-list';
      var itens = ['Caderno de rotinas — a página central está cortada (perda registrada).',
        'Cartela de fósforos — necessária na câmara da luz.',
        'Lápis mordido por duas bocas diferentes.'];
      if (RW.State.hasMemory(st, 'm5')) itens[0] = 'Caderno de rotinas — na página central, nove noites riscadas em ordem: a vigília.';
      itens.forEach(function (t) {
        var li = document.createElement('li');
        li.textContent = t;
        list.appendChild(li);
      });
      var note = document.createElement('p');
      note.className = 'puzzle-note';
      note.textContent = 'Nota de outra letra, no fim do caderno: "o farol não acende por si. quem vigia acende junto."';
      el.appendChild(list); el.appendChild(note);
      st.behavior.attentive += 2;
      RW.SaveSystem.save('current', RW.state);
      RW.UI.openPanel(el);
    }
  };

  // ------------------------------------------------ PUZZLE: REGISTROS (legado)
  P.registros = {
    id: 'registros',
    title: 'Os registros anteriores',
    open: function (done) {
      var st = RW.state;
      var el = panel(this.title, 'Três dossiês de sessões anteriores, empilhados no corredor. As assinaturas variam. O cansaço não.', null);
      var seen = st.legacyRecordsSeen || 0;
      var list = document.createElement('ul');
      list.className = 'puzzle-list';
      var dossies = [
        'op_1 — 4 rebobinadas — desistiu no Ato II. Nota: "ela começou a perguntar quem eu era. saí antes de responder."',
        'op_2 — 11 rebobinadas — chegou à revelação. Nota: "não é um jogo de consertar. é um jogo de escolher quem paga."',
        'op_3 — 27 rebobinadas — registrou o final B. Nota: "fiquei. ela pediu que eu guardasse algo em um lugar que ela não apareça."'
      ];
      dossies.forEach(function (t, i) {
        var li = document.createElement('li');
        li.textContent = t;
        if (i < seen) li.classList.add('read');
        list.appendChild(li);
      });
      var btn = document.createElement('button');
      btn.textContent = seen < 3 ? 'Ler o próximo dossiê' : 'Todos os dossiês lidos';
      btn.disabled = seen >= 3;
      btn.addEventListener('click', function () {
        st.legacyRecordsSeen = Math.min(3, seen + 1);
        st.behavior.attentive += 1;
        RW.SaveSystem.save('current', RW.state);
        RW.UI.closePanel();
        P.registros.open(done);
      });
      el.appendChild(list); el.appendChild(btn);
      if (st.legacyRecordsSeen >= 3) {
        RW.Routes.discover('legado');
      }
      RW.UI.openPanel(el);
    }
  };

  RW.Puzzles = P;
  RW.PuzzleLogic = {
    NOTA_FREQ: NOTA_FREQ,
    NOTA_WINDOW: NOTA_WINDOW,
    DOOR_WORN: DOOR_WORN,
    CALENDAR_MARKED: CALENDAR_MARKED,
    GEARS: GEARS,
    MIRROR_TARGETS: MIRROR_TARGETS,
    validateDoorLocks: validateDoorLocks,
    inNoteWindow: inNoteWindow,
    applyRadioCapture: applyRadioCapture,
    portraitAfterRewind: portraitAfterRewind,
    validateCalendar: validateCalendar,
    validateMatches: validateMatches,
    validateGears: validateGears,
    reflectedAngle: reflectedAngle,
    validateMirrors: validateMirrors
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = RW.PuzzleLogic;
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
