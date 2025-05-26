import type {Id} from '../@types/common/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  Stamp,
  TablesStamp,
  TableStamp,
  Time,
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
  StampObj,
  stampObjNewWithHash,
  stampUpdate,
} from '../common/stamps.ts';
import {EMPTY_STRING} from '../common/strings.ts';

export const getMergeableFunctions = (
  loadTablesStamp: (
    relevantTablesMask: MergeableChanges[0] | MergeableContent[0],
  ) => TablesStamp<true>,
  loadValuesStamp: (
    relevantValuesMask: MergeableChanges[1] | MergeableContent[1],
  ) => ValuesStamp<true>,
  saveTablesStamp: (tablesStamp: TablesStamp<true>) => void,
  saveValuesStamp: (valuesStamp: ValuesStamp<true>) => void,
  seenHlc: (remoteHlc: Hlc) => void,
) => {
  const mergeContentOrChanges = (
    inContentOrChanges: MergeableChanges | MergeableContent,
    isContent: 0 | 1 = 0,
  ): Changes => {
    // Current content with metadata
    const tablesStamp = loadTablesStamp(inContentOrChanges[0]);
    const valuesStamp = loadValuesStamp(inContentOrChanges[1]);

    // Incoming changes with metadata
    const [
      [inTables, inTablesTime = EMPTY_STRING, inTablesHash = 0],
      inValues,
    ] = inContentOrChanges as typeof isContent extends 1
      ? MergeableContent
      : MergeableChanges;

    // Changes to be returned, with no metadata
    const tablesChanges = {};
    const valuesChanges = {};

    // --
    const [tables, oldTablesTime, oldTablesHash] = tablesStamp;
    let newTablesHash = isContent ? inTablesHash : oldTablesHash;
    let newTablesTime = inTablesTime;
    objForEach(
      inTables,
      ([inTable, inTableTime = EMPTY_STRING, inTableHash = 0], tableId) => {
        const tableStamp = objEnsure<TableStamp<true>>(
          tables,
          tableId,
          stampObjNewWithHash,
        );
        const [rows, oldTableTime, oldTableHash] = tableStamp;
        let newTableHash = isContent ? inTableHash : oldTableHash;
        let newTableTime = inTableTime;
        objForEach(inTable, (inRow, rowId) => {
          const [newRowTime, oldRowHash, rowHash] = mergeCellsOrValues(
            inRow,
            objEnsure(rows, rowId, stampObjNewWithHash<any>),
            objEnsure(
              objEnsure(tablesChanges, tableId, objNew<any>),
              rowId,
              objNew,
            ),
            isContent,
          );

          newTableHash ^= isContent
            ? 0
            : (oldRowHash ? hashIdAndHash(rowId, oldRowHash) : 0) ^
              hashIdAndHash(rowId, rowHash);
          newTableTime = getLatestTime(newTableTime, newRowTime);
        });

        newTableHash ^= isContent
          ? 0
          : replaceTimeHash(oldTableTime, inTableTime);
        stampUpdate(tableStamp, inTableTime, newTableHash);

        newTablesHash ^= isContent
          ? 0
          : (oldTableHash ? hashIdAndHash(tableId, oldTableHash) : 0) ^
            hashIdAndHash(tableId, tableStamp[2]);
        newTablesTime = getLatestTime(newTablesTime, newTableTime);
      },
    );

    newTablesHash ^= isContent
      ? 0
      : replaceTimeHash(oldTablesTime, inTablesTime);
    stampUpdate(tablesStamp, inTablesTime, newTablesHash);

    const [valuesTime] = mergeCellsOrValues(
      inValues,
      valuesStamp,
      valuesChanges,
      isContent,
    );

    seenHlc(getLatestTime(newTablesTime, valuesTime));
    saveTablesStamp(tablesStamp);
    saveValuesStamp(valuesStamp);
    return [tablesChanges, valuesChanges, 1];
  };

  return [mergeContentOrChanges];
};

const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
  inParentStamp: typeof isContent extends 1
    ? Stamp<IdObj<Stamp<Thing, true>>, true>
    : Stamp<IdObj<Stamp<Thing>>>,
  parentStamp: StampObj<Stamp<Thing, true>>,
  resultingChanges: {[thingId: Id]: Thing},
  isContent: 0 | 1,
): [thingsTime: Time, oldThingsHash: number, newThingsHash: number] => {
  const [inParent, inParentTime = EMPTY_STRING, inParentHash = 0] =
    inParentStamp;
  const [parent, oldParentTime, oldParentHash] = parentStamp;

  let parentTime = inParentTime;
  let newParentHash = isContent ? inParentHash : oldParentHash;

  objForEach(
    inParent,
    ([thing, thingTime = EMPTY_STRING, inThingHash = 0], thingId) => {
      const thingStamp = objEnsure<Stamp<Thing, true>>(parent, thingId, () => [
        undefined as any,
        EMPTY_STRING,
        0,
      ]);
      const [, oldThingTime, oldThingHash] = thingStamp;

      if (!oldThingTime || thingTime > oldThingTime) {
        stampUpdate(
          thingStamp,
          thingTime,
          isContent
            ? inThingHash
            : getHash(jsonString(thing ?? null) + ':' + thingTime),
        );
        thingStamp[0] = thing;
        resultingChanges[thingId] = thing;
        newParentHash ^= isContent
          ? 0
          : hashIdAndHash(thingId, oldThingHash) ^
            hashIdAndHash(thingId, thingStamp[2]);
        parentTime = getLatestTime(parentTime, thingTime);
      }
    },
  );

  newParentHash ^= isContent ? 0 : replaceTimeHash(oldParentTime, inParentTime);
  stampUpdate(parentStamp, inParentTime, newParentHash);

  return [parentTime, oldParentHash, parentStamp[2]];
};
