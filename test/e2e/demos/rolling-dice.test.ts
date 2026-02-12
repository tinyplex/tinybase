import {test} from '@playwright/test';
import {
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8807);

beforeAll(startServer);
afterAll(stopServer);

test('averaging-dice-rolls', async ({page}) => {
  await expectPage(page, `/demos/rolling-dice/averaging-dice-rolls/`);
  await expectedElement(page, 'h1', 'Averaging Dice Rolls');
  await expectedFramedElement(page, 'body', /Count/);
  await expectedFramedElement(page, '.roll');
});

test('grouping-dice-rolls', async ({page}) => {
  await expectPage(page, `/demos/rolling-dice/grouping-dice-rolls/`);
  await expectedFramedElement(page, '.rolls .roll');
});
