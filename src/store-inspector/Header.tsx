/** @jsx createElement */

import {CLOSE_SVG, LOGO_SVG, POSITIONS_SVG} from './svg';
import {HEADER_STYLE, TITLE_STYLE} from './style';
import {POSITIONS, TITLE, createElement} from './common';
import {Button} from './Button';
import {StoreProp} from './types';
import {arrayMap} from '../common/array';
import {getUndefined} from '../common/other';
import {usePosition} from './hooks';
import {useSetValueCallback} from '../ui-react';

export const Header = ({store}: StoreProp) => {
  const position = usePosition(store);

  const handleClose = useSetValueCallback('open', () => false, [], store);
  const handleDock = useSetValueCallback(
    'position',
    (position: number) => position,
    [],
    store,
  );

  return (
    <div style={HEADER_STYLE}>
      <Button onClick={getUndefined} tooltip={TITLE} svg={LOGO_SVG} />
      <span style={TITLE_STYLE}>{TITLE}</span>
      {arrayMap(POSITIONS, (name, p) =>
        p == position ? null : (
          <Button
            // eslint-disable-next-line react/jsx-no-bind
            onClick={() => handleDock(p)}
            svg={POSITIONS_SVG[p]}
            tooltip={'Dock to ' + name}
            key={p}
          />
        ),
      )}
      <Button tooltip="Close" onClick={handleClose} svg={CLOSE_SVG} />
    </div>
  );
};
