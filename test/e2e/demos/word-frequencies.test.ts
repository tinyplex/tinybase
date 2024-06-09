import {
  expectNoFramedElement,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('word-frequencies', async () => {
  await expectPage(`/demos/word-frequencies`);
  await expectedElement('h1', 'Word Frequencies');
  await (await expectedFramedElement('input')).type('z');
  await expectedFramedElement('.result', 'zone');
  await expectedFramedElement('.result', 'zero');
  await expectedFramedElement('.result', 'zoo');
  await expectedFramedElement('.result', 'zip');
  await expectedFramedElement('.result', 'zoom');
  await expectedFramedElement('.result', 'zinc');
  await expectedFramedElement('.result', 'zeal');
  await expectedFramedElement('.result', 'zygote');
  await (await expectedFramedElement('input')).type('o');
  await expectedFramedElement('.result', 'zone');
  await expectNoFramedElement('.result', 'zero');
  await expectedFramedElement('.result', 'zoo');
  await expectNoFramedElement('.result', 'zip');
  await expectedFramedElement('.result', 'zoom');
  await expectNoFramedElement('.result', 'zinc');
  await expectNoFramedElement('.result', 'zeal');
  await expectNoFramedElement('.result', 'zygote');
  await (await expectedFramedElement('input')).type('n');
  await expectedFramedElement('.result', 'zone');
  await expectNoFramedElement('.result', 'zoo');
  await expectNoFramedElement('.result', 'zoom');
  await (await expectedFramedElement('input')).type('k');
  await expectNoFramedElement('.result');
});
