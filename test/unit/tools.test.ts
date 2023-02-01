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
    store
      .setTables({
        t1: {r1: {c1: 2}, r2: {c1: 1, c2: 2}},
        t2: {r1: {c1: 'two'}},
        t3: {r1: {c1: false}},
        t4: {r1: {c1: 1}},
      })
      .setValues({v1: 1, v2: 2});
  });

  test('Basic', () => {
    expect(tools.getStoreStats()).toEqual({
      totalTables: 4,
      totalRows: 5,
      totalCells: 6,
      totalValues: 2,
      jsonLength: 132,
    });
  });

  test('Detailed', () => {
    expect(tools.getStoreStats(true)).toEqual({
      totalTables: 4,
      totalRows: 5,
      totalCells: 6,
      totalValues: 2,
      jsonLength: 132,
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

describe('TablesSchema', () => {
  test('Existing', () => {
    store.setTablesSchema({
      t1: {c1: {type: 'number', default: 1}, c2: {type: 'string'}},
    });
    expect(tools.getStoreTablesSchema()).toEqual({
      t1: {c1: {type: 'number', default: 1}, c2: {type: 'string'}},
    });
  });

  describe('Inferred', () => {
    test('All present', () => {
      store.setTables({
        t1: {r1: {c1: 1, c2: true}, r2: {c1: 2, c2: false}},
        t2: {r1: {c1: 'one'}},
      });
      expect(tools.getStoreTablesSchema()).toEqual({
        t1: {
          c1: {type: 'number', default: 1},
          c2: {type: 'boolean', default: true},
        },
        t2: {c1: {type: 'string', default: 'one'}},
      });
    });

    test('All present, default to most popular', () => {
      store.setTables({
        t1: {
          r1: {c1: 1, c2: true},
          r2: {c1: 2, c2: false},
          r3: {c1: 2, c2: true},
        },
        t2: {r1: {c1: 'one'}, r2: {c1: 'one'}, r3: {c1: 'two'}},
      });
      expect(tools.getStoreTablesSchema()).toEqual({
        t1: {
          c1: {type: 'number', default: 2},
          c2: {type: 'boolean', default: true},
        },
        t2: {c1: {type: 'string', default: 'one'}},
      });
    });

    test('Some present', () => {
      store.setTables({
        t1: {r1: {c2: true}, r2: {c1: 2, c2: false}},
        t2: {r1: {c1: 'one'}},
      });
      expect(tools.getStoreTablesSchema()).toEqual({
        t1: {c1: {type: 'number'}, c2: {type: 'boolean', default: true}},
        t2: {c1: {type: 'string', default: 'one'}},
      });
    });

    test('Interesting', () => {
      store.setTables({'': {'': {'': true}}});
      expect(tools.getStoreTablesSchema()).toEqual({
        '': {'': {default: true, type: 'boolean'}},
      });
    });

    test('Inconsistent', () => {
      store.setTables({
        t1: {r1: {c2: true}, r2: {c1: 2, c2: 3}},
        t2: {r1: {c1: 'one'}},
      });
      expect(tools.getStoreTablesSchema()).toEqual({});
    });
  });
});

describe('ValuesSchema', () => {
  test('Existing', () => {
    store.setValuesSchema({
      v1: {type: 'number', default: 1},
      v2: {type: 'string'},
    });
    expect(tools.getStoreValuesSchema()).toEqual({
      v1: {type: 'number', default: 1},
      v2: {type: 'string'},
    });
  });

  describe('Inferred', () => {
    test('All present', () => {
      store.setValues({v1: true, v2: 3, v3: 'yes'});
      expect(tools.getStoreValuesSchema()).toEqual({
        v1: {type: 'boolean'},
        v2: {type: 'number'},
        v3: {type: 'string'},
      });
    });

    test('Interesting', () => {
      store.setValues({'': true});
      expect(tools.getStoreValuesSchema()).toEqual({'': {type: 'boolean'}});
    });

    test('Empty', () => {
      store.setValues({});
      expect(tools.getStoreValuesSchema()).toEqual({});
    });
  });
});

describe('API', () => {
  test('No schema', () => {
    store.setTables({
      t1: {r1: {c2: true}, r2: {c1: 2, c2: 3}},
      t2: {r1: {c1: 'one'}},
    });
    expect(tools.getStoreApi('s')).toEqual(['', '', '', '']);
  });

  test('Unpretty tabular', () => {
    store.setTablesSchema({
      t1: {
        c1: {type: 'number', default: 1},
        c2: {type: 'string', default: 'two'},
        c3: {type: 'string', default: '3'},
        '': {type: 'string'},
      },
    });
    expect(tools.getStoreApi('s')).toMatchSnapshot();
  });

  test('Pretty tabular', async () => {
    store.setTablesSchema({
      t1: {
        c1: {type: 'number', default: 1},
        c2: {type: 'string', default: 'two'},
        c3: {type: 'string', default: '3'},
        '': {type: 'string'},
      },
    });
    const files = await tools.getPrettyStoreApi('s');
    expect(files).toMatchSnapshot();
  });

  test('Unpretty keyed value', () => {
    store.setValuesSchema({
      v1: {type: 'number', default: 1},
      v2: {type: 'string', default: 'two'},
      v3: {type: 'string', default: '3'},
      '': {type: 'string'},
    });
    expect(tools.getStoreApi('s')).toMatchSnapshot();
  });

  test('Pretty keyed value', async () => {
    store.setValuesSchema({
      v1: {type: 'number', default: 1},
      v2: {type: 'string', default: 'two'},
      v3: {type: 'string', default: '3'},
      '': {type: 'string'},
    });
    const files = await tools.getPrettyStoreApi('s');
    expect(files).toMatchSnapshot();
  });

  test('Unpretty both', () => {
    store
      .setTablesSchema({
        t1: {
          c1: {type: 'number', default: 1},
          c2: {type: 'string', default: 'two'},
          c3: {type: 'string', default: '3'},
          '': {type: 'string'},
        },
      })
      .setValuesSchema({
        v1: {type: 'number', default: 1},
        v2: {type: 'string', default: 'two'},
        v3: {type: 'string', default: '3'},
        '': {type: 'string'},
      });

    expect(tools.getStoreApi('s')).toMatchSnapshot();
  });

  test('Pretty both', async () => {
    store
      .setTablesSchema({
        t1: {
          c1: {type: 'number', default: 1},
          c2: {type: 'string', default: 'two'},
          c3: {type: 'string', default: '3'},
          '': {type: 'string'},
        },
      })
      .setValuesSchema({
        v1: {type: 'number', default: 1},
        v2: {type: 'string', default: 'two'},
        v3: {type: 'string', default: '3'},
        '': {type: 'string'},
      });

    const files = await tools.getPrettyStoreApi('s');
    expect(files).toMatchSnapshot();
  });
});
