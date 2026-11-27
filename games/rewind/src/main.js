/* main — boot, orquestração, hooks da rebobinada, ociosidade, atos, autosave,
   quarta parede, título dinâmico da janela. */
(function (RW) {
  'use strict';

  var G = {
    idleTimer1: null, idleTimer2: null,
    idleState: 0, // 0 normal, 1 sentada, 2 rebobinou
    autosaveTimer: null, fourthWallTimer: null,
    hidden: false
  };

  function boot() {
    var ui = {
      box: document.getElementById('dialog-box'),
      text: document.getElementById('dialog-text'),
      name: document.getElementById('dialog-name'),
      history: document.getElementById('history-content')
    };
    RW.UI.init();
    RW.Dialogs.init(ui);
    RW.Room.init('stage');
    RW.UI.bindCaptions();
    decodeEmbedded();
    bindAudioUnlock();
    showSplash();

    RW.SaveSystem.load('current').then(function (saved) {
      var state = RW.State.validate(saved) || RW.State.defaults();
      RW.state = state;
      state.meta.sessions = (state.meta.sessions || 0) + 1;

      RW.SaveSystem.ensureLegacy().then(function () { /* registro antigo criado em silêncio */ });

      RW.Audio.setPrefs(state.prefs);
      RW.UI.applyShakePref();
      RW.UI.applyDesaturation(RW.State.saturationLevel(state));

      // estado terminal (Final A já aconteceu): desktop 8s + nota; não volta ao jogo
      if (state.terminal && state.ending === 'A') {
        RW.UI.updateTitle(state);
        RW.Endings.terminalBoot(function () {
          RW.UI.caption('O quarto não volta. A máquina foi consertada.');
        });
        return;
      }
      if (state.terminal && state.ending === 'B') {
        RW.UI.updateTitle(state);
        RW.UI.caption('A sessão foi encerrada por escolha. O recado ficou.');
      }

      RW.UI.updateTitle(state);
      RW.Room.paintScene();
      RW.Room.renderHotspots();
      RW.Room.showVela(state.idleState ? 'sit' : 'stand', 'sala');

      registerRewindHooks();
      startIdleWatchers();
      startAutosave();
      startFourthWall();
      document.addEventListener('visibilitychange', function () {
        G.hidden = document.hidden;
        if (!document.hidden) resetIdle();
      });

      if (!state.prologueDone) runPrologue();
      else resume();
    });
  }

  // decode do retrato real (data URI gerado) para uso síncrono no canvas
  function decodeEmbedded() {
    if (!RW.Embedded || !RW.Embedded.foto) return;
    var img = new Image();
    img.onload = function () { RW.Embedded.fotoImg = img; RW.Room.refreshOverlays(); };
    img.onerror = function () { RW.Embedded.fotoImg = null; };
    img.src = RW.Embedded.foto;
  }

  // desbloqueio do áudio na primeira interação (política de autoplay)
  function bindAudioUnlock() {
    var done = false;
    var unlock = function () {
      if (done) return;
      done = true;
      RW.Audio.unlock(RW.state ? RW.state.prefs : {}, function (t) {
        if (RW.state && RW.state.prefs && RW.state.prefs.captions) RW.UI.caption(t);
      }).then(function () {
        if (RW.state) RW.Audio.setPrefs(RW.state.prefs);
      });
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
  }

  // splash de abertura com a arte gerada do quarto
  function showSplash() {
    if (!RW.Embedded || !RW.Embedded.splashRoom) return;
    var stage = document.getElementById('stage');
    if (!stage) return;
    var sp = document.createElement('div');
    sp.className = 'splash';
    sp.style.backgroundImage = 'url(' + RW.Embedded.splashRoom + ')';
    stage.appendChild(sp);
    setTimeout(function () {
      sp.classList.add('fade');
      setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 900);
    }, 1500);
    sp.addEventListener('click', function () {
      sp.classList.add('fade');
      setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 900);
    });
  }

  function resume() {
    var st = RW.state;
    if (st.ending) return; // pós-final não reabre narrativa
    if (st.act >= 1 && !st.actIntroSeen['resume_' + st.act]) {
      st.actIntroSeen['resume_' + st.act] = true;
      RW.Dialogs.say({ who: 'vela', text: 'Você voltou. O quarto guardou tudo: até o jeito de você abrir a janela.', tone: 'CORDIAL' });
    }
    RW.SaveSystem.save('current', st);
  }

  // ---------------- PRÓLOGO -------------------------------------------------------
  function runPrologue() {
    var st = RW.state;
    st.act = 0;
    var intro = RW.Data.actIntros[0];
    RW.Dialogs.sayMany(intro, function () {
      // nota cortada antes do primeiro input do jogador
      RW.Audio.radioStatic(true);
      RW.Audio.playNote(false, function () {
        RW.Audio.radioStatic(false);
        RW.Dialogs.sayMany([
          { who: 'room', text: 'O rádio tocou uma nota e a cortou no meio, como telefone desligado na cara. A estática volta a ser só estática.' },
          { who: 'vela', text: 'Essa nota é daquelas que não se explicam no primeiro dia. Você vai capturá-la inteira uma hora destas. Vai custar.', tone: 'CORDIAL' },
          { who: 'vela', text: 'Por enquanto: examine o quarto. O copo está pela metade desde antes de você existir para mim. Comece por ele.', tone: 'CORDIAL' }
        ], function () {
          st.prologueDone = true;
          st.act = 1;
          st.actIntroSeen[1] = true;
          var a1 = RW.Data.actIntros[1];
          RW.Dialogs.sayMany(a1, function () {
            saveCheckpoint();
          });
        });
      });
    });
  }

  // ---------------- HOOKS DA REBOBINADA -------------------------------------------
  function registerRewindHooks() {
    RW.Rewind.registerHooks({
      blocked: function () {
        return RW.Endings.isBusy();
      },
      onBegin: function () {
        RW.Audio.playReversed();
        RW.Dialogs.close();
        RW.UI.closePanel(true);
      },
      afterLoss: function (loss, origin) {
        handleLoss(loss, origin);
      },
      onEnd: function () {
        RW.Room.refreshOverlays();
        RW.Room.renderHotspots();
        RW.Room.showVela('stand', RW.Room.currentScene());
        RW.UI.applyDesaturation(RW.State.saturationLevel(RW.state));
        RW.UI.updateTitle(RW.state);
        checkActs();
        resetIdle();
      }
    });
  }

  function handleLoss(loss, origin) {
    var st = RW.state;
    var R = RW.Data.rewindReactions;

    // captura do rádio: rebobinar com o dial na janela captura o sinal
    if (origin === 'own' && RW.PuzzleLogic.applyRadioCapture(st)) {
      if (st.radioCaptureDone) {
        RW.UI.caption('A nota completa foi capturada da janela temporal. O rádio guarda o sinal inteiro.');
        RW.Routes.discover('frequencia');
      } else {
        RW.UI.caption('Captura parcial do sinal: ' + st.radioCapture + '%. A nota quer outra rebobinada na janela.');
      }
    }

    // retrato: cada rebobinada própria arranca um pedaço da segunda pessoa
    if (origin === 'own' && st.portraitPieces < 5 && st.portraitFlipped === false) {
      RW.PuzzleLogic.portraitAfterRewind(st);
    }

    // fala obrigatória por faixa
    var line = null;
    if (origin === 'vela') {
      line = R.midVelaOrigin[Math.min(R.midVelaOrigin.length - 1, st.rewindsVela - 1)] || R.afterVela[0];
    } else if (st.rewindsOwn === 1) {
      line = R.first;
    } else if (st.rewindsOwn >= 5 && st.rewindsOwn <= 9) {
      line = R.mid[(st.rewindsOwn - 5) % R.mid.length];
    } else if (st.rewindsOwn >= 10) {
      line = R.late;
    } else {
      line = R.mid[Math.floor(Math.random() * Math.min(R.mid.length, 2))];
    }
    if (st.microLosses > 0 && Math.random() < 0.5) {
      line = line + ' ' + RW.Data.microLossNotes[(st.microLosses - 1) % RW.Data.microLossNotes.length];
    }
    RW.Dialogs.say({ who: 'vela', text: line, tone: st.rewindsOwn >= 10 ? 'RESIGNADO' : (st.rewindsOwn >= 5 ? 'ACUSACAO' : 'CORDIAL') }, function () {
      var noticed = RW.Memories.noticedLine(loss);
      if (noticed) {
        RW.Dialogs.say({ who: 'vela', text: noticed, tone: 'RESIGNADO' }, function () {
          postLossDialog(loss, origin);
        });
      } else {
        if (Math.random() < 0.45) {
          var inter = RW.Data.rewindInterstitial[(st.rewindsTotal - 1) % RW.Data.rewindInterstitial.length];
          RW.Dialogs.say({ who: 'vela', text: inter, tone: 'BARGAIN' }, function () { postLossDialog(loss, origin); });
        } else postLossDialog(loss, origin);
      }
    });
  }

  function postLossDialog(loss, origin) {
    var st = RW.state;
    // mudanças ambientais narrativas
    if (loss && loss.memory === 'm7' && st.visited && st.visited.sala) {
      RW.Data.secrets.chuvaPara.forEach(function (n) { RW.Dialogs.say(n); });
      RW.Audio.setRain(false);
    }
    if (loss && loss.memory === 'm9') {
      RW.Audio.setFlicker(false);
    }
    if (origin === 'own' && st.rewindsOwn === 7 && st.routeDiscoveries && st.routeDiscoveries.frequencia === undefined) {
      RW.Routes.engage('frequencia');
    }
    // memória restaurada temporária pelo corredor
    if (st.mirrorsSolved && loss && loss.memory) {
      var echo = RW.Memories.restoredEcho();
      if (echo) RW.UI.caption(echo.line);
    }
    RW.SaveSystem.save('current', st);
    checkActs();
  }

  // ---------------- ATOS ------------------------------------------------------------
  function checkActs() {
    var st = RW.state;
    if (st.prologueDone && st.act === 1 && st.rewindsTotal >= 2) {
      st.act = 2;
      st.actIntroSeen[2] = true;
      RW.Dialogs.sayMany(RW.Data.actIntros[2]);
    }
    if (!st.twist && RW.Endings.corePuzzlesDone(st) && st.rewindsOwn >= 7 && st.visited && st.visited.escadaria) {
      triggerTwist();
    }
    if (st.twist && st.act === 3 && st.rewindsOwn >= 8) {
      st.act = 4;
      st.actIntroSeen[4] = true;
      RW.Dialogs.sayMany(RW.Data.actIntros[4]);
    }
  }

  function triggerTwist() {
    var st = RW.state;
    st.twist = true;
    st.act = 3;
    st.actIntroSeen[3] = true;
    RW.UI.updateTitle(st);
    if (RW.Portal) RW.Portal.report('rewind', 'REWIND — revelação do legacy');
    RW.SaveSystem.ensureLegacy().then(function () {
      var script = RW.Data.twist.discover.concat(RW.Data.twist.restored);
      RW.Dialogs.sayMany(script, function () {
        st.twistSeen = true;
        var echo = RW.Memories.restoredEcho();
        if (echo) RW.UI.caption(echo.line);
        saveCheckpoint();
        checkActs();
      });
    });
  }

  function forceTwist() {
    var st = RW.state;
    if (st.twist) return;
    st.visited.escadaria = true;
    triggerTwist();
  }

  // ---------------- OCIOSIDADE -------------------------------------------------------
  function startIdleWatchers() {
    resetIdle();
    ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, resetIdle, { passive: true });
    });
  }

  function resetIdle() {
    clearTimeout(G.idleTimer1);
    clearTimeout(G.idleTimer2);
    G.idleState = 0;
    if (G.hidden) return;
    G.idleTimer1 = setTimeout(function () {
      if (!canIdle()) return;
      G.idleState = 1;
      RW.Room.setVela('sit');
      RW.UI.caption(RW.Data.idle.sit);
      if (Math.random() < 0.6) {
        RW.Dialogs.say({ who: 'vela', text: RW.Data.idle.sitLine[Math.floor(Math.random() * RW.Data.idle.sitLine.length)], tone: 'RESIGNADO' });
      }
      G.idleTimer2 = setTimeout(function () {
        if (!canIdle()) return;
        velaAutoRewind(false);
      }, 90000);
    }, 90000);
  }

  function canIdle() {
    var st = RW.state;
    if (!st || st.terminal || st.ending) return false;
    if (RW.Dialogs.isOpen() && RW.Dialogs.isTyping()) return false;
    if (RW.Rewind.isBusy() || RW.Endings.isBusy()) return false;
    if (RW.Room.currentScene() !== 'sala') return false;
    return true;
  }

  function velaAutoRewind(simulated) {
    var st = RW.state;
    if (!st.prologueDone || st.ending || st.terminal) return;
    G.idleState = 2;
    RW.UI.caption(RW.Data.idle.auto);
    RW.Rewind.perform('vela').then(function (loss) {
      if (loss) {
        RW.Dialogs.say({ who: 'vela', text: RW.Data.idle.autoLine, tone: 'RESIGNADO' }, function () {
          if (!simulated && Math.random() < 0.5) {
            RW.Routes.engage('silencio');
            RW.Data.secrets.maquinaConversa.forEach(function (n, i) {
              setTimeout(function () { RW.Dialogs.say(n); }, i * 200);
            });
          }
        });
      }
    });
  }

  // ---------------- AUTOSAVE + QUARTA PAREDE -----------------------------------------
  function startAutosave() {
    clearInterval(G.autosaveTimer);
    G.autosaveTimer = setInterval(function () {
      if (RW.state && !RW.state.terminal) RW.SaveSystem.save('current', RW.state);
    }, 20000);
  }

  function startFourthWall() {
    clearInterval(G.fourthWallTimer);
    G.fourthWallTimer = setInterval(function () {
      if (!RW.state || RW.state.terminal || RW.Dialogs.isOpen()) return;
      var line = fourthWallLine();
      if (line) RW.Dialogs.say({ who: 'vela', text: line, tone: 'CORDIAL' });
    }, 190000);
  }

  function fourthWallLine() {
    var st = RW.state;
    var now = new Date();
    var h = now.getHours();
    var dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    var dia = dias[now.getDay()];
    var hora = (h < 10 ? '0' : '') + h + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    var pool = RW.Data.fourthWall.filter(function (f) {
      if (f.cond === 'madrugada') return h >= 0 && h < 6;
      if (f.cond === 'manha') return h >= 6 && h < 12;
      if (f.cond === 'tarde') return h >= 12 && h < 18;
      if (f.cond === 'noite') return h >= 18;
      if (f.cond === 'count10') return st.rewindsTotal >= 10;
      if (f.cond === 'count15') return st.rewindsTotal >= 15;
      if (f.cond === 'examined') return st.behavior.attentive >= 10;
      if (f.cond === 'repetitive') return st.behavior.repetitive >= 3;
      if (f.cond === 'ignored') return st.behavior.ignored >= 4;
      return false;
    });
    if (!pool.length) return null;
    var f = pool[Math.floor(Math.random() * pool.length)];
    return f.text.replace('{hora}', hora).replace('{dia}', dia);
  }

  // checkpoint narrativo: estado temporal salvo em batimentos da história
  function saveCheckpoint() {
    if (!RW.state) return;
    RW.state.checkpoint = RW.State.snapshotTemporal(RW.state);
    RW.SaveSystem.save('current', RW.state);
  }

  function beat(kind) {
    var st = RW.state;
    if (kind === 'act') {
      if (st.actIntroSeen[st.act]) return;
      st.actIntroSeen[st.act] = true;
      if (RW.Data.actIntros[st.act]) RW.Dialogs.sayMany(RW.Data.actIntros[st.act]);
      saveCheckpoint();
      if (RW.Portal) RW.Portal.report('rewind', 'REWIND — ato ' + st.act);
    }
  }

  // conversa com Vela: botão dedicado (comportamento registrado)
  function talk() {
    var st = RW.state;
    if (st.terminal || st.ending) return;
    st.talked += 1;
    if (st.talked >= 3) st.behavior.talkedWith = true;
    var lines = [
      'Eu vigio um farol que morreu comigo. Isso é ofício ou é castigo? Depende da noite.',
      'Você me pergunta coisas. Eu respondo. Nenhum dos dois sabe por quê, e isso é quase uma amizade.',
      'Medo? Eu tenho medo do mar que não lembro. De você, eu só tenho costume.',
      'Eu era paciente quando era viva. Agora sou paciente de outro jeito: sem tempo dentro.',
      'O café aqui nunca esfria. É a única gentileza da máquina.',
      'Se você for embora de vez, limpe o quarto antes. Não por mim. Por quem vem depois.'
    ];
    var act = Math.min(4, Math.max(1, st.act || 1));
    if (act >= 3) lines.push('Conversar com você me lembra que eu tinha voz. Obrigada por gastar a sua comigo.');
    RW.Dialogs.say({ who: 'vela', text: lines[Math.floor(Math.random() * lines.length)], tone: act >= 3 ? 'RESIGNADO' : 'CORDIAL' });
    RW.SaveSystem.save('current', st);
  }

  RW.Game = {
    boot: boot,
    beat: beat,
    talk: talk,
    forceTwist: forceTwist,
    velaAutoRewind: velaAutoRewind,
    fourthWallLine: fourthWallLine,
    checkActs: checkActs,
    handleLoss: handleLoss,
    registerRewindHooks: registerRewindHooks,
    saveCheckpoint: saveCheckpoint
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', boot);
  }
})(typeof RW !== 'undefined' ? RW : (typeof globalThis !== 'undefined' ? globalThis.RW = {} : {}));
