import {test} from '@playwright/test';
import {
  expectNoFramedElement,
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8803);

beforeAll(startServer);
afterAll(stopServer);

test('countries', async ({page}) => {
  await expectPage(page, `/demos/countries`);
  await expectedElement(page, 'h1', 'Countries');
  await (await expectedFramedElement(page, '.filter', '★8')).click();
  await expectedFramedElement(page, '#countries .country', 'United Kingdom');
  await expectNoFramedElement(page, '#countries .country', 'Bahamas');
  await (
    await expectedFramedElement(page, '#countries .country .star', '★')
  ).click();
  await expectedFramedElement(page, '.filter', '★7');
  await expectNoFramedElement(page, '#countries .country', 'United Kingdom');
  const b = await expectedFramedElement(page, '.filter', 'B21');
  await expectProperty(b, 'className', 'filter');
  await b.click();
  await expectProperty(b, 'className', 'filter current');
  await expectedFramedElement(page, '#countries .country', 'Bahamas');
  await (
    await expectedFramedElement(page, '#countries .country .star', '☆')
  ).click();
  await (await expectedFramedElement(page, '.filter', '★8')).click();
  await expectedFramedElement(page, '#countries .country', 'Bahamas');
  await page.reload();
  await expectedFramedElement(page, '#countries .country', 'Bahamas');
});
