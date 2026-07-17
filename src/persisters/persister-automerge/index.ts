import {DocHandle} from '@automerge/automerge-repo';
import type {Id} from '../../@types/common/index.d.ts';
import type {PersisterListener} from '../../@types/persisters/index.d.ts';
import type {
  AutomergePersister,
  createAutomergePersister as createAutomergePersisterDecl,
} from '../../@types/persisters/persister-automerge/index.d.ts';
import type {Changes, Content, Store} from '../../@types/store/index.d.ts';
import {ERROR_CONTENT, errorThrow, tryCatchIgnore} from '../../common/error.ts';
import {
  IdObj,
  isObject,
  objDel,
  objEvery,
  objForEach,
  objGet,
  objHas,
  objIsEmpty,
  objNew,
  objSet,
} from '../../common/obj.ts';
import {
  addEmitterListener,
  ifNotUndefined,
  isUndefined,
  slice,
} from '../../common/other.ts';
import {CHANGE, TINYBASE, strStartsWith} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

const ID_ESCAPE = '\u0000';

const encodeId = (id: Id): Id =>
  objHas(Object.prototype as any, id) ||
  id == 'prototype' ||
  strStartsWith(id, ID_ESCAPE)
    ? ID_ESCAPE + id
    : id;

const decodeId = (id: Id): Id =>
  strStartsWith(id, ID_ESCAPE) ? slice(id, 1) : id;

const docGet = (docObj: IdObj<any>, id: Id): any =>
  objGet(docObj, encodeId(id));

const docSet = (docObj: IdObj<any>, id: Id, value: any): any =>
  (docObj[encodeId(id)] = value);

const docDel = (docObj: IdObj<any>, id: Id): IdObj<any> =>
  objDel(docObj, encodeId(id));

const getDocObj = (docObj: unknown): IdObj<any> =>
  isObject(docObj) ? docObj : errorThrow(ERROR_CONTENT);

const ensureDocContent = (doc: any, docObjName: string) => {
  if (objIsEmpty(docGet(doc, docObjName))) {
    docSet(doc, docObjName, {t: {}, v: {}});
  }
};

const getDocObjects = (doc: any, docObjName: string): [any, any] => {
  const docContent = docGet(doc, docObjName);
  return [docContent.t, docContent.v];
};

const docObjToObj = (
  docObj: unknown,
  mapper: (value: any) => any = (value) => value,
): IdObj<any> => {
  const obj = objNew<any>();
  objForEach(getDocObj(docObj), (value, encodedId) =>
    objSet(obj, decodeId(encodedId), mapper(value)),
  );
  return obj;
};

const getDocContent = (doc: any, docObjName: string): Content => {
  const [docTables, docValues] = getDocObjects(doc, docObjName);
  return [
    docObjToObj(docTables, (docTable) =>
      docObjToObj(docTable, (docRow) => docObjToObj(docRow)),
    ),
    docObjToObj(docValues),
  ];
};

const getValidDocContent = (
  doc: any,
  docObjName: string,
): Content | undefined => {
  const docContent = docGet(doc, docObjName);
  return isObject(docContent?.t) && isObject(docContent?.v)
    ? getDocContent(doc, docObjName)
    : undefined;
};

const docEnsure = (
  docObj: IdObj<any>,
  id: Id,
  getDefaultValue: () => IdObj<any>,
): IdObj<any> => {
  if (isUndefined(docGet(docObj, id))) {
    docSet(docObj, id, getDefaultValue());
  }
  return docGet(docObj, id);
};

const applyChangesToDoc = (
  doc: any,
  docObjName: string,
  getContent: () => Content,
  changes?: Changes,
) => {
  ensureDocContent(doc, docObjName);
  const [docTables, docValues] = getDocObjects(doc, docObjName);
  const changesApplied = ifNotUndefined(
    changes,
    ([cellChanges, valueChanges]) =>
      objEvery(cellChanges, (table, tableId) => {
        if (isUndefined(table)) {
          docDel(docTables, tableId);
          return true;
        }
        return ifNotUndefined(
          docGet(docTables, tableId),
          (docTable) =>
            objEvery(table, (row, rowId) => {
              if (isUndefined(row)) {
                docDel(docTable, rowId);
                return true;
              }
              return ifNotUndefined(
                docGet(docTable, rowId),
                (docRow: any) => {
                  objForEach(row, (cell, cellId) =>
                    isUndefined(cell)
                      ? docDel(docRow, cellId)
                      : docSet(docRow, cellId, cell),
                  );
                  return true;
                },
                () => false,
              ) as boolean;
            }),
          () => false,
        ) as boolean;
      }) &&
      objEvery(valueChanges, (value, valueId) => {
        if (isUndefined(value)) {
          docDel(docValues, valueId);
        } else {
          docSet(docValues, valueId, value);
        }
        return true;
      }),
  );
  if (!changesApplied) {
    const [tables, values] = getContent();
    docObjMatch(docTables, undefined, tables, (_, tableId, table) =>
      docObjMatch(docTables, tableId, table, (docTable, rowId, row) =>
        docObjMatch(docTable, rowId, row, (docRow, cellId, cell) => {
          if (docGet(docRow, cellId) !== cell) {
            docSet(docRow, cellId, cell);
            return 1;
          }
        }),
      ),
    );
    docObjMatch(docValues, undefined, values, (_, valueId, value) => {
      if (docGet(docValues, valueId) !== value) {
        docSet(docValues, valueId, value);
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
    : docEnsure(docObjOrParent, idInParent, () => ({}));
  let changed: 1 | undefined;
  objForEach(obj, (value, id) => {
    if (set(docObj, id, value)) {
      changed = 1;
    }
  });
  objForEach(docObj, (_: any, encodedId: Id) => {
    const id = decodeId(encodedId);
    if (!objHas(obj, id)) {
      objDel(docObj, encodedId);
      changed = 1;
    }
  });
  if (!isUndefined(idInParent) && objIsEmpty(docObj)) {
    docDel(docObjOrParent, idInParent);
  }
  return changed;
};

export const createAutomergePersister = ((
  store: Store,
  docHandle: DocHandle<any>,
  docObjName = TINYBASE,
  onIgnoredError?: (error: any) => void,
): AutomergePersister => {
  docHandle.change((doc: any) => docEnsure(doc, docObjName, () => ({})));

  const getPersisted = async (): Promise<Content | undefined> =>
    getValidDocContent(docHandle.doc(), docObjName);

  const setPersisted = async (
    getContent: () => Content,
    changes?: Changes,
  ): Promise<void> =>
    docHandle.change((doc: any) =>
      applyChangesToDoc(doc, docObjName, getContent, changes),
    );

  const addPersisterListener = (listener: PersisterListener): (() => void) =>
    addEmitterListener(
      docHandle,
      CHANGE,
      ({doc}: {doc: any}) =>
        void tryCatchIgnore(
          () =>
            ifNotUndefined(getValidDocContent(doc, docObjName), listener, () =>
              errorThrow(ERROR_CONTENT),
            ),
          onIgnoredError,
        ),
    );

  const delPersisterListener = (removeListener: () => void): void =>
    removeListener();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    1, // StoreOnly,
    {getDocHandle: () => docHandle},
  ) as AutomergePersister;
}) as typeof createAutomergePersisterDecl;
