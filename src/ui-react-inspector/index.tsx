/** @jsx createElement */
/** @jsxFrag Fragment */

import {Fragment, createElement} from '../common/react';
import {POSITIONS, UNIQUE_ID} from './common';
import {useCreatePersister, useCreateStore} from '../ui-react';
import {APP_STYLESHEET} from './style';
import type {InspectorProps} from '../@types/ui-react-inspector';
import {Nub} from './Nub';
import {Panel} from './Panel';
import {createSessionPersister} from '../persisters/persister-browser';
import {createStore} from '../store';

export const Inspector = ({
  position = 'right',
  open = false,
}: InspectorProps) => {
  const s = useCreateStore(createStore); // The inspector's Store throughout.
  const index = POSITIONS.indexOf(position);

  useCreatePersister(
    s,
    (s) => createSessionPersister(s, UNIQUE_ID),
    undefined,
    async (persister) => {
      await persister.load([
        {},
        {
          position: index == -1 ? 1 : index,
          open: !!open,
        },
      ]);
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
