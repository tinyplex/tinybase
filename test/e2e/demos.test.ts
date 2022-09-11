import {
  expectNoFramedElement,
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from './common';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

describe('hello-world', () => {
  test('hello-world-v1', async () => {
    await expectPage(`/demos/hello-world/hello-world-v1/`);
    await expectedElement('h1', 'Hello World v1');
    await expectedFramedElement('body', 'Hello World');
  });

  test('hello-world-v2', async () => {
    await expectPage(`/demos/hello-world/hello-world-v2/`);
    await expectedElement('h1', 'Hello World v2');
    await expectedFramedElement(
      'body',
      new Date(new Date().getTime() + 1000).toLocaleTimeString(),
    );
  });

  test('hello-world-v3', async () => {
    await expectPage(`/demos/hello-world/hello-world-v3/`);
    await expectedElement('h1', 'Hello World v3');
    await expectedFramedElement(
      'body',
      new Date(new Date().getTime() + 1000).toLocaleTimeString(),
    );
  });
});

describe('rolling-dice', () => {
  test('averaging-dice-rolls', async () => {
    await expectPage(`/demos/rolling-dice/averaging-dice-rolls/`);
    await expectedElement('h1', 'Averaging Dice Rolls');
    await expectedFramedElement('body', /Count/);
    await expectedFramedElement('.roll');
  });

  test('grouping-dice-rolls', async () => {
    await expectPage(`/demos/rolling-dice/grouping-dice-rolls/`);
    await expectedFramedElement('.rolls .roll');
  });
});

test('countries', async () => {
  await expectPage(`/demos/countries`);
  await expectedElement('h1', 'Countries');
  await (await expectedFramedElement('.filter', '★8')).click();
  await expectedFramedElement('#countries .country', 'United Kingdom');
  await expectNoFramedElement('#countries .country', 'Bahamas');
  await (await expectedFramedElement('#countries .country .star', '★')).click();
  await expectedFramedElement('.filter', '★7');
  await expectNoFramedElement('#countries .country', 'United Kingdom');
  const b = await expectedFramedElement('.filter', 'B21');
  await expectProperty(b, 'className', 'filter');
  await b.click();
  await expectProperty(b, 'className', 'filter current');
  await expectedFramedElement('#countries .country', 'Bahamas');
  await (await expectedFramedElement('#countries .country .star', '☆')).click();
  await (await expectedFramedElement('.filter', '★8')).click();
  await expectedFramedElement('#countries .country', 'Bahamas');
  await page.reload();
  await expectedFramedElement('#countries .country', 'Bahamas');
});

describe('todo-app', () => {
  test('todo-app-v1', async () => {
    await expectPage(`/demos/todo-app/todo-app-v1-the-basics`);
    await expectedElement('h1', 'Todo App v1 (the basics)');
    const text = await expectedFramedElement('.todo .text', 'Clean the floor');
    await expectProperty(text, 'className', 'text');
    await text.click();
    await expectProperty(text, 'className', 'text done');
    await (await expectedFramedElement('#newTodo')).type('New Todo\n');
    await expectedFramedElement('.todo .text', 'New Todo');
    await text.click();
    await expectProperty(text, 'className', 'text');
  });

  test('todo-app-v2', async () => {
    await expectPage(`/demos/todo-app/todo-app-v2-indexes`);
    await expectedElement('h1', 'Todo App v2 (indexes)');
    await (await expectedFramedElement('.todo .type', 'Home')).select('Work');
    await expectNoFramedElement('.todo');
    const tab = await expectedFramedElement('#types .type', 'Work');
    await expectProperty(tab, 'className', 'type');
    await tab.click();
    await expectProperty(tab, 'className', 'type current');
    await expectedFramedElement('.todo .text', 'Install TinyBase');
    await expectedFramedElement('.todo .text', 'Clean the floor');
    await (await expectedFramedElement('#newTodo')).type('New Todo\n');
    await expectedFramedElement('.todo .text', 'New Todo');
  });

  test('todo-app-v3', async () => {
    await expectPage(`/demos/todo-app/todo-app-v3-persistence`);
    await expectedElement('h1', 'Todo App v3 (persistence)');
    await expectedFramedElement('#types .type', 'Home');
    await expectedFramedElement('#types .type', 'Work');
    await expectedFramedElement('#types .type', 'Archived');
    await (await expectedFramedElement('.todo .type', 'Home')).select('Work');
    await expectNoFramedElement('.todo');
    await page.reload();
    await expectNoFramedElement('.todo');
    await (await expectedFramedElement('#types .type', 'Work')).click();
    await (
      await expectedFramedElement('.todo .text', 'Clean the floor')
    ).click();
    await page.evaluate('localStorage.clear();sessionStorage.clear();');
  });

  test('todo-app-v4', async () => {
    await expectPage(`/demos/todo-app/todo-app-v4-metrics`);
    await expectedElement('h1', 'Todo App v4 (metrics)');
    await expectedFramedElement('body', 'Todo: 3');
    await expectedFramedElement('#types .type', 'Home (1)');
    await expectedFramedElement('#types .type', 'Work (1)');
    await expectedFramedElement('#types .type', 'Archived (1)');
    await (await expectedFramedElement('.todo .type', 'Home')).select('Work');
    await expectNoFramedElement('.todo');
    await page.reload();
    await expectNoFramedElement('.todo');
    await expectedFramedElement('#types .type', 'Home');
    await expectedFramedElement('#types .type', 'Work (2)');
    await expectedFramedElement('#types .type', 'Archived (1)');
    await (await expectedFramedElement('#types .type', 'Work (2)')).click();
    await (
      await expectedFramedElement('.todo .text', 'Clean the floor')
    ).click();
    await expectedFramedElement('#types .type', 'Work (1)');
    await expectedFramedElement('body', 'Todo: 2');
    await page.evaluate('localStorage.clear();sessionStorage.clear();');
  });

  test('todo-app-v5', async () => {
    await expectPage(`/demos/todo-app/todo-app-v5-checkpoints`);
    await expectedElement('h1', 'Todo App v5 (checkpoints)');
    await expectNoFramedElement('.todo .text', 'New Todo');
    await expectedFramedElement('#types .type', 'Home (1)');
    await (await expectedFramedElement('#newTodo')).type('New Todo\n');
    await expectedFramedElement('.todo .text', 'New Todo');
    await expectedFramedElement('#types .type', 'Home (2)');
    await (await expectedFramedElement('#undo', `adding 'New Todo'`)).click();
    await expectNoFramedElement('.todo .text', 'New Todo');
    await expectedFramedElement('#types .type', 'Home (1)');
    await (await expectedFramedElement('#redo', `adding 'New Todo'`)).click();
    await expectedFramedElement('.todo .text', 'New Todo');
    await expectedFramedElement('#types .type', 'Home (2)');
    await (await expectedFramedElement('#newTodo')).type('New Todo 2\n');
    await expectedFramedElement('.todo .text', 'New Todo');
    await expectedFramedElement('.todo .text', 'New Todo 2');
    await expectedFramedElement('#types .type', 'Home (3)');
    await (await expectedFramedElement('#undo', `adding 'New Todo 2'`)).click();
    await expectedFramedElement('.todo .text', 'New Todo');
    await expectNoFramedElement('.todo .text', 'New Todo 2');
    await expectedFramedElement('#types .type', 'Home (2)');
    await expectedFramedElement('#undo', `adding 'New Todo'`);
    await expectedFramedElement('#redo', `adding 'New Todo 2'`);
    await page.evaluate('localStorage.clear();sessionStorage.clear();');
  });
});

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
