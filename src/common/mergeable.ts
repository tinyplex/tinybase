import type {Id} from '../@types/common/index.d.ts';
import type {
  CellHashes,
  ContentHashes,
  Mergeable,
  MergeableChanges,
  MergeableContent,
  RowHashes,
  Stamp,
  TableHashes,
  TablesStamp,
  TableStamp,
  Time,
  ValueHashes,
  ValuesStamp,
} from '../@types/mergeables/index.d.ts';
import type {
  CellOrUndefined,
  Changes,
  ValueOrUndefined,
} from '../@types/store/index.d.ts';
import {isCellOrValueOrNullOrUndefined} from './cell.ts';
import {getHash} from './hash.ts';
import {jsonString} from './json.ts';
import {
  IdObj,
  objEnsure,
  objForEach,
  objGet,
  objHas,
  objIsEmpty,
  objMap,
  objNew,
  objValidate,
} from './obj.ts';
import {ifNotUndefined, isArray, size} from './other.ts';
import {
  getLatestTime,
  getStampHash,
  hashIdAndHash,
  replaceTimeHash,
  stampNew,
  stampNewWithHash,
  StampObj,
  stampObjClone,
  stampObjNew,
  stampObjNewWithHash,
  stampUpdate,
  stampValidate,
} from './stamps.ts';
import {EMPTY_STRING} from './strings.ts';

export const changesAreNotEmpty = (
  changes: MergeableChanges | void,
): changes is MergeableChanges =>
  isArray(changes) &&
  (!objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0]));

export const validateMergeableContent = (
  mergeableContent: MergeableContent,
): boolean =>
  isArray(mergeableContent) &&
  size(mergeableContent) == 2 &&
  stampValidate(mergeableContent[0], (tableStamps) =>
    objValidate(
      tableStamps,
      (tableStamp) =>
        stampValidate(tableStamp, (rowStamps) =>
          objValidate(
            rowStamps,
            (rowStamp) =>
              stampValidate(rowStamp, (cellStamps) =>
                objValidate(
                  cellStamps,
                  (cellStamp) =>
                    stampValidate(cellStamp, isCellOrValueOrNullOrUndefined),
                  undefined,
                  1,
                ),
              ),
            undefined,
            1,
          ),
        ),
      undefined,
      1,
    ),
  ) &&
  stampValidate(mergeableContent[1], (values) =>
    objValidate(
      values,
      (value) => stampValidate(value, isCellOrValueOrNullOrUndefined),
      undefined,
      1,
    ),
  );

export const getMergeableFunctions = (
  mergeable: Mergeable,
): [
  getMergeableContentHashes: () => ContentHashes,
  getMergeableTableHashes: () => TableHashes,
  getMergeableTableDiff: (
    otherTableHashes: TableHashes,
  ) => [newTables: TablesStamp, differingTableHashes: TableHashes],
  getMergeableRowHashes: (otherTableHashes: TableHashes) => RowHashes,
  getMergeableRowDiff: (
    otherTableRowHashes: RowHashes,
  ) => [newRows: TablesStamp, differingRowHashes: RowHashes],
  getMergeableCellHashes: (otherTableRowHashes: RowHashes) => CellHashes,
  getMergeableCellDiff: (otherTableRowCellHashes: CellHashes) => TablesStamp,
  getMergeableValueHashes: () => ValueHashes,
  getMergeableValueDiff: (otherValueHashes: ValueHashes) => ValuesStamp,
  mergeContentOrChanges: (
    otherContentOrChanges: MergeableChanges | MergeableContent,
    isContent?: 0 | 1,
  ) => Changes,
] => {
  const {
    loadMyTablesStamp,
    loadMyValuesStamp,
    saveMyTablesStamp,
    saveMyValuesStamp,
    seenHlc,
  } = mergeable;

  const getMergeableContentHashes = (): ContentHashes => [
    loadMyTablesStamp()[2],
    loadMyValuesStamp()[2],
  ];

  const getMergeableTableHashes = (): TableHashes =>
    objMap(loadMyTablesStamp()[0], getStampHash);

  const getMergeableTableDiff = (
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differingTableHashes: TableHashes] => {
    const [myTables, myTablesTime] = loadMyTablesStamp();
    const newTables: TablesStamp = stampObjNew(myTablesTime);
    const differingTableHashes: TableHashes = {};
    objForEach(myTables, ([myTable, myTableTime, myTableHash], tableId) =>
      objHas(otherTableHashes, tableId)
        ? myTableHash != otherTableHashes[tableId]
          ? (differingTableHashes[tableId] = myTableHash)
          : 0
        : (newTables[0][tableId] = stampObjClone(
            [myTable, myTableTime],
            (myRow) => stampObjClone(myRow),
          )),
    );
    return [newTables, differingTableHashes];
  };

  const getMergeableRowHashes = (otherTableHashes: TableHashes): RowHashes => {
    const [myTables] = loadMyTablesStamp();
    const rowHashes: RowHashes = {};
    objForEach(otherTableHashes, (otherTableHash, tableId) =>
      ifNotUndefined(objGet(myTables, tableId), ([myTable, , myTableHash]) =>
        myTableHash != otherTableHash
          ? objForEach(
              myTable,
              ([, , myRowHash], rowId) =>
                (objEnsure(rowHashes, tableId, objNew)[rowId] = myRowHash),
            )
          : 0,
      ),
    );
    return rowHashes;
  };
  const getMergeableRowDiff = (
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differingRowHashes: RowHashes] => {
    const [myTables, myTablesTime] = loadMyTablesStamp();
    const newRows: TablesStamp = stampObjNew(myTablesTime);
    const differingRowHashes: RowHashes = {};
    objForEach(otherTableRowHashes, (otherRowHashes, tableId) =>
      objForEach(
        objGet(myTables, tableId)?.[0],
        ([myRow, myRowTime, myRowHash], rowId) =>
          objHas(otherRowHashes, rowId)
            ? myRowHash !== otherRowHashes[rowId]
              ? (objEnsure(differingRowHashes, tableId, objNew)[rowId] =
                  myRowHash)
              : 0
            : (objEnsure(newRows[0], tableId, stampObjNew)[0][rowId] =
                stampObjClone([myRow, myRowTime])),
      ),
    );
    return [newRows, differingRowHashes];
  };

  const getMergeableCellHashes = (
    otherTableRowHashes: RowHashes,
  ): CellHashes => {
    const [myTables] = loadMyTablesStamp();
    const cellHashes: CellHashes = {};
    objForEach(otherTableRowHashes, (otherRowHashes, tableId) =>
      ifNotUndefined(objGet(myTables, tableId), ([myTable]) =>
        objForEach(otherRowHashes, (otherRowHash, rowId) =>
          ifNotUndefined(objGet(myTable, rowId), ([myRow, , myRowHash]) =>
            myRowHash !== otherRowHash
              ? objForEach(
                  myRow,
                  ([, , myCellHash], cellId) =>
                    (objEnsure(
                      objEnsure<CellHashes[Id]>(cellHashes, tableId, objNew),
                      rowId,
                      objNew,
                    )[cellId] = myCellHash),
                )
              : 0,
          ),
        ),
      ),
    );
    return cellHashes;
  };

  const getMergeableCellDiff = (
    otherTableRowCellHashes: CellHashes,
  ): TablesStamp => {
    const [myTables, myTablesTime] = loadMyTablesStamp();
    const newTables: TablesStamp[0] = {};
    objForEach(otherTableRowCellHashes, (otherRowCellHashes, tableId) =>
      objForEach(otherRowCellHashes, (otherCellHashes, rowId) =>
        ifNotUndefined(objGet(myTables, tableId), ([myTable, myTableTime]) =>
          ifNotUndefined(objGet(myTable, rowId), ([myRow, myRowTime]) =>
            objForEach(myRow, ([myCell, myCellTime, myCellHash], cellId) =>
              myCellHash !== otherCellHashes?.[cellId]
                ? (objEnsure(
                    objEnsure(newTables, tableId, () =>
                      stampObjNew(myTableTime),
                    )[0],
                    rowId,
                    () => stampObjNew(myRowTime),
                  )[0][cellId] = [myCell, myCellTime])
                : 0,
            ),
          ),
        ),
      ),
    );
    return stampNew(newTables, myTablesTime);
  };

  const getMergeableValueHashes = (): ValueHashes =>
    objMap(loadMyValuesStamp()[0], getStampHash);

  const getMergeableValueDiff = (
    otherValueHashes: ValueHashes,
  ): ValuesStamp => {
    const [myValues, myValuesTime] = loadMyValuesStamp();
    const newValues: ValuesStamp[0] = {};
    objForEach(myValues, ([myValue, myValueTime, myValueHash], valueId) =>
      myValueHash !== otherValueHashes?.[valueId]
        ? (newValues[valueId] = [myValue, myValueTime])
        : 0,
    );
    return stampNew(newValues, myValuesTime);
  };

  const mergeContentOrChanges = (
    otherContentOrChanges: MergeableChanges | MergeableContent,
    isContent: 0 | 1 = 0,
  ): Changes => {
    // Current content with metadata
    const myTablesStamp = loadMyTablesStamp(otherContentOrChanges[0]);
    const myValuesStamp = loadMyValuesStamp(otherContentOrChanges[1]);

    // Incoming changes with metadata
    const [
      [otherTables, otherTablesTime = EMPTY_STRING, otherTablesHash = 0],
      otherValues,
    ] = otherContentOrChanges as typeof isContent extends 1
      ? MergeableContent
      : MergeableChanges;

    // Changes to be returned, with no metadata
    const tablesChanges = {};
    const valuesChanges = {};

    // --
    const [myTables, myTablesTime, myTablesHash] = myTablesStamp;
    let newTablesHash = isContent ? otherTablesHash : myTablesHash;
    let newTablesTime = otherTablesTime;
    objForEach(
      otherTables,
      (
        [otherTable, otherTableTime = EMPTY_STRING, otherTableHash = 0],
        tableId,
      ) => {
        const myTableStamp = objEnsure<TableStamp<true>>(
          myTables,
          tableId,
          stampObjNewWithHash,
        );
        const [myTable, myTableTime, myTableHash] = myTableStamp;
        let newTableHash = isContent ? otherTableHash : myTableHash;
        let newTableTime = otherTableTime;
        objForEach(otherTable, (otherRow, rowId) => {
          const [newRowTime, myOldRowHash, myNewRowHash] = mergeCellsOrValues(
            otherRow,
            objEnsure(myTable, rowId, stampObjNewWithHash<any>),
            objEnsure(
              objEnsure(tablesChanges, tableId, objNew<any>),
              rowId,
              objNew,
            ),
            isContent,
          );

          newTableHash ^= isContent
            ? 0
            : (myOldRowHash ? hashIdAndHash(rowId, myOldRowHash) : 0) ^
              hashIdAndHash(rowId, myNewRowHash);
          newTableTime = getLatestTime(newTableTime, newRowTime);
        });

        newTableHash ^= isContent
          ? 0
          : replaceTimeHash(myTableTime, otherTableTime);
        stampUpdate(myTableStamp, otherTableTime, newTableHash);

        newTablesHash ^= isContent
          ? 0
          : (myTableHash ? hashIdAndHash(tableId, myTableHash) : 0) ^
            hashIdAndHash(tableId, myTableStamp[2]);
        newTablesTime = getLatestTime(newTablesTime, newTableTime);
      },
    );

    newTablesHash ^= isContent
      ? 0
      : replaceTimeHash(myTablesTime, otherTablesTime);
    stampUpdate(myTablesStamp, otherTablesTime, newTablesHash);

    const [newValuesTime] = mergeCellsOrValues(
      otherValues,
      myValuesStamp,
      valuesChanges,
      isContent,
    );

    seenHlc(getLatestTime(newTablesTime, newValuesTime));
    saveMyTablesStamp(myTablesStamp);
    saveMyValuesStamp(myValuesStamp);
    return [tablesChanges, valuesChanges, 1];
  };

  return [
    getMergeableContentHashes,
    getMergeableTableHashes,
    getMergeableTableDiff,
    getMergeableRowHashes,
    getMergeableRowDiff,
    getMergeableCellHashes,
    getMergeableCellDiff,
    getMergeableValueHashes,
    getMergeableValueDiff,
    mergeContentOrChanges,
  ];
};

const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
  otherParentStamp: typeof isContent extends 1
    ? Stamp<IdObj<Stamp<Thing, true>>, true>
    : Stamp<IdObj<Stamp<Thing>>>,
  myParentStamp: StampObj<Stamp<Thing, true>>,
  resultingChanges: {[thingId: Id]: Thing},
  isContent: 0 | 1,
): [newParentTime: Time, oldParentHash: number, newParentHash: number] => {
  const [otherParent, otherParentTime = EMPTY_STRING, otherParentHash = 0] =
    otherParentStamp;
  const [myParent, myParentTime, myParentHash] = myParentStamp;

  let newParentTime = otherParentTime;
  let newParentHash = isContent ? otherParentHash : myParentHash;

  objForEach(
    otherParent,
    (
      [otherThing, otherThingTime = EMPTY_STRING, otherThingHash = 0],
      thingId,
    ) => {
      const myThingStamp = objEnsure<Stamp<Thing, true>>(
        myParent,
        thingId,
        () => stampNewWithHash(undefined as any),
      );
      const [, myThingTime, myThingHash] = myThingStamp;

      if (!myThingTime || otherThingTime > myThingTime) {
        stampUpdate(
          myThingStamp,
          otherThingTime,
          isContent
            ? otherThingHash
            : getHash(jsonString(otherThing ?? null) + ':' + otherThingTime),
        );
        myThingStamp[0] = otherThing;
        resultingChanges[thingId] = otherThing;
        newParentHash ^= isContent
          ? 0
          : hashIdAndHash(thingId, myThingHash) ^
            hashIdAndHash(thingId, myThingStamp[2]);
        newParentTime = getLatestTime(newParentTime, otherThingTime);
      }
    },
  );

  newParentHash ^= isContent
    ? 0
    : replaceTimeHash(myParentTime, otherParentTime);
  stampUpdate(myParentStamp, otherParentTime, newParentHash);

  return [newParentTime, myParentHash, myParentStamp[2]];
};
