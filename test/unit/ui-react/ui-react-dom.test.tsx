/* eslint-disable max-len */
/* eslint-disable react/jsx-no-useless-fragment */

import {
  DomSortedTableView,
  DomTableCellView,
  DomTableRowView,
  DomTableView,
} from 'tinybase/debug/ui-react-dom';
import {Id, Store, createStore} from 'tinybase/debug';
import {ReactTestRenderer, act, create} from 'react-test-renderer';
import {ExtraProps} from 'tinybase/debug/ui-react';
import React from 'react';

let store: Store;
let renderer: ReactTestRenderer;

const Custom = (props: ExtraProps) => <b>{JSON.stringify(props)}</b>;

const getIdAsProp = (id: Id) => ({id});

beforeEach(() => {
  store = createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 3, v2: 4});
});

describe('Read Components', () => {
  describe('DomTableView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(<DomTableView store={store} tableId="t2" />);
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
          <DomTableView
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
              {"id":"r1","tableId":"t2","rowId":"r1","store":{}}
            </b>
            <b>
              {"id":"r2","tableId":"t2","rowId":"r2","store":{}}
            </b>
          </tbody>
        </table>
      `);
    });

    test('Class', () => {
      act(() => {
        renderer = create(
          <DomTableView store={store} tableId="t2" className="table" />,
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

  describe('DomSortedTableView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(
          <DomSortedTableView
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
          <DomSortedTableView
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
              {"id":"r2","tableId":"t2","rowId":"r2","store":{}}
            </b>
            <b>
              {"id":"r1","tableId":"t2","rowId":"r1","store":{}}
            </b>
          </tbody>
        </table>
      `);
    });

    test('Class', () => {
      act(() => {
        renderer = create(
          <DomSortedTableView
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
          <DomTableRowView store={store} tableId="t2" rowId="r2" />,
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
          <DomTableRowView
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
            {"id":"c1","tableId":"t2","rowId":"r2","cellId":"c1","store":{}}
          </b>
          <b>
            {"id":"c2","tableId":"t2","rowId":"r2","cellId":"c2","store":{}}
          </b>
        </tr>
      `);
    });

    test('Class', () => {
      act(() => {
        renderer = create(
          <DomTableRowView
            store={store}
            tableId="t2"
            rowId="r2"
            className="row"
          />,
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
          <DomTableCellView
            store={store}
            tableId="t2"
            rowId="r2"
            cellId="c2"
          />,
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
          <DomTableCellView
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
});
