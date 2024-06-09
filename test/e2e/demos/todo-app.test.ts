import {
  expectNoFramedElement,
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

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
  await (await expectedFramedElement('.todo .text', 'Clean the floor')).click();
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
  await (await expectedFramedElement('.todo .text', 'Clean the floor')).click();
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
