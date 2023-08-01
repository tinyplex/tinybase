/** @jsx createElement */

import {POSITIONS, TITLE} from './common';
import {CURRENT_TARGET} from '../common/strings';
import {StoreProp} from './types';
import {arrayMap} from '../common/array';
import {createElement} from '../ui-react/common';
import {usePosition} from './hooks';
import {useSetValueCallback} from '../ui-react';

export const Header = ({s: store}: StoreProp) => {
  const position = usePosition(store);

  const handleClose = useSetValueCallback('open', () => false, [], store);
  const handleDock = useSetValueCallback(
    'position',
    (event: React.MouseEvent<HTMLImageElement>) =>
      Number(event[CURRENT_TARGET].dataset.id),
    [],
    store,
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
