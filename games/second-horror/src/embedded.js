/* Embedded assets — edição vetorial de LINHA MORTA.
   Data URI SVG projetado (nitidez estável, arquivo leve, zero hotlink).
   Referência do repositório; a arte JPEG/PNG original permanece em assets/
   e nos arquivos de distribuição. Regenerável por scripts/build_embed.py. */
(function (RW) {
  'use strict';
  RW.Embedded = RW.Embedded || {};

  function svgUri(svg) { return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); }

  /* Splash: a central à meia-luz, o relógio parado e o fone fora do gancho. */
  RW.Embedded.splash = svgUri(
    "<svg xmlns='http://www.w3.org/2000/svg' width='960' height='540' viewBox='0 0 960 540'>" +
    "<defs><linearGradient id='sala' x1='0' y1='0' x2='0' y2='1'>" +
    "<stop offset='0' stop-color='#131812'/><stop offset='.6' stop-color='#1a211a'/>" +
    "<stop offset='1' stop-color='#0c100c'/></linearGradient>" +
    "<radialGradient id='fosforo' cx='.5' cy='.4' r='.65'>" +
    "<stop offset='0' stop-color='#a8c4b6' stop-opacity='.22'/>" +
    "<stop offset='1' stop-color='#a8c4b6' stop-opacity='0'/></radialGradient>" +
    "<filter id='grain4'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='matrix' values='0 0 0 0 0.72 0 0 0 0 0.78 0 0 0 0 0.68 0 0 0 .05 0'/>" +
    "<feComposite operator='over' in2='SourceGraphic'/></filter></defs>" +
    "<rect width='960' height='540' fill='url(#sala)'/>" +
    "<g filter='url(#grain4)'>" +
    "<rect x='60' y='70' width='600' height='380' rx='8' fill='#161c15'/>" +
    "<rect x='60' y='70' width='600' height='380' rx='8' fill='none' stroke='#39443a' stroke-width='3'/>" +
    "<g fill='#0d110d' stroke='#4a574b' stroke-width='1.5'>" +
    "<circle cx='120' cy='150' r='12'/><circle cx='180' cy='150' r='12'/><circle cx='240' cy='150' r='12'/>" +
    "<circle cx='300' cy='150' r='12'/><circle cx='360' cy='150' r='12'/><circle cx='480' cy='150' r='12'/>" +
    "<circle cx='540' cy='150' r='12'/><circle cx='600' cy='150' r='12'/>" +
    "<circle cx='120' cy='230' r='12'/><circle cx='180' cy='230' r='12'/><circle cx='300' cy='230' r='12'/>" +
    "<circle cx='360' cy='230' r='12'/><circle cx='420' cy='230' r='12'/><circle cx='480' cy='230' r='12'/>" +
    "<circle cx='540' cy='230' r='12'/><circle cx='600' cy='230' r='12'/>" +
    "<circle cx='120' cy='310' r='12'/><circle cx='180' cy='310' r='12'/><circle cx='240' cy='310' r='12'/>" +
    "<circle cx='360' cy='310' r='12'/><circle cx='420' cy='310' r='12'/><circle cx='600' cy='310' r='12'/></g>" +
    "<g stroke='#5d4433' stroke-width='3' fill='none' opacity='.85'>" +
    "<path d='M120 150 C 150 180, 200 160, 240 150'/><path d='M300 150 C 330 120, 380 120, 420 150'/>" +
    "<path d='M180 230 C 220 270, 270 260, 300 230'/><path d='M480 230 C 510 260, 560 250, 600 230'/>" +
    "<path d='M240 310 C 270 340, 320 330, 360 310'/></g>" +
    "<g stroke='#7a4a42' stroke-width='3' fill='none' opacity='.85'>" +
    "<path d='M240 150 C 260 190, 220 210, 180 230'/><path d='M540 150 C 560 190, 520 220, 480 230'/>" +
    "<path d='M420 230 C 400 270, 440 290, 420 310'/></g>" +
    "<ellipse cx='420' cy='230' rx='150' ry='110' fill='url(#fosforo)'/>" +
    "<circle cx='420' cy='230' r='10' fill='#d8e8c8' opacity='.9'/>" +
    "<rect x='700' y='120' width='190' height='90' rx='6' fill='#101510'/>" +
    "<rect x='700' y='120' width='190' height='90' rx='6' fill='none' stroke='#39443a' stroke-width='2'/>" +
    "<text x='795' y='186' text-anchor='middle' font-family='Courier New, monospace' font-size='42' fill='#a8c4b6' opacity='.85'>02:59</text>" +
    "<g transform='translate(760 330)'>" +
    "<path d='M0 0 q60 -34 120 0' stroke='#39443a' stroke-width='4' fill='none'/>" +
    "<path d='M52 -18 q8 -30 16 0' stroke='#39443a' stroke-width='3' fill='none'/>" +
    "<path d='M40 8 q20 26 40 0 l-6 46 q-14 10 -28 0 Z' fill='#222b21' stroke='#39443a' stroke-width='2'/></g>" +
    "<path d='M760 336 q-40 60 20 96' stroke='#39443a' stroke-width='3' fill='none'/>" +
    "<rect x='60' y='470' width='830' height='14' rx='3' fill='#121711'/>" +
    "<rect width='960' height='540' fill='#070a07' opacity='.28'/>" +
    "</g></svg>"
  );
})(typeof window !== 'undefined' ? (window.RW = window.RW || {}) : (global.RW = global.RW || {}));
