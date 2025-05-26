import type {Id} from '../@types/common/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  Stamp,
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
import {getHash} from '../common/hash.ts';
import type {Hlc} from '../common/hlc.ts';
import {jsonString} from '../common/json.ts';
import {IdObj, objEnsure, objForEach, objNew} from '../common/obj.ts';
import {
  getLatestTime,
  hashIdAndHash,
  replaceTimeHash,
  stampNew,
  stampNewWithHash,
  StampObj,
  stampObjNewWithHash,
  stampUpdate,
} from '../common/stamps.ts';
import {EMPTY_STRING} from '../common/strings.ts';

export const getMergeableFunctions = (
  loadMyTablesStamp: (
    relevants?: MergeableChanges[0] | MergeableContent[0],
  ) => TablesStamp<true>,
  loadMyValuesStamp: (
    relevants?: MergeableChanges[1] | MergeableContent[1],
  ) => ValuesStamp<true>,
  saveMyTablesStamp: (myTablesStamp: TablesStamp<true>) => void,
  saveMyValuesStamp: (myValuesStamp: ValuesStamp<true>) => void,
  seenHlc: (remoteHlc: Hlc) => void,
): [getMergeableValueDiff: any, mergeContentOrChanges: any] => {
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

  return [getMergeableValueDiff, mergeContentOrChanges];
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
