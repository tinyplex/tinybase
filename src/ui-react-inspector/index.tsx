import type {InspectorProps} from '../@types/ui-react-inspector/index.d.ts';
import {createSessionPersister} from '../persisters/persister-browser/index.ts';
import {createStore} from '../store/index.ts';
import {useCreatePersister, useCreateStore} from '../ui-react/index.ts';
import {Nub} from './Nub.tsx';
import {Panel} from './Panel.tsx';
import {POSITIONS, UNIQUE_ID} from './common.ts';
import {APP_STYLESHEET} from './style.ts';

export const Inspector = ({
  position = 'right',
  open = false,
  hue = 8,
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
      <style>
        {`#${UNIQUE_ID}{--hue:${hue}}`}
        {APP_STYLESHEET}
      </style>
    </>
  );
};
