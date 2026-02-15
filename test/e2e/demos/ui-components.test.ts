import {expect, test} from '@playwright/test';
import {
  expectNoFramedElement,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll, describe} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8809);

beforeAll(startServer);
afterAll(stopServer);

describe('ui-components', () => {
  test('ValuesInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components/valuesinhtmltable`);
    await expectedElement(page, 'h1', '<ValuesInHtmlTable />');
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
    await expectNoFramedElement(
      page,
      'table:nth-of-type(2) tbody tr:nth-of-type(1) th',
      'username',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(2) tbody tr:nth-of-type(1) td',
      'John Appleseed',
    );
  });

  test('TableInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components/tableinhtmltable`);
    await expectedElement(page, 'h1', '<TableInHtmlTable />');
    await expectedFramedElement(page, 'table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      '1',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td',
      'Drama',
    );

    await expectNoFramedElement(page, 'table:nth-of-type(2) thead th', 'Id');
    await expectNoFramedElement(
      page,
      'table:nth-of-type(2) tbody tr:nth-of-type(1) th',
      '1',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(2) tbody tr:nth-of-type(1) td',
      'Drama',
    );

    await expectedFramedElement(page, 'table:nth-of-type(3) thead th', 'Id');
    await expectedFramedElement(
      page,
      'table:nth-of-type(3) tbody tr:nth-of-type(1) th',
      '1',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(3) tbody tr:nth-of-type(1) td a',
      'Drama',
    );
  });

  test('SliceInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components/sliceinhtmltable`);
    await expectedElement(page, 'h1', '<SliceInHtmlTable />');
    await expectedFramedElement(page, 'table thead th:nth-of-type(1)', 'Id');
    await expectedFramedElement(page, 'table thead th:nth-of-type(2)', 'name');
    await expectedFramedElement(page, 'table tbody tr:nth-of-type(1) th', '2');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Comedy',
    );
    await expectedFramedElement(page, 'table tbody tr:nth-of-type(2) th', '3');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(2) td',
      'Family',
    );
    await expectedFramedElement(page, 'table tbody tr:nth-of-type(3) th', '10');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(3) td',
      'Action',
    );
    await expectedFramedElement(page, 'table tbody tr:nth-of-type(4) th', '1');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(4) td',
      'Horror',
    );
  });

  test('RelationshipInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components/relationshipinhtmltable`);
    await expectedElement(page, 'h1', '<RelationshipInHtmlTable />');
    await expectedFramedElement(page, 'table thead th:nth-of-type(1)', 'Genre');
    await expectedFramedElement(
      page,
      'table thead th:nth-of-type(2)',
      'Popularity',
    );
    await expectedFramedElement(
      page,
      'table thead th:nth-of-type(3)',
      'Description',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td:nth-of-type(1)',
      'Drama',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td:nth-of-type(2) b',
      '6',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td:nth-of-type(3)',
      'Dramatic movies to make you think',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(2) td:nth-of-type(1)',
      'Comedy',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(2) td:nth-of-type(2) b',
      '7',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(2) td:nth-of-type(3)',
      'These ones make you laugh',
    );
  });

  test('SortedTableInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components/sortedtableinhtmltable`);
    await expectedElement(page, 'h1', '<SortedTableInHtmlTable />');
    await expectedFramedElement(page, 'table thead th', 'Id');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm003',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'The Godfather',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '1972',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.7',
    );
    await (
      await expectedFramedElement(page, 'table thead th', 'Rating')
    ).click();
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm177',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Double Indemnity',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '1944',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.1',
    );
    await (
      await expectedFramedElement(page, 'table thead th', 'Rating')
    ).click();
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm003',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'The Godfather',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '1972',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.7',
    );
    await (await expectedFramedElement(page, 'table thead th', 'Year')).click();
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm124',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'The Kid',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '1921',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.2',
    );
    await (await expectedFramedElement(page, 'table thead th', 'Id')).click();
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm001',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'The Shawshank Redemption',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '1994',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.7',
    );

    await expectedFramedElement(page, 'table caption', '1 to 7 of 250 rows');
    await (
      await expectedFramedElement(
        page,
        'table caption button:nth-of-type(1)[disabled]',
        '←',
      )
    ).click({force: true});
    await expectedFramedElement(page, 'table caption', '1 to 7 of 250 rows');
    await (
      await expectedFramedElement(
        page,
        'table caption button:nth-of-type(2)',
        '→',
      )
    ).click();
    await expectedFramedElement(page, 'table caption', '8 to 14 of 250 rows');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm008',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Spirited Away',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '2001',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.5',
    );
    await (
      await expectedFramedElement(
        page,
        'table caption button:nth-of-type(1)',
        '←',
      )
    ).click();
    await expectedFramedElement(page, 'table caption', '1 to 7 of 250 rows');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm001',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'The Shawshank Redemption',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '1994',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.7',
    );
  });

  test('ResultTableInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components/resulttableinhtmltable`);
    await expectedElement(page, 'h1', '<ResultTableInHtmlTable />');
    await expectedFramedElement(page, 'table thead th', 'Id');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'g05',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Animation',
    );
    await expectedFramedElement(page, 'table tbody tr:nth-of-type(1) td', '9');
    await expectNoFramedElement(page, 'table tbody tr:nth-of-type(4)');
  });

  test('ResultSortedTableInHtmlTable', async ({page}) => {
    await expectPage(page, `/demos/ui-components/resultsortedtableinhtmltable`);
    await expectedElement(page, 'h1', '<ResultSortedTableInHtmlTable />');
    await expectedFramedElement(page, 'table thead th', 'Id');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm006',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Impossible Things',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '2021',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.6',
    );
    await (
      await expectedFramedElement(page, 'table thead th', 'Rating')
    ).click();
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm182',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      `Me Against You: Mr. S's Vendetta`,
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '2020',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.1',
    );
    await (
      await expectedFramedElement(page, 'table thead th', 'Rating')
    ).click();
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm006',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Impossible Things',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '2021',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.6',
    );
    await (await expectedFramedElement(page, 'table thead th', 'Year')).click();
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm035',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Spider-Man: Into the Spider-Verse',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '2018',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.4',
    );
    await (await expectedFramedElement(page, 'table thead th', 'Id')).click();
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm006',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Impossible Things',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '2021',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.6',
    );

    await expectedFramedElement(page, 'table caption', '1 to 7 of 69 rows');
    await (
      await expectedFramedElement(
        page,
        'table caption button:nth-of-type(1)[disabled]',
        '←',
      )
    ).click({force: true});
    await expectedFramedElement(page, 'table caption', '1 to 7 of 69 rows');
    await (
      await expectedFramedElement(
        page,
        'table caption button:nth-of-type(2)',
        '→',
      )
    ).click();
    await expectedFramedElement(page, 'table caption', '8 to 14 of 69 rows');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm031',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Josee, the Tiger and the Fish',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '2020',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.4',
    );
    await (
      await expectedFramedElement(
        page,
        'table caption button:nth-of-type(1)',
        '←',
      )
    ).click();
    await expectedFramedElement(page, 'table caption', '1 to 7 of 69 rows');
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) th',
      'm006',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      'Impossible Things',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '2021',
    );
    await expectedFramedElement(
      page,
      'table tbody tr:nth-of-type(1) td',
      '8.6',
    );
  });

  test('EditableValueView', async ({page}) => {
    await expectPage(page, `/demos/ui-components/editablevalueview`);
    await expectedElement(page, 'h1', '<EditableValueView />');
    await expectedFramedElement(page, 'table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      'username',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
      'string',
    );
    const input1 = await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td input',
    );
    await expect(input1).toHaveValue('John Appleseed');
    await expectedFramedElement(page, '#edit button', 'string');
    const input2 = await expectedFramedElement(page, `#edit input`);
    await expect(input2).toHaveValue('John Appleseed');

    await (
      await expectedFramedElement(
        page,
        'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
        'string',
      )
    ).click();
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
      'number',
    );
    await expect(input1).toHaveValue('0');
    await expectedFramedElement(page, '#edit button', 'number');
    await expect(input2).toHaveValue('0');

    await (
      await expectedFramedElement(
        page,
        'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
        'number',
      )
    ).click();
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
      'boolean',
    );
    const check1 = await expectedFramedElement(
      page,
      `table:nth-of-type(1) tbody tr:nth-of-type(1) td input[type='checkbox']`,
    );
    await expect(check1).toBeChecked();
    await expectedFramedElement(page, '#edit button', 'boolean');
    const check2 = await expectedFramedElement(
      page,
      `#edit input[type='checkbox']`,
    );
    await expect(check2).toBeChecked();

    await (
      await expectedFramedElement(
        page,
        'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
        'boolean',
      )
    ).click();
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
      'string',
    );
    await expect(input1).toHaveValue('John Appleseed');
    await expectedFramedElement(page, '#edit button', 'string');
    await expect(input2).toHaveValue('John Appleseed');

    await input1.fill('John Appleseed!');
    await expect(input2).toHaveValue('John Appleseed!');

    await input2.fill('John Appleseed!?');
    await expect(input1).toHaveValue('John Appleseed!?');
  });

  test('EditableCellView', async ({page}) => {
    await expectPage(page, `/demos/ui-components/editablecellview`);
    await expectedElement(page, 'h1', '<EditableCellView />');
    await expectedFramedElement(page, 'table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      '1',
    );
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
      'string',
    );
    const input1 = await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td input',
    );
    await expect(input1).toHaveValue('Animation');
    await expectedFramedElement(page, '#edit button', 'string');
    const input2 = await expectedFramedElement(page, `#edit input`);
    await expect(input2).toHaveValue('Animation');

    await (
      await expectedFramedElement(
        page,
        'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
        'string',
      )
    ).click();
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
      'number',
    );
    await expect(input1).toHaveValue('0');
    await expectedFramedElement(page, '#edit button', 'number');
    await expect(input2).toHaveValue('0');

    await (
      await expectedFramedElement(
        page,
        'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
        'number',
      )
    ).click();
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
      'boolean',
    );
    const check1 = await expectedFramedElement(
      page,
      `table:nth-of-type(1) tbody tr:nth-of-type(5) td input[type='checkbox']`,
    );
    await expect(check1).toBeChecked();
    await expectedFramedElement(page, '#edit button', 'boolean');
    const check2 = await expectedFramedElement(
      page,
      `#edit input[type='checkbox']`,
    );
    await expect(check2).toBeChecked();

    await (
      await expectedFramedElement(
        page,
        'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
        'boolean',
      )
    ).click();
    await expectedFramedElement(
      page,
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
      'string',
    );
    await expect(input1).toHaveValue('Animation');
    await expectedFramedElement(page, '#edit button', 'string');
    await expect(input2).toHaveValue('Animation');

    await input1.fill('Animation!');
    await expect(input2).toHaveValue('Animation!');

    await input2.fill('Animation!?');
    await expect(input1).toHaveValue('Animation!?');
  });
});
