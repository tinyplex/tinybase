import {
  expectNoFramedElement,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('drawing', async () => {
  await expectPage(`/demos/drawing`);
  await expectedElement('h1', 'Drawing');
  await expectedFramedElement('#toolbar');
  await expectedFramedElement('#canvas');
  await expectedFramedElement('#sidebar');

  let style;
  style = await (await expectedFramedElement('.shape')).getProperty('style');
  expect(await (await style.getProperty('left')).jsonValue()).toEqual('100px');
  expect(await (await style.getProperty('top')).jsonValue()).toEqual('100px');
  expect(await (await style.getProperty('width')).jsonValue()).toEqual('200px');
  expect(await (await style.getProperty('height')).jsonValue()).toEqual(
    '100px',
  );

  await (await expectedFramedElement('.shape', 'text')).click({clickCount: 2});
  await (await expectedFramedElement('.shape input')).type('42');
  await (await expectedFramedElement('#canvas')).click();
  await expectedFramedElement('.shape', 'text42');

  await expectNoFramedElement('.grip');
  await (await expectedFramedElement('.shape', 'text')).click();
  const {x: gripX, y: gripY} = (await (
    await expectedFramedElement('.grip')
  ).boundingBox()) ?? {x: 0, y: 0};

  await page.mouse.move(gripX, gripY);
  await page.mouse.down();
  await page.mouse.move(gripX + 10, gripY + 20);
  await page.mouse.up();
  style = await (await expectedFramedElement('.shape')).getProperty('style');
  expect(await (await style.getProperty('left')).jsonValue()).toEqual('110px');
  expect(await (await style.getProperty('top')).jsonValue()).toEqual('120px');
  expect(await (await style.getProperty('width')).jsonValue()).toEqual('190px');
  expect(await (await style.getProperty('height')).jsonValue()).toEqual('80px');

  await page.mouse.move(gripX + 20, gripY + 30);
  await page.mouse.down();
  await page.mouse.move(gripX + 10, gripY + 10);
  await page.mouse.up();
  style = await (await expectedFramedElement('.shape')).getProperty('style');
  expect(await (await style.getProperty('left')).jsonValue()).toEqual('100px');
  expect(await (await style.getProperty('top')).jsonValue()).toEqual('100px');
  expect(await (await style.getProperty('width')).jsonValue()).toEqual('190px');
  expect(await (await style.getProperty('height')).jsonValue()).toEqual('80px');
});
