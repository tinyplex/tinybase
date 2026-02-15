import {test} from '@playwright/test';
import {
  expectProperty,
  expectedElement,
  expectedFramedElement,
  expectedFramedSvgElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('car-analysis', async ({page}) => {
  await expectPage(page, `/demos/car-analysis`);
  await expectedElement(page, 'h1', 'Car Analysis');
  await expectedFramedElement(page, 'aside', 'Dimensions');

  await expectedFramedSvgElement(page, 'text', 'Chrysler');
  await expectedFramedSvgElement(page, 'text', '200');
  await expectedFramedSvgElement(page, 'text', 'Opel Horsepower: 81');

  await (await expectedFramedElement(page, 'option.Year', 'Year')).click();

  await expectedFramedSvgElement(page, 'text', '1973');
  await expectedFramedSvgElement(page, 'text', '200');
  await expectedFramedSvgElement(page, 'text', '1972 Horsepower: 120.18');

  await (
    await expectedFramedElement(page, 'option.Cylinders', 'Cylinders')
  ).click();
  await expectedFramedSvgElement(page, 'text', '1980');
  await expectedFramedSvgElement(page, 'text', '7');
  await expectedFramedSvgElement(page, 'text', '1972 Cylinders: 5.82');

  await (
    await expectedFramedElement(page, 'option.Minimum', 'Minimum')
  ).click();
  await expectedFramedSvgElement(page, 'text', '1973');
  await expectedFramedSvgElement(page, 'text', '4');
  await expectedFramedSvgElement(page, 'text', '1972 Cylinders: 3');

  await (await expectedFramedElement(page, 'label', 'Show table')).click();
  await (await expectedFramedElement(page, 'option.Weight', 'Weight')).click();
  await expectedFramedElement(page, 'caption', '1 to 10 of 12 rows');
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    '1973',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(2)',
    '1867',
  );

  await (await expectedFramedElement(page, 'th:nth-child(1)', 'Year')).click();
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    '1970',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(2)',
    '1835',
  );

  await (
    await expectedFramedElement(page, 'th:nth-child(1)', '↑ Year')
  ).click();
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    '1982',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(2)',
    '1755',
  );

  await expectedFramedElement(page, 'caption', '1 to 10');
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
  await expectedFramedElement(page, 'caption', '11 to 12');
  await expectProperty(
    await expectedFramedElement(page, 'button.previous'),
    'disabled',
    false,
  );
  await expectProperty(
    await expectedFramedElement(page, 'button.next'),
    'disabled',
    true,
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    '1971',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(2)',
    '1613',
  );
});
