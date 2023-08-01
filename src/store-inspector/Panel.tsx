/** @jsx createElement */

import {
  BOTTOM_LEFT,
  HORIZONTAL_PANEL,
  TOP_RIGHT,
  VERTICAL_PANEL,
} from './style';
import {useOpen, usePosition} from './hooks';
import {Body} from './Body';
import {Header} from './Header';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';
import {objMerge} from '../common/obj';

export const Panel = ({s: store}: StoreProp) => {
  const position = usePosition(store);
  const open = useOpen(store);

  return open ? (
    <main
      style={objMerge(
        [TOP_RIGHT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_LEFT][position],
        [HORIZONTAL_PANEL, VERTICAL_PANEL][position % 2],
      )}
    >
      <Header s={store} />
      <Body s={store} />
    </main>
  ) : null;
};
