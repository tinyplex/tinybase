import {
  Cell,
  GetTransactionChanges,
  Store,
  Tables,
  Values,
} from './types/store.d';
import {Persister, PersisterListener} from './types/persisters.d';
import {Doc as YDoc, YEvent, Map as YMap} from 'yjs';
import {
  arrayForEach,
  arrayIsEmpty,
  arrayLength,
  arrayShift,
} from './common/array';
import {ifNotUndefined, isUndefined} from './common/other';
import {objEnsure, objHas, objMap, objNew} from './common/obj';
import {Id} from './types/common.d';
import {IdObj} from './common/obj';
import {TransactionChanges} from './types/store.d';
import {createCustomPersister} from './persisters';
import {mapForEach} from './common/map';

type Observer = (events: YEvent<any>[]) => void;

const tablesKey = 't';
const valuesKey = 'v';
const DELETE = 'delete';

const ensureYContent = (yContent: YMap<any>) => {
  if (!yContent.size) {
    yContent.set(tablesKey, new YMap());
    yContent.set(valuesKey, new YMap());
  }
};

const getYContent = (yContent: YMap<any>) => [
  yContent.get(tablesKey),
  yContent.get(valuesKey),
];

const getTransactionChangesFromYDoc = (
  yContent: YMap<any>,
  events: YEvent<any>[],
): TransactionChanges => {
  if (arrayLength(events) == 1 && arrayIsEmpty(events[0].path)) {
    return [yContent.get('t').toJSON(), yContent.get('v').toJSON()];
  }
  const [yTables, yValues] = getYContent(yContent);
  const tables = {} as any;
  const values = {} as any;
  arrayForEach(events, ({path, changes: {keys}}) =>
    arrayShift(path) == tablesKey
      ? ifNotUndefined(
          arrayShift(path) as string,
          (yTableId) => {
            const table = objEnsure(tables, yTableId, objNew) as any;
            const yTable = yTables.get(yTableId) as YMap<YMap<Cell>>;
            ifNotUndefined(
              arrayShift(path) as string,
              (yRowId) => {
                const row = objEnsure(table, yRowId, objNew) as any;
                const yRow = yTable.get(yRowId) as YMap<Cell>;
                mapForEach(
                  keys,
                  (cellId, {action}) =>
                    (row[cellId] = action == DELETE ? null : yRow.get(cellId)),
                );
              },
              () =>
                mapForEach(
                  keys,
                  (rowId, {action}) =>
                    (table[rowId] =
                      action == DELETE ? null : yTable.get(rowId)?.toJSON()),
                ),
            );
          },
          () =>
            mapForEach(
              keys,
              (tableId, {action}) =>
                (tables[tableId] =
                  action == DELETE ? null : yTables.get(tableId)?.toJSON()),
            ),
        )
      : mapForEach(
          keys,
          (valueId, {action}) =>
            (values[valueId] = action == DELETE ? null : yValues.get(valueId)),
        ),
  );
  return [tables, values];
};

const setTransactionChangesToYDoc = (
  yContent: YMap<any>,
  getContent: () => [Tables, Values],
  getTransactionChanges?: GetTransactionChanges,
) => {
  ensureYContent(yContent);
  const [yTables, yValues] = getYContent(yContent);
  const transactionChangesDidFail = () => {
    transactionChangesFailed = 1;
  };
  let transactionChangesFailed = 1;
  ifNotUndefined(getTransactionChanges?.(), ([cellChanges, valueChanges]) => {
    transactionChangesFailed = 0;
    objMap(cellChanges, (table, tableId) =>
      transactionChangesFailed
        ? 0
        : isUndefined(table)
        ? yTables.delete(tableId)
        : ifNotUndefined(
            yTables.get(tableId),
            (yTable) =>
              objMap(table, (row, rowId) =>
                transactionChangesFailed
                  ? 0
                  : isUndefined(row)
                  ? yTable.delete(rowId)
                  : ifNotUndefined(
                      yTable.get(rowId),
                      (yRow) =>
                        objMap(row, (cell, cellId) =>
                          isUndefined(cell)
                            ? yRow.delete(cellId)
                            : yRow.set(cellId, cell),
                        ),
                      transactionChangesDidFail,
                    ),
              ),
            transactionChangesDidFail,
          ),
    );
    objMap(valueChanges, (value, valueId) =>
      transactionChangesFailed
        ? 0
        : isUndefined(value)
        ? yValues.delete(valueId)
        : yValues.set(valueId, value),
    );
  });
  if (transactionChangesFailed) {
    const [tables, values] = getContent();
    yMapMatch(yTables, undefined, tables, (_, tableId, table) =>
      yMapMatch(yTables, tableId, table, (yTable, rowId, row) =>
        yMapMatch(yTable, rowId, row, (yRow, cellId, cell) => {
          if (yRow.get(cellId) !== cell) {
            yRow.set(cellId, cell);
            return 1;
          }
        }),
      ),
    );
    yMapMatch(yValues, undefined, values, (_, valueId, value) => {
      if (yValues.get(valueId) !== value) {
        yValues.set(valueId, value);
      }
    });
  }
};

const yMapMatch = (
  yMapOrParent: YMap<any>,
  idInParent: Id | undefined,
  obj: IdObj<any>,
  set: (yMap: YMap<any>, id: Id, value: any) => 1 | void,
): 1 | void => {
  const yMap = isUndefined(idInParent)
    ? yMapOrParent
    : yMapOrParent.get(idInParent) ?? yMapOrParent.set(idInParent, new YMap());
  let changed: 1 | undefined;
  objMap(obj, (value, id) => {
    if (set(yMap, id, value)) {
      changed = 1;
    }
  });
  yMap.forEach((_: any, id: Id) => {
    if (!objHas(obj, id)) {
      yMap.delete(id);
      changed = 1;
    }
  });
  if (!isUndefined(idInParent) && !yMap.size) {
    yMapOrParent.delete(idInParent);
  }
  return changed;
};

export const createYjsPersister = (
  store: Store,
  yDoc: YDoc,
  yMapName = 'tinybase',
): Persister => {
  const yContent: YMap<any> = yDoc.getMap(yMapName);

  const getPersisted = async (): Promise<[Tables, Values] | undefined> =>
    yContent.size
      ? ([yContent.get('t').toJSON(), yContent.get('v').toJSON()] as [
          Tables,
          Values,
        ])
      : undefined;

  const setPersisted = async (
    getContent: () => [Tables, Values],
    getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> =>
    yDoc.transact(() =>
      setTransactionChangesToYDoc(yContent, getContent, getTransactionChanges),
    );

  const addPersisterListener = (listener: PersisterListener): Observer => {
    const observer: Observer = (events) =>
      listener(undefined, () =>
        getTransactionChangesFromYDoc(yContent, events),
      );
    yContent.observeDeep(observer);
    return observer;
  };

  const delPersisterListener = (observer: Observer): void => {
    yContent.unobserveDeep(observer);
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
};
