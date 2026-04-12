import {expect, Page, test} from '@playwright/test';
import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from './common.ts';

type DocShot = {
  asset: string;
  framed: boolean;
  page: string;
  selector: string;
};

type DocShotOptions = {
  framed?: boolean;
  page?: string;
  selector?: string;
  src?: string;
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

const getDocShotOptions = (tag: string): DocShotOptions[] => {
  const parsed = JSON.parse(tag.replaceAll(/\n\s+\*\s?/g, '\n').trim());
  return Array.isArray(parsed) ? parsed : [parsed];
};

const getDocShot = (
  asset: string,
  framed: boolean,
  page: string,
  selector: string,
): DocShot => {
  return {asset, framed, page, selector};
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
          getDocShotOptions(tag).forEach(({framed, page, selector, src}) => {
            if (src == null || page == null || selector == null) {
              return;
            }

            setDocShot(
              getDocShot(
                src.replace(/^\//, ''),
                framed === true,
                page,
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
    normalizePath(shot.page),
  );

  const locator = shot.framed
    ? await expectedFramedElement(page, shot.selector)
    : await expectedElement(page, shot.selector);

  const screenshot = await locator.screenshot({
    animations: 'disabled',
    caret: 'hide',
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
const docShotEntries = [...getDocShots().entries()].sort(([a], [b]) =>
  a.localeCompare(b),
);

beforeAll(startServer);
afterAll(stopServer);

describe('doc-shots', () => {
  docShotEntries.forEach(([asset, {page: shotPage}]) => {
    test(asset, async ({page}) => {
      await expectPage(page, shotPage);
      await expectDocShot(page, asset);
    });
  });
});
