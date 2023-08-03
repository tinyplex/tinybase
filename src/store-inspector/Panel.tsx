/** @jsx createElement */

import {OPEN_VALUE, POSITION_VALUE} from './common';
import {Body} from './Body';
import {Header} from './Header';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';
import {useValue} from '../ui-react';

export const Panel = ({s}: StoreProp) => {
  const position = useValue(POSITION_VALUE, s) ?? 1;

  return useValue(OPEN_VALUE, s) ? (
    <main data-position={position}>
      <Header s={s} />
      <Body s={s} />
    </main>
  ) : null;
};
