/** @jsx createElement */

import {POSITIONS, TITLE} from './common';
import {CURRENT_TARGET} from '../common/strings';
import {StoreProp} from './types';
import {arrayMap} from '../common/array';
import {createElement} from '../ui-react/common';
import {usePosition} from './hooks';
import {useSetValueCallback} from '../ui-react';

export const Header = ({s: inspectorStore}: StoreProp) => {
  const position = usePosition(inspectorStore);

  const handleClose = useSetValueCallback(
    'open',
    () => false,
    [],
    inspectorStore,
  );
  const handleDock = useSetValueCallback(
    'position',
    (event: React.MouseEvent<HTMLImageElement>) =>
      Number(event[CURRENT_TARGET].dataset.id),
    [],
    inspectorStore,
  );

  return (
    <header>
      <img title={TITLE} />
      <span>{TITLE}</span>
      {arrayMap(POSITIONS, (name, p) =>
        p == position ? null : (
          <img
            onClick={handleDock}
            data-id={p}
            title={'Dock to ' + name}
            key={p}
          />
        ),
      )}
      <img onClick={handleClose} title="Close" />
    </header>
  );
};
