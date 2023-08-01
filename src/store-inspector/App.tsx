import {useCreatePersister, useCreateStore, useValues} from '../ui-react';
import {StoreInspectorProps} from '../types/ui-react-dom';
import {createSessionPersister} from '../persisters/persister-browser';
import {createStore} from '../store';
import {jsonString} from '../common/json';

export const App = ({position = 'bottom'}: StoreInspectorProps) => {
  const store = useCreateStore(createStore);
  useCreatePersister(
    store,
    (store) => createSessionPersister(store, 'tinybaseStoreInspector'),
    undefined,
    async (persister) => {
      await persister.load(undefined, {position});
      await persister.startAutoSave();
    },
  );

  return jsonString(useValues(store));
};
