/* eslint-disable max-len */
/* eslint-disable react/jsx-no-useless-fragment */

import {
  EditableCellView,
  EditableValueView,
  RelationshipInHtmlTable,
  ResultSortedTableInHtmlTable,
  ResultTableInHtmlTable,
  SliceInHtmlTable,
  SortedTableInHtmlTable,
  SortedTablePaginator,
  TableInHtmlTable,
  ValuesInHtmlTable,
} from 'tinybase/debug/ui-react-dom';
import {
  Ids,
  Indexes,
  Queries,
  Relationships,
  Store,
  createIndexes,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase/debug';
import {ReactTestRenderer, act, create} from 'react-test-renderer';
import {ExtraProps} from 'tinybase/debug/ui-react';
import React from 'react';

let store: Store;
let indexes: Indexes;
let relationships: Relationships;
let queries: Queries;
let renderer: ReactTestRenderer;

const Custom = ({store: _store, queries: _queries, ...props}: ExtraProps) => (
  <b>{JSON.stringify(props)}</b>
);

const getIdsAsProp = (...ids: Ids) => ({...ids});

const nullEvent = () => null;

beforeEach(() => {
  store = createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 1, v2: 2});
  indexes = createIndexes(store).setIndexDefinition('i1', 't2', 'c1');
  relationships = createRelationships(store).setRelationshipDefinition(
    'r1',
    't1',
    't2',
    (getCell) => 'r' + ((getCell('c1') as number) + 1),
  );
  queries = createQueries(store).setQueryDefinition('q1', 't2', ({select}) => {
    select(
      (getTableCell) => '' + getTableCell('c1') + (getTableCell('c2') ?? '_'),
    ).as('c0');
    select('c1');
    select('c2');
  });
});

describe('TableInHtmlTable', () => {
  test('basic', () => {
    act(() => {
      renderer = create(<TableInHtmlTable store={store} tableId="t2" />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('editable', () => {
    act(() => {
      renderer = create(
        <TableInHtmlTable store={store} tableId="t2" editable={true} />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={2}
                />
              </div>
            </td>
            <td>
              <div
                className="editableCell"
              >
                <button
                  onClick={[Function]}
                />
                <input
                  onChange={[Function]}
                  type="checkbox"
                />
              </div>
            </td>
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={3}
                />
              </div>
            </td>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={4}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(
        <TableInHtmlTable store={store} tableId="t2" className="table" />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table
        className="table"
      >
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('idColumn', () => {
    act(() => {
      renderer = create(
        <TableInHtmlTable store={store} tableId="t2" idColumn={false} />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('headerRow', () => {
    act(() => {
      renderer = create(
        <TableInHtmlTable store={store} tableId="t2" headerRow={false} />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells array', () => {
    act(() => {
      renderer = create(
        <TableInHtmlTable
          store={store}
          tableId="t2"
          customCells={['c3', 'c2']}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c3
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td />
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells labels', () => {
    act(() => {
      renderer = create(
        <TableInHtmlTable
          store={store}
          tableId="t2"
          customCells={{c3: 'C3', c2: 'C2'}}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              C3
            </th>
            <th>
              C2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td />
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells objects', () => {
    act(() => {
      renderer = create(
        <TableInHtmlTable
          store={store}
          tableId="t2"
          customCells={{
            c1: {
              label: 'C1',
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
            c2: {
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
          }}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              C1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              <b>
                {"0":"r1","1":"c1","tableId":"t2","rowId":"r1","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r1","1":"c2","tableId":"t2","rowId":"r1","cellId":"c2"}
              </b>
            </td>
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              <b>
                {"0":"r2","1":"c1","tableId":"t2","rowId":"r2","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r2","1":"c2","tableId":"t2","rowId":"r2","cellId":"c2"}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });
});

describe('SortedTableInHtmlTable', () => {
  test('basic', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('editable', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          editable={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={3}
                />
              </div>
            </td>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={4}
                />
              </div>
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={2}
                />
              </div>
            </td>
            <td>
              <div
                className="editableCell"
              >
                <button
                  onClick={[Function]}
                />
                <input
                  onChange={[Function]}
                  type="checkbox"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('paginator, larger', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          paginator={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <caption>
          2
           
          rows
        </caption>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('paginator, smaller', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          limit={1}
          paginator={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <caption>
          <button
            className="previous"
            disabled={true}
          >
            ←
          </button>
          <button
            className="next"
            disabled={false}
            onClick={[Function]}
          >
            →
          </button>
          1
           to 
          1
           of 
          2
           
          rows
        </caption>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('button')[1].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <caption>
          <button
            className="previous"
            disabled={false}
            onClick={[Function]}
          >
            ←
          </button>
          <button
            className="next"
            disabled={true}
          >
            →
          </button>
          2
           to 
          2
           of 
          2
           
          rows
        </caption>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('paginator, custom', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          limit={1}
          paginator={Custom}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <caption>
          <b>
            {"offset":0,"limit":1,"total":2}
          </b>
        </caption>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('no sorting specified', () => {
    act(() => {
      renderer = create(<SortedTableInHtmlTable store={store} tableId="t2" />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              className="sorted ascending"
            >
              ↑ 
              Id
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          className="table"
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table
        className="table"
      >
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('idColumn', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          idColumn={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('headerRow', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          headerRow={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells array', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          customCells={['c3', 'c2']}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c3
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td />
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells labels', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          customCells={{c3: 'C3', c2: 'C2'}}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              C3
            </th>
            <th>
              C2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td />
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells objects', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          customCells={{
            c1: {
              label: 'C1',
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
            c2: {
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
          }}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              C1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              <b>
                {"0":"r2","1":"c1","tableId":"t2","rowId":"r2","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r2","1":"c2","tableId":"t2","rowId":"r2","cellId":"c2"}
              </b>
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              <b>
                {"0":"r1","1":"c1","tableId":"t2","rowId":"r1","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r1","1":"c2","tableId":"t2","rowId":"r1","cellId":"c2"}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('sortOnClick', () => {
    act(() => {
      renderer = create(
        <SortedTableInHtmlTable
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          sortOnClick={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              onClick={[Function]}
            >
              Id
            </th>
            <th
              className="sorted descending"
              onClick={[Function]}
            >
              ↓ 
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[1].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              onClick={[Function]}
            >
              Id
            </th>
            <th
              className="sorted ascending"
              onClick={[Function]}
            >
              ↑ 
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[2].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              onClick={[Function]}
            >
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c1
            </th>
            <th
              className="sorted ascending"
              onClick={[Function]}
            >
              ↑ 
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[2].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              onClick={[Function]}
            >
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c1
            </th>
            <th
              className="sorted descending"
              onClick={[Function]}
            >
              ↓ 
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[0].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              className="sorted ascending"
              onClick={[Function]}
            >
              ↑ 
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[0].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              className="sorted descending"
              onClick={[Function]}
            >
              ↓ 
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });
});

describe('ValuesInHtmlTable', () => {
  test('basic', () => {
    act(() => {
      renderer = create(<ValuesInHtmlTable store={store} />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              v1
            </th>
            <td>
              1
            </td>
          </tr>
          <tr>
            <th>
              v2
            </th>
            <td>
              2
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('editable', () => {
    act(() => {
      renderer = create(<ValuesInHtmlTable store={store} editable={true} />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              v1
            </th>
            <td>
              <div
                className="editableValue"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={1}
                />
              </div>
            </td>
          </tr>
          <tr>
            <th>
              v2
            </th>
            <td>
              <div
                className="editableValue"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={2}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('custom', () => {
    act(() => {
      renderer = create(
        <ValuesInHtmlTable
          store={store}
          valueComponent={Custom}
          getValueComponentProps={getIdsAsProp}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              v1
            </th>
            <td>
              <b>
                {"0":"v1","valueId":"v1"}
              </b>
            </td>
          </tr>
          <tr>
            <th>
              v2
            </th>
            <td>
              <b>
                {"0":"v2","valueId":"v2"}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(<ValuesInHtmlTable store={store} className="values" />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table
        className="values"
      >
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              v1
            </th>
            <td>
              1
            </td>
          </tr>
          <tr>
            <th>
              v2
            </th>
            <td>
              2
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('idColumn', () => {
    act(() => {
      renderer = create(<ValuesInHtmlTable store={store} idColumn={false} />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              1
            </td>
          </tr>
          <tr>
            <td>
              2
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });
});

describe('SliceInHtmlTable', () => {
  test('basic', () => {
    act(() => {
      renderer = create(
        <SliceInHtmlTable indexes={indexes} indexId="i1" sliceId="2" />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('editable', () => {
    act(() => {
      renderer = create(
        <SliceInHtmlTable
          indexes={indexes}
          indexId="i1"
          sliceId="2"
          editable={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={2}
                />
              </div>
            </td>
            <td>
              <div
                className="editableCell"
              >
                <button
                  onClick={[Function]}
                />
                <input
                  onChange={[Function]}
                  type="checkbox"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(
        <SliceInHtmlTable
          indexes={indexes}
          indexId="i1"
          sliceId="2"
          className="slice"
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table
        className="slice"
      >
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('idColumn', () => {
    act(() => {
      renderer = create(
        <SliceInHtmlTable
          indexes={indexes}
          indexId="i1"
          sliceId="2"
          idColumn={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('headerRow', () => {
    act(() => {
      renderer = create(
        <SliceInHtmlTable
          indexes={indexes}
          indexId="i1"
          sliceId="2"
          headerRow={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells array', () => {
    act(() => {
      renderer = create(
        <SliceInHtmlTable
          indexes={indexes}
          indexId="i1"
          sliceId="2"
          customCells={['c3', 'c1']}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c3
            </th>
            <th>
              c1
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td>
              2
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells labels', () => {
    act(() => {
      renderer = create(
        <SliceInHtmlTable
          indexes={indexes}
          indexId="i1"
          sliceId="2"
          customCells={{c3: 'C3', c1: 'C1'}}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              C3
            </th>
            <th>
              C1
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td>
              2
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells objects', () => {
    act(() => {
      renderer = create(
        <SliceInHtmlTable
          indexes={indexes}
          indexId="i1"
          sliceId="2"
          customCells={{
            c1: {
              label: 'C1',
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
            c2: {
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
          }}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              C1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              <b>
                {"0":"r1","1":"c1","tableId":"t2","rowId":"r1","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r1","1":"c2","tableId":"t2","rowId":"r1","cellId":"c2"}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });
});

describe('RelationshipInHtmlTable', () => {
  test('basic', () => {
    act(() => {
      renderer = create(
        <RelationshipInHtmlTable
          relationships={relationships}
          relationshipId="r1"
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              t1
              .Id
            </th>
            <th>
              t2
              .Id
            </th>
            <th>
              t1.c1
            </th>
            <th>
              t2.c1
            </th>
            <th>
              t2.c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <th>
              r2
            </th>
            <td>
              1
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('editable', () => {
    act(() => {
      renderer = create(
        <RelationshipInHtmlTable
          relationships={relationships}
          relationshipId="r1"
          editable={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              t1
              .Id
            </th>
            <th>
              t2
              .Id
            </th>
            <th>
              t1.c1
            </th>
            <th>
              t2.c1
            </th>
            <th>
              t2.c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <th>
              r2
            </th>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={1}
                />
              </div>
            </td>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={3}
                />
              </div>
            </td>
            <td>
              <div
                className="editableCell"
              >
                <button
                  className="number"
                  onClick={[Function]}
                >
                  number
                </button>
                <input
                  onChange={[Function]}
                  type="number"
                  value={4}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(
        <RelationshipInHtmlTable
          relationships={relationships}
          relationshipId="r1"
          className="slice"
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table
        className="slice"
      >
        <thead>
          <tr>
            <th>
              t1
              .Id
            </th>
            <th>
              t2
              .Id
            </th>
            <th>
              t1.c1
            </th>
            <th>
              t2.c1
            </th>
            <th>
              t2.c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <th>
              r2
            </th>
            <td>
              1
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('idColumn', () => {
    act(() => {
      renderer = create(
        <RelationshipInHtmlTable
          relationships={relationships}
          relationshipId="r1"
          idColumn={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              t1.c1
            </th>
            <th>
              t2.c1
            </th>
            <th>
              t2.c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              1
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('headerRow', () => {
    act(() => {
      renderer = create(
        <RelationshipInHtmlTable
          relationships={relationships}
          relationshipId="r1"
          headerRow={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <th>
              r2
            </th>
            <td>
              1
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells array', () => {
    act(() => {
      renderer = create(
        <RelationshipInHtmlTable
          relationships={relationships}
          relationshipId="r1"
          customCells={['t1.c1', 't1.c3', 't2.c2', 't2.c1']}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              t1
              .Id
            </th>
            <th>
              t2
              .Id
            </th>
            <th>
              t1.c1
            </th>
            <th>
              t1.c3
            </th>
            <th>
              t2.c2
            </th>
            <th>
              t2.c1
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <th>
              r2
            </th>
            <td>
              1
            </td>
            <td />
            <td>
              4
            </td>
            <td>
              3
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells labels', () => {
    act(() => {
      renderer = create(
        <RelationshipInHtmlTable
          relationships={relationships}
          relationshipId="r1"
          customCells={{
            't1.c1': 'T1C1',
            't1.c3': 'T1C3',
            't2.c2': 'T2C2',
            't2.c1': 'T2C1',
          }}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              t1
              .Id
            </th>
            <th>
              t2
              .Id
            </th>
            <th>
              T1C1
            </th>
            <th>
              T1C3
            </th>
            <th>
              T2C2
            </th>
            <th>
              T2C1
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <th>
              r2
            </th>
            <td>
              1
            </td>
            <td />
            <td>
              4
            </td>
            <td>
              3
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells objects', () => {
    act(() => {
      renderer = create(
        <RelationshipInHtmlTable
          relationships={relationships}
          relationshipId="r1"
          customCells={{
            't1.c1': {
              label: 'T1C1',
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
            't2.c2': {
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
          }}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              t1
              .Id
            </th>
            <th>
              t2
              .Id
            </th>
            <th>
              T1C1
            </th>
            <th>
              t2.c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <th>
              r2
            </th>
            <td>
              <b>
                {"0":"r1","1":"c1","tableId":"t1","rowId":"r1","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r2","1":"c2","tableId":"t2","rowId":"r2","cellId":"c2"}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });
});

describe('ResultTableInHtmlTable', () => {
  test('basic', () => {
    act(() => {
      renderer = create(
        <ResultTableInHtmlTable queries={queries} queryId="q1" />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c0
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(
        <ResultTableInHtmlTable
          queries={queries}
          queryId="q1"
          className="table"
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table
        className="table"
      >
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c0
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('idColumn', () => {
    act(() => {
      renderer = create(
        <ResultTableInHtmlTable
          queries={queries}
          queryId="q1"
          idColumn={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              c0
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('headerRow', () => {
    act(() => {
      renderer = create(
        <ResultTableInHtmlTable
          queries={queries}
          queryId="q1"
          headerRow={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells array', () => {
    act(() => {
      renderer = create(
        <ResultTableInHtmlTable
          queries={queries}
          queryId="q1"
          customCells={['c3', 'c2']}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c3
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td />
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells labels', () => {
    act(() => {
      renderer = create(
        <ResultTableInHtmlTable
          queries={queries}
          queryId="q1"
          customCells={{c3: 'C3', c2: 'C2'}}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              C3
            </th>
            <th>
              C2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td />
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells objects', () => {
    act(() => {
      renderer = create(
        <ResultTableInHtmlTable
          queries={queries}
          queryId="q1"
          customCells={{
            c1: {
              label: 'C1',
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
            c2: {
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
          }}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              C1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              <b>
                {"0":"r1","1":"c1","queryId":"q1","rowId":"r1","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r1","1":"c2","queryId":"q1","rowId":"r1","cellId":"c2"}
              </b>
            </td>
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              <b>
                {"0":"r2","1":"c1","queryId":"q1","rowId":"r2","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r2","1":"c2","queryId":"q1","rowId":"r2","cellId":"c2"}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });
});

describe('ResultSortedTableInHtmlTable', () => {
  test('basic', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c0
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('paginator, larger', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          paginator={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <caption>
          2
           
          rows
        </caption>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c0
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('paginator, smaller', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          limit={1}
          paginator={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <caption>
          <button
            className="previous"
            disabled={true}
          >
            ←
          </button>
          <button
            className="next"
            disabled={false}
            onClick={[Function]}
          >
            →
          </button>
          1
           to 
          1
           of 
          2
           
          rows
        </caption>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c0
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('button')[1].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <caption>
          <button
            className="previous"
            disabled={false}
            onClick={[Function]}
          >
            ←
          </button>
          <button
            className="next"
            disabled={true}
          >
            →
          </button>
          2
           to 
          2
           of 
          2
           
          rows
        </caption>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c0
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('paginator, custom', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          limit={1}
          paginator={Custom}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <caption>
          <b>
            {"offset":0,"limit":1,"total":2}
          </b>
        </caption>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c0
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('no sorting specified', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable queries={queries} queryId="q1" />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              className="sorted ascending"
            >
              ↑ 
              Id
            </th>
            <th>
              c0
            </th>
            <th>
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          className="table"
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table
        className="table"
      >
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c0
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('idColumn', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          idColumn={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              c0
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              c1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('headerRow', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          headerRow={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells array', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          customCells={['c3', 'c2']}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              c3
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td />
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells labels', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          customCells={{c3: 'C3', c2: 'C2'}}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th>
              C3
            </th>
            <th>
              C2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td />
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td />
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });

  test('customCells objects', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          customCells={{
            c1: {
              label: 'C1',
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
            c2: {
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
          }}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th>
              Id
            </th>
            <th
              className="sorted descending"
            >
              ↓ 
              C1
            </th>
            <th>
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              <b>
                {"0":"r2","1":"c1","queryId":"q1","rowId":"r2","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r2","1":"c2","queryId":"q1","rowId":"r2","cellId":"c2"}
              </b>
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              <b>
                {"0":"r1","1":"c1","queryId":"q1","rowId":"r1","cellId":"c1"}
              </b>
            </td>
            <td>
              <b>
                {"0":"r1","1":"c2","queryId":"q1","rowId":"r1","cellId":"c2"}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });

  test('sortOnClick', () => {
    act(() => {
      renderer = create(
        <ResultSortedTableInHtmlTable
          queries={queries}
          queryId="q1"
          cellId="c1"
          descending={true}
          sortOnClick={true}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              onClick={[Function]}
            >
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c0
            </th>
            <th
              className="sorted descending"
              onClick={[Function]}
            >
              ↓ 
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[1].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              onClick={[Function]}
            >
              Id
            </th>
            <th
              className="sorted ascending"
              onClick={[Function]}
            >
              ↑ 
              c0
            </th>
            <th
              onClick={[Function]}
            >
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[2].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              onClick={[Function]}
            >
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c0
            </th>
            <th
              className="sorted ascending"
              onClick={[Function]}
            >
              ↑ 
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[2].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              onClick={[Function]}
            >
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c0
            </th>
            <th
              className="sorted descending"
              onClick={[Function]}
            >
              ↓ 
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[0].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              className="sorted ascending"
              onClick={[Function]}
            >
              ↑ 
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c0
            </th>
            <th
              onClick={[Function]}
            >
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
        </tbody>
      </table>
    `);
    act(() => {
      renderer.root.findAllByType('th')[0].props.onClick();
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <table>
        <thead>
          <tr>
            <th
              className="sorted descending"
              onClick={[Function]}
            >
              ↓ 
              Id
            </th>
            <th
              onClick={[Function]}
            >
              c0
            </th>
            <th
              onClick={[Function]}
            >
              c1
            </th>
            <th
              onClick={[Function]}
            >
              c2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              r2
            </th>
            <td>
              34
            </td>
            <td>
              3
            </td>
            <td>
              4
            </td>
          </tr>
          <tr>
            <th>
              r1
            </th>
            <td>
              2_
            </td>
            <td>
              2
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    `);
  });
});

describe('EditableCellView', () => {
  test('basic', () => {
    act(() => {
      renderer = create(
        <EditableCellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={1}
        />
      </div>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(
        <EditableCellView
          store={store}
          tableId="t1"
          rowId="r1"
          cellId="c1"
          className="e"
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="e"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={1}
        />
      </div>
    `);
  });

  test('showType', () => {
    act(() => {
      renderer = create(
        <EditableCellView
          store={store}
          tableId="t1"
          rowId="r1"
          cellId="c1"
          showType={false}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <input
          onChange={[Function]}
          type="number"
          value={1}
        />
      </div>
    `);
  });

  test('change type and Cell', () => {
    act(() => {
      renderer = create(
        <EditableCellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
      );
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={1}
        />
      </div>
    `);
    act(() => {
      renderer.root
        .findAllByType('input')[0]
        .props.onChange({currentTarget: {value: 2}});
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 2}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={2}
        />
      </div>
    `);
    act(() => {
      renderer.root.findAllByType('button')[0].props.onClick();
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: true}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="boolean"
          onClick={[Function]}
        >
          boolean
        </button>
        <input
          checked={true}
          onChange={[Function]}
          type="checkbox"
        />
      </div>
    `);
    act(() => {
      renderer.root
        .findAllByType('input')[0]
        .props.onChange({currentTarget: {checked: false}});
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: false}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="boolean"
          onClick={[Function]}
        >
          boolean
        </button>
        <input
          checked={false}
          onChange={[Function]}
          type="checkbox"
        />
      </div>
    `);
    act(() => {
      renderer.root.findAllByType('button')[0].props.onClick();
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: '1'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="string"
          onClick={[Function]}
        >
          string
        </button>
        <input
          onChange={[Function]}
          value="1"
        />
      </div>
    `);
    act(() => {
      renderer.root
        .findAllByType('input')[0]
        .props.onChange({currentTarget: {value: 'two'}});
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 'two'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="string"
          onClick={[Function]}
        >
          string
        </button>
        <input
          onChange={[Function]}
          value="two"
        />
      </div>
    `);
    act(() => {
      renderer.root.findAllByType('button')[0].props.onClick();
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 2}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={2}
        />
      </div>
    `);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 3}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={3}
        />
      </div>
    `);
    act(() => {
      store.setCell('t1', 'r1', 'c1', true);
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: true}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="boolean"
          onClick={[Function]}
        >
          boolean
        </button>
        <input
          checked={true}
          onChange={[Function]}
          type="checkbox"
        />
      </div>
    `);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 'three');
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 'three'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableCell"
      >
        <button
          className="string"
          onClick={[Function]}
        >
          string
        </button>
        <input
          onChange={[Function]}
          value="three"
        />
      </div>
    `);
  });
});

describe('EditableValueView', () => {
  test('basic', () => {
    act(() => {
      renderer = create(<EditableValueView store={store} valueId="v1" />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={1}
        />
      </div>
    `);
  });

  test('className', () => {
    act(() => {
      renderer = create(<EditableValueView valueId="v1" className="e" />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="e"
      >
        <button
          onClick={[Function]}
        />
        <input
          onChange={[Function]}
          type="checkbox"
        />
      </div>
    `);
  });

  test('showType', () => {
    act(() => {
      renderer = create(<EditableValueView valueId="v1" showType={false} />);
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <input
          onChange={[Function]}
          type="checkbox"
        />
      </div>
    `);
  });

  test('change type and Value', () => {
    act(() => {
      renderer = create(<EditableValueView store={store} valueId="v1" />);
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={1}
        />
      </div>
    `);
    act(() => {
      renderer.root
        .findAllByType('input')[0]
        .props.onChange({currentTarget: {value: 2}});
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 2, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={2}
        />
      </div>
    `);
    act(() => {
      renderer.root.findAllByType('button')[0].props.onClick();
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: true, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="boolean"
          onClick={[Function]}
        >
          boolean
        </button>
        <input
          checked={true}
          onChange={[Function]}
          type="checkbox"
        />
      </div>
    `);
    act(() => {
      renderer.root
        .findAllByType('input')[0]
        .props.onChange({currentTarget: {checked: false}});
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: false, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="boolean"
          onClick={[Function]}
        >
          boolean
        </button>
        <input
          checked={false}
          onChange={[Function]}
          type="checkbox"
        />
      </div>
    `);
    act(() => {
      renderer.root.findAllByType('button')[0].props.onClick();
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: '1', v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="string"
          onClick={[Function]}
        >
          string
        </button>
        <input
          onChange={[Function]}
          value="1"
        />
      </div>
    `);
    act(() => {
      renderer.root
        .findAllByType('input')[0]
        .props.onChange({currentTarget: {value: 'two'}});
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 'two', v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="string"
          onClick={[Function]}
        >
          string
        </button>
        <input
          onChange={[Function]}
          value="two"
        />
      </div>
    `);
    act(() => {
      renderer.root.findAllByType('button')[0].props.onClick();
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 2, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={2}
        />
      </div>
    `);
    act(() => {
      store.setValue('v1', 3);
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 3, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="number"
          onClick={[Function]}
        >
          number
        </button>
        <input
          onChange={[Function]}
          type="number"
          value={3}
        />
      </div>
    `);
    act(() => {
      store.setValue('v1', true);
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: true, v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="boolean"
          onClick={[Function]}
        >
          boolean
        </button>
        <input
          checked={true}
          onChange={[Function]}
          type="checkbox"
        />
      </div>
    `);
    act(() => {
      store.setValue('v1', 'three');
    });
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 'three', v2: 2},
    ]);
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div
        className="editableValue"
      >
        <button
          className="string"
          onClick={[Function]}
        >
          string
        </button>
        <input
          onChange={[Function]}
          value="three"
        />
      </div>
    `);
  });
});

describe('SortedTablePaginator', () => {
  test('basic', () => {
    act(() => {
      renderer = create(
        <SortedTablePaginator onChange={nullEvent} total={100} />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        "100",
        " ",
        "rows",
      ]
    `);
  });

  test('limit', () => {
    act(() => {
      renderer = create(
        <SortedTablePaginator onChange={nullEvent} total={100} limit={10} />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <button
          className="previous"
          disabled={true}
        >
          ←
        </button>,
        <button
          className="next"
          disabled={false}
          onClick={[Function]}
        >
          →
        </button>,
        "1",
        " to ",
        "10",
        " of ",
        "100",
        " ",
        "rows",
      ]
    `);
  });

  test('limit & offset', () => {
    act(() => {
      renderer = create(
        <SortedTablePaginator
          onChange={nullEvent}
          total={100}
          limit={10}
          offset={5}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <button
          className="previous"
          disabled={false}
          onClick={[Function]}
        >
          ←
        </button>,
        <button
          className="next"
          disabled={false}
          onClick={[Function]}
        >
          →
        </button>,
        "6",
        " to ",
        "15",
        " of ",
        "100",
        " ",
        "rows",
      ]
    `);
  });

  test('limit larger than size', () => {
    act(() => {
      renderer = create(
        <SortedTablePaginator onChange={nullEvent} total={100} limit={120} />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        "100",
        " ",
        "rows",
      ]
    `);
  });

  test('offset larger than size', () => {
    act(() => {
      renderer = create(
        <SortedTablePaginator
          onChange={nullEvent}
          total={100}
          offset={120}
          limit={10}
        />,
      );
    });
    act(() => {});
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <button
          className="previous"
          disabled={true}
        >
          ←
        </button>,
        <button
          className="next"
          disabled={false}
          onClick={[Function]}
        >
          →
        </button>,
        "1",
        " to ",
        "10",
        " of ",
        "100",
        " ",
        "rows",
      ]
    `);
  });

  test('offset smaller than 0', () => {
    act(() => {
      renderer = create(
        <SortedTablePaginator
          onChange={nullEvent}
          total={100}
          offset={-20}
          limit={10}
        />,
      );
    });
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <button
          className="previous"
          disabled={true}
        >
          ←
        </button>,
        <button
          className="next"
          disabled={false}
          onClick={[Function]}
        >
          →
        </button>,
        "1",
        " to ",
        "10",
        " of ",
        "100",
        " ",
        "rows",
      ]
    `);
  });
});
