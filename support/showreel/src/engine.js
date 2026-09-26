// TinyBase showreel engine: timing, easing, a small 3D camera, and the 2D
// drawing helpers that every shot is built from. Everything is a pure function
// of time, so any frame can be rendered in any order.
(function (G) {
  'use strict';

  const W = 1920;
  const H = 1080;
  const FPS = 60;
  const DUR = 15;
  const BPM = 128;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  const DEG = Math.PI / 180;
  const TAU = Math.PI * 2;

  // -------------------------------------------------------------------------
  // Math
  // -------------------------------------------------------------------------

  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
  const beat = (n) => n * BEAT;
  const mixv = (a, b, k) =>
    typeof a == 'number' ? lerp(a, b, k) : a.map((x, i) => lerp(x, b[i], k));

  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - x;
        const d = dx(t);
        if (Math.abs(e) < 1e-7 || Math.abs(d) < 1e-7) break;
        t -= e / d;
      }
      if (t < 0 || t > 1 || Math.abs(sx(t) - x) > 1e-4) {
        let lo = 0;
        let hi = 1;
        t = x;
        for (let i = 0; i < 40; i++) {
          sx(t) < x ? (lo = t) : (hi = t);
          t = (lo + hi) / 2;
        }
      }
      return sy(t);
    };
  };

  const ease = {
    linear: (k) => k,
    inQuad: (k) => k * k,
    outQuad: (k) => 1 - (1 - k) * (1 - k),
    inOutQuad: (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2),
    inCubic: (k) => k * k * k,
    outCubic: (k) => 1 - (1 - k) ** 3,
    inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2),
    inQuart: (k) => k ** 4,
    outQuart: (k) => 1 - (1 - k) ** 4,
    inOutQuart: (k) => (k < 0.5 ? 8 * k ** 4 : 1 - (-2 * k + 2) ** 4 / 2),
    inQuint: (k) => k ** 5,
    outQuint: (k) => 1 - (1 - k) ** 5,
    inOutQuint: (k) => (k < 0.5 ? 16 * k ** 5 : 1 - (-2 * k + 2) ** 5 / 2),
    inExpo: (k) => (k <= 0 ? 0 : 2 ** (10 * k - 10)),
    outExpo: (k) => (k >= 1 ? 1 : 1 - 2 ** (-10 * k)),
    inOutExpo: (k) =>
      k <= 0
        ? 0
        : k >= 1
          ? 1
          : k < 0.5
            ? 2 ** (20 * k - 10) / 2
            : (2 - 2 ** (-20 * k + 10)) / 2,
    inSine: (k) => 1 - Math.cos((k * Math.PI) / 2),
    outSine: (k) => Math.sin((k * Math.PI) / 2),
    inOutSine: (k) => -(Math.cos(Math.PI * k) - 1) / 2,
    inCirc: (k) => 1 - Math.sqrt(1 - k * k),
    outCirc: (k) => Math.sqrt(1 - (k - 1) ** 2),
    outBack: (k, s = 1.70158) => 1 + (s + 1) * (k - 1) ** 3 + s * (k - 1) ** 2,
    inBack: (k, s = 1.70158) => (s + 1) * k ** 3 - s * k * k,
    inOutBack: (k, s = 1.70158 * 1.525) =>
      k < 0.5
        ? ((2 * k) ** 2 * ((s + 1) * 2 * k - s)) / 2
        : ((2 * k - 2) ** 2 * ((s + 1) * (k * 2 - 2) + s) + 2) / 2,
    outElastic: (k) =>
      k <= 0
        ? 0
        : k >= 1
          ? 1
          : 2 ** (-10 * k) * Math.sin((k * 10 - 0.75) * ((2 * Math.PI) / 3)) +
            1,
    // Designer curves.
    snap: bezier(0.16, 1, 0.3, 1),
    glide: bezier(0.65, 0, 0.35, 1),
    whip: bezier(0.85, 0, 0.15, 1),
    punch: bezier(0.2, 1.4, 0.4, 1),
    bezier,
  };

  // Keyframe track: keys are [time, value, easingIntoThisKey?].
  const track = (t, keys) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e = ease.inOutCubic] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        return mixv(v0, v1, e((t - t0) / (t1 - t0 || 1)));
      }
    }
    return keys[keys.length - 1][1];
  };

  // Damped spring step response, 0 -> 1 with overshoot. dt in seconds.
  const spring = (dt, freq = 3, damp = 0.35) => {
    if (dt <= 0) return 0;
    const w = TAU * freq;
    const wd = w * Math.sqrt(1 - damp * damp);
    return (
      1 -
      Math.exp(-damp * w * dt) *
        (Math.cos(wd * dt) + ((damp * w) / wd) * Math.sin(wd * dt))
    );
  };

  // Decaying wobble for impacts: 0 at dt=0, oscillates and dies out.
  const wobble = (dt, freq = 6, decay = 8) =>
    dt <= 0 ? 0 : Math.sin(TAU * freq * dt) * Math.exp(-decay * dt);

  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  };

  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  const noise1 = (x, seed = 0) => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return lerp(hash(i + seed * 1013), hash(i + 1 + seed * 1013), u) * 2 - 1;
  };

  // -------------------------------------------------------------------------
  // Color
  // -------------------------------------------------------------------------

  const hex = (h) => {
    h = h.replace('#', '');
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  };
  const rgba = (c, a = 1) => {
    const [r, g, b] = (typeof c == 'string' ? hex(c) : c).map(Math.round);
    return `rgba(${r},${g},${b},${clamp(a)})`;
  };
  const mixc = (c1, c2, k) =>
    mixv(
      typeof c1 == 'string' ? hex(c1) : c1,
      typeof c2 == 'string' ? hex(c2) : c2,
      clamp(k),
    );

  const C = {
    bg: '#111111',
    bgHi: '#1c1a1d',
    bgLo: '#080808',
    ink: '#ffffff',
    text: '#f2f2f3',
    dim: '#8e8e96',
    faint: '#34343a',
    card: '#050505',
    pink: '#d81b60',
    pinkHi: '#ff5c95',
    pinkLo: '#6e0c30',
  };

  // -------------------------------------------------------------------------
  // 3D camera. World is y-up; ground-plane content uses (u, v) = (x, z) so
  // that 'down the page' is 'toward the viewer'.
  // -------------------------------------------------------------------------

  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];

  const camera = ({
    target = [0, 0, 0],
    dist = 2000,
    yaw = 0,
    pitch = 0,
    roll = 0,
    fov = 30,
    shift = [0, 0],
  } = {}) => {
    const cy = Math.cos(yaw * DEG);
    const sy = Math.sin(yaw * DEG);
    const cp = Math.cos(pitch * DEG);
    const sp = Math.sin(pitch * DEG);
    const pos = [
      target[0] + dist * sy * cp,
      target[1] + dist * sp,
      target[2] + dist * cy * cp,
    ];
    const f = [-sy * cp, -sp, -cy * cp];
    let r = [cy, 0, -sy];
    let u = cross(r, f);
    if (roll) {
      const cr = Math.cos(roll * DEG);
      const sr = Math.sin(roll * DEG);
      const r2 = r.map((x, i) => x * cr + u[i] * sr);
      u = u.map((x, i) => x * cr - r[i] * sr);
      r = r2;
    }
    const F = H / 2 / Math.tan((fov * DEG) / 2);
    const cx = W / 2 + shift[0];
    const cyy = H / 2 + shift[1];
    const project = (x, y, z) => {
      const dx = x - pos[0];
      const dy = y - pos[1];
      const dz = z - pos[2];
      const zc = dx * f[0] + dy * f[1] + dz * f[2];
      const s = F / Math.max(zc, 1);
      return {
        x: cx + (dx * r[0] + dy * r[1] + dz * r[2]) * s,
        y: cyy - (dx * u[0] + dy * u[1] + dz * u[2]) * s,
        s,
        z: zc,
      };
    };
    return {pos, F, f, r, u, dist, project};
  };

  // A plane maps local (u, v, w) to world; w is height off the plane.
  const groundPlane =
    (ox = 0, oz = 0, oy = 0) =>
    (u, v, w = 0) => [ox + u, oy + w, oz + v];

  const plane =
    (origin, ex, ey, en) =>
    (u, v, w = 0) => [
      origin[0] + u * ex[0] + v * ey[0] + w * en[0],
      origin[1] + u * ex[1] + v * ey[1] + w * en[1],
      origin[2] + u * ex[2] + v * ey[2] + w * en[2],
    ];

  // Local affine transform (Jacobian of the projection) at a point on a plane.
  const affineAt = (cam, P, u, v, w = 0) => {
    const d = 0.5;
    const o = cam.project(...P(u, v, w));
    const a = cam.project(...P(u - d, v, w));
    const b = cam.project(...P(u + d, v, w));
    const c = cam.project(...P(u, v - d, w));
    const e = cam.project(...P(u, v + d, w));
    return [
      (b.x - a.x) / (2 * d),
      (b.y - a.y) / (2 * d),
      (e.x - c.x) / (2 * d),
      (e.y - c.y) / (2 * d),
      o.x,
      o.y,
      o.z,
    ];
  };

  // -------------------------------------------------------------------------
  // 2D drawing state. A global 'screen' matrix carries camera shake so every
  // layer, 3D or flat, shakes together.
  // -------------------------------------------------------------------------

  let ctx = null;
  let S = [1, 0, 0, 1, 0, 0];

  const mul = (a, b) => [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];

  const setCtx = (c) => (ctx = c);
  const setScreen = (m) => (S = m);
  const setT = (m) => {
    const k = mul(S, m);
    ctx.setTransform(k[0], k[1], k[2], k[3], k[4], k[5]);
  };
  const screenT = (x = 0, y = 0, sx = 1, sy = sx, rot = 0) => {
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    setT([c * sx, s * sx, -s * sy, c * sy, x, y]);
  };

  const fonts = {
    sans: 'Inter',
    mono: 'Inconsolata',
  };
  const font = (weight, size, family = fonts.sans) => {
    ctx.font = `${Math.round(weight)} ${size}px ${family}`;
  };

  const measureCache = new Map();
  // Per-glyph x offsets (with kerning and tracking) for kinetic type.
  const layout = (str, weight, size, family = fonts.sans, tracking = 0) => {
    const key = [str, weight, size, family, tracking].join('|');
    let res = measureCache.get(key);
    if (!res) {
      const saved = ctx.letterSpacing;
      ctx.letterSpacing = tracking + 'px';
      font(weight, size, family);
      const xs = [];
      for (let i = 0; i <= str.length; i++) {
        xs.push(ctx.measureText(str.slice(0, i)).width);
      }
      ctx.letterSpacing = saved;
      res = {xs, width: xs[str.length] - tracking};
      measureCache.set(key, res);
    }
    return res;
  };

  const roundRectPath = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
  };

  // A flat card lying on a plane, optionally extruded down by `depth` units
  // with a white edge like the illustrations on tinybase.org.
  const card3d = (cam, P, u, v, w, h, o = {}) => {
    const {
      r = 10,
      depth = 0,
      lift = 0,
      fill = C.card,
      stroke = C.ink,
      lw = 3,
      edge = stroke,
      alpha = 1,
      scale = 1,
    } = o;
    if (alpha <= 0 || scale <= 0) return;
    const sw = w * scale;
    const sh = h * scale;
    ctx.globalAlpha = alpha;
    if (depth > 0) {
      const m0 = affineAt(cam, P, u, v, lift);
      const m1 = affineAt(cam, P, u, v, lift - depth);
      const px = Math.hypot(m1[4] - m0[4], m1[5] - m0[5]);
      const n = Math.max(2, Math.min(40, Math.ceil(px / 1.2)));
      ctx.fillStyle = edge;
      for (let i = n; i >= 1; i--) {
        setT(affineAt(cam, P, u, v, lift - (depth * i) / n));
        roundRectPath(
          -sw / 2 - lw / 2,
          -sh / 2 - lw / 2,
          sw + lw,
          sh + lw,
          r + lw / 2,
        );
        ctx.fill();
      }
    }
    const m = affineAt(cam, P, u, v, lift);
    setT(m);
    if (stroke && lw > 0) {
      ctx.fillStyle = stroke;
      roundRectPath(
        -sw / 2 - lw / 2,
        -sh / 2 - lw / 2,
        sw + lw,
        sh + lw,
        r + lw / 2,
      );
      ctx.fill();
    }
    if (fill) {
      ctx.fillStyle = fill;
      roundRectPath(
        -sw / 2 + lw / 2,
        -sh / 2 + lw / 2,
        sw - lw,
        sh - lw,
        Math.max(0, r - lw / 2),
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return m;
  };

  // Text on a plane at local (u, v), drawn with the plane's local affine.
  const text3d = (cam, P, str, u, v, o = {}) => {
    const {
      w = 0,
      weight = 500,
      size = 24,
      family = fonts.mono,
      color = C.text,
      align = 'center',
      baseline = 'middle',
      alpha = 1,
      tracking = 0,
      scale = 1,
    } = o;
    if (alpha <= 0 || !str) return;
    const m = affineAt(cam, P, u, v, w);
    setT([m[0] * scale, m[1] * scale, m[2] * scale, m[3] * scale, m[4], m[5]]);
    font(weight, size, family);
    ctx.letterSpacing = tracking + 'px';
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillText(str, 0, 0);
    ctx.globalAlpha = 1;
    ctx.letterSpacing = '0px';
  };

  // Polyline through world points, drawn in screen space.
  const line3d = (cam, pts, o = {}) => {
    const {color = C.ink, width = 2, alpha = 1, cap = 'round', dash = null} = o;
    if (alpha <= 0 || pts.length < 2) return;
    setT([1, 0, 0, 1, 0, 0]);
    ctx.beginPath();
    let avg = 0;
    pts.forEach((p, i) => {
      const q = cam.project(...p);
      avg += q.s;
      i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
    });
    avg /= pts.length;
    ctx.lineWidth = width * (o.screenWidth ? 1 : avg);
    ctx.lineCap = cap;
    ctx.lineJoin = 'round';
    ctx.strokeStyle =
      typeof color == 'string' && color[0] == '#' ? rgba(color, 1) : color;
    ctx.globalAlpha = alpha;
    if (dash) ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  };

  // Kinetic type: a line whose glyphs rise out of a slit with a stagger.
  // `p` is a function from glyph index to progress (0 hidden, 1 settled,
  // 2 gone upward), so callers choreograph entrances and exits.
  const kinetic = (str, x, y, o = {}) => {
    const {
      weight = 900,
      size = 100,
      family = fonts.sans,
      tracking = 0,
      colors = null,
      color = C.text,
      p = () => 1,
      align = 'left',
      clip = true,
      alpha = 1,
      rise = 1,
      tilt = 0,
    } = o;
    const L = layout(str, weight, size, family, tracking);
    const x0 =
      align == 'center' ? x - L.width / 2 : align == 'right' ? x - L.width : x;
    ctx.save();
    if (clip) {
      screenT();
      ctx.beginPath();
      ctx.rect(x0 - size, y - size * 1.02, L.width + size * 2, size * 1.32);
      ctx.clip();
    }
    font(weight, size, family);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch == ' ') continue;
      const k = p(i);
      if (k <= 0 || k >= 2) continue;
      const off =
        k < 1 ? (1 - k) * size * 1.15 * rise : -(k - 1) * size * 1.15 * rise;
      const rot = (k < 1 ? 1 - k : -(k - 1)) * tilt * DEG;
      const gx = x0 + L.xs[i];
      const gw = L.xs[i + 1] - L.xs[i];
      screenT(gx + gw / 2, y + off, 1, 1, rot);
      ctx.globalAlpha = alpha * clamp(k < 1 ? k * 3 : (2 - k) * 3);
      ctx.fillStyle = colors ? colors[i] || color : color;
      ctx.fillText(ch, -gw / 2, 0);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    return {x0, width: L.width, xs: L.xs};
  };

  G.E = {
    W,
    H,
    FPS,
    DUR,
    BPM,
    BEAT,
    BAR,
    DEG,
    TAU,
    clamp,
    lerp,
    prog,
    beat,
    mixv,
    ease,
    track,
    spring,
    wobble,
    hash,
    rng,
    noise1,
    hex,
    rgba,
    mixc,
    C,
    camera,
    groundPlane,
    plane,
    affineAt,
    mul,
    setCtx,
    setScreen,
    setT,
    screenT,
    fonts,
    font,
    layout,
    roundRectPath,
    card3d,
    text3d,
    line3d,
    kinetic,
    get ctx() {
      return ctx;
    },
  };
})(window);
