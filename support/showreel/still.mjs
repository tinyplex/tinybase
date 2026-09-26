// Dev tool: renders stills or a contact sheet of the showreel for review.
//
//   node support/showreel/still.mjs out.png 1.2 3.4      (one PNG per time)
//   node support/showreel/still.mjs sheet.png 0:2:0.1    (contact sheet)
import {writeFileSync} from 'fs';
import {dirname, join} from 'path';
import {chromium} from 'playwright';
import {fileURLToPath} from 'url';
import {buildAssets} from './build-assets.mjs';

const dir = dirname(fileURLToPath(import.meta.url));
const [out, ...specs] = process.argv.slice(2);
const K = +(process.env.K ?? 1);
const COLS = +(process.env.COLS ?? 4);
const CW = +(process.env.CW ?? 480);

buildAssets();
const browser = await chromium.launch({
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('file://' + join(dir, 'showreel.html') + '?render');
await page.waitForFunction(() => window.READY, null, {timeout: 60000});

const times = specs.flatMap((s) => {
  if (!s.includes(':')) return [+s];
  const [a, b, step] = s.split(':').map(Number);
  const ts = [];
  for (let t = a; t <= b + 1e-9; t += step) ts.push(+t.toFixed(4));
  return ts;
});

if (specs.length == 1 && !specs[0].includes(':')) {
  await page.evaluate(([t, K]) => SR.renderTime(t, K), [times[0], K]);
  await page.locator('#out').screenshot({path: out});
} else if (specs.some((s) => s.includes(':')) || times.length > 1) {
  const url = await page.evaluate(
    ([times, cols, cw, K]) => SR.sheet(times, cols, cw, K),
    [times, COLS, CW, K],
  );
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
console.log('Wrote', out);
