import {
  expectNoFramedElement,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

describe('ui-components', () => {
  test('ValuesInHtmlTable', async () => {
    await expectPage(`/demos/ui-components/valuesinhtmltable`);
    await expectedElement('h1', '<ValuesInHtmlTable />');
    await expectedFramedElement('table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      'username',
    );
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td',
      'John Appleseed',
    );

    await expectNoFramedElement('table:nth-of-type(2) thead th', 'Id');
    await expectNoFramedElement(
      'table:nth-of-type(2) tbody tr:nth-of-type(1) th',
      'username',
    );
    await expectedFramedElement(
      'table:nth-of-type(2) tbody tr:nth-of-type(1) td',
      'John Appleseed',
    );
  });

  test('TableInHtmlTable', async () => {
    await expectPage(`/demos/ui-components/tableinhtmltable`);
    await expectedElement('h1', '<TableInHtmlTable />');
    await expectedFramedElement('table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      '1',
    );
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td',
      'Drama',
    );

    await expectNoFramedElement('table:nth-of-type(2) thead th', 'Id');
    await expectNoFramedElement(
      'table:nth-of-type(2) tbody tr:nth-of-type(1) th',
      '1',
    );
    await expectedFramedElement(
      'table:nth-of-type(2) tbody tr:nth-of-type(1) td',
      'Drama',
    );

    await expectedFramedElement('table:nth-of-type(3) thead th', 'Id');
    await expectedFramedElement(
      'table:nth-of-type(3) tbody tr:nth-of-type(1) th',
      '1',
    );
    await expectedFramedElement(
      'table:nth-of-type(3) tbody tr:nth-of-type(1) td a',
      'Drama',
    );
  });

  test('SliceInHtmlTable', async () => {
    await expectPage(`/demos/ui-components/sliceinhtmltable`);
    await expectedElement('h1', '<SliceInHtmlTable />');
    await expectedFramedElement('table thead th:nth-of-type(1)', 'Id');
    await expectedFramedElement('table thead th:nth-of-type(2)', 'name');
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '2');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', 'Comedy');
    await expectedFramedElement('table tbody tr:nth-of-type(2) th', '3');
    await expectedFramedElement('table tbody tr:nth-of-type(2) td', 'Family');
    await expectedFramedElement('table tbody tr:nth-of-type(3) th', '10');
    await expectedFramedElement('table tbody tr:nth-of-type(3) td', 'Action');
    await expectedFramedElement('table tbody tr:nth-of-type(4) th', '1');
    await expectedFramedElement('table tbody tr:nth-of-type(4) td', 'Horror');
  });

  test('RelationshipInHtmlTable', async () => {
    await expectPage(`/demos/ui-components/relationshipinhtmltable`);
    await expectedElement('h1', '<RelationshipInHtmlTable />');
    await expectedFramedElement('table thead th:nth-of-type(1)', 'Genre');
    await expectedFramedElement('table thead th:nth-of-type(2)', 'Popularity');
    await expectedFramedElement('table thead th:nth-of-type(3)', 'Description');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td:nth-of-type(1)',
      'Drama',
    );
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td:nth-of-type(2) b',
      '6',
    );
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td:nth-of-type(3)',
      'Dramatic movies to make you think',
    );
    await expectedFramedElement(
      'table tbody tr:nth-of-type(2) td:nth-of-type(1)',
      'Comedy',
    );
    await expectedFramedElement(
      'table tbody tr:nth-of-type(2) td:nth-of-type(2) b',
      '7',
    );
    await expectedFramedElement(
      'table tbody tr:nth-of-type(2) td:nth-of-type(3)',
      'These ones make you laugh',
    );
  });

  test('SortedTableInHtmlTable', async () => {
    await expectPage(`/demos/ui-components/sortedtableinhtmltable`);
    await expectedElement('h1', '<SortedTableInHtmlTable />');
    await expectedFramedElement('table thead th', 'Id');
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '3');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'The Godfather',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '1972');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.7');
    await (await expectedFramedElement('table thead th', 'Rating')).click();
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '177');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'Double Indemnity',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '1944');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.1');
    await (await expectedFramedElement('table thead th', 'Rating')).click();
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '3');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'The Godfather',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '1972');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.7');
    await (await expectedFramedElement('table thead th', 'Year')).click();
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '124');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', 'The Kid');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '1921');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.2');
    await (await expectedFramedElement('table thead th', 'Id')).click();
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '1');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'The Shawshank Redemption',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '1994');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.7');

    await expectedFramedElement('table caption', '1 to 7 of 250 rows');
    await (
      await expectedFramedElement(
        'table caption button:nth-of-type(1)[disabled]',
        '←',
      )
    ).click();
    await expectedFramedElement('table caption', '1 to 7 of 250 rows');
    await (
      await expectedFramedElement('table caption button:nth-of-type(2)', '→')
    ).click();
    await expectedFramedElement('table caption', '8 to 14 of 250 rows');
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '105');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'The Lion King',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '1994');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.3');
    await (
      await expectedFramedElement('table caption button:nth-of-type(1)', '←')
    ).click();
    await expectedFramedElement('table caption', '1 to 7 of 250 rows');
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '1');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'The Shawshank Redemption',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '1994');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.7');
  });

  test('ResultTableInHtmlTable', async () => {
    await expectPage(`/demos/ui-components/resulttableinhtmltable`);
    await expectedElement('h1', '<ResultTableInHtmlTable />');
    await expectedFramedElement('table thead th', 'Id');
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '5');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'Animation',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '9');
    await expectNoFramedElement('table tbody tr:nth-of-type(4)');
  });

  test('ResultSortedTableInHtmlTable', async () => {
    await expectPage(`/demos/ui-components/resultsortedtableinhtmltable`);
    await expectedElement('h1', '<ResultSortedTableInHtmlTable />');
    await expectedFramedElement('table thead th', 'Id');
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '6');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'Impossible Things',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '2021');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.6');
    await (await expectedFramedElement('table thead th', 'Rating')).click();
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '182');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      `Me Against You: Mr. S's Vendetta`,
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '2020');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.1');
    await (await expectedFramedElement('table thead th', 'Rating')).click();
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '6');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'Impossible Things',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '2021');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.6');
    await (await expectedFramedElement('table thead th', 'Year')).click();
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '35');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'Spider-Man: Into the Spider-Verse',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '2018');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.4');
    await (await expectedFramedElement('table thead th', 'Id')).click();
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '101');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      `Zack Snyder's Justice League`,
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '2021');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.3');

    await expectedFramedElement('table caption', '1 to 7 of 69 rows');
    await (
      await expectedFramedElement(
        'table caption button:nth-of-type(1)[disabled]',
        '←',
      )
    ).click();
    await expectedFramedElement('table caption', '1 to 7 of 69 rows');
    await (
      await expectedFramedElement('table caption button:nth-of-type(2)', '→')
    ).click();
    await expectedFramedElement('table caption', '8 to 14 of 69 rows');
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '113');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      'Bo Burnham: Inside',
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '2021');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.2');
    await (
      await expectedFramedElement('table caption button:nth-of-type(1)', '←')
    ).click();
    await expectedFramedElement('table caption', '1 to 7 of 69 rows');
    await expectedFramedElement('table tbody tr:nth-of-type(1) th', '101');
    await expectedFramedElement(
      'table tbody tr:nth-of-type(1) td',
      `Zack Snyder's Justice League`,
    );
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '2021');
    await expectedFramedElement('table tbody tr:nth-of-type(1) td', '8.3');
  });

  test('EditableValueView', async () => {
    await expectPage(`/demos/ui-components/editablevalueview`);
    await expectedElement('h1', '<EditableValueView />');
    await expectedFramedElement('table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      'username',
    );
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
      'string',
    );
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td ' +
        `input[value='John Appleseed']`,
    );
    await expectedFramedElement('#edit button', 'string');
    await expectedFramedElement(`#edit input[value='John Appleseed']`);

    await (
      await expectedFramedElement(
        'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
        'string',
      )
    ).click();
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
      'number',
    );
    await expectedFramedElement(
      `table:nth-of-type(1) tbody tr:nth-of-type(1) td input[value='0']`,
    );
    await expectedFramedElement('#edit button', 'number');
    await expectedFramedElement(`#edit input[value='0']`);

    await (
      await expectedFramedElement(
        'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
        'number',
      )
    ).click();
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
      'boolean',
    );
    await expectedFramedElement(
      `table:nth-of-type(1) tbody tr:nth-of-type(1) td input[checked]`,
    );
    await expectedFramedElement('#edit button', 'boolean');
    await expectedFramedElement(`#edit input[checked]`);

    await (
      await expectedFramedElement(
        'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
        'boolean',
      )
    ).click();
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td button',
      'string',
    );
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td ' +
        `input[value='John Appleseed']`,
    );
    await expectedFramedElement('#edit button', 'string');
    await expectedFramedElement(`#edit input[value='John Appleseed']`);

    await (
      await expectedFramedElement(
        'table:nth-of-type(1) tbody tr:nth-of-type(1) td ' +
          `input[value='John Appleseed']`,
      )
    ).type('!');
    await expectedFramedElement(`#edit input[value='John Appleseed!']`);

    await (
      await expectedFramedElement(`#edit input[value='John Appleseed!']`)
    ).type('?');
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) td ' +
        `input[value='John Appleseed!?']`,
    );
  });

  test('EditableCellView', async () => {
    await expectPage(`/demos/ui-components/editablecellview`);
    await expectedElement('h1', '<EditableCellView />');
    await expectedFramedElement('table:nth-of-type(1) thead th', 'Id');
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(1) th',
      '1',
    );
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
      'string',
    );
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td ' +
        `input[value='Animation']`,
    );
    await expectedFramedElement('#edit button', 'string');
    await expectedFramedElement(`#edit input[value='Animation']`);

    await (
      await expectedFramedElement(
        'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
        'string',
      )
    ).click();
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
      'number',
    );
    await expectedFramedElement(
      `table:nth-of-type(1) tbody tr:nth-of-type(5) td input[value='0']`,
    );
    await expectedFramedElement('#edit button', 'number');
    await expectedFramedElement(`#edit input[value='0']`);

    await (
      await expectedFramedElement(
        'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
        'number',
      )
    ).click();
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
      'boolean',
    );
    await expectedFramedElement(
      `table:nth-of-type(1) tbody tr:nth-of-type(5) td input[checked]`,
    );
    await expectedFramedElement('#edit button', 'boolean');
    await expectedFramedElement(`#edit input[checked]`);

    await (
      await expectedFramedElement(
        'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
        'boolean',
      )
    ).click();
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td button',
      'string',
    );
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td ' +
        `input[value='Animation']`,
    );
    await expectedFramedElement('#edit button', 'string');
    await expectedFramedElement(`#edit input[value='Animation']`);

    await (
      await expectedFramedElement(
        'table:nth-of-type(1) tbody tr:nth-of-type(5) td ' +
          `input[value='Animation']`,
      )
    ).type('!');
    await expectedFramedElement(`#edit input[value='Animation!']`);

    await (
      await expectedFramedElement(`#edit input[value='Animation!']`)
    ).type('?');
    await expectedFramedElement(
      'table:nth-of-type(1) tbody tr:nth-of-type(5) td ' +
        `input[value='Animation!?']`,
    );
  });
});
