import type {Ids} from '../../@types/common/index.d.ts';
import type {
  MergeableStore,
  RowStamp,
  Stamp,
  TableStamp,
  TablesStamp,
  ValuesStamp,
} from '../../@types/mergeable-store/index.d.ts';
import type {
  PersistedChanges,
  PersistedContent,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {
  DurableObjectStoragePersister,
  createDurableObjectStoragePersister as createDurableObjectStoragePersisterDecl,
} from '../../@types/persisters/persister-durable-object-storage/index.d.ts';
import type {Cell, Value} from '../../@types/store/index.d.ts';
import {jsonStringWithUndefined} from '../../common/json.ts';
import {IdMap, mapNew, mapSet, mapToObj} from '../../common/map.ts';
import {objEnsure, objForEach} from '../../common/obj.ts';
import {noop, slice} from '../../common/other.ts';
import {stampNewWithHash, stampUpdate} from '../../common/stamps.ts';
import {EMPTY_STRING, T, V, strStartsWith} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

type StorageKeyType = typeof T | typeof V;
type StoredValue = Stamp<0 | Cell | Value | undefined, true>;

const stampNewObjectWithHash = () => stampNewWithHash({}, EMPTY_STRING, 0);

export const createDurableObjectStoragePersister = ((
  store: MergeableStore,
  storage: DurableObjectStorage,
  storagePrefix: string = EMPTY_STRING,
  onIgnoredError?: (error: any) => void,
): DurableObjectStoragePersister => {
  const constructKey = (type: StorageKeyType, ...ids: Ids) =>
    storagePrefix + type + slice(jsonStringWithUndefined(ids), 1, -1);

  const deconstructKey = (
    key: string,
  ): [type: string, ...ids: Ids] | undefined => {
    if (strStartsWith(key, storagePrefix)) {
      const type = slice(key, storagePrefix.length, 1);
      return type == T || type == V
        ? [
            type,
            ...JSON.parse('[' + slice(key, storagePrefix.length + 1) + ']'),
          ]
        : undefined;
    }
  };

  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.MergeableStoreOnly>
  > => {
    // Initialize empty stamped objects for tables and values
    const tables: TablesStamp<true> = stampNewObjectWithHash();
    const values: ValuesStamp<true> = stampNewObjectWithHash();

    // Get all stored entries with the given prefix
    const storedEntries = await storage.list<StoredValue>({
      prefix: storagePrefix,
    });

    // Process each stored entry to reconstruct the persisted data structure
    storedEntries.forEach(([zeroOrCellOrValue, time, hash], key) => {
      const keyParts = deconstructKey(key);
      if (!keyParts) return;

      const [type, ...ids] = keyParts;

      if (type === T) {
        // Handle tables data
        processTableEntry(tables, ids, zeroOrCellOrValue, time, hash);
      } else if (type === V) {
        // Handle values data
        processValueEntry(values, ids, zeroOrCellOrValue, time, hash);
      }
    });

    return [tables, values];
  };

  // Helper function to process table-related storage entries
  const processTableEntry = (
    tables: TablesStamp<true>,
    ids: Ids,
    zeroOrCellOrValue: 0 | Cell | Value | undefined,
    time: string,
    hash: number,
  ): void => {
    const [tableId, rowId, cellId] = ids;

    if (tableId) {
      // Ensure table exists in the structure
      const table = objEnsure(
        tables[0],
        tableId,
        stampNewObjectWithHash,
      ) as TableStamp<true>;

      if (rowId) {
        // Ensure row exists within the table
        const row = objEnsure(
          table[0],
          rowId,
          stampNewObjectWithHash,
        ) as RowStamp<true>;

        if (cellId) {
          // Cell-level data: store the actual cell value
          row[0][cellId] = [zeroOrCellOrValue, time, hash];
        } else {
          // Row-level metadata: update the row's timestamp and hash
          stampUpdate(row, time, hash);
        }
      } else {
        // Table-level metadata: update the table's timestamp and hash
        stampUpdate(table, time, hash);
      }
    } else {
      // Tables-level metadata: update the root tables timestamp and hash
      stampUpdate(tables, time, hash);
    }
  };

  // Helper function to process value-related storage entries
  const processValueEntry = (
    values: ValuesStamp<true>,
    ids: Ids,
    zeroOrCellOrValue: 0 | Cell | Value | undefined,
    time: string,
    hash: number,
  ): void => {
    const [valueId] = ids;

    if (valueId) {
      // Value-level data: store the actual value
      values[0][valueId] = [zeroOrCellOrValue, time, hash];
    } else {
      // Values-level metadata: update the root values timestamp and hash
      stampUpdate(values, time, hash);
    }
  };

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.MergeableStoreOnly>,
    [
      [tablesObj, tablesHlc, tablesHash],
      [valuesObj, valuesHlc, valuesHash],
    ]: PersistedChanges<
      PersistsType.MergeableStoreOnly,
      true
    > = getContent() as any,
  ): Promise<void> => {
    // Prepare a map to collect all storage entries that need to be persisted
    const keysToSet: IdMap<StoredValue> = mapNew();

    // Store the root tables metadata (timestamp and hash)
    mapSet(keysToSet, constructKey(T), [0, tablesHlc, tablesHash]);

    // Process each table in the store
    objForEach(tablesObj, ([tableObj, tableHlc, tableHash], tableId) => {
      // Store table-level metadata
      mapSet(keysToSet, constructKey(T, tableId), [0, tableHlc, tableHash]);

      // Process each row within the table
      objForEach(tableObj, ([rowObj, rowHlc, rowHash], rowId) => {
        // Store row-level metadata
        mapSet(keysToSet, constructKey(T, tableId, rowId), [
          0,
          rowHlc,
          rowHash,
        ]);

        // Store each cell value within the row
        objForEach(rowObj, (cellStamp, cellId) =>
          mapSet(keysToSet, constructKey(T, tableId, rowId, cellId), cellStamp),
        );
      });
    });

    // Store the root values metadata (timestamp and hash)
    mapSet(keysToSet, constructKey(V), [0, valuesHlc, valuesHash]);

    // Process each value in the store
    objForEach(valuesObj, (valueStamp, valueId) =>
      mapSet(keysToSet, constructKey(V, valueId), valueStamp),
    );

    // Persist all collected entries to storage in a single batch operation
    await storage.put(mapToObj(keysToSet));
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    noop,
    noop,
    onIgnoredError,
    2, // MergeableStoreOnly,
    {getStorage: () => storage},
  ) as DurableObjectStoragePersister;
}) as typeof createDurableObjectStoragePersisterDecl;
