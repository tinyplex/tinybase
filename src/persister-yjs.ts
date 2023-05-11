import {GetTransactionChanges, Store, Tables, Values} from './types/store.d';
import {Persister, PersisterListener} from './types/persisters.d';
import {Array as YArray, Doc as YDoc, YEvent, Map as YMap} from 'yjs';
import {objHas, objMap} from './common/obj';
import {Id} from './types/common.d';
import {IdObj} from './common/obj';
import {arrayIsEmpty} from './common/array';
import {createCustomPersister} from './persisters';
import {isUndefined} from './common/other';

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
  const contentArray: YArray<any> = yDoc.getArray(yArrayName);

  const getPersisted = async (): Promise<[Tables, Values] | undefined> => {
    const content = contentArray.toJSON();
    if (!arrayIsEmpty(content)) {
      return content as [Tables, Values];
    }
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
    _getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> => {
    if (!contentArray.length) {
      contentArray.push([new YMap(), new YMap()]);
    }
    const [tablesMap, valuesMap] = contentArray.toArray();
    const [tables, values] = getContent();
    yDoc.transact(() => {
      yMapMatch(tablesMap, undefined, tables, (tablesMap, tableId, table) =>
        yMapMatch(tablesMap, tableId, table, (tableMap, rowId, row) =>
          yMapMatch(tableMap, rowId, row, (rowMap, cellId, cell) => {
            if (rowMap.get(cellId) !== cell) {
              rowMap.set(cellId, cell);
              return 1;
            }
          }),
        ),
      );
      yMapMatch(valuesMap, undefined, values, (valuesMap, valueId, value) => {
        if (valuesMap.get(valueId) !== value) {
          valuesMap.set(valueId, value);
        }
      });
    });
  };

  const addPersisterListener = (listener: PersisterListener): Observer => {
    const observer: Observer = () => {
      listener();
    };
    contentArray.observeDeep(observer);
    return observer;
  };

  const delPersisterListener = (observer: Observer): void => {
    contentArray.unobserveDeep(observer);
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
};
