// TinyBase showreel shots. 128 BPM, eight bars, fifteen seconds:
//
//   bar 1  code types itself and becomes a table
//   bar 2  "Local first."     the table lands on a device, offline
//   bar 3  "Sync on demand."  a second device, changes merge both ways
//   bar 4  "Fast always."     fine-grained listeners re-render one thing
//   bar 5  bundle size / 0 dependencies / test coverage
//   bar 6  friends orbit the store
//   bar 7  everything collapses and the logo stacks up
//   bar 8  logotype, tagline, URL
(function (G) {
  'use strict';

  const E = G.E;
  const {
    W,
    H,
    C,
    TAU,
    ease,
    track,
    prog,
    clamp,
    lerp,
    rgba,
    mixc,
    noise1,
    hash,
    camera,
    groundPlane,
    plane,
    card3d,
    text3d,
    line3d,
    kinetic,
    layout,
    setT,
    screenT,
    setScreen,
    font,
    roundRectPath,
    affineAt,
  } = E;
  const b = (n) => n * E.BEAT;
  let ctx = null;

  // What the showreel states, from facts.mjs by way of src/assets.js.
  const FACTS = G.ASSETS.facts;

  // Section starts, on the downbeat of each bar.
  const T = {
    morph: b(2),
    local: b(4),
    sync: b(8),
    fast: b(12),
    zoom: b(15),
    stats: b(16),
    stat2: b(17),
    stat3: b(18),
    iris: b(19.5),
    friends: b(20),
    collapse: b(24),
    implode: b(25.5),
    stack: [b(26.5), b(27), b(27.5), b(28)],
    logo: b(28),
    end: 15,
  };

  // ---------------------------------------------------------------------------
  // Data: the pet store from the tinybase.org home page.
  // ---------------------------------------------------------------------------

  const ROWS = [
    {id: 'fido', species: 'dog', color: 'brown', sold: false},
    {id: 'felix', species: 'cat', color: 'black', sold: true},
    {id: 'polly', species: 'parrot', color: 'green', sold: false},
    {id: 'rex', species: 'dog', color: 'gold', sold: false},
  ];
  const ROW = Object.fromEntries(ROWS.map((r, i) => [r.id, {...r, i}]));
  const ROW_V = [-95, -25, 45, 115];
  const ROW_H = 56;
  const HEAD_V = -150;

  const LAYOUT = {
    A: {
      cols: [
        {id: 'id', u: -256, w: 150},
        {id: 'species', u: -82, w: 170},
        {id: 'color', u: 102, w: 170},
        {id: 'sold', u: 266, w: 130},
      ],
      tab: {u: -285, v: -192, w: 92, h: 36},
    },
    B: {
      cols: [
        {id: 'id', u: -82, w: 130},
        {id: 'color', u: 72, w: 150},
      ],
      tab: {u: -101, v: -192, w: 92, h: 36},
    },
  };

  const EDITS = [
    {t: b(5.5), dev: 'A', row: 'fido', col: 'color', to: 'walnut'},
    {t: 4.22, dev: 'B', row: 'polly', col: 'color', to: 'teal'},
    {t: 4.66, dev: 'B', row: 'fido', col: 'color', to: 'walnut'},
    {t: 4.9, dev: 'A', row: 'polly', col: 'color', to: 'teal'},
    {t: b(13.25), dev: 'A', row: 'fido', col: 'color', to: 'hazel'},
    {t: b(14), dev: 'A', row: 'rex', col: 'sold', to: true},
  ];

  const cellVal = (dev, row, col, t) => {
    let v = ROW[row][col];
    let prev = null;
    let at = -1;
    for (const e of EDITS) {
      if (e.dev == dev && e.row == row && e.col == col && t >= e.t) {
        prev = v;
        v = e.to;
        at = e.t;
      }
    }
    return {v, prev, at};
  };

  const str = (v) => (typeof v == 'boolean' ? String(v) : v);

  // ---------------------------------------------------------------------------
  // Shared drawing bits.
  // ---------------------------------------------------------------------------

  const background = (o = {}) => {
    const {cx = W * 0.64, cy = H * 0.45, glow = 1} = o;
    screenT();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.8);
    g.addColorStop(0, rgba(mixc('#101010', '#231b20', glow)));
    g.addColorStop(0.45, '#121112');
    g.addColorStop(1, '#070707');
    ctx.fillStyle = g;
    ctx.fillRect(-80, -80, W + 160, H + 160);
  };

  const stext = (s, x, y, o = {}) => {
    const {
      size = 40,
      weight = 600,
      family = E.fonts.sans,
      color = C.text,
      align = 'left',
      baseline = 'alphabetic',
      alpha = 1,
      tracking = 0,
    } = o;
    if (alpha <= 0) return;
    screenT();
    font(weight, size, family);
    ctx.letterSpacing = tracking + 'px';
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
    ctx.globalAlpha = 1;
    ctx.letterSpacing = '0px';
  };

  const bez3 = (p0, p1, p2, p3, s) => {
    const u = 1 - s;
    return p0.map(
      (_, i) =>
        u * u * u * p0[i] +
        3 * u * u * s * p1[i] +
        3 * u * s * s * p2[i] +
        s * s * s * p3[i],
    );
  };

  // Points along a polyline by arc length, from s0 to s1 (0..1).
  const along = (pts, s0, s1, n = 24) => {
    const lens = [0];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const z = pts[i];
      lens.push(
        lens[i - 1] + Math.hypot(z[0] - a[0], z[1] - a[1], z[2] - a[2]),
      );
    }
    const total = lens[lens.length - 1];
    const at = (s) => {
      const d = clamp(s) * total;
      let i = 1;
      while (i < lens.length - 1 && lens[i] < d) i++;
      const k = (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
      return pts[i - 1].map((v, j) => lerp(v, pts[i][j], k));
    };
    const out = [];
    for (let i = 0; i <= n; i++) out.push(at(lerp(s0, s1, i / n)));
    return out;
  };

  // A reusable offscreen layer, for effects that need their own compositing.
  let layer = null;
  let lctx = null;
  const inLayer = (fn, alpha = 1) => {
    const main = ctx;
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.globalAlpha = 1;
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, W, H);
    ctx = lctx;
    E.setCtx(lctx);
    fn();
    ctx = main;
    E.setCtx(main);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = alpha;
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = 1;
  };

  // ---------------------------------------------------------------------------
  // Bars 1-4: the data world.
  // ---------------------------------------------------------------------------

  const DEV = {
    A: {x: 0, z: 0, w: 780, h: 480, cy: -35, r: 30, depth: 26},
    B: {x: 620, z: 640, w: 380, h: 560, cy: -10, r: 54, depth: 26},
  };
  const CARD_LIFT = 7;
  const DEV_T = {A: T.local - 0.06, B: T.sync + 0.08};
  const devPlane = (d) => groundPlane(DEV[d].x, DEV[d].z, 0);

  const cellWorld = (dev, row, col, w = CARD_LIFT) => {
    const c = LAYOUT[dev].cols.find((x) => x.id == col);
    return devPlane(dev)(c.u, ROW_V[ROW[row].i], w);
  };

  const worldCamKeys = (t) =>
    track(t, [
      [0, [0, 0, 0, 2160, -9, 74, 0, 0, 0]],
      [T.morph, [0, 0, 0, 1990, 0, 90, 0, 0, 0], ease.outCubic],
      [T.morph + 0.42, [0, 0, -28, 1580, 0, 90, 0, 0, 0], ease.snap],
      [T.local - 0.02, [0, 0, -40, 1960, 27, 53, 0, 380, 36], ease.glide],
      [T.sync - 0.1, [0, 0, -40, 1820, 33, 51, 0, 380, 36], ease.linear],
      [T.sync + 0.6, [290, 0, 280, 2900, 30, 51, 0, 390, -8], ease.snap],
      [T.fast - 0.1, [300, 0, 290, 2780, 26, 50, 0, 390, -8], ease.linear],
      [T.fast + 0.5, [10, 80, -150, 2000, 25, 39, 0, 350, 110], ease.snap],
      [T.zoom, [18, 74, -140, 1900, 23, 40, 0, 350, 110], ease.linear],
    ]);

  // The last beat of bar 4 zooms straight down into rex's pink 'sold' cell.
  const ZOOM_CELL = cellWorld('A', 'rex', 'sold');
  const worldCam = (t) => {
    const k = worldCamKeys(Math.min(t, T.zoom));
    let target = [k[0], k[1], k[2]];
    let dist = k[3];
    let yaw = k[4];
    let pitch = k[5];
    let sx = k[7];
    let sy = k[8];
    if (t > T.zoom) {
      const z = prog(t, T.zoom, T.stats);
      const turn = ease.inOutCubic(prog(t, T.zoom, T.stats - 0.06));
      const d = ease.inQuart(z);
      target = target.map((v, i) => lerp(v, ZOOM_CELL[i], ease.inOutCubic(z)));
      dist = Math.exp(lerp(Math.log(dist), Math.log(78), d));
      yaw = lerp(yaw, 0, turn);
      pitch = lerp(pitch, 90, turn);
      sx = lerp(sx, 0, turn);
      sy = lerp(sy, 0, turn);
    }
    return camera({
      target,
      dist,
      yaw,
      pitch,
      roll: k[6],
      fov: 30,
      shift: [sx, sy],
    });
  };
  // Everything but the zoom target fades as the camera dives in.
  const zoomFade = (t) => 1 - prog(t, T.zoom, T.zoom + 0.16);

  const groundDots = (cam, alpha) => {
    if (alpha <= 0.01) return;
    setT([1, 0, 0, 1, 0, 0]);
    const step = 80;
    const N = 28;
    ctx.fillStyle = '#ffffff';
    for (let i = -N; i <= N; i++) {
      for (let j = -N; j <= N; j++) {
        const d = Math.hypot(i, j) / N;
        if (d > 1) continue;
        const p = cam.project(250 + i * step, -110, 150 + j * step);
        if (
          p.z < 60 ||
          p.x < -10 ||
          p.x > W + 10 ||
          p.y < -10 ||
          p.y > H + 10
        ) {
          continue;
        }
        const r = Math.max(0.8, 2.6 * p.s);
        ctx.globalAlpha = alpha * 0.3 * (1 - d * d);
        ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
      }
    }
    ctx.globalAlpha = 1;
  };

  // Drifting motes, defocused by their distance from the focal plane.
  const MOTES = Array.from({length: 90}, (_, i) => ({
    x: (hash(i * 3 + 1) - 0.5) * 4400 + 300,
    y: hash(i * 3 + 2) * 1300 - 200,
    z: (hash(i * 3 + 3) - 0.5) * 3800 + 200,
    r: 1.4 + hash(i * 7 + 5) * 3,
    pink: hash(i * 11 + 2) > 0.5,
    sp: 14 + hash(i * 13 + 1) * 36,
    ph: hash(i * 17 + 3) * TAU,
  }));
  const motes = (cam, t, alpha, layer) => {
    if (alpha <= 0) return;
    const focus = cam.dist;
    setT([1, 0, 0, 1, 0, 0]);
    MOTES.forEach((m) => {
      const p = cam.project(
        m.x + Math.sin(t * 0.8 + m.ph) * 40,
        m.y + t * m.sp,
        m.z,
      );
      if (p.z < 150 || (layer == 'back') != p.z > focus) return;
      const sharp = m.r * p.s;
      const r = Math.max(sharp, Math.abs(1 / p.z - 1 / focus) * 30000);
      if (p.x < -r || p.x > W + r || p.y < -r || p.y > H + r) return;
      const a =
        alpha * clamp(0.8 * (sharp / r) ** 2 + 0.05) * (m.pink ? 1 : 0.7);
      const col = m.pink ? C.pinkHi : '#ffffff';
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, rgba(col, a));
      g.addColorStop(0.65, rgba(col, a * 0.7));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.fill();
    });
  };

  // A soft pool of light on the ground beneath a device.
  const underglow = (cam, d, a) => {
    if (a <= 0) return;
    const D = DEV[d];
    const m = affineAt(cam, devPlane(d), 0, D.cy + 30, -D.depth - 30);
    setT(m);
    const R = D.w * 0.95;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    g.addColorStop(0, rgba(C.pink, 0.3 * a));
    g.addColorStop(0.45, rgba(C.pink, 0.1 * a));
    g.addColorStop(1, rgba(C.pink, 0));
    ctx.fillStyle = g;
    ctx.save();
    ctx.scale(1, D.h / D.w + 0.25);
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  // A table cell card with an animated value roll and a flash on change.
  const cellCard = (cam, P, u, v, w, h, o) => {
    const {
      t,
      appear = 1,
      kind = 'value',
      value,
      prev = null,
      at = -1,
      lift = CARD_LIFT,
      depth = 6,
      alpha = 1,
    } = o;
    if (appear <= 0 || alpha <= 0) return;
    const a = clamp(appear);
    const scale = lerp(0.5, 1, ease.outBack(a, 2.2));
    const drop = (1 - ease.outCubic(a)) * 80;
    const since = at >= 0 ? t - at : 99;
    const flash = since >= 0 ? Math.exp(-since * 4.5) : 0;
    const on = value === true;
    const onK = on ? clamp(since / 0.18) : 0;
    const isId = kind == 'id';
    const base = isId ? '#5a5a62' : C.ink;
    const stroke = rgba(mixc(base, C.pinkHi, flash));
    const fill = rgba(mixc(isId ? '#0a0a0b' : C.card, C.pink, on ? onK : 0));
    const m = card3d(cam, P, u, v, w, h, {
      r: 10,
      depth,
      lift: lift + drop,
      fill,
      stroke: on && onK >= 1 ? rgba(mixc(C.pink, '#ffffff', flash)) : stroke,
      edge: on && onK >= 1 ? '#9c1245' : stroke,
      lw: 3,
      alpha,
      scale,
    });
    if (!m) return;
    ctx.save();
    setT([m[0] * scale, m[1] * scale, m[2] * scale, m[3] * scale, m[4], m[5]]);
    roundRectPath(-w / 2, -h / 2, w, h, 10);
    ctx.clip();
    font(isId ? 500 : 600, 27, E.fonts.mono);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const k = prev !== null ? ease.snap(clamp(since / 0.34)) : 1;
    const txt = (val, dy, al) => {
      if (al <= 0) return;
      ctx.globalAlpha = al * clamp(a * 2) * alpha;
      ctx.fillStyle =
        val === true
          ? '#ffffff'
          : val === false
            ? '#707078'
            : isId
              ? '#a4a4ad'
              : '#f4f4f5';
      ctx.fillText(str(val), 0, dy + 1);
    };
    if (prev !== null && k < 1) {
      txt(prev, -k * h * 0.9, 1 - k);
      txt(value, (1 - k) * h * 0.9, k);
    } else {
      txt(value, 0, 1);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    if (since >= 0 && since < 0.7) {
      const rk = ease.outCubic(since / 0.7);
      setT(affineAt(cam, P, u, v, lift));
      ctx.strokeStyle = rgba(C.pinkHi, (1 - rk) * 0.9 * alpha);
      ctx.lineWidth = 3 * (1 - rk) + 1;
      const g = 8 + rk * 46;
      roundRectPath(-w / 2 - g, -h / 2 - g, w + g * 2, h + g * 2, 10 + g);
      ctx.stroke();
    }
  };

  const deviceSlab = (cam, d, t, alpha = 1) => {
    const D = DEV[d];
    const a = prog(t, DEV_T[d], DEV_T[d] + 0.42);
    if (a <= 0 || alpha <= 0) return;
    const P = devPlane(d);
    const e = ease.snap(a);
    underglow(cam, d, e * alpha);
    // Fade the slab as one object, or its stacked edge shows through.
    const opacity = clamp(a * 2.5) * alpha;
    const slab = () =>
      card3d(cam, P, 0, D.cy, D.w, D.h, {
        r: D.r,
        depth: D.depth * e,
        lift: 0,
        fill: '#0c0c0d',
        stroke: C.ink,
        edge: '#d6d6da',
        lw: 4,
        scale: lerp(0.9, 1, e),
      });
    opacity < 1 ? inLayer(slab, opacity) : slab();
    const ca = clamp((a - 0.4) * 3) * alpha;
    for (let i = 0; i < 3; i++) {
      setT(affineAt(cam, P, -D.w / 2 + 32 + i * 22, D.cy - D.h / 2 + 27, 0));
      ctx.globalAlpha = ca;
      ctx.fillStyle = i == 0 ? C.pink : '#3a3a40';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // "offline" / "online" status chip on device A.
  const statusChip = (cam, t, alpha = 1) => {
    const D = DEV.A;
    const a = prog(t, T.local + 0.28, T.local + 0.6) * alpha;
    if (a <= 0) return;
    const P = devPlane('A');
    const on = prog(t, T.sync + 0.18, T.sync + 0.42);
    const s = ease.outBack(clamp(a), 2) * 1.1;
    const m = affineAt(cam, P, D.w / 2 - 104, D.cy - D.h / 2 + 30, 0);
    setT([m[0] * s, m[1] * s, m[2] * s, m[3] * s, m[4], m[5]]);
    ctx.globalAlpha = clamp(a * 3);
    ctx.fillStyle = rgba(mixc('#1b1b1e', '#4a0c24', on));
    ctx.strokeStyle = rgba(mixc('#55555d', C.pinkHi, on));
    ctx.lineWidth = 2;
    roundRectPath(-80, -18, 160, 36, 18);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(-50, 8);
    ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(mixc('#9a9aa3', '#ffffff', on));
    ctx.lineWidth = 2.8;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, i * 6, -Math.PI * 0.78, -Math.PI * 0.22);
      ctx.stroke();
    }
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(0, 0, 2.3, 0, TAU);
    ctx.fill();
    const slash = 1 - ease.snap(on);
    if (slash > 0) {
      ctx.strokeStyle = C.pinkHi;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-12, -21);
      ctx.lineTo(-12 + 24 * slash, -21 + 26 * slash);
      ctx.stroke();
    }
    ctx.restore();
    font(700, 20, E.fonts.mono);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba(mixc('#b0b0b8', '#ffffff', on));
    const flip = on > 0 && on < 1 ? Math.abs(on - 0.5) * 2 : 1;
    ctx.globalAlpha = clamp(a * 3) * flip;
    ctx.fillText(on > 0.5 ? 'online' : 'offline', -28, 1);
    ctx.globalAlpha = 1;
  };

  // Bar 1: the code line and its tokens.
  const CODE = "store.setCell('pets', 'fido', 'color', 'brown');";
  const CODE_SIZE = 58;
  const CODE_ADV = CODE_SIZE / 2;
  const codeU = (i) => (-CODE.length * CODE_ADV) / 2 + CODE_ADV * (i + 0.5);
  const GROUPS = [
    [0, 6],
    [6, 14],
    [14, 22],
    [22, 30],
    [30, 39],
    [39, 46],
    [46, 48],
  ];
  const charTime = (i) => {
    const g = GROUPS.findIndex(([a, z]) => i >= a && i < z);
    return b(0.25) + g * b(0.25) + (i - GROUPS[g][0]) * 0.012;
  };
  const TOKENS = [
    {from: 15, len: 4, to: 'tab'},
    {from: 23, len: 4, to: 'id'},
    {from: 31, len: 5, to: 'head'},
    {from: 40, len: 5, to: 'cell'},
  ];
  const inToken = (i) => TOKENS.find((k) => i >= k.from && i < k.from + k.len);
  const codeColor = (i) => {
    const ch = CODE[i];
    if (i >= 6 && i < 13) return C.pinkHi;
    if (i < 5) return '#e9e9ec';
    if (ch == "'") return '#8a8a93';
    if (inToken(i)) return '#ffffff';
    return '#6c6c75';
  };
  const TOKEN_TARGET = {
    tab: {u: LAYOUT.A.tab.u, v: LAYOUT.A.tab.v, size: 22, color: '#ffffff'},
    id: {u: -256, v: ROW_V[0], size: 27, color: '#a4a4ad'},
    head: {u: 102, v: HEAD_V, size: 22, color: C.pinkHi},
    cell: {u: 102, v: ROW_V[0], size: 27, color: '#f4f4f5'},
  };
  const FLY0 = T.morph + 0.02;
  const FLY_DUR = 0.4;
  const flyStart = (n) => FLY0 + n * 0.03;
  const flyEnd = (n) => flyStart(n) + FLY_DUR;

  const codeLine = (cam, t) => {
    if (t > T.local) return;
    const P = devPlane('A');
    // Editor affordances: current-line highlight and a line number.
    const hl = prog(t, 0.05, 0.3) * (1 - prog(t, T.morph, T.morph + 0.25));
    if (hl > 0) {
      const m = affineAt(cam, P, 0, 0, 0);
      setT(m);
      const hw = (CODE.length * CODE_ADV) / 2 + 140;
      const g = ctx.createLinearGradient(-hw, 0, hw, 0);
      g.addColorStop(0, rgba('#ffffff', 0));
      g.addColorStop(0.2, rgba('#ffffff', 0.05 * hl));
      g.addColorStop(0.8, rgba('#ffffff', 0.05 * hl));
      g.addColorStop(1, rgba('#ffffff', 0));
      ctx.fillStyle = g;
      ctx.fillRect(-hw, -CODE_SIZE * 0.72, hw * 2, CODE_SIZE * 1.44);
      text3d(cam, P, '1', codeU(0) - 76, 0, {
        size: CODE_SIZE * 0.8,
        weight: 500,
        color: '#4a4a52',
        alpha: hl,
      });
    }
    for (let i = 0; i < CODE.length; i++) {
      if (inToken(i)) continue;
      const ti = charTime(i);
      const a = prog(t, ti, ti + 0.16);
      if (a <= 0) continue;
      const f0 = T.morph + i * 0.0045;
      const fall = prog(t, f0, f0 + 0.2);
      if (fall >= 1) continue;
      const fe = ease.inQuad(fall);
      text3d(
        cam,
        P,
        CODE[i],
        codeU(i),
        (1 - ease.outBack(a, 2.5)) * 20 - fe * 26,
        {
          w: CARD_LIFT,
          size: CODE_SIZE,
          weight: 500,
          color: rgba(mixc(codeColor(i), C.pinkHi, fe)),
          alpha: clamp(a * 2) * (1 - fe * fe),
          scale: 1 - fe,
        },
      );
    }
    if (t > 0.06 && t < T.morph) {
      const typed = CODE.split('').filter((_, i) => t >= charTime(i)).length;
      const done = charTime(CODE.length - 1) + 0.05;
      const blink = t > done ? (Math.floor((t - done) / 0.1) % 2 ? 0 : 1) : 1;
      setT(affineAt(cam, P, codeU(typed) - CODE_ADV / 2 + 3, 0, CARD_LIFT));
      ctx.globalAlpha = blink * clamp((t - 0.06) / 0.04);
      ctx.fillStyle = C.pinkHi;
      ctx.fillRect(0, -CODE_SIZE * 0.56, CODE_ADV * 0.92, CODE_SIZE * 1.1);
      ctx.globalAlpha = 1;
    }
  };

  const tokenFlights = (cam, t) => {
    if (t > T.local) return;
    const P = devPlane('A');
    TOKENS.forEach((tok, n) => {
      const k = ease.glide(prog(t, flyStart(n), flyEnd(n)));
      if (k >= 1) return;
      const tg = TOKEN_TARGET[tok.to];
      const typedK = prog(t, charTime(tok.from), charTime(tok.from) + 0.16);
      if (typedK <= 0) return;
      [tok.from - 1, tok.from + tok.len].forEach((qi) => {
        const qa =
          prog(t, charTime(qi), charTime(qi) + 0.16) * (1 - clamp(k * 5));
        if (qa <= 0) return;
        text3d(
          cam,
          P,
          "'",
          codeU(qi),
          (1 - ease.outBack(clamp(qa), 2.5)) * 20,
          {
            w: CARD_LIFT,
            size: CODE_SIZE,
            weight: 500,
            color: '#8a8a93',
            alpha: qa,
          },
        );
      });
      if (k <= 0) {
        // Still being typed: letter by letter, like the rest of the line.
        for (let i = tok.from; i < tok.from + tok.len; i++) {
          const ca = prog(t, charTime(i), charTime(i) + 0.16);
          if (ca <= 0) continue;
          text3d(cam, P, CODE[i], codeU(i), (1 - ease.outBack(ca, 2.5)) * 20, {
            w: CARD_LIFT,
            size: CODE_SIZE,
            weight: 500,
            color: '#ffffff',
            alpha: clamp(ca * 2),
          });
        }
        return;
      }
      const u0 = codeU(tok.from + (tok.len - 1) / 2);
      text3d(
        cam,
        P,
        CODE.substr(tok.from, tok.len),
        lerp(u0, tg.u, k),
        lerp(0, tg.v, k),
        {
          w: CARD_LIFT + Math.sin(k * Math.PI) * 140 + 2,
          size: lerp(CODE_SIZE, tg.size, k),
          weight: lerp(500, tok.to == 'tab' ? 700 : 600, k),
          color: rgba(mixc('#ffffff', tg.color, k)),
          alpha: clamp(typedK * 2),
        },
      );
    });
  };

  const tableAppear = (dev, r, c, t) => {
    if (dev == 'B') {
      const t0 = DEV_T.B + 0.16 + r * 0.05 + c * 0.04;
      return prog(t, t0, t0 + 0.34);
    }
    if (r == 0 && c == 0)
      return t >= flyEnd(1) ? prog(t, flyEnd(1) - 0.12, flyEnd(1) + 0.16) : 0;
    if (r == 0 && c == 2)
      return t >= flyEnd(3) ? prog(t, flyEnd(3) - 0.12, flyEnd(3) + 0.16) : 0;
    const d = Math.abs(r) + Math.abs(c - 2);
    const t0 = FLY0 + FLY_DUR - 0.06 + d * 0.042;
    return prog(t, t0, t0 + 0.32);
  };

  const table = (cam, dev, t, alpha = 1, skip = null) => {
    const L = LAYOUT[dev];
    const P = devPlane(dev);
    const tabA =
      dev == 'A'
        ? (t >= flyEnd(0) ? 1 : 0) * prog(t, flyEnd(0) - 0.1, flyEnd(0) + 0.14)
        : prog(t, DEV_T.B + 0.1, DEV_T.B + 0.38);
    if (tabA > 0) {
      const s = ease.outBack(tabA, 2);
      card3d(cam, P, L.tab.u, L.tab.v, L.tab.w, L.tab.h, {
        r: 18,
        lift: CARD_LIFT,
        fill: C.pink,
        stroke: null,
        lw: 0,
        alpha: clamp(tabA * 3) * alpha,
        scale: s,
      });
      text3d(cam, P, 'pets', L.tab.u, L.tab.v, {
        w: CARD_LIFT + 1,
        size: 22,
        weight: 700,
        color: '#ffffff',
        alpha: alpha * (dev == 'A' ? 1 : clamp(tabA * 3)),
        scale: s,
      });
    }
    L.cols.forEach((col, c) => {
      if (col.id == 'id') return;
      const a =
        dev == 'A'
          ? col.id == 'color'
            ? t >= flyEnd(2)
              ? 1
              : 0
            : prog(
                t,
                FLY0 + FLY_DUR + c * 0.05,
                FLY0 + FLY_DUR + 0.25 + c * 0.05,
              )
          : prog(t, DEV_T.B + 0.2, DEV_T.B + 0.45);
      text3d(cam, P, col.id, col.u, HEAD_V, {
        w: CARD_LIFT,
        size: 22,
        weight: 700,
        color: C.pinkHi,
        alpha: a * alpha,
      });
    });
    ROWS.forEach((row, r) => {
      L.cols.forEach((col, c) => {
        if (skip && skip(row.id, col.id)) return;
        const appear = tableAppear(dev, r, c, t);
        if (appear <= 0) return;
        if (col.id == 'id') {
          cellCard(cam, P, col.u, ROW_V[r], col.w, ROW_H, {
            t,
            appear,
            kind: 'id',
            value: row.id,
            alpha,
          });
          return;
        }
        const cv = cellVal(dev, row.id, col.id, t);
        cellCard(cam, P, col.u, ROW_V[r], col.w, ROW_H, {
          t,
          appear,
          value: cv.v,
          prev: cv.prev,
          at: cv.at,
          alpha,
        });
      });
    });
  };

  // Bar 3: packets carry concurrent changes across, in both directions.
  const PACKETS = [
    {
      from: 'A',
      to: 'B',
      row: 'fido',
      col: 'color',
      text: 'walnut',
      arrive: EDITS[2].t,
      h: 470,
    },
    {
      from: 'B',
      to: 'A',
      row: 'polly',
      col: 'color',
      text: 'teal',
      arrive: EDITS[3].t,
      h: 330,
    },
  ];
  const PACKET_DUR = 0.62;

  const packetPath = (p) => {
    const a = cellWorld(p.from, p.row, p.col, CARD_LIFT + 4);
    const z = cellWorld(p.to, p.row, p.col, CARD_LIFT + 4);
    return [a, [a[0], a[1] + p.h, a[2]], [z[0], z[1] + p.h, z[2]], z];
  };

  const packets = (cam, t) => {
    PACKETS.forEach((p) => {
      const t0 = p.arrive - PACKET_DUR;
      const head = ease.inOutSine(prog(t, t0, p.arrive));
      const tail = ease.inOutSine(prog(t, t0 + 0.22, p.arrive + 0.24));
      if (head <= 0 || tail >= 1) return;
      const path = packetPath(p);
      const pts = [];
      for (let i = 0; i <= 40; i++)
        pts.push(bez3(...path, lerp(tail, head, i / 40)));
      line3d(cam, pts, {color: C.pink, width: 12, alpha: 0.16});
      line3d(cam, pts, {color: C.pinkHi, width: 4, alpha: 0.95});
      if (head < 1) {
        const q = cam.project(...bez3(...path, head));
        const pop =
          ease.outBack(prog(t, t0, t0 + 0.2), 2.5) *
          (1 - ease.inBack(prog(t, p.arrive - 0.1, p.arrive), 2));
        screenT(q.x, q.y, q.s * 1.35 * pop);
        font(700, 22, E.fonts.mono);
        const tw = ctx.measureText(p.text).width + 30;
        ctx.fillStyle = C.pink;
        ctx.shadowColor = rgba(C.pinkHi, 0.9);
        ctx.shadowBlur = 26;
        roundRectPath(-tw / 2, -19, tw, 38, 19);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text, 0, 1);
      }
    });
  };

  const syncLink = (cam, t) => {
    const a =
      prog(t, T.sync + 0.3, T.sync + 0.75) *
      (1 - prog(t, T.fast, T.fast + 0.3));
    if (a <= 0) return;
    const p0 = devPlane('A')(DEV.A.w / 2 - 10, DEV.A.cy + 60, 0);
    const p3 = devPlane('B')(-DEV.B.w / 2 + 10, DEV.B.cy - 60, 0);
    const path = [
      p0,
      [p0[0] + 200, 160, p0[2] + 60],
      [p3[0] - 200, 160, p3[2] - 60],
      p3,
    ];
    const pts = [];
    const draw = ease.snap(a);
    for (let i = 0; i <= 40; i++) pts.push(bez3(...path, (i / 40) * draw));
    const merged = prog(t, 5.02, 5.2) * (1 - prog(t, 5.25, 5.6));
    line3d(cam, pts, {
      color: rgba(mixc('#ffffff', C.pinkHi, merged)),
      width: 2.5,
      alpha: (0.3 + merged * 0.6) * a,
      dash: [10, 12],
    });
  };

  // Bar 4: components bound to single cells or whole columns.
  const COMP_YAW = 25 * E.DEG;
  const COMP_EX = [Math.cos(COMP_YAW), 0, -Math.sin(COMP_YAW)];
  const COMP_Z = -400;
  const COMP_BASE = 34;
  const COMPS = [
    {id: 'chart', x: -390, w: 300, h: 180, title: 'useTable', src: 'species'},
    {id: 'color', x: -40, w: 300, h: 180, title: 'useCell', src: 'fido.color'},
    {id: 'sold', x: 310, w: 300, h: 180, title: 'useMetric', src: 'sold'},
  ];
  const compRise = (c, t) =>
    (1 - ease.outBack(clamp(compAppear(COMPS.indexOf(c), t)), 1.4)) * -150;
  const compCenter = (c, t = 99) => [
    c.x,
    COMP_BASE + c.h / 2 + compRise(c, t),
    COMP_Z,
  ];
  const compPlane = (c, t) =>
    plane(
      compCenter(c, t),
      COMP_EX,
      [0, -1, 0],
      [Math.sin(COMP_YAW), 0, Math.cos(COMP_YAW)],
    );
  const compAppear = (i, t) =>
    prog(t, T.fast + 0.26 + i * 0.07, T.fast + 0.6 + i * 0.07);

  // Wire from a cell or column header up into a component.
  const wireSrc = (c) => {
    if (c.src.includes('.')) {
      const [row, col] = c.src.split('.');
      return cellWorld('A', row, col, CARD_LIFT);
    }
    const col = LAYOUT.A.cols.find((x) => x.id == c.src);
    return devPlane('A')(col.u, HEAD_V - 24, CARD_LIFT);
  };
  const wirePts = (c, t = 99) => {
    const a = wireSrc(c);
    const z = [c.x, COMP_BASE + compRise(c, t), COMP_Z];
    const pts = [];
    const path = [
      a,
      [a[0], a[1] + 170, a[2] - 40],
      [z[0], z[1] - 150, z[2] + 90],
      z,
    ];
    for (let i = 0; i <= 32; i++) pts.push(bez3(...path, i / 32));
    return pts;
  };
  // Pulses: an edit travels from its cell (via the column header for
  // column listeners) and up the wire.
  const PULSE_DUR = 0.26;
  const pulsePath = (c, e, t) => {
    const cell = cellWorld('A', e.row, e.col, CARD_LIFT + 1);
    return c.src.includes('.') ? wirePts(c, t) : [cell, ...wirePts(c, t)];
  };
  const pulsesFor = (c) =>
    EDITS.filter(
      (e) =>
        e.dev == 'A' &&
        e.t > T.fast &&
        (c.src == e.row + '.' + e.col || c.src == e.col),
    );

  const components = (cam, t, alpha) => {
    COMPS.forEach((comp, i) => {
      const a = compAppear(i, t) * alpha;
      if (a <= 0) return;
      const pulses = pulsesFor(comp);
      const pts = wirePts(comp, t);
      const grow = ease.snap(clamp(compAppear(i, t) * 1.3));
      line3d(cam, along(pts, 0, grow, 32), {
        color: '#ffffff',
        width: 1.8,
        alpha: 0.3 * a,
      });
      pulses.forEach((e) => {
        const s = prog(t, e.t, e.t + PULSE_DUR);
        const fade = 1 - prog(t, e.t + PULSE_DUR, e.t + PULSE_DUR + 0.3);
        if (s <= 0 || fade <= 0) return;
        const pp = pulsePath(comp, e, t);
        line3d(cam, along(pp, 0, s, 32), {
          color: C.pinkHi,
          width: 3,
          alpha: 0.7 * fade * alpha,
        });
        line3d(cam, along(pp, Math.max(0, s - 0.25), s, 12), {
          color: '#ffffff',
          width: 5,
          alpha: fade * alpha,
        });
      });
      const P = compPlane(comp, t);
      const hits = pulses
        .map((e) => t - (e.t + PULSE_DUR))
        .filter((d) => d >= 0);
      const flash = hits.length ? Math.exp(-Math.min(...hits) * 4) : 0;
      const s = ease.outBack(clamp(compAppear(i, t)), 1.8) * alpha;
      if (s <= 0.01) return;
      const stroke = rgba(mixc('#ffffff', C.pinkHi, flash));
      card3d(cam, P, 0, 0, comp.w, comp.h, {
        r: 16,
        depth: 10,
        fill: '#0b0b0c',
        stroke,
        edge: stroke,
        lw: 3.5,
        scale: s,
      });
      text3d(cam, P, comp.title, -comp.w / 2 + 24, -comp.h / 2 + 32, {
        size: 21,
        weight: 700,
        color: C.pinkHi,
        align: 'left',
        alpha: clamp(a * 2),
        scale: s,
      });
      const roll = (label, val, prevVal, at) => {
        const since = at >= 0 ? t - at : 9;
        const k =
          prevVal != null && since >= 0 ? ease.snap(clamp(since / 0.3)) : 1;
        text3d(cam, P, label, -comp.w / 2 + 24, 24, {
          size: 34,
          weight: 600,
          family: E.fonts.sans,
          color: '#8e8e97',
          align: 'left',
          alpha: clamp(a * 2),
          scale: s,
        });
        const x0 = -comp.w / 2 + 24 + (label.length > 5 ? 112 : 92);
        const show = (v, dy, al) =>
          text3d(cam, P, v, x0, 24 + dy, {
            size: 34,
            weight: 800,
            family: E.fonts.sans,
            color: rgba(mixc('#ffffff', C.pinkHi, flash)),
            align: 'left',
            alpha: al * clamp(a * 2),
            scale: s,
          });
        if (k < 1) {
          show(prevVal, -k * 34, 1 - k);
          show(val, (1 - k) * 34, k);
        } else show(val, 0, 1);
      };
      const e = pulses[0];
      const at = e ? e.t + PULSE_DUR : -1;
      if (comp.id == 'color') {
        roll(
          'Color:',
          t >= at && e ? 'hazel' : 'walnut',
          e ? 'walnut' : null,
          at,
        );
      } else if (comp.id == 'sold') {
        roll('Sold:', t >= at && e ? '2' : '1', e ? '1' : null, at);
      } else {
        const m = affineAt(cam, P, 0, 0, 0);
        [2, 1, 1].forEach((n, j) => {
          const g = ease.snap(
            prog(t, T.fast + 0.35 + j * 0.06, T.fast + 0.8 + j * 0.06),
          );
          setT([m[0] * s, m[1] * s, m[2] * s, m[3] * s, m[4], m[5]]);
          ctx.globalAlpha = clamp(a * 2);
          ctx.fillStyle = j == 0 ? C.pink : '#55555d';
          const bh = n * 38 * g;
          roundRectPath(-comp.w / 2 + 28 + j * 70, 62 - bh, 50, bh, 6);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
    });
  };

  // Bars 2-4: the hero lines from the tinybase.org home page.
  const LINES = [
    {t: T.local, a: 'Local', z: ' first.'},
    {t: T.sync, a: 'Sync', z: ' on demand.'},
    {t: T.fast, a: 'Fast', z: ' always.'},
  ];
  const TITLE = {x: 124, size: 100, lh: 118, tracking: -3.5};
  const TITLE_OUT = T.zoom - 0.14;

  const titleBlock = (t) => {
    if (t < T.local - 0.1 || t > T.stats) return;
    const scrim =
      prog(t, T.local - 0.1, T.local + 0.3) *
      (1 - prog(t, T.zoom, T.zoom + 0.3));
    if (scrim > 0) {
      screenT();
      const g = ctx.createLinearGradient(0, 0, 1080, 0);
      g.addColorStop(0, rgba('#080808', 0.8 * scrim));
      g.addColorStop(0.6, rgba('#080808', 0.45 * scrim));
      g.addColorStop(1, rgba('#080808', 0));
      ctx.fillStyle = g;
      ctx.fillRect(-80, -80, 1160, H + 160);
    }
    const count =
      1 +
      ease.snap(prog(t, T.sync - 0.05, T.sync + 0.4)) +
      ease.snap(prog(t, T.fast - 0.05, T.fast + 0.4));
    LINES.forEach((line, i) => {
      if (t < line.t - 0.05) return;
      const s = line.a + line.z;
      const y = H / 2 + TITLE.size * 0.36 + (i - (count - 1) / 2) * TITLE.lh;
      const next = LINES[i + 1];
      const dim = next ? ease.snap(prog(t, next.t - 0.05, next.t + 0.35)) : 0;
      const colors = s
        .split('')
        .map((_, j) =>
          j < line.a.length
            ? rgba(mixc(C.pink, '#5e1230', dim * 0.8))
            : rgba(mixc('#ffffff', '#46464d', dim)),
        );
      kinetic(s, TITLE.x, y, {
        size: TITLE.size,
        weight: 900,
        tracking: TITLE.tracking,
        colors,
        tilt: 6,
        p: (j) => {
          const t0 = line.t + j * 0.021;
          const inK = ease.snap(prog(t, t0, t0 + 0.6));
          const o0 = TITLE_OUT + (2 - i) * 0.03 + j * 0.006;
          return inK + ease.inExpo(prog(t, o0, o0 + 0.2));
        },
      });
    });
    const my = H / 2 + ((count - 1) / 2) * TITLE.lh - TITLE.size * 0.02;
    const ma =
      prog(t, T.local + 0.1, T.local + 0.4) *
      (1 - prog(t, TITLE_OUT, TITLE_OUT + 0.15));
    if (ma > 0) {
      screenT();
      ctx.fillStyle = C.pink;
      ctx.globalAlpha = ma;
      const hh = TITLE.size * 0.78 * ease.snap(ma);
      ctx.fillRect(TITLE.x - 44, my - hh / 2, 8, hh);
      ctx.globalAlpha = 1;
    }
  };

  const dataWorld = (t) => {
    const cam = worldCam(t);
    const zf = zoomFade(t);
    background({glow: prog(t, 0, 0.5)});
    groundDots(cam, prog(t, T.morph + 0.2, T.local) * zf);
    const moteA = prog(t, T.morph, T.local) * zf;
    motes(cam, t, moteA, 'back');
    deviceSlab(cam, 'A', t);
    statusChip(cam, t);
    syncLink(cam, t);
    table(cam, 'A', t);
    if (t < T.fast + 0.6) {
      deviceSlab(cam, 'B', t);
      table(cam, 'B', t);
    }
    codeLine(cam, t);
    tokenFlights(cam, t);
    packets(cam, t);
    components(cam, t, zf);
    motes(cam, t, moteA, 'front');
    titleBlock(t);
    // Speed lines rushing past as the camera dives.
    const rush = prog(t, T.zoom + 0.16, T.stats);
    if (rush > 0) {
      screenT();
      ctx.lineCap = 'round';
      for (let i = 0; i < 56; i++) {
        const a = hash(i * 5 + 1) * TAU;
        const phase = (hash(i * 5 + 2) + rush * (1.4 + hash(i * 5 + 3))) % 1;
        const r0 = lerp(260, 1250, phase ** 1.6);
        const len = lerp(40, 420, phase) * ease.inCubic(rush);
        const cx = W / 2;
        const cy = H / 2;
        ctx.strokeStyle = i % 4 ? '#ffffff' : C.pinkHi;
        ctx.globalAlpha = 0.5 * Math.sin(phase * Math.PI) * clamp(rush * 3);
        ctx.lineWidth = 1.5 + phase * 3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(
          cx + Math.cos(a) * (r0 + len),
          cy + Math.sin(a) * (r0 + len),
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // The zoom ends on a full frame of pink.
    const fill = prog(t, T.stats - 0.12, T.stats - 0.02);
    if (fill > 0) {
      screenT();
      ctx.fillStyle = rgba(C.pink, fill);
      ctx.fillRect(-100, -100, W + 200, H + 200);
    }
  };

  // ---------------------------------------------------------------------------
  // Bar 5: tiny, on pink.
  // ---------------------------------------------------------------------------

  const NUM = {size: 330, weight: 900, tracking: -12, y: 610};

  // A glyph run where digits spin like an odometer before settling.
  const numberRun = (s, cx, t0, t, o = {}) => {
    const {
      spin = true,
      alpha = 1,
      dy = 0,
      scale = 1,
      pops = null,
      xOverride = null,
    } = o;
    const L = layout(s, NUM.weight, NUM.size, E.fonts.sans, NUM.tracking);
    const x0 = cx - L.width / 2;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      let gx = x0 + L.xs[i];
      const gw = L.xs[i + 1] - L.xs[i];
      if (xOverride && xOverride[i] != null) gx = xOverride[i];
      const pk = pops ? pops(i) : 1;
      if (pk <= 0) continue;
      const k = ease.outBack(clamp(pk), 1.6);
      ctx.save();
      screenT(W / 2, NUM.y + dy, scale);
      ctx.translate(gx - W / 2 + gw / 2, 0);
      ctx.scale(k, k);
      ctx.globalAlpha = alpha * clamp(pk * 2);
      font(NUM.weight, NUM.size);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      const d = '0123456789'.indexOf(ch);
      if (spin && d >= 0) {
        const turns = 10 + d;
        const p =
          ease.outExpo(prog(t, t0 + i * 0.03, t0 + 0.36 + i * 0.03)) * turns;
        const lo = Math.floor(p);
        const f = p - lo;
        ctx.beginPath();
        ctx.rect(-gw, -NUM.size * 0.78, gw * 2, NUM.size * 0.86);
        ctx.clip();
        const step = NUM.size * 0.86;
        ctx.fillText(String(lo % 10), 0, f * step);
        ctx.fillText(String((lo + 1) % 10), 0, (f - 1) * step);
      } else {
        ctx.fillText(ch, 0, 0);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    return {x0, xs: L.xs, width: L.width};
  };

  const caption = (s, t0, t, o = {}) => {
    const {
      y = 730,
      size = 62,
      weight = 800,
      out = 99,
      color = '#ffffff',
      family = E.fonts.sans,
      tracking = -1.5,
    } = o;
    kinetic(s, W / 2, y, {
      size,
      weight,
      family,
      tracking,
      color,
      align: 'center',
      p: (j) =>
        ease.snap(prog(t, t0 + j * 0.012, t0 + 0.4 + j * 0.012)) +
        ease.inExpo(prog(t, out + j * 0.004, out + 0.18 + j * 0.004)),
    });
  };

  const stats = (t) => {
    screenT();
    const g = ctx.createRadialGradient(
      W * 0.5,
      H * 0.42,
      0,
      W * 0.5,
      H * 0.5,
      W * 0.7,
    );
    g.addColorStop(0, '#e2266c');
    g.addColorStop(0.6, C.pink);
    g.addColorStop(1, '#b01350');
    ctx.fillStyle = g;
    ctx.fillRect(-100, -100, W + 200, H + 200);
    // Giant outlined word drifting behind.
    const bgWord = t < T.stat2 ? 'TINY' : t < T.stat3 ? 'ZERO' : 'TESTED';
    screenT(W / 2 - (t - T.stats) * 160 + 200, H / 2 + 250);
    font(900, 560);
    ctx.letterSpacing = '-20px';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.strokeText(bgWord, 0, 0);
    ctx.letterSpacing = '0px';

    // HUD: which stat this is, and where it comes from.
    const hud = (idx, label, src, t0, t1) => {
      const a = prog(t, t0, t0 + 0.15) * (1 - prog(t, t1 - 0.1, t1));
      if (a <= 0) return;
      const k = ease.snap(prog(t, t0, t0 + 0.3));
      stext(idx, 96, 112, {
        size: 26,
        weight: 700,
        family: E.fonts.mono,
        color: '#ffffff',
        alpha: a,
      });
      screenT();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(146, 103, 60 * k, 3);
      ctx.globalAlpha = 1;
      stext(label, 222, 112, {
        size: 26,
        weight: 700,
        family: E.fonts.mono,
        color: '#ffffff',
        alpha: a * k,
        tracking: 2,
      });
      stext(src, 96, 1000, {
        size: 24,
        weight: 600,
        family: E.fonts.mono,
        color: '#ffffff',
        alpha: a * 0.75 * k,
      });
    };
    hud(
      '01',
      'SIZE',
      'tinybase/store, minified and gzipped',
      T.stats,
      T.stat2 - 0.02,
    );
    hud(
      '02',
      'DEPENDENCIES',
      'zero runtime dependencies',
      T.stat2,
      T.stat3 - 0.02,
    );
    hud('03', 'COVERAGE', FACTS.coverageNote, T.stat3, T.iris + 0.05);
    stext('TINYBASE', W - 96, 112, {
      size: 26,
      weight: 800,
      family: E.fonts.mono,
      color: '#ffffff',
      align: 'right',
      alpha:
        prog(t, T.stats, T.stats + 0.2) *
        (1 - prog(t, T.iris - 0.05, T.iris + 0.05)),
      tracking: 3,
    });

    // 1: the bundle size, then a carousel up to 2: 0 dependencies.
    const car = ease.inOutExpo(prog(t, T.stat2 - 0.17, T.stat2 + 0.17));
    const CAR = 780;
    if (car < 1) {
      const pull = 1 + 0.18 * (1 - ease.snap(prog(t, T.stats, T.stats + 0.5)));
      numberRun(FACTS.size, W / 2, T.stats, t, {dy: -car * CAR, scale: pull});
      caption('gzipped', T.stats + 0.1, t, {y: 730 - car * CAR});
    }
    // 2: 0 dependencies, whose 0 then slides into place in the coverage.
    const COV = FACTS.coverage;
    const zeroAt = COV.indexOf('0');
    const LCOV = layout(COV, NUM.weight, NUM.size, E.fonts.sans, NUM.tracking);
    const xCov = W / 2 - LCOV.width / 2;
    const popDelay = (i) =>
      COV.split('')
        .map((_, j) => j)
        .filter((j) => j != zeroAt)
        .indexOf(i) * 0.05;
    if (car > 0 && t < T.stat3) {
      numberRun('0', W / 2, T.stat2, t, {spin: false, dy: (1 - car) * CAR});
      caption('dependencies', T.stat2 - 0.3, t, {
        out: T.stat3 - 0.14,
        y: 730 + (1 - car) * CAR,
      });
    }
    if (t >= T.stat3) {
      const L0 = layout('0', NUM.weight, NUM.size, E.fonts.sans, NUM.tracking);
      const mv = ease.snap(prog(t, T.stat3, T.stat3 + 0.32));
      const x0 = W / 2 - L0.width / 2;
      const zx = zeroAt < 0 ? x0 : lerp(x0, xCov + LCOV.xs[zeroAt], mv);
      const out = T.iris;
      const irisK = ease.inOutExpo(prog(t, out - 0.04, T.friends));
      const sc = 1 - irisK * 0.94;
      const al = 1 - prog(t, out + 0.05, T.friends - 0.05);
      if (zeroAt < 0 && mv < 1) {
        numberRun('0', W / 2, 0, t, {spin: false, alpha: 1 - mv});
      }
      numberRun(COV, W / 2, 0, t, {
        spin: false,
        scale: sc,
        alpha: al,
        dy: -irisK * 60,
        xOverride: COV.split('').map((_, i) => (i == zeroAt ? zx : null)),
        pops: (i) =>
          i == zeroAt
            ? 1
            : prog(
                t,
                T.stat3 + 0.08 + popDelay(i),
                T.stat3 + 0.3 + popDelay(i),
              ),
      });
      if (al > 0) {
        caption('test coverage', T.stat3 + 0.12, t, {y: 730, out: out - 0.1});
        caption(
          `${FACTS.tests} tests · ${FACTS.assertions} assertions`,
          T.stat3 + 0.3,
          t,
          {
            y: 806,
            size: 36,
            weight: 700,
            family: E.fonts.mono,
            tracking: 0,
            color: 'rgba(255,255,255,0.82)',
            out: out - 0.08,
          },
        );
      }
    }
    // Iris down into the store at the centre of the friends orbit.
    if (t >= T.iris - 0.04) {
      const k = ease.inOutExpo(prog(t, T.iris - 0.04, T.friends));
      const R = lerp(1250, CORE_R, k);
      const cy = lerp(H / 2, ORBIT_Y, k);
      ctx.save();
      screenT();
      ctx.beginPath();
      ctx.rect(-100, -100, W + 200, H + 200);
      ctx.arc(W / 2, cy, R, 0, TAU, true);
      ctx.clip('evenodd');
      background({cx: W / 2, cy: ORBIT_Y, glow: 1});
      ctx.restore();
      const shade = ease.inCubic(prog(t, T.iris + 0.06, T.friends));
      if (shade > 0) {
        screenT();
        const g = ctx.createRadialGradient(
          W / 2 - R * 0.3,
          cy - R * 0.35,
          0,
          W / 2,
          cy,
          R,
        );
        g.addColorStop(0, rgba(mixc(C.pinkHi, '#ffffff', 0.35), shade));
        g.addColorStop(0.55, rgba(C.pink, shade));
        g.addColorStop(1, rgba('#a0103f', shade));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(W / 2, cy, R, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = rgba('#ffffff', 0.9 * shade);
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Bars 6-7: friends orbit the store, then collapse into it.
  // ---------------------------------------------------------------------------

  const CORE_R = 64;
  const ORBIT_Y = 500;
  // The home page's first group of friends orbit closest; the rest share
  // the two outer rings.
  const FRIEND_GROUPS = [...new Set(FACTS.friends.map(({group}) => group))];
  const logosWhere = (test) =>
    FACTS.friends.filter(({group}) => test(group)).map(({logo}) => logo);
  const INNER = logosWhere((group) => group == FRIEND_GROUPS[0]);
  const OUTER = logosWhere((group) => group != FRIEND_GROUPS[0]);
  const SPLIT = Math.round(OUTER.length * 0.42);
  const RINGS = [
    {r: 250, ax: 0.2, az: -0.12, speed: 0.95, logos: INNER},
    {r: 430, ax: -0.1, az: 0.16, speed: -0.5, logos: OUTER.slice(0, SPLIT)},
    {r: 620, ax: 0.08, az: 0.05, speed: 0.34, logos: OUTER.slice(SPLIT)},
  ];

  const orbitCam = (t) => {
    const d = t - T.friends;
    return camera({
      target: [0, 0, 0],
      dist: 2050 - d * 60,
      yaw: -8 + d * 7,
      pitch: 17 + d * 1.5,
      fov: 30,
      shift: [0, ORBIT_Y - H / 2],
    });
  };

  const ringPoint = (ring, theta, r) => {
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    // Tilt about x, then z.
    const y1 = -z * Math.sin(ring.ax);
    const z1 = z * Math.cos(ring.ax);
    return [
      x * Math.cos(ring.az) - y1 * Math.sin(ring.az),
      x * Math.sin(ring.az) + y1 * Math.cos(ring.az),
      z1,
    ];
  };

  const LOGO_ORDER = RINGS.flatMap((ring, ri) =>
    ring.logos.map((name, li) => ({ri, li, name})),
  );
  const absorbAt = (ri, li) =>
    T.collapse + 0.1 + (2 - ri) * 0.07 + hash(ri * 31 + li) * 0.16;

  const friends = (t) => {
    const cam = orbitCam(t);
    background({cx: W / 2, cy: ORBIT_Y, glow: 1});
    const moteA =
      prog(t, T.friends, T.friends + 0.5) *
      (1 - prog(t, T.collapse, T.implode));
    motes(cam, t, moteA, 'back');
    const core = cam.project(0, 0, 0);
    const items = [];
    let absorbedGlow = 0;
    RINGS.forEach((ring, ri) => {
      const draw = ease.snap(
        prog(t, T.friends + ri * 0.08, T.friends + 0.55 + ri * 0.08),
      );
      const collapse = ease.inCubic(
        prog(t, T.collapse + (2 - ri) * 0.05, T.implode - 0.05),
      );
      const R = ring.r * (1 - collapse);
      const spin =
        (t - T.friends) * ring.speed + collapse * 2.2 * Math.sign(ring.speed);
      if (draw > 0 && R > 4) {
        const N = 120;
        const n = Math.ceil(N * draw);
        for (let c = 0; c < n; c += 6) {
          const seg = [];
          for (let k = c; k <= Math.min(n, c + 6); k++)
            seg.push(ringPoint(ring, spin + (k / N) * TAU - Math.PI / 2, R));
          const mid = cam.project(...seg[Math.floor(seg.length / 2)]);
          items.push({
            z: mid.z,
            fn: () => {
              const front = clamp((core.z - mid.z) / ring.r + 0.5);
              line3d(cam, seg, {
                color: '#ffffff',
                width: 2,
                alpha: (0.1 + 0.32 * front) * (1 - collapse),
                cap: 'butt',
              });
            },
          });
        }
        // Data motes riding the rings.
        for (let k = 0; k < 5; k++) {
          const th = spin * 2.4 + (k / 5) * TAU + ri;
          if (((th - spin + Math.PI / 2) / TAU) % 1 > draw) continue;
          const p = cam.project(...ringPoint(ring, th, R));
          items.push({
            z: p.z,
            fn: () => {
              screenT();
              ctx.fillStyle = C.pinkHi;
              ctx.globalAlpha = 0.9 * (1 - collapse);
              ctx.beginPath();
              ctx.arc(p.x, p.y, 4 * p.s, 0, TAU);
              ctx.fill();
              ctx.globalAlpha = 1;
            },
          });
        }
      }
      ring.logos.forEach((name, li) => {
        const th0 = spin + (li / ring.logos.length) * TAU - Math.PI / 2;
        const appearAt =
          T.friends + ri * 0.08 + 0.55 * (li / ring.logos.length) * 0.9 + 0.05;
        const ap = prog(t, appearAt, appearAt + 0.3);
        if (ap <= 0) return;
        const ta = absorbAt(ri, li);
        const k = ease.inQuad(prog(t, ta - 0.34, ta));
        if (k >= 1) {
          absorbedGlow += Math.exp(-(t - ta) * 10);
          return;
        }
        const pos = ringPoint(
          ring,
          th0 + k * 3 * Math.sign(ring.speed),
          ring.r * (1 - k),
        );
        const p = cam.project(...pos);
        items.push({
          z: p.z,
          fn: () => {
            const front = clamp((core.z - p.z) / ring.r + 0.5);
            const r = 46 * p.s * ease.outBack(ap, 2.2) * (1 - k * 0.75);
            screenT();
            ctx.globalAlpha = clamp(ap * 3);
            ctx.fillStyle = '#0d0d0e';
            ctx.strokeStyle = rgba(mixc('#ffffff', C.pinkHi, k));
            ctx.lineWidth = 2.6 * p.s;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, TAU);
            ctx.fill();
            ctx.stroke();
            const img = G.LOGOS[name];
            const is = r * 1.18;
            ctx.drawImage(img, p.x - is / 2, p.y - is / 2, is, is);
            ctx.fillStyle = '#000';
            ctx.globalAlpha = clamp(ap * 3) * (1 - front) * 0.55;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r + 2, 0, TAU);
            ctx.fill();
            ctx.globalAlpha = 1;
          },
        });
      });
    });
    // The store itself.
    const grow =
      1 +
      Math.min(absorbedGlow, 3) * 0.05 +
      prog(t, T.collapse, T.implode) * 0.25;
    const implode = ease.inBack(prog(t, T.implode, T.implode + 0.2), 3);
    const coreR =
      CORE_R *
      (core.s / orbitCam(T.friends).project(0, 0, 0).s) *
      grow *
      (1 - implode);
    items.push({
      z: core.z,
      fn: () => {
        if (coreR <= 0.5) return;
        screenT();
        const g = ctx.createRadialGradient(
          core.x - coreR * 0.3,
          core.y - coreR * 0.35,
          0,
          core.x,
          core.y,
          coreR,
        );
        g.addColorStop(
          0,
          rgba(
            mixc(C.pinkHi, '#ffffff', 0.35 + Math.min(absorbedGlow, 1) * 0.5),
          ),
        );
        g.addColorStop(0.55, C.pink);
        g.addColorStop(1, '#a0103f');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(core.x, core.y, coreR, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = rgba('#ffffff', 0.9);
        ctx.lineWidth = 3;
        ctx.stroke();
      },
    });
    items.sort((p, q) => q.z - p.z).forEach((it) => it.fn());
    motes(cam, t, moteA, 'front');
    // Title.
    const s = 'Plays well with friends.';
    kinetic(s, W / 2, 985, {
      size: 64,
      weight: 800,
      tracking: -1.5,
      align: 'center',
      colors: s
        .split('')
        .map((_, j) => (j >= 16 && j < 23 ? C.pinkHi : '#ffffff')),
      p: (j) =>
        ease.snap(
          prog(t, T.friends + 0.2 + j * 0.016, T.friends + 0.75 + j * 0.016),
        ) +
        ease.inExpo(
          prog(t, T.collapse - 0.05 + j * 0.006, T.collapse + 0.2 + j * 0.006),
        ),
    });
    sparks(core, t);
  };

  // Radial bursts, deterministic from a seed.
  const burst = (x, y, t0, t, o = {}) => {
    const {
      n = 40,
      speed = 900,
      life = 0.6,
      seed = 1,
      color = C.pinkHi,
      size = 3,
    } = o;
    const d = t - t0;
    if (d < 0 || d > life) return;
    screenT();
    for (let i = 0; i < n; i++) {
      const a = hash(seed * 97 + i) * TAU;
      const v = speed * (0.35 + hash(seed * 13 + i * 7) * 0.65);
      const dist = (v * (1 - Math.exp(-d * 5))) / 5;
      const px = x + Math.cos(a) * dist;
      const py = y + Math.sin(a) * dist;
      const al = (1 - d / life) ** 1.5;
      const len = v * 0.018 * Math.exp(-d * 5);
      ctx.strokeStyle = i % 3 ? color : '#ffffff';
      ctx.globalAlpha = al;
      ctx.lineWidth = size * (1 - d / life) + 0.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - Math.cos(a) * len, py - Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const sparks = (core, t) => {
    LOGO_ORDER.forEach(({ri, li}) => {
      const ta = absorbAt(ri, li);
      burst(core.x, core.y, ta, t, {
        n: 7,
        speed: 700,
        life: 0.3,
        seed: ri * 50 + li + 3,
        size: 2.5,
      });
    });
  };

  // ---------------------------------------------------------------------------
  // Bars 7-8: the logo stacks up, then resolves into the logotype.
  // ---------------------------------------------------------------------------

  // The mark from site/extras/logotype.svg, split into four stackable
  // pieces (top disc, two pink bands, bottom rim). Each piece lists the
  // subpaths it contributes to the stroke, pink and black layers.
  const PIECE_SRC = [
    {
      stroke: ['M340 617a84 241 90 1 1 .01 0z'],
      black: ['M249 619a94 240 90 0 0 308-128 114 289 70 0 1-308 128z'],
      pink: [],
      cy: 560,
    },
    {
      stroke: ['M131 475a94 254 70 1 0 428-124 114 286 70 0 1-428 124z'],
      black: [],
      pink: ['M131 475a94 254 70 1 0 428-124 114 286 70 0 1-428 124z'],
      cy: 430,
    },
    {
      stroke: ['M131 335a94 254 70 1 0 428-124 114 286 70 0 1-428 124z'],
      black: [],
      pink: ['M131 335a94 254 70 1 0 428-124 114 286 70 0 1-428 124z'],
      cy: 290,
    },
    {
      stroke: [
        'M119 208a94 254 70 0 0 306 38 90 260 90 0 1-306-38z',
        'M340 211a74 241 90 1 1 .01 0z',
      ],
      black: [
        'M119 208a94 254 70 0 0 306 38 90 260 90 0 1-306-38z',
        'M340 211a74 241 90 1 1 .01 0z',
      ],
      pink: [],
      cy: 150,
    },
  ];
  let PIECES = null;
  let WORDMARK = null;
  let LETTERS = null;

  const initLogo = () => {
    PIECES = PIECE_SRC.map((p) => ({
      ...p,
      stroke: new Path2D(p.stroke.join('')),
      black: p.black.length ? new Path2D(p.black.join('')) : null,
      pink: p.pink.length ? new Path2D(p.pink.join('')) : null,
    }));
    WORDMARK = new Path2D(G.ASSETS.wordmark);
    // Find each letter's horizontal extent by scanning a rasterized copy.
    const k = 0.25;
    const c = document.createElement('canvas');
    c.width = Math.ceil(3250 * k);
    c.height = Math.ceil(680 * k);
    const x = c.getContext('2d');
    x.scale(k, k);
    x.fill(WORDMARK);
    const data = x.getImageData(0, 0, c.width, c.height).data;
    const filled = [];
    for (let i = 0; i < c.width; i++) {
      let any = false;
      for (let j = 0; j < c.height && !any; j++)
        any = data[(j * c.width + i) * 4 + 3] > 8;
      filled.push(any);
    }
    LETTERS = [];
    let start = -1;
    filled.forEach((f, i) => {
      if (f && start < 0) start = i;
      if (!f && start >= 0) {
        LETTERS.push([start / k - 6, i / k + 6]);
        start = -1;
      }
    });
  };

  const MARK_C = [340, 340];
  const STACK = {x: W / 2, y: 520, s: 0.86};
  const LOGO_S = 0.42;
  const LOGO_X = W / 2 - ((51 + 3195) / 2) * LOGO_S;
  const LOGO_Y = 452 - 340 * LOGO_S;

  // Where each piece is, and how it is squashed, at time t.
  const pieceState = (i, t) => {
    const land = T.stack[i];
    const fall = 0.2;
    const d = t - land;
    if (i > 0 && d < -fall) return null;
    let y = 0;
    let sx = 1;
    let sy = 1;
    if (i == 0) {
      // The bottom rim is born in the implosion and falls into place.
      const born = T.implode + 0.2;
      if (t < born) return null;
      const grow = ease.outBack(prog(t, born, born + 0.12), 2.4);
      const from = (ORBIT_Y - STACK.y) / STACK.s - (PIECES[0].cy - MARK_C[1]);
      if (d < 0) {
        const k = ease.inQuad(prog(t, born, land));
        y = lerp(from, 0, k);
        return {
          y,
          sx: grow * (1 - 0.05 * k),
          sy: grow * (1 + 0.08 * k),
          alpha: 1,
        };
      }
      const w = E.wobble(d, 5, 9);
      for (let j = 1; j < 4; j++) {
        const dj = t - T.stack[j];
        if (dj > 0) y += 16 * E.wobble(dj, 5, 10) * 0.6 ** (j - 1);
      }
      return {y, sx: 1 + 0.1 * w, sy: 1 - 0.16 * w, alpha: 1};
    }
    if (d < 0) {
      const k = (d + fall) / fall;
      y = -900 * (1 - ease.inQuad(k));
      sy = 1 + 0.12 * k;
      sx = 1 - 0.06 * k;
    } else {
      const w = E.wobble(d, 5, 9);
      sy = 1 - 0.16 * w;
      sx = 1 + 0.1 * w;
    }
    // Later landings push the pieces beneath down a little.
    for (let j = i + 1; j < 4; j++) {
      const dj = t - T.stack[j];
      if (dj > 0) y += 16 * E.wobble(dj, 5, 10) * 0.6 ** (j - i - 1);
    }
    return {y, sx, sy, alpha: clamp((d + fall) / 0.06)};
  };

  const markAt = (t) => {
    const k = ease.snap(prog(t, T.logo, T.logo + 0.62));
    const punch = t > T.logo ? E.wobble(t - T.logo, 3.5, 7) * 0.05 : 0;
    const pre = ease.inOutCubic(prog(t, T.logo - 0.28, T.logo)) * 0.04;
    return {
      x: lerp(STACK.x, LOGO_X + MARK_C[0] * LOGO_S, k),
      y: lerp(STACK.y, LOGO_Y + MARK_C[1] * LOGO_S, k),
      s: lerp(STACK.s, LOGO_S, k) * (1 + punch - pre),
    };
  };

  const drawMark = (t, alpha = 1) => {
    const M = markAt(t);
    const states = PIECES.map((_, i) => pieceState(i, t));
    const withPiece = (i, fn) => {
      const st = states[i];
      if (!st) return;
      const p = PIECES[i];
      screenT(M.x, M.y, M.s);
      ctx.translate(0, st.y);
      ctx.translate(0, p.cy - MARK_C[1]);
      ctx.scale(st.sx, st.sy);
      ctx.translate(-MARK_C[0], -p.cy);
      ctx.globalAlpha = st.alpha * alpha;
      fn(p);
    };
    for (let i = 0; i < 4; i++) {
      withPiece(i, (p) => {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 80;
        ctx.lineJoin = 'round';
        ctx.stroke(p.stroke);
      });
    }
    for (let i = 0; i < 4; i++) {
      withPiece(i, (p) => {
        if (!p.pink) return;
        ctx.fillStyle = C.pink;
        ctx.fill(p.pink);
      });
    }
    for (let i = 0; i < 4; i++) {
      withPiece(i, (p) => {
        if (!p.black) return;
        ctx.fillStyle = '#000000';
        ctx.fill(p.black);
      });
    }
    ctx.globalAlpha = 1;
  };

  const drawWordmark = (t) => {
    LETTERS.forEach(([x0, x1], i) => {
      const t0 = T.logo + 0.08 + i * 0.03;
      const k = ease.snap(prog(t, t0, t0 + 0.55));
      if (k <= 0) return;
      ctx.save();
      screenT(LOGO_X, LOGO_Y, LOGO_S);
      ctx.beginPath();
      ctx.rect(x0, 0, x1 - x0, 700);
      ctx.clip();
      ctx.translate(0, (1 - k) * 560);
      ctx.fillStyle = '#f2f2f3';
      ctx.fill(WORDMARK);
      ctx.restore();
    });
  };

  const logoWorld = (t) => {
    background({cx: W / 2, cy: 500, glow: 1});
    // The implosion's afterglow.
    const glow =
      Math.exp(-Math.max(0, t - T.implode - 0.2) * 3) * (t > T.implode ? 1 : 0);
    if (glow > 0.01) {
      screenT();
      const g = ctx.createRadialGradient(
        W / 2,
        ORBIT_Y,
        0,
        W / 2,
        ORBIT_Y,
        700,
      );
      g.addColorStop(0, rgba(C.pink, 0.55 * glow));
      g.addColorStop(1, rgba(C.pink, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    // Light burst and anamorphic streak on the final hit.
    const hit = t - T.logo;
    if (hit > -0.02 && hit < 0.8) {
      const M = markAt(T.logo);
      const k = Math.exp(-Math.max(0, hit) * 8) * clamp((hit + 0.02) / 0.02);
      screenT();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, 620);
      g.addColorStop(0, rgba('#ffffff', 0.5 * k));
      g.addColorStop(0.2, rgba(C.pinkHi, 0.25 * k));
      g.addColorStop(1, rgba(C.pink, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(M.x, M.y);
      ctx.scale(1, 0.012);
      const st = ctx.createRadialGradient(0, 0, 0, 0, 0, 1500);
      st.addColorStop(0, rgba('#ffffff', 0.9 * k));
      st.addColorStop(0.3, rgba(C.pinkHi, 0.5 * k));
      st.addColorStop(1, rgba(C.pink, 0));
      ctx.fillStyle = st;
      ctx.beginPath();
      ctx.arc(0, 0, 1500, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
    }
    // Shockwave on the final hit.
    const sw = prog(t, T.logo, T.logo + 0.7);
    if (sw > 0 && sw < 1) {
      const M = markAt(T.logo);
      screenT();
      ctx.strokeStyle = rgba(C.pinkHi, (1 - sw) * 0.8);
      ctx.lineWidth = 40 * (1 - sw) + 1;
      ctx.beginPath();
      ctx.arc(M.x, M.y, ease.outCubic(sw) * 1500, 0, TAU);
      ctx.stroke();
    }
    inLayer(() => {
      drawMark(t);
      drawWordmark(t);
      // A light sweep across the logotype.
      const s = prog(t, T.logo + 1.05, T.logo + 1.6);
      if (s > 0 && s < 1) {
        ctx.globalCompositeOperation = 'source-atop';
        screenT();
        const x = lerp(-400, W + 400, ease.inOutSine(s));
        const g = ctx.createLinearGradient(x - 260, 0, x + 260, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.75)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.transform(1, 0, -0.35, 1, 0, 0);
        ctx.fillRect(-400, 0, W + 1200, H);
        ctx.globalCompositeOperation = 'source-over';
      }
    });
    burst(markAt(T.logo).x, markAt(T.logo).y, T.logo, t, {
      n: 90,
      speed: 3200,
      life: 0.9,
      seed: 7,
      size: 5,
    });
    burst(W / 2, ORBIT_Y, T.implode + 0.2, t, {
      n: 70,
      speed: 2600,
      life: 0.7,
      seed: 99,
      size: 4,
    });
    // Landing puffs for each stacked piece.
    T.stack.forEach((land, i) => {
      const d = t - land;
      if (d < 0 || d > 0.45 || t > T.logo) return;
      const M = markAt(t);
      const k = ease.outCubic(d / 0.45);
      screenT(M.x, M.y + (PIECES[i].cy - MARK_C[1] + 60) * M.s);
      ctx.scale(1, 0.3);
      ctx.strokeStyle = rgba(C.pinkHi, (1 - k) * 0.9);
      ctx.lineWidth = 8 * (1 - k) + 1;
      ctx.beginPath();
      ctx.arc(0, 0, (260 + k * 260) * M.s, 0, TAU);
      ctx.stroke();
    });
    // Tagline and URL.
    const tag = 'The reactive data store for local-first apps.';
    kinetic(tag, W / 2, 690, {
      size: 46,
      weight: 600,
      tracking: -0.5,
      align: 'center',
      color: '#b9b9c0',
      p: (j) =>
        ease.snap(prog(t, T.logo + 0.35 + j * 0.005, T.logo + 0.8 + j * 0.005)),
    });
    const url = 'tinybase.org';
    kinetic(url, W / 2, 800, {
      size: 44,
      weight: 700,
      family: E.fonts.mono,
      align: 'center',
      color: C.pinkHi,
      p: (j) =>
        ease.snap(
          prog(t, T.logo + 0.55 + j * 0.015, T.logo + 0.95 + j * 0.015),
        ),
    });
    const ul = ease.snap(prog(t, T.logo + 0.75, T.logo + 1.15));
    if (ul > 0) {
      screenT();
      ctx.fillStyle = C.pink;
      const w = layout(url, 700, 44, E.fonts.mono, 0).width;
      ctx.fillRect(W / 2 - (w / 2) * ul, 822, w * ul, 4);
    }
  };

  // ---------------------------------------------------------------------------
  // Frame assembly and post parameters.
  // ---------------------------------------------------------------------------

  const HITS = [
    {t: T.local, amp: 0.45},
    {t: T.sync, amp: 0.35},
    {t: T.fast, amp: 0.35},
    {t: T.stats, amp: 0.8},
    {t: T.stat2, amp: 0.35},
    {t: T.stat3, amp: 0.35},
    {t: T.friends, amp: 0.4},
    {t: T.implode + 0.2, amp: 0.7},
    {t: T.stack[0], amp: 0.25},
    {t: T.stack[1], amp: 0.25},
    {t: T.stack[2], amp: 0.3},
    {t: T.stack[3], amp: 0.35},
    {t: T.logo, amp: 1},
  ];

  const shake = (t) => {
    let x = 0;
    let y = 0;
    let r = 0;
    HITS.forEach((h, i) => {
      const d = t - h.t;
      if (d < 0 || d > 0.6) return;
      const env = h.amp * Math.exp(-d * 9);
      x += noise1(d * 38, i * 3 + 1) * 16 * env;
      y += noise1(d * 38, i * 3 + 2) * 12 * env;
      r += noise1(d * 30, i * 3 + 3) * 0.006 * env;
    });
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [
      c,
      s,
      -s,
      c,
      x + W / 2 - (c * W) / 2 + (s * H) / 2,
      y + H / 2 - (s * W) / 2 - (c * H) / 2,
    ];
  };

  const draw = (c, t) => {
    ctx = c;
    E.setCtx(c);
    const sh = shake(t);
    const z = 1 + 0.045 * ease.inOutSine(prog(t, T.logo + 0.3, T.end));
    setScreen(E.mul(sh, [z, 0, 0, z, (W / 2) * (1 - z), (H / 2) * (1 - z)]));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (t < T.stats) dataWorld(t);
    else if (t < T.friends) stats(t);
    else if (t < T.implode + 0.2) friends(t);
    else logoWorld(t);
  };

  const post = (t) => {
    let ca = 0;
    let flash = 0;
    HITS.forEach((h) => {
      const d = t - h.t;
      if (d < 0) return;
      ca += h.amp * 0.014 * Math.exp(-d * 7);
      flash += h.amp * 0.03 * Math.exp(-d * 12);
    });
    const pinkK =
      prog(t, T.zoom + 0.2, T.stats) * (1 - prog(t, T.iris, T.friends));
    const endK = prog(t, T.logo + 0.3, T.logo + 1);
    return {
      bloom: lerp(lerp(0.085, 0.05, pinkK), 0.06, endK),
      thresh: lerp(lerp(0.62, 0.97, pinkK), 0.75, endK),
      knee: 0.3,
      ca,
      flash: 0,
      flashCol: [1, 0.6, 0.75],
      vig: lerp(0.5, 0.3, pinkK),
      grain: 0.026,
      exposure: clamp(t / 0.25),
      fade: 1 - ease.inOutSine(prog(t, T.end - 0.24, T.end - 1 / E.FPS)),
    };
  };

  // Where the motion is fastest, render more sub-frames for smoother blur.
  const FAST = [
    [T.zoom + 0.2, T.stats],
    [T.stat2 - 0.12, T.stat2 + 0.12],
    [T.iris, T.friends],
    [T.collapse + 0.1, T.implode + 0.3],
    [T.logo - 0.05, T.logo + 0.3],
  ];
  const kBoost = (t) => (FAST.some(([a, z]) => t >= a && t <= z) ? 2 : 1);

  const init = () => {
    layer = document.createElement('canvas');
    layer.width = W;
    layer.height = H;
    lctx = layer.getContext('2d');
    initLogo();
  };

  G.SHOTS = {T, EDITS, HITS, init, draw, post, kBoost};
})(window);
