/* Launcher — portal com dois jogos independentes.
   Apenas identifica os jogos e oferece acesso; não altera estados narrativos. */
(function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }

  function setCover(imgEl, dataUri) {
    if (imgEl && dataUri) {
      imgEl.src = dataUri;
      imgEl.addEventListener('error', function () {
        imgEl.style.display = 'none';
        imgEl.parentNode.style.background = 'linear-gradient(160deg,#1a2233,#0e1320)';
      });
    } else if (imgEl) {
      imgEl.style.display = 'none';
      imgEl.parentNode.style.background = 'linear-gradient(160deg,#1a2233,#0e1320)';
    }
  }

  function readProgress(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function showContinue() {
    var rw = readProgress('portal_progress_rewind');
    var lm = readProgress('portal_progress_second_horror');
    if (rw && byId('rewind-continue')) {
      byId('rewind-continue').classList.remove('hidden');
      byId('rewind-continue').title = rw.label || 'sessão em andamento';
    }
    if (lm && byId('linha-continue')) {
      byId('linha-continue').classList.remove('hidden');
      byId('linha-continue').title = lm.label || 'sessão em andamento';
    }
  }

  function openGame(which) {
    var url = which === 'rewind' ? 'games/rewind/index.html' : 'games/second-horror/index.html';
    try {
      localStorage.setItem('portal_last', which);
    } catch (e) { /* contingência */ }
    window.location.href = url;
  }

  function init() {
    setCover(byId('cover-rewind'), window.RW && window.RW.Embedded ? window.RW.Embedded.coverRewind : null);
    setCover(byId('cover-linha'), window.RW && window.RW.Embedded ? window.RW.Embedded.coverLinha : null);
    showContinue();
    byId('card-rewind').addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      openGame('rewind');
    });
    byId('card-linha').addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      openGame('linha');
    });
    document.querySelectorAll('.play-btn').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        openGame(b.getAttribute('data-game'));
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var active = document.activeElement;
        if (active && (active.id === 'card-rewind' || active.id === 'card-linha')) {
          e.preventDefault();
          openGame(active.id === 'card-rewind' ? 'rewind' : 'linha');
        }
      }
    });
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
