/** @jsx createElement */

import {useOpen, usePosition} from './hooks';
import {Body} from './Body';
import {Header} from './Header';
import {StoreProp} from './types';
import {createElement} from './common';
import {getPanelStyle} from './style';

export const Panel = ({s}: StoreProp) => {
  const position = usePosition(s);
  const open = useOpen(s);

  return open ? (
    <div style={getPanelStyle(position)}>
      <Header s={s} />
      <Body s={s} />
    </div>
  ) : null;
};
