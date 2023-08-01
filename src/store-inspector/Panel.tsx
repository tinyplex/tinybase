/** @jsx createElement */

import {useOpen, usePosition} from './hooks';
import {Body} from './Body';
import {Header} from './Header';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';
import {getPanelStyle} from './style';

export const Panel = ({s: store}: StoreProp) => {
  const position = usePosition(store);
  const open = useOpen(store);

  return open ? (
    <main style={getPanelStyle(position)}>
      <Header s={store} />
      <Body s={store} />
    </main>
  ) : null;
};
