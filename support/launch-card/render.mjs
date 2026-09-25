// Renders launch-card.html to a 1600x900 PNG alongside it, using the
// Playwright Chromium that the E2E tests already install.
import {dirname, join} from 'path';
import {chromium} from 'playwright';
import {fileURLToPath} from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1600, height: 900}});
await page.goto('file://' + join(dir, 'launch-card.html'));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({path: join(dir, 'launch-card.png')});
await browser.close();
