import {test} from '@playwright/test';
import {
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8805);

beforeAll(startServer);
afterAll(stopServer);

test('hello-world-v1', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-v1/`);
  await expectedElement(page, 'h1', 'Hello World v1');
  await expectedFramedElement(page, 'body', 'Hello World');
});

test('hello-world-v2', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-v2/`);
  await expectedElement(page, 'h1', 'Hello World v2');
  await expectedFramedElement(page, 'body', 'Hello World');
});

test('hello-world-v3', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-v3/`);
  await expectedElement(page, 'h1', 'Hello World v3');
  await expectedFramedElement(
    page,
    'body',
    new Date(new Date().getTime() + 1000).toLocaleTimeString(),
  );
});

test('hello-world-v4', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-v4/`);
  await expectedElement(page, 'h1', 'Hello World v4');
  await expectedFramedElement(
    page,
    'body',
    new Date(new Date().getTime() + 1000).toLocaleTimeString(),
  );
});
