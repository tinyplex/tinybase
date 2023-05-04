import * as Y from 'yjs';
import {Store, Tables, Values} from './types/store.d';
import {Callback} from './types/common.d';
import {Persister} from './types/persisters.d';
import {createCustomPersister} from './persisters/common';
import {jsonString} from './common/other';

export const createYjsPersister = (store: Store, yDoc: Y.Doc): Persister => {
  const map = yDoc.getMap('tinybase/store');

  const getPersisted = async (): Promise<string | null | undefined> =>
    map.get('json') as string;

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    map.set('json', jsonString(getContent()));
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
