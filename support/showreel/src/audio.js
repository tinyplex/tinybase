// TinyBase showreel soundtrack: synthesized offline with Web Audio from the
// same cue times as the picture, so every hit lands on its frame. 128 BPM,
// eight bars; the harmony is Am F C G F G C over a filtered intro.
(function (G) {
  'use strict';

  const E = G.E;
  const SR = 48000;
  const DUR = E.DUR;
  const b = (n) => n * E.BEAT;
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);

  // Samples of delay through n DynamicsCompressorNodes in series, measured
  // with an impulse since it is an implementation detail.
  const latency = async (n) => {
    const ac = new OfflineAudioContext(1, 4096, SR);
    const buf = ac.createBuffer(1, 4096, SR);
    buf.getChannelData(0)[64] = 0.5;
    const src = ac.createBufferSource();
    src.buffer = buf;
    let node = src;
    for (let i = 0; i < n; i++) {
      const c = ac.createDynamicsCompressor();
      node.connect(c);
      node = c;
    }
    node.connect(ac.destination);
    src.start(0);
    const out = (await ac.startRendering()).getChannelData(0);
    const first = out.findIndex((v) => Math.abs(v) > 1e-6);
    return first > 64 ? first - 64 : 0;
  };

  const render = async () => {
    const S = G.SHOTS;
    const T = S.T;
    const ac = new OfflineAudioContext(2, SR * DUR, SR);
    const rand = E.rng(20260926);

    // -------------------------------------------------------------------------
    // Buses
    // -------------------------------------------------------------------------

    const glue = ac.createDynamicsCompressor();
    glue.threshold.value = -16;
    glue.knee.value = 8;
    glue.ratio.value = 2.5;
    glue.attack.value = 0.012;
    glue.release.value = 0.18;
    const limit = ac.createDynamicsCompressor();
    limit.threshold.value = -4;
    limit.knee.value = 0;
    limit.ratio.value = 20;
    limit.attack.value = 0.002;
    limit.release.value = 0.08;
    const master = ac.createGain();
    master.gain.value = 0.8;
    master.connect(glue).connect(limit).connect(ac.destination);

    // Everything that ducks under the kick.
    const pump = ac.createGain();
    pump.connect(master);
    const drums = ac.createGain();
    drums.gain.value = 0.9;
    drums.connect(master);

    // Reverb from a generated impulse response.
    const irLen = Math.floor(SR * 2.6);
    const ir = ac.createBuffer(2, irLen, SR);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < irLen; i++) {
        const k = i / irLen;
        lp += (rand() * 2 - 1 - lp) * (0.55 - 0.4 * k);
        d[i] =
          lp *
          (1 - k) ** 2.2 *
          Math.exp(-k * 2.5) *
          (i < SR * 0.012 ? i / (SR * 0.012) : 1);
      }
    }
    const verb = ac.createConvolver();
    verb.buffer = ir;
    const verbIn = ac.createGain();
    const verbHp = ac.createBiquadFilter();
    verbHp.type = 'highpass';
    verbHp.frequency.value = 220;
    const verbOut = ac.createGain();
    verbOut.gain.value = 0.55;
    verbIn.connect(verbHp).connect(verb).connect(verbOut).connect(master);

    // Ping-pong delay, dotted eighths.
    const dl = ac.createDelay(1);
    const dr = ac.createDelay(1);
    dl.delayTime.value = b(0.75);
    dr.delayTime.value = b(0.75);
    const fb = ac.createGain();
    fb.gain.value = 0.38;
    const dlp = ac.createBiquadFilter();
    dlp.type = 'lowpass';
    dlp.frequency.value = 3800;
    const panL = ac.createStereoPanner();
    panL.pan.value = -0.7;
    const panR = ac.createStereoPanner();
    panR.pan.value = 0.7;
    const delayIn = ac.createGain();
    const delayOut = ac.createGain();
    delayOut.gain.value = 0.4;
    delayIn.connect(dl);
    dl.connect(dlp).connect(dr);
    dr.connect(fb).connect(dl);
    dl.connect(panL).connect(delayOut);
    dr.connect(panR).connect(delayOut);
    delayOut.connect(master);
    delayOut.connect(verbIn);

    // Shared white noise.
    const noiseBuf = ac.createBuffer(1, SR * 4, SR);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rand() * 2 - 1;
    const noise = (t, dur) => {
      const n = ac.createBufferSource();
      n.buffer = noiseBuf;
      n.start(t, rand() * 3, dur + 0.05);
      return n;
    };

    const env = (g, t, a, peak, d, sustain = 0.0001) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), t + a + d);
    };
    const out = (
      node,
      {dest = master, pan = 0, verbSend = 0, delaySend = 0} = {},
    ) => {
      const p = ac.createStereoPanner();
      p.pan.value = pan;
      node.connect(p).connect(dest);
      if (verbSend) {
        const s = ac.createGain();
        s.gain.value = verbSend;
        p.connect(s).connect(verbIn);
      }
      if (delaySend) {
        const s = ac.createGain();
        s.gain.value = delaySend;
        p.connect(s).connect(delayIn);
      }
      return p;
    };

    // -------------------------------------------------------------------------
    // Instruments
    // -------------------------------------------------------------------------

    const kick = (t, vel = 1) => {
      const o = ac.createOscillator();
      o.frequency.setValueAtTime(170, t);
      o.frequency.exponentialRampToValueAtTime(56, t + 0.06);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.35);
      const g = ac.createGain();
      env(g, t, 0.003, 1.1 * vel, 0.42);
      o.connect(g);
      out(g, {dest: drums});
      o.start(t);
      o.stop(t + 0.5);
      const n = noise(t, 0.02);
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 2500;
      const ng = ac.createGain();
      env(ng, t, 0.001, 0.25 * vel, 0.018);
      n.connect(hp).connect(ng);
      out(ng, {dest: drums});
      // Duck the pads and bass.
      pump.gain.setValueAtTime(1, t);
      pump.gain.linearRampToValueAtTime(0.28, t + 0.01);
      pump.gain.setTargetAtTime(1, t + 0.03, 0.07);
    };

    const clap = (t, vel = 1) => {
      [0, 0.011, 0.023].forEach((o, i) => {
        const n = noise(t + o, i == 2 ? 0.22 : 0.02);
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1350;
        bp.Q.value = 0.9;
        const g = ac.createGain();
        env(g, t + o, 0.001, 0.6 * vel, i == 2 ? 0.2 : 0.012);
        n.connect(bp).connect(g);
        out(g, {dest: drums, verbSend: 0.35, pan: 0.05});
      });
    };

    const hat = (t, vel = 1, len = 0.035, pan = 0.15) => {
      const n = noise(t, len);
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 8200;
      const g = ac.createGain();
      env(g, t, 0.001, 0.22 * vel, len);
      n.connect(hp).connect(g);
      out(g, {dest: drums, pan});
    };

    const snare = (t, vel = 1, tone = 200) => {
      const n = noise(t, 0.12);
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2200;
      bp.Q.value = 0.7;
      const g = ac.createGain();
      env(g, t, 0.001, 0.45 * vel, 0.1);
      n.connect(bp).connect(g);
      out(g, {dest: drums, verbSend: 0.25});
      const o = ac.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(tone * 1.4, t);
      o.frequency.exponentialRampToValueAtTime(tone, t + 0.03);
      const og = ac.createGain();
      env(og, t, 0.001, 0.3 * vel, 0.07);
      o.connect(og);
      out(og, {dest: drums});
      o.start(t);
      o.stop(t + 0.12);
    };

    const bass = (t, dur, m, vel = 1, cutoff = 700) => {
      const f = hz(m);
      const g = ac.createGain();
      env(g, t, 0.006, 0.42 * vel, dur, 0.001);
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 4;
      lp.frequency.setValueAtTime(cutoff * 2.2, t);
      lp.frequency.exponentialRampToValueAtTime(cutoff * 0.5, t + dur);
      const sawGain = ac.createGain();
      sawGain.gain.value = 0.55;
      sawGain.connect(lp);
      [-7, 7].forEach((det) => {
        const o = ac.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = det;
        o.connect(sawGain);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
      const sub = ac.createOscillator();
      sub.frequency.value = f / 2;
      const sg = ac.createGain();
      sg.gain.value = 1.1;
      sub.connect(sg).connect(g);
      sub.start(t);
      sub.stop(t + dur + 0.05);
      lp.connect(g);
      out(g, {dest: pump});
    };

    const pad = (t0, t1, notes, vel = 1, cut0 = 900, cut1 = 1600) => {
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.06 * vel, t0 + 0.25);
      g.gain.setValueAtTime(0.06 * vel, Math.max(t0 + 0.25, t1 - 0.3));
      g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.35);
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 0.8;
      lp.frequency.setValueAtTime(cut0, t0);
      lp.frequency.linearRampToValueAtTime(cut1, t1);
      notes.forEach((m, i) => {
        [-11, 0, 12].forEach((det) => {
          const o = ac.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = hz(m);
          o.detune.value = det + (i % 2 ? 3 : -3);
          o.connect(lp);
          o.start(t0);
          o.stop(t1 + 0.4);
        });
      });
      // Keep the pads out of the bass's way.
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 280;
      hp.Q.value = 0.6;
      lp.connect(hp).connect(g);
      out(g, {dest: pump, verbSend: 0.5});
    };

    const stab = (t, notes, vel = 1, len = 0.32, bright = 5200) => {
      const g = ac.createGain();
      env(g, t, 0.004, 0.11 * vel, len);
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 2;
      lp.frequency.setValueAtTime(bright, t);
      lp.frequency.exponentialRampToValueAtTime(700, t + len);
      notes.forEach((m) => {
        ['sawtooth', 'square'].forEach((type, k) => {
          const o = ac.createOscillator();
          o.type = type;
          o.frequency.value = hz(m + (k ? 12 : 0));
          o.detune.value = k ? 6 : -6;
          o.connect(lp);
          o.start(t);
          o.stop(t + len + 0.05);
        });
      });
      lp.connect(g);
      out(g, {verbSend: 0.4, delaySend: 0.22});
    };

    const pluck = (t, m, vel = 1, pan = 0, dec = 0.28) => {
      const g = ac.createGain();
      env(g, t, 0.002, 0.16 * vel, dec);
      const o = ac.createOscillator();
      o.type = 'triangle';
      o.frequency.value = hz(m);
      const o2 = ac.createOscillator();
      o2.frequency.value = hz(m + 12);
      const g2 = ac.createGain();
      g2.gain.value = 0.35;
      o.connect(g);
      o2.connect(g2).connect(g);
      out(g, {pan, verbSend: 0.3, delaySend: 0.3});
      o.start(t);
      o2.start(t);
      o.stop(t + dec + 0.05);
      o2.stop(t + dec + 0.05);
    };

    const blip = (t, m, vel = 1, pan = 0, dec = 0.07) => {
      const o = ac.createOscillator();
      o.frequency.setValueAtTime(hz(m + 5), t);
      o.frequency.exponentialRampToValueAtTime(hz(m), t + 0.02);
      const g = ac.createGain();
      env(g, t, 0.001, 0.12 * vel, dec);
      o.connect(g);
      out(g, {pan, verbSend: 0.2});
      o.start(t);
      o.stop(t + dec + 0.03);
    };

    const tick = (t, vel = 1, freq = 3500, pan = 0) => {
      const n = noise(t, 0.008);
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = freq;
      bp.Q.value = 2.5;
      const g = ac.createGain();
      env(g, t, 0.0005, 0.5 * vel, 0.006);
      n.connect(bp).connect(g);
      out(g, {pan});
      const o = ac.createOscillator();
      o.frequency.value = 170 + rand() * 40;
      const og = ac.createGain();
      env(og, t, 0.001, 0.12 * vel, 0.022);
      o.connect(og);
      out(og, {pan});
      o.start(t);
      o.stop(t + 0.04);
    };

    const whoosh = (t, dur, f0, f1, vel = 1, pan0 = 0, pan1 = 0, q = 1.4) => {
      const n = noise(t, dur);
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = q;
      bp.frequency.setValueAtTime(f0, t);
      bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5 * vel, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const p = ac.createStereoPanner();
      p.pan.setValueAtTime(pan0, t);
      p.pan.linearRampToValueAtTime(pan1, t + dur);
      n.connect(bp).connect(g).connect(p).connect(master);
      const s = ac.createGain();
      s.gain.value = 0.3;
      p.connect(s).connect(verbIn);
    };

    const zip = (t, dur, m0, m1, vel = 1, pan0 = 0, pan1 = 0) => {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(hz(m0), t);
      o.frequency.exponentialRampToValueAtTime(hz(m1), t + dur);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09 * vel, t + dur * 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const p = ac.createStereoPanner();
      p.pan.setValueAtTime(pan0, t);
      p.pan.linearRampToValueAtTime(pan1, t + dur);
      o.connect(g).connect(p).connect(master);
      const s = ac.createGain();
      s.gain.value = 0.35;
      p.connect(s).connect(delayIn);
      o.start(t);
      o.stop(t + dur + 0.02);
    };

    const boom = (t, vel = 1, f0 = 120, f1 = 38, len = 0.9) => {
      const o = ac.createOscillator();
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + len * 0.6);
      const g = ac.createGain();
      env(g, t, 0.004, 0.9 * vel, len);
      o.connect(g);
      out(g, {verbSend: 0.25});
      o.start(t);
      o.stop(t + len + 0.05);
    };

    const crash = (t, vel = 1, len = 1.6) => {
      const n = noise(t, len);
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3000;
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(10000, t);
      lp.frequency.exponentialRampToValueAtTime(3500, t + len);
      const g = ac.createGain();
      env(g, t, 0.003, 0.28 * vel, len);
      n.connect(hp).connect(lp).connect(g);
      out(g, {verbSend: 0.4, pan: -0.1});
    };

    const riser = (t0, t1, vel = 1, f0 = 300, f1 = 7000) => {
      const n = noise(t0, t1 - t0);
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(f0, t0);
      bp.frequency.exponentialRampToValueAtTime(f1, t1);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.4 * vel, t1 - 0.01);
      g.gain.linearRampToValueAtTime(0.0001, t1 + 0.01);
      n.connect(bp).connect(g);
      out(g, {verbSend: 0.3});
    };

    // Reverse swell: a sound that swells into a hit.
    const suck = (t0, t1, vel = 1) => {
      const n = noise(t0, t1 - t0);
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(400, t0);
      lp.frequency.exponentialRampToValueAtTime(9000, t1);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.35 * vel, t1 - 0.005);
      g.gain.linearRampToValueAtTime(0.0001, t1 + 0.005);
      n.connect(lp).connect(g);
      out(g, {});
    };

    const shimmer = (t, dur, notes, vel = 1) => {
      notes.forEach((m, i) => {
        const o = ac.createOscillator();
        o.frequency.value = hz(m);
        const g = ac.createGain();
        const t0 = t + i * 0.03;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.035 * vel, t0 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g);
        out(g, {
          pan: (i % 2 ? 0.5 : -0.5) * (i / notes.length),
          verbSend: 0.7,
          delaySend: 0.25,
        });
        o.start(t0);
        o.stop(t0 + dur + 0.05);
      });
    };

    // -------------------------------------------------------------------------
    // Score
    // -------------------------------------------------------------------------

    const CH = {
      Am: [57, 60, 64],
      F: [57, 60, 65],
      C: [55, 60, 64],
      G: [55, 59, 62],
      F2: [53, 57, 60],
      Cend: [48, 55, 60, 64, 67, 74],
    };
    const ROOT = {Am: 45, F: 41, C: 48, G: 43};

    // Bar 1: a filtered pad and the typing.
    pad(0, b(4), [57, 64, 69, 72, 76], 0.9, 400, 2600);
    blip(0.06, 81, 0.6);
    const CODE = "store.setCell('pets', 'fido', 'color', 'brown');";
    for (let i = 0; i < CODE.length; i++) {
      const g = [6, 14, 22, 30, 39, 46, 48].findIndex((z) => i < z);
      const start = [0, 6, 14, 22, 30, 39, 46][g];
      const t = b(0.25) + g * b(0.25) + (i - start) * 0.012;
      tick(
        t,
        i == start ? 0.9 : 0.45,
        2800 + rand() * 2200,
        (i / CODE.length - 0.5) * 0.8,
      );
    }
    for (let i = 1; i <= 7; i++) hat(b(i * 0.25), 0.35, 0.02, 0.3);
    // The morph: glitter as the code dissolves, whoosh as the tokens fly.
    for (let i = 0; i < 14; i++)
      blip(
        T.morph + i * 0.016,
        84 + [0, 3, 5, 7, 10][i % 5] + (i > 6 ? 12 : 0),
        0.35,
        (i / 14 - 0.5) * 1.2,
        0.05,
      );
    whoosh(T.morph, 0.5, 700, 3200, 0.5, -0.4, 0.3);
    // Cells popping into the table.
    const pent = [69, 72, 74, 76, 79, 81, 84, 86];
    for (let i = 0; i < 12; i++)
      blip(
        T.morph + 0.42 + i * 0.03,
        pent[i % 8],
        0.5,
        (i % 4) / 2 - 0.75,
        0.06,
      );
    // The swoop to the device.
    whoosh(b(2.9), b(1.1), 250, 2200, 0.7, 0.4, -0.2);
    suck(b(3.1), b(4), 0.6);

    // Drums, bars 2-6.
    for (let beat = 4; beat < 24; beat++) {
      kick(b(beat), beat % 4 == 0 ? 1 : 0.9);
      if (beat % 2 == 1) clap(b(beat), 0.8);
      hat(b(beat + 0.5), 0.9);
      hat(b(beat + 0.25), 0.3, 0.02, -0.25);
      hat(b(beat + 0.75), 0.35, 0.02, -0.25);
    }
    // Bass, off-beat eighths on the root.
    const BASS_BARS = ['Am', 'F', 'C', 'G', 'F'];
    BASS_BARS.forEach((ch, i) => {
      for (let k = 0; k < 4; k++)
        bass(
          b(4 + i * 4 + k + 0.5),
          b(0.42),
          ROOT[ch],
          0.9,
          ch == 'G' ? 900 : 700,
        );
    });
    // Pads and stabs on the hero lines.
    [
      ['Am', 4],
      ['F', 8],
      ['C', 12],
      ['G', 16],
      ['F2', 20],
    ].forEach(([ch, beat]) => {
      pad(b(beat), b(beat + 4), CH[ch], 0.8, 700, 2200);
      stab(b(beat), CH[ch], beat == 16 ? 1.2 : 1);
      crash(b(beat), beat == 16 ? 0.9 : 0.5, beat == 16 ? 1.8 : 1.1);
    });

    // Bar 2: a local edit.
    pluck(S.EDITS[0].t, 76, 0.9, 0.3);
    // Bar 3: packets zip across and land.
    zip(S.EDITS[2].t - 0.62, 0.6, 72, 88, 1, 0.3, 0.7);
    zip(S.EDITS[3].t - 0.62, 0.6, 88, 72, 1, 0.7, 0.2);
    blip(S.EDITS[1].t, 79, 0.6, 0.6);
    pluck(S.EDITS[2].t, 81, 0.8, 0.7);
    pluck(S.EDITS[3].t, 76, 0.8, 0.2);
    shimmer(5.02, 0.9, [72, 76, 79, 84], 0.8);
    // Bar 4: components rise, pulses fire and land.
    [0, 1, 2].forEach((i) =>
      pluck(
        T.fast + 0.26 + i * 0.07,
        [72, 76, 79][i],
        0.6,
        i * 0.3 - 0.1,
        0.18,
      ),
    );
    S.EDITS.slice(4).forEach((e, i) => {
      zip(e.t, 0.26, 76 + i * 3, 96, 0.8, 0.1, 0.3);
      pluck(e.t + 0.26, [84, 88][i], 0.9, 0.3);
    });
    // The dive into pink.
    riser(b(15), b(16), 0.9, 400, 9000);
    whoosh(b(15.2), b(0.8), 200, 5000, 0.8, -0.3, 0.3, 0.8);

    // Bar 5: stats. Odometer ticks follow the digits on screen.
    boom(T.stats, 0.8, 110, 40, 0.8);
    const spinTicks = (turns, t0) => {
      let last = 0;
      for (let t = t0; t < t0 + 0.36; t += 1 / 480) {
        const p = Math.floor(E.ease.outExpo(E.clamp((t - t0) / 0.36)) * turns);
        if (p != last) tick(t, 0.35, 5200, 0.2);
        last = p;
      }
    };
    // Each digit spins ten places past its value, staggered as on screen.
    [...G.ASSETS.facts.size].forEach((ch, i) => {
      if (ch >= '0' && ch <= '9') spinTicks(10 + +ch, T.stats + i * 0.03);
    });
    whoosh(T.stat2 - 0.2, 0.36, 500, 4000, 0.6, 0, 0);
    stab(T.stat2, CH.G, 0.8, 0.2);
    stab(
      T.stat3,
      CH.G.map((m) => m + 12),
      0.8,
      0.2,
    );
    [0, 0.05, 0.1].forEach((o, i) =>
      blip(T.stat3 + 0.08 + o, [79, 83, 86][i], 0.7, i * 0.3 - 0.3),
    );
    // The iris into the store.
    whoosh(T.iris - 0.05, T.friends - T.iris + 0.05, 5000, 300, 0.7, 0, 0, 1);
    boom(T.friends, 0.55, 90, 36, 0.7);

    // Bar 6: friends. An arpeggio for the orbits, pops for the logos.
    const ARP = [65, 69, 72, 76, 72, 69];
    for (let i = 0; i < 15; i++)
      pluck(
        b(20 + i * 0.25),
        ARP[i % ARP.length] + (i >= 8 ? 12 : 0),
        0.55,
        Math.sin(i) * 0.6,
        0.2,
      );
    for (let i = 0; i < 27; i++)
      blip(
        T.friends + 0.1 + i * 0.022,
        88 + [0, 2, 4, 7, 9][i % 5],
        0.22,
        Math.sin(i * 1.7) * 0.8,
        0.04,
      );

    // Bar 7: the collapse and the stack.
    pad(b(24), b(28), CH.G, 0.9, 500, 3500);
    for (let k = 0; k < 4; k++)
      bass(b(24 + k + 0.5), b(0.42), ROOT.G, 0.8, 1000 + k * 300);
    kick(b(24));
    kick(b(25));
    riser(b(24), T.implode + 0.2, 0.8, 200, 6000);
    for (let i = 0; i < 27; i++)
      tick(
        T.collapse + 0.1 + i * 0.024,
        0.3,
        6000 - i * 120,
        Math.sin(i) * 0.7,
      );
    suck(T.implode, T.implode + 0.2, 1);
    boom(T.implode + 0.2, 0.7, 180, 45, 0.5);
    // A snare roll that tightens into the hit, then a breath.
    for (let t = b(25.5); t < b(27.75);) {
      const k = (t - b(25.5)) / (b(27.75) - b(25.5));
      snare(t, 0.25 + k * 0.55, 190 + k * 60);
      t += k < 0.35 ? b(0.5) : k < 0.7 ? b(0.25) : b(0.125);
    }
    T.stack.forEach((t, i) => {
      boom(t, 0.8, [150, 170, 190, 210][i], [55, 62, 70, 78][i], 0.35);
      pluck(t, [67, 71, 74, 79][i], 0.9, 0, 0.3);
      tick(t, 0.6, 2500, 0);
    });
    riser(b(26), T.logo - 0.02, 0.6, 500, 6500);

    // Bar 8: the logo.
    kick(T.logo, 1.2);
    boom(T.logo, 1.1, 95, 30, 2.2);
    crash(T.logo, 1.1, 2.2);
    stab(T.logo, CH.Cend, 1.3, 0.9, 6500);
    pad(T.logo, T.end - 0.2, CH.Cend, 1.1, 2500, 900);
    bass(T.logo, 1.6, 36, 1, 500);
    for (let i = 0; i < 8; i++)
      blip(
        T.logo + 0.08 + i * 0.035,
        [84, 88, 91, 96, 91, 88, 91, 96][i],
        0.3,
        (i / 8 - 0.5) * 1.2,
        0.08,
      );
    shimmer(T.logo + 1.05, 1.2, [84, 88, 91, 95, 98], 1);
    pluck(T.logo + 0.55, 91, 0.5, 0.2);

    const buffer = await ac.startRendering();
    // The compressors look ahead, which delays everything; pull it back so
    // each hit lands on its frame.
    const lag = await latency(2);
    let peak = 0;
    for (let ch = 0; ch < 2; ch++) {
      const d = buffer.getChannelData(ch);
      d.copyWithin(0, lag);
      d.fill(0, d.length - lag);
      for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
    }
    // Normalise to -1.5 dBFS, leaving headroom for the AAC encode.
    const gain = peak > 0 ? 10 ** (-1.5 / 20) / peak : 1;
    const fadeLen = Math.floor(SR * 0.2);
    for (let ch = 0; ch < 2; ch++) {
      const d = buffer.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const tail = d.length - i;
        d[i] *= gain * (tail < fadeLen ? tail / fadeLen : 1);
      }
    }
    return buffer;
  };

  // 16-bit PCM WAV, base64-encoded for handing to Node.
  const wav = async () => {
    const buf = await render();
    const n = buf.length;
    const view = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, s) =>
      [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF');
    view.setUint32(4, 36 + n * 4, true);
    w(8, 'WAVE');
    w(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, SR, true);
    view.setUint32(28, SR * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    w(36, 'data');
    view.setUint32(40, n * 4, true);
    const L = buf.getChannelData(0);
    const R = buf.getChannelData(1);
    let o = 44;
    for (let i = 0; i < n; i++) {
      // TPDF dither.
      const dl = (Math.random() - Math.random()) / 32768;
      const dr = (Math.random() - Math.random()) / 32768;
      view.setInt16(o, Math.max(-1, Math.min(1, L[i] + dl)) * 32767, true);
      view.setInt16(o + 2, Math.max(-1, Math.min(1, R[i] + dr)) * 32767, true);
      o += 4;
    }
    const bytes = new Uint8Array(view.buffer);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(s);
  };

  G.AUDIO = {render, wav};
})(window);
