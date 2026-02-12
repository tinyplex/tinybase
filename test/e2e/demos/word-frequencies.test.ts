import {test} from '@playwright/test';
import {
  expectNoFramedElement,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8810);

beforeAll(startServer);
afterAll(stopServer);

test('word-frequencies', async ({page}) => {
  await expectPage(page, `/demos/word-frequencies`);
  await expectedElement(page, 'h1', 'Word Frequencies');
  await (await expectedFramedElement(page, 'input')).type('z');
  await expectedFramedElement(page, '.result', 'zone');
  await expectedFramedElement(page, '.result', 'zero');
  await expectedFramedElement(page, '.result', 'zoo');
  await expectedFramedElement(page, '.result', 'zip');
  await expectedFramedElement(page, '.result', 'zoom');
  await expectedFramedElement(page, '.result', 'zinc');
  await expectedFramedElement(page, '.result', 'zeal');
  await expectedFramedElement(page, '.result', 'zygote');
  await (await expectedFramedElement(page, 'input')).type('o');
  await expectedFramedElement(page, '.result', 'zone');
  await expectNoFramedElement(page, '.result', 'zero');
  await expectedFramedElement(page, '.result', 'zoo');
  await expectNoFramedElement(page, '.result', 'zip');
  await expectedFramedElement(page, '.result', 'zoom');
  await expectNoFramedElement(page, '.result', 'zinc');
  await expectNoFramedElement(page, '.result', 'zeal');
  await expectNoFramedElement(page, '.result', 'zygote');
  await (await expectedFramedElement(page, 'input')).type('n');
  await expectedFramedElement(page, '.result', 'zone');
  await expectNoFramedElement(page, '.result', 'zoo');
  await expectNoFramedElement(page, '.result', 'zoom');
  await (await expectedFramedElement(page, 'input')).type('k');
  await expectNoFramedElement(page, '.result');
});
