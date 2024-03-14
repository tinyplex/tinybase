import {Changes, Content, Store, Tables, Values} from './types/store.d';
import {DEBUG, ifNotUndefined, isString, isUndefined} from './common/other';
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

const isMergeable = (
  contentOrChanges:
    | Content
    | MergeableContent
    | Changes
    | MergeableChanges
    | undefined,
) => isString(contentOrChanges?.[0]);

const getStoreFunctions = (
  supportsMergeableStore: boolean | undefined,
  store: MergeableStore,
):
  | [
      isMergeableStore: 0,
      getContent: () => Content,
      getChanges: () => Changes,
      hasChanges: (changes: Changes) => boolean,
    ]
  | [
      isMergeableStore: 1,
      getContent: () => MergeableContent,
      getChanges: () => MergeableChanges,
      hasChanges: (changes: MergeableChanges) => boolean,
    ] =>
  !supportsMergeableStore || isUndefined(store.getMergeableContent)
    ? [
        0,
        store.getContent,
        store.getTransactionChanges,
        ([changedTables, changedValues]: Changes) =>
          !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
      ]
    : [
        1,
        () => store.getMergeableContent(true),
        store.getTransactionMergeableChanges,
        ([, [[, changedTables], [, changedValues]]]: MergeableChanges) =>
          !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
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
    getChanges?: () => Changes,
  ) => Promise<void>,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError?: (error: any) => void,
  supportsMergeableStore?: SupportsMergeableStore,
  // undocumented:
  [getThing, thing]: [string?, unknown?] = [],
  scheduleId = [],
): Persister<SupportsMergeableStore> => {
  let listenerId: Id | undefined;
  let loadSave = 0;
  let loads = 0;
  let saves = 0;
  let listening = 0;
  let action;
  let listeningHandle: ListeningHandle | undefined;

  mapEnsure(scheduleRunning, scheduleId, () => 0);
  mapEnsure(scheduleActions, scheduleId, () => []);

  const [isMergeableStore, getContent, getChanges, hasChanges] =
    getStoreFunctions(supportsMergeableStore, store as MergeableStore);

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

  const loadLock = async (actions: Action): Promise<Persister> => {
    /*! istanbul ignore else */
    if (loadSave != 2) {
      loadSave = 1;
      if (DEBUG) {
        loads++;
      }
      await persister.schedule(async () => {
        await actions();
        loadSave = 0;
      });
    }
    return persister;
  };

  const persister: any = {
    load: async (
      initialTables?: Tables,
      initialValues?: Values,
    ): Promise<Persister> =>
      await loadLock(async () => {
        try {
          const content = (await getPersisted()) as any;
          (isMergeableStore && isMergeable(content)
            ? (store as MergeableStore).setMergeableContent
            : store.setContent)(content);
        } catch {
          store.setContent([initialTables, initialValues] as Content);
        }
      }),

    startAutoLoad: async (
      initialTables: Tables = {},
      initialValues: Values = {},
    ): Promise<Persister> => {
      persister.stopAutoLoad();
      await persister.load(initialTables, initialValues);
      listening = 1;
      listeningHandle = addPersisterListener(async (getContent, getChanges) => {
        if (getChanges) {
          const changes = getChanges();
          await loadLock(async () =>
            (isMergeableStore && isMergeable(changes)
              ? (store as MergeableStore).applyMergeableChanges
              : store.applyChanges)(changes as Changes & MergeableChanges),
          );
        } else {
          await loadLock(async () => {
            try {
              const content = getContent?.() ?? (await getPersisted());
              (isMergeableStore && isMergeable(content)
                ? (store as MergeableStore).setMergeableContent
                : store.setContent)(content as Content & MergeableContent);
            } catch (error) {
              onIgnoredError?.(error);
            }
          });
        }
      });
      return persister;
    },

    stopAutoLoad: (): Persister => {
      if (listening) {
        delPersisterListener(listeningHandle as ListeningHandle);
        listeningHandle = undefined;
        listening = 0;
      }
      return persister;
    },

    save: async (getChanges?: () => Changes): Promise<Persister> => {
      /*! istanbul ignore else */
      if (loadSave != 1) {
        loadSave = 2;
        if (DEBUG) {
          saves++;
        }
        await persister.schedule(async () => {
          try {
            await setPersisted(getContent as any, getChanges);
          } catch (error) {
            /*! istanbul ignore next */
            onIgnoredError?.(error);
          }
          loadSave = 0;
        });
      }
      return persister;
    },

    startAutoSave: async (): Promise<Persister> => {
      await persister.stopAutoSave().save();
      listenerId = store.addDidFinishTransactionListener(() => {
        const changes = getChanges();
        if (hasChanges(changes as any)) {
          persister.save(() => changes);
        }
      });
      return persister;
    },

    stopAutoSave: (): Persister => {
      ifNotUndefined(listenerId, store.delListener);
      listenerId = undefined;
      return persister;
    },

    schedule: async (...actions: Action[]): Promise<Persister> => {
      arrayPush(mapGet(scheduleActions, scheduleId) as Action[], ...actions);
      await run();
      return persister;
    },

    getStore: (): Store => store,

    destroy: (): Persister => persister.stopAutoLoad().stopAutoSave(),

    getStats: (): PersisterStats => (DEBUG ? {loads, saves} : {}),
  };

  if (getThing) {
    persister[getThing] = () => thing;
  }

  return objFreeze(persister as Persister<SupportsMergeableStore>);
};
