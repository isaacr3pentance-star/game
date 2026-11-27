/* Embedded assets — edição vetorial de REWIND // REWIND.
   Data URIs SVG projetados (nitidez estável, arquivo leve, zero hotlink).
   Referência do repositório; a arte JPEG/PNG original permanece em assets/
   e nos arquivos de distribuição. Regenerável por scripts/build_embed.py. */
(function (RW) {
  'use strict';
  RW.Embedded = RW.Embedded || {};

  function svgUri(svg) { return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); }

  /* O retrato: duas pessoas; a segunda segura uma lanterna que não ilumina. */
  RW.Embedded.foto = svgUri(
    "<svg xmlns='http://www.w3.org/2000/svg' width='460' height='560' viewBox='0 0 460 560'>" +
    "<defs><linearGradient id='papel' x1='0' y1='0' x2='0' y2='1'>" +
    "<stop offset='0' stop-color='#b7a98c'/><stop offset='1' stop-color='#8f8268'/></linearGradient>" +
    "<radialGradient id='vinh' cx='.5' cy='.45' r='.75'>" +
    "<stop offset='.55' stop-color='#000' stop-opacity='0'/>" +
    "<stop offset='1' stop-color='#000' stop-opacity='.42'/></radialGradient>" +
    "<filter id='foto-grain'><feTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='matrix' values='0 0 0 0 0.25 0 0 0 0 0.22 0 0 0 0 0.18 0 0 0 .08 0'/>" +
    "<feComposite operator='over' in2='SourceGraphic'/></filter></defs>" +
    "<rect width='460' height='560' fill='url(#papel)'/>" +
    "<g filter='url(#foto-grain)'>" +
    "<rect x='26' y='26' width='408' height='470' fill='#a3947a'/>" +
    "<rect x='26' y='26' width='408' height='470' fill='none' stroke='#6f6450' stroke-width='2'/>" +
    "<rect x='42' y='42' width='376' height='380' fill='#877961'/>" +
    "<rect x='42' y='42' width='376' height='130' fill='#93866c'/>" +
    "<rect x='42' y='150' width='376' height='272' fill='#817359'/>" +
    "<ellipse cx='150' cy='300' rx='46' ry='56' fill='#5c5140'/>" +
    "<path d='M96 420 Q150 330 204 420 Z' fill='#4c4234'/>" +
    "<ellipse cx='306' cy='286' rx='52' ry='62' fill='#544a3a'/>" +
    "<path d='M244 420 Q306 316 368 420 Z' fill='#453c2f'/>" +
    "<circle cx='306' cy='232' r='26' fill='#6a5d49'/>" +
    "<path d='M296 214 q10 -8 22 0' stroke='#3f382c' stroke-width='3' fill='none'/>" +
    "<circle cx='150' cy='258' r='20' fill='#655944'/>" +
    "<g stroke='#3a3226' stroke-width='2' opacity='.8'>" +
    "<path d='M118 262 h20'/><path d='M162 258 h18'/></g>" +
    "<g transform='translate(348 340)'>" +
    "<rect x='-9' y='0' width='18' height='24' rx='3' fill='#3f382c'/>" +
    "<rect x='-6' y='24' width='12' height='8' fill='#332d23'/>" +
    "<circle cx='0' cy='10' r='7' fill='#7d715a'/>" +
    "<circle cx='0' cy='10' r='12' fill='#c9b23c' opacity='.07'/></g>" +
    "<path d='M348 364 q-4 26 6 52' stroke='#3f382c' stroke-width='4' fill='none'/>" +
    "<g stroke='#4c4335' stroke-width='1' opacity='.5'>" +
    "<path d='M60 80 l40 400'/><path d='M110 60 l30 420'/><path d='M330 50 l20 440'/>" +
    "<path d='M390 70 l14 420'/></g>" +
    "<rect x='42' y='300' width='376' height='60' fill='#7a6c55' opacity='.35'/>" +
    "<g stroke='#5a4f3d' stroke-width='2.5' opacity='.9'>" +
    "<path d='M196 468 l30 34'/><path d='M226 468 l-30 34'/></g>" +
    "<text x='230' y='492' text-anchor='middle' font-family='Georgia, serif' font-size='21' fill='#544a38' opacity='.75'>V. &amp; M.</text>" +
    "<path d='M214 480 l14 10 M246 476 l-12 12' stroke='#4a4030' stroke-width='2'/>" +
    "<rect width='460' height='560' fill='url(#vinh)'/>" +
    "</g></svg>"
  );

  /* Splash do quarto — janela, chuva e o feixe distante do farol. */
  RW.Embedded.splashRoom = svgUri(
    "<svg xmlns='http://www.w3.org/2000/svg' width='960' height='540' viewBox='0 0 960 540'>" +
    "<defs><linearGradient id='quarto' x1='0' y1='0' x2='0' y2='1'>" +
    "<stop offset='0' stop-color='#10141d'/><stop offset='.6' stop-color='#171d29'/>" +
    "<stop offset='1' stop-color='#0b0e15'/></linearGradient>" +
    "<radialGradient id='janela' cx='.5' cy='.5' r='.7'>" +
    "<stop offset='0' stop-color='#22303f'/><stop offset='1' stop-color='#22303f' stop-opacity='0'/></radialGradient>" +
    "<radialGradient id='feixe2' cx='.5' cy='.5' r='.5'>" +
    "<stop offset='0' stop-color='#c9b23c' stop-opacity='.32'/>" +
    "<stop offset='1' stop-color='#c9b23c' stop-opacity='0'/></radialGradient>" +
    "<filter id='grain3'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='matrix' values='0 0 0 0 0.8 0 0 0 0 0.82 0 0 0 0 0.86 0 0 0 .045 0'/>" +
    "<feComposite operator='over' in2='SourceGraphic'/></filter></defs>" +
    "<rect width='960' height='540' fill='url(#quarto)'/>" +
    "<g filter='url(#grain3)'>" +
    "<rect x='330' y='90' width='300' height='330' rx='4' fill='#1b2534'/>" +
    "<rect x='330' y='90' width='300' height='330' rx='4' fill='none' stroke='#3c4658' stroke-width='5'/>" +
    "<rect x='475' y='90' width='10' height='330' fill='#3c4658'/>" +
    "<rect x='330' y='250' width='300' height='10' fill='#3c4658'/>" +
    "<ellipse cx='480' cy='255' rx='230' ry='150' fill='url(#janela)'/>" +
    "<ellipse cx='620' cy='180' rx='170' ry='60' fill='url(#feixe2)' transform='rotate(20 620 180)'/>" +
    "<circle cx='700' cy='150' r='14' fill='#c9b23c' opacity='.55'/>" +
    "<circle cx='700' cy='150' r='26' fill='#c9b23c' opacity='.16'/>" +
    "<path d='M690 168 l20 0 l6 40 l-32 0 Z' fill='#141a24'/>" +
    "<g stroke='#7f93ad' stroke-width='1.4' opacity='.4'>" +
    "<path d='M360 120 l-10 44'/><path d='M420 100 l-10 44'/><path d='M540 110 l-10 44'/>" +
    "<path d='M600 130 l-10 44'/><path d='M380 200 l-10 44'/><path d='M580 220 l-10 44'/>" +
    "<path d='M430 300 l-10 44'/><path d='M520 290 l-10 44'/></g>" +
    "<rect x='0' y='420' width='960' height='120' fill='#0d1119'/>" +
    "<rect x='120' y='440' width='150' height='60' rx='4' fill='#151b26'/>" +
    "<rect x='128' y='448' width='134' height='44' rx='2' fill='#1a2230'/>" +
    "<rect x='700' y='430' width='120' height='80' rx='6' fill='#141a25'/>" +
    "<rect x='716' y='446' width='88' height='20' rx='3' fill='#1c2431'/>" +
    "<rect width='960' height='540' fill='#07090e' opacity='.3'/>" +
    "</g></svg>"
  );
})(typeof window !== 'undefined' ? (window.RW = window.RW || {}) : (global.RW = global.RW || {}));
