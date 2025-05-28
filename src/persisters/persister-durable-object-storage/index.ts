import type {Ids} from '../../@types/common/index.d.ts';
import type {
  RowStamp,
  Stamp,
  TableStamp,
  TablesStamp,
  ValuesStamp,
} from '../../@types/mergeables/index.d.ts';
import type {MergeableStore} from '../../@types/mergeables/mergeable-store/index.d.ts';
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
import {ifNotUndefined, noop, slice} from '../../common/other.ts';
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
    const tables: TablesStamp<true> = stampNewObjectWithHash();
    const values: ValuesStamp<true> = stampNewObjectWithHash();
    (await storage.list<StoredValue>({prefix: storagePrefix})).forEach(
      async ([zeroOrCellOrValue, time, hash], key) =>
        ifNotUndefined(deconstructKey(key), ([type, ...ids]) =>
          type == T
            ? ifNotUndefined(
                ids[0],
                (tableId) => {
                  const table = objEnsure(
                    tables[0],
                    tableId,
                    stampNewObjectWithHash,
                  ) as TableStamp<true>;
                  ifNotUndefined(
                    ids[1],
                    (rowId) => {
                      const row = objEnsure(
                        table[0],
                        rowId,
                        stampNewObjectWithHash,
                      ) as RowStamp<true>;
                      ifNotUndefined(
                        ids[2],
                        (cellId) =>
                          (row[0][cellId] = [zeroOrCellOrValue, time, hash]),
                        () => stampUpdate(row, time, hash),
                      );
                    },
                    () => stampUpdate(table, time, hash),
                  );
                },
                () => stampUpdate(tables, time, hash),
              )
            : type == V
              ? ifNotUndefined(
                  ids[0],
                  (valueId) =>
                    (values[0][valueId] = [zeroOrCellOrValue, time, hash]),
                  () => stampUpdate(values, time, hash),
                )
              : 0,
        ),
    );
    return [tables, values];
  };

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.MergeableStoreOnly>,
    [
      [tablesObj, tablesTime, tablesHash],
      [valuesObj, valuesTime, valuesHash],
    ]: PersistedChanges<
      PersistsType.MergeableStoreOnly,
      true
    > = getContent() as any,
  ): Promise<void> => {
    const keysToSet: IdMap<StoredValue> = mapNew();
    mapSet(keysToSet, constructKey(T), [0, tablesTime, tablesHash]);
    objForEach(tablesObj, ([tableObj, tableTime, tableHash], tableId) => {
      mapSet(keysToSet, constructKey(T, tableId), [0, tableTime, tableHash]);
      objForEach(tableObj, ([rowObj, rowTime, rowHash], rowId) => {
        mapSet(keysToSet, constructKey(T, tableId, rowId), [
          0,
          rowTime,
          rowHash,
        ]);
        objForEach(rowObj, (cellStamp, cellId) =>
          mapSet(keysToSet, constructKey(T, tableId, rowId, cellId), cellStamp),
        );
      });
    });
    mapSet(keysToSet, constructKey(V), [0, valuesTime, valuesHash]);
    objForEach(valuesObj, (valueStamp, valueId) =>
      mapSet(keysToSet, constructKey(V, valueId), valueStamp),
    );
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
