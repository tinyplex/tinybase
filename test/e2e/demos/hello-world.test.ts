import {
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('hello-world-v1', async () => {
  await expectPage(`/demos/hello-world/hello-world-v1/`);
  await expectedElement('h1', 'Hello World v1');
  await expectedFramedElement('body', 'Hello World');
});

test('hello-world-v2', async () => {
  await expectPage(`/demos/hello-world/hello-world-v2/`);
  await expectedElement('h1', 'Hello World v2');
  await expectedFramedElement('body', 'Hello World');
});

test('hello-world-v3', async () => {
  await expectPage(`/demos/hello-world/hello-world-v3/`);
  await expectedElement('h1', 'Hello World v3');
  await expectedFramedElement(
    'body',
    new Date(new Date().getTime() + 1000).toLocaleTimeString(),
  );
});

test('hello-world-v4', async () => {
  await expectPage(`/demos/hello-world/hello-world-v4/`);
  await expectedElement('h1', 'Hello World v4');
  await expectedFramedElement(
    'body',
    new Date(new Date().getTime() + 1000).toLocaleTimeString(),
  );
});
