import {Page, expect, test} from '@playwright/test';
import {
  expectNoFramedElement,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8804);

beforeAll(startServer);
afterAll(stopServer);

const getCanvasOffset = async (page: Page) => {
  const {x = 0, y = 0} =
    (await (await expectedFramedElement(page, '#canvas')).boundingBox()) ?? {};
  return {x, y};
};

test('drawing', async ({page}) => {
  let offset;

  await expectPage(page, `/demos/drawing`);
  await expectedElement(page, 'h1', 'Drawing');
  await expectedFramedElement(page, '#toolbar');
  await expectedFramedElement(page, '#sidebar');

  offset = await getCanvasOffset(page);
  expect(
    await (await expectedFramedElement(page, '.shape')).boundingBox(),
  ).toEqual({
    x: offset.x + 100,
    y: offset.y + 100,
    width: 200,
    height: 100,
  });

  await (
    await expectedFramedElement(page, '.shape', 'text')
  ).click({clickCount: 2});
  await (await expectedFramedElement(page, '.shape input')).type('42');
  await (await expectedFramedElement(page, '#canvas')).click();
  await expectedFramedElement(page, '.shape', 'text42');

  await expectNoFramedElement(page, '.grip');
  await (await expectedFramedElement(page, '.shape', 'text')).click();

  const {x: gripX = 0, y: gripY = 0} =
    (await (await expectedFramedElement(page, '.grip')).boundingBox()) ?? {};

  await page.mouse.move(gripX, gripY);
  await page.mouse.down();
  await page.mouse.move(gripX + 10, gripY + 20);
  await page.mouse.up();

  offset = await getCanvasOffset(page);
  expect(
    await (await expectedFramedElement(page, '.shape')).boundingBox(),
  ).toEqual({
    x: offset.x + 110,
    y: offset.y + 120,
    width: 190,
    height: 80,
  });

  await page.mouse.move(gripX + 20, gripY + 30);
  await page.mouse.down();
  await page.mouse.move(gripX + 10, gripY + 10);
  await page.mouse.up();

  offset = await getCanvasOffset(page);
  expect(
    await (await expectedFramedElement(page, '.shape')).boundingBox(),
  ).toEqual({
    x: offset.x + 100,
    y: offset.y + 100,
    width: 190,
    height: 80,
  });
});
