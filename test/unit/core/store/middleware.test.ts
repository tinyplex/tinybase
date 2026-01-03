import type {MergeableStore, Row, Store} from 'tinybase';
import {createMergeableStore, createStore} from 'tinybase';
import {beforeEach, describe, expect, test} from 'vitest';
import {getTimeFunctions} from '../../common/mergeable.ts';

const [reset, getNow] = getTimeFunctions();

beforeEach(() => {
  reset();
});

describe('Base Store Middleware', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  describe('setRow', () => {
    test('No middleware - row is set', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1'});
    });

    test('Accept row by returning cells', () => {
      store.use('t1', (_rowId, cells) => cells);
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1'});
    });

    test('Reject row by returning null', () => {
      store.use('t1', () => null);
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getTables()).toEqual({});
    });

    test('Transform cells', () => {
      store.use('t1', (_rowId, cells) => ({...cells, added: 'yes'}));
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });

    test('Only affects specified table', () => {
      store.use('t1', () => null);
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.setRow('t2', 'r1', {c1: 'v2'});
      expect(store.getTable('t1')).toEqual({});
      expect(store.getRow('t2', 'r1')).toEqual({c1: 'v2'});
    });

    test('Fluent chaining', () => {
      const result = store.use('t1', (_r, c) => c);
      expect(result).toBe(store);
    });
  });

  describe('setCell', () => {
    test('No middleware - cell is set', () => {
      store.setCell('t1', 'r1', 'c1', 'v1');
      expect(store.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Accept cell via row middleware', () => {
      store.use('t1', (_rowId, cells) => cells);
      store.setCell('t1', 'r1', 'c1', 'v1');
      expect(store.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Reject cell by returning null', () => {
      store.use('t1', () => null);
      store.setCell('t1', 'r1', 'c1', 'v1');
      expect(store.getTables()).toEqual({});
    });

    test('Transform cell value', () => {
      store.use('t1', (_rowId, cells) => {
        const result: Row = {};
        for (const [k, v] of Object.entries(cells)) {
          result[k] = typeof v === 'string' ? v.toUpperCase() : v;
        }
        return result;
      });
      store.setCell('t1', 'r1', 'c1', 'hello');
      expect(store.getCell('t1', 'r1', 'c1')).toEqual('HELLO');
    });
  });

  describe('setPartialRow', () => {
    test('No middleware - partial row is set', () => {
      store.setRow('t1', 'r1', {c1: 'v1', c2: 'v2'});
      store.setPartialRow('t1', 'r1', {c2: 'updated'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', c2: 'updated'});
    });

    test('Reject partial row by returning null', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.use('t1', () => null);
      store.setPartialRow('t1', 'r1', {c2: 'v2'});
      // Original row unchanged
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1'});
    });

    test('Transform partial row', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.use('t1', (_rowId, cells) => ({...cells, extra: 'added'}));
      store.setPartialRow('t1', 'r1', {c2: 'v2'});
      expect(store.getRow('t1', 'r1')).toEqual({
        c1: 'v1',
        c2: 'v2',
        extra: 'added',
      });
    });
  });

  describe('addRow', () => {
    test('No middleware - row is added', () => {
      const rowId = store.addRow('t1', {c1: 'v1'});
      expect(rowId).toBeDefined();
      expect(store.getRow('t1', rowId!)).toEqual({c1: 'v1'});
    });

    test('Reject row returns undefined', () => {
      store.use('t1', () => null);
      const rowId = store.addRow('t1', {c1: 'v1'});
      expect(rowId).toBeUndefined();
      expect(store.getTables()).toEqual({});
    });

    test('Transform added row', () => {
      store.use('t1', (_rowId, cells) => ({...cells, auto: 'yes'}));
      const rowId = store.addRow('t1', {c1: 'v1'});
      expect(store.getRow('t1', rowId!)).toEqual({c1: 'v1', auto: 'yes'});
    });
  });

  describe('applyChanges', () => {
    test('No middleware - changes applied', () => {
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1'});
    });

    test('Reject rows via middleware', () => {
      store.use('t1', () => null);
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getTables()).toEqual({});
    });

    test('Transform rows', () => {
      store.use('t1', (_rowId, cells) => ({...cells, validated: true}));
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', validated: true});
    });

    test('Row deletions pass through', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.use('t1', () => null); // reject middleware
      // Deletions (undefined) should still pass through
      store.applyChanges([{t1: {r1: undefined}}, {}, 1]);
      expect(store.getTable('t1')).toEqual({});
    });

    test('Table deletions pass through', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.use('t1', () => null);
      store.applyChanges([{t1: undefined}, {}, 1]);
      expect(store.getTables()).toEqual({});
    });
  });

  describe('Catch-all middleware use("*", handler)', () => {
    test('Runs for all tables', () => {
      const seen: string[] = [];
      store.use('*', (tableId, _rowId, cells) => {
        seen.push(tableId);
        return cells;
      });
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.setRow('t2', 'r1', {c1: 'v2'});
      expect(seen.sort()).toEqual(['t1', 't2']);
    });

    test('Receives correct tableId, rowId, cells', () => {
      let received: [string, string | undefined, object] | undefined;
      store.use('*', (tableId, rowId, cells) => {
        received = [tableId, rowId, cells];
        return cells;
      });
      store.setRow('myTable', 'myRow', {a: 1, b: 2});
      expect(received).toEqual(['myTable', 'myRow', {a: 1, b: 2}]);
    });

    test('Can reject rows from any table', () => {
      store.use('*', () => null);
      store.setRow('t1', 'r1', {c1: 'v1'});
      store.setRow('t2', 'r1', {c1: 'v2'});
      expect(store.getTables()).toEqual({});
    });

    test('Runs after table-specific handlers', () => {
      const order: string[] = [];
      store
        .use('t1', (_rowId, cells) => {
          order.push('t1-specific');
          return cells;
        })
        .use('*', (_tableId, _rowId, cells) => {
          order.push('catch-all');
          return cells;
        });
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(order).toEqual(['t1-specific', 'catch-all']);
    });
  });

  describe('Multiple handlers', () => {
    test('Multiple handlers for same table run in order', () => {
      const order: number[] = [];
      store
        .use('t1', (_rowId, cells) => {
          order.push(1);
          return cells;
        })
        .use('t1', (_rowId, cells) => {
          order.push(2);
          return cells;
        });
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(order).toEqual([1, 2]);
    });

    test('Short-circuit on null in chain', () => {
      const order: number[] = [];
      store
        .use('t1', (_rowId, cells) => {
          order.push(1);
          return cells;
        })
        .use('t1', () => {
          order.push(2);
          return null;
        })
        .use('t1', (_rowId, cells) => {
          order.push(3);
          return cells;
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

  beforeEach(() => {
    store1 = createMergeableStore('s1', getNow);
    store2 = createMergeableStore('s2', getNow);
  });

  describe('Sync path (applyMergeableChanges)', () => {
    test('No middleware - sync works', () => {
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Accept row by returning cells', () => {
      store2.use('t1', (_rowId, cells) => cells);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Reject row by returning null', () => {
      store2.use('t1', () => null);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTables()).toEqual({});
    });

    test('Only affects specified table', () => {
      store2.use('t1', () => null);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTable('t1')).toEqual({});
      expect(store2.getCell('t2', 'r1', 'c1')).toEqual('v2');
    });

    test('Transform cells', () => {
      store2.use('t1', (_rowId, cells) => ({...cells, added: 'yes'}));
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });

    test('Added cell overwrites existing cell with older HLC', () => {
      store2.setCell('t1', 'r1', 'existingCell', 'oldValue');
      store2.use('t1', (_rowId, cells) => ({
        ...cells,
        existingCell: 'newValue',
      }));
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'existingCell')).toEqual('newValue');
    });

    test('Receives correct rowId', () => {
      let receivedRowId: string | undefined;
      store2.use('t1', (rowId, cells) => {
        receivedRowId = rowId;
        return cells;
      });
      store1.setCell('t1', 'myRow', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(receivedRowId).toEqual('myRow');
    });

    test('Multiple handlers run in order', () => {
      const order: number[] = [];
      store2
        .use('t1', (_rowId, cells) => {
          order.push(1);
          return cells;
        })
        .use('t1', (_rowId, cells) => {
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
        .use('t1', (_rowId, cells) => {
          order.push(1);
          return cells;
        })
        .use('t1', () => {
          order.push(2);
          return null;
        })
        .use('t1', (_rowId, cells) => {
          order.push(3);
          return cells;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual([1, 2]);
      expect(store2.getTables()).toEqual({});
    });

    test('Fluent chaining', () => {
      const result = store2.use('t1', (_r, c) => c);
      expect(result).toBe(store2);
    });

    test('Mixed valid/invalid rows', () => {
      store2.use('t1', (_rowId, cells) => {
        return cells.reject ? null : cells;
      });
      store1.setRow('t1', 'valid', {c1: 'v1'});
      store1.setRow('t1', 'invalid', {c1: 'v2', reject: true});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRowIds('t1')).toEqual(['valid']);
    });
  });

  describe('Local mutations (setRow, setCell)', () => {
    test('Middleware runs on local setRow', () => {
      store2.use('t1', () => null);
      store2.setRow('t1', 'r1', {c1: 'v1'});
      expect(store2.getTables()).toEqual({});
    });

    test('Middleware runs on local setCell', () => {
      store2.use('t1', () => null);
      store2.setCell('t1', 'r1', 'c1', 'v1');
      expect(store2.getTables()).toEqual({});
    });

    test('Same middleware runs on both local and sync', () => {
      const calls: string[] = [];
      store2.use('t1', (_rowId, cells) => {
        calls.push('middleware');
        return cells;
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

  describe('Catch-all middleware use("*", handler)', () => {
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

    test('Receives correct tableId, rowId, cells', () => {
      let received: [string, string | undefined, object] | undefined;
      store2.use('*', (tableId, rowId, cells) => {
        received = [tableId, rowId, cells];
        return cells;
      });
      store1.setRow('myTable', 'myRow', {a: 1, b: 2});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(received).toEqual(['myTable', 'myRow', {a: 1, b: 2}]);
    });

    test('Runs after table-specific handlers', () => {
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

    test('Can reject rows', () => {
      store2.use('*', () => null);
      store1.setCell('t1', 'r1', 'c1', 'v1');
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
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', fromTable: 't1'});
    });
  });

  describe('setMergeableContent', () => {
    // Middleware intentionally does NOT run on setMergeableContent.
    // This method is for trusted sources (persistence, initial hydration).
    // Use applyMergeableChanges for peer sync where validation is needed.
    test('Bypasses middleware', () => {
      let rowCalled = false;
      let catchAllCalled = false;
      store2
        .use('t1', () => {
          rowCalled = true;
          return null;
        })
        .use('*', () => {
          catchAllCalled = true;
          return null;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.setMergeableContent(store1.getMergeableContent());
      expect(rowCalled).toBe(false);
      expect(catchAllCalled).toBe(false);
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });
  });

  describe('merge()', () => {
    test('Middleware runs on merge', () => {
      store2.use('t1', () => null);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.merge(store1);
      expect(store2.getTables()).toEqual({});
      // store1 should be unchanged (received store2's empty content)
      expect(store1.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });
  });

  describe('Middleware side-effects with setRow', () => {
    test('setRow inside middleware persists locally', () => {
      store2.use('jobs', (_rowId, cells) => {
        store2.setRow('audit', 'a1', {
          action: 'job-created',
          jobId: _rowId ?? 'unknown',
        });
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

    test('setRow side-effects sync back to originating store', () => {
      store2.use('jobs', (rowId, cells) => {
        store2.setRow('audit', `audit-${rowId ?? 'unknown'}`, {
          action: 'job-received',
          jobId: rowId ?? 'unknown',
        });
        return cells;
      });

      store1.setRow('jobs', 'j1', {name: 'Test Job'});
      store2.applyMergeableChanges(store1.getMergeableContent());

      expect(store2.getRow('jobs', 'j1')).toEqual({name: 'Test Job'});
      expect(store2.getRow('audit', 'audit-j1')).toEqual({
        action: 'job-received',
        jobId: 'j1',
      });

      store1.applyMergeableChanges(store2.getMergeableContent());

      expect(store1.getRow('audit', 'audit-j1')).toEqual({
        action: 'job-received',
        jobId: 'j1',
      });
    });

    test('middleware can read existing store state', () => {
      store2.setRow('config', 'settings', {auditEnabled: true});

      store2.use('jobs', (rowId, cells) => {
        const settings = store2.getRow('config', 'settings');
        if (settings.auditEnabled) {
          store2.setRow('audit', `audit-${rowId ?? 'unknown'}`, {
            action: 'job-created',
            jobId: rowId ?? 'unknown',
          });
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
