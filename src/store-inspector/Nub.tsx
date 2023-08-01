/** @jsx createElement */

import {useOpen, usePosition} from './hooks';
import {Button} from './Button';
import {StoreProp} from './types';
import {createElement} from './common';
import {getNubStyle} from './styles';
import {logoSvg} from './svg';
import {useSetValueCallback} from '../ui-react';

export const Nub = ({store}: StoreProp) => {
  const position = usePosition(store);
  const open = useOpen(store);

  const handleOpen = useSetValueCallback('open', () => true, [], store);
  return open ? null : (
    <Button
      onClick={handleOpen}
      tooltip="TinyBase Store Inspector"
      svg={logoSvg}
      style={getNubStyle(position)}
    />
  );
};
