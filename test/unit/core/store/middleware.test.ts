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

    test('Transform cells - new object returned', () => {
      middleware.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? {...row, added: 'yes'} : row,
      );
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });

    test('Transform cells - mutate received object in place', () => {
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => {
        row.mutated = 'yes';
        return row;
      });
      store.setRow('t1', 'r1', {c1: 'v1'});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', mutated: 'yes'});
    });

    test('Original row object is not mutated by middleware', () => {
      const original = {c1: 'v1'};
      middleware.addWillSetRowCallback((_tableId, _rowId, row) => {
        row.added = 'yes';
        return row;
      });
      store.setRow('t1', 'r1', original);
      expect(original).toEqual({c1: 'v1'});
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
    test('No middleware - partial row is set', () => {
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

    test('Reject via willApplyChanges', () => {
      middleware.addWillApplyChangesCallback(() => undefined);
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getTables()).toEqual({});
    });

    test('Transform via willApplyChanges - mutate in place', () => {
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

    test('Transform via willApplyChanges - return new object', () => {
      middleware.addWillApplyChangesCallback((changes) => [
        {t1: {r1: {...changes[0].t1?.r1, added: 'yes'}}},
        changes[1],
        changes[2],
      ]);
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });

    test('Original changes object is not mutated by middleware', () => {
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

    test('Reject via willSetCell', () => {
      middleware.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store.applyChanges([{t1: {r1: {c1: 'v1'}}}, {}, 1]);
      expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('Row deletions pass through', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      middleware.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store.applyChanges([{t1: {r1: undefined}}, {}, 1]);
      expect(store.getTable('t1')).toEqual({});
    });

    test('Table deletions pass through', () => {
      store.setRow('t1', 'r1', {c1: 'v1'});
      middleware.addWillApplyChangesCallback((changes) => changes);
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
          if (tableId === 't1') {
            order.push('t1-specific');
          }
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
    test('No middleware - sync works', () => {
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Passthrough via willApplyChanges', () => {
      middleware2.addWillApplyChangesCallback((changes) => changes);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Passthrough via willSetCell', () => {
      middleware2.addWillSetCellCallback(
        (_tableId, _rowId, _cellId, cell) => cell,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('Reject all via willApplyChanges', () => {
      middleware2.addWillApplyChangesCallback(() => undefined);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTables()).toEqual({});
    });

    test('Reject all via willSetCell', () => {
      middleware2.addWillSetCellCallback(() => undefined);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTables()).toEqual({});
    });

    test('Reject specific table via willSetCell', () => {
      middleware2.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store2.getCell('t2', 'r1', 'c1')).toEqual('v2');
    });

    test('Reject specific table via willApplyChanges', () => {
      middleware2.addWillApplyChangesCallback((changes) => {
        delete changes[0].t1;
        return changes;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store2.getCell('t2', 'r1', 'c1')).toEqual('v2');
    });

    test('Transform cell via willSetCell', () => {
      middleware2.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' && typeof cell === 'string'
          ? cell.toUpperCase()
          : cell,
      );
      store1.setCell('t1', 'r1', 'c1', 'hello');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('HELLO');
    });

    test('Transform via willApplyChanges', () => {
      middleware2.addWillApplyChangesCallback((changes) => {
        const t1 = changes[0].t1;
        if (t1) {
          for (const rowId in t1) {
            const row = t1[rowId];
            if (row) {
              row.added = 'yes';
            }
          }
        }
        return changes;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRow('t1', 'r1')).toEqual({c1: 'v1', added: 'yes'});
    });

    test('Receives correct cell args', () => {
      let received: [string, string, string, unknown] | undefined;
      middleware2.addWillSetCellCallback((tableId, rowId, cellId, cell) => {
        received = [tableId, rowId, cellId, cell];
        return cell;
      });
      store1.setCell('t1', 'myRow', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(received).toEqual(['t1', 'myRow', 'c1', 'v1']);
    });

    test('Mixed rows via willApplyChanges', () => {
      middleware2.addWillApplyChangesCallback((changes) => {
        const t1 = changes[0].t1;
        if (t1) {
          delete t1.invalid;
        }
        return changes;
      });
      store1.setRow('t1', 'valid', {c1: 'v1'});
      store1.setRow('t1', 'invalid', {c1: 'v2'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getRowIds('t1')).toEqual(['valid']);
    });

    test('Mixed rows via willSetCell', () => {
      middleware2.addWillSetCellCallback((_tableId, rowId, _cellId, cell) =>
        rowId === 'invalid' ? undefined : cell,
      );
      store1.setRow('t1', 'valid', {c1: 'v1'});
      store1.setRow('t1', 'invalid', {c1: 'v2'});
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getCell('t1', 'valid', 'c1')).toEqual('v1');
      expect(store2.getCell('t1', 'invalid', 'c1')).toBeUndefined();
    });

    test('willSetRow does not fire on sync path', () => {
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
  });

  describe('Local mutations (setRow, setCell)', () => {
    test('willSetRow runs on local setRow', () => {
      middleware2.addWillSetRowCallback((tableId, _rowId, row) =>
        tableId === 't1' ? undefined : row,
      );
      store2.setRow('t1', 'r1', {c1: 'v1'});
      expect(store2.getRowCount('t1')).toBe(0);
    });

    test('willSetCell runs on local setCell', () => {
      middleware2.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store2.setCell('t1', 'r1', 'c1', 'v1');
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('willSetCell runs on both local and sync', () => {
      const calls: string[] = [];
      middleware2.addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
        calls.push('middleware');
        return cell;
      });
      store2.setCell('t1', 'r1', 'c1', 'local');
      expect(calls).toEqual(['middleware']);

      store1.setCell('t1', 'r2', 'c1', 'remote');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(calls).toEqual(['middleware', 'middleware']);
    });
  });

  describe('Callbacks for all tables', () => {
    test('willSetCell runs for all tables', () => {
      const seen: string[] = [];
      middleware2.addWillSetCellCallback((tableId, _rowId, _cellId, cell) => {
        seen.push(tableId);
        return cell;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(seen.sort()).toEqual(['t1', 't2']);
    });

    test('willSetCell receives correct args', () => {
      let receivedTableId: string | undefined;
      let receivedRowId: string | undefined;
      middleware2.addWillSetCellCallback((tableId, rowId, _cellId, cell) => {
        receivedTableId = tableId;
        receivedRowId = rowId;
        return cell;
      });
      store1.setCell('myTable', 'myRow', 'c1', 1);
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(receivedTableId).toEqual('myTable');
      expect(receivedRowId).toEqual('myRow');
    });

    test('willSetCell can reject from any table', () => {
      middleware2.addWillSetCellCallback(() => undefined);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store1.setCell('t2', 'r1', 'c1', 'v2');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(store2.getTables()).toEqual({});
    });

    test('willApplyChanges can transform', () => {
      middleware2.addWillApplyChangesCallback((changes) => {
        for (const tableId in changes[0]) {
          const table = changes[0][tableId];
          if (table) {
            for (const rowId in table) {
              const row = table[rowId];
              if (row) {
                row.fromTable = tableId;
              }
            }
          }
        }
        return changes;
      });
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
      let callbackCalled = false;
      middleware2.addWillApplyChangesCallback((changes) => {
        callbackCalled = true;
        return changes;
      });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.setMergeableContent(store1.getMergeableContent());
      expect(callbackCalled).toBe(true);
      expect(store2.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });
  });

  describe('merge()', () => {
    test('willApplyChanges blocks via merge', () => {
      middleware2.addWillApplyChangesCallback(() => undefined);
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.merge(store1);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store1.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });

    test('willApplyChanges transforms via merge', () => {
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
      expect(store2.getRow('t1', 'r1')).toEqual({
        c1: 'v1',
        merged: true,
      });
    });

    test('willSetCell filters via merge', () => {
      middleware2.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
        tableId === 't1' ? undefined : cell,
      );
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.merge(store1);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
      expect(store1.getCell('t1', 'r1', 'c1')).toEqual('v1');
    });
  });

  describe('Multiple handlers', () => {
    test('willSetCell callbacks run in order', () => {
      const order: number[] = [];
      middleware2
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          order.push(1);
          return cell;
        })
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          order.push(2);
          return cell;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual([1, 2]);
    });

    test('willSetCell short-circuits on undefined', () => {
      const order: number[] = [];
      middleware2
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          order.push(1);
          return cell;
        })
        .addWillSetCellCallback(() => {
          order.push(2);
          return undefined;
        })
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          order.push(3);
          return cell;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual([1, 2]);
      expect(store2.getCell('t1', 'r1', 'c1')).toBeUndefined();
    });

    test('willApplyChanges fires before willSetCell', () => {
      const order: string[] = [];
      middleware2
        .addWillApplyChangesCallback((changes) => {
          order.push('willApplyChanges');
          return changes;
        })
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          order.push('willSetCell');
          return cell;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual(['willApplyChanges', 'willSetCell']);
    });

    test('Table-specific then catch-all', () => {
      const order: string[] = [];
      middleware2
        .addWillSetCellCallback((tableId, _rowId, _cellId, cell) => {
          if (tableId === 't1') {
            order.push('t1-specific');
          }
          return cell;
        })
        .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => {
          order.push('catch-all');
          return cell;
        });
      store1.setCell('t1', 'r1', 'c1', 'v1');
      store2.applyMergeableChanges(store1.getMergeableContent());
      expect(order).toEqual(['t1-specific', 'catch-all']);
    });

    test('Fluent chaining', () => {
      const result = middleware2.addWillApplyChangesCallback(
        (changes) => changes,
      );
      expect(result).toBe(middleware2);
    });
  });

  describe('Middleware side-effects', () => {
    test('setRow inside willSetCell persists', () => {
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

    test('willSetCell can read existing state', () => {
      store2.setRow('config', 'settings', {
        auditEnabled: true,
      });
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
