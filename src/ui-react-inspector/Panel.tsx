/** @jsx createElement */

import {OPEN_VALUE, POSITION_VALUE} from './common';
import {Body} from './Body';
import {ErrorBoundary} from './ErrorBoundary';
import {Header} from './Header';
import type {StoreProp} from './types';
import {createElement} from '../common/react';
import {useValue} from '../ui-react';

export const Panel = ({s}: StoreProp) => {
  const position = useValue(POSITION_VALUE, s) ?? 1;

  return useValue(OPEN_VALUE, s) ? (
    <main data-position={position}>
      <Header s={s} />
      <ErrorBoundary>
        <Body s={s} />
      </ErrorBoundary>
    </main>
  ) : null;
};
