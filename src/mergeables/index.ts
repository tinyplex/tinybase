import type {Id} from '../@types/common/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  Stamp,
  Time,
} from '../@types/mergeables/index.d.ts';
import type {
  CellOrUndefined,
  Changes,
  ValueOrUndefined,
} from '../@types/store/index.d.ts';
import {getHash} from '../common/hash.ts';
import type {Hlc} from '../common/hlc.ts';
import {jsonStringWithMap} from '../common/json.ts';
import {mapEnsure} from '../common/map.ts';
import {IdObj, objEnsure, objForEach, objNew} from '../common/obj.ts';
import {
  ContentStampMap,
  RowStampMap,
  StampMap,
  TableStampMap,
  getLatestTime,
  hashIdAndHash,
  replaceTimeHash,
  stampNewMap,
  stampUpdate,
} from '../common/stamps.ts';
import {EMPTY_STRING} from '../common/strings.ts';

export const getMergeableFunctions = (
  loadCurrentContentStampMap: (
    incomingContentOrChanges: MergeableChanges | MergeableContent,
  ) => ContentStampMap,
  saveCurrentContentStampMap: (contentStampMap: ContentStampMap) => void,
  seenHlc: (remoteHlc: Hlc) => void,
) => {
  const mergeContentOrChanges = (
    incomingContentOrChanges: MergeableChanges | MergeableContent,
    isContent: 0 | 1 = 0,
  ): Changes => {
    // Current content with metadata
    const contentStampMap = loadCurrentContentStampMap(
      incomingContentOrChanges,
    );
    const [tablesStampMap, valuesStampMap] = contentStampMap;
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
        const tableStampMap = mapEnsure<Id, TableStampMap>(
          tableStampMaps,
          tableId,
          stampNewMap,
        );
        const [rowStampMaps, oldTableTime, oldTableHash] = tableStampMap;
        let tableHash = isContent ? incomingTableHash : oldTableHash;
        let tableTime = incomingTableTime;
        objForEach(incomingTable, (incomingRow, rowId) => {
          const [rowTime, oldRowHash, rowHash] = mergeCellsOrValues(
            incomingRow,
            mapEnsure<Id, RowStampMap>(rowStampMaps, rowId, stampNewMap),
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
    saveCurrentContentStampMap(contentStampMap);
    return [tablesChanges, valuesChanges, 1];
  };

  return [mergeContentOrChanges];
};

const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
  things: typeof isContent extends 1
    ? Stamp<IdObj<Stamp<Thing, true>>, true>
    : Stamp<IdObj<Stamp<Thing>>>,
  thingsStampMap: StampMap<Stamp<Thing, true>>,
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
      const thingStampMap = mapEnsure<Id, Stamp<Thing, true>>(
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
