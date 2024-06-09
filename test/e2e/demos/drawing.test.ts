import {
  expectNoFramedElement,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

const getCanvasOffset = async () => {
  const {x = 0, y = 0} =
    (await (await expectedFramedElement('#canvas')).boundingBox()) ?? {};
  return {x, y};
};

test('drawing', async () => {
  let offset;

  await expectPage(`/demos/drawing`);
  await expectedElement('h1', 'Drawing');
  await expectedFramedElement('#toolbar');
  await expectedFramedElement('#sidebar');

  offset = await getCanvasOffset();
  expect(await (await expectedFramedElement('.shape')).boundingBox()).toEqual({
    x: offset.x + 100,
    y: offset.y + 100,
    width: 200,
    height: 100,
  });

  await (await expectedFramedElement('.shape', 'text')).click({clickCount: 2});
  await (await expectedFramedElement('.shape input')).type('42');
  await (await expectedFramedElement('#canvas')).click();
  await expectedFramedElement('.shape', 'text42');

  await expectNoFramedElement('.grip');
  await (await expectedFramedElement('.shape', 'text')).click();

  const {x: gripX = 0, y: gripY = 0} =
    (await (await expectedFramedElement('.grip')).boundingBox()) ?? {};

  await page.mouse.move(gripX, gripY);
  await page.mouse.down();
  await page.mouse.move(gripX + 10, gripY + 20);
  await page.mouse.up();

  offset = await getCanvasOffset();
  expect(await (await expectedFramedElement('.shape')).boundingBox()).toEqual({
    x: offset.x + 110,
    y: offset.y + 120,
    width: 190,
    height: 80,
  });

  await page.mouse.move(gripX + 20, gripY + 30);
  await page.mouse.down();
  await page.mouse.move(gripX + 10, gripY + 10);
  await page.mouse.up();

  offset = await getCanvasOffset();
  expect(await (await expectedFramedElement('.shape')).boundingBox()).toEqual({
    x: offset.x + 100,
    y: offset.y + 100,
    width: 190,
    height: 80,
  });
});
