import {Store, createStore} from '../../lib/debug/tinybase';
import {Tools, createTools} from '../../lib/debug/tools';

let store: Store;
let tools: Tools;

beforeEach(() => {
  store = createStore();
  tools = createTools(store);
});

describe('Stats', () => {
  beforeEach(() => {
    store.setTables({
      t1: {r1: {c1: 2}, r2: {c1: 1, c2: 2}},
      t2: {r1: {c1: 'two'}},
      t3: {r1: {c1: false}},
      t4: {r1: {c1: 1}},
    });
  });

  test('Basic', () => {
    expect(tools.getStoreStats()).toEqual({
      totalTables: 4,
      totalRows: 5,
      totalCells: 6,
      jsonLength: 114,
    });
  });

  test('Detailed', () => {
    expect(tools.getStoreStats(true)).toEqual({
      totalTables: 4,
      totalRows: 5,
      totalCells: 6,
      jsonLength: 114,
      detail: {
        tables: {
          t1: {
            rows: {r1: {rowCells: 1}, r2: {rowCells: 2}},
            tableCells: 3,
            tableRows: 2,
          },
          t2: {rows: {r1: {rowCells: 1}}, tableCells: 1, tableRows: 1},
          t3: {rows: {r1: {rowCells: 1}}, tableCells: 1, tableRows: 1},
          t4: {rows: {r1: {rowCells: 1}}, tableCells: 1, tableRows: 1},
        },
      },
    });
  });
});

describe('Schema', () => {
  test('Existing', () => {
    store.setSchema({
      t1: {c1: {type: 'number', default: 1}, c2: {type: 'string'}},
    });
    expect(tools.getStoreSchema()).toEqual({
      t1: {c1: {type: 'number', default: 1}, c2: {type: 'string'}},
    });
  });
});
