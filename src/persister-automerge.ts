import {GetTransactionChanges, Store, Tables, Values} from './types/store';
import {Persister, PersisterListener} from './types/persisters';
import {DocHandle} from 'automerge-repo';
import {createCustomPersister} from './persisters';

type Observer = () => void;


export const createAutomergePersister = (
  store: Store,
  docHandle: DocHandle<any>,
  _docMapName = 'tinybase',
): Persister => {

  const getPersisted = async (): Promise<[Tables, Values] | undefined> =>
    undefined;

  const setPersisted = async (
    _getContent: () => [Tables, Values],
    _getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> => {
  };

  const addPersisterListener = (listener: PersisterListener): Observer => {
    const observer: Observer = (...args) => {
      listener();
    };
    docHandle.on('change', observer);
    return observer;
  };

  const delPersisterListener = (observer: Observer): void => {
    docHandle.removeListener('change', observer);
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
};
