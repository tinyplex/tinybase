// Renders showreel.html to a 1920x1080, 60fps H.264 MP4 with its soundtrack,
// using the Playwright Chromium that the E2E tests already install and ffmpeg.
// Frames are rendered by several browsers in parallel and streamed to ffmpeg
// in order.
//
//   node support/showreel/render.mjs [out.mp4]
//
// Env: K (motion-blur sub-frames, default 16), WORKERS (browsers, default 4),
// DRAFT=1 (fast, low quality), FROM/TO (frame range, for previews).
import {spawn} from 'child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';
import {dirname, join} from 'path';
import {chromium} from 'playwright';
import {fileURLToPath} from 'url';
import {buildAssets} from './build-assets.mjs';

const dir = dirname(fileURLToPath(import.meta.url));
const FPS = 60;
const CAPTURE = {
  format: 'png',
  optimizeForSpeed: true,
  clip: {x: 0, y: 0, width: 1920, height: 1080, scale: 1},
};
// How far rendering may run ahead of the encoder, in frames.
const AHEAD = 48;

const openPage = async () => {
  const browser = await chromium.launch({
    args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
  page.on('pageerror', (e) => console.error('[showreel]', e.message));
  await page.goto('file://' + join(dir, 'showreel.html') + '?render');
  await page.waitForFunction(() => window.READY, null, {timeout: 60000});
  const client = await page.context().newCDPSession(page);
  return {browser, page, client};
};

const startEncoder = (out, wavPath, from, draft, crf) => {
  const ff = spawn(
    'ffmpeg',
    [
      ...['-y', '-loglevel', 'error'],
      ...['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png'],
      ...['-i', '-', '-ss', String(from / FPS), '-i', wavPath],
      ...['-map', '0:v', '-map', '1:a', '-shortest'],
      ...[
        '-vf',
        'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,' +
          'setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709',
      ],
      ...(draft
        ? ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24']
        : ['-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf)]),
      ...['-tune', 'film', '-profile:v', 'high', '-color_primaries', 'bt709'],
      ...['-color_trc', 'bt709', '-colorspace', 'bt709'],
      ...['-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart'],
      out,
    ],
    {stdio: ['pipe', 'inherit', 'inherit']},
  );
  // A missing or failed ffmpeg surfaces through `done`, not a broken pipe.
  ff.stdin.on('error', () => {});
  const done = new Promise((resolve, reject) => {
    ff.on('error', (error) =>
      reject(new Error('ffmpeg is needed to encode: ' + error.message)),
    );
    ff.on('close', (code) =>
      code ? reject(new Error('ffmpeg exited with ' + code)) : resolve(),
    );
  });
  return {ff, done};
};

export const renderShowreel = async (
  out,
  {
    K = 16,
    workers = 4,
    draft = false,
    crf = 18,
    from = 0,
    to = 15 * FPS,
    progress = () => {},
  } = {},
) => {
  buildAssets();
  const tmp = mkdtempSync(join(tmpdir(), 'showreel-'));
  const pages = await Promise.all(
    Array.from({length: workers}, () => openPage()),
  );
  let encoder;
  try {
    const wavPath = join(tmp, 'audio.wav');
    writeFileSync(
      wavPath,
      Buffer.from(await pages[0].page.evaluate(() => AUDIO.wav()), 'base64'),
    );
    encoder = startEncoder(out, wavPath, from, draft, crf);
    const {ff, done} = encoder;

    // Workers take the next frame as they free up; frames are written to
    // ffmpeg strictly in order as soon as each next one is ready.
    const frames = new Map();
    const started = Date.now();
    let next = from;
    let written = from;
    let writing = false;
    const write = async () => {
      if (writing) return;
      writing = true;
      while (frames.has(written)) {
        const png = frames.get(written);
        frames.delete(written++);
        if (!ff.stdin.write(png)) {
          await new Promise((resolve) => ff.stdin.once('drain', resolve));
        }
        progress(written - from, to - from, Date.now() - started);
      }
      writing = false;
    };
    let failed = null;
    const rendering = Promise.all(
      pages.map(async ({page, client}) => {
        while (next < to && failed == null) {
          const i = next++;
          while (i - written > AHEAD && failed == null) {
            await new Promise((resolve) => setTimeout(resolve, 5));
          }
          await page.evaluate(([i, K]) => SR.renderFrame(i, K), [i, K]);
          const {data} = await client.send('Page.captureScreenshot', CAPTURE);
          frames.set(i, Buffer.from(data, 'base64'));
          await write();
        }
      }),
    );
    // Whichever fails first stops the other.
    done.catch((error) => (failed = error));
    await Promise.race([done.then(() => rendering), rendering]);
    if (failed) throw failed;
    ff.stdin.end();
    await done;
  } finally {
    encoder?.ff.kill();
    await Promise.all(pages.map(({browser}) => browser.close()));
    rmSync(tmp, {recursive: true, force: true});
  }
};

if (process.argv[1] == fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ?? join(dir, 'tinybase-showreel.mp4');
  const draft = !!process.env.DRAFT;
  await renderShowreel(out, {
    draft,
    K: +(process.env.K ?? (draft ? 2 : 16)),
    workers: +(process.env.WORKERS ?? 4),
    from: +(process.env.FROM ?? 0),
    to: +(process.env.TO ?? 15 * FPS),
    progress: (done, total, ms) => {
      if (done % 60 == 0 || done == total) {
        const fps = (done / (ms / 1000)).toFixed(1);
        process.stdout.write(`\r${done}/${total} frames, ${fps} fps   `);
      }
    },
  });
  console.log(`\nWrote ${out}`);
}
