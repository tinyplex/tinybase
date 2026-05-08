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
  await expectPage(page, `/demos/hello-world/hello-world-vanilla/`);
  await expectedElement(page, 'h1', 'Hello World (Vanilla)');
  await expectedFramedElement(page, 'body', 'Hello World');
});

test('hello-world-v2', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-vanilla-v2/`);
  await expectedElement(page, 'h1', 'Hello World (Vanilla) v2');
  await expectedFramedElement(page, 'body', 'Hello World');
});

test('hello-world-v3', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-vanilla-v3/`);
  await expectedElement(page, 'h1', 'Hello World (Vanilla) v3');
  await expectedFramedElement(
    page,
    'body',
    new Date(new Date().getTime() + 1000).toLocaleTimeString(),
  );
});

test('hello-world-react', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-react/`);
  await expectedElement(page, 'h1', 'Hello World (React)');
  await expectedFramedElement(
    page,
    'body',
    new Date(new Date().getTime() + 1000).toLocaleTimeString(),
  );
});

test('hello-world-solid', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-solid/`);
  await expectedElement(page, 'h1', 'Hello World (Solid)');
  await expectedFramedElement(
    page,
    'body',
    new Date(new Date().getTime() + 1000).toLocaleTimeString(),
  );
});

test('hello-world-svelte', async ({page}) => {
  await expectPage(page, `/demos/hello-world/hello-world-svelte/`);
  await expectedElement(page, 'h1', 'Hello World (Svelte)');
  await expectedFramedElement(
    page,
    'body',
    new Date(new Date().getTime() + 1000).toLocaleTimeString(),
  );
});
