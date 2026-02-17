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
