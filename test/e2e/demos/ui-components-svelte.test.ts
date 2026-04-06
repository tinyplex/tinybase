import {expect, test} from '@playwright/test';
import {
  expectNoFramedElement,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll, describe} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8811);

beforeAll(startServer);
afterAll(stopServer);

describe('ui-components-svelte', () => {
  test('ValuesInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components-svelte/valuesinhtmltable-svelte`);
    await expectedElement(page, 'h1', '<ValuesInHtmlTable /> (Svelte)');
    await expectedFramedElement(page, 'table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      'username',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td',
      'John Appleseed',
    );
    await expectNoFramedElement(page, 'table:nth-of-type(2) thead th', 'Id');
  });

  test('TableInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components-svelte/tableinhtmltable-svelte`);
    await expectedElement(page, 'h1', '<TableInHtmlTable /> (Svelte)');
    await expectedFramedElement(page, 'table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      'g01',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td',
      'Drama',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(3) tbody tr:nth-of-type(1) td a',
      'Drama',
    );
  });

  test('SortedTableInHtmlTable', async ({page}) => {
    await expectPage(
      page,
      `/demos/ui-components-svelte/sortedtableinhtmltable-svelte`,
    );
    await expectedElement(page, 'h1', '<SortedTableInHtmlTable /> (Svelte)');
    await expectedFramedElement(page, 'table thead th', 'Rating');
    await expectedFramedElement(page, 'table tbody tr:nth-of-type(1) th', 'm003');
    await (
      await expectedFramedElement(page, 'table thead th', 'Rating')
    ).click();
    await expectedFramedElement(page, 'table tbody tr:nth-of-type(1) th', 'm177');
    await (
      await expectedFramedElement(page, 'table thead th', 'Year')
    ).click();
    await expectedFramedElement(page, 'table tbody tr:nth-of-type(1) th', 'm124');
  });

  test('EditableValueView', async ({page}) => {
    await expectPage(page, `/demos/ui-components-svelte/editablevalueview-svelte`);
    await expectedElement(page, 'h1', '<EditableValueView /> (Svelte)');
    await expectedFramedElement(page, '#edit', 'Username:');
    const input = await expectedFramedElement(page, '#edit input', undefined);
    await expect(input).toHaveValue('John Appleseed');
  });

  test('EditableCellView', async ({page}) => {
    await expectPage(page, `/demos/ui-components-svelte/editablecellview-svelte`);
    await expectedElement(page, 'h1', '<EditableCellView /> (Svelte)');
    await expectedFramedElement(page, '#edit', 'Genre g05 name:');
    const input = await expectedFramedElement(page, '#edit input', undefined);
    await expect(input).toHaveValue('Animation');
  });
});
