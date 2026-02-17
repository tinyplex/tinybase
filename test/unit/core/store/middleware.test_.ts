import type {MergeableStore, Middleware, Store} from 'tinybase';
import {createMergeableStore, createMiddleware, createStore} from 'tinybase';
import {beforeEach, describe, expect, test} from 'vitest';
import {getTimeFunctions} from '../../common/mergeable.ts';

const [reset, getNow] = getTimeFunctions();

beforeEach(() => {
  reset();
});

describe('Base Store Middleware', () => {
  let store: Store;
  let middleware: Middleware;

  beforeEach(() => {
    store = createStore();
    middleware = createMiddleware(store);
  });

  describe('setRow', () => {
    test('No middleware callbacks - row is set', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1'});
    });

    test('Accept row by returning row', () => {
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => row);
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1'});
    });

    test('Reject row by returning undefined', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getTables()).toEqual({});
    });

    test('Transform cells', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? {...row, added: 'yes'} : row,
      );
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });

    test('Only affects specified table', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.setRow('t2', 'r1', {c1: 'v2'});
      expect(store.getTable('t1')).toEqual({});
      expect(store.getRow('t2', 'r1')).toEqual({c1: 'v2'});
    });

    test('Fluent chaining', () => {
      const result = middleware.addWillSetRowCallback(
        (_tableId, _rowId, row) => row,
      );
      expect(result).toBe(middleware);
    });
  });

  describe('setCell', () => {
    test('No middleware callbacks - cell is set', () => {
      store.setCell('t1', 'r1', 'c1', 'v1');
      expect(store.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Accept cell via cell middleware', () => {
      middleware.addWillSetCellCallback(
        (_tableId, _rowId, _cellId, cell) => cell,
      );
      store.setCell('t1', 'r1', 'c1', 'v1');
      expect(store.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Reject cell by returning undefined', () => {
      middleware.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store.setCell('t1', 'r1', 'c1', 'v1');
      expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('Transform cell value', () => {
      middleware.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' && typeof cell === 'string'
          ? cell.toUpperCase()
          : cell,
      );
      store.setCell('t1', 'r1', 'c1', 'hello');
      expect(store.getCell('t1', 'r1', 'c1')).toEqual('HELLO');
    });
  });

  describe('setPartialRow', () => {
    test('No middleware callbacks - partial row is set', () => {
      store.setRow('t1', 'r1', {c1: 'v1', c2: 'v2'});
      store.setPartialRow('t1', 'r1', {c2: 'updated'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', c2: 'updated'});
    });

    test('Reject partial row by returning undefined', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      middleware.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store.setPartialRow('t1', 'r1', {c2: 'v2'});
      // Original row unchanged
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1'});
    });

    test('Transform partial row', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      middleware.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' && typeof cell === 'string'
          ? cell.toUpperCase()
          : cell,
      );
      store.setPartialRow('t1', 'r1', {c2: 'v2'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', c2: 'V2'});
    });
  });

  describe('addRow', () => {
    test('No middleware callbacks - row is added', () => {
      const rowId = store.addRow('t1', {c1: 'v1'});
      expect(rowId).toBeDefined();
      expect(store.getRow('t1', rowId!)).toEqual({c1: 'v1'});
    });

    test('Reject row prevents creation', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store.addRow('t1', {c1: 'v1'});
      expect(store.getRowCount('t1')).toBe(0);
    });

    test('Transform added row', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? {...row, auto: 'yes'} : row,
      );
      const rowId = store.addRow('t1', {c1: 'v1'});
      expect(store.getRow('t1', rowId!)).toEqual({c1: 'v1', auto: 'yes'});
    });
  });

  describe('applyChanges', () => {
    test('No middleware callbacks - changes applied', () => {
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1'});
    });

    test('Reject rows via middleware', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getRowCount('t1')).toBe(0);
    });

    test('Transform rows', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? {...row, validated: true} : row,
      );
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', validated: true});
    });

    test('Row deletions pass through', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      // Deletions are not affected by willSetRow
      store.applyChanges([{t1: {r1: undefined}}, {}, 1]);
      expect(store.getTable('t1')).toEqual({});
    });

    test('Table deletions pass through', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store.applyChanges([{t1: undefined}, {}, 1]);
      expect(store.getTables()).toEqual({});
    });
  });

  describe('Callbacks for all tables', () => {
    test('Runs for all tables', () => {
      const seen: string[] = [];
      middleware.addWillSetRowCallback((tableId, _rowId, row) => {
        seen.push(tableId);
        return row;
      });
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.setRow('t2', 'r1', {c1: 'v2'});
      expect(seen.sort()).toEqual(['t1', 't2']);
    });

    test('Receives correct tableId, rowId, row', () => {
      let received: [string, string, object] | undefined;
      middleware.addWillSetRowCallback((tableId, rowId, row) => {
        received = [tableId, rowId, row];
        return row;
      });
      store.setRow('myTable', 'myRow', {a: 1, b: 2});
      expect(received).toEqual(['myTable', 'myRow', {a: 1, b: 2}]);
    });

    test('Can reject rows from any table', () => {
      middleware.addWillSetRowCallback(() => undefined);
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.setRow('t2', 'r1', {c1: 'v2'});
      expect(store.getTables()).toEqual({});
    });

    test('Callbacks run in registration order', () => {
      const order: string[] = [];
      middleware
        .addWillSetRowCallback((tableId, _rowId, row) => {
          if (tableId === 't1') order.push('t1-specific');
          return row;
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push('general');
          return row;
        });
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(order).toEqual(['t1-specific', 'general']);
    });
  });

  describe('Multiple handlers', () => {
    test('Multiple handlers run in order', () => {
      const order: number[] = [];
      middleware
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push(1);
          return row;
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push(2);
          return row;
        });
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(order).toEqual([1, 2]);
    });

    test('Short-circuit on undefined in chain', () => {
      const order: number[] = [];
      middleware
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push(1);
          return row;
        })
        .addWillSetRowCallback(() => {
          order.push(2);
          return undefined;
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push(3);
          return row;
        });
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(order).toEqual([1, 2]);
      expect(store.getTables()).toEqual({});
    });
  });
});

describe('MergeableStore Middleware', () => {
  let store1: MergeableStore;
  let store2: MergeableStore;
  let middleware2: Middleware;

  beforeEach(() => {
    store1 = createMergeableStore('s1', getNow);
    store2 = createMergeableStore('s2', getNow);
    middleware2 = createMiddleware(store2);
  });

  describe('Sync path (applyMergeableChanges)', () => {
    test('No middleware callbacks - sync works', () => {
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Accept row by returning row', () => {
      middleware2.addWillSetRowCallback((_tableId, _rowId, row) => row);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Reject row by returning undefined', () => {
      middleware2.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('Only affects specified table', () => {
      middleware2.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store2.getCell('t2', 'r1', 'c1')).toEqual('v2');
    });

    test('Transform cells via row callback', () => {
      middleware2.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? {...row, added: 'yes'} : row,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });

    test('Receives correct rowId', () => {
      let receivedRowId: string | undefined;
      middleware2.addWillSetRowCallback((tableId, rowId, row) => {
        if (tableId === 't1') receivedRowId = rowId;
        return row;
      });
      store1.setCell('t1', 'myRow', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(receivedRowId).toEqual('myRow');
    });

    test('Multiple handlers run in order', () => {
      const order: number[] = [];
      middleware2
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push(1);
          return row;
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push(2);
          return row;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual([1, 2]);
    });

    test('Short-circuit on undefined', () => {
      const order: number[] = [];
      middleware2
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push(1);
          return row;
        })
        .addWillSetRowCallback(() => {
          order.push(2);
          return undefined;
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push(3);
          return row;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual([1, 2]);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('Fluent chaining', () => {
      const result = middleware2.addWillSetRowCallback(
        (_tableId, _rowId, row) => row,
      );
      expect(result).toBe(middleware2);
    });

    test('Mixed valid/invalid rows', () => {
      middleware2.addWillSetRowCallback((_tableId, rowId, row) =>
        rowId === 'invalid' ? undefined : row,
      );
      store1.setRow('t1', 'valid', {c1: 'v1'});
      store1.setRow('t1', 'invalid', {c1: 'v2', c2: 'v3'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRowIds('t1')).toEqual(['valid']);
    });
  });

  describe('Local mutations (setRow, setCell)', () => {
    test('Middleware runs on local setRow', () => {
      middleware2.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store2.setRow('t1', 'r1', {c1: 'v1'});
      expect(store2.getRowCount('t1')).toBe(0);
    });

    test('Middleware runs on local setCell', () => {
      middleware2.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store2.setCell('t1', 'r1', 'c1', 'v1');
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('Same middleware runs on both local and sync', () => {
      const calls: string[] = [];
      middleware2.addWillSetRowCallback((_tableId, _rowId, row) => {
        calls.push('middleware');
        return row;
      });

      // Local mutation
      store2.setRow('t1', 'local', {c1: 'local'});
      expect(calls).toEqual(['middleware']);

      // Sync from remote
      store1.setRow('t1', 'remote', {c1: 'remote'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(calls).toEqual(['middleware', 'middleware']);
    });
  });

  describe('Callbacks for all tables', () => {
    test('Runs for all tables on sync', () => {
      const seen: string[] = [];
      middleware2.addWillSetRowCallback((tableId, _rowId, row) => {
        seen.push(tableId);
        return row;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(seen.sort()).toEqual(['t1', 't2']);
    });

    test('Receives correct tableId and rowId', () => {
      let receivedTableId: string | undefined;
      let receivedRowId: string | undefined;
      middleware2.addWillSetRowCallback((tableId, rowId, row) => {
        receivedTableId = tableId;
        receivedRowId = rowId;
        return row;
      });
      store1.setRow('myTable', 'myRow', {a: 1, b: 2});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(receivedTableId).toEqual('myTable');
      expect(receivedRowId).toEqual('myRow');
    });

    test('Callbacks run in registration order', () => {
      const order: string[] = [];
      middleware2
        .addWillSetRowCallback((tableId, _rowId, row) => {
          if (tableId === 't1') order.push('t1-specific');
          return row;
        })
        .addWillSetRowCallback((_tableId, _rowId, row) => {
          order.push('general');
          return row;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual(['t1-specific', 'general']);
    });

    test('Can reject rows', () => {
      middleware2.addWillSetRowCallback(() => undefined);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('Can transform rows', () => {
      middleware2.addWillSetRowCallback((tableId, _rowId, row) => ({
        ...row,
        fromTable: tableId,
      }));
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('t1', 'r1')).toEqual({
        c1: 'v1',
        fromTable: 't1',
      });
    });
  });

  describe('setMergeableContent', () => {
    test('Middleware runs on setMergeableContent', () => {
      let rowCallbackCalled = false;
      middleware2.addWillSetRowCallback((_tableId, _rowId, row) => {
        rowCallbackCalled = true;
        return row;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.setMergeableContent(store1.getMergeableContent());
      expect(rowCallbackCalled).toBe(true);
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });
  });

  describe('merge()', () => {
    test('Middleware runs on merge', () => {
      middleware2.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.merge(store1);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      // store1 should be unchanged (received store2's empty content)
      expect(store1.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });
  });

  describe('Middleware side-effects with setRow', () => {
    test('setRow inside middleware persists locally', () => {
      middleware2.addWillSetRowCallback((tableId, rowId, row) => {
        if (tableId === 'jobs') {
          store2.setRow('audit', 'a1', {
            action: 'job-created',
            jobId: rowId,
          });
        }
        return row;
      });

      store1.setRow('jobs', 'j1', {name: 'Test Job'});
      store2.applyMergeableChanges(store1.getMergeableContent());

      expect(store2.getRow('jobs', 'j1')).toEqual({name: 'Test Job'});
      expect(store2.getRow('audit', 'a1')).toEqual({
        action: 'job-created',
        jobId: 'j1',
      });
    });

    test('middleware can read existing store state', () => {
      store2.setRow('config', 'settings', {auditEnabled: true});

      middleware2.addWillSetRowCallback((tableId, rowId, row) => {
        if (tableId === 'jobs') {
          const settings = store2.getRow('config', 'settings');
          if (settings.auditEnabled) {
            store2.setRow('audit', 'audit-' + rowId, {
              action: 'job-created',
              jobId: rowId,
            });
          }
        }
        return row;
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

describe('More MergeableStore Middleware', () => {
  let store1: MergeableStore;
  let store2: MergeableStore;

  beforeEach(() => {
    store1 = createMergeableStore('s1', getNow);
    store2 = createMergeableStore('s2', getNow);
  });

  describe('use() basics', () => {
    test('No middleware - sync works', () => {
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Passthrough', () => {
      store2.use('*', (_tableId, _rowId, cells) => cells);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Reject all', () => {
      store2.use('*', () => null);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTables()).toEqual({});
    });

    test('Fluent chaining', () => {
      const result = store2.use('*', (_tableId, _rowId, cells) => cells);
      expect(result).toBe(store2);
    });
  });

  describe('Sync path (applyMergeableChanges)', () => {
    test('Accept row by returning cells', () => {
      store2.use('*', (_tableId, _rowId, cells) => cells);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Reject row by returning null', () => {
      store2.use('*', (tableId, _rowId, cells) =>
        tableId === 't1' ? null : cells,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('Only affects specified table', () => {
      store2.use('*', (tableId, _rowId, cells) =>
        tableId === 't1' ? null : cells,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store2.getCell('t2', 'r1', 'c1')).toEqual('v2');
    });

    test('Transform cells via row callback', () => {
      store2.use('*', (tableId, _rowId, cells) =>
        tableId === 't1' ? {...cells, added: 'yes'} : cells,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });

    test('Receives correct rowId', () => {
      let receivedRowId: string | undefined;
      store2.use('*', (tableId, rowId, cells) => {
        if (tableId === 't1') receivedRowId = rowId as string;
        return cells;
      });
      store1.setCell('t1', 'myRow', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(receivedRowId).toEqual('myRow');
    });

    test('Mixed valid/invalid rows', () => {
      store2.use('*', (_tableId, rowId, cells) =>
        rowId === 'invalid' ? null : cells,
      );
      store1.setRow('t1', 'valid', {c1: 'v1'});
      store1.setRow('t1', 'invalid', {c1: 'v2', c2: 'v3'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRowIds('t1')).toEqual(['valid']);
    });
  });

  describe('Table-specific middleware', () => {
    test('use with specific tableId', () => {
      store2.use('t1', (_rowId, cells) => ({...cells, source: 't1'}));
      store1.setRow('t1', 'r1', {c1: 'v1'});
      store1.setRow('t2', 'r1', {c1: 'v2'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', source: 't1'});
      expect(store2.getRow('t2', 'r1')).toEqual({c1: 'v2'});
    });

    test('Reject rows from specific table only', () => {
      store2.use('t1', () => null);
      store1.setRow('t1', 'r1', {c1: 'v1'});
      store1.setRow('t2', 'r1', {c1: 'v2'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTable('t1')).toEqual({});
      expect(store2.getRow('t2', 'r1')).toEqual({c1: 'v2'});
    });
  });

  describe('Multiple handlers', () => {
    test('Multiple use calls run in order', () => {
      const order: number[] = [];
      store2
        .use('*', (_tableId, _rowId, cells) => {
          order.push(1);
          return cells;
        })
        .use('*', (_tableId, _rowId, cells) => {
          order.push(2);
          return cells;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual([1, 2]);
    });

    test('Short-circuit on null', () => {
      const order: number[] = [];
      store2
        .use('*', (_tableId, _rowId, cells) => {
          order.push(1);
          return cells;
        })
        .use('*', () => {
          order.push(2);
          return null;
        })
        .use('*', (_tableId, _rowId, cells) => {
          order.push(3);
          return cells;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual([1, 2]);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('Table-specific then catch-all', () => {
      const order: string[] = [];
      store2
        .use('t1', (_rowId, cells) => {
          order.push('t1-specific');
          return cells;
        })
        .use('*', (_tableId, _rowId, cells) => {
          order.push('catch-all');
          return cells;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual(['t1-specific', 'catch-all']);
    });
  });

  describe('Callbacks for all tables', () => {
    test('Runs for all tables on sync', () => {
      const seen: string[] = [];
      store2.use('*', (tableId, _rowId, cells) => {
        seen.push(tableId);
        return cells;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(seen.sort()).toEqual(['t1', 't2']);
    });

    test('Receives correct tableId and rowId', () => {
      let receivedTableId: string | undefined;
      let receivedRowId: string | undefined;
      store2.use('*', (tableId, rowId, cells) => {
        receivedTableId = tableId;
        receivedRowId = rowId as string;
        return cells;
      });
      store1.setRow('myTable', 'myRow', {a: 1, b: 2});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(receivedTableId).toEqual('myTable');
      expect(receivedRowId).toEqual('myRow');
    });

    test('Can reject rows from any table', () => {
      store2.use('*', () => null);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTables()).toEqual({});
    });

    test('Can transform rows', () => {
      store2.use('*', (tableId, _rowId, cells) => ({
        ...cells,
        fromTable: tableId,
      }));
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('t1', 'r1')).toEqual({
        c1: 'v1',
        fromTable: 't1',
      });
    });
  });

  describe('merge()', () => {
    test('Middleware blocks via merge', () => {
      store2.use('*', (tableId, _rowId, cells) =>
        tableId === 't1' ? null : cells,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.merge(store1);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      // store1 should be unchanged (received store2's empty content)
      expect(store1.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Middleware transforms via merge', () => {
      store2.use('*', (tableId, _rowId, cells) =>
        tableId === 't1' ? {...cells, merged: true} : cells,
      );
      store1.setRow('t1', 'r1', {c1: 'v1'});
      store2.merge(store1);
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', merged: true});
    });
  });

  describe('setMergeableContent', () => {
    // Middleware intentionally does NOT run on setMergeableContent.
    // This method is for trusted sources (persistence, initial hydration).
    // Use applyMergeableChanges for peer sync where validation is needed.
    test('Bypasses middleware', () => {
      let middlewareCalled = false;
      store2.use('*', () => {
        middlewareCalled = true;
        return null;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.setMergeableContent(store1.getMergeableContent());
      expect(middlewareCalled).toBe(false);
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });
  });

  describe('Middleware side-effects', () => {
    test('setRow inside middleware persists locally', () => {
      store2.use('*', (tableId, rowId, cells) => {
        if (tableId === 'jobs') {
          store2.setRow('audit', 'a1', {
            action: 'job-created',
            jobId: rowId as string,
          });
        }
        return cells;
      });

      store1.setRow('jobs', 'j1', {name: 'Test Job'});
      store2.applyMergeableChanges(store1.getMergeableContent());

      expect(store2.getRow('jobs', 'j1')).toEqual({name: 'Test Job'});
      expect(store2.getRow('audit', 'a1')).toEqual({
        action: 'job-created',
        jobId: 'j1',
      });
    });

    test('Middleware can read existing store state', () => {
      store2.setRow('config', 'settings', {auditEnabled: true});

      store2.use('*', (tableId, rowId, cells) => {
        if (tableId === 'jobs') {
          const settings = store2.getRow('config', 'settings');
          if (settings.auditEnabled) {
            store2.setRow('audit', 'audit-' + rowId, {
              action: 'job-created',
              jobId: rowId as string,
            });
          }
        }
        return cells;
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
