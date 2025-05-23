import type {MouseEvent} from 'react';
import {arrayMap} from '../common/array.ts';
import {CURRENT_TARGET} from '../common/strings.ts';
import {useSetValueCallback, useValue} from '../ui-react/index.ts';
import {OPEN_VALUE, POSITIONS, POSITION_VALUE, TITLE} from './common.ts';
import type {StoreProp} from './types.ts';

export const Header = ({s}: StoreProp) => {
  const position = useValue(POSITION_VALUE, s) ?? 1;
  const handleClose = useSetValueCallback(OPEN_VALUE, () => false, [], s);
  const handleDock = useSetValueCallback(
    POSITION_VALUE,
    (event: MouseEvent<HTMLImageElement>) =>
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
