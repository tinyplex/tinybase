/** @jsx createElement */

import {useOpen, usePosition} from './hooks';
import {StoreProp} from './types';
import {TITLE} from './common';
import {createElement} from '../ui-react/common';
import {useSetValueCallback} from '../ui-react';

export const Nub = ({s}: StoreProp) => {
  const position = usePosition(s);
  const open = useOpen(s);

  const handleOpen = useSetValueCallback('open', () => true, [], s);
  return open ? null : (
    <img onClick={handleOpen} title={TITLE} data-position={position} />
  );
};
