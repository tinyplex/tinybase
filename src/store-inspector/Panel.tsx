/** @jsx createElement */

import {useOpen, usePosition} from './hooks';
import React from 'react';
import {Store} from '../types/store';
import {getPanelStyle} from './styles';
import {useSetValueCallback} from '../ui-react';

const {createElement} = React;

export const Panel = ({store}: {readonly store: Store}) => {
  const position = usePosition(store);
  const open = useOpen(store);

  const handleClose = useSetValueCallback('open', () => false, [], store);
  const handleMove = useSetValueCallback(
    'position',
    () => (position + 1) % 4,
    [position],
    store,
  );

  return open ? (
    <div style={getPanelStyle(position)}>
      TinyBase
      <button onClick={handleMove}>Move</button>
      <button onClick={handleClose}>Shut</button>
    </div>
  ) : null;
};
