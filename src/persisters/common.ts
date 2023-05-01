import {Callback, Id} from '../types/common.d';
import {DEBUG, ifNotUndefined, isUndefined} from '../common/other';
import {Persister, PersisterStats} from '../types/persisters.d';
import {Store, Tables, Values} from '../types/store.d';
import {EMPTY_STRING} from '../common/strings';
import {objFreeze} from '../common/obj';

export const createCustomPersister = <ListeningHandle>(
  store: Store,
  getPersisted: () => Promise<string | null | undefined>,
  setPersisted: (json: string) => Promise<void>,
  startListeningToPersisted: (didChange: Callback) => ListeningHandle,
  stopListeningToPersisted: (listeningHandle: ListeningHandle) => void,
): Persister => {
  let tablesListenerId: Id | undefined;
  let valuesListenerId: Id | undefined;
  let loadSave = 0;
  let loads = 0;
  let saves = 0;

  let listening = false;
  let listeningHandle: ListeningHandle | undefined;

  const persister: Persister = {
    load: async (
      initialTables: Tables = {},
      initialValues: Values = {},
    ): Promise<Persister> => {
      /*! istanbul ignore else */
      if (loadSave != 2) {
        loadSave = 1;
        if (DEBUG) {
          loads++;
        }
        const body = await getPersisted();
        if (!isUndefined(body) && body != EMPTY_STRING) {
          store.setJson(body);
        } else {
          store.transaction(() =>
            store.setTables(initialTables).setValues(initialValues),
          );
        }
        loadSave = 0;
      }
      return persister;
    },

    startAutoLoad: async (
      initialTables: Tables = {},
      initialValues: Values = {},
    ): Promise<Persister> => {
      persister.stopAutoLoad();
      await persister.load(initialTables, initialValues);
      listening = true;
      listeningHandle = startListeningToPersisted(persister.load);
      return persister;
    },

    stopAutoLoad: (): Persister => {
      if (listening) {
        stopListeningToPersisted(listeningHandle as ListeningHandle);
        listeningHandle = undefined;
        listening = false;
      }
      return persister;
    },

    save: async (): Promise<Persister> => {
      /*! istanbul ignore else */
      if (loadSave != 1) {
        loadSave = 2;
        if (DEBUG) {
          saves++;
        }
        await setPersisted(store.getJson());
        loadSave = 0;
      }
      return persister;
    },

    startAutoSave: async (): Promise<Persister> => {
      await persister.stopAutoSave().save();
      tablesListenerId = store.addTablesListener(persister.save);
      valuesListenerId = store.addValuesListener(persister.save);
      return persister;
    },

    stopAutoSave: (): Persister => {
      ifNotUndefined(tablesListenerId, store.delListener);
      ifNotUndefined(valuesListenerId, store.delListener);
      return persister;
    },

    getStore: (): Store => store,

    destroy: (): Persister => persister.stopAutoLoad().stopAutoSave(),

    getStats: (): PersisterStats => (DEBUG ? {loads, saves} : {}),
  };

  return objFreeze(persister);
};
