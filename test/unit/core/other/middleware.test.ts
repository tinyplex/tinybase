import {beforeEach, describe, expect, test, vi} from 'vitest';

import type {Middleware, Store} from 'tinybase';
import {createMiddleware, createStore} from 'tinybase';

let store: Store;
let middleware: Middleware;

beforeEach(() => {
  store = createStore();
  middleware = createMiddleware(store);
});

describe('Creates', () => {
  test('basic', () => {
    expect(middleware).toBeDefined();
  });

  test('getStore', () => {
    expect(middleware.getStore()).toBe(store);
  });

  test('same middleware for same store', () => {
    expect(createMiddleware(store)).toBe(middleware);
  });
});

describe('Destroys', () => {
  test('basic', () => {
    middleware.destroy();
  });
});
describe('willSetTables', () => {
  describe('passthrough', () => {
    test('returns same tables', () => {
      middleware.addWillSetTablesCallback((tables) => {
        return tables;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });
  });

  describe('transform', () => {
    test('modifies tables by adding a table', () => {
      middleware.addWillSetTablesCallback((tables) => {
        return {...tables, t2: {r1: {c1: 1}}};
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        t2: {r1: {c1: 1}},
      });
    });

    test('modifies tables by removing a table', () => {
      middleware.addWillSetTablesCallback((tables) => {
        const {t2: _, ...rest} = tables;
        return rest;
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('modifies tables by transforming cell contents', () => {
      middleware.addWillSetTablesCallback((tables) => {
        return Object.fromEntries(
          Object.entries(tables).map(([tableId, table]) => [
            tableId,
            Object.fromEntries(
              Object.entries(table).map(([rowId, row]) => [
                rowId,
                Object.fromEntries(
                  Object.entries(row).map(([k, v]) => [
                    k,
                    typeof v === 'string' ? v.toUpperCase() : v,
                  ]),
                ),
              ]),
            ),
          ]),
        );
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'A'}},
        t2: {r1: {c1: 'B'}},
      });
    });
  });

  describe('block', () => {
    test('returning undefined blocks the tables set', () => {
      middleware.addWillSetTablesCallback(() => {
        return undefined;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(store.getTables()).toEqual({});
    });

    test('conditionally blocks', () => {
      middleware.addWillSetTablesCallback((tables) => {
        return 'banned' in tables ? undefined : tables;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
      store.setTables({banned: {r1: {c1: 1}}, t2: {r1: {c1: 'b'}}});
      // blocked, so t1 from previous setTables remains
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });
  });

  describe('chaining', () => {
    test('multiple callbacks applied in order', () => {
      middleware
        .addWillSetTablesCallback((tables) => {
          return {...tables, step1: {r1: {done: true}}};
        })
        .addWillSetTablesCallback((tables) => {
          return {...tables, step2: {r1: {done: true}}};
        });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        step1: {r1: {done: true}},
        step2: {r1: {done: true}},
      });
    });

    test('second callback sees transformed tables from first', () => {
      const seen: any[] = [];
      middleware
        .addWillSetTablesCallback((tables) => {
          seen.push({...tables});
          return {...tables, added: {r1: {c1: 1}}};
        })
        .addWillSetTablesCallback((tables) => {
          seen.push({...tables});
          return tables;
        });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(seen).toEqual([
        {t1: {r1: {c1: 'a'}}},
        {t1: {r1: {c1: 'a'}}, added: {r1: {c1: 1}}},
      ]);
    });

    test('first callback blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillSetTablesCallback(() => undefined)
        .addWillSetTablesCallback((tables) => {
          secondCalled();
          return tables;
        });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getTables()).toEqual({});
    });

    test('second of three callbacks blocks, third never called', () => {
      const thirdCalled = vi.fn();
      middleware
        .addWillSetTablesCallback((tables) => tables)
        .addWillSetTablesCallback(() => undefined)
        .addWillSetTablesCallback((tables) => {
          thirdCalled();
          return tables;
        });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(thirdCalled).not.toHaveBeenCalled();
    });
  });

  describe('entry points', () => {
    test('called from setTables', () => {
      const calls: any[] = [];
      middleware.addWillSetTablesCallback((tables) => {
        calls.push(tables);
        return tables;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(calls).toEqual([{t1: {r1: {c1: 'a'}}}]);
    });

    test('not called from setTable', () => {
      const calls: any[] = [];
      middleware.addWillSetTablesCallback((tables) => {
        calls.push(tables);
        return tables;
      });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('not called from setRow', () => {
      const calls: any[] = [];
      middleware.addWillSetTablesCallback((tables) => {
        calls.push(tables);
        return tables;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('not called from delTables', () => {
      const calls: any[] = [];
      middleware.addWillSetTablesCallback((tables) => {
        calls.push(tables);
        return tables;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      calls.length = 0;
      store.delTables();
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({});
    });

    test('transform applies from setTables', () => {
      middleware.addWillSetTablesCallback((tables) =>
        Object.fromEntries(
          Object.entries(tables).map(([tableId, table]) => [
            tableId,
            Object.fromEntries(
              Object.entries(table).map(([rowId, row]) => [
                rowId,
                Object.fromEntries(
                  Object.entries(row).map(([k, v]) => [
                    k,
                    typeof v === 'string' ? v.toUpperCase() : v,
                  ]),
                ),
              ]),
            ),
          ]),
        ),
      );
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'A'}},
        t2: {r1: {c1: 'B'}},
      });
    });

    test('block from setTables blocks all tables', () => {
      middleware.addWillSetTablesCallback(() => undefined);
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      expect(store.getTables()).toEqual({});
    });
  });

  describe('interaction with willSetTable', () => {
    test('willSetTables runs before willSetTable', () => {
      const order: string[] = [];
      middleware
        .addWillSetTablesCallback((tables) => {
          order.push('tables');
          return tables;
        })
        .addWillSetTableCallback((_tableId, table) => {
          order.push('table');
          return table;
        });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(order).toEqual(['tables', 'table']);
    });

    test('willSetTables transforms are seen by willSetTable', () => {
      middleware
        .addWillSetTablesCallback((tables) => ({
          ...tables,
          extra: {r1: {c1: 'added'}},
        }))
        .addWillSetTableCallback((_tableId, table) =>
          Object.fromEntries(
            Object.entries(table).map(([rowId, row]) => [
              rowId,
              Object.fromEntries(
                Object.entries(row).map(([k, v]) => [
                  k,
                  typeof v === 'string' ? v.toUpperCase() : v,
                ]),
              ),
            ]),
          ),
        );
      store.setTables({t1: {r1: {c1: 'hello'}}});
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'HELLO'}},
        extra: {r1: {c1: 'ADDED'}},
      });
    });

    test('willSetTables block prevents willSetTable from being called', () => {
      const tableCallback = vi.fn(
        (_tableId: any, table: any) => table,
      );
      middleware
        .addWillSetTablesCallback(() => undefined)
        .addWillSetTableCallback(tableCallback);
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(tableCallback).not.toHaveBeenCalled();
    });
  });
});

describe('willSetTable', () => {
  describe('passthrough', () => {
    test('returns same table', () => {
      middleware.addWillSetTableCallback((_tableId, table) => {
        return table;
      });
      store.setTable('t1', {r1: {c1: 'a', c2: 'b'}});
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a', c2: 'b'}});
    });
  });

  describe('transform', () => {
    test('modifies table by adding a row', () => {
      middleware.addWillSetTableCallback((_tableId, table) => {
        return {...table, r2: {c1: 'added'}};
      });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(store.getTable('t1')).toEqual({
        r1: {c1: 'a'},
        r2: {c1: 'added'},
      });
    });

    test('modifies table by removing a row', () => {
      middleware.addWillSetTableCallback((_tableId, table) => {
        const {r2: _, ...rest} = table;
        return rest;
      });
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c2: 'b'}});
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}});
    });

    test('modifies table by transforming cell values', () => {
      middleware.addWillSetTableCallback((_tableId, table) => {
        return Object.fromEntries(
          Object.entries(table).map(([rowId, row]) => [
            rowId,
            Object.fromEntries(
              Object.entries(row).map(([k, v]) => [
                k,
                typeof v === 'string' ? v.toUpperCase() : v,
              ]),
            ),
          ]),
        );
      });
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      expect(store.getTable('t1')).toEqual({
        r1: {c1: 'A'},
        r2: {c1: 'B'},
      });
    });

    test('transform based on tableId', () => {
      middleware.addWillSetTableCallback((tableId, table) => {
        if (tableId === 't1') {
          return {...table, extra: {source: 't1'}};
        }
        return table;
      });
      store.setTable('t1', {r1: {c1: 'a'}});
      store.setTable('t2', {r1: {c1: 'a'}});
      expect(store.getTable('t1')).toEqual({
        r1: {c1: 'a'},
        extra: {source: 't1'},
      });
      expect(store.getTable('t2')).toEqual({r1: {c1: 'a'}});
    });
  });

  describe('block', () => {
    test('returning undefined blocks the table set', () => {
      middleware.addWillSetTableCallback(() => {
        return undefined;
      });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(store.getTable('t1')).toEqual({});
      expect(store.getTables()).toEqual({});
    });

    test('conditionally blocks', () => {
      middleware.addWillSetTableCallback((tableId, table) => {
        return tableId === 'locked' ? undefined : table;
      });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}});
      store.setTable('locked', {r1: {c1: 'a'}});
      expect(store.getTable('locked')).toEqual({});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });
  });

  describe('chaining', () => {
    test('multiple callbacks applied in order', () => {
      middleware
        .addWillSetTableCallback((_tableId, table) => {
          return {...table, step1: {done: true}};
        })
        .addWillSetTableCallback((_tableId, table) => {
          return {...table, step2: {done: true}};
        });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(store.getTable('t1')).toEqual({
        r1: {c1: 'a'},
        step1: {done: true},
        step2: {done: true},
      });
    });

    test('second callback sees transformed table from first', () => {
      const seen: any[] = [];
      middleware
        .addWillSetTableCallback((_tableId, table) => {
          seen.push({...table});
          return {...table, added: {v: 1}};
        })
        .addWillSetTableCallback((_tableId, table) => {
          seen.push({...table});
          return table;
        });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(seen).toEqual([
        {r1: {c1: 'a'}},
        {r1: {c1: 'a'}, added: {v: 1}},
      ]);
    });

    test('first callback blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillSetTableCallback(() => undefined)
        .addWillSetTableCallback((_tableId, table) => {
          secondCalled();
          return table;
        });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getTables()).toEqual({});
    });

    test('second of three callbacks blocks, third never called', () => {
      const thirdCalled = vi.fn();
      middleware
        .addWillSetTableCallback((_tableId, table) => table)
        .addWillSetTableCallback(() => undefined)
        .addWillSetTableCallback((_tableId, table) => {
          thirdCalled();
          return table;
        });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(thirdCalled).not.toHaveBeenCalled();
    });
  });

  describe('entry points', () => {
    test('called from setTable', () => {
      const calls: string[] = [];
      middleware.addWillSetTableCallback((tableId, table) => {
        calls.push(tableId);
        return table;
      });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(calls).toEqual(['t1']);
    });

    test('called from setTables', () => {
      const calls: string[] = [];
      middleware.addWillSetTableCallback((tableId, table) => {
        calls.push(tableId);
        return table;
      });
      store.setTables({t1: {r1: {c1: 1}}, t2: {r1: {c2: 2}}});
      expect(calls).toEqual(['t1', 't2']);
    });

    test('transform applies from setTables', () => {
      middleware.addWillSetTableCallback((_tableId, table) =>
        Object.fromEntries(
          Object.entries(table).map(([rowId, row]) => [
            rowId,
            Object.fromEntries(
              Object.entries(row).map(([k, v]) => [
                k,
                typeof v === 'number' ? v + 1 : v,
              ]),
            ),
          ]),
        ),
      );
      store.setTables({t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}}});
      expect(store.getTable('t1')).toEqual({r1: {c1: 2}});
      expect(store.getTable('t2')).toEqual({r1: {c1: 3}});
    });

    test('block from setTables blocks individual tables', () => {
      middleware.addWillSetTableCallback((tableId, table) =>
        tableId === 't2' ? undefined : table,
      );
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c2: 'b'}}});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });
  });

  describe('interaction with willSetRow', () => {
    test('willSetTable runs before willSetRow', () => {
      const order: string[] = [];
      middleware
        .addWillSetTableCallback((_tableId, table) => {
          order.push('table');
          return table;
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push('row');
          return row;
        });
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(order).toEqual(['table', 'row']);
    });

    test('willSetTable transforms are seen by willSetRow', () => {
      middleware
        .addWillSetTableCallback((_tableId, table) => ({
          ...table,
          extra: {added: 'yes'},
        }))
        .addWillSetRowCallback((_tableId, _rowId, row) =>
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [
              k,
              typeof v === 'string' ? v.toUpperCase() : v,
            ]),
          ),
        );
      store.setTable('t1', {r1: {c1: 'hello'}});
      expect(store.getTable('t1')).toEqual({
        r1: {c1: 'HELLO'},
        extra: {added: 'YES'},
      });
    });

    test('willSetTable block prevents willSetRow from being called', () => {
      const rowCallback = vi.fn(
        (_tableId: any, _rowId: any, row: any) => row,
      );
      middleware
        .addWillSetTableCallback(() => undefined)
        .addWillSetRowCallback(rowCallback);
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(rowCallback).not.toHaveBeenCalled();
    });
  });
});

describe('willSetRow', () => {
  describe('passthrough', () => {
    test('returns same row', () => {
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => {
        return row;
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 'b'});
    });
  });

  describe('transform', () => {
    test('modifies row by adding a cell', () => {
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => {
        return {...row, c2: 1};
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 1});
    });

    test('modifies row by removing a cell', () => {
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => {
        const {c2: _, ...rest} = row;
        return rest;
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
    });

    test('modifies row by transforming cell values', () => {
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => {
        return Object.fromEntries(
          Object.entries(row).map(([k, v]) => [
            k,
            typeof v === 'string' ? v.toUpperCase() : v,
          ]),
        );
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'A', c2: 'B'});
    });

    test('transform based on tableId', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) => {
        if (tableId === 't1') {
          return {...row, source: 't1'};
        }
        return row;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      store.setRow('t2', 'r1', {c1: 'a'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', source: 't1'});
      expect(store.getRow('t2', 'r1')).toEqual({c1: 'a'});
    });
  });

  describe('block', () => {
    test('returning undefined blocks the row set', () => {
      middleware.addWillSetRowCallback(() => {
        return undefined;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(store.getRow('t1', 'r1')).toEqual({});
      expect(store.getTables()).toEqual({});
    });

    test('conditionally blocks', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) => {
        return tableId === 'locked' ? undefined : row;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
      store.setRow('locked', 'r1', {c1: 'a'});
      expect(store.getRow('locked', 'r1')).toEqual({});
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });
  });

  describe('chaining', () => {
    test('multiple callbacks applied in order', () => {
      middleware
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          return {...row, step1: true};
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          return {...row, step2: true};
        });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(store.getRow('t1', 'r1')).toEqual({
        c1: 'a',
        step1: true,
        step2: true,
      });
    });

    test('second callback sees transformed row from first', () => {
      const seen: any[] = [];
      middleware
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          seen.push({...row});
          return {...row, added: 1};
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          seen.push({...row});
          return row;
        });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(seen).toEqual([{c1: 'a'}, {c1: 'a', added: 1}]);
    });

    test('first callback blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillSetRowCallback(() => undefined)
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          secondCalled();
          return row;
        });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getTables()).toEqual({});
    });

    test('second of three callbacks blocks, third never called', () => {
      const thirdCalled = vi.fn();
      middleware
        .addWillSetRowCallback((_tableId, _rowId, row) => row)
        .addWillSetRowCallback(() => undefined)
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          thirdCalled();
          return row;
        });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(thirdCalled).not.toHaveBeenCalled();
    });
  });

  describe('entry points', () => {
    test('called from setRow', () => {
      const calls: string[] = [];
      middleware.addWillSetRowCallback((tableId, rowId, row) => {
        calls.push(`${tableId}/${rowId}`);
        return row;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(calls).toEqual(['t1/r1']);
    });

    test('called from setTable', () => {
      const calls: string[] = [];
      middleware.addWillSetRowCallback((tableId, rowId, row) => {
        calls.push(`${tableId}/${rowId}`);
        return row;
      });
      store.setTable('t1', {r1: {c1: 1}, r2: {c2: 2}});
      expect(calls).toEqual(['t1/r1', 't1/r2']);
    });

    test('called from setTables', () => {
      const calls: string[] = [];
      middleware.addWillSetRowCallback((tableId, rowId, row) => {
        calls.push(`${tableId}/${rowId}`);
        return row;
      });
      store.setTables({t1: {r1: {c1: 1}}, t2: {r1: {c2: 2}}});
      expect(calls).toEqual(['t1/r1', 't2/r1']);
    });

    test('called from addRow', () => {
      const calls: string[] = [];
      middleware.addWillSetRowCallback((tableId, rowId, row) => {
        calls.push(`${tableId}/${rowId}`);
        return row;
      });
      store.addRow('t1', {c1: 'a'});
      expect(calls).toEqual(['t1/0']);
    });

    test('transform applies from setTable', () => {
      middleware.addWillSetRowCallback((_tableId, _rowId, row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [
            k,
            typeof v === 'number' ? v + 1 : v,
          ]),
        ),
      );
      store.setTable('t1', {r1: {c1: 1}, r2: {c1: 2}});
      expect(store.getTable('t1')).toEqual({r1: {c1: 2}, r2: {c1: 3}});
    });

    test('block from setTable blocks individual rows', () => {
      middleware.addWillSetRowCallback((_tableId, rowId, row) =>
        rowId === 'r2' ? undefined : row,
      );
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c2: 'b'}});
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}});
    });
  });

  describe('interaction with willSetCell', () => {
    test('willSetRow runs before willSetCell', () => {
      const order: string[] = [];
      middleware
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push('row');
          return row;
        })
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          order.push('cell');
          return cell;
        });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(order).toEqual(['row', 'cell']);
    });

    test('willSetRow transforms are seen by willSetCell', () => {
      middleware
        .addWillSetRowCallback((_tableId, _rowId, row) => ({
          ...row,
          extra: 'added',
        }))
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) =>
          typeof cell === 'string' ? cell.toUpperCase() : cell,
        );
      store.setRow('t1', 'r1', {c1: 'hello'});
      expect(store.getRow('t1', 'r1')).toEqual({
        c1: 'HELLO',
        extra: 'ADDED',
      });
    });

    test('willSetRow block prevents willSetCell from being called', () => {
      const cellCallback = vi.fn(
        (_tableId: any, _rowId: any, _cellId: any, cell: any) => cell,
      );
      middleware
        .addWillSetRowCallback(() => undefined)
        .addWillSetCellCallback(cellCallback);
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(cellCallback).not.toHaveBeenCalled();
    });
  });
});

describe('willSetCell', () => {
  describe('passthrough', () => {
    test('returns same value', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
        return cell;
      });
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(store.getCell('t1', 'r1', 'c1')).toBe('a');
    });
  });

  describe('transform', () => {
    test('modifies string cell', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
        return typeof cell === 'string' ? cell.toUpperCase() : cell;
      });
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(store.getCell('t1', 'r1', 'c1')).toBe('A');
    });

    test('modifies number cell', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
        return typeof cell === 'number' ? cell * 2 : cell;
      });
      store.setCell('t1', 'r1', 'c1', 2);
      expect(store.getCell('t1', 'r1', 'c1')).toBe(4);
    });

    test('changes cell type', () => {
      middleware.addWillSetCellCallback(() => {
        return 1;
      });
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(store.getCell('t1', 'r1', 'c1')).toBe(1);
    });

    test('transform based on tableId/rowId/cellId', () => {
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        if (tableId === 't1' && cellId === 'c1') {
          return typeof cell === 'number' ? cell + 1 : cell;
        }
        return cell;
      });
      store.setCell('t1', 'r1', 'c1', 1);
      store.setCell('t1', 'r1', 'c2', 'a');
      store.setCell('t2', 'r1', 'c1', 1);
      expect(store.getCell('t1', 'r1', 'c1')).toBe(2);
      expect(store.getCell('t1', 'r1', 'c2')).toBe('a');
      expect(store.getCell('t2', 'r1', 'c1')).toBe(1);
    });
  });

  describe('block', () => {
    test('returning undefined blocks the cell set', () => {
      middleware.addWillSetCellCallback(() => {
        return undefined;
      });
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store.getTables()).toEqual({});
    });

    test('conditionally blocks', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
        return typeof cell === 'number' && cell < 0 ? undefined : cell;
      });
      store.setCell('t1', 'r1', 'c1', 1);
      expect(store.getCell('t1', 'r1', 'c1')).toBe(1);
      store.setCell('t1', 'r1', 'c2', -1);
      expect(store.getCell('t1', 'r1', 'c2')).toBeUndefined();
    });
  });

  describe('chaining', () => {
    test('multiple callbacks applied in order', () => {
      middleware
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          return typeof cell === 'number' ? cell + 1 : cell;
        })
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          return typeof cell === 'number' ? cell * 10 : cell;
        });
      store.setCell('t1', 'r1', 'c1', 1);
      // (1 + 1) * 10 = 20
      expect(store.getCell('t1', 'r1', 'c1')).toBe(20);
    });

    test('second callback sees transformed value from first', () => {
      const seen: any[] = [];
      middleware
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          seen.push(cell);
          return typeof cell === 'string' ? cell + 'b' : cell;
        })
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          seen.push(cell);
          return cell;
        });
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(seen).toEqual(['a', 'ab']);
      expect(store.getCell('t1', 'r1', 'c1')).toBe('ab');
    });

    test('first callback blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillSetCellCallback(() => undefined)
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          secondCalled();
          return cell;
        });
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getTables()).toEqual({});
    });

    test('second of three callbacks blocks, third never called', () => {
      const thirdCalled = vi.fn();
      middleware
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => cell)
        .addWillSetCellCallback(() => undefined)
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          thirdCalled();
          return cell;
        });
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(thirdCalled).not.toHaveBeenCalled();
    });
  });

  describe('entry points', () => {
    test('called from setCell', () => {
      const calls: string[] = [];
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        calls.push(`${tableId}/${rowId}/${cellId}=${cell}`);
        return cell;
      });
      store.setCell('t1', 'r1', 'c1', 'v1');
      expect(calls).toEqual(['t1/r1/c1=v1']);
    });

    test('called from setRow', () => {
      const calls: string[] = [];
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        calls.push(`${tableId}/${rowId}/${cellId}=${cell}`);
        return cell;
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      expect(calls).toEqual(['t1/r1/c1=a', 't1/r1/c2=b']);
    });

    test('called from setTable', () => {
      const calls: string[] = [];
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        calls.push(`${tableId}/${rowId}/${cellId}=${cell}`);
        return cell;
      });
      store.setTable('t1', {r1: {c1: 1}, r2: {c2: 2}});
      expect(calls).toEqual(['t1/r1/c1=1', 't1/r2/c2=2']);
    });

    test('called from setTables', () => {
      const calls: string[] = [];
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        calls.push(`${tableId}/${rowId}/${cellId}=${cell}`);
        return cell;
      });
      store.setTables({t1: {r1: {c1: 1}}, t2: {r1: {c2: 2}}});
      expect(calls).toEqual(['t1/r1/c1=1', 't2/r1/c2=2']);
    });

    test('called from setPartialRow', () => {
      const calls: string[] = [];
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        calls.push(`${tableId}/${rowId}/${cellId}=${cell}`);
        return cell;
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      calls.length = 0;
      store.setPartialRow('t1', 'r1', {c2: 'B', c3: 'c'});
      expect(calls).toEqual(['t1/r1/c2=B', 't1/r1/c3=c']);
    });

    test('called from addRow', () => {
      const calls: string[] = [];
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        calls.push(`${tableId}/${rowId}/${cellId}=${cell}`);
        return cell;
      });
      store.addRow('t1', {c1: 'a', c2: 'b'});
      expect(calls).toEqual(['t1/0/c1=a', 't1/0/c2=b']);
    });

    test('transform applies from setRow', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) =>
        typeof cell === 'string' ? cell.toUpperCase() : cell,
      );
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'A', c2: 'B'});
    });

    test('transform applies from setTable', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) =>
        typeof cell === 'number' ? cell + 1 : cell,
      );
      store.setTable('t1', {r1: {c1: 1}, r2: {c1: 2}});
      expect(store.getTable('t1')).toEqual({r1: {c1: 2}, r2: {c1: 3}});
    });

    test('block from setRow blocks individual cells', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, cellId, cell) =>
        cellId === 'c2' ? undefined : cell,
      );
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
    });

    test('block from setTable blocks individual cells', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, cellId, cell) =>
        cellId === 'c2' ? undefined : cell,
      );
      store.setTable('t1', {r1: {c1: 'a', c2: 'b'}});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
    });
  });
});

describe('willSetValues', () => {
  describe('passthrough', () => {
    test('returns same values', () => {
      middleware.addWillSetValuesCallback((values) => {
        return values;
      });
      store.setValues({v1: 'a', v2: 1});
      expect(store.getValues()).toEqual({v1: 'a', v2: 1});
    });
  });

  describe('transform', () => {
    test('modifies values by adding a value', () => {
      middleware.addWillSetValuesCallback((values) => {
        return {...values, v2: 1};
      });
      store.setValues({v1: 'a'});
      expect(store.getValues()).toEqual({v1: 'a', v2: 1});
    });

    test('modifies values by removing a value', () => {
      middleware.addWillSetValuesCallback((values) => {
        const {v2: _, ...rest} = values;
        return rest;
      });
      store.setValues({v1: 'a', v2: 'b'});
      expect(store.getValues()).toEqual({v1: 'a'});
    });

    test('modifies values by transforming value contents', () => {
      middleware.addWillSetValuesCallback((values) => {
        return Object.fromEntries(
          Object.entries(values).map(([k, v]) => [
            k,
            typeof v === 'string' ? v.toUpperCase() : v,
          ]),
        );
      });
      store.setValues({v1: 'a', v2: 'b'});
      expect(store.getValues()).toEqual({v1: 'A', v2: 'B'});
    });
  });

  describe('block', () => {
    test('returning undefined blocks the values set', () => {
      middleware.addWillSetValuesCallback(() => {
        return undefined;
      });
      store.setValues({v1: 'a'});
      expect(store.getValues()).toEqual({});
    });

    test('conditionally blocks', () => {
      middleware.addWillSetValuesCallback((values) => {
        return 'locked' in values ? undefined : values;
      });
      store.setValues({v1: 'a'});
      expect(store.getValues()).toEqual({v1: 'a'});
      store.setValues({locked: true, v2: 'b'});
      // blocked, so v1 from previous setValues is deleted by the
      // mapMatch since the blocked values resolve to undefined
      expect(store.getValues()).toEqual({v1: 'a'});
    });
  });

  describe('chaining', () => {
    test('multiple callbacks applied in order', () => {
      middleware
        .addWillSetValuesCallback((values) => {
          return {...values, step1: true};
        })
        .addWillSetValuesCallback((values) => {
          return {...values, step2: true};
        });
      store.setValues({v1: 'a'});
      expect(store.getValues()).toEqual({v1: 'a', step1: true, step2: true});
    });

    test('second callback sees transformed values from first', () => {
      const seen: any[] = [];
      middleware
        .addWillSetValuesCallback((values) => {
          seen.push({...values});
          return {...values, added: 1};
        })
        .addWillSetValuesCallback((values) => {
          seen.push({...values});
          return values;
        });
      store.setValues({v1: 'a'});
      expect(seen).toEqual([{v1: 'a'}, {v1: 'a', added: 1}]);
    });

    test('first callback blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillSetValuesCallback(() => undefined)
        .addWillSetValuesCallback((values) => {
          secondCalled();
          return values;
        });
      store.setValues({v1: 'a'});
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getValues()).toEqual({});
    });

    test('second of three callbacks blocks, third never called', () => {
      const thirdCalled = vi.fn();
      middleware
        .addWillSetValuesCallback((values) => values)
        .addWillSetValuesCallback(() => undefined)
        .addWillSetValuesCallback((values) => {
          thirdCalled();
          return values;
        });
      store.setValues({v1: 'a'});
      expect(thirdCalled).not.toHaveBeenCalled();
    });
  });

  describe('entry points', () => {
    test('called from setValues', () => {
      const calls: any[] = [];
      middleware.addWillSetValuesCallback((values) => {
        calls.push({...values});
        return values;
      });
      store.setValues({v1: 'a', v2: 1});
      expect(calls).toEqual([{v1: 'a', v2: 1}]);
    });

    test('not called from setPartialValues', () => {
      const calls: any[] = [];
      middleware.addWillSetValuesCallback((values) => {
        calls.push({...values});
        return values;
      });
      store.setValues({v1: 'a'});
      calls.length = 0;
      store.setPartialValues({v2: 'b'});
      expect(calls).toEqual([]);
      expect(store.getValues()).toEqual({v1: 'a', v2: 'b'});
    });

    test('not called from setValue', () => {
      const calls: any[] = [];
      middleware.addWillSetValuesCallback((values) => {
        calls.push({...values});
        return values;
      });
      store.setValue('v1', 'a');
      expect(calls).toEqual([]);
      expect(store.getValues()).toEqual({v1: 'a'});
    });

    test('transform applies from setValues', () => {
      middleware.addWillSetValuesCallback((values) =>
        Object.fromEntries(
          Object.entries(values).map(([k, v]) => [
            k,
            typeof v === 'string' ? v.toUpperCase() : v,
          ]),
        ),
      );
      store.setValues({v1: 'a', v2: 'b'});
      expect(store.getValues()).toEqual({v1: 'A', v2: 'B'});
    });

    test('block from setValues blocks all values', () => {
      middleware.addWillSetValuesCallback(() => undefined);
      store.setValues({v1: 'a', v2: 'b'});
      expect(store.getValues()).toEqual({});
    });
  });

  describe('interaction with willSetValue', () => {
    test('willSetValues runs before willSetValue', () => {
      const order: string[] = [];
      middleware
        .addWillSetValuesCallback((values) => {
          order.push('values');
          return values;
        })
        .addWillSetValueCallback((_valueId, value) => {
          order.push('value');
          return value;
        });
      store.setValues({v1: 'a'});
      expect(order).toEqual(['values', 'value']);
    });

    test('willSetValues transforms are seen by willSetValue', () => {
      middleware
        .addWillSetValuesCallback((values) => ({
          ...values,
          extra: 'added',
        }))
        .addWillSetValueCallback((_valueId, value) =>
          typeof value === 'string' ? value.toUpperCase() : value,
        );
      store.setValues({v1: 'hello'});
      expect(store.getValues()).toEqual({v1: 'HELLO', extra: 'ADDED'});
    });

    test('willSetValues block prevents willSetValue from being called', () => {
      const valueCallback = vi.fn((_valueId: any, value: any) => value);
      middleware
        .addWillSetValuesCallback(() => undefined)
        .addWillSetValueCallback(valueCallback);
      store.setValues({v1: 'a'});
      expect(valueCallback).not.toHaveBeenCalled();
    });
  });
});

describe('willSetValue', () => {
  describe('passthrough', () => {
    test('returns same value', () => {
      middleware.addWillSetValueCallback((_valueId, value) => {
        return value;
      });
      store.setValue('v1', 'a');
      expect(store.getValue('v1')).toBe('a');
    });
  });

  describe('transform', () => {
    test('modifies string value', () => {
      middleware.addWillSetValueCallback((_valueId, value) => {
        return typeof value === 'string' ? value.toUpperCase() : value;
      });
      store.setValue('v1', 'a');
      expect(store.getValue('v1')).toBe('A');
    });

    test('modifies number value', () => {
      middleware.addWillSetValueCallback((_valueId, value) => {
        return typeof value === 'number' ? value * 3 : value;
      });
      store.setValue('v1', 2);
      expect(store.getValue('v1')).toBe(6);
    });

    test('transform based on valueId', () => {
      middleware.addWillSetValueCallback((valueId, value) => {
        if (valueId === 'v1') {
          return typeof value === 'number' ? value + 1 : value;
        }
        return value;
      });
      store.setValue('v1', 1);
      store.setValue('v2', 'a');
      expect(store.getValue('v1')).toBe(2);
      expect(store.getValue('v2')).toBe('a');
    });
  });

  describe('block', () => {
    test('returning undefined blocks the value set', () => {
      middleware.addWillSetValueCallback(() => undefined);
      store.setValue('v1', 'a');
      expect(store.getValue('v1')).toBeUndefined();
      expect(store.getValues()).toEqual({});
    });

    test('conditionally blocks', () => {
      middleware.addWillSetValueCallback((_valueId, value) => {
        return value === 'b' ? undefined : value;
      });
      store.setValue('v1', 'a');
      expect(store.getValue('v1')).toBe('a');
      store.setValue('v2', 'b');
      expect(store.getValue('v2')).toBeUndefined();
    });
  });

  describe('chaining', () => {
    test('multiple callbacks applied in order', () => {
      middleware
        .addWillSetValueCallback((_valueId, value) => {
          return typeof value === 'number' ? value + 1 : value;
        })
        .addWillSetValueCallback((_valueId, value) => {
          return typeof value === 'number' ? value * 2 : value;
        });
      store.setValue('v1', 1);
      // (1 + 1) * 2 = 4
      expect(store.getValue('v1')).toBe(4);
    });

    test('first callback blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillSetValueCallback(() => undefined)
        .addWillSetValueCallback((_valueId, value) => {
          secondCalled();
          return value;
        });
      store.setValue('v1', 'a');
      expect(secondCalled).not.toHaveBeenCalled();
    });
  });

  describe('entry points', () => {
    test('called from setValue', () => {
      const calls: string[] = [];
      middleware.addWillSetValueCallback((valueId, value) => {
        calls.push(`${valueId}=${value}`);
        return value;
      });
      store.setValue('v1', 'a');
      expect(calls).toEqual(['v1=a']);
    });

    test('called from setValues', () => {
      const calls: string[] = [];
      middleware.addWillSetValueCallback((valueId, value) => {
        calls.push(`${valueId}=${value}`);
        return value;
      });
      store.setValues({v1: 'a', v2: 'b'});
      expect(calls).toEqual(['v1=a', 'v2=b']);
    });

    test('called from setPartialValues', () => {
      const calls: string[] = [];
      middleware.addWillSetValueCallback((valueId, value) => {
        calls.push(`${valueId}=${value}`);
        return value;
      });
      store.setValues({v1: 'a', v2: 'b'});
      calls.length = 0;
      store.setPartialValues({v2: 'B', v3: 'c'});
      expect(calls).toEqual(['v2=B', 'v3=c']);
    });

    test('transform applies from setValues', () => {
      middleware.addWillSetValueCallback((_valueId, value) =>
        typeof value === 'string' ? value.toUpperCase() : value,
      );
      store.setValues({v1: 'a', v2: 'b'});
      expect(store.getValues()).toEqual({v1: 'A', v2: 'B'});
    });
  });
});

describe('willDelTables', () => {
  describe('allow', () => {
    test('returning true allows delete', () => {
      middleware.addWillDelTablesCallback(() => true);
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.delTables();
      expect(store.getTables()).toEqual({});
    });
  });

  describe('block', () => {
    test('returning false blocks delete', () => {
      middleware.addWillDelTablesCallback(() => false);
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.delTables();
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        t2: {r1: {c1: 'b'}},
      });
    });
  });

  describe('chaining', () => {
    test('all must return true to allow', () => {
      middleware
        .addWillDelTablesCallback(() => true)
        .addWillDelTablesCallback(() => true);
      store.setTables({t1: {r1: {c1: 'a'}}});
      store.delTables();
      expect(store.getTables()).toEqual({});
    });

    test('any returning false blocks', () => {
      middleware
        .addWillDelTablesCallback(() => true)
        .addWillDelTablesCallback(() => false);
      store.setTables({t1: {r1: {c1: 'a'}}});
      store.delTables();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('first blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillDelTablesCallback(() => false)
        .addWillDelTablesCallback(() => {
          secondCalled();
          return true;
        });
      store.setTables({t1: {r1: {c1: 'a'}}});
      store.delTables();
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });
  });

  describe('entry points', () => {
    test('called from delTables', () => {
      const calls: number[] = [];
      middleware.addWillDelTablesCallback(() => {
        calls.push(1);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      store.delTables();
      expect(calls).toEqual([1]);
    });

    test('not called from delTable', () => {
      const calls: number[] = [];
      middleware.addWillDelTablesCallback(() => {
        calls.push(1);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.delTable('t1');
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t2: {r1: {c1: 'b'}}});
    });

    test('not called from setTables', () => {
      const calls: number[] = [];
      middleware.addWillDelTablesCallback(() => {
        calls.push(1);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      calls.length = 0;
      store.setTables({t2: {r1: {c1: 'b'}}});
      expect(calls).toEqual([]);
    });
  });

  describe('interaction with willDelTable', () => {
    test('willDelTables blocks before willDelTable is called', () => {
      const tableCalls = vi.fn();
      middleware.addWillDelTablesCallback(() => false);
      middleware.addWillDelTableCallback((...args) => {
        tableCalls(...args);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.delTables();
      expect(tableCalls).not.toHaveBeenCalled();
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        t2: {r1: {c1: 'b'}},
      });
    });

    test('willDelTables allows, willDelTable still checked', () => {
      const tableCalls: string[] = [];
      middleware.addWillDelTablesCallback(() => true);
      middleware.addWillDelTableCallback((tableId) => {
        tableCalls.push(tableId);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.delTables();
      expect(tableCalls).toEqual(['t1', 't2']);
    });
  });
});

describe('willDelTable', () => {
  describe('allow', () => {
    test('returning true allows delete', () => {
      middleware.addWillDelTableCallback(() => true);
      store.setTable('t1', {r1: {c1: 'a'}});
      store.delTable('t1');
      expect(store.getTable('t1')).toEqual({});
      expect(store.getTables()).toEqual({});
    });
  });

  describe('block', () => {
    test('returning false blocks delete', () => {
      middleware.addWillDelTableCallback(() => false);
      store.setTable('t1', {r1: {c1: 'a'}});
      store.delTable('t1');
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}});
    });

    test('conditionally blocks', () => {
      middleware.addWillDelTableCallback((tableId) => {
        return tableId !== 'protected';
      });
      store.setTables({
        t1: {r1: {c1: 'a'}},
        protected: {r1: {c1: 'b'}},
      });
      store.delTable('t1');
      store.delTable('protected');
      expect(store.getTable('t1')).toEqual({});
      expect(store.getTable('protected')).toEqual({r1: {c1: 'b'}});
    });
  });

  describe('chaining', () => {
    test('all must return true to allow', () => {
      middleware
        .addWillDelTableCallback(() => true)
        .addWillDelTableCallback(() => true);
      store.setTable('t1', {r1: {c1: 'a'}});
      store.delTable('t1');
      expect(store.getTables()).toEqual({});
    });

    test('any returning false blocks', () => {
      middleware
        .addWillDelTableCallback(() => true)
        .addWillDelTableCallback(() => false);
      store.setTable('t1', {r1: {c1: 'a'}});
      store.delTable('t1');
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}});
    });

    test('first blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillDelTableCallback(() => false)
        .addWillDelTableCallback((...args) => {
          secondCalled(...args);
          return true;
        });
      store.setTable('t1', {r1: {c1: 'a'}});
      store.delTable('t1');
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}});
    });
  });

  describe('entry points', () => {
    test('called from delTable', () => {
      const calls: string[] = [];
      middleware.addWillDelTableCallback((tableId) => {
        calls.push(tableId);
        return true;
      });
      store.setTable('t1', {r1: {c1: 'a'}});
      store.delTable('t1');
      expect(calls).toEqual(['t1']);
    });

    test('called from delTables', () => {
      const calls: string[] = [];
      middleware.addWillDelTableCallback((tableId) => {
        calls.push(tableId);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.delTables();
      expect(calls).toEqual(['t1', 't2']);
    });

    test('not called from delRow', () => {
      const calls: string[] = [];
      middleware.addWillDelTableCallback((tableId) => {
        calls.push(tableId);
        return true;
      });
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      store.delRow('t1', 'r1');
      expect(calls).toEqual([]);
      expect(store.getTable('t1')).toEqual({r2: {c1: 'b'}});
    });

    test('block from delTables prevents table deletion', () => {
      middleware.addWillDelTableCallback(() => false);
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.delTables();
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        t2: {r1: {c1: 'b'}},
      });
    });

    test('called when setTables replaces existing tables', () => {
      const delCalls: string[] = [];
      middleware.addWillDelTableCallback((tableId) => {
        delCalls.push(tableId);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      delCalls.length = 0;
      store.setTables({t1: {r1: {c1: 'A'}}});
      // t2 should be deleted
      expect(delCalls).toEqual(['t2']);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'A'}}});
    });

    test('block prevents removal of old tables during setTables', () => {
      middleware.addWillDelTableCallback(() => false);
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.setTables({t1: {r1: {c1: 'A'}}});
      // t2 should be preserved because delete was blocked
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'A'}},
        t2: {r1: {c1: 'b'}},
      });
    });
  });

  describe('interaction with willDelRow', () => {
    test('willDelTable blocks before willDelRow is called', () => {
      const rowCalls = vi.fn();
      middleware.addWillDelTableCallback(() => false);
      middleware.addWillDelRowCallback((...args) => {
        rowCalls(...args);
        return true;
      });
      store.setTable('t1', {r1: {c1: 'a'}});
      store.delTable('t1');
      expect(rowCalls).not.toHaveBeenCalled();
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}});
    });

    test('willDelTable allows, willDelRow still checked', () => {
      const rowCalls: string[] = [];
      middleware.addWillDelTableCallback(() => true);
      middleware.addWillDelRowCallback((tableId, rowId) => {
        rowCalls.push(`${tableId}/${rowId}`);
        return true;
      });
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      store.delTable('t1');
      expect(rowCalls).toEqual(['t1/r1', 't1/r2']);
    });
  });
});

describe('willDelRow', () => {
  describe('allow', () => {
    test('returning true allows delete', () => {
      middleware.addWillDelRowCallback(() => true);
      store.setRow('t1', 'r1', {c1: 'a'});
      store.delRow('t1', 'r1');
      expect(store.getRow('t1', 'r1')).toEqual({});
    });
  });

  describe('block', () => {
    test('returning false blocks delete', () => {
      middleware.addWillDelRowCallback(() => false);
      store.setRow('t1', 'r1', {c1: 'a'});
      store.delRow('t1', 'r1');
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
    });

    test('conditionally blocks', () => {
      middleware.addWillDelRowCallback((_tableId, rowId) => {
        return rowId !== 'r2';
      });
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      store.delRow('t1', 'r1');
      store.delRow('t1', 'r2');
      expect(store.getRow('t1', 'r1')).toEqual({});
      expect(store.getRow('t1', 'r2')).toEqual({c1: 'b'});
    });
  });

  describe('chaining', () => {
    test('all must return true to allow', () => {
      middleware
        .addWillDelRowCallback(() => true)
        .addWillDelRowCallback(() => true);
      store.setRow('t1', 'r1', {c1: 'a'});
      store.delRow('t1', 'r1');
      expect(store.getRow('t1', 'r1')).toEqual({});
    });

    test('any returning false blocks', () => {
      middleware
        .addWillDelRowCallback(() => true)
        .addWillDelRowCallback(() => false);
      store.setRow('t1', 'r1', {c1: 'a'});
      store.delRow('t1', 'r1');
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
    });

    test('first blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillDelRowCallback(() => false)
        .addWillDelRowCallback((...args) => {
          secondCalled(...args);
          return true;
        });
      store.setRow('t1', 'r1', {c1: 'a'});
      store.delRow('t1', 'r1');
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
    });
  });

  describe('entry points', () => {
    test('called from delRow', () => {
      const calls: string[] = [];
      middleware.addWillDelRowCallback((tableId, rowId) => {
        calls.push(`${tableId}/${rowId}`);
        return true;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      store.delRow('t1', 'r1');
      expect(calls).toEqual(['t1/r1']);
    });

    test('called from delTable', () => {
      const calls: string[] = [];
      middleware.addWillDelRowCallback((tableId, rowId) => {
        calls.push(`${tableId}/${rowId}`);
        return true;
      });
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      store.delTable('t1');
      expect(calls).toEqual(['t1/r1', 't1/r2']);
    });

    test('called from delTables', () => {
      const calls: string[] = [];
      middleware.addWillDelRowCallback((tableId, rowId) => {
        calls.push(`${tableId}/${rowId}`);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.delTables();
      expect(calls).toEqual(['t1/r1', 't2/r1']);
    });

    test('block from delTable prevents row deletion', () => {
      middleware.addWillDelRowCallback(() => false);
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      store.delTable('t1');
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}, r2: {c1: 'b'}});
    });

    test('called when setTable replaces existing rows', () => {
      const delCalls: string[] = [];
      middleware.addWillDelRowCallback((tableId, rowId) => {
        delCalls.push(`${tableId}/${rowId}`);
        return true;
      });
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      delCalls.length = 0;
      store.setTable('t1', {r1: {c1: 'A'}});
      // r2 should be deleted
      expect(delCalls).toEqual(['t1/r2']);
      expect(store.getTable('t1')).toEqual({r1: {c1: 'A'}});
    });

    test('block prevents removal of old rows during setTable', () => {
      middleware.addWillDelRowCallback(() => false);
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      store.setTable('t1', {r1: {c1: 'A'}});
      // r2 should be preserved because delete was blocked
      expect(store.getTable('t1')).toEqual({
        r1: {c1: 'A'},
        r2: {c1: 'b'},
      });
    });
  });

  describe('interaction with willDelCell', () => {
    test('willDelRow blocks before willDelCell is called', () => {
      const cellCalls = vi.fn();
      middleware.addWillDelRowCallback(() => false);
      middleware.addWillDelCellCallback((...args) => {
        cellCalls(...args);
        return true;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      store.delRow('t1', 'r1');
      expect(cellCalls).not.toHaveBeenCalled();
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
    });

    test('willDelRow allows, willDelCell still checked', () => {
      const cellCalls: string[] = [];
      middleware.addWillDelRowCallback(() => true);
      middleware.addWillDelCellCallback((tableId, rowId, cellId) => {
        cellCalls.push(`${tableId}/${rowId}/${cellId}`);
        return true;
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      store.delRow('t1', 'r1');
      expect(cellCalls).toEqual(['t1/r1/c1', 't1/r1/c2']);
    });
  });
});

describe('willDelCell', () => {
  describe('allow', () => {
    test('returning true allows delete', () => {
      middleware.addWillDelCellCallback(() => true);
      store.setCell('t1', 'r1', 'c1', 'a');
      store.delCell('t1', 'r1', 'c1');
      expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });
  });

  describe('block', () => {
    test('returning false blocks delete', () => {
      middleware.addWillDelCellCallback(() => false);
      store.setCell('t1', 'r1', 'c1', 'a');
      store.delCell('t1', 'r1', 'c1');
      expect(store.getCell('t1', 'r1', 'c1')).toBe('a');
    });

    test('conditionally blocks', () => {
      middleware.addWillDelCellCallback((_tableId, _rowId, cellId) => {
        return cellId !== 'c2';
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      store.delCell('t1', 'r1', 'c1');
      store.delCell('t1', 'r1', 'c2');
      expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store.getCell('t1', 'r1', 'c2')).toBe('b');
    });
  });

  describe('chaining', () => {
    test('all must return true to allow', () => {
      middleware
        .addWillDelCellCallback(() => true)
        .addWillDelCellCallback(() => true);
      store.setCell('t1', 'r1', 'c1', 'a');
      store.delCell('t1', 'r1', 'c1');
      expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('any returning false blocks', () => {
      middleware
        .addWillDelCellCallback(() => true)
        .addWillDelCellCallback(() => false);
      store.setCell('t1', 'r1', 'c1', 'a');
      store.delCell('t1', 'r1', 'c1');
      expect(store.getCell('t1', 'r1', 'c1')).toBe('a');
    });

    test('first blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillDelCellCallback(() => false)
        .addWillDelCellCallback((...args) => {
          secondCalled(...args);
          return true;
        });
      store.setCell('t1', 'r1', 'c1', 'a');
      store.delCell('t1', 'r1', 'c1');
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getCell('t1', 'r1', 'c1')).toBe('a');
    });
  });

  describe('entry points', () => {
    test('called from delCell', () => {
      const calls: string[] = [];
      middleware.addWillDelCellCallback((tableId, rowId, cellId) => {
        calls.push(`${tableId}/${rowId}/${cellId}`);
        return true;
      });
      store.setCell('t1', 'r1', 'c1', 'a');
      store.delCell('t1', 'r1', 'c1');
      expect(calls).toEqual(['t1/r1/c1']);
    });

    test('called from delRow', () => {
      const calls: string[] = [];
      middleware.addWillDelCellCallback((tableId, rowId, cellId) => {
        calls.push(`${tableId}/${rowId}/${cellId}`);
        return true;
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      store.delRow('t1', 'r1');
      expect(calls).toEqual(['t1/r1/c1', 't1/r1/c2']);
    });

    test('called from delTable', () => {
      const calls: string[] = [];
      middleware.addWillDelCellCallback((tableId, rowId, cellId) => {
        calls.push(`${tableId}/${rowId}/${cellId}`);
        return true;
      });
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c2: 'b'}});
      store.delTable('t1');
      expect(calls).toEqual(['t1/r1/c1', 't1/r2/c2']);
    });

    test('called from delTables', () => {
      const calls: string[] = [];
      middleware.addWillDelCellCallback((tableId, rowId, cellId) => {
        calls.push(`${tableId}/${rowId}/${cellId}`);
        return true;
      });
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c2: 'b'}}});
      store.delTables();
      expect(calls).toEqual(['t1/r1/c1', 't2/r1/c2']);
    });

    test('block from delRow prevents cell deletion', () => {
      middleware.addWillDelCellCallback(() => false);
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      store.delRow('t1', 'r1');
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 'b'});
    });

    test('block from delTable prevents cell deletion', () => {
      middleware.addWillDelCellCallback(() => false);
      store.setTable('t1', {r1: {c1: 'a'}});
      store.delTable('t1');
      expect(store.getTable('t1')).toEqual({r1: {c1: 'a'}});
    });

    test('called when setRow replaces existing cells', () => {
      const delCalls: string[] = [];
      middleware.addWillDelCellCallback((tableId, rowId, cellId) => {
        delCalls.push(`${tableId}/${rowId}/${cellId}`);
        return true;
      });
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      delCalls.length = 0;
      store.setRow('t1', 'r1', {c1: 'A'});
      // c2 should be deleted
      expect(delCalls).toEqual(['t1/r1/c2']);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'A'});
    });

    test('block prevents removal of old cells during setRow', () => {
      middleware.addWillDelCellCallback(() => false);
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      store.setRow('t1', 'r1', {c1: 'A'});
      // c2 should be preserved because delete was blocked
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'A', c2: 'b'});
    });
  });
});

describe('willDelValues', () => {
  describe('allow', () => {
    test('returning true allows delete', () => {
      middleware.addWillDelValuesCallback(() => true);
      store.setValues({v1: 'a', v2: 'b'});
      store.delValues();
      expect(store.getValues()).toEqual({});
    });
  });

  describe('block', () => {
    test('returning false blocks delete', () => {
      middleware.addWillDelValuesCallback(() => false);
      store.setValues({v1: 'a', v2: 'b'});
      store.delValues();
      expect(store.getValues()).toEqual({v1: 'a', v2: 'b'});
    });
  });

  describe('chaining', () => {
    test('all must return true to allow', () => {
      middleware
        .addWillDelValuesCallback(() => true)
        .addWillDelValuesCallback(() => true);
      store.setValues({v1: 'a'});
      store.delValues();
      expect(store.getValues()).toEqual({});
    });

    test('any returning false blocks', () => {
      middleware
        .addWillDelValuesCallback(() => true)
        .addWillDelValuesCallback(() => false);
      store.setValues({v1: 'a'});
      store.delValues();
      expect(store.getValues()).toEqual({v1: 'a'});
    });

    test('first blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillDelValuesCallback(() => false)
        .addWillDelValuesCallback(() => {
          secondCalled();
          return true;
        });
      store.setValues({v1: 'a'});
      store.delValues();
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getValues()).toEqual({v1: 'a'});
    });
  });

  describe('entry points', () => {
    test('called from delValues', () => {
      const calls: number[] = [];
      middleware.addWillDelValuesCallback(() => {
        calls.push(1);
        return true;
      });
      store.setValues({v1: 'a'});
      store.delValues();
      expect(calls).toEqual([1]);
    });

    test('not called from delValue', () => {
      const calls: number[] = [];
      middleware.addWillDelValuesCallback(() => {
        calls.push(1);
        return true;
      });
      store.setValues({v1: 'a', v2: 'b'});
      store.delValue('v1');
      expect(calls).toEqual([]);
      expect(store.getValues()).toEqual({v2: 'b'});
    });
  });

  describe('interaction with willDelValue', () => {
    test('willDelValues blocks before willDelValue is called', () => {
      const valueCalls = vi.fn();
      middleware.addWillDelValuesCallback(() => false);
      middleware.addWillDelValueCallback((...args) => {
        valueCalls(...args);
        return true;
      });
      store.setValues({v1: 'a', v2: 'b'});
      store.delValues();
      expect(valueCalls).not.toHaveBeenCalled();
      expect(store.getValues()).toEqual({v1: 'a', v2: 'b'});
    });

    test('willDelValues allows, willDelValue still checked', () => {
      const valueCalls: string[] = [];
      middleware.addWillDelValuesCallback(() => true);
      middleware.addWillDelValueCallback((valueId) => {
        valueCalls.push(valueId);
        return true;
      });
      store.setValues({v1: 'a', v2: 'b'});
      store.delValues();
      expect(valueCalls).toEqual(['v1', 'v2']);
    });
  });
});

describe('willDelValue', () => {
  describe('allow', () => {
    test('returning true allows delete', () => {
      middleware.addWillDelValueCallback(() => true);
      store.setValue('v1', 'a');
      store.delValue('v1');
      expect(store.getValue('v1')).toBeUndefined();
    });
  });

  describe('block', () => {
    test('returning false blocks delete', () => {
      middleware.addWillDelValueCallback(() => false);
      store.setValue('v1', 'a');
      store.delValue('v1');
      expect(store.getValue('v1')).toBe('a');
    });

    test('conditionally blocks', () => {
      middleware.addWillDelValueCallback((valueId) => {
        return valueId !== 'v2';
      });
      store.setValues({v1: 'a', v2: 'b'});
      store.delValue('v1');
      store.delValue('v2');
      expect(store.getValue('v1')).toBeUndefined();
      expect(store.getValue('v2')).toBe('b');
    });
  });

  describe('chaining', () => {
    test('all must return true to allow', () => {
      middleware
        .addWillDelValueCallback(() => true)
        .addWillDelValueCallback(() => true);
      store.setValue('v1', 'a');
      store.delValue('v1');
      expect(store.getValue('v1')).toBeUndefined();
    });

    test('any returning false blocks', () => {
      middleware
        .addWillDelValueCallback(() => true)
        .addWillDelValueCallback(() => false);
      store.setValue('v1', 'a');
      store.delValue('v1');
      expect(store.getValue('v1')).toBe('a');
    });

    test('first blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillDelValueCallback(() => false)
        .addWillDelValueCallback((valueId) => {
          secondCalled(valueId);
          return true;
        });
      store.setValue('v1', 'a');
      store.delValue('v1');
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getValue('v1')).toBe('a');
    });
  });

  describe('entry points', () => {
    test('called from delValue', () => {
      const calls: string[] = [];
      middleware.addWillDelValueCallback((valueId) => {
        calls.push(valueId);
        return true;
      });
      store.setValue('v1', 'a');
      store.delValue('v1');
      expect(calls).toEqual(['v1']);
    });

    test('called from delValues', () => {
      const calls: string[] = [];
      middleware.addWillDelValueCallback((valueId) => {
        calls.push(valueId);
        return true;
      });
      store.setValues({v1: 'a', v2: 'b'});
      store.delValues();
      expect(calls).toEqual(['v1', 'v2']);
    });

    test('block from delValues prevents deletion', () => {
      middleware.addWillDelValueCallback(() => false);
      store.setValues({v1: 'a', v2: 'b'});
      store.delValues();
      expect(store.getValues()).toEqual({v1: 'a', v2: 'b'});
    });

    test('called when setValues replaces existing values', () => {
      const delCalls: string[] = [];
      middleware.addWillDelValueCallback((valueId) => {
        delCalls.push(valueId);
        return true;
      });
      store.setValues({v1: 'a', v2: 'b'});
      delCalls.length = 0;
      store.setValues({v1: 'A'});
      // v2 should be deleted
      expect(delCalls).toEqual(['v2']);
      expect(store.getValues()).toEqual({v1: 'A'});
    });

    test('block prevents removal of old values during setValues', () => {
      middleware.addWillDelValueCallback(() => false);
      store.setValues({v1: 'a', v2: 'b'});
      store.setValues({v1: 'A'});
      // v2 should be preserved because delete was blocked
      expect(store.getValues()).toEqual({v1: 'A', v2: 'b'});
    });
  });
});

describe('schema interaction', () => {
  describe('willSetCell not called for schema-rejected cells', () => {
    test('invalid cell type rejected before callback', () => {
      const callback = vi.fn(
        (_tableId: any, _rowId: any, _cellId: any, cell: any) => cell,
      );
      middleware.addWillSetCellCallback(callback);
      store.setTablesSchema({t1: {c1: {type: 'string'}}});
      store.setCell('t1', 'r1', 'c1', 1 as any);
      expect(callback).not.toHaveBeenCalled();
    });

    test('valid cell type reaches callback', () => {
      const callback = vi.fn(
        (_tableId: any, _rowId: any, _cellId: any, cell: any) => cell,
      );
      middleware.addWillSetCellCallback(callback);
      store.setTablesSchema({t1: {c1: {type: 'string'}}});
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(callback).toHaveBeenCalledWith('t1', 'r1', 'c1', 'a');
    });

    test('unknown table rejected before callback', () => {
      const callback = vi.fn(
        (_tableId: any, _rowId: any, _cellId: any, cell: any) => cell,
      );
      middleware.addWillSetCellCallback(callback);
      store.setTablesSchema({t1: {c1: {type: 'string'}}});
      store.setCell('t2', 'r1', 'c1', 'a');
      expect(callback).not.toHaveBeenCalled();
    });

    test('unknown cell rejected before callback', () => {
      const callback = vi.fn(
        (_tableId: any, _rowId: any, _cellId: any, cell: any) => cell,
      );
      middleware.addWillSetCellCallback(callback);
      store.setTablesSchema({t1: {c1: {type: 'string'}}});
      store.setCell('t1', 'r1', 'c2', 'a');
      expect(callback).not.toHaveBeenCalled();
    });

    test('setRow with invalid cells does not trigger callback', () => {
      const callback = vi.fn(
        (_tableId: any, _rowId: any, _cellId: any, cell: any) => cell,
      );
      middleware.addWillSetCellCallback(callback);
      store.setTablesSchema({t1: {c1: {type: 'string'}}});
      store.setRow('t1', 'r1', {c1: 1 as any});
      expect(callback).not.toHaveBeenCalled();
    });

    test('setTable with invalid cells does not trigger callback', () => {
      const callback = vi.fn(
        (_tableId: any, _rowId: any, _cellId: any, cell: any) => cell,
      );
      middleware.addWillSetCellCallback(callback);
      store.setTablesSchema({t1: {c1: {type: 'string'}}});
      store.setTable('t1', {r1: {c1: 1 as any}});
      expect(callback).not.toHaveBeenCalled();
    });

    test('setRow with mix of valid and invalid cells', () => {
      const calls: string[] = [];
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        calls.push(`${tableId}/${rowId}/${cellId}=${cell}`);
        return cell;
      });
      store.setTablesSchema({
        t1: {c1: {type: 'string'}, c2: {type: 'number'}},
      });
      // c1 valid string, c2 invalid (string instead of number) - gets removed
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b' as any});
      // Only c1 reaches the callback; c2 is rejected by schema validation
      expect(calls).toEqual(['t1/r1/c1=a']);
    });
  });

  describe('willSetValue not called for schema-rejected values', () => {
    test('invalid value type rejected before callback', () => {
      const callback = vi.fn((_valueId: any, value: any) => value);
      middleware.addWillSetValueCallback(callback);
      store.setValuesSchema({v1: {type: 'string'}});
      store.setValue('v1', 1 as any);
      expect(callback).not.toHaveBeenCalled();
    });

    test('valid value type reaches callback', () => {
      const callback = vi.fn((_valueId: any, value: any) => value);
      middleware.addWillSetValueCallback(callback);
      store.setValuesSchema({v1: {type: 'string'}});
      store.setValue('v1', 'a');
      expect(callback).toHaveBeenCalledWith('v1', 'a');
    });

    test('unknown valueId rejected before callback', () => {
      const callback = vi.fn((_valueId: any, value: any) => value);
      middleware.addWillSetValueCallback(callback);
      store.setValuesSchema({v1: {type: 'string'}});
      store.setValue('v2', 'a');
      expect(callback).not.toHaveBeenCalled();
    });

    test('setValues with invalid values does not trigger callback', () => {
      const callback = vi.fn((_valueId: any, value: any) => value);
      middleware.addWillSetValueCallback(callback);
      store.setValuesSchema({v1: {type: 'string'}});
      store.setValues({v1: 1 as any});
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('schema defaults and middleware interaction', () => {
    test('callback receives defaulted cell value', () => {
      const calls: any[] = [];
      middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        calls.push({tableId, rowId, cellId, cell});
        return cell;
      });
      store.setTablesSchema({
        t1: {
          c1: {type: 'string'},
          c2: {type: 'number', default: 1},
        },
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      // c2 should be defaulted to 1, and the callback should see it
      expect(calls).toEqual([
        {tableId: 't1', rowId: 'r1', cellId: 'c1', cell: 'a'},
        {tableId: 't1', rowId: 'r1', cellId: 'c2', cell: 1},
      ]);
    });

    test('middleware can transform defaulted cell value', () => {
      middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) =>
        typeof cell === 'number' ? cell + 1 : cell,
      );
      store.setTablesSchema({
        t1: {
          c1: {type: 'string'},
          c2: {type: 'number', default: 1},
        },
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(store.getCell('t1', 'r1', 'c2')).toBe(2);
    });
  });
});

describe('fluent API', () => {
  test('addWillSetCellCallback returns middleware', () => {
    const result = middleware.addWillSetCellCallback(
      (_tableId, _rowId, _cellId, cell) => cell,
    );
    expect(result).toBe(middleware);
  });

  test('addWillSetRowCallback returns middleware', () => {
    const result = middleware.addWillSetRowCallback(
      (_tableId, _rowId, row) => row,
    );
    expect(result).toBe(middleware);
  });

  test('addWillSetTableCallback returns middleware', () => {
    const result = middleware.addWillSetTableCallback(
      (_tableId, table) => table,
    );
    expect(result).toBe(middleware);
  });

  test('addWillSetValueCallback returns middleware', () => {
    const result = middleware.addWillSetValueCallback(
      (_valueId, value) => value,
    );
    expect(result).toBe(middleware);
  });

  test('addWillSetValuesCallback returns middleware', () => {
    const result = middleware.addWillSetValuesCallback((values) => values);
    expect(result).toBe(middleware);
  });

  test('addWillDelCellCallback returns middleware', () => {
    const result = middleware.addWillDelCellCallback(() => true);
    expect(result).toBe(middleware);
  });

  test('addWillDelRowCallback returns middleware', () => {
    const result = middleware.addWillDelRowCallback(() => true);
    expect(result).toBe(middleware);
  });

  test('addWillDelTableCallback returns middleware', () => {
    const result = middleware.addWillDelTableCallback(() => true);
    expect(result).toBe(middleware);
  });

  test('addWillDelValueCallback returns middleware', () => {
    const result = middleware.addWillDelValueCallback(() => true);
    expect(result).toBe(middleware);
  });

  test('addWillDelValuesCallback returns middleware', () => {
    const result = middleware.addWillDelValuesCallback(() => true);
    expect(result).toBe(middleware);
  });

  test('full chained setup', () => {
    const result = middleware
      .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => cell)
      .addWillSetTableCallback((_tableId, table) => table)
      .addWillSetRowCallback((_tableId, _rowId, row) => row)
      .addWillSetValueCallback((_valueId, value) => value)
      .addWillSetValuesCallback((values) => values)
      .addWillDelCellCallback(() => true)
      .addWillDelTableCallback(() => true)
      .addWillDelRowCallback(() => true)
      .addWillDelValueCallback(() => true)
      .addWillDelValuesCallback(() => true);
    expect(result).toBe(middleware);
  });
});
