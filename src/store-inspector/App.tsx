/** @jsx createElement */

import {useCreatePersister, useCreateStore} from '../ui-react';
import {Nub} from './Nub';
import {Panel} from './Panel';
import {StoreInspectorProps} from '../types/ui-react-dom';
import {createElement} from './common';
import {createSessionPersister} from '../persisters/persister-browser';
import {createStore} from '../store';
import {getAppStyle} from './styles';

export const App = ({
  position = 'right',
  open = false,
}: StoreInspectorProps) => {
  const store = useCreateStore(createStore);
  const index = ['top', 'right', 'bottom', 'left'].indexOf(position);

  useCreatePersister(
    store,
    (store) => createSessionPersister(store, 'tinybaseStoreInspector'),
    undefined,
    async (persister) => {
      await persister.load(undefined, {
        position: index == -1 ? 1 : index,
        open: !!open,
      });
      await persister.startAutoSave();
    },
  );

  return (
    <div style={getAppStyle()}>
      <Nub store={store} />
      <Panel store={store} />
    </div>
  );
};
