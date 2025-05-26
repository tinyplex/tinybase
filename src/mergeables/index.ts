import type {Id} from '../@types/common/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  RowStamp,
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
import {jsonStringWithMap} from '../common/json.ts';
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
  loadTablesStampMap: (
    relevantTablesMask: MergeableChanges[0] | MergeableContent[0],
  ) => TablesStamp<true>,
  loadValuesStampMap: (
    relevantValuesMask: MergeableChanges[1] | MergeableContent[1],
  ) => ValuesStamp<true>,
  saveTablesStampMap: (tablesStampMap: TablesStamp<true>) => void,
  saveValuesStampMap: (valuesStampMap: ValuesStamp<true>) => void,
  seenHlc: (remoteHlc: Hlc) => void,
) => {
  const mergeContentOrChanges = (
    incomingContentOrChanges: MergeableChanges | MergeableContent,
    isContent: 0 | 1 = 0,
  ): Changes => {
    // Current content with metadata
    const tablesStampMap = loadTablesStampMap(incomingContentOrChanges[0]);
    const valuesStampMap = loadValuesStampMap(incomingContentOrChanges[1]);
    const [tableStampMaps, oldTablesTime, oldTablesHash] = tablesStampMap;

    // Incoming changes with metadata
    const [
      [
        incomingTables,
        incomingTablesTime = EMPTY_STRING,
        incomingTablesHash = 0,
      ],
      incomingValues,
    ] = incomingContentOrChanges as typeof isContent extends 1
      ? MergeableContent
      : MergeableChanges;

    // Changes to be returned, with no metadata
    const tablesChanges = {};
    const valuesChanges = {};

    // --
    let tablesHash = isContent ? incomingTablesHash : oldTablesHash;
    let tablesTime = incomingTablesTime;
    objForEach(
      incomingTables,
      (
        [
          incomingTable,
          incomingTableTime = EMPTY_STRING,
          incomingTableHash = 0,
        ],
        tableId,
      ) => {
        const tableStampMap = objEnsure<TableStamp<true>>(
          tableStampMaps,
          tableId,
          stampObjNewWithHash,
        );
        const [rowStampMaps, oldTableTime, oldTableHash] = tableStampMap;
        let tableHash = isContent ? incomingTableHash : oldTableHash;
        let tableTime = incomingTableTime;
        objForEach(incomingTable, (incomingRow, rowId) => {
          const [rowTime, oldRowHash, rowHash] = mergeCellsOrValues(
            incomingRow,
            objEnsure<RowStamp<true>>(rowStampMaps, rowId, stampObjNewWithHash),
            objEnsure<IdObj<CellOrUndefined>>(
              objEnsure<IdObj<IdObj<CellOrUndefined>>>(
                tablesChanges,
                tableId,
                objNew,
              ),
              rowId,
              objNew,
            ),
            isContent,
          );

          tableHash ^= isContent
            ? 0
            : (oldRowHash ? hashIdAndHash(rowId, oldRowHash) : 0) ^
              hashIdAndHash(rowId, rowHash);
          tableTime = getLatestTime(tableTime, rowTime);
        });

        tableHash ^= isContent
          ? 0
          : replaceTimeHash(oldTableTime, incomingTableTime);
        stampUpdate(tableStampMap, incomingTableTime, tableHash);

        tablesHash ^= isContent
          ? 0
          : (oldTableHash ? hashIdAndHash(tableId, oldTableHash) : 0) ^
            hashIdAndHash(tableId, tableStampMap[2]);
        tablesTime = getLatestTime(tablesTime, tableTime);
      },
    );

    tablesHash ^= isContent
      ? 0
      : replaceTimeHash(oldTablesTime, incomingTablesTime);
    stampUpdate(tablesStampMap, incomingTablesTime, tablesHash);

    const [valuesTime] = mergeCellsOrValues(
      incomingValues,
      valuesStampMap,
      valuesChanges,
      isContent,
    );

    seenHlc(getLatestTime(tablesTime, valuesTime));
    saveTablesStampMap(tablesStampMap);
    saveValuesStampMap(valuesStampMap);
    return [tablesChanges, valuesChanges, 1];
  };

  return [mergeContentOrChanges];
};

const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
  things: typeof isContent extends 1
    ? Stamp<IdObj<Stamp<Thing, true>>, true>
    : Stamp<IdObj<Stamp<Thing>>>,
  thingsStampMap: StampObj<Stamp<Thing, true>>,
  resultingChanges: {[thingId: Id]: Thing},
  isContent: 0 | 1,
): [thingsTime: Time, oldThingsHash: number, newThingsHash: number] => {
  const [
    incomingThings,
    incomingThingsTime = EMPTY_STRING,
    incomingThingsHash = 0,
  ] = things;
  const [thingStampMaps, oldThingsTime, oldThingsHash] = thingsStampMap;

  let thingsTime = incomingThingsTime;
  let thingsHash = isContent ? incomingThingsHash : oldThingsHash;

  objForEach(
    incomingThings,
    ([thing, thingTime = EMPTY_STRING, incomingThingHash = 0], thingId) => {
      const thingStampMap = objEnsure<Stamp<Thing, true>>(
        thingStampMaps,
        thingId,
        () => [undefined as any, EMPTY_STRING, 0],
      );
      const [, oldThingTime, oldThingHash] = thingStampMap;

      if (!oldThingTime || thingTime > oldThingTime) {
        stampUpdate(
          thingStampMap,
          thingTime,
          isContent
            ? incomingThingHash
            : getHash(jsonStringWithMap(thing ?? null) + ':' + thingTime),
        );
        thingStampMap[0] = thing;
        resultingChanges[thingId] = thing;
        thingsHash ^= isContent
          ? 0
          : hashIdAndHash(thingId, oldThingHash) ^
            hashIdAndHash(thingId, thingStampMap[2]);
        thingsTime = getLatestTime(thingsTime, thingTime);
      }
    },
  );

  thingsHash ^= isContent
    ? 0
    : replaceTimeHash(oldThingsTime, incomingThingsTime);
  stampUpdate(thingsStampMap, incomingThingsTime, thingsHash);

  return [thingsTime, oldThingsHash, thingsStampMap[2]];
};
