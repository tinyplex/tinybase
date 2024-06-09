import {
  expectNoFramedElement,
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('countries', async () => {
  await expectPage(`/demos/countries`);
  await expectedElement('h1', 'Countries');
  await (await expectedFramedElement('.filter', '★8')).click();
  await expectedFramedElement('#countries .country', 'United Kingdom');
  await expectNoFramedElement('#countries .country', 'Bahamas');
  await (await expectedFramedElement('#countries .country .star', '★')).click();
  await expectedFramedElement('.filter', '★7');
  await expectNoFramedElement('#countries .country', 'United Kingdom');
  const b = await expectedFramedElement('.filter', 'B21');
  await expectProperty(b, 'className', 'filter');
  await b.click();
  await expectProperty(b, 'className', 'filter current');
  await expectedFramedElement('#countries .country', 'Bahamas');
  await (await expectedFramedElement('#countries .country .star', '☆')).click();
  await (await expectedFramedElement('.filter', '★8')).click();
  await expectedFramedElement('#countries .country', 'Bahamas');
  await page.reload();
  await expectedFramedElement('#countries .country', 'Bahamas');
});
