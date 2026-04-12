import {expect, Page, test} from '@playwright/test';
import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {getServerFunctions} from './common.ts';

type DocShot = {
  asset: string;
  framed: boolean;
  path: string;
  selector: string;
};

const DOC_SHOT_JSDOC_IMAGES =
  /@images\b([\s\S]*?)(?=\n\s*\*\s*\n|\n\s*\*\s*@[a-z]|\n\s*\*\/)/g;
const DOC_SHOT_PATHS = [['src/@types', '.js']] as const;

let docShots: Map<string, DocShot> | undefined;

const forEachDeepFile = (
  dir: string,
  extension: string,
  callback: (filePath: string) => void,
) =>
  readdirSync(dir, {withFileTypes: true}).forEach((entry) => {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      forEachDeepFile(path, extension, callback);
    } else if (path.endsWith(extension)) {
      callback(path);
    }
  });

const getDocShotOptions = (tag: string): {[key: string]: any} => {
  const parsed = JSON.parse(tag.replaceAll(/\n\s+\*\s?/g, '\n').trim());
  return Array.isArray(parsed) ? parsed : [parsed];
};

const getDocShot = (
  asset: string,
  framed: boolean,
  path: string,
  selector: string,
): DocShot => {
  if (!asset.startsWith('shots/')) {
    throw new Error(`Doc shot assets must live under shots/: ${asset}`);
  }
  return {asset, framed, path, selector};
};

const setDocShot = (shot: DocShot): void => {
  if (docShots!.has(shot.asset)) {
    throw new Error(`Duplicate doc shot asset: ${shot.asset}`);
  }
  docShots!.set(shot.asset, shot);
};

const normalizePath = (path: string): string => path.replace(/\/+$/, '') || '/';

const getDocShots = (): Map<string, DocShot> => {
  if (docShots == null) {
    docShots = new Map();
    DOC_SHOT_PATHS.forEach(([dir, extension]) =>
      forEachDeepFile(dir, extension, (filePath) => {
        const file = readFileSync(filePath, 'utf-8');
        [...file.matchAll(DOC_SHOT_JSDOC_IMAGES)].forEach(([, tag = '']) =>
          getDocShotOptions(tag).forEach(({framed, path, selector, src}) => {
            if (src == null || path == null || selector == null) {
              return;
            }

            setDocShot(
              getDocShot(
                src.replace(/^\//, ''),
                framed === true,
                path,
                selector,
              ),
            );
          }),
        );
      }),
    );
  }
  return docShots;
};

const expectDocShot = async (page: Page, asset: string): Promise<void> => {
  const shot = getDocShots().get(asset);
  if (shot == null) {
    throw new Error(`No doc shot metadata found for ${asset}`);
  }

  expect(normalizePath(new URL(page.url()).pathname)).toEqual(
    normalizePath(shot.path),
  );

  const locator = shot.framed
    ? page.frameLocator('iframe').first().locator(shot.selector).first()
    : page.locator(shot.selector).first();
  await expect(locator).toBeVisible();

  const screenshot = await locator.screenshot({
    animations: 'disabled',
    caret: 'hide',
  });
  const assetPath = resolve('site/extras', shot.asset);

  if (process.env.UPDATE_DOC_SHOTS == '1') {
    mkdirSync(dirname(assetPath), {recursive: true});
    writeFileSync(assetPath, screenshot);
  }

  expect(screenshot).toEqual(readFileSync(assetPath));
};

const {afterAll, beforeAll, describe} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8812);
const docShotEntries = [...getDocShots().entries()].sort(([a], [b]) =>
  a.localeCompare(b),
);

beforeAll(startServer);
afterAll(stopServer);

describe('doc-shots', () => {
  docShotEntries.forEach(([asset, {path}]) => {
    test(asset, async ({page}) => {
      await expectPage(page, path);
      await expectDocShot(page, asset);
    });
  });
});
