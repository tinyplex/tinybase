import type {Changes, Content, Store} from '../../@types/store/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../../@types/mergeable-store/index.d.ts';
import type {
  PersistedChanges,
  PersistedContent,
  PersistedStore,
  Persister,
  PersisterListener,
  PersisterStats,
  Persists as PersistsEnum,
  StatusListener,
} from '../../@types/persisters/index.d.ts';
import {arrayClear, arrayPush, arrayShift} from '../../common/array.ts';
import {
  errorNew,
  ifNotUndefined,
  isArray,
  isUndefined,
} from '../../common/other.ts';
import {mapEnsure, mapGet, mapNew, mapSet} from '../../common/map.ts';
import {objFreeze, objIsEmpty} from '../../common/obj.ts';
import type {Id} from '../../@types/common/index.d.ts';
import {IdSet2} from '../../common/set.ts';
import {getListenerFunctions} from '../../common/listeners.ts';

const enum StatusValues {
  Idle = 0,
  Loading = 1,
  Saving = 2,
}

export const Status = {
  Idle: StatusValues.Idle,
  Loading: StatusValues.Loading,
  Saving: StatusValues.Saving,
};

const enum PersistsValues {
  StoreOnly = 1,
  MergeableStoreOnly = 2,
  StoreOrMergeableStore = 3,
}

export const Persists = {
  StoreOnly: PersistsValues.StoreOnly,
  MergeableStoreOnly: PersistsValues.MergeableStoreOnly,
  StoreOrMergeableStore: PersistsValues.StoreOrMergeableStore,
};

type Action = () => Promise<any>;

const scheduleRunning: Map<any, 0 | 1> = mapNew();
const scheduleActions: Map<any, Action[]> = mapNew();

const getStoreFunctions = (
  persist: PersistsEnum | any = PersistsValues.StoreOnly,
  store: PersistedStore<typeof persist>,
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
  persist != PersistsValues.StoreOnly && store.isMergeable()
    ? [
        1,
        (store as MergeableStore).getMergeableContent,
        (store as MergeableStore).getTransactionMergeableChanges,
        ([[changedTables], [changedValues]]: MergeableChanges) =>
          !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
        (store as MergeableStore).setDefaultContent,
      ]
    : persist != PersistsValues.MergeableStoreOnly
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
  ListenerHandle,
  Persist extends PersistsEnum = PersistsEnum.StoreOnly,
>(
  store: PersistedStore<Persist>,
  getPersisted: () => Promise<PersistedContent<Persist> | undefined>,
  setPersisted: (
    getContent: () => PersistedContent<Persist>,
    changes?: PersistedChanges<Persist>,
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<Persist>,
  ) => ListenerHandle | Promise<ListenerHandle>,
  delPersisterListener: (listenerHandle: ListenerHandle) => void,
  onIgnoredError?: (error: any) => void,
  persist?: Persist,
  // undocumented:
  extra: {[methodName: string]: (...params: any[]) => any} = {},
  scheduleId = [],
): Persister<Persist> => {
  let status: StatusValues = StatusValues.Idle;
  let loads = 0;
  let saves = 0;
  let action;
  let autoLoadHandle: ListenerHandle | undefined;
  let autoSaveListenerId: Id | undefined;

  mapEnsure(scheduleRunning, scheduleId, () => 0);
  mapEnsure(scheduleActions, scheduleId, () => []);

  const statusListeners: IdSet2 = mapNew();

  const [
    isMergeableStore,
    getContent,
    getChanges,
    hasChanges,
    setDefaultContent,
  ] = getStoreFunctions(persist, store);

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => persister,
  );

  const setStatus = (newStatus: StatusValues): void => {
    if (newStatus != status) {
      status = newStatus;
      callListeners(statusListeners, undefined, status);
    }
  };

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
    if (status != StatusValues.Saving) {
      setStatus(StatusValues.Loading);
      loads++;
      await schedule(async () => {
        try {
          const content = await getPersisted();
          if (isArray(content)) {
            setContentOrChanges(content);
          } else {
            errorNew(`Content is not an array ${content}`);
          }
        } catch (error) {
          onIgnoredError?.(error);
          if (initialContent) {
            setDefaultContent(initialContent as Content);
          }
        }
        setStatus(StatusValues.Idle);
      });
    }
    return persister;
  };

  const startAutoLoad = async (
    initialContent?: Content,
  ): Promise<Persister<Persist>> => {
    await stopAutoLoad().load(initialContent);
    try {
      autoLoadHandle = await addPersisterListener(async (content, changes) => {
        if (changes || content) {
          /*! istanbul ignore else */
          if (status != StatusValues.Saving) {
            setStatus(StatusValues.Loading);
            loads++;
            setContentOrChanges(changes ?? content);
            setStatus(StatusValues.Idle);
          }
        } else {
          await load();
        }
      });
    } catch (error) {
      /*! istanbul ignore next */
      onIgnoredError?.(error);
    }
    return persister;
  };

  const stopAutoLoad = (): Persister<Persist> => {
    if (autoLoadHandle) {
      delPersisterListener(autoLoadHandle);
      autoLoadHandle = undefined;
    }
    return persister;
  };

  const isAutoLoading = () => !isUndefined(autoLoadHandle);

  const save = async (
    changes?: PersistedChanges<Persist>,
  ): Promise<Persister<Persist>> => {
    /*! istanbul ignore else */
    if (status != StatusValues.Loading) {
      setStatus(StatusValues.Saving);
      saves++;
      await schedule(async () => {
        try {
          await setPersisted(getContent as any, changes);
        } catch (error) {
          /*! istanbul ignore next */
          onIgnoredError?.(error);
        }
        setStatus(StatusValues.Idle);
      });
    }
    return persister;
  };

  const startAutoSave = async (): Promise<Persister<Persist>> => {
    await stopAutoSave().save();
    autoSaveListenerId = store.addDidFinishTransactionListener(() => {
      const changes = getChanges() as any;
      if (hasChanges(changes)) {
        save(changes);
      }
    });
    return persister;
  };

  const stopAutoSave = (): Persister<Persist> => {
    ifNotUndefined(autoSaveListenerId, store.delListener);
    autoSaveListenerId = undefined;
    return persister;
  };

  const isAutoSaving = () => !isUndefined(autoSaveListenerId);

  const getStatus = (): StatusValues => status;

  const addStatusListener = (listener: StatusListener): Id =>
    addListener(listener, statusListeners);

  const delListener = (listenerId: Id): Store => {
    delListenerImpl(listenerId);
    return store;
  };

  const schedule = async (...actions: Action[]): Promise<Persister> => {
    arrayPush(mapGet(scheduleActions, scheduleId) as Action[], ...actions);
    await run();
    return persister;
  };

  const getStore = (): Store => store;

  const destroy = (): Persister<Persist> => {
    arrayClear(mapGet(scheduleActions, scheduleId) as Action[]);
    return stopAutoLoad().stopAutoSave();
  };

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

    getStatus,
    addStatusListener,
    delListener,

    schedule,
    getStore,
    destroy,
    getStats,
    ...extra,
  };

  return objFreeze(persister as Persister<Persist>);
};
