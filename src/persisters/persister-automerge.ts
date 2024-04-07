import {
  AutomergePersister,
  createAutomergePersister as createAutomergePersisterDecl,
} from '../types/persisters/persister-automerge';
import {Changes, Content, Store} from '../types/store';
import {
  IdObj,
  objDel,
  objEnsure,
  objGet,
  objHas,
  objIsEmpty,
  objSize,
  objToArray,
} from '../common/obj';
import {ifNotUndefined, isUndefined} from '../common/other';
import {DocHandle} from '@automerge/automerge-repo';
import {Id} from '../types/common';
import {PersisterListener} from '../types/persisters';
import {TINYBASE} from '../common/strings';
import {createCustomPersister} from '../persisters';

type Observer = ({doc}: {doc: any}) => void;

const ensureDocContent = (doc: any, docObjName: string) => {
  if (objIsEmpty(doc[docObjName])) {
    doc[docObjName] = {t: {}, v: {}};
  }
};

const getDocContent = (doc: any, docObjName: string): Content => [
  doc[docObjName].t,
  doc[docObjName].v,
];

const applyChangesToDoc = (
  doc: any,
  docObjName: string,
  getContent: () => Content,
  getChanges?: () => Changes,
) => {
  ensureDocContent(doc, docObjName);
  const [docTables, docValues] = getDocContent(doc, docObjName);
  const changesDidFail = () => {
    changesFailed = 1;
  };
  let changesFailed = 1;
  ifNotUndefined(getChanges?.(), ([cellChanges, valueChanges]) => {
    changesFailed = 0;
    objToArray(cellChanges, (table, tableId) =>
      changesFailed
        ? 0
        : isUndefined(table)
          ? objDel(docTables, tableId)
          : ifNotUndefined(
              docTables[tableId],
              (docTable) =>
                objToArray(table, (row, rowId) =>
                  changesFailed
                    ? 0
                    : isUndefined(row)
                      ? objDel(docTable, rowId)
                      : ifNotUndefined(
                          objGet(docTable, rowId),
                          (docRow: any) =>
                            objToArray(row, (cell, cellId) =>
                              isUndefined(cell)
                                ? objDel(docRow, cellId)
                                : (docRow[cellId] = cell),
                            ),
                          changesDidFail as any,
                        ),
                ),
              changesDidFail,
            ),
    );
    objToArray(valueChanges, (value, valueId) =>
      changesFailed
        ? 0
        : isUndefined(value)
          ? objDel(docValues, valueId)
          : (docValues[valueId] = value),
    );
  });
  if (changesFailed) {
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
  objToArray(obj, (value, id) => {
    if (set(docObj, id, value)) {
      changed = 1;
    }
  });
  objToArray(docObj, (_: any, id: Id) => {
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

export const createAutomergePersister = ((
  store: Store,
  docHandle: DocHandle<any>,
  docObjName = TINYBASE,
  onIgnoredError?: (error: any) => void,
): AutomergePersister => {
  docHandle.change((doc: any) => (doc[docObjName] = {}));

  const getPersisted = async (): Promise<Content | undefined> => {
    const doc = await docHandle.doc();
    return objSize(doc[docObjName]) == 2
      ? getDocContent(doc, docObjName)
      : undefined;
  };

  const setPersisted = async (
    getContent: () => Content,
    getChanges?: () => Changes,
  ): Promise<void> =>
    docHandle.change((doc: any) =>
      applyChangesToDoc(doc, docObjName, getContent, getChanges),
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
    false,
    {getDocHandle: () => docHandle},
  ) as AutomergePersister;
}) as typeof createAutomergePersisterDecl;
