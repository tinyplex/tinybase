/* eslint-disable max-len */
/* eslint-disable react/jsx-no-useless-fragment */

import {
  CellInHtmlTd,
  RowInHtmlTr,
  SortedTableInHtmlTable,
  TableInHtmlTable,
  ValueInHtmlTr,
  ValuesInHtmlTable,
} from 'tinybase/debug/ui-react-dom';
import {Id, Store, createStore} from 'tinybase/debug';
import {ReactTestRenderer, act, create} from 'react-test-renderer';
import {ExtraProps} from 'tinybase/debug/ui-react';
import React from 'react';

let store: Store;
let renderer: ReactTestRenderer;

const Custom = ({store: _store, ...props}: ExtraProps) => (
  <b>{JSON.stringify(props)}</b>
);

const getIdAsProp = (id: Id) => ({id});

beforeEach(() => {
  store = createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 1, v2: 2});
});

describe('Read Components', () => {
  describe('TableInHtmlTable', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(<TableInHtmlTable store={store} tableId="t2" />);
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <table>
          <tbody>
            <tr>
              <td>
                2
              </td>
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

    test('Custom', () => {
      act(() => {
        renderer = create(
          <TableInHtmlTable
            store={store}
            tableId="t2"
            rowComponent={Custom}
            getRowComponentProps={getIdAsProp}
          />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <table>
          <tbody>
            <b>
              {"id":"r1","tableId":"t2","rowId":"r1"}
            </b>
            <b>
              {"id":"r2","tableId":"t2","rowId":"r2"}
            </b>
          </tbody>
        </table>
      `);
    });

    test('Class', () => {
      act(() => {
        renderer = create(
          <TableInHtmlTable store={store} tableId="t2" className="table" />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <table
          className="table"
        >
          <tbody>
            <tr>
              <td>
                2
              </td>
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
  });

  describe('SortedTableInHtmlTable', () => {
    test('Basic', () => {
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
            </tr>
          </tbody>
        </table>
      `);
    });

    test('Custom', () => {
      act(() => {
        renderer = create(
          <SortedTableInHtmlTable
            store={store}
            tableId="t2"
            cellId="c1"
            descending={true}
            rowComponent={Custom}
            getRowComponentProps={getIdAsProp}
          />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <table>
          <tbody>
            <b>
              {"id":"r2","tableId":"t2","rowId":"r2"}
            </b>
            <b>
              {"id":"r1","tableId":"t2","rowId":"r1"}
            </b>
          </tbody>
        </table>
      `);
    });

    test('Class', () => {
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
            </tr>
          </tbody>
        </table>
      `);
    });
  });

  describe('DomRowView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(
          <RowInHtmlTr store={store} tableId="t2" rowId="r2" />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <tr>
          <td>
            3
          </td>
          <td>
            4
          </td>
        </tr>
      `);
    });

    test('Custom', () => {
      act(() => {
        renderer = create(
          <RowInHtmlTr
            store={store}
            tableId="t2"
            rowId="r2"
            cellComponent={Custom}
            getCellComponentProps={getIdAsProp}
          />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <tr>
          <b>
            {"id":"c1","tableId":"t2","rowId":"r2","cellId":"c1"}
          </b>
          <b>
            {"id":"c2","tableId":"t2","rowId":"r2","cellId":"c2"}
          </b>
        </tr>
      `);
    });

    test('Class', () => {
      act(() => {
        renderer = create(
          <RowInHtmlTr store={store} tableId="t2" rowId="r2" className="row" />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <tr
          className="row"
        >
          <td>
            3
          </td>
          <td>
            4
          </td>
        </tr>
      `);
    });
  });

  describe('DomCellView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(
          <CellInHtmlTd store={store} tableId="t2" rowId="r2" cellId="c2" />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <td>
          4
        </td>
      `);
    });

    test('Class', () => {
      act(() => {
        renderer = create(
          <CellInHtmlTd
            store={store}
            tableId="t2"
            rowId="r2"
            cellId="c2"
            className="cell"
          />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <td
          className="cell"
        >
          4
        </td>
      `);
    });
  });

  describe('ValuesInHtmlTable', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(<ValuesInHtmlTable store={store} />);
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <table>
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

    test('Custom', () => {
      act(() => {
        renderer = create(
          <ValuesInHtmlTable
            store={store}
            valueComponent={Custom}
            getValueComponentProps={getIdAsProp}
          />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <table>
          <tbody>
            <b>
              {"id":"v1","valueId":"v1"}
            </b>
            <b>
              {"id":"v2","valueId":"v2"}
            </b>
          </tbody>
        </table>
      `);
    });

    test('Class', () => {
      act(() => {
        renderer = create(
          <ValuesInHtmlTable store={store} className="values" />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <table
          className="values"
        >
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

  describe('ValueInHtmlTr', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(<ValueInHtmlTr store={store} valueId="v1" />);
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <tr>
          <td>
            1
          </td>
        </tr>
      `);
    });

    test('Class', () => {
      act(() => {
        renderer = create(
          <ValueInHtmlTr store={store} valueId="v1" className="value" />,
        );
      });
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <tr
          className="value"
        >
          <td>
            1
          </td>
        </tr>
      `);
    });
  });
});
