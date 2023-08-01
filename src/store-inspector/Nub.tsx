/** @jsx createElement */

import {TITLE, createElement} from './common';
import {useOpen, usePosition} from './hooks';
import {Button} from './Button';
import {LOGO_SVG} from './svg';
import {StoreProp} from './types';
import {getNubStyle} from './style';
import {useSetValueCallback} from '../ui-react';

export const Nub = ({s}: StoreProp) => {
  const position = usePosition(s);
  const open = useOpen(s);

  const handleOpen = useSetValueCallback('open', () => true, [], s);
  return open ? null : (
    <Button
      onClick={handleOpen}
      tooltip={TITLE}
      svg={LOGO_SVG}
      style={getNubStyle(position)}
    />
  );
};
