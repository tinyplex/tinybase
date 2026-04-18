import {expect, Frame, Locator, Page, test} from '@playwright/test';
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

const getFirstFrame = async (page: Page): Promise<Frame | undefined> => {
  const handle = await page.locator('iframe').first().elementHandle();
  return (await handle?.contentFrame()) ?? undefined;
};

const prepareFirstFrame = async (page: Page): Promise<void> => {
  const iframe = page.locator('iframe').first();
  await expect(iframe).toBeVisible();
  const frame = await getFirstFrame(page);
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
  await iframe.evaluate(
    (element, {height, width}) => {
      element.style.height = `${height}px`;
      element.style.maxHeight = 'none';
      element.style.width = `${width}px`;
      element.style.maxWidth = 'none';
      element.style.border = '0';
      element.style.outline = '0';
      element.style.boxShadow = 'none';
      element.style.overflow = 'hidden';
    },
    {height: Math.max(height, FRAMED_DOC_SHOT_MIN_HEIGHT), width},
  );
};

const applyDocShotStyle = async (
  page: Page,
  shot: {framed: boolean; style?: string},
): Promise<void> => {
  if (shot.style == null) {
    return;
  }
  if (shot.framed) {
    const frame = await getFirstFrame(page);
    await frame?.addStyleTag({content: shot.style});
  } else {
    await page.addStyleTag({content: shot.style});
  }
};

const performDocShotClicks = async (
  page: Page,
  shot: {clicks?: string[]; framed: boolean},
): Promise<void> => {
  for (const selector of shot.clicks ?? []) {
    const locator = shot.framed
      ? page.frameLocator('iframe').first().locator(selector).first()
      : page.locator(selector).first();
    await locator.waitFor();
    await locator.click();
  }
};

const waitForDocShotReady = async (
  page: Page,
  shot: {
    readySelector?: string;
    readyText?: string | RegExp;
    readyTimeout?: number;
  },
): Promise<void> => {
  if (shot.readySelector == null) {
    return;
  }
  await expectedFramedElement(
    page,
    shot.readySelector,
    shot.readyText,
    shot.readyTimeout,
  );
};

const stabilizeDocShot = async (
  page: Page,
  shot: {fixedText?: string; fixedTextSelector?: string},
): Promise<void> => {
  if (shot.fixedText == null || shot.fixedTextSelector == null) {
    return;
  }
  const frame = await getFirstFrame(page);
  await frame?.evaluate(
    ({selector, text}) => {
      const maxTimerId = window.setTimeout(() => {}, 0);
      for (let id = 0; id <= maxTimerId; id++) {
        clearInterval(id);
        clearTimeout(id);
      }
      const element = document.querySelector<HTMLElement>(selector);
      if (element != null) {
        element.textContent = text;
      }
    },
    {selector: shot.fixedTextSelector, text: shot.fixedText},
  );
};

const waitForDocShotImages = async (
  page: Page,
  shot: {waitForImages?: string},
): Promise<void> => {
  if (shot.waitForImages == null) {
    return;
  }
  const frame = await getFirstFrame(page);
  await frame?.evaluate(async (selector) => {
    const images = [
      ...document.querySelectorAll<HTMLImageElement>(selector),
    ].filter(({src}) => src != '');
    await Promise.all(
      images.map((image) =>
        image.complete
          ? undefined
          : new Promise<void>((resolve) => {
              const done = () => resolve();
              image.addEventListener('load', done, {once: true});
              image.addEventListener('error', done, {once: true});
            }),
      ),
    );
  }, shot.waitForImages);
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

  await applyDocShotStyle(page, shot);
  await waitForDocShotReady(page, shot);
  await waitForDocShotImages(page, shot);
  await performDocShotClicks(page, shot);
  await stabilizeDocShot(page, shot);

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
