/** @jsx createElement */

import {Button} from './Button';
import {StoreProp} from './types';
import {createElement} from './common';
import {getHeaderStyle} from './styles';
import {getUndefined} from '../common/other';
import {logoSvg} from './svg';
import {usePosition} from './hooks';
import {useSetValueCallback} from '../ui-react';

export const Header = ({store}: StoreProp) => {
  const position = usePosition(store);

  const handleClose = useSetValueCallback('open', () => false, [], store);
  const handleMove = useSetValueCallback(
    'position',
    () => (position + 1) % 4,
    [position],
    store,
  );

  return (
    <div style={getHeaderStyle()}>
      <Button
        onClick={getUndefined}
        tooltip="TinyBase Store Inspector"
        svg={logoSvg}
      />
      <button onClick={handleMove}>Move</button>
      <button onClick={handleClose}>Shut</button>
    </div>
  );
};
