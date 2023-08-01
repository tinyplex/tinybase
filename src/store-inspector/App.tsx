/** @jsx createElement */
/** @jsxFrag React.Fragment */

import {POSITIONS, UNIQUE_ID} from './common';
import {useCreatePersister, useCreateStore} from '../ui-react';
import {APP_STYLESHEET} from './style';
import {Nub} from './Nub';
import {Panel} from './Panel';
import React from 'react';
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
    (store) => createSessionPersister(store, UNIQUE_ID),
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
    <>
      <style>{APP_STYLESHEET}</style>
      <aside id={UNIQUE_ID}>
        <Nub s={store} />
        <Panel s={store} />
      </aside>
    </>
  );
};
