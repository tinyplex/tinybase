/** @jsx createElement */

import {useOpen, usePosition} from './hooks';
import React from 'react';
import {Store} from '../types/store';
import {getNubStyle} from './styles';
import {useSetValueCallback} from '../ui-react';

const {createElement} = React;

export const Nub = ({store}: {readonly store: Store}) => {
  const position = usePosition(store);
  const open = useOpen(store);

  const handleOpen = useSetValueCallback('open', () => true, [], store);
  return open ? null : (
    <button style={getNubStyle(position)} onClick={handleOpen}>
      T
    </button>
  );
};
