/** @jsx createElement */

import {useOpen, usePosition} from './hooks';
import {Body} from './Body';
import {Header} from './Header';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';

export const Panel = ({s}: StoreProp) => {
  const position = usePosition(s);
  const open = useOpen(s);

  return open ? (
    <main data-position={position}>
      <Header s={s} />
      <Body s={s} />
    </main>
  ) : null;
};
