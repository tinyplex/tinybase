/** @jsx createElement */

import {BOTTOM_LEFT, BOTTOM_RIGHT, TOP_RIGHT} from './style';
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
    <img
      onClick={handleOpen}
      title={TITLE}
      style={[TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT][position]}
    />
  );
};
