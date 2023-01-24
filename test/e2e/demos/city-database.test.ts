import {
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('city-database', async () => {
  await expectPage(`/demos/city-database`);
  await expectedElement('h1', 'City Database');

  await expectedFramedElement('main', '140804 cities');
  await expectedFramedElement('main', '1 to 10');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(1)', 'Shanghai');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(2)', 'CN');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(3)', '22315474');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(4)', '31.22222');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(5)', '121.45806');
  await (await expectedFramedElement('th.col0', 'Name')).click();
  await expectedFramedElement('tr:nth-child(2) td:nth-child(1)', 'vadlamuru');
  await (await expectedFramedElement('th.col0', '↓ Name')).click();
  await expectedFramedElement('tr:nth-child(2) td:nth-child(1)', `'Abas Abad`);
  await expectProperty(
    await expectedFramedElement('button.prev'),
    'className',
    'prev disabled',
  );
  await expectProperty(
    await expectedFramedElement('button.next'),
    'className',
    'next',
  );
  await (await expectedFramedElement('button.next')).click();
  await (await expectedFramedElement('button.next')).click();
  await (await expectedFramedElement('button.next')).click();
  await expectedFramedElement('main', '31 to 40');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(1)', `'Amran`);
}, 10000);
