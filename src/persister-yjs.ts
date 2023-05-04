import * as Y from 'yjs';
import {Persister, PersisterListener} from './types/persisters.d';
import {Store, Tables, Values} from './types/store.d';
import {Callback} from './types/common.d';
import {createCustomPersister} from './persisters/common';

export const createYjsPersister = (store: Store, yDoc: Y.Doc): Persister => {
  const map = yDoc.getMap('tinybase/store');

  const getPersisted = async (): Promise<string | null | undefined> =>
    map.get('json') as string;

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    map.set('json', JSON.stringify(getContent()));
  };

  const startListeningToPersisted = (listener: PersisterListener): Callback => {
    const observer = () => listener();
    map.observe(observer);
    return observer;
  };

  const stopListeningToPersisted = (observer: Callback): void =>
    map.unobserve(observer);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    startListeningToPersisted,
    stopListeningToPersisted,
  );
};
