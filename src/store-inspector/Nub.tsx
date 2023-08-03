/** @jsx createElement */

import {OPEN_VALUE, POSITION_VALUE, TITLE} from './common';
import {useSetValueCallback, useValue} from '../ui-react';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';

export const Nub = ({s}: StoreProp) => {
  const position = useValue(POSITION_VALUE, s) ?? 1;
  const handleOpen = useSetValueCallback(OPEN_VALUE, () => true, [], s);

  return useValue(OPEN_VALUE, s) ? null : (
    <img onClick={handleOpen} title={TITLE} data-position={position} />
  );
};
