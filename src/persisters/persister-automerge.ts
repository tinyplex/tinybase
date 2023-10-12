import {GetTransactionChanges, Store, Tables, Values} from '../types/store';
import {
  IdObj,
  objDel,
  objEnsure,
  objGet,
  objHas,
  objIsEmpty,
  objMap,
  objSize,
} from '../common/obj';
import {Persister, PersisterListener} from '../types/persisters';
import {ifNotUndefined, isUndefined} from '../common/other';
import {DocHandle} from 'automerge-repo';
import {Id} from '../types/common';
import {TINYBASE} from '../common/strings';
import {createCustomPersister} from '../persisters';

type Observer = ({doc}: {doc: any}) => void;

const ensureDocContent = (doc: any, docObjName: string) => {
  if (objIsEmpty(doc[docObjName])) {
    doc[docObjName] = {t: {}, v: {}};
  }
};

const getDocContent = (doc: any, docObjName: string): [Tables, Values] => [
  doc[docObjName].t,
  doc[docObjName].v,
];

const setTransactionChangesToDoc = (
  doc: any,
  docObjName: string,
  getContent: () => [Tables, Values],
  getTransactionChanges?: GetTransactionChanges,
) => {
  ensureDocContent(doc, docObjName);
  const [docTables, docValues] = getDocContent(doc, docObjName);
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
        ? objDel(docTables, tableId)
        : ifNotUndefined(
            docTables[tableId],
            (docTable) =>
              objMap(table, (row, rowId) =>
                transactionChangesFailed
                  ? 0
                  : isUndefined(row)
                  ? objDel(docTable, rowId)
                  : ifNotUndefined(
                      objGet(docTable, rowId),
                      (docRow: any) =>
                        objMap(row, (cell, cellId) =>
                          isUndefined(cell)
                            ? objDel(docRow, cellId)
                            : (docRow[cellId] = cell),
                        ),
                      transactionChangesDidFail as any,
                    ),
              ),
            transactionChangesDidFail,
          ),
    );
    objMap(valueChanges, (value, valueId) =>
      transactionChangesFailed
        ? 0
        : isUndefined(value)
        ? objDel(docValues, valueId)
        : (docValues[valueId] = value),
    );
  });
  if (transactionChangesFailed) {
    const [tables, values] = getContent();
    docObjMatch(docTables, undefined, tables, (_, tableId, table) =>
      docObjMatch(docTables, tableId, table, (docTable, rowId, row) =>
        docObjMatch(docTable, rowId, row, (docRow, cellId, cell) => {
          if (objGet(docRow, cellId) !== cell) {
            docRow[cellId] = cell;
            return 1;
          }
        }),
      ),
    );
    docObjMatch(docValues, undefined, values, (_, valueId, value) => {
      if (objGet(docValues, valueId) !== value) {
        docValues[valueId] = value;
      }
    });
  }
};

const docObjMatch = (
  docObjOrParent: IdObj<any>,
  idInParent: Id | undefined,
  obj: IdObj<any>,
  set: (docObj: IdObj<any>, id: Id, value: any) => 1 | void,
): 1 | void => {
  const docObj = isUndefined(idInParent)
    ? docObjOrParent
    : objEnsure(docObjOrParent, idInParent, () => ({}));
  let changed: 1 | undefined;
  objMap(obj, (value, id) => {
    if (set(docObj, id, value)) {
      changed = 1;
    }
  });
  objMap(docObj, (_: any, id: Id) => {
    if (!objHas(obj, id)) {
      objDel(docObj, id);
      changed = 1;
    }
  });
  if (!isUndefined(idInParent) && objIsEmpty(docObj)) {
    objDel(docObjOrParent, idInParent);
  }
  return changed;
};

export const createAutomergePersister = (
  store: Store,
  docHandle: DocHandle<any>,
  docObjName = TINYBASE,
  onIgnoredError?: (error: any) => void,
): Persister => {
  docHandle.change((doc) => (doc[docObjName] = {}));

  const getPersisted = async (): Promise<[Tables, Values] | undefined> =>
    objSize(docHandle.doc[docObjName]) == 2
      ? getDocContent(docHandle.doc, docObjName)
      : undefined;

  const setPersisted = async (
    getContent: () => [Tables, Values],
    getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> =>
    docHandle.change((doc) =>
      setTransactionChangesToDoc(
        doc,
        docObjName,
        getContent,
        getTransactionChanges,
      ),
    );

  const addPersisterListener = (listener: PersisterListener): Observer => {
    const observer: Observer = ({doc}) =>
      listener(() => getDocContent(doc, docObjName));
    docHandle.on('change', observer);
    return observer;
  };

  const delPersisterListener = (observer: Observer): void => {
    docHandle.removeListener('change', observer);
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    ['getDocHandle', docHandle],
  );
};
