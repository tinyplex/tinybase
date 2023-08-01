/** @jsx createElement */

import {POSITIONS, TITLE, createElement} from './common';
import {useCreatePersister, useCreateStore} from '../ui-react';
import {APP_STYLE} from './style';
import {Nub} from './Nub';
import {Panel} from './Panel';
import {StoreInspectorProps} from '../types/ui-react-dom';
import {createSessionPersister} from '../persisters/persister-browser';
import {createStore} from '../store';

export const App = ({
  position = 'right',
  open = false,
}: StoreInspectorProps) => {
  const s = useCreateStore(createStore);
  const index = POSITIONS.indexOf(position);

  useCreatePersister(
    s,
    (s) => createSessionPersister(s, TITLE),
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
      <Nub s={s} />
      <Panel s={s} />
    </div>
  );
};
