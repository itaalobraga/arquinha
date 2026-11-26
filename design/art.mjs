// Gera toda a arte do Arquinha a partir de uma única descrição vetorial:
//   - ícone iOS (Icon Composer: assets/app.icon) + PNGs de reserva
//   - ícone adaptativo do Android (frente, fundo e monocromático)
//   - imagem da splash nativa (assets/splash-icon.png)
//   - animação Lottie da abertura (assets/lottie/splash.json)
//
// Rodar: node design/art.mjs
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => join(ROOT, p);

// ---------------------------------------------------------------------------
// Paleta
const C = {
  cream: '#FFF4D6',
  brown: '#5B3A1A',
  hull: '#8A5A2E',
  hullDark: '#6F4523',
  rim: '#A8703A',
  cabin: '#F6CF8F',
  roof: '#FF6B3D',
  giraffe: '#F7C548',
  giraffeDark: '#F2B230',
  giraffeSpot: '#D9902A',
  eye: '#3A2410',
  elephant: '#A7B4C2',
  elephantDark: '#93A1B1',
  elephantEar: '#F4A6B8',
  rainbow: ['#FF5A5F', '#FF9F40', '#FFD84D', '#5BCB7A', '#4AA8FF'],
  wave: '#4AA8FF',
  waveLight: '#8CCBFF',
  waveDeep: '#2E8FE0',
  sparkle: '#FFC93C',
  skyTop: '#7FD0FF',
  skyBottom: '#D4F1FF',
};

// ---------------------------------------------------------------------------
// Caminhos (bezier) — mesma estrutura do Lottie: vértices + tangentes relativas
class Path {
  constructor() {
    this.nodes = [];
    this.closed = false;
  }
  static start(x, y) {
    const p = new Path();
    p.nodes.push({ v: [x, y], i: [0, 0], o: [0, 0] });
    return p;
  }
  get last() {
    return this.nodes[this.nodes.length - 1];
  }
  line(x, y) {
    this.nodes.push({ v: [x, y], i: [0, 0], o: [0, 0] });
    return this;
  }
  curve(c1x, c1y, c2x, c2y, x, y) {
    const a = this.last;
    a.o = [c1x - a.v[0], c1y - a.v[1]];
    this.nodes.push({ v: [x, y], i: [c2x - x, c2y - y], o: [0, 0] });
    return this;
  }
  close() {
    const first = this.nodes[0];
    const last = this.last;
    if (this.nodes.length > 1 && last.v[0] === first.v[0] && last.v[1] === first.v[1]) {
      first.i = last.i;
      this.nodes.pop();
    }
    this.closed = true;
    return this;
  }
  toSvg() {
    const n = this.nodes;
    const f = (v) => +v.toFixed(2);
    let d = `M${f(n[0].v[0])},${f(n[0].v[1])}`;
    const seg = (a, b) =>
      ` C${f(a.v[0] + a.o[0])},${f(a.v[1] + a.o[1])} ${f(b.v[0] + b.i[0])},${f(b.v[1] + b.i[1])} ${f(b.v[0])},${f(b.v[1])}`;
    for (let k = 1; k < n.length; k++) d += seg(n[k - 1], n[k]);
    if (this.closed) d += seg(n[n.length - 1], n[0]) + 'Z';
    return d;
  }
  toLottie() {
    return {
      i: this.nodes.map((n) => n.i),
      o: this.nodes.map((n) => n.o),
      v: this.nodes.map((n) => n.v),
      c: this.closed,
    };
  }
}

const K = 0.5523;
function semicircle(cx, cy, r) {
  return Path.start(cx - r, cy)
    .curve(cx - r, cy - r * K, cx - r * K, cy - r, cx, cy - r)
    .curve(cx + r * K, cy - r, cx + r, cy - r * K, cx + r, cy);
}
function waveLine(x0, x1, y, half, amp) {
  const p = Path.start(x0, y);
  let up = true;
  for (let x = x0; x + half <= x1 + 0.01; x += half) {
    const cy = y + (up ? -amp * 1.3 : amp * 1.3);
    p.curve(x + half * 0.3, cy, x + half * 0.7, cy, x + half, y);
    up = !up;
  }
  return p;
}
function sparklePath(cx, cy, R) {
  const t = R * 0.18;
  return Path.start(cx, cy - R)
    .curve(cx, cy - t, cx + t, cy, cx + R, cy)
    .curve(cx + t, cy, cx, cy + t, cx, cy + R)
    .curve(cx, cy + t, cx - t, cy, cx - R, cy)
    .curve(cx - t, cy, cx, cy - t, cx, cy - R)
    .close();
}
function wavesFill(y, half, amp, x0 = -128, x1 = 1152, bottom = 1100) {
  const p = Path.start(x0, bottom).line(x0, y);
  let up = true;
  for (let x = x0; x + half <= x1 + 0.01; x += half) {
    const cy = y + (up ? -amp * 1.3 : amp * 1.3);
    p.curve(x + half * 0.3, cy, x + half * 0.7, cy, x + half, y);
    up = !up;
  }
  return p.line(p.last.v[0], bottom).close();
}

// ---------------------------------------------------------------------------
// Peças (coordenadas num quadro de 1024; a arca fica centrada em 512,512)
const el = (cx, cy, rx, ry = rx) => ({ t: 'el', cx, cy, rx, ry });
const rc = (x, y, w, h, r = 0) => ({ t: 'rc', x, y, w, h, r });
const sh = (path) => ({ t: 'sh', path });
const G = (shapes, fill, extra = {}) => ({ shapes, fill, ...extra });

const hullPath = Path.start(196, 552)
  .line(828, 552)
  .curve(806, 650, 746, 732, 652, 732)
  .line(372, 732)
  .curve(278, 732, 218, 650, 196, 552)
  .close();

const roofPath = Path.start(316, 424)
  .line(500, 300)
  .curve(507, 295, 517, 295, 524, 300)
  .line(708, 424)
  .close();

const PARTS = {
  cabin: [
    G([rc(352, 400, 320, 150, 18)], C.cabin),
    G([el(430, 474, 34), el(594, 474, 34)], C.brown),
    G([sh(roofPath)], C.roof),
  ],
  hull: [
    G([sh(hullPath)], C.hull),
    G([rc(228, 604, 568, 12, 6), rc(270, 664, 484, 12, 6)], C.hullDark),
    G([rc(184, 528, 656, 44, 22)], C.rim),
  ],
  giraffe: [
    G([rc(262, 320, 56, 250, 28)], C.giraffe),
    G([el(282, 392, 14, 16), el(302, 452, 12, 14), el(280, 510, 13, 15)], C.giraffeSpot),
    G([rc(276, 232, 10, 40, 5), rc(304, 228, 10, 44, 5)], C.giraffeDark),
    G([el(281, 232, 11), el(309, 228, 11)], C.hull),
    G([el(258, 282, 22, 12)], C.giraffeDark),
    G([el(306, 296, 58, 42)], C.giraffe),
    G([el(346, 310, 30, 25)], C.giraffeDark),
    G([el(302, 286, 8), el(352, 304, 4)], C.eye),
  ],
  elephant: [
    G([el(712, 462, 44, 56)], C.elephantDark),
    G([el(716, 466, 26, 36)], C.elephantEar),
    G([el(756, 476, 66)], C.elephant),
    G(
      [sh(Path.start(800, 506).curve(840, 500, 856, 464, 848, 420))],
      null,
      { stroke: { color: C.elephant, width: 30 } },
    ),
    G([el(778, 458, 8)], C.eye),
    G([el(774, 498, 14, 9)], C.elephantEar, { opacity: 70 }),
  ],
};

const RAINBOW_RADII = [400, 366, 332, 298, 264];
const RAINBOW_CENTER = [512, 560];

// ---------------------------------------------------------------------------
// SVG
function shapeSvg(s) {
  if (s.t === 'el') return `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}"/>`;
  if (s.t === 'rc') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.r}"/>`;
  return `<path d="${s.path.toSvg()}"/>`;
}
function groupSvg(g, override) {
  const fill = override ?? g.fill;
  const attrs = g.stroke
    ? `fill="none" stroke="${override ?? g.stroke.color}" stroke-width="${g.stroke.width}" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="${fill}"`;
  const op = g.opacity != null && !override ? ` opacity="${g.opacity / 100}"` : '';
  return `<g ${attrs}${op}>${g.shapes.map(shapeSvg).join('')}</g>`;
}
const partsSvg = (names, override) =>
  names.map((n) => PARTS[n].map((g) => groupSvg(g, override)).join('')).join('');

function rainbowSvg() {
  const [cx, cy] = RAINBOW_CENTER;
  return RAINBOW_RADII.map(
    (r, k) =>
      `<path d="${semicircle(cx, cy, r).toSvg()}" fill="none" stroke="${C.rainbow[k]}" stroke-width="36" stroke-linecap="round"/>`,
  ).join('');
}
const ARK_ALL = ['giraffe', 'elephant', 'cabin', 'hull'];
const ARK_ONLY = ['cabin', 'hull'];

const svgDoc = (body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
const skyDefs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.skyTop}"/><stop offset="1" stop-color="${C.skyBottom}"/></linearGradient>`;
const sky = `<rect width="1024" height="1024" fill="url(#sky)"/>`;
const waves = (dy = 0) =>
  `<path d="${wavesFill(742 + dy, 64, 22).toSvg()}" fill="${C.waveLight}"/>` +
  `<path d="${wavesFill(806 + dy, 80, 26, -160).toSvg()}" fill="${C.wave}"/>` +
  `<path d="${wavesFill(896 + dy, 72, 20, -100).toSvg()}" fill="${C.waveDeep}"/>`;

// Ícone completo (quadro 1024). A arte desce um pouco para dar espaço ao arco-íris.
const iconArt = (t = 'translate(0,40)') => `<g transform="${t}">${rainbowSvg()}${partsSvg(ARK_ALL)}</g>`;

// Android: tudo que importa precisa caber no círculo seguro (66/108 do quadro).
const AND_T = 'translate(512,520) scale(0.74) translate(-512,-480)';

const SVGS = {
  'icon.svg': svgDoc(sky + iconArt() + waves(), skyDefs),
  'icon-dark.svg': svgDoc(
    `<rect width="1024" height="1024" fill="#0E2238"/>` + iconArt() + waves(),
  ),
  'splash-icon.svg': svgDoc(partsSvg(ARK_ONLY)),
  'android-icon-background.svg': svgDoc(
    sky + `<g transform="${AND_T}">${rainbowSvg()}</g>`,
    skyDefs,
  ),
  'android-icon-foreground.svg': svgDoc(`<g transform="${AND_T}">${partsSvg(ARK_ALL)}</g>` + waves(-52)),
  'android-icon-monochrome.svg': svgDoc(
    `<g transform="${AND_T}">${partsSvg(ARK_ALL, '#FFFFFF')}` +
      `<g fill="#000">${[el(430, 474, 34), el(594, 474, 34), rc(228, 604, 568, 12, 6), rc(270, 664, 484, 12, 6), el(302, 286, 8), el(778, 458, 8)].map(shapeSvg).join('')}</g></g>`,
  ),
  // Camadas do Icon Composer (o fundo é o "fill" do icon.json)
  'layer-rainbow.svg': svgDoc(`<g transform="translate(0,40)">${rainbowSvg()}</g>`),
  'layer-ark.svg': svgDoc(`<g transform="translate(0,40)">${partsSvg(ARK_ALL)}</g>`),
  'layer-waves.svg': svgDoc(waves()),
};

// No monocromático, os detalhes viram "furos": troca preto por transparente.
SVGS['android-icon-monochrome.svg'] = SVGS['android-icon-monochrome.svg'].replace(
  /<svg ([^>]*)>(.*)<\/svg>/s,
  (_, a, body) =>
    `<svg ${a}><defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">${body}</mask></defs><rect width="1024" height="1024" fill="#FFFFFF" mask="url(#m)"/></svg>`,
);

function png(svg, size) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
}
function write(p, data) {
  mkdirSync(dirname(out(p)), { recursive: true });
  writeFileSync(out(p), data);
}

// ---------------------------------------------------------------------------
// Lottie
const FR = 30;
const OP = 90; // 3 s
const COMP = 1536; // quadro maior que o da splash nativa: a cena cresce um pouco

const rgba = (h) => [1, 3, 5].map((k) => +(parseInt(h.slice(k, k + 2), 16) / 255).toFixed(4)).concat(1);
const EASE = {
  inOut: { o: [0.45, 0], i: [0.55, 1] },
  out: { o: [0.22, 1], i: [0.36, 1] },
  in: { o: [0.55, 0], i: [0.8, 0.2] },
  linear: { o: [0, 0], i: [1, 1] },
};
const st = (k) => ({ a: 0, k });
// kfs: [[t, valor, ease?], ...]
function anim(kfs) {
  return {
    a: 1,
    k: kfs.map(([t, v, e = 'inOut'], idx) => {
      const s = Array.isArray(v) ? v : [v];
      const kf = { t, s };
      if (idx < kfs.length - 1) {
        const d = s.length;
        const E = EASE[e];
        kf.o = { x: Array(d).fill(E.o[0]), y: Array(d).fill(E.o[1]) };
        kf.i = { x: Array(d).fill(E.i[0]), y: Array(d).fill(E.i[1]) };
      }
      return kf;
    }),
  };
}
const prop = (v) => (v && v.a === 1 ? v : st(v));

function lShape(s) {
  if (s.t === 'el') return { ty: 'el', d: 1, p: st([s.cx, s.cy]), s: st([s.rx * 2, s.ry * 2]) };
  if (s.t === 'rc')
    return { ty: 'rc', d: 1, p: st([s.x + s.w / 2, s.y + s.h / 2]), s: st([s.w, s.h]), r: st(s.r) };
  return { ty: 'sh', d: 1, ks: st(s.path.toLottie()) };
}
const TR = (o = 100) => ({
  ty: 'tr',
  p: st([0, 0]),
  a: st([0, 0]),
  s: st([100, 100]),
  r: st(0),
  o: st(o),
  sk: st(0),
  sa: st(0),
});
function lGroup(g, trim) {
  const it = g.shapes.map(lShape);
  if (trim) it.push({ ty: 'tm', s: st(0), e: prop(trim), o: st(0), m: 1 });
  if (g.stroke)
    it.push({ ty: 'st', c: st(rgba(g.stroke.color)), o: st(100), w: st(g.stroke.width), lc: 2, lj: 2, ml: 4 });
  else it.push({ ty: 'fl', c: st(rgba(g.fill)), o: st(100), r: 1 });
  it.push(TR(g.opacity ?? 100));
  return { ty: 'gr', nm: 'g', it };
}

const layers = []; // de baixo para cima; invertido no final
let ind = 0;
function layer({ nm, parent, groups = [], null: isNull, p = [0, 0], a = [0, 0], s = 100, r = 0, o = 100 }) {
  ind += 1;
  const sv = (v) => (v && v.a === 1 ? v : st([v, v, 100]));
  const pv = (v) => (v && v.a === 1 ? v : st([v[0], v[1], 0]));
  const L = {
    ddd: 0,
    ind,
    ty: isNull ? 3 : 4,
    nm,
    sr: 1,
    ks: { o: prop(o), r: prop(r), p: pv(p), a: st([a[0], a[1], 0]), s: sv(s) },
    ao: 0,
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  };
  if (parent) L.parent = parent;
  // No Lottie o primeiro grupo é desenhado por cima: inverte a ordem (de baixo para cima).
  if (!isNull) L.shapes = groups.slice().reverse();
  layers.push(L);
  return ind;
}

// Cena inteira: mapeia o quadro 1024 para o centro do COMP e cresce de leve.
const scene = layer({
  nm: 'cena',
  null: true,
  a: [512, 512],
  p: [COMP / 2, COMP / 2],
  s: anim([
    [0, [100, 100, 100]],
    [36, [108, 108, 100], 'out'],
    [OP, [108, 108, 100]],
  ]),
});

// Arco-íris: cada faixa se desenha da esquerda para a direita.
const [rcx, rcy] = RAINBOW_CENTER;
RAINBOW_RADII.forEach((rad, k) => {
  const t0 = 36 + k * 4;
  layer({
    nm: `arco-${k}`,
    parent: scene,
    groups: [
      lGroup(
        { shapes: [sh(semicircle(rcx, rcy, rad))], stroke: { color: C.rainbow[k], width: 36 } },
        anim([
          [0, 0],
          [t0, 0, 'out'],
          [t0 + 22, 100],
        ]),
      ),
    ],
  });
});

// Arca balançando no mar.
const ark = layer({
  nm: 'arca',
  null: true,
  parent: scene,
  a: [512, 680],
  p: anim([
    [0, [512, 680, 0]],
    [18, [512, 688, 0]],
    [40, [512, 672, 0]],
    [62, [512, 686, 0]],
    [OP, [512, 676, 0]],
  ]),
  r: anim([
    [0, 0],
    [20, -3],
    [42, 2.5],
    [64, -2],
    [OP, 1.5],
  ]),
});

// Bichos surgem de trás do casco com um "pop".
const pop = (t) =>
  anim([
    [0, [0, 0, 100]],
    [t, [0, 0, 100], 'out'],
    [t + 9, [112, 112, 100], 'inOut'],
    [t + 15, [96, 96, 100], 'inOut'],
    [t + 20, [100, 100, 100]],
  ]);
layer({ nm: 'girafa', parent: ark, a: [290, 560], p: [290, 560], s: pop(12), groups: PARTS.giraffe.map((g) => lGroup(g)) });
layer({ nm: 'elefante', parent: ark, a: [756, 560], p: [756, 560], s: pop(22), groups: PARTS.elephant.map((g) => lGroup(g)) });
layer({ nm: 'cabine', parent: ark, groups: PARTS.cabin.map((g) => lGroup(g)) });
layer({ nm: 'casco', parent: ark, groups: PARTS.hull.map((g) => lGroup(g)) });

// Ondinhas: se desenham e balançam de um lado para o outro.
function waveLayer(nm, x0, x1, y, color, t0, dir) {
  layer({
    nm,
    parent: scene,
    p: anim([
      [0, [0, 0, 0]],
      [30, [18 * dir, 0, 0]],
      [60, [-12 * dir, 0, 0]],
      [OP, [10 * dir, 0, 0]],
    ]),
    groups: [
      lGroup(
        { shapes: [sh(waveLine(x0, x1, y, 42, 12))], stroke: { color, width: 22 } },
        anim([
          [0, 0],
          [t0, 0, 'out'],
          [t0 + 18, 100],
        ]),
      ),
    ],
  });
}
waveLayer('onda-tras', 302, 722, 800, C.waveLight, 6, -1);
waveLayer('onda-frente', 218, 806, 756, C.wave, 2, 1);

// Brilhinhos no fim.
[
  [170, 360, 46, 56],
  [870, 300, 40, 62],
  [500, 178, 32, 68],
].forEach(([x, y, R, t], k) => {
  layer({
    nm: `brilho-${k}`,
    parent: scene,
    a: [x, y],
    p: [x, y],
    s: anim([
      [0, [0, 0, 100]],
      [t, [0, 0, 100], 'out'],
      [t + 8, [120, 120, 100], 'inOut'],
      [t + 14, [100, 100, 100]],
    ]),
    r: anim([
      [0, 0],
      [t, 0, 'linear'],
      [OP, 45],
    ]),
    groups: [lGroup({ shapes: [sh(sparklePath(x, y, R))], fill: C.sparkle })],
  });
});

const lottie = {
  v: '5.12.2',
  fr: FR,
  ip: 0,
  op: OP,
  w: COMP,
  h: COMP,
  nm: 'Arquinha splash',
  ddd: 0,
  assets: [],
  layers: layers.slice().reverse(),
  markers: [],
};

// ---------------------------------------------------------------------------
// Icon Composer (.icon) — o mesmo formato que o app da Apple salva.
const p3 = (h) =>
  'extended-srgb:' +
  rgba(h)
    .map((x) => x.toFixed(5))
    .join(',');
const iconJson = {
  fill: { 'automatic-gradient': p3(C.skyTop) },
  groups: [
    {
      layers: [{ 'image-name': 'layer-waves.svg', name: 'ondas', glass: true }],
      shadow: { kind: 'neutral', opacity: 0.5 },
      translucency: { enabled: true, value: 0.4 },
    },
    {
      layers: [{ 'image-name': 'layer-ark.svg', name: 'arca' }],
      shadow: { kind: 'neutral', opacity: 0.5 },
      translucency: { enabled: false, value: 0.5 },
    },
    {
      layers: [{ 'image-name': 'layer-rainbow.svg', name: 'arco-iris' }],
      shadow: { kind: 'neutral', opacity: 0.3 },
      translucency: { enabled: false, value: 0.5 },
    },
  ],
  'supported-platforms': { circles: ['watchOS'], squares: 'shared' },
};

// ---------------------------------------------------------------------------
// Saída
for (const [name, svg] of Object.entries(SVGS)) write(`design/svg/${name}`, svg);

write('assets/icon.png', png(SVGS['icon.svg'], 1024));
write('assets/favicon.png', png(SVGS['icon.svg'], 48));
write('assets/splash-icon.png', png(SVGS['splash-icon.svg'], 1024));
write('assets/android-icon-foreground.png', png(SVGS['android-icon-foreground.svg'], 1024));
write('assets/android-icon-background.png', png(SVGS['android-icon-background.svg'], 1024));
write('assets/android-icon-monochrome.png', png(SVGS['android-icon-monochrome.svg'], 1024));

rmSync(out('assets/app.icon'), { recursive: true, force: true });
write('assets/app.icon/icon.json', JSON.stringify(iconJson, null, 2) + '\n');
for (const n of ['layer-waves.svg', 'layer-ark.svg', 'layer-rainbow.svg'])
  write(`assets/app.icon/Assets/${n}`, SVGS[n]);

write('assets/lottie/splash.json', JSON.stringify(lottie));

// Banner do README (1280x640, mesma proporção da prévia social do GitHub)
const FONTS = join(ROOT, 'node_modules/@expo-google-fonts/fredoka');
const banner =
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640"><defs>${skyDefs}</defs>` +
  `<rect width="1280" height="640" fill="url(#sky)"/>` +
  iconArt('translate(48,8) scale(0.62) translate(0,40)') +
  `<path d="${wavesFill(486, 48, 16, -128, 1408, 700).toSvg()}" fill="${C.waveLight}"/>` +
  `<path d="${wavesFill(534, 60, 19, -160, 1408, 700).toSvg()}" fill="${C.wave}"/>` +
  `<path d="${wavesFill(592, 54, 15, -100, 1408, 700).toSvg()}" fill="${C.waveDeep}"/>` +
  `<text x="660" y="290" font-family="Fredoka" font-weight="700" font-size="128" fill="${C.brown}">Arquinha</text>` +
  `<text x="664" y="356" font-family="Fredoka" font-weight="500" font-size="40" fill="#8A6542">Toque, veja e ouça os bichos.</text>` +
  `</svg>`;
write(
  '.github/assets/banner.png',
  new Resvg(banner, {
    font: {
      fontFiles: [`${FONTS}/700Bold/Fredoka_700Bold.ttf`, `${FONTS}/500Medium/Fredoka_500Medium.ttf`],
      loadSystemFonts: false,
    },
  })
    .render()
    .asPng(),
);

console.log(`ok: ${layers.length} camadas Lottie, ${OP / FR}s a ${FR}fps, quadro ${COMP}px`);
