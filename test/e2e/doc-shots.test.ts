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
const FRAMED_DOC_SHOT_MIN_HEIGHT = 10_000;
const DOC_SHOT_VIEWPORT = {width: 1440, height: 2400};

const prepareFirstFrame = async (
  page: Page,
): Promise<void> => {
  const iframe = page.locator('iframe').first();
  await expect(iframe).toBeVisible();
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  if (frame == null) {
    return;
  }
  await frame.waitForLoadState();
  const {height, width} = await frame.evaluate(() => {
    const {documentElement, body} = document;
    return {
      height: Math.max(
        documentElement.clientHeight,
        documentElement.scrollHeight,
        body?.scrollHeight ?? 0,
      ),
      width: Math.max(
        documentElement.clientWidth,
        documentElement.scrollWidth,
        body?.scrollWidth ?? 0,
      ),
    };
  });
  await iframe.evaluate((element, {height, width}) => {
    element.style.height = `${height}px`;
    element.style.maxHeight = 'none';
    element.style.width = `${width}px`;
    element.style.maxWidth = 'none';
    element.style.border = '0';
    element.style.outline = '0';
    element.style.boxShadow = 'none';
    element.style.overflow = 'hidden';
  }, {
    height: Math.max(height, FRAMED_DOC_SHOT_MIN_HEIGHT),
    width,
  });
};

const getClip = async (
  page: Page,
  locator: Locator,
  marginRem?: number,
  frameLocator?: Locator,
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
  const frameBox = await frameLocator?.boundingBox();
  const documentBounds =
    frameBox == null
      ? await page.evaluate(() => {
          const {documentElement, body} = document;
          return {
            height: Math.max(
              documentElement.clientHeight,
              documentElement.scrollHeight,
              body?.scrollHeight ?? 0,
            ),
            width: Math.max(
              documentElement.clientWidth,
              documentElement.scrollWidth,
              body?.scrollWidth ?? 0,
            ),
            x: 0,
            y: 0,
          };
        })
      : {
          height: frameBox.height - 3,
          width: frameBox.width - 2,
          x: frameBox.x + 1,
          y: frameBox.y + 1,
        };
  const left = Math.round(Math.max(box.x - margin, 0) * deviceScaleFactor);
  const top = Math.round(Math.max(box.y - margin, 0) * deviceScaleFactor);
  const right = Math.round(
    Math.min(
      box.x + box.width + margin,
      documentBounds.x + documentBounds.width,
    ) * deviceScaleFactor,
  );
  const bottom = Math.round(
    Math.min(
      box.y + box.height + margin,
      documentBounds.y + documentBounds.height,
    ) * deviceScaleFactor,
  );
  const clippedLeft = Math.round(
    Math.max(left / deviceScaleFactor, documentBounds.x) * deviceScaleFactor,
  );
  const clippedTop = Math.round(
    Math.max(top / deviceScaleFactor, documentBounds.y) * deviceScaleFactor,
  );
  return {
    x: clippedLeft / deviceScaleFactor,
    y: clippedTop / deviceScaleFactor,
    width: (right - clippedLeft) / deviceScaleFactor,
    height: (bottom - clippedTop) / deviceScaleFactor,
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

  const frameLocator = shot.framed ? page.locator('iframe').first() : undefined;

  if (shot.framed) {
    await prepareFirstFrame(page);
  }

  const locator = shot.framed
    ? await expectedFramedElement(page, shot.selector)
    : await expectedElement(page, shot.selector);
  const clip = await getClip(page, locator, shot.marginRem, frameLocator);

  if (shot.framed) {
    // Keep the framed capture path aligned with the known-good one-off flow:
    // a full-page render here stabilizes the later clipped screenshot.
    await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      omitBackground: shot.omitBackground,
      scale: 'device',
      style: shot.style,
    });
  }

  const normalizedScreenshot = await page.screenshot({
    animations: 'disabled',
    caret: 'hide',
    clip,
    omitBackground: shot.omitBackground,
    scale: 'device',
    style: shot.style,
  });
  const snapshotPath = test.info().snapshotPath(...shot.asset.split('/'));

  if (process.env.UPDATE_DOC_SHOTS == '1') {
    mkdirSync(dirname(snapshotPath), {recursive: true});
    writeFileSync(snapshotPath, normalizedScreenshot);
  }

  expect(normalizedScreenshot).toMatchSnapshot(shot.asset.split('/'));
};

const {afterAll, beforeAll, describe} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8812);
const docShotEntries = [...docShots.entries()].sort(([a], [b]) =>
  a.localeCompare(b),
);

beforeAll(startServer);
afterAll(stopServer);
test.use({deviceScaleFactor: 2});
test.use({viewport: DOC_SHOT_VIEWPORT});

describe('doc-shots', () => {
  docShotEntries.forEach(([asset, {page: shotPage}]) => {
    test(asset, async ({page}) => {
      await expectPage(page, shotPage);
      await expectDocShot(page, asset);
    });
  });
});
