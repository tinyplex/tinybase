/** @jsx createElement */

import {OPEN_VALUE, POSITIONS, POSITION_VALUE, TITLE} from './common';
import {CURRENT_TARGET} from '../common/strings';
import {StoreProp} from './types';
import {arrayMap} from '../common/array';
import {createElement} from '../ui-react/common';
import {usePosition} from './hooks';
import {useSetValueCallback} from '../ui-react';

export const Header = ({s}: StoreProp) => {
  const position = usePosition(s);

  const handleClose = useSetValueCallback(OPEN_VALUE, () => false, [], s);
  const handleDock = useSetValueCallback(
    POSITION_VALUE,
    (event: React.MouseEvent<HTMLImageElement>) =>
      Number(event[CURRENT_TARGET].dataset.id),
    [],
    s,
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
