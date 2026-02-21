import {beforeEach, describe, expect, test, vi} from 'vitest';

import type {MergeableStore, Middleware, Store} from 'tinybase';
import {
  createCheckpoints,
  createMergeableStore,
  createMiddleware,
  createStore,
} from 'tinybase';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
import {getTimeFunctions} from '../../common/mergeable.ts';

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

describe('willSetContent', () => {
  describe('passthrough', () => {
    test('returns same content', () => {
      middleware.addWillSetContentCallback((content) => {
        return content;
      });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 1}]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
      expect(store.getValues()).toEqual({v1: 1});
    });
  });

  describe('transform', () => {
    test('modifies content by adding a table', () => {
      middleware.addWillSetContentCallback(([tables, values]) => {
        return [{...tables, t2: {r1: {c1: 1}}}, values];
      });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {}]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        t2: {r1: {c1: 1}},
      });
    });

    test('modifies content by adding a value', () => {
      middleware.addWillSetContentCallback(([tables, values]) => {
        return [tables, {...values, v2: 'added'}];
      });
      store.setContent([{}, {v1: 'a'}]);
      expect(store.getValues()).toEqual({v1: 'a', v2: 'added'});
    });

    test('modifies content by removing a table', () => {
      middleware.addWillSetContentCallback(([tables, values]) => {
        const {t2: _, ...rest} = tables;
        return [rest, values];
      });
      store.setContent([{t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}}, {}]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('replaces entire content', () => {
      middleware.addWillSetContentCallback(() => {
        return [{replaced: {r1: {c1: 'yes'}}}, {flag: true}];
      });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 1}]);
      expect(store.getTables()).toEqual({replaced: {r1: {c1: 'yes'}}});
      expect(store.getValues()).toEqual({flag: true});
    });
  });

  describe('block', () => {
    test('returning undefined blocks the content set', () => {
      middleware.addWillSetContentCallback(() => {
        return undefined;
      });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 1}]);
      expect(store.getTables()).toEqual({});
      expect(store.getValues()).toEqual({});
    });

    test('conditionally blocks', () => {
      middleware.addWillSetContentCallback(([tables, values]) => {
        return 'banned' in tables ? undefined : [tables, values];
      });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {}]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
      store.setContent([{banned: {r1: {c1: 1}}, t2: {r1: {c1: 'b'}}}, {}]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });
  });

  describe('chaining', () => {
    test('multiple callbacks applied in order', () => {
      middleware
        .addWillSetContentCallback(([tables, values]) => {
          return [{...tables, step1: {r1: {done: true}}}, values];
        })
        .addWillSetContentCallback(([tables, values]) => {
          return [{...tables, step2: {r1: {done: true}}}, values];
        });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {}]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        step1: {r1: {done: true}},
        step2: {r1: {done: true}},
      });
    });

    test('second callback sees transformed content from first', () => {
      const seen: any[] = [];
      middleware
        .addWillSetContentCallback(([tables, values]) => {
          seen.push([{...tables}, {...values}]);
          return [{...tables, added: {r1: {c1: 1}}}, values];
        })
        .addWillSetContentCallback(([tables, values]) => {
          seen.push([{...tables}, {...values}]);
          return [tables, values];
        });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 1}]);
      expect(seen).toEqual([
        [{t1: {r1: {c1: 'a'}}}, {v1: 1}],
        [{t1: {r1: {c1: 'a'}}, added: {r1: {c1: 1}}}, {v1: 1}],
      ]);
    });

    test('first callback blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillSetContentCallback(() => undefined)
        .addWillSetContentCallback((content) => {
          secondCalled();
          return content;
        });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {}]);
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getTables()).toEqual({});
    });

    test('second of three callbacks blocks, third never called', () => {
      const thirdCalled = vi.fn();
      middleware
        .addWillSetContentCallback((content) => content)
        .addWillSetContentCallback(() => undefined)
        .addWillSetContentCallback((content) => {
          thirdCalled();
          return content;
        });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {}]);
      expect(thirdCalled).not.toHaveBeenCalled();
    });
  });

  describe('entry points', () => {
    test('called from setContent', () => {
      const calls: any[] = [];
      middleware.addWillSetContentCallback((content) => {
        calls.push(content);
        return content;
      });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 1}]);
      expect(calls).toEqual([[{t1: {r1: {c1: 'a'}}}, {v1: 1}]]);
    });

    test('not called from setTables', () => {
      const calls: any[] = [];
      middleware.addWillSetContentCallback((content) => {
        calls.push(content);
        return content;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('not called from setValues', () => {
      const calls: any[] = [];
      middleware.addWillSetContentCallback((content) => {
        calls.push(content);
        return content;
      });
      store.setValues({v1: 'a'});
      expect(calls).toEqual([]);
      expect(store.getValues()).toEqual({v1: 'a'});
    });

    test('not called from setRow', () => {
      const calls: any[] = [];
      middleware.addWillSetContentCallback((content) => {
        calls.push(content);
        return content;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('not called from applyChanges', () => {
      const calls: any[] = [];
      middleware.addWillSetContentCallback((content) => {
        calls.push(content);
        return content;
      });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('block from setContent blocks all content', () => {
      middleware.addWillSetContentCallback(() => undefined);
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 1}]);
      expect(store.getTables()).toEqual({});
      expect(store.getValues()).toEqual({});
    });
  });

  describe('interaction with willSetTables', () => {
    test('willSetContent runs before willSetTables', () => {
      const order: string[] = [];
      middleware
        .addWillSetContentCallback((content) => {
          order.push('content');
          return content;
        })
        .addWillSetTablesCallback((tables) => {
          order.push('tables');
          return tables;
        });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {}]);
      expect(order).toEqual(['content', 'tables']);
    });

    test('willSetContent transforms are seen by willSetTables', () => {
      middleware
        .addWillSetContentCallback(([tables, values]) => [
          {...tables, extra: {r1: {c1: 'added'}}},
          values,
        ])
        .addWillSetTablesCallback((tables) =>
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
      store.setContent([{t1: {r1: {c1: 'hello'}}}, {}]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'HELLO'}},
        extra: {r1: {c1: 'ADDED'}},
      });
    });

    // eslint-disable-next-line max-len
    test('willSetContent block prevents willSetTables from being called', () => {
      const tablesCallback = vi.fn((tables: any) => tables);
      middleware
        .addWillSetContentCallback(() => undefined)
        .addWillSetTablesCallback(tablesCallback);
      store.setContent([{t1: {r1: {c1: 'a'}}}, {}]);
      expect(tablesCallback).not.toHaveBeenCalled();
    });
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
      const tableCallback = vi.fn((_tableId: any, table: any) => table);
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
      expect(seen).toEqual([{r1: {c1: 'a'}}, {r1: {c1: 'a'}, added: {v: 1}}]);
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
      const rowCallback = vi.fn((_tableId: any, _rowId: any, row: any) => row);
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

    test('mutates received row object in place', () => {
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => {
        row.mutated = 'yes';
        return row;
      });
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', mutated: 'yes'});
    });

    test('original row object is not mutated by middleware', () => {
      const original = {c1: 'v1'};
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => {
        row.added = 'yes';
        return row;
      });
      store.setRow('t1', 'r1', original);
      expect(original).toEqual({c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
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

      expect(delCalls).toEqual(['t2']);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'A'}}});
    });

    test('block prevents removal of old tables during setTables', () => {
      middleware.addWillDelTableCallback(() => false);
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      store.setTables({t1: {r1: {c1: 'A'}}});

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

      expect(delCalls).toEqual(['t1/r2']);
      expect(store.getTable('t1')).toEqual({r1: {c1: 'A'}});
    });

    test('block prevents removal of old rows during setTable', () => {
      middleware.addWillDelRowCallback(() => false);
      store.setTable('t1', {r1: {c1: 'a'}, r2: {c1: 'b'}});
      store.setTable('t1', {r1: {c1: 'A'}});

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

      expect(delCalls).toEqual(['t1/r1/c2']);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'A'});
    });

    test('block prevents removal of old cells during setRow', () => {
      middleware.addWillDelCellCallback(() => false);
      store.setRow('t1', 'r1', {c1: 'a', c2: 'b'});
      store.setRow('t1', 'r1', {c1: 'A'});

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

      expect(delCalls).toEqual(['v2']);
      expect(store.getValues()).toEqual({v1: 'A'});
    });

    test('block prevents removal of old values during setValues', () => {
      middleware.addWillDelValueCallback(() => false);
      store.setValues({v1: 'a', v2: 'b'});
      store.setValues({v1: 'A'});

      expect(store.getValues()).toEqual({v1: 'A', v2: 'b'});
    });
  });
});

describe('willApplyChanges', () => {
  describe('passthrough', () => {
    test('returns same changes', () => {
      middleware.addWillApplyChangesCallback((changes) => {
        return changes;
      });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {v1: 1}, 1]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
      expect(store.getValues()).toEqual({v1: 1});
    });
  });

  describe('transform', () => {
    test('modifies changes by adding a table', () => {
      middleware.addWillApplyChangesCallback(
        ([changedTables, changedValues]) => {
          return [{...changedTables, t2: {r1: {c1: 1}}}, changedValues, 1];
        },
      );
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        t2: {r1: {c1: 1}},
      });
    });

    test('modifies changes by adding a value', () => {
      middleware.addWillApplyChangesCallback(
        ([changedTables, changedValues]) => {
          return [changedTables, {...changedValues, v2: 'added'}, 1];
        },
      );
      store.applyChanges([{}, {v1: 'a'}, 1]);
      expect(store.getValues()).toEqual({v1: 'a', v2: 'added'});
    });

    test('modifies changes by removing a table', () => {
      middleware.addWillApplyChangesCallback(
        ([changedTables, changedValues]) => {
          const {t2: _, ...rest} = changedTables;
          return [rest, changedValues, 1];
        },
      );
      store.applyChanges([{t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}}, {}, 1]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('modifies changes by removing a value', () => {
      middleware.addWillApplyChangesCallback(
        ([changedTables, changedValues]) => {
          const {secret: _, ...rest} = changedValues;
          return [changedTables, rest, 1];
        },
      );
      store.applyChanges([{}, {v1: 'ok', secret: 'hidden'}, 1]);
      expect(store.getValue('v1')).toBe('ok');
      expect(store.getValue('secret')).toBeUndefined();
    });

    test('mutates changes object in place', () => {
      middleware.addWillApplyChangesCallback((changes) => {
        const t1 = changes[0].t1;
        if (t1?.r1) {
          t1.r1.validated = true;
        }
        return changes;
      });
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', validated: true});
    });

    test('original changes object is not mutated by middleware', () => {
      const original: Parameters<typeof store.applyChanges>[0] = [
        {t1: {r1: {c1: 'v1'}}},
        {},
        1,
      ];
      middleware.addWillApplyChangesCallback((changes) => {
        if (changes[0].t1?.r1) {
          changes[0].t1.r1.added = 'yes';
        }
        return changes;
      });
      store.applyChanges(original);
      expect(original[0]).toEqual({t1: {r1: {c1: 'v1'}}});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });
  });

  describe('block', () => {
    test('returning undefined blocks the changes', () => {
      middleware.addWillApplyChangesCallback(() => {
        return undefined;
      });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {v1: 1}, 1]);
      expect(store.getTables()).toEqual({});
      expect(store.getValues()).toEqual({});
    });

    test('conditionally blocks', () => {
      middleware.addWillApplyChangesCallback(
        ([changedTables, changedValues]) => {
          return 'banned' in changedTables
            ? undefined
            : [changedTables, changedValues, 1];
        },
      );
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
      store.applyChanges([{banned: {r1: {c1: 1}}}, {}, 1]);

      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('blocks deletions', () => {
      store.setRow('t1', 'r1', {c1: 'a'});
      store.setValue('v1', 1);
      middleware.addWillApplyChangesCallback(() => undefined);
      store.applyChanges([{t1: {r1: undefined}}, {v1: undefined}, 1]);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a'});
      expect(store.getValue('v1')).toBe(1);
    });
  });

  describe('chaining', () => {
    test('multiple callbacks applied in order', () => {
      middleware
        .addWillApplyChangesCallback(([changedTables, changedValues]) => {
          return [
            {...changedTables, step1: {r1: {done: true}}},
            changedValues,
            1,
          ];
        })
        .addWillApplyChangesCallback(([changedTables, changedValues]) => {
          return [
            {...changedTables, step2: {r1: {done: true}}},
            changedValues,
            1,
          ];
        });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'a'}},
        step1: {r1: {done: true}},
        step2: {r1: {done: true}},
      });
    });

    test('second callback sees transformed changes from first', () => {
      const seen: any[] = [];
      middleware
        .addWillApplyChangesCallback(([changedTables, changedValues]) => {
          seen.push([{...changedTables}, {...changedValues}]);
          return [{...changedTables, added: {r1: {c1: 1}}}, changedValues, 1];
        })
        .addWillApplyChangesCallback(([changedTables, changedValues]) => {
          seen.push([{...changedTables}, {...changedValues}]);
          return [changedTables, changedValues, 1];
        });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(seen).toEqual([
        [{t1: {r1: {c1: 'a'}}}, {}],
        [{t1: {r1: {c1: 'a'}}, added: {r1: {c1: 1}}}, {}],
      ]);
    });

    test('first callback blocks, second never called', () => {
      const secondCalled = vi.fn();
      middleware
        .addWillApplyChangesCallback(() => undefined)
        .addWillApplyChangesCallback((changes) => {
          secondCalled();
          return changes;
        });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(secondCalled).not.toHaveBeenCalled();
      expect(store.getTables()).toEqual({});
    });

    test('second of three callbacks blocks, third never called', () => {
      const thirdCalled = vi.fn();
      middleware
        .addWillApplyChangesCallback((changes) => changes)
        .addWillApplyChangesCallback(() => undefined)
        .addWillApplyChangesCallback((changes) => {
          thirdCalled();
          return changes;
        });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(thirdCalled).not.toHaveBeenCalled();
    });
  });

  describe('entry points', () => {
    test('called from applyChanges', () => {
      const calls: any[] = [];
      middleware.addWillApplyChangesCallback((changes) => {
        calls.push(changes);
        return changes;
      });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {v1: 1}, 1]);
      expect(calls).toEqual([[{t1: {r1: {c1: 'a'}}}, {v1: 1}, 1]]);
    });

    test('not called from setTables', () => {
      const calls: any[] = [];
      middleware.addWillApplyChangesCallback((changes) => {
        calls.push(changes);
        return changes;
      });
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('not called from setRow', () => {
      const calls: any[] = [];
      middleware.addWillApplyChangesCallback((changes) => {
        calls.push(changes);
        return changes;
      });
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('not called from setContent', () => {
      const calls: any[] = [];
      middleware.addWillApplyChangesCallback((changes) => {
        calls.push(changes);
        return changes;
      });
      store.setContent([{t1: {r1: {c1: 'a'}}}, {}]);
      expect(calls).toEqual([]);
      expect(store.getTables()).toEqual({t1: {r1: {c1: 'a'}}});
    });

    test('not called from setValues', () => {
      const calls: any[] = [];
      middleware.addWillApplyChangesCallback((changes) => {
        calls.push(changes);
        return changes;
      });
      store.setValues({v1: 'a'});
      expect(calls).toEqual([]);
      expect(store.getValues()).toEqual({v1: 'a'});
    });

    test('block from applyChanges blocks all changes', () => {
      middleware.addWillApplyChangesCallback(() => undefined);
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {v1: 1}, 1]);
      expect(store.getTables()).toEqual({});
      expect(store.getValues()).toEqual({});
    });
  });

  describe('interaction with willSetCell', () => {
    test('willApplyChanges runs before willSetCell', () => {
      const order: string[] = [];
      middleware
        .addWillApplyChangesCallback((changes) => {
          order.push('changes');
          return changes;
        })
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          order.push('cell');
          return cell;
        });
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(order).toEqual(['changes', 'cell']);
    });

    test('willApplyChanges transforms are seen by willSetCell', () => {
      middleware
        .addWillApplyChangesCallback(([changedTables, changedValues]) => [
          {...changedTables, extra: {r1: {c1: 'added'}}},
          changedValues,
          1,
        ])
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) =>
          typeof cell === 'string' ? cell.toUpperCase() : cell,
        );
      store.applyChanges([{t1: {r1: {c1: 'hello'}}}, {}, 1]);
      expect(store.getTables()).toEqual({
        t1: {r1: {c1: 'HELLO'}},
        extra: {r1: {c1: 'ADDED'}},
      });
    });

    // eslint-disable-next-line max-len
    test('willApplyChanges block prevents willSetCell from being called', () => {
      const cellCallback = vi.fn(
        (_tableId: any, _rowId: any, _cellId: any, cell: any) => cell,
      );
      middleware
        .addWillApplyChangesCallback(() => undefined)
        .addWillSetCellCallback(cellCallback);
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(cellCallback).not.toHaveBeenCalled();
    });
  });

  describe('changes with deletions', () => {
    test('deletions pass through when accepted', () => {
      store.setRow('t1', 'r1', {c1: 'a'});
      store.setValue('v1', 1);
      middleware.addWillApplyChangesCallback((changes) => changes);
      store.applyChanges([{t1: {r1: undefined}}, {v1: undefined}, 1]);
      expect(store.getTables()).toEqual({});
      expect(store.getValues()).toEqual({});
    });

    test('table deletions pass through when accepted', () => {
      store.setRow('t1', 'r1', {c1: 'a'});
      middleware.addWillApplyChangesCallback((changes) => changes);
      store.applyChanges([{t1: undefined}, {}, 1]);
      expect(store.getTables()).toEqual({});
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

      store.setRow('t1', 'r1', {c1: 'a', c2: 'b' as any});

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

  test('addWillSetContentCallback returns middleware', () => {
    const result = middleware.addWillSetContentCallback((content) => content);
    expect(result).toBe(middleware);
  });

  test('addWillApplyChangesCallback returns middleware', () => {
    const result = middleware.addWillApplyChangesCallback((changes) => changes);
    expect(result).toBe(middleware);
  });

  test('full chained setup', () => {
    const result = middleware
      .addWillSetContentCallback((content) => content)
      .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => cell)
      .addWillSetTableCallback((_tableId, table) => table)
      .addWillSetRowCallback((_tableId, _rowId, row) => row)
      .addWillSetValueCallback((_valueId, value) => value)
      .addWillSetValuesCallback((values) => values)
      .addWillDelCellCallback(() => true)
      .addWillDelTableCallback(() => true)
      .addWillDelRowCallback(() => true)
      .addWillDelValueCallback(() => true)
      .addWillDelValuesCallback(() => true)
      .addWillApplyChangesCallback((changes) => changes);
    expect(result).toBe(middleware);
  });
});

describe('callback granularity', () => {
  let calls: Record<string, number>;

  const registerAllCallbacks = () => {
    calls = {};
    middleware.addWillSetContentCallback((content) => {
      calls['willSetContent'] = (calls['willSetContent'] ?? 0) + 1;
      return content;
    });
    middleware.addWillSetTablesCallback((tables) => {
      calls['willSetTables'] = (calls['willSetTables'] ?? 0) + 1;
      return tables;
    });
    middleware.addWillSetTableCallback((tableId, table) => {
      calls['willSetTable'] = (calls['willSetTable'] ?? 0) + 1;
      return table;
    });
    middleware.addWillSetRowCallback((tableId, rowId, row) => {
      calls['willSetRow'] = (calls['willSetRow'] ?? 0) + 1;
      return row;
    });
    middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
      calls['willSetCell'] = (calls['willSetCell'] ?? 0) + 1;
      return cell;
    });
    middleware.addWillSetValuesCallback((values) => {
      calls['willSetValues'] = (calls['willSetValues'] ?? 0) + 1;
      return values;
    });
    middleware.addWillSetValueCallback((valueId, value) => {
      calls['willSetValue'] = (calls['willSetValue'] ?? 0) + 1;
      return value;
    });
    middleware.addWillDelTablesCallback(() => {
      calls['willDelTables'] = (calls['willDelTables'] ?? 0) + 1;
      return true;
    });
    middleware.addWillDelTableCallback((_tableId) => {
      calls['willDelTable'] = (calls['willDelTable'] ?? 0) + 1;
      return true;
    });
    middleware.addWillDelRowCallback((_tableId, _rowId) => {
      calls['willDelRow'] = (calls['willDelRow'] ?? 0) + 1;
      return true;
    });
    middleware.addWillDelCellCallback((_tableId, _rowId, _cellId) => {
      calls['willDelCell'] = (calls['willDelCell'] ?? 0) + 1;
      return true;
    });
    middleware.addWillDelValuesCallback(() => {
      calls['willDelValues'] = (calls['willDelValues'] ?? 0) + 1;
      return true;
    });
    middleware.addWillDelValueCallback((_valueId) => {
      calls['willDelValue'] = (calls['willDelValue'] ?? 0) + 1;
      return true;
    });
    middleware.addWillApplyChangesCallback((changes) => {
      calls['willApplyChanges'] = (calls['willApplyChanges'] ?? 0) + 1;
      return changes;
    });
  };

  describe('setCell only triggers willSetCell', () => {
    test('into existing row', () => {
      store.setTables({t1: {r1: {c1: 'a'}}});
      registerAllCallbacks();
      store.setCell('t1', 'r1', 'c2', 'b');
      expect(calls).toEqual({willSetCell: 1});
    });

    test('into new row of existing table', () => {
      store.setTables({t1: {r1: {c1: 'a'}}});
      registerAllCallbacks();
      store.setCell('t1', 'r2', 'c1', 'b');
      expect(calls).toEqual({willSetCell: 1});
    });

    test('into new row of new table', () => {
      registerAllCallbacks();
      store.setCell('t1', 'r1', 'c1', 'a');
      expect(calls).toEqual({willSetCell: 1});
    });
  });

  describe('setRow only triggers willSetRow and willSetCell', () => {
    test('into existing table', () => {
      store.setTables({t1: {r1: {c1: 'a'}}});
      registerAllCallbacks();
      store.setRow('t1', 'r2', {c1: 'b'});
      expect(calls).toEqual({willSetRow: 1, willSetCell: 1});
    });

    test('into new table', () => {
      registerAllCallbacks();
      store.setRow('t1', 'r1', {c1: 'a'});
      expect(calls).toEqual({willSetRow: 1, willSetCell: 1});
    });
  });

  // eslint-disable-next-line max-len
  describe('setTable only triggers willSetTable, willSetRow, willSetCell', () => {
    test('new table', () => {
      registerAllCallbacks();
      store.setTable('t1', {r1: {c1: 'a'}});
      expect(calls).toEqual({
        willSetTable: 1,
        willSetRow: 1,
        willSetCell: 1,
      });
    });

    test('existing table', () => {
      store.setTables({t1: {r1: {c1: 'a'}}});
      registerAllCallbacks();
      store.setTable('t1', {r1: {c1: 'b'}});
      expect(calls).toEqual({
        willSetTable: 1,
        willSetRow: 1,
        willSetCell: 1,
      });
    });
  });

  describe('setTables triggers willSetTables down to willSetCell', () => {
    test('new tables', () => {
      registerAllCallbacks();
      store.setTables({t1: {r1: {c1: 'a'}}});
      expect(calls).toEqual({
        willSetTables: 1,
        willSetTable: 1,
        willSetRow: 1,
        willSetCell: 1,
      });
    });
  });

  describe('setValue only triggers willSetValue', () => {
    test('new value', () => {
      registerAllCallbacks();
      store.setValue('v1', 'a');
      expect(calls).toEqual({willSetValue: 1});
    });

    test('existing value', () => {
      store.setValues({v1: 'a'});
      registerAllCallbacks();
      store.setValue('v1', 'b');
      expect(calls).toEqual({willSetValue: 1});
    });
  });

  describe('setValues triggers willSetValues and willSetValue', () => {
    test('new values', () => {
      registerAllCallbacks();
      store.setValues({v1: 'a'});
      expect(calls).toEqual({willSetValues: 1, willSetValue: 1});
    });
  });

  describe('setPartialRow only triggers willSetCell', () => {
    test('into existing row', () => {
      store.setTables({t1: {r1: {c1: 'a'}}});
      registerAllCallbacks();
      store.setPartialRow('t1', 'r1', {c2: 'b'});
      expect(calls).toEqual({willSetCell: 1});
    });
  });

  describe('setPartialValues only triggers willSetValue', () => {
    test('existing values', () => {
      store.setValues({v1: 'a'});
      registerAllCallbacks();
      store.setPartialValues({v2: 'b'});
      expect(calls).toEqual({willSetValue: 1});
    });
  });

  describe('addRow only triggers willSetRow and willSetCell', () => {
    test('into existing table', () => {
      store.setTables({t1: {r1: {c1: 'a'}}});
      registerAllCallbacks();
      store.addRow('t1', {c1: 'b'});
      expect(calls).toEqual({willSetRow: 1, willSetCell: 1});
    });

    test('into new table', () => {
      registerAllCallbacks();
      store.addRow('t1', {c1: 'a'});
      expect(calls).toEqual({willSetRow: 1, willSetCell: 1});
    });
  });

  describe('delCell only triggers willDelCell', () => {
    test('existing cell', () => {
      store.setTables({t1: {r1: {c1: 'a', c2: 'b'}}});
      registerAllCallbacks();
      store.delCell('t1', 'r1', 'c2');
      expect(calls).toEqual({willDelCell: 1});
    });
  });

  describe('delValue only triggers willDelValue', () => {
    test('existing value', () => {
      store.setValues({v1: 'a', v2: 'b'});
      registerAllCallbacks();
      store.delValue('v2');
      expect(calls).toEqual({willDelValue: 1});
    });
  });

  describe('delRow only triggers willDelRow and willDelCell', () => {
    test('existing row', () => {
      store.setTables({t1: {r1: {c1: 'a'}, r2: {c1: 'b'}}});
      registerAllCallbacks();
      store.delRow('t1', 'r1');
      expect(calls).toEqual({willDelRow: 1, willDelCell: 1});
    });
  });

  describe('delTable only triggers willDelTable down to willDelCell', () => {
    test('existing table', () => {
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      registerAllCallbacks();
      store.delTable('t1');
      expect(calls).toEqual({
        willDelTable: 1,
        willDelRow: 1,
        willDelCell: 1,
      });
    });
  });

  describe('delTables triggers willDelTables down to willDelCell', () => {
    test('existing tables', () => {
      store.setTables({t1: {r1: {c1: 'a'}}});
      registerAllCallbacks();
      store.delTables();
      expect(calls).toEqual({
        willDelTables: 1,
        willDelTable: 1,
        willDelRow: 1,
        willDelCell: 1,
      });
    });
  });

  describe('delValues triggers willDelValues and willDelValue', () => {
    test('existing values', () => {
      store.setValues({v1: 'a'});
      registerAllCallbacks();
      store.delValues();
      expect(calls).toEqual({willDelValues: 1, willDelValue: 1});
    });
  });

  describe('setContent triggers full set hierarchy', () => {
    test('new content', () => {
      registerAllCallbacks();
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 'b'}]);
      expect(calls).toEqual({
        willSetContent: 1,
        willSetTables: 1,
        willSetTable: 1,
        willSetRow: 1,
        willSetCell: 1,
        willSetValues: 1,
        willSetValue: 1,
      });
    });

    test('with multiple tables, rows, cells, values', () => {
      registerAllCallbacks();
      store.setContent([
        {t1: {r1: {c1: 'a', c2: 'b'}, r2: {c1: 'c'}}, t2: {r1: {c1: 'd'}}},
        {v1: 'x', v2: 'y'},
      ]);
      expect(calls).toEqual({
        willSetContent: 1,
        willSetTables: 1,
        willSetTable: 2,
        willSetRow: 3,
        willSetCell: 4,
        willSetValues: 1,
        willSetValue: 2,
      });
    });

    test('replacing existing content triggers del callbacks too', () => {
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 'x'}]);
      registerAllCallbacks();
      store.setContent([{t2: {r1: {c1: 'b'}}}, {v2: 'y'}]);
      expect(calls).toEqual({
        willSetContent: 1,
        willSetTables: 1,
        willSetTable: 1,
        willSetRow: 1,
        willSetCell: 1,
        willDelTable: 1,
        willDelRow: 1,
        willDelCell: 1,
        willSetValues: 1,
        willSetValue: 1,
        willDelValue: 1,
      });
    });
  });

  describe('applyChanges triggers willApplyChanges and granular', () => {
    test('setting cells', () => {
      registerAllCallbacks();
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {}, 1]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willSetCell: 1,
      });
    });

    test('setting values', () => {
      registerAllCallbacks();
      store.applyChanges([{}, {v1: 'a'}, 1]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willSetValue: 1,
      });
    });

    test('setting cells and values', () => {
      registerAllCallbacks();
      store.applyChanges([{t1: {r1: {c1: 'a'}}}, {v1: 'b'}, 1]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willSetCell: 1,
        willSetValue: 1,
      });
    });

    test('deleting cells', () => {
      store.setTables({t1: {r1: {c1: 'a', c2: 'b'}}});
      registerAllCallbacks();
      store.applyChanges([{t1: {r1: {c2: undefined}}}, {}, 1]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willDelCell: 1,
      });
    });

    test('deleting cells (deleting rows)', () => {
      store.setTables({t1: {r1: {c1: 'a'}}});
      registerAllCallbacks();
      store.applyChanges([{t1: {r1: {c1: undefined}}}, {}, 1]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willDelCell: 1,
      });
    });

    test('deleting rows', () => {
      store.setTables({t1: {r1: {c1: 'a'}, r2: {c1: 'b'}}});
      registerAllCallbacks();
      store.applyChanges([{t1: {r1: undefined}}, {}, 1]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willDelRow: 1,
        willDelCell: 1,
      });
    });

    test('deleting tables', () => {
      store.setTables({t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}});
      registerAllCallbacks();
      store.applyChanges([{t1: undefined}, {}, 1]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willDelTable: 1,
        willDelRow: 1,
        willDelCell: 1,
      });
    });

    test('deleting values', () => {
      store.setValues({v1: 'a', v2: 'b'});
      registerAllCallbacks();
      store.applyChanges([{}, {v1: undefined}, 1]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willDelValue: 1,
      });
    });

    test('mixed set and delete', () => {
      store.setContent([{t1: {r1: {c1: 'a'}}}, {v1: 'x'}]);
      registerAllCallbacks();
      store.applyChanges([
        {t1: {r1: {c1: undefined, c2: 'b'}}},
        {v1: undefined, v2: 'y'},
        1,
      ]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willDelCell: 1,
        willSetCell: 1,
        willDelValue: 1,
        willSetValue: 1,
      });
    });

    test('does not trigger parent set callbacks', () => {
      registerAllCallbacks();
      store.applyChanges([
        {t1: {r1: {c1: 'a'}}, t2: {r1: {c1: 'b'}}},
        {v1: 'x', v2: 'y'},
        1,
      ]);
      expect(calls).toEqual({
        willApplyChanges: 1,
        willSetCell: 2,
        willSetValue: 2,
      });
      expect(calls).not.toHaveProperty('willSetContent');
      expect(calls).not.toHaveProperty('willSetTables');
      expect(calls).not.toHaveProperty('willSetTable');
      expect(calls).not.toHaveProperty('willSetRow');
      expect(calls).not.toHaveProperty('willSetValues');
    });
  });
});

describe('middleware not called during doRollback', () => {
  let calls: Record<string, number>;

  const registerAllCallbacks = () => {
    calls = {};
    middleware.addWillSetCellCallback((_tId, _rId, _cId, cell) => {
      calls['willSetCell'] = (calls['willSetCell'] ?? 0) + 1;
      return cell;
    });
    middleware.addWillSetValueCallback((_vId, value) => {
      calls['willSetValue'] = (calls['willSetValue'] ?? 0) + 1;
      return value;
    });
    middleware.addWillDelCellCallback(() => {
      calls['willDelCell'] = (calls['willDelCell'] ?? 0) + 1;
      return true;
    });
    middleware.addWillDelValueCallback(() => {
      calls['willDelValue'] = (calls['willDelValue'] ?? 0) + 1;
      return true;
    });
  };

  test('rolling back cell changes does not trigger middleware', () => {
    store.setTables({t1: {r1: {c1: 'a'}}});
    registerAllCallbacks();
    store.transaction(
      () => {
        store.setCell('t1', 'r1', 'c1', 'b');
      },
      () => true,
    );

    expect(calls).toEqual({willSetCell: 1});
    expect(store.getCell('t1', 'r1', 'c1')).toBe('a');
  });

  test('rolling back new cell does not trigger middleware', () => {
    registerAllCallbacks();
    store.transaction(
      () => {
        store.setCell('t1', 'r1', 'c1', 'a');
      },
      () => true,
    );

    expect(calls).toEqual({willSetCell: 1});
    expect(store.getTables()).toEqual({});
  });

  test('rolling back value changes does not trigger middleware', () => {
    store.setValues({v1: 'a'});
    registerAllCallbacks();
    store.transaction(
      () => {
        store.setValue('v1', 'b');
      },
      () => true,
    );
    expect(calls).toEqual({willSetValue: 1});
    expect(store.getValue('v1')).toBe('a');
  });

  test('rolling back new value does not trigger middleware', () => {
    registerAllCallbacks();
    store.transaction(
      () => {
        store.setValue('v1', 'a');
      },
      () => true,
    );
    expect(calls).toEqual({willSetValue: 1});
    expect(store.getValues()).toEqual({});
  });

  test('rolling back cell deletion does not trigger middleware', () => {
    store.setTables({t1: {r1: {c1: 'a', c2: 'b'}}});
    registerAllCallbacks();
    store.transaction(
      () => {
        store.delCell('t1', 'r1', 'c2');
      },
      () => true,
    );
    expect(calls).toEqual({willDelCell: 1});
    expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 'b'});
  });

  test('rolling back value deletion does not trigger middleware', () => {
    store.setValues({v1: 'a', v2: 'b'});
    registerAllCallbacks();
    store.transaction(
      () => {
        store.delValue('v2');
      },
      () => true,
    );
    expect(calls).toEqual({willDelValue: 1});
    expect(store.getValues()).toEqual({v1: 'a', v2: 'b'});
  });
});

describe('middleware not called during checkpoint undo/redo', () => {
  let calls: Record<string, number>;

  const registerAllCallbacks = () => {
    calls = {};
    middleware.addWillSetRowCallback((_tId, _rId, row) => {
      calls['willSetRow'] = (calls['willSetRow'] ?? 0) + 1;
      return row;
    });
    middleware.addWillSetCellCallback((_tId, _rId, _cId, cell) => {
      calls['willSetCell'] = (calls['willSetCell'] ?? 0) + 1;
      return cell;
    });
    middleware.addWillSetValueCallback((_vId, value) => {
      calls['willSetValue'] = (calls['willSetValue'] ?? 0) + 1;
      return value;
    });
    middleware.addWillDelCellCallback(() => {
      calls['willDelCell'] = (calls['willDelCell'] ?? 0) + 1;
      return true;
    });
    middleware.addWillDelValueCallback(() => {
      calls['willDelValue'] = (calls['willDelValue'] ?? 0) + 1;
      return true;
    });
  };

  test('undo does not trigger middleware', () => {
    const checkpoints = createCheckpoints(store);
    store.setTables({t1: {r1: {c1: 'a'}}});
    checkpoints.addCheckpoint('initial');
    registerAllCallbacks();
    store.setCell('t1', 'r1', 'c1', 'b');
    checkpoints.addCheckpoint('changed');
    expect(calls).toEqual({willSetCell: 1});
    calls = {};
    checkpoints.goBackward();
    expect(calls).toEqual({});
    expect(store.getCell('t1', 'r1', 'c1')).toBe('a');
  });

  test('redo does not trigger middleware', () => {
    const checkpoints = createCheckpoints(store);
    store.setTables({t1: {r1: {c1: 'a'}}});
    checkpoints.addCheckpoint('initial');
    registerAllCallbacks();
    store.setCell('t1', 'r1', 'c1', 'b');
    checkpoints.addCheckpoint('changed');
    calls = {};
    checkpoints.goBackward();
    checkpoints.goForward();
    expect(calls).toEqual({});
    expect(store.getCell('t1', 'r1', 'c1')).toBe('b');
  });

  test('undo of new row does not trigger middleware', () => {
    const checkpoints = createCheckpoints(store);
    checkpoints.addCheckpoint('empty');
    registerAllCallbacks();
    store.setRow('t1', 'r1', {c1: 'a'});
    checkpoints.addCheckpoint('added');
    expect(calls).toEqual({willSetRow: 1, willSetCell: 1});
    calls = {};
    checkpoints.goBackward();
    expect(calls).toEqual({});
    expect(store.getTables()).toEqual({});
  });

  test('undo of value change does not trigger middleware', () => {
    const checkpoints = createCheckpoints(store);
    store.setValues({v1: 'a'});
    checkpoints.addCheckpoint('initial');
    registerAllCallbacks();
    store.setValue('v1', 'b');
    checkpoints.addCheckpoint('changed');
    expect(calls).toEqual({willSetValue: 1});
    calls = {};
    checkpoints.goBackward();
    expect(calls).toEqual({});
    expect(store.getValue('v1')).toBe('a');
  });

  test('undo of new value does not trigger middleware', () => {
    const checkpoints = createCheckpoints(store);
    checkpoints.addCheckpoint('empty');
    registerAllCallbacks();
    store.setValue('v1', 'a');
    checkpoints.addCheckpoint('added');
    expect(calls).toEqual({willSetValue: 1});
    calls = {};
    checkpoints.goBackward();
    expect(calls).toEqual({});
    expect(store.getValues()).toEqual({});
  });
});

describe('Mutator listeners', () => {
  test('middleware runs on cells set by a mutator listener', () => {
    middleware.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) =>
      typeof cell === 'string' ? cell.toUpperCase() : cell,
    );
    store.addCellListener(
      't1',
      'r1',
      'c1',
      (store) => store.setCell('t2', 'r2', 'c2', 'from_mutator'),
      true,
    );
    store.setCell('t1', 'r1', 'c1', 'hello');
    expect(store.getCell('t1', 'r1', 'c1')).toEqual('HELLO');
    expect(store.getCell('t2', 'r2', 'c2')).toEqual('FROM_MUTATOR');
  });

  test('middleware can block cells set by a mutator listener', () => {
    middleware.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
      tableId === 't2' ? undefined : cell,
    );
    store.addCellListener(
      't1',
      'r1',
      'c1',
      (store) => store.setCell('t2', 'r2', 'c2', 'blocked'),
      true,
    );
    store.setCell('t1', 'r1', 'c1', 'hello');
    expect(store.getCell('t1', 'r1', 'c1')).toEqual('hello');
    expect(store.getCell('t2', 'r2', 'c2')).toBeUndefined();
  });
});

describe('MergeableStore direct API', () => {
  const [reset, getNow] = getTimeFunctions();
  let store1: MergeableStore;
  let store2: MergeableStore;
  let middleware2: Middleware;

  beforeEach(() => {
    reset();
    store1 = createMergeableStore('s1', getNow);
    store2 = createMergeableStore('s2', getNow);
    middleware2 = createMiddleware(store2);
  });

  describe('sync path', () => {
    test('willSetRow does not fire on applyMergeableChanges', () => {
      let willSetRowCalled = false;
      middleware2.addWillSetRowCallback((_tableId, _rowId, row) => {
        willSetRowCalled = true;
        return row;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(willSetRowCalled).toBe(false);
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('willSetCell fires on applyMergeableChanges', () => {
      middleware2.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) =>
        typeof cell === 'string' ? cell.toUpperCase() : cell,
      );
      store1.setCell('t1', 'r1', 'c1', 'hello');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('HELLO');
    });

    test('willApplyChanges fires on applyMergeableChanges', () => {
      middleware2.addWillApplyChangesCallback((changes) => {
        const t1 = changes[0].t1;
        if (t1?.r1) {
          t1.r1.synced = true;
        }
        return changes;
      });
      store1.setRow('t1', 'r1', {c1: 'v1'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', synced: true});
    });

    test('willApplyChanges can block applyMergeableChanges', () => {
      middleware2.addWillApplyChangesCallback(() => undefined);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTables()).toEqual({});
    });
  });

  describe('setMergeableContent', () => {
    test('willApplyChanges fires on setMergeableContent', () => {
      let called = false;
      middleware2.addWillApplyChangesCallback((changes) => {
        called = true;
        return changes;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.setMergeableContent(store1.getMergeableContent());
      expect(called).toBe(true);
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('willApplyChanges can block setMergeableContent', () => {
      middleware2.addWillApplyChangesCallback(() => undefined);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.setMergeableContent(store1.getMergeableContent());
      expect(store2.getTables()).toEqual({});
    });
  });

  describe('merge', () => {
    test('willApplyChanges fires during merge', () => {
      middleware2.addWillApplyChangesCallback((changes) => {
        const t1 = changes[0].t1;
        if (t1) {
          for (const rowId in t1) {
            const row = t1[rowId];
            if (row) {
              row.merged = true;
            }
          }
        }
        return changes;
      });
      store1.setRow('t1', 'r1', {c1: 'v1'});
      store2.merge(store1);
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', merged: true});
    });

    test('willApplyChanges can block merge', () => {
      middleware2.addWillApplyChangesCallback(() => undefined);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.merge(store1);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store1.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('willSetCell can filter cells during merge', () => {
      middleware2.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.merge(store1);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store1.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });
  });

  describe('side effects inside callbacks', () => {
    test('callback can write to a different table', () => {
      middleware2.addWillSetCellCallback((tableId, rowId, _cellId, cell) => {
        if (tableId === 'jobs') {
          store2.setRow('audit', 'a1', {
            action: 'job-created',
            jobId: rowId,
          });
        }
        return cell;
      });
      store1.setRow('jobs', 'j1', {name: 'Test Job'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('jobs', 'j1')).toEqual({name: 'Test Job'});
      expect(store2.getRow('audit', 'a1')).toEqual({
        action: 'job-created',
        jobId: 'j1',
      });
    });

    test('callback can read existing state when writing', () => {
      store2.setRow('config', 'settings', {auditEnabled: true});
      middleware2.addWillSetCellCallback((tableId, rowId, _cellId, cell) => {
        if (tableId === 'jobs') {
          const settings = store2.getRow('config', 'settings');
          if (settings.auditEnabled) {
            store2.setRow('audit', 'audit-' + rowId, {
              action: 'job-created',
              jobId: rowId,
            });
          }
        }
        return cell;
      });
      store1.setRow('jobs', 'j1', {name: 'Test Job'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('audit', 'audit-j1')).toEqual({
        action: 'job-created',
        jobId: 'j1',
      });
    });
  });
});

describe('middleware with synchronization', () => {
  const [reset, getNow, pause] = getTimeFunctions();
  let store1: MergeableStore;
  let store2: MergeableStore;
  let middleware2: Middleware;

  beforeEach(() => {
    reset();
    store1 = createMergeableStore('s1', getNow);
    store2 = createMergeableStore('s2', getNow);
    middleware2 = createMiddleware(store2);
  });

  test('middleware intercepts incoming synced cell', async () => {
    const calls: string[] = [];
    middleware2.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
      calls.push(`willSetCell:${tableId}/${rowId}/${cellId}=${cell}`);
      return cell;
    });

    const sync1 = createLocalSynchronizer(store1);
    const sync2 = createLocalSynchronizer(store2);
    await sync1.startSync();
    await sync2.startSync();
    await pause();

    store1.setCell('t1', 'r1', 'c1', 'a');
    await pause();

    expect(store2.getCell('t1', 'r1', 'c1')).toBe('a');
    expect(calls).toEqual(['willSetCell:t1/r1/c1=a']);

    await sync1.destroy();
    await sync2.destroy();
  });

  test('middleware transforms incoming synced cell', async () => {
    middleware2.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
      if (typeof cell === 'string') {
        return cell.toUpperCase();
      }
      return cell;
    });

    const sync1 = createLocalSynchronizer(store1);
    const sync2 = createLocalSynchronizer(store2);
    await sync1.startSync();
    await sync2.startSync();
    await pause();

    store1.setCell('t1', 'r1', 'c1', 'a');
    await pause();

    expect(store2.getCell('t1', 'r1', 'c1')).toBe('A');

    await sync1.destroy();
    await sync2.destroy();
  });

  test('middleware blocks incoming synced cell', async () => {
    middleware2.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
      if (cellId === 'c2') {
        return undefined;
      }
      return cell;
    });

    const sync1 = createLocalSynchronizer(store1);
    const sync2 = createLocalSynchronizer(store2);
    await sync1.startSync();
    await sync2.startSync();
    await pause();

    store1.setCell('t1', 'r1', 'c1', 'a');
    store1.setCell('t1', 'r1', 'c2', 'z');
    await pause();

    expect(store2.getCell('t1', 'r1', 'c1')).toBe('a');
    expect(store2.getCell('t1', 'r1', 'c2')).toBeUndefined();

    await sync1.destroy();
    await sync2.destroy();
  });

  test('middleware intercepts incoming synced value', async () => {
    middleware2.addWillSetValueCallback((valueId, value) => {
      if (typeof value === 'string') {
        return value.toUpperCase();
      }
      return value;
    });

    const sync1 = createLocalSynchronizer(store1);
    const sync2 = createLocalSynchronizer(store2);
    await sync1.startSync();
    await sync2.startSync();
    await pause();

    store1.setValue('v1', 'a');
    await pause();

    expect(store2.getValue('v1')).toBe('A');

    await sync1.destroy();
    await sync2.destroy();
  });

  test('middleware-transformed data syncs back to originator', async () => {
    middleware2.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
      if (typeof cell === 'string') {
        return cell.toUpperCase();
      }
      return cell;
    });

    const sync1 = createLocalSynchronizer(store1);
    const sync2 = createLocalSynchronizer(store2);
    await sync1.startSync();
    await sync2.startSync();
    await pause();

    store1.setCell('t1', 'r1', 'c1', 'a');
    await pause();

    expect(store2.getCell('t1', 'r1', 'c1')).toBe('A');

    await pause(100);
    expect(store1.getCell('t1', 'r1', 'c1')).toBe('A');

    await sync1.destroy();
    await sync2.destroy();
  });

  test('middleware-transformed value syncs back to originator', async () => {
    middleware2.addWillSetValueCallback((valueId, value) => {
      if (typeof value === 'string') {
        return value.toUpperCase();
      }
      return value;
    });

    const sync1 = createLocalSynchronizer(store1);
    const sync2 = createLocalSynchronizer(store2);
    await sync1.startSync();
    await sync2.startSync();
    await pause();

    store1.setValue('v1', 'a');
    await pause();

    expect(store2.getValue('v1')).toBe('A');

    await pause(100);
    expect(store1.getValue('v1')).toBe('A');

    await sync1.destroy();
    await sync2.destroy();
  });
});
