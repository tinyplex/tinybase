import {
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('city-database', async () => {
  await expectPage(`/demos/city-database`);
  await expectedElement('h1', 'City Database');

  await expectedFramedElement('main', '140804 rows');
  await expectedFramedElement('main', '1 to 10');
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(1)',
    'Shanghai',
  );
  await expectedFramedElement('tbody tr:nth-child(1) td:nth-child(2)', 'CN');
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(3)',
    '22315474',
  );
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(4)',
    '31.22222',
  );
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(5)',
    '121.45806',
  );
  await (await expectedFramedElement('th:nth-child(1)', 'Name')).click();
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(1)',
    `'Abas Abad`,
  );
  await (await expectedFramedElement('th:nth-child(1)', '↑ Name')).click();
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(1)',
    'vadlamuru',
  );
  await expectProperty(
    await expectedFramedElement('button.previous'),
    'disabled',
    true,
  );
  await expectProperty(
    await expectedFramedElement('button.next'),
    'disabled',
    false,
  );
  await (await expectedFramedElement('button.next')).click();
  await (await expectedFramedElement('button.next')).click();
  await (await expectedFramedElement('button.next')).click();
  await expectedFramedElement('main', '31 to 40');
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(1)',
    'la Morera de Montsant',
  );
}, 10000);
