/** @jsx createElement */
/** @jsxFrag Fragment */

import {Fragment, createElement} from '../common/react.ts';
import {POSITIONS, UNIQUE_ID} from './common.ts';
import {useCreatePersister, useCreateStore} from '../ui-react/index.ts';
import {APP_STYLESHEET} from './style.ts';
import type {InspectorProps} from '../@types/ui-react-inspector/index.d.ts';
import {Nub} from './Nub.tsx';
import {Panel} from './Panel.tsx';
import {createSessionPersister} from '../persisters/persister-browser/index.ts';
import {createStore} from '../store/index.ts';

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
