import type {Changes, Content, Store} from '../@types/store/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../@types/mergeable-store/index.d.ts';
import type {
  Persistables as PersistablesType,
  PersistedChanges,
  PersistedContent,
  PersistedStore,
  Persister,
  PersisterListener,
  PersisterStats,
} from '../@types/persisters/index.d.ts';
import {arrayPush, arrayShift} from '../common/array.ts';
import {
  errorNew,
  ifNotUndefined,
  isArray,
  isUndefined,
} from '../common/other.ts';
import {mapEnsure, mapGet, mapNew, mapSet} from '../common/map.ts';
import {objFreeze, objIsEmpty} from '../common/obj.ts';
import type {Id} from '../@types/common/index.d.ts';

export const Persistables = {
  StoreOnly: 1,
  MergeableStoreOnly: 2,
  StoreOrMergeableStore: 3,
};

type Action = () => Promise<any>;

const scheduleRunning: Map<any, 0 | 1> = mapNew();
const scheduleActions: Map<any, Action[]> = mapNew();

const getStoreFunctions = (
  persistable: PersistablesType = Persistables.StoreOnly,
  store: PersistedStore<typeof persistable>,
):
  | [
      isMergeableStore: 0,
      getContent: () => Content,
      getChanges: () => Changes,
      hasChanges: (changes: Changes) => boolean,
      setDefaultContent: (content: Content) => Store,
    ]
  | [
      isMergeableStore: 1,
      getContent: () => MergeableContent,
      getChanges: () => MergeableChanges,
      hasChanges: (changes: MergeableChanges) => boolean,
      setDefaultContent: (content: Content) => MergeableStore,
    ] =>
  persistable != Persistables.StoreOnly && store.isMergeable()
    ? [
        1,
        (store as MergeableStore).getMergeableContent,
        (store as MergeableStore).getTransactionMergeableChanges,
        ([[changedTables], [changedValues]]: MergeableChanges) =>
          !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
        (store as MergeableStore).setDefaultContent,
      ]
    : persistable != Persistables.MergeableStoreOnly
      ? [
          0,
          store.getContent,
          store.getTransactionChanges,
          ([changedTables, changedValues]: Changes) =>
            !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
          store.setContent,
        ]
      : errorNew('Store type not supported by this Persister');

export const createCustomPersister = <
  ListeningHandle,
  Persistable extends PersistablesType = PersistablesType.StoreOnly,
>(
  store: PersistedStore<Persistable>,
  getPersisted: () => Promise<PersistedContent<Persistable> | undefined>,
  setPersisted: (
    getContent: () => PersistedContent<Persistable>,
    changes?: PersistedChanges<Persistable>,
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<Persistable>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
  persistable?: Persistable,
  // undocumented:
  extra: {[methodName: string]: (...args: any[]) => any} = {},
  scheduleId = [],
): Persister<Persistable> => {
  let loadSave = 0;
  let loads = 0;
  let saves = 0;
  let action;
  let autoLoadHandle: ListeningHandle | undefined;
  let autoSaveListenerId: Id | undefined;

  mapEnsure(scheduleRunning, scheduleId, () => 0);
  mapEnsure(scheduleActions, scheduleId, () => []);

  const [
    isMergeableStore,
    getContent,
    getChanges,
    hasChanges,
    setDefaultContent,
  ] = getStoreFunctions(persistable, store);

  const run = async (): Promise<void> => {
    /*! istanbul ignore else */
    if (!mapGet(scheduleRunning, scheduleId)) {
      mapSet(scheduleRunning, scheduleId, 1);
      while (
        !isUndefined(
          (action = arrayShift(
            mapGet(scheduleActions, scheduleId) as Action[],
          )),
        )
      ) {
        try {
          await action();
        } catch (error) {
          /*! istanbul ignore next */
          onIgnoredError?.(error);
        }
      }
      mapSet(scheduleRunning, scheduleId, 0);
    }
  };

  const setContentOrChanges = (
    contentOrChanges:
      | Content
      | Changes
      | MergeableContent
      | MergeableChanges
      | undefined,
  ): void => {
    (isMergeableStore && isArray(contentOrChanges?.[0])
      ? contentOrChanges?.[2] === 1
        ? (store as MergeableStore).applyMergeableChanges
        : (store as MergeableStore).setMergeableContent
      : contentOrChanges?.[2] === 1
        ? store.applyChanges
        : store.setContent)(
      contentOrChanges as Content &
        MergeableContent &
        Changes &
        MergeableChanges,
    );
  };

  const load = async (initialContent?: Content): Promise<Persister> => {
    /*! istanbul ignore else */
    if (loadSave != 2) {
      loadSave = 1;
      loads++;
      await schedule(async () => {
        try {
          setContentOrChanges(await getPersisted());
        } catch (error) {
          onIgnoredError?.(error);
          if (initialContent) {
            setDefaultContent(initialContent as Content);
          }
        }
        loadSave = 0;
      });
    }
    return persister;
  };

  const startAutoLoad = async (
    initialContent?: Content,
  ): Promise<Persister<Persistable>> => {
    await stopAutoLoad().load(initialContent);
    autoLoadHandle = addPersisterListener(async (content, changes) => {
      if (changes || content) {
        /*! istanbul ignore else */
        if (loadSave != 2) {
          loadSave = 1;
          loads++;
          setContentOrChanges(changes ?? content);
          loadSave = 0;
        }
      } else {
        await load();
      }
    });
    return persister;
  };

  const stopAutoLoad = (): Persister<Persistable> => {
    if (autoLoadHandle) {
      delPersisterListener(autoLoadHandle);
      autoLoadHandle = undefined;
    }
    return persister;
  };

  const isAutoLoading = () => !isUndefined(autoLoadHandle);

  const save = async (
    changes?: PersistedChanges<Persistable>,
  ): Promise<Persister<Persistable>> => {
    /*! istanbul ignore else */
    if (loadSave != 1) {
      loadSave = 2;
      saves++;
      await schedule(async () => {
        try {
          await setPersisted(getContent as any, changes);
        } catch (error) {
          /*! istanbul ignore next */
          onIgnoredError?.(error);
        }
        loadSave = 0;
      });
    }
    return persister;
  };

  const startAutoSave = async (): Promise<Persister<Persistable>> => {
    await stopAutoSave().save();
    autoSaveListenerId = store.addDidFinishTransactionListener(() => {
      const changes = getChanges() as any;
      if (hasChanges(changes)) {
        save(changes);
      }
    });
    return persister;
  };

  const stopAutoSave = (): Persister<Persistable> => {
    ifNotUndefined(autoSaveListenerId, store.delListener);
    autoSaveListenerId = undefined;
    return persister;
  };

  const isAutoSaving = () => !isUndefined(autoSaveListenerId);

  const schedule = async (...actions: Action[]): Promise<Persister> => {
    arrayPush(mapGet(scheduleActions, scheduleId) as Action[], ...actions);
    await run();
    return persister;
  };

  const getStore = (): Store => store;

  const destroy = (): Persister<Persistable> => stopAutoLoad().stopAutoSave();

  const getStats = (): PersisterStats => ({loads, saves});

  const persister: any = {
    load,
    startAutoLoad,
    stopAutoLoad,
    isAutoLoading,

    save,
    startAutoSave,
    stopAutoSave,
    isAutoSaving,

    schedule,
    getStore,
    destroy,
    getStats,
    ...extra,
  };

  return objFreeze(persister as Persister<Persistable>);
};
