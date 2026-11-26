/* Capas do portal — edição vetorial.
   Substitui os data URIs JPEG por arte SVG projetada (mais nítida, ~10x menor,
   sem dependência externa). O trabalho em JPEG/PNG permanece em assets/ e nos
   arquivos de distribuição; esta é a edição de referência do repositório. */
(function (RW) {
  'use strict';
  RW.Embedded = RW.Embedded || {};

  function svgUri(svg) { return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); }

  /* Capa REWIND // REWIND — farol solitário na tempestade, feixe amarelo doentio. */
  RW.Embedded.coverRewind = svgUri(
    "<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'>" +
    "<defs>" +
    "<linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>" +
    "<stop offset='0' stop-color='#141b28'/><stop offset='.55' stop-color='#1d2736'/>" +
    "<stop offset='1' stop-color='#0d1119'/></linearGradient>" +
    "<linearGradient id='sea' x1='0' y1='0' x2='0' y2='1'>" +
    "<stop offset='0' stop-color='#232f40'/><stop offset='1' stop-color='#10151f'/></linearGradient>" +
    "<radialGradient id='beam' cx='.5' cy='.5' r='.5'>" +
    "<stop offset='0' stop-color='#c9b23c' stop-opacity='.5'/>" +
    "<stop offset='1' stop-color='#c9b23c' stop-opacity='0'/></radialGradient>" +
    "<filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='matrix' values='0 0 0 0 0.8 0 0 0 0 0.8 0 0 0 0 0.85 0 0 0 .05 0'/>" +
    "<feComposite operator='over' in2='SourceGraphic'/></filter>" +
    "</defs>" +
    "<rect width='640' height='400' fill='url(#sky)'/>" +
    "<g opacity='.5'>" +
    "<path d='M0 90 Q80 70 160 92 T320 88 T480 94 T640 86 V0 H0 Z' fill='#1a2330'/>" +
    "<path d='M0 140 Q120 118 240 138 T480 134 T640 142 V60 H0 Z' fill='#161e2a' opacity='.8'/></g>" +
    "<ellipse cx='404' cy='128' rx='150' ry='46' fill='url(#beam)' transform='rotate(18 404 128)'/>" +
    "<ellipse cx='360' cy='120' rx='90' ry='30' fill='url(#beam)' transform='rotate(-12 360 120)'/>" +
    "<g filter='url(#grain)'>" +
    "<rect x='368' y='118' width='44' height='150' fill='#232b38'/>" +
    "<rect x='368' y='118' width='44' height='150' fill='none' stroke='#39424f' stroke-width='1'/>" +
    "<rect x='362' y='108' width='56' height='14' rx='2' fill='#2c3542'/>" +
    "<rect x='366' y='96' width='48' height='14' rx='6' fill='#39424f'/>" +
    "<circle cx='390' cy='103' r='7' fill='#c9b23c' opacity='.9'/>" +
    "<circle cx='390' cy='103' r='12' fill='#c9b23c' opacity='.25'/>" +
    "<rect x='372' y='160' width='10' height='14' fill='#141a24'/>" +
    "<rect x='386' y='190' width='10' height='14' fill='#141a24'/>" +
    "<rect x='372' y='222' width='10' height='14' fill='#141a24'/>" +
    "<rect x='352' y='268' width='76' height='10' rx='2' fill='#1d242f'/>" +
    "<rect x='342' y='278' width='96' height='8' rx='2' fill='#171d27'/>" +
    "<rect x='0' y='286' width='640' height='114' fill='url(#sea)'/>" +
    "<path d='M0 306 Q90 296 180 306 T360 304 T540 308 T640 302' stroke='#3a4a5e' stroke-width='2' fill='none' opacity='.6'/>" +
    "<path d='M0 336 Q110 326 220 336 T440 334 T640 338' stroke='#31405595' stroke-width='2' fill='none' opacity='.45'/>" +
    "<path d='M0 366 Q130 356 260 366 T520 364 T640 368' stroke='#2a3849' stroke-width='2' fill='none' opacity='.4'/>" +
    "<g stroke='#8fa3bd' stroke-width='1' opacity='.28'>" +
    "<path d='M40 40 l-8 26'/><path d='M96 24 l-8 26'/><path d='M150 60 l-8 26'/>" +
    "<path d='M210 30 l-8 26'/><path d='M262 70 l-8 26'/><path d='M318 44 l-8 26'/>" +
    "<path d='M520 34 l-8 26'/><path d='M568 64 l-8 26'/><path d='M612 26 l-8 26'/>" +
    "<path d='M560 150 l-8 26'/><path d='M80 180 l-8 26'/><path d='M140 260 l-8 26'/></g>" +
    "<rect width='640' height='400' fill='#0a0d14' opacity='.18'/>" +
    "</g></svg>"
  );

  /* Capa LINHA MORTA — painel da central, uma lâmpada acesa sem ficha. */
  RW.Embedded.coverLinha = svgUri(
    "<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'>" +
    "<defs>" +
    "<linearGradient id='panel' x1='0' y1='0' x2='0' y2='1'>" +
    "<stop offset='0' stop-color='#1a211c'/><stop offset='1' stop-color='#10140f'/></linearGradient>" +
    "<radialGradient id='lamp' cx='.5' cy='.35' r='.65'>" +
    "<stop offset='0' stop-color='#d8e8c8' stop-opacity='.95'/>" +
    "<stop offset='.4' stop-color='#7fa08f' stop-opacity='.55'/>" +
    "<stop offset='1' stop-color='#7fa08f' stop-opacity='0'/></radialGradient>" +
    "<filter id='grain2'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='matrix' values='0 0 0 0 0.75 0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 .05 0'/>" +
    "<feComposite operator='over' in2='SourceGraphic'/></filter>" +
    "</defs>" +
    "<rect width='640' height='400' fill='url(#panel)'/>" +
    "<g filter='url(#grain2)'>" +
    "<rect x='28' y='30' width='584' height='340' rx='10' fill='none' stroke='#39443a' stroke-width='3'/>" +
    "<rect x='44' y='46' width='552' height='44' rx='4' fill='#131a13'/>" +
    "<text x='60' y='76' font-family='Courier New, monospace' font-size='22' letter-spacing='6' fill='#7fa08f' opacity='.85'>RIACHUELO 4</text>" +
    "<text x='560' y='74' text-anchor='end' font-family='Courier New, monospace' font-size='15' fill='#a8bfa8' opacity='.7'>02:59</text>" +
    "<g fill='#0d110d' stroke='#4a574b' stroke-width='1.5'>" +
    "<circle cx='90' cy='140' r='13'/><circle cx='150' cy='140' r='13'/><circle cx='210' cy='140' r='13'/>" +
    "<circle cx='270' cy='140' r='13'/><circle cx='330' cy='140' r='13'/><circle cx='390' cy='140' r='13'/>" +
    "<circle cx='450' cy='140' r='13'/><circle cx='510' cy='140' r='13'/><circle cx='570' cy='140' r='13'/>" +
    "<circle cx='90' cy='220' r='13'/><circle cx='150' cy='220' r='13'/><circle cx='210' cy='220' r='13'/>" +
    "<circle cx='270' cy='220' r='13'/><circle cx='390' cy='220' r='13'/><circle cx='450' cy='220' r='13'/>" +
    "<circle cx='510' cy='220' r='13'/><circle cx='570' cy='220' r='13'/>" +
    "<circle cx='90' cy='300' r='13'/><circle cx='150' cy='300' r='13'/><circle cx='210' cy='300' r='13'/>" +
    "<circle cx='270' cy='300' r='13'/><circle cx='330' cy='300' r='13'/><circle cx='450' cy='300' r='13'/>" +
    "<circle cx='510' cy='300' r='13'/><circle cx='570' cy='300' r='13'/></g>" +
    "<circle cx='330' cy='220' r='13' fill='#0d110d' stroke='#4a574b' stroke-width='1.5'/>" +
    "<circle cx='330' cy='220' r='26' fill='url(#lamp)'/>" +
    "<circle cx='330' cy='220' r='6' fill='#d8e8c8'/>" +
    "<g stroke='#5d4433' stroke-width='3' fill='none' opacity='.9'>" +
    "<path d='M90 140 C 120 170, 160 130, 210 140'/><path d='M210 140 C 250 180, 300 150, 330 140'/>" +
    "<path d='M150 220 C 190 260, 240 240, 270 220'/><path d='M390 220 C 430 250, 480 230, 510 220'/>" +
    "<path d='M90 300 C 130 330, 180 320, 210 300'/><path d='M450 300 C 490 330, 530 320, 570 300'/></g>" +
    "<g stroke='#7a4a42' stroke-width='3' fill='none' opacity='.9'>" +
    "<path d='M270 140 C 300 110, 350 110, 390 140'/><path d='M510 140 C 540 170, 580 150, 570 140'/>" +
    "<path d='M330 220 C 300 250, 250 270, 210 300'/><path d='M570 220 C 560 260, 500 280, 450 300'/></g>" +
    "<rect x='44' y='340' width='552' height='22' rx='3' fill='#131a13'/>" +
    "<text x='60' y='356' font-family='Courier New, monospace' font-size='12' letter-spacing='3' fill='#a8bfa8' opacity='.55'>A1 · A2 · A3 · A4 · A5 · A6 · A7 · A8 — B1 · B2 · B3 · B4 · B5 · B6</text>" +
    "<rect width='640' height='400' fill='#0a0d14' opacity='.14'/>" +
    "</g></svg>"
  );
})(typeof window !== 'undefined' ? (window.RW = window.RW || {}) : (global.RW = global.RW || {}));
