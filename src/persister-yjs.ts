import * as Y from 'yjs';
import {Callback, Json} from './types/common.d';
import {Persister} from './types/persisters.d';
import {Store} from './types/store.d';
import {createCustomPersister} from './persisters/common';

export const createYjsPersister = (store: Store, yDoc: Y.Doc): Persister => {
  const map = yDoc.getMap('tinybase/store');

  const getPersisted = async (): Promise<string | null | undefined> =>
    map.get('json') as string;

  const setPersisted = async (getJson: () => Json): Promise<void> => {
    map.set('json', getJson());
  };

  const startListeningToPersisted = (didChange: Callback): Callback => {
    const observer = () => didChange();
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
