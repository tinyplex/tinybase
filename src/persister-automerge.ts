import {GetTransactionChanges, Store, Tables, Values} from './types/store';
import {
  IdObj,
  objDel,
  objEnsure,
  objGet,
  objHas,
  objIsEmpty,
  objMap,
} from './common/obj';
import {Persister, PersisterListener} from './types/persisters';
import {DocHandle} from 'automerge-repo';
import {Id} from './types/common';
import {createCustomPersister} from './persisters';
import {isUndefined} from './common/other';

type Observer = () => void;

const tablesKey = 't';
const valuesKey = 'v';

const ensureDocContent = (doc: any, docObjName: string) => {
  if (objIsEmpty(doc[docObjName])) {
    doc[docObjName] = {[tablesKey]: {}, [valuesKey]: {}};
  }
};

const getDocContent = (doc: any, docObjName: string) => [
  doc[docObjName][tablesKey],
  doc[docObjName][valuesKey],
];

const setTransactionChangesToDoc = (
  doc: any,
  docObjName: string,
  getContent: () => [Tables, Values],
  _getTransactionChanges?: GetTransactionChanges,
) => {
  ensureDocContent(doc, docObjName);
  const [docTables, docValues] = getDocContent(doc, docObjName);
  let transactionChangesFailed = 1;
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
  docObjName = 'tinybase',
): Persister => {
  docHandle.change((doc) => (doc[docObjName] = {}));

  const getPersisted = async (): Promise<[Tables, Values] | undefined> =>
    undefined;

  const setPersisted = async (
    getContent: () => [Tables, Values],
    getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> => {
    docHandle.change((doc) =>
      setTransactionChangesToDoc(
        doc,
        docObjName,
        getContent,
        getTransactionChanges,
      ),
    );
  };

  const addPersisterListener = (listener: PersisterListener): Observer => {
    const observer: Observer = (...args) => {
      listener();
    };
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
  );
};
