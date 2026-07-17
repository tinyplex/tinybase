import type {Id} from '../../@types/common/index.d.ts';
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
import type {Changes, Content, Store} from '../../@types/store/index.d.ts';
import {
  arrayClear,
  arrayFilter,
  arrayMap,
  arrayPush,
} from '../../common/array.ts';
import {
  ERROR_CONTENT,
  ERROR_STORE_TYPE,
  errorThrow,
  tryCatch,
  tryFinally,
  tryFinallyAsync,
} from '../../common/error.ts';
import {getListenerFunctions} from '../../common/listeners.ts';
import {mapEnsure, mapGet, mapNew, mapSet} from '../../common/map.ts';
import {objFreeze, objIsEmpty} from '../../common/obj.ts';
import {
  isArray,
  isEmpty,
  isUndefined,
  promiseNew,
  size,
} from '../../common/other.ts';
import {IdSet2} from '../../common/set.ts';
import {ProtectedMergeableStore} from '../../mergeable-store/index.ts';
import {ProtectedStore} from '../../store/index.ts';

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

type Action = () => any;
type ScheduledAction = [
  action: Action,
  complete: (() => void) | undefined,
  owner: object | undefined,
];

const scheduleRunning: Map<any, 0 | 1> = mapNew();
const scheduleActions: Map<any, ScheduledAction[]> = mapNew();
const scheduleReferences: Map<any, number> = mapNew();

const getStoreFunctions = (
  persist: PersistsEnum | any = PersistsValues.StoreOnly,
  store: PersistedStore<typeof persist>,
  isSynchronizer: 0 | 1,
):
  | [
      isMergeableStore: 0,
      getContent: () => Content,
      getChanges: () => Changes,
      hasChanges: (changes: Changes) => boolean,
      setDefaultContent: (content: Content | (() => Content)) => Store,
    ]
  | [
      isMergeableStore: 1,
      getContent: () => MergeableContent,
      getChanges: () => MergeableChanges<
        typeof isSynchronizer extends 1 ? false : true
      >,
      hasChanges: (changes: MergeableChanges) => boolean,
      setDefaultContent: (content: Content | (() => Content)) => MergeableStore,
    ] =>
  persist != PersistsValues.StoreOnly && store.isMergeable()
    ? [
        1,
        (store as ProtectedMergeableStore).__[1],
        () =>
          (store as ProtectedMergeableStore).__[2](
            !isSynchronizer,
          ) as MergeableChanges<typeof isSynchronizer extends 1 ? false : true>,
        ([[changedTables], [changedValues]]: MergeableChanges) =>
          !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
        (store as MergeableStore).setDefaultContent,
      ]
    : persist != PersistsValues.MergeableStoreOnly
      ? [
          0,
          (store as ProtectedStore)._[7],
          (store as ProtectedStore)._[8],
          ([changedTables, changedValues]: Changes) =>
            !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
          store.setContent,
        ]
      : errorThrow(ERROR_STORE_TYPE);

export const createCustomPersister = <
  ListenerHandle,
  Persist extends PersistsEnum = PersistsEnum.StoreOnly,
  IsSynchronizer extends 0 | 1 = 0,
>(
  store: PersistedStore<Persist>,
  getPersisted: () => Promise<PersistedContent<Persist> | undefined>,
  setPersisted: (
    getContent: () => PersistedContent<Persist>,
    changes?: PersistedChanges<
      Persist,
      IsSynchronizer extends 1 ? false : true
    >,
  ) => Promise<void>,
  addPersisterListener: (
    listener: PersisterListener<Persist>,
  ) => ListenerHandle | Promise<ListenerHandle>,
  delPersisterListener: (
    listenerHandle: ListenerHandle,
  ) => void | Promise<void>,
  onIgnoredError?: (error: any) => void,
  persist?: Persist,
  // undocumented:
  extra: {[methodName: string]: (...params: any[]) => any} = {},
  isSynchronizer: IsSynchronizer = 0 as IsSynchronizer,
  scheduleId = [],
): Persister<Persist> => {
  let status: StatusValues = StatusValues.Idle;
  let loads = 0;
  let saves = 0;
  let autoLoadHandle: ListenerHandle | undefined;
  let autoLoadPromise: Promise<void> | undefined;
  let autoLoadGeneration = 0;
  let pendingAutoLoads = 0;
  let pendingScheduledAutoLoads = 0;
  let autoLoadAfterSaveGeneration = 0;
  let autoSaveListenerId: Id | undefined;
  let autoSaveGeneration = 0;
  let destroyed = 0;
  let destroying: Promise<void> | undefined;
  let activeAction: Promise<void> | undefined;
  const scheduleOwner = {};
  const extraDestroy = extra.destroy;

  mapEnsure(scheduleRunning, scheduleId, () => 0);
  mapEnsure(scheduleActions, scheduleId, () => []);
  mapSet(
    scheduleReferences,
    scheduleId,
    (mapGet(scheduleReferences, scheduleId) ?? 0) + 1,
  );

  const statusListeners: IdSet2 = mapNew();

  const [
    isMergeableStore,
    getContent,
    getChanges,
    hasChanges,
    setDefaultContent,
  ] = getStoreFunctions(persist, store, isSynchronizer);

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
      const scheduledActions = mapGet(
        scheduleActions,
        scheduleId,
      ) as ScheduledAction[];
      let actionIndex = 0;
      await tryFinallyAsync(
        async () => {
          while (actionIndex < size(scheduledActions)) {
            const scheduledAction = scheduledActions[actionIndex++];
            scheduledAction[2] = undefined;
            await scheduledAction[0]();
          }
        },
        () => {
          arrayClear(scheduledActions, actionIndex);
          mapSet(scheduleRunning, scheduleId, 0);
          pruneSchedule();
        },
      );
    }
  };

  const pruneSchedule = (): void => {
    if (
      !mapGet(scheduleReferences, scheduleId) &&
      !mapGet(scheduleRunning, scheduleId) &&
      isEmpty(mapGet(scheduleActions, scheduleId) ?? [])
    ) {
      mapSet(scheduleRunning, scheduleId);
      mapSet(scheduleActions, scheduleId);
      mapSet(scheduleReferences, scheduleId);
    }
  };

  const setContentOrChanges = (
    contentOrChanges:
      Content | Changes | MergeableContent | MergeableChanges | undefined,
  ): void => {
    (isMergeableStore && isArray(contentOrChanges?.[0])
      ? contentOrChanges?.[2] === 1
        ? (store as ProtectedMergeableStore).__[4]
        : (store as ProtectedMergeableStore).__[3]
      : contentOrChanges?.[2] === 1
        ? (store as ProtectedStore)._[10]
        : (store as ProtectedStore)._[9])(
      contentOrChanges as Content &
        MergeableContent &
        Changes &
        MergeableChanges,
    );
  };

  const saveAfterMutated = async (): Promise<void> => {
    if (isAutoSaving() && (store as ProtectedMergeableStore).__?.[0]?.()) {
      await save();
    }
  };

  // --

  const trackAutoLoadPromise = (
    newAutoLoadPromise: Promise<void>,
  ): Promise<void> =>
    tryFinallyAsync(
      () => (autoLoadPromise = newAutoLoadPromise),
      () => {
        if (autoLoadPromise == newAutoLoadPromise) {
          autoLoadPromise = undefined;
        }
      },
    );

  const load = async (
    initialContent?: Content | (() => Content),
  ): Promise<Persister> => {
    /*! istanbul ignore else */
    if (status != StatusValues.Saving) {
      await tryFinallyAsync(
        async () => {
          setStatus(StatusValues.Loading);
          loads++;
          await schedule(() =>
            tryCatch(
              async () => {
                const content = await getPersisted();
                if (isArray(content)) {
                  setContentOrChanges(content);
                } else if (isUndefined(content) && initialContent) {
                  setDefaultContent(initialContent);
                } else if (!isUndefined(content)) {
                  errorThrow(ERROR_CONTENT, content);
                }
              },
              (error) => {
                onIgnoredError?.(error);
                if (initialContent) {
                  setDefaultContent(initialContent);
                }
              },
            ),
          );
        },
        () => setStatus(StatusValues.Idle),
      );
      await saveAfterMutated();
    }
    return persister;
  };

  const runAutoLoadAfterSave = async (): Promise<void> => {
    const generation = autoLoadAfterSaveGeneration;
    autoLoadAfterSaveGeneration = 0;
    if (generation && generation == autoLoadGeneration && !destroyed) {
      if (status == StatusValues.Saving) {
        autoLoadAfterSaveGeneration = generation;
      } else {
        await load();
      }
    }
  };

  const startAutoLoad = async (
    initialContent?: Content | (() => Content),
  ): Promise<Persister<Persist>> => {
    const generation = ++autoLoadGeneration;
    let initialLoadPending = true;
    await stopAutoLoad(true);
    if (generation == autoLoadGeneration && !destroyed) {
      const listenerPromise = tryCatch(async () => {
        const handle = await addPersisterListener(async (content, changes) => {
          if (generation == autoLoadGeneration && !destroyed) {
            if (changes || content) {
              const shouldSchedule =
                initialLoadPending ||
                status == StatusValues.Saving ||
                !!pendingScheduledAutoLoads;
              pendingAutoLoads++;
              if (shouldSchedule) {
                pendingScheduledAutoLoads++;
              }
              await tryFinallyAsync(
                async () => {
                  setStatus(StatusValues.Loading);
                  loads++;
                  await (shouldSchedule
                    ? schedule(() => setContentOrChanges(changes ?? content))
                    : tryFinally(
                        () => setContentOrChanges(changes ?? content),
                        () => setStatus(StatusValues.Idle),
                      ));
                },
                () => {
                  if (shouldSchedule) {
                    pendingScheduledAutoLoads--;
                  }
                  if (!--pendingAutoLoads) {
                    setStatus(StatusValues.Idle);
                  }
                },
              );
              if (!pendingAutoLoads) {
                await saveAfterMutated();
              }
            } else if (status == StatusValues.Saving) {
              autoLoadAfterSaveGeneration = generation;
            } else {
              await load();
            }
          }
        });
        if (generation == autoLoadGeneration && !destroyed) {
          autoLoadHandle = handle;
        } else if (!isUndefined(handle)) {
          await delPersisterListener(handle);
        }
      }, onIgnoredError);
      await trackAutoLoadPromise(listenerPromise);
      if (generation == autoLoadGeneration && !destroyed) {
        await tryFinallyAsync(
          () => load(initialContent),
          () => {
            initialLoadPending = false;
          },
        );
      }
    }
    return persister;
  };

  const stopAutoLoad = async (
    keepGeneration = false,
  ): Promise<Persister<Persist>> => {
    autoLoadAfterSaveGeneration = 0;
    if (!keepGeneration) {
      autoLoadGeneration++;
    }
    const listenerPromise = autoLoadPromise;
    const handle = autoLoadHandle;
    autoLoadHandle = undefined;
    await trackAutoLoadPromise(
      tryFinallyAsync(
        async () => {
          await listenerPromise;
        },
        async () => {
          if (!isUndefined(handle)) {
            await tryCatch(() => delPersisterListener(handle), onIgnoredError);
          }
        },
      ),
    );
    return persister;
  };

  const isAutoLoading = () => !isUndefined(autoLoadHandle);

  const save = async (
    changes?: PersistedChanges<
      Persist,
      IsSynchronizer extends 1 ? false : true
    >,
  ): Promise<Persister<Persist>> => {
    /*! istanbul ignore else */
    if (status != StatusValues.Loading) {
      await tryFinallyAsync(
        () =>
          tryFinallyAsync(
            async () => {
              setStatus(StatusValues.Saving);
              saves++;
              await schedule(() =>
                tryCatch(
                  () => setPersisted(getContent as any, changes),
                  onIgnoredError,
                ),
              );
            },
            () => setStatus(StatusValues.Idle),
          ),
        runAutoLoadAfterSave,
      );
    }
    return persister;
  };

  const startAutoSave = async (): Promise<Persister<Persist>> => {
    const generation = ++autoSaveGeneration;
    await stopAutoSave(true);
    if (generation == autoSaveGeneration && !destroyed) {
      await save();
      if (generation == autoSaveGeneration && !destroyed) {
        autoSaveListenerId = store.addDidFinishTransactionListener(() => {
          if (generation == autoSaveGeneration && !destroyed) {
            const changes = getChanges() as any;
            if (hasChanges(changes)) {
              void tryCatch(() => save(changes));
            }
          }
        });
      }
    }
    return persister;
  };

  const stopAutoSave = async (
    keepGeneration = false,
  ): Promise<Persister<Persist>> => {
    if (!keepGeneration) {
      autoSaveGeneration++;
    }
    const listenerId = autoSaveListenerId;
    autoSaveListenerId = undefined;
    if (!isUndefined(listenerId)) {
      store.delListener(listenerId);
    }
    return persister;
  };

  const isAutoSaving = () => !isUndefined(autoSaveListenerId);

  const startAutoPersisting = async (
    initialContent?: Content | (() => Content),
    startSaveFirst = false,
  ): Promise<Persister<Persist>> => {
    const [call1, call2] = startSaveFirst
      ? [startAutoSave, startAutoLoad]
      : [startAutoLoad, startAutoSave];
    await call1(initialContent);
    await call2(initialContent);
    return persister;
  };

  const stopAutoPersisting = async (
    stopSaveFirst = false,
  ): Promise<Persister<Persist>> => {
    const [call1, call2] = stopSaveFirst
      ? [stopAutoSave, stopAutoLoad]
      : [stopAutoLoad, stopAutoSave];
    await tryFinallyAsync(
      () => call1(),
      async () => {
        await call2();
      },
    );
    return persister;
  };

  const getStatus = (): StatusValues => status;

  const addStatusListener = (listener: StatusListener): Id =>
    addListener(listener, statusListeners);

  const delListener = (listenerId: Id): Store => {
    delListenerImpl(listenerId);
    return store;
  };

  const schedule = async (...actions: Action[]): Promise<Persister> => {
    let failed = false;
    let firstError: any;
    const completion = promiseNew<void>((resolve) =>
      !isEmpty(actions)
        ? arrayPush(
            mapGet(scheduleActions, scheduleId) as ScheduledAction[],
            ...arrayMap(actions, (action, index): ScheduledAction => {
              const last = index == size(actions) - 1;
              return [
                async () => {
                  let completeActiveAction!: () => void;
                  activeAction = promiseNew(
                    (resolve) => (completeActiveAction = resolve),
                  );
                  await tryFinallyAsync(
                    async () => {
                      try {
                        await tryCatch(action, onIgnoredError);
                      } catch (error) {
                        if (!failed) {
                          failed = true;
                          firstError = error;
                        }
                      }
                      if (last) {
                        resolve();
                      }
                    },
                    () => {
                      activeAction = undefined;
                      completeActiveAction();
                    },
                  );
                },
                last ? resolve : undefined,
                scheduleOwner,
              ];
            }),
          )
        : resolve(),
    );
    await run();
    await completion;
    if (failed) {
      throw firstError;
    }
    return persister;
  };

  const getStore = (): Store => store;

  const destroy = async (): Promise<Persister<Persist>> => {
    if (isUndefined(destroying)) {
      destroyed = 1;
      destroying = (async () => {
        const scheduledActions = mapGet(
          scheduleActions,
          scheduleId,
        ) as ScheduledAction[];
        const remainingActions = arrayFilter(
          scheduledActions,
          ([, complete, owner]) => {
            if (owner == scheduleOwner) {
              complete?.();
              return false;
            }
            return true;
          },
        );
        const actionToAwait = activeAction;
        arrayClear(scheduledActions);
        arrayPush(scheduledActions, ...remainingActions);
        await tryFinallyAsync(
          () =>
            tryFinallyAsync(
              () => tryFinallyAsync(stopAutoPersisting, () => actionToAwait),
              () => extraDestroy?.(),
            ),
          () => {
            const references =
              (mapGet(scheduleReferences, scheduleId) ?? 1) - 1;
            mapSet(scheduleReferences, scheduleId, references || undefined);
            pruneSchedule();
          },
        );
      })();
    }
    await destroying;
    return persister;
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

    startAutoPersisting,
    stopAutoPersisting,

    getStatus,
    addStatusListener,
    delListener,

    schedule,
    getStore,
    getStats,
    ...extra,
    destroy,
  };

  return objFreeze(persister as Persister<Persist>);
};
