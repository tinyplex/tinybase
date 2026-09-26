// TinyBase showreel compositor: accumulates sub-frames of the 2D scene in
// linear light for true motion blur, then adds bloom, chromatic aberration,
// vignette, flash and grain in WebGL2.
(function (G) {
  'use strict';

  const VS = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const HEAD = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`;

  const FS_ACCUM = `${HEAD}
uniform sampler2D uTex;
uniform float uW;
void main() {
  vec3 c = texture(uTex, vUv).rgb;
  o = vec4(pow(c, vec3(2.2)) * uW, uW);
}`;

  const DS13 = `
vec3 ds13(sampler2D t, vec2 uv, vec2 px) {
  vec3 a = texture(t, uv + px * vec2(-1.0, -1.0)).rgb;
  vec3 b = texture(t, uv + px * vec2( 1.0, -1.0)).rgb;
  vec3 c = texture(t, uv + px * vec2(-1.0,  1.0)).rgb;
  vec3 d = texture(t, uv + px * vec2( 1.0,  1.0)).rgb;
  vec3 e = texture(t, uv + px * vec2(-2.0, -2.0)).rgb;
  vec3 f = texture(t, uv + px * vec2( 0.0, -2.0)).rgb;
  vec3 g = texture(t, uv + px * vec2( 2.0, -2.0)).rgb;
  vec3 h = texture(t, uv + px * vec2(-2.0,  0.0)).rgb;
  vec3 i = texture(t, uv).rgb;
  vec3 j = texture(t, uv + px * vec2( 2.0,  0.0)).rgb;
  vec3 k = texture(t, uv + px * vec2(-2.0,  2.0)).rgb;
  vec3 l = texture(t, uv + px * vec2( 0.0,  2.0)).rgb;
  vec3 m = texture(t, uv + px * vec2( 2.0,  2.0)).rgb;
  vec3 r = (a + b + c + d) * 0.125;
  r += (e + f + h + i) * 0.03125;
  r += (f + g + i + j) * 0.03125;
  r += (h + i + k + l) * 0.03125;
  r += (i + j + l + m) * 0.03125;
  return r;
}`;

  const FS_PREFILTER = `${HEAD}
uniform sampler2D uTex;
uniform vec2 uPx;
uniform float uThresh;
uniform float uKnee;
${DS13}
void main() {
  vec3 c = ds13(uTex, vUv, uPx);
  float br = max(c.r, max(c.g, c.b));
  float soft = clamp(br - uThresh + uKnee, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-4);
  float w = max(soft, br - uThresh) / max(br, 1e-4);
  o = vec4(c * w, 1.0);
}`;

  const FS_DOWN = `${HEAD}
uniform sampler2D uTex;
uniform vec2 uPx;
${DS13}
void main() { o = vec4(ds13(uTex, vUv, uPx), 1.0); }`;

  const FS_UP = `${HEAD}
uniform sampler2D uLow;
uniform sampler2D uHigh;
uniform vec2 uPx;
uniform float uRadius;
void main() {
  vec2 d = uPx * uRadius;
  vec3 s = texture(uLow, vUv - d).rgb;
  s += texture(uLow, vUv + vec2(0.0, -d.y)).rgb * 2.0;
  s += texture(uLow, vUv + vec2(d.x, -d.y)).rgb;
  s += texture(uLow, vUv + vec2(-d.x, 0.0)).rgb * 2.0;
  s += texture(uLow, vUv).rgb * 4.0;
  s += texture(uLow, vUv + vec2(d.x, 0.0)).rgb * 2.0;
  s += texture(uLow, vUv + vec2(-d.x, d.y)).rgb;
  s += texture(uLow, vUv + vec2(0.0, d.y)).rgb * 2.0;
  s += texture(uLow, vUv + d).rgb;
  o = vec4(texture(uHigh, vUv).rgb + s / 16.0, 1.0);
}`;

  const FS_FINAL = `${HEAD}
uniform sampler2D uColor;
uniform sampler2D uBloom;
uniform vec2 uRes;
uniform float uBloomAmt;
uniform float uCA;
uniform float uFlash;
uniform vec3 uFlashCol;
uniform float uVig;
uniform float uGrain;
uniform float uSeed;
uniform float uExposure;
uniform float uFade;
float h12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
// Soft value noise: grain a little larger than a pixel survives compression.
float vn(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(h12(i), h12(i + vec2(1.0, 0.0)), f.x),
    mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
vec3 shoulder(vec3 x) {
  vec3 k = max(x - 0.82, 0.0);
  return min(x, 0.82) + k / (1.0 + k / 0.18);
}
void main() {
  vec2 uv = vUv;
  vec2 d = uv - 0.5;
  vec2 da = d * vec2(uRes.x / uRes.y, 1.0);
  float r2 = dot(da, da);
  vec3 c;
  if (uCA > 0.0) {
    vec2 off = d * uCA * (0.4 + r2);
    c.r = texture(uColor, uv + off).r;
    c.g = texture(uColor, uv).g;
    c.b = texture(uColor, uv - off).b;
  } else {
    c = texture(uColor, uv).rgb;
  }
  c += texture(uBloom, uv).rgb * uBloomAmt;
  c *= uExposure;
  c += uFlashCol * uFlash;
  c *= 1.0 - uVig * smoothstep(0.08, 1.05, r2);
  c = shoulder(c) * uFade;
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  vec2 gp = gl_FragCoord.xy / 1.7 + vec2(uSeed * 17.31, uSeed * 29.17);
  float n = (vn(gp) + 0.6 * vn(gp * 2.1 + 5.3)) / 1.6 * 2.0 - 1.0;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c += n * uGrain * (0.35 + 0.65 * (1.0 - abs(l - 0.45) * 1.6));
  c += (h12(gl_FragCoord.xy + uSeed * 7.7) - 0.5) / 255.0;
  o = vec4(c, 1.0);
}`;

  class Post {
    constructor(canvas, src) {
      const gl = canvas.getContext('webgl2', {
        antialias: false,
        alpha: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });
      if (!gl) throw new Error('WebGL2 unavailable');
      if (!gl.getExtension('EXT_color_buffer_float')) {
        throw new Error('EXT_color_buffer_float unavailable');
      }
      gl.getExtension('OES_texture_float_linear');
      this.gl = gl;
      this.src = src;
      this.w = canvas.width;
      this.h = canvas.height;

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      this.progs = {
        accum: this.program(FS_ACCUM),
        prefilter: this.program(FS_PREFILTER),
        down: this.program(FS_DOWN),
        up: this.program(FS_UP),
        final: this.program(FS_FINAL),
      };

      this.srcTex = this.texture(
        this.w,
        this.h,
        gl.RGBA8,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
      );
      this.accum = this.target(this.w, this.h);
      this.down = [];
      this.up = [];
      let w = this.w >> 1;
      let h = this.h >> 1;
      for (let i = 0; i < 6; i++) {
        this.down.push(this.target(w, h));
        this.up.push(this.target(w, h));
        w = Math.max(1, w >> 1);
        h = Math.max(1, h >> 1);
      }
    }

    program(fs) {
      const gl = this.gl;
      const sh = (type, srcText) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, srcText);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          throw new Error(gl.getShaderInfoLog(s));
        }
        return s;
      };
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p));
      }
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        u[info.name] = gl.getUniformLocation(p, info.name);
      }
      return {p, u};
    }

    texture(w, h, internal, format, type) {
      const gl = this.gl;
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    target(w, h) {
      const gl = this.gl;
      const tex = this.texture(w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        tex,
        0,
      );
      return {tex, fb, w, h};
    }

    use(prog, target) {
      const gl = this.gl;
      gl.useProgram(prog.p);
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
        gl.viewport(0, 0, target.w, target.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.w, this.h);
      }
      return prog.u;
    }

    bind(unit, tex, loc) {
      const gl = this.gl;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(loc, unit);
    }

    draw() {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }

    begin() {
      const gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.accum.fb);
      gl.viewport(0, 0, this.w, this.h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    add(weight) {
      const gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.src,
      );
      const u = this.use(this.progs.accum, this.accum);
      this.bind(0, this.srcTex, u.uTex);
      gl.uniform1f(u.uW, weight);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      this.draw();
      gl.disable(gl.BLEND);
    }

    end(p = {}, seed = 0) {
      const gl = this.gl;
      const {
        bloom = 0.35,
        thresh = 0.55,
        knee = 0.25,
        radius = 1,
        ca = 0,
        flash = 0,
        flashCol = [1, 0.85, 0.9],
        vig = 0.45,
        grain = 0.035,
        exposure = 1,
        fade = 1,
      } = p;
      if (bloom > 0) {
        let u = this.use(this.progs.prefilter, this.down[0]);
        this.bind(0, this.accum.tex, u.uTex);
        gl.uniform2f(u.uPx, 1 / this.w, 1 / this.h);
        gl.uniform1f(u.uThresh, thresh);
        gl.uniform1f(u.uKnee, knee);
        this.draw();
        for (let i = 1; i < this.down.length; i++) {
          const s = this.down[i - 1];
          u = this.use(this.progs.down, this.down[i]);
          this.bind(0, s.tex, u.uTex);
          gl.uniform2f(u.uPx, 1 / s.w, 1 / s.h);
          this.draw();
        }
        const last = this.down.length - 1;
        let low = this.down[last];
        for (let i = last - 1; i >= 0; i--) {
          u = this.use(this.progs.up, this.up[i]);
          this.bind(0, low.tex, u.uLow);
          this.bind(1, this.down[i].tex, u.uHigh);
          gl.uniform2f(u.uPx, 1 / low.w, 1 / low.h);
          gl.uniform1f(u.uRadius, radius);
          this.draw();
          low = this.up[i];
        }
      }
      const u = this.use(this.progs.final, null);
      this.bind(0, this.accum.tex, u.uColor);
      this.bind(1, this.up[0].tex, u.uBloom);
      gl.uniform2f(u.uRes, this.w, this.h);
      gl.uniform1f(u.uBloomAmt, bloom);
      gl.uniform1f(u.uCA, ca);
      gl.uniform1f(u.uFlash, flash);
      gl.uniform3f(u.uFlashCol, ...flashCol);
      gl.uniform1f(u.uVig, vig);
      gl.uniform1f(u.uGrain, grain);
      gl.uniform1f(u.uSeed, seed % 997);
      gl.uniform1f(u.uExposure, exposure);
      gl.uniform1f(u.uFade, fade);
      this.draw();
    }
  }

  G.Post = Post;
})(window);
