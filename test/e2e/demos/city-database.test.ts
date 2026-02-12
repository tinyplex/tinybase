import {test} from '@playwright/test';
import {
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8802);

beforeAll(startServer);
afterAll(stopServer);

test('city-database', async ({page}) => {
  test.setTimeout(20000);
  await expectPage(page, `/demos/city-database`);
  await expectedElement(page, 'h1', 'City Database');

  await expectedFramedElement(page, 'main', '140804 rows');
  await expectedFramedElement(page, 'main', '1 to 10');
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    'Shanghai',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(2)',
    'CN',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(3)',
    '22315474',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(4)',
    '31.22222',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(5)',
    '121.45806',
  );
  await (await expectedFramedElement(page, 'th:nth-child(1)', 'Name')).click();
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    `'Abas Abad`,
  );
  await (
    await expectedFramedElement(page, 'th:nth-child(1)', '↑ Name')
  ).click();
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    'vadlamuru',
  );
  await expectProperty(
    await expectedFramedElement(page, 'button.previous'),
    'disabled',
    true,
  );
  await expectProperty(
    await expectedFramedElement(page, 'button.next'),
    'disabled',
    false,
  );
  await (await expectedFramedElement(page, 'button.next')).click();
  await (await expectedFramedElement(page, 'button.next')).click();
  await (await expectedFramedElement(page, 'button.next')).click();
  await expectedFramedElement(page, 'main', '31 to 40');
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    'la Morera de Montsant',
  );
});
