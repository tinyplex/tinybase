/** @jsx createElement */

import {OPEN_VALUE, TITLE} from './common';
import {useOpen, usePosition} from './hooks';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';
import {useSetValueCallback} from '../ui-react';

export const Nub = ({s}: StoreProp) => {
  const position = usePosition(s);
  const open = useOpen(s);

  const handleOpen = useSetValueCallback(OPEN_VALUE, () => true, [], s);
  return open ? null : (
    <img onClick={handleOpen} title={TITLE} data-position={position} />
  );
};
