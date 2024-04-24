import {Changes, Content, Store} from './types/store.d';
import {DEBUG, ifNotUndefined, isArray, isUndefined} from './common/other';
import {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from './types/mergeable-store';
import {
  Persister,
  PersisterListener,
  PersisterStats,
} from './types/persisters.d';
import {arrayPush, arrayShift} from './common/array';
import {mapEnsure, mapGet, mapNew, mapSet} from './common/map';
import {objFreeze, objIsEmpty} from './common/obj';
import {Id} from './types/common.d';

type Action = () => Promise<any>;

const scheduleRunning: Map<any, 0 | 1> = mapNew();
const scheduleActions: Map<any, Action[]> = mapNew();

const getStoreFunctions = (
  supportsMergeableStore: boolean | undefined,
  store: MergeableStore,
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
  !supportsMergeableStore || isUndefined(store.getMergeableContent)
    ? [
        0,
        store.getContent,
        store.getTransactionChanges,
        ([changedTables, changedValues]: Changes) =>
          !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
        store.setContent,
      ]
    : [
        1,
        store.getMergeableContent,
        store.getTransactionMergeableChanges,
        ([[changedTables], [changedValues]]: MergeableChanges) =>
          !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
        store.setDefaultContent,
      ];

export const createCustomPersister = <
  ListeningHandle,
  SupportsMergeableStore extends boolean,
>(
  store: Store | (SupportsMergeableStore extends true ? MergeableStore : never),
  getPersisted: () => Promise<
    | Content
    | (SupportsMergeableStore extends true ? MergeableContent : never)
    | undefined
  >,
  setPersisted: (
    getContent: () =>
      | Content
      | (SupportsMergeableStore extends true ? MergeableContent : never),
    changes?:
      | Changes
      | (SupportsMergeableStore extends true ? MergeableChanges : never),
  ) => Promise<void>,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
  supportsMergeableStore?: SupportsMergeableStore,
  // undocumented:
  extra: {[methodName: string]: (...args: any[]) => any} = {},
  scheduleId = [],
): Persister<SupportsMergeableStore> => {
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
  ] = getStoreFunctions(supportsMergeableStore, store as MergeableStore);

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
      if (DEBUG) {
        loads++;
      }
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
  ): Promise<Persister<SupportsMergeableStore>> => {
    await stopAutoLoad().load(initialContent);
    autoLoadHandle = addPersisterListener(async (content, changes) => {
      if (changes || content) {
        /*! istanbul ignore else */
        if (loadSave != 2) {
          loadSave = 1;
          if (DEBUG) {
            loads++;
          }
          setContentOrChanges(changes ?? content);
          loadSave = 0;
        }
      } else {
        await load();
      }
    });
    return persister;
  };

  const stopAutoLoad = (): Persister => {
    if (autoLoadHandle) {
      delPersisterListener(autoLoadHandle);
      autoLoadHandle = undefined;
    }
    return persister;
  };

  const isAutoLoading = () => !isUndefined(autoLoadHandle);

  const save = async (
    changes?:
      | Changes
      | (SupportsMergeableStore extends true ? MergeableChanges : never),
  ): Promise<Persister<SupportsMergeableStore>> => {
    /*! istanbul ignore else */
    if (loadSave != 1) {
      loadSave = 2;
      if (DEBUG) {
        saves++;
      }
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

  const startAutoSave = async (): Promise<Persister> => {
    await stopAutoSave().save();
    autoSaveListenerId = store.addDidFinishTransactionListener(() => {
      const changes = getChanges() as any;
      if (hasChanges(changes)) {
        save(changes);
      }
    });
    return persister;
  };

  const stopAutoSave = (): Persister => {
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

  const destroy = (): Persister => stopAutoLoad().stopAutoSave();

  const getStats = (): PersisterStats => (DEBUG ? {loads, saves} : {});

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

  return objFreeze(persister as Persister<SupportsMergeableStore>);
};
