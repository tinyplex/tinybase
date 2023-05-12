import {
  Cell,
  GetTransactionChanges,
  Store,
  Tables,
  Value,
  Values,
} from './types/store.d';
import {Persister, PersisterListener} from './types/persisters.d';
import {Array as YArray, Doc as YDoc, YEvent, Map as YMap} from 'yjs';
import {ifNotUndefined, isUndefined} from './common/other';
import {objHas, objMap} from './common/obj';
import {Id} from './types/common.d';
import {IdObj} from './common/obj';
import {arrayIsEmpty} from './common/array';
import {createCustomPersister} from './persisters';

type Observer = (events: YEvent<any>[]) => void;

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
  yArrayName = 'tinybase',
): Persister => {
  const yContent: YArray<any> = yDoc.getArray(yArrayName);

  const getPersisted = async (): Promise<[Tables, Values] | undefined> => {
    const content = yContent.toJSON();
    if (!arrayIsEmpty(content)) {
      return content as [Tables, Values];
    }
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
    getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> => {
    if (!yContent.length) {
      yContent.push([new YMap(), new YMap()]);
    }
    const [yTables, yValues] = yContent.toArray() as [
      YMap<YMap<YMap<Cell>>>,
      YMap<Value>,
    ];

    yDoc.transact(() => {
      let transactionChangesFailed = 1;
      if (getTransactionChanges) {
        const transactionChangesDidFail = () => {
          transactionChangesFailed = 1;
        };
        transactionChangesFailed = 0;
        const [cellChanges, valueChanges] = getTransactionChanges();
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
      }
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
    });
  };

  const addPersisterListener = (listener: PersisterListener): Observer => {
    const observer: Observer = () => {
      listener();
    };
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
