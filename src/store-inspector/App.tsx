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
  const s = useCreateStore(createStore); // The inspector's Store throughout.
  const index = POSITIONS.indexOf(position);

  useCreatePersister(
    s,
    (s) => createSessionPersister(s, UNIQUE_ID),
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
      <aside id={UNIQUE_ID}>
        <Nub s={s} />
        <Panel s={s} />
      </aside>
      <style>{APP_STYLESHEET}</style>
    </>
  );
};
