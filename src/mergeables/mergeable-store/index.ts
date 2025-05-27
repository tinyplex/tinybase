import type {Id} from '../../@types/common/index.d.ts';
import type {
  GetNow,
  Mergeable,
  MergeableChanges,
  MergeableContent,
  TablesStamp,
  ValuesStamp,
} from '../../@types/mergeables/index.d.ts';
import type {
  MergeableStore,
  createMergeableStore as createMergeableStoreDecl,
} from '../../@types/mergeables/mergeable-store/index.d.ts';
import type {
  CellOrUndefined,
  Changes,
  Content,
  Store,
  ValueOrUndefined,
} from '../../@types/store/index.d.ts';
import {getHlcFunctions} from '../../common/hlc.ts';
import {
  getMergeableFunctions,
  validateMergeableContent,
} from '../../common/mergeable.ts';
import {IdObj, objEnsure, objFreeze, objMap} from '../../common/obj.ts';
import {slice} from '../../common/other.ts';
import {
  stampEmpty,
  stampObjCloneWithHash,
  stampObjNew,
  stampObjNewWithHash,
  stampUpdateValueAndTime,
} from '../../common/stamps.ts';
import {
  ADD,
  DEL,
  EMPTY_STRING,
  LISTENER,
  SET,
  TRANSACTION,
  strEndsWith,
  strStartsWith,
} from '../../common/strings.ts';
import {createStore} from '../../store/index.ts';

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

const newMyContent = (
  time = EMPTY_STRING,
): [tablesStampObj: TablesStamp<true>, valuesStampObj: ValuesStamp<true>] => [
  stampObjNewWithHash(time),
  stampObjNewWithHash(time),
];

export const createMergeableStore = ((
  uniqueId?: Id,
  getNow?: GetNow,
): MergeableStore => {
  let myContent = newMyContent();
  let isSavingToStore = 1;
  let defaultingContent: 0 | 1 = 0;
  let finishingTransaction: 0 | 1 = 0;
  let transactionMergeableChanges: MergeableChanges;

  const [getHlc, seenHlc] = getHlcFunctions(uniqueId, getNow);
  const store = createStore();

  const fluent = (actions: () => unknown): MergeableStore => {
    actions();
    return mergeableStore as MergeableStore;
  };

  const curtailSavingToStore = (actions: () => void): MergeableStore =>
    fluent(() => {
      if (isSavingToStore) {
        isSavingToStore = 0;
        actions();
        isSavingToStore = 1;
      }
    });

  const preStartTransaction = () =>
    (transactionMergeableChanges = getTransactionMergeableChanges());

  const preFinishTransaction = () => {
    mergeContentOrChanges(transactionMergeableChanges);
    finishingTransaction = 1;
  };

  const postFinishTransaction = () => (finishingTransaction = 0);

  const cellChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    newCell: CellOrUndefined,
  ) =>
    !isSavingToStore
      ? 0
      : stampUpdateValueAndTime(
          objEnsure<any>(
            objEnsure<any>(
              objEnsure(
                transactionMergeableChanges[0][0],
                tableId,
                stampObjNew,
              )[0],
              rowId,
              stampObjNew,
            )[0],
            cellId,
            stampEmpty,
          ),
          newCell,
          defaultingContent ? EMPTY_STRING : getHlc(),
        );

  const valueChanged = (valueId: Id, newValue: ValueOrUndefined) =>
    !isSavingToStore
      ? 0
      : stampUpdateValueAndTime(
          objEnsure<any>(
            transactionMergeableChanges[1][0],
            valueId,
            stampEmpty,
          ),
          newValue,
          defaultingContent ? EMPTY_STRING : getHlc(),
        );

  // ---

  const getMergeableContent = (): MergeableContent => [
    stampObjCloneWithHash(myContent[0], (myTable) =>
      stampObjCloneWithHash(myTable, (myRow) => stampObjCloneWithHash(myRow)),
    ),
    stampObjCloneWithHash(myContent[1]),
  ];

  const setMergeableContent = (
    mergeableContent: MergeableContent,
  ): MergeableStore =>
    curtailSavingToStore(() =>
      validateMergeableContent(mergeableContent)
        ? store.transaction(() => {
            store.delTables().delValues();
            myContent = newMyContent();
            mergeContentOrChanges(mergeableContent, 1);
          })
        : 0,
    );

  const applyMergeableChanges = (
    mergeableChanges: MergeableChanges,
  ): MergeableStore => fluent(() => mergeContentOrChanges(mergeableChanges));

  const setDefaultContent = (
    content: Content | (() => Content),
  ): MergeableStore =>
    fluent(() =>
      store.transaction(() => {
        defaultingContent = 1;
        store.setContent(content);
        defaultingContent = 0;
      }),
    );

  const nullChanges = (): MergeableChanges => [[{}], [{}], 1];

  const getTransactionMergeableChanges = (): MergeableChanges => {
    return finishingTransaction ? transactionMergeableChanges : nullChanges();
  };

  const merge = (mergeableStore2: MergeableStore) => {
    const mergeableChanges = getMergeableContent();
    const mergeableChanges2 = mergeableStore2.getMergeableContent();
    mergeableStore2.applyMergeableChanges(mergeableChanges as any);
    return applyMergeableChanges(mergeableChanges2 as any);
  };

  // --- Mergeable Interface

  const loadMyTablesStamp = (): TablesStamp<true> => myContent[0];

  const loadMyValuesStamp = (): ValuesStamp<true> => myContent[1];

  const saveMyContentStamp = (
    _myTablesStamp: TablesStamp<true>,
    _myValuesStamp: ValuesStamp<true>,
    myTablesChanges: Changes[0],
    myValuesChanges: Changes[1],
  ): void => {
    curtailSavingToStore(() =>
      store.applyChanges([myTablesChanges, myValuesChanges, 1]),
    );
  };

  const addMergeableChangesListener = (
    changesListener: (changes: MergeableChanges) => void,
  ): (() => void) => {
    const listenerId = store.addDidFinishTransactionListener(() =>
      changesListener(getTransactionMergeableChanges() as MergeableChanges),
    );
    return () => store.delListener(listenerId);
  };

  // --

  const mergeableStore: IdObj<any> = {
    getMergeableContent,
    setMergeableContent,
    applyMergeableChanges,
    setDefaultContent,
    getTransactionMergeableChanges,
    merge,

    addMergeableChangesListener,

    loadMyTablesStamp,
    loadMyValuesStamp,
    saveMyContentStamp,
    seenHlc,
  };

  const [mergeContentOrChanges] = getMergeableFunctions(
    mergeableStore as Mergeable,
  );

  (store as any).setInternalListeners(
    preStartTransaction,
    preFinishTransaction,
    postFinishTransaction,
    cellChanged,
    valueChanged,
  );

  objMap(
    store as IdObj<any>,
    (method, name) =>
      (mergeableStore[name] =
        // fluent methods
        strStartsWith(name, SET) ||
        strStartsWith(name, DEL) ||
        strStartsWith(name, 'apply') ||
        strEndsWith(name, TRANSACTION) ||
        name == 'call' + LISTENER
          ? (...args: any[]) => fluent(() => method(...args))
          : strStartsWith(name, ADD) && strEndsWith(name, LISTENER)
            ? (...args: any[]) => {
                const listenerArg = LISTENER_ARGS[slice(name, 3, -8)] ?? 0;
                const listener = args[listenerArg];
                args[listenerArg] = (_store: Store, ...args: any[]) =>
                  listener(mergeableStore, ...args);
                return method(...args);
              }
            : name == 'isMergeable'
              ? () => true
              : method),
  );
  return objFreeze(mergeableStore) as MergeableStore;
}) as typeof createMergeableStoreDecl;
