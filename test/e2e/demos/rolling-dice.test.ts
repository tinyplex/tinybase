import {
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

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
