import {OPEN_VALUE, POSITION_VALUE, TITLE} from './common.ts';
import {useSetValueCallback, useValue} from '../ui-react/index.ts';
import React from 'react';
import type {StoreProp} from './types.ts';

export const Nub = ({s}: StoreProp) => {
  const position = useValue(POSITION_VALUE, s) ?? 1;
  const handleOpen = useSetValueCallback(OPEN_VALUE, () => true, [], s);

  return useValue(OPEN_VALUE, s) ? null : (
    <img onClick={handleOpen} title={TITLE} data-position={position} />
  );
};
