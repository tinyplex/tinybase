// TinyBase showreel runtime: loads assets, renders frames (with sub-frame
// motion blur) for the offline renderer, and plays in real time in a browser.
(function (G) {
  'use strict';

  const E = G.E;
  const {W, H, FPS, DUR} = E;

  const scene = document.createElement('canvas');
  scene.width = W;
  scene.height = H;
  const ctx = scene.getContext('2d', {alpha: false});
  const out = document.getElementById('out');
  let post = null;

  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;

  const loadLogo = async (svg) => {
    const size = 256;
    const box = /viewBox\s*=\s*["']([^"']+)/i.exec(svg);
    const vb = box ? [0, ...box[1].trim().split(/[\s,]+/)] : null;
    const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
    const img = new Image();
    img.src = url;
    await img.decode();
    const iw = vb ? +vb[3] : img.naturalWidth || size;
    const ih = vb ? +vb[4] : img.naturalHeight || size;
    const k = Math.min(size / iw, size / ih);
    const c = document.createElement('canvas');
    c.width = c.height = size;
    c.getContext('2d').drawImage(
      img,
      (size - iw * k) / 2,
      (size - ih * k) / 2,
      iw * k,
      ih * k,
    );
    URL.revokeObjectURL(url);
    return c;
  };

  const init = async () => {
    const A = G.ASSETS;
    const faces = [
      new FontFace('Inter', b64(A.fonts.inter), {weight: '100 900'}),
      new FontFace('Inconsolata', b64(A.fonts.inconsolata), {
        weight: '200 900',
      }),
    ];
    await Promise.all(faces.map((f) => f.load()));
    faces.forEach((f) => document.fonts.add(f));
    G.LOGOS = {};
    await Promise.all(
      Object.entries(A.logos).map(async ([name, svg]) => {
        G.LOGOS[name] = await loadLogo(svg);
      }),
    );
    E.setCtx(ctx);
    post = new G.Post(out, scene);
    if (G.SHOTS.init) G.SHOTS.init();
  };

  // Renders time t with K sub-frames spread across a 180-degree shutter.
  const renderTime = (t, K = 8, shutter = 0.5, seed = Math.round(t * FPS)) => {
    if (K > 2 && G.SHOTS.kBoost) K = Math.round(K * G.SHOTS.kBoost(t));
    post.begin();
    for (let j = 0; j < K; j++) {
      const ts = K == 1 ? t : t + (((j + 0.5) / K - 0.5) * shutter) / FPS;
      G.SHOTS.draw(ctx, ts);
      post.add(1 / K);
    }
    post.end(G.SHOTS.post(t), seed);
  };

  const renderFrame = (i, K = 8, shutter = 0.5) =>
    renderTime(i / FPS, K, shutter, i);

  // A labelled grid of stills, for reviewing choreography at a glance.
  const sheet = (times, cols = 4, cw = 480, K = 1) => {
    const ch = Math.round((cw * H) / W);
    const rows = Math.ceil(times.length / cols);
    const c = document.createElement('canvas');
    c.width = cols * cw;
    c.height = rows * ch;
    const x = c.getContext('2d');
    times.forEach((t, i) => {
      renderTime(t, K);
      const px = (i % cols) * cw;
      const py = Math.floor(i / cols) * ch;
      x.drawImage(out, px, py, cw, ch);
      x.fillStyle = 'rgba(0,0,0,.6)';
      x.fillRect(px, py, 58, 20);
      x.fillStyle = '#7f7';
      x.font = '14px monospace';
      x.fillText(t.toFixed(3), px + 5, py + 15);
    });
    return c.toDataURL('image/png');
  };

  // Real-time playback for viewing in a browser. The soundtrack is
  // synthesized ahead of time so that playback starts instantly.
  let playing = false;
  let startAt = 0;
  let soundtrack = null;
  const prepareAudio = () => (soundtrack ??= G.AUDIO.render());
  const play = async () => {
    if (playing) return;
    playing = true;
    startAt = performance.now();
    try {
      // Created inside the click so that the browser lets it make sound.
      const actx = new AudioContext({sampleRate: 48000});
      const buffer = await prepareAudio();
      await actx.resume();
      const source = actx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(actx.destination);
      source.start(actx.currentTime + 0.05);
      startAt = performance.now() + 50;
    } catch (e) {
      // Play silently if audio is unavailable.
    }
    const loop = (now) => {
      const t = Math.max(0, ((now - startAt) / 1000) % DUR);
      renderTime(t, 2);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  G.SR = {init, renderTime, renderFrame, sheet, play, prepareAudio};
})(window);
