/** @jsx createElement */

import {OPEN_VALUE, POSITION_VALUE} from './common.ts';
import {Body} from './Body.tsx';
import {ErrorBoundary} from './ErrorBoundary.tsx';
import {Header} from './Header.tsx';
import type {StoreProp} from './types.ts';
import {createElement} from '../common/react.ts';
import {useValue} from '../ui-react/index.ts';

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
