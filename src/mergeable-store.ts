import {GetTransactionChanges, Store} from './types/store';
import {IdObj, objFreeze, objMap} from './common/obj';
import {
  MergeableStore,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {strEndsWith, strStartsWith} from './common/strings';
import {createStore} from './store';
import {slice} from './common/other';

const LISTENER_ARGS: IdObj<number> = {
  HasTable: 1,
  Table: 1,
  TableCellIds: 1,
  HasTableCell: 2,
  RowCount: 1,
  RowIds: 1,
  SortedRowIds: 5,
  HasRow: 2,
  Row: 2,
  CellIds: 2,
  HasCell: 3,
  Cell: 3,
  HasValue: 1,
  Value: 1,
  InvalidCell: 3,
  InvalidValue: 1,
};

export const createMergeableStore = ((): MergeableStore => {
  const store = createStore();

  (store as any).addPostTransactionListener(
    (_: Store, _getTransactionChanges: GetTransactionChanges) => {},
  );

  const mergeableStore: IdObj<any> = {
    merge: () => mergeableStore,
  };

  objMap(
    store as IdObj<any>,
    (method, name) =>
      (mergeableStore[name] =
        // fluent methods
        strStartsWith(name, 'set') ||
        strStartsWith(name, 'del') ||
        strEndsWith(name, 'Transaction') ||
        name == 'callListener'
          ? (...args: any[]) => {
              method(...args);
              return mergeableStore;
            }
          : strStartsWith(name, 'add') && strEndsWith(name, 'Listener')
            ? (...args: any[]) => {
                const listenerArg = LISTENER_ARGS[slice(name, 3, -8)] ?? 0;
                const listener = args[listenerArg];
                args[listenerArg] = (_store: Store, ...args: any[]) =>
                  listener(mergeableStore, ...args);
                return method(...args);
              }
            : method),
  );
  return objFreeze(mergeableStore) as MergeableStore;
}) as typeof createMergeableStoreDecl;
