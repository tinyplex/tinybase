import {expect, Locator, Page, test} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'fs';
import {dirname} from 'path';
import {
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from './common.ts';
import {getDocShotMap} from './doc-shots.ts';

const normalizePath = (path: string): string => path.replace(/\/+$/, '') || '/';

const getClip = async (
  page: Page,
  locator: Locator,
  marginRem?: number,
): Promise<{x: number; y: number; width: number; height: number}> => {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('Unable to determine doc shot bounds');
  }
  const margin =
    (marginRem ?? 0) *
    (await locator.evaluate((element) =>
      parseFloat(
        getComputedStyle(element.ownerDocument.documentElement).fontSize,
      ),
    ));
  const deviceScaleFactor = await page.evaluate(() => window.devicePixelRatio);
  const viewport = page.viewportSize();
  const left = Math.round(Math.max(box.x - margin, 0) * deviceScaleFactor);
  const top = Math.round(Math.max(box.y - margin, 0) * deviceScaleFactor);
  const right = Math.round(
    Math.min(box.x + box.width + margin, viewport?.width ?? Infinity) *
      deviceScaleFactor,
  );
  const bottom = Math.round(
    Math.min(box.y + box.height + margin, viewport?.height ?? Infinity) *
      deviceScaleFactor,
  );
  return {
    x: left / deviceScaleFactor,
    y: top / deviceScaleFactor,
    width: (right - left) / deviceScaleFactor,
    height: (bottom - top) / deviceScaleFactor,
  };
};
const docShots = getDocShotMap();

const expectDocShot = async (page: Page, asset: string): Promise<void> => {
  const shot = docShots.get(asset);
  if (shot == null) {
    throw new Error(`No doc shot metadata found for ${asset}`);
  }

  expect(normalizePath(new URL(page.url()).pathname)).toEqual(
    normalizePath(shot.page),
  );

  const locator = shot.framed
    ? await expectedFramedElement(page, shot.selector)
    : await expectedElement(page, shot.selector);

  const screenshot = await page.screenshot({
    animations: 'disabled',
    caret: 'hide',
    clip: await getClip(page, locator, shot.marginRem),
    omitBackground: shot.omitBackground,
    scale: 'device',
    style: shot.style,
  });
  const snapshotPath = test.info().snapshotPath(...shot.asset.split('/'));

  if (process.env.UPDATE_DOC_SHOTS == '1') {
    mkdirSync(dirname(snapshotPath), {recursive: true});
    writeFileSync(snapshotPath, screenshot);
  }

  expect(screenshot).toMatchSnapshot(shot.asset.split('/'));
};

const {afterAll, beforeAll, describe} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8812);
const docShotEntries = [...docShots.entries()].sort(([a], [b]) =>
  a.localeCompare(b),
);

beforeAll(startServer);
afterAll(stopServer);
test.use({deviceScaleFactor: 2});

describe('doc-shots', () => {
  docShotEntries.forEach(([asset, {page: shotPage}]) => {
    test(asset, async ({page}) => {
      await expectPage(page, shotPage);
      await expectDocShot(page, asset);
    });
  });
});
