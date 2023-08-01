/** @jsx createElement */

import {POSITIONS, TITLE} from './common';
import {useCreatePersister, useCreateStore} from '../ui-react';
import {APP_STYLE} from './style';
import {Nub} from './Nub';
import {Panel} from './Panel';
import {StoreInspectorProps} from '../types/ui-react-dom';
import {createElement} from '../ui-react/common';
import {createSessionPersister} from '../persisters/persister-browser';
import {createStore} from '../store';

export const App = ({
  position = 'right',
  open = false,
}: StoreInspectorProps) => {
  const store = useCreateStore(createStore);
  const index = POSITIONS.indexOf(position);

  useCreatePersister(
    store,
    (store) => createSessionPersister(store, TITLE),
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
    <div style={APP_STYLE}>
      <Nub s={store} />
      <Panel s={store} />
    </div>
  );
};
