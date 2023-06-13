import {DEBUG, ifNotUndefined, isUndefined} from './common/other';
import {GetTransactionChanges, Store, Tables, Values} from './types/store.d';
import {
  Persister,
  PersisterListener,
  PersisterStats,
} from './types/persisters.d';
import {arrayPush, arrayShift} from './common/array';
import {Id} from './types/common.d';
import {objFreeze} from './common/obj';

type Action = () => Promise<any>;

export const createCustomPersister = <ListeningHandle>(
  store: Store,
  getPersisted: () => Promise<[Tables, Values] | undefined>,
  setPersisted: (
    getContent: () => [Tables, Values],
    getTransactionChanges?: GetTransactionChanges,
  ) => Promise<void>,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister => {
  let listenerId: Id | undefined;
  let loadSave = 0;
  let loads = 0;
  let saves = 0;
  let running = 0;
  let listening = 0;
  let action;
  let listeningHandle: ListeningHandle | undefined;

  const scheduledActions: Action[] = [];

  const run = async (): Promise<void> => {
    /*! istanbul ignore else */
    if (!running) {
      running = 1;
      while (!isUndefined((action = arrayShift(scheduledActions)))) {
        try {
          await action();
        } catch {}
      }
      running = 0;
    }
  };

  const loadLock = async (actions: Action) => {
    /*! istanbul ignore else */
    if (loadSave != 2) {
      loadSave = 1;
      if (DEBUG) {
        loads++;
      }
      await actions();
      loadSave = 0;
    }
  };

  const persister: any = {
    load: async (
      initialTables: Tables = {},
      initialValues: Values = {},
    ): Promise<Persister> => {
      await loadLock(async () => {
        try {
          store.setContent((await getPersisted()) as [Tables, Values]);
        } catch {
          store.setContent([initialTables, initialValues]);
        }
      });
      return persister;
    },

    startAutoLoad: async (
      initialTables: Tables = {},
      initialValues: Values = {},
    ): Promise<Persister> => {
      persister.stopAutoLoad();
      await persister.load(initialTables, initialValues);
      listening = 1;
      listeningHandle = addPersisterListener(
        async (getContent, getTransactionChanges) => {
          await loadLock(async () => {
            if (getTransactionChanges) {
              store.setTransactionChanges(getTransactionChanges());
            } else {
              try {
                store.setContent(
                  getContent?.() ??
                    ((await getPersisted()) as [Tables, Values]),
                );
              } catch {}
            }
          });
        },
      );
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

    save: async (
      getTransactionChanges?: GetTransactionChanges,
    ): Promise<Persister> => {
      await persister.schedule(async () => {
        /*! istanbul ignore else */
        if (loadSave != 1) {
          loadSave = 2;
          if (DEBUG) {
            saves++;
          }
          try {
            await setPersisted(store.getContent, getTransactionChanges);
          } catch {}
          loadSave = 0;
        }
      });
      return persister;
    },

    startAutoSave: async (): Promise<Persister> => {
      await persister.stopAutoSave().save();
      listenerId = store.addDidFinishTransactionListener(
        (_store, getTransactionChanges) => {
          const transactionChanges = getTransactionChanges();
          (persister.save as any)(() => transactionChanges);
        },
      );
      return persister;
    },

    stopAutoSave: (): Persister => {
      ifNotUndefined(listenerId, store.delListener);
      return persister;
    },

    getStore: (): Store => store,

    destroy: (): Persister => persister.stopAutoLoad().stopAutoSave(),

    getStats: (): PersisterStats => (DEBUG ? {loads, saves} : {}),

    schedule: async (...actions: Action[]): Promise<void> => {
      arrayPush(scheduledActions, ...actions);
      await run();
    },
  };

  return objFreeze(persister as Persister);
};
