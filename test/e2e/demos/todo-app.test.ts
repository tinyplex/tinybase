import {test} from '@playwright/test';
import {
  expectNoFramedElement,
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8808);

beforeAll(startServer);
afterAll(stopServer);

test('todo-app-v1', async ({page}) => {
  await expectPage(page, `/demos/todo-app/todo-app-v1-the-basics`);
  await expectedElement(page, 'h1', 'Todo App v1 (the basics)');
  const text = await expectedFramedElement(
    page,
    '.todo .text',
    'Clean the floor',
  );
  await expectProperty(text, 'className', 'text');
  await text.click();
  await expectProperty(text, 'className', 'text done');
  await (await expectedFramedElement(page, '#newTodo')).type('New Todo\n');
  await expectedFramedElement(page, '.todo .text', 'New Todo');
  await text.click();
  await expectProperty(text, 'className', 'text');
});

test('todo-app-v2', async ({page}) => {
  await expectPage(page, `/demos/todo-app/todo-app-v2-indexes`);
  await expectedElement(page, 'h1', 'Todo App v2 (indexes)');
  await (
    await expectedFramedElement(page, '.todo .type', 'Home')
  ).selectOption('Work');
  await expectNoFramedElement(page, '.todo');
  const tab = await expectedFramedElement(page, '#types .type', 'Work');
  await expectProperty(tab, 'className', 'type');
  await tab.click();
  await expectProperty(tab, 'className', 'type current');
  await expectedFramedElement(page, '.todo .text', 'Install TinyBase');
  await expectedFramedElement(page, '.todo .text', 'Clean the floor');
  await (await expectedFramedElement(page, '#newTodo')).type('New Todo\n');
  await expectedFramedElement(page, '.todo .text', 'New Todo');
});

test('todo-app-v3', async ({page}) => {
  await expectPage(page, `/demos/todo-app/todo-app-v3-persistence`);
  await expectedElement(page, 'h1', 'Todo App v3 (persistence)');
  await expectedFramedElement(page, '#types .type', 'Home');
  await expectedFramedElement(page, '#types .type', 'Work');
  await expectedFramedElement(page, '#types .type', 'Archived');
  await (
    await expectedFramedElement(page, '.todo .type', 'Home')
  ).selectOption('Work');
  await expectNoFramedElement(page, '.todo');
  await page.reload();
  await expectNoFramedElement(page, '.todo');
  await (await expectedFramedElement(page, '#types .type', 'Work')).click();
  await (
    await expectedFramedElement(page, '.todo .text', 'Clean the floor')
  ).click();
  await page.evaluate('localStorage.clear();sessionStorage.clear();');
});

test('todo-app-v4', async ({page}) => {
  await expectPage(page, `/demos/todo-app/todo-app-v4-metrics`);
  await expectedElement(page, 'h1', 'Todo App v4 (metrics)');
  await expectedFramedElement(page, 'body', 'Todo: 3');
  await expectedFramedElement(page, '#types .type', 'Home (1)');
  await expectedFramedElement(page, '#types .type', 'Work (1)');
  await expectedFramedElement(page, '#types .type', 'Archived (1)');
  await (
    await expectedFramedElement(page, '.todo .type', 'Home')
  ).selectOption('Work');
  await expectNoFramedElement(page, '.todo');
  await page.reload();
  await expectNoFramedElement(page, '.todo');
  await expectedFramedElement(page, '#types .type', 'Home');
  await expectedFramedElement(page, '#types .type', 'Work (2)');
  await expectedFramedElement(page, '#types .type', 'Archived (1)');
  await (await expectedFramedElement(page, '#types .type', 'Work (2)')).click();
  await (
    await expectedFramedElement(page, '.todo .text', 'Clean the floor')
  ).click();
  await expectedFramedElement(page, '#types .type', 'Work (1)');
  await expectedFramedElement(page, 'body', 'Todo: 2');
  await page.evaluate('localStorage.clear();sessionStorage.clear();');
});

test('todo-app-v5', async ({page}) => {
  await expectPage(page, `/demos/todo-app/todo-app-v5-checkpoints`);
  await expectedElement(page, 'h1', 'Todo App v5 (checkpoints)');
  await expectNoFramedElement(page, '.todo .text', 'New Todo');
  await expectedFramedElement(page, '#types .type', 'Home (1)');
  await (await expectedFramedElement(page, '#newTodo')).type('New Todo\n');
  await expectedFramedElement(page, '.todo .text', 'New Todo');
  await expectedFramedElement(page, '#types .type', 'Home (2)');
  await (
    await expectedFramedElement(page, '#undo', `adding 'New Todo'`)
  ).click();
  await expectNoFramedElement(page, '.todo .text', 'New Todo');
  await expectedFramedElement(page, '#types .type', 'Home (1)');
  await (
    await expectedFramedElement(page, '#redo', `adding 'New Todo'`)
  ).click();
  await expectedFramedElement(page, '.todo .text', 'New Todo');
  await expectedFramedElement(page, '#types .type', 'Home (2)');
  await (await expectedFramedElement(page, '#newTodo')).type('New Todo 2\n');
  await expectedFramedElement(page, '.todo .text', 'New Todo');
  await expectedFramedElement(page, '.todo .text', 'New Todo 2');
  await expectedFramedElement(page, '#types .type', 'Home (3)');
  await (
    await expectedFramedElement(page, '#undo', `adding 'New Todo 2'`)
  ).click();
  await expectedFramedElement(page, '.todo .text', 'New Todo');
  await expectNoFramedElement(page, '.todo .text', 'New Todo 2');
  await expectedFramedElement(page, '#types .type', 'Home (2)');
});
