/* eslint-disable max-len */
/* eslint-disable react/jsx-no-useless-fragment */

import {Ids, Queries, Store, createQueries, createStore} from 'tinybase/debug';
import {ReactTestRenderer, act, create} from 'react-test-renderer';
import {
  ResultSortedTableInHtmlTable,
  ResultTableInHtmlTable,
  SortedTableInHtmlTable,
  TableInHtmlTable,
  ValuesInHtmlTable,
} from 'tinybase/debug/ui-react-dom';
import {ExtraProps} from 'tinybase/debug/ui-react';
import React from 'react';

let store: Store;
let queries: Queries;
let renderer: ReactTestRenderer;

const Custom = ({store: _store, queries: _queries, ...props}: ExtraProps) => (
  <b>{JSON.stringify(props)}</b>
);

const getIdsAsProp = (...ids: Ids) => ({...ids});

beforeEach(() => {
  store = createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 1, v2: 2});
  queries = createQueries(store).setQueryDefinition('q1', 't2', ({select}) => {
    select(
      (getTableCell) => '' + getTableCell('c1') + (getTableCell('c2') ?? '_'),
    ).as('c0');
    select('c1');
    select('c2');
  });
});

describe('Components', () => {
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
            customCells={{c3: 'C three', c2: 'C two'}}
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
                C three
              </th>
              <th>
                C two
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
                label: 'C one',
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
                C one
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

    test('no sorting specified', () => {
      act(() => {
        renderer = create(
          <SortedTableInHtmlTable store={store} tableId="t2" />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <table>
          <thead>
            <tr>
              <th
                className="sorted ascending"
              >
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
            customCells={{c3: 'C three', c2: 'C two'}}
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
                C three
              </th>
              <th>
                C two
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
                label: 'C one',
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
                C one
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
        renderer = create(
          <ValuesInHtmlTable store={store} className="values" />,
        );
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
            customCells={{c3: 'C three', c2: 'C two'}}
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
                C three
              </th>
              <th>
                C two
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
                label: 'C one',
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
                C one
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
            customCells={{c3: 'C three', c2: 'C two'}}
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
                C three
              </th>
              <th>
                C two
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
                label: 'C one',
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
                C one
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
});
