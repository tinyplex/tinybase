import * as Y from 'yjs';
import {Persister, PersisterListener} from './types/persisters.d';
import {Store, Tables, Values} from './types/store.d';
import {Callback} from './types/common.d';
import {createCustomPersister} from './persisters';

export const createYjsPersister = (store: Store, yDoc: Y.Doc): Persister => {
  const map = yDoc.getMap('tinybase/store');

  const getPersisted = async (): Promise<[Tables, Values] | undefined> => {
    try {
      return JSON.parse(map.get('json') as string);
    } catch {}
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    map.set('json', JSON.stringify(getContent()));
  };

  const addPersisterListener = (listener: PersisterListener): Callback => {
    const observer = () => listener();
    map.observe(observer);
    return observer;
  };

  const delPersisterListener = (observer: Callback): void =>
    map.unobserve(observer);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
};
