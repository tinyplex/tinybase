import type {CSSProperties} from 'react';
import type {InspectorProps} from '../@types/ui-react-inspector/index.d.ts';
import {UNIQUE_ID, getInitialPosition} from '../common/inspector/common.ts';
import {APP_STYLESHEET} from '../common/inspector/style.ts';
import {createSessionPersister} from '../persisters/persister-browser/index.ts';
import {createStore} from '../store/index.ts';
import {useCreatePersister, useCreateStore} from '../ui-react/index.ts';
import {Nub} from './Nub.tsx';
import {Panel} from './Panel.tsx';

export const Inspector = ({
  position = 'right',
  open = false,
  hue = 270,
}: InspectorProps) => {
  const s = useCreateStore(createStore); // The inspector's Store throughout.

  useCreatePersister(
    s,
    (s) => createSessionPersister(s, UNIQUE_ID),
    undefined,
    async (persister) => {
      await persister.load([
        {},
        {
          position: getInitialPosition(position),
          open: !!open,
        },
      ]);
      await persister.startAutoSave();
    },
  );

  return (
    <>
      <aside id={UNIQUE_ID} style={{'--hue': hue} as CSSProperties}>
        <Nub s={s} />
        <Panel s={s} />
      </aside>
      <style>{APP_STYLESHEET}</style>
    </>
  );
};
