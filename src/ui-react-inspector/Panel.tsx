import {OPEN_VALUE, POSITION_VALUE} from '../common/inspector/common.ts';
import type {StoreProp} from '../common/inspector/types.ts';
import {useValue} from '../ui-react/index.ts';
import {Body} from './Body.tsx';
import {ErrorBoundary} from './ErrorBoundary.tsx';
import {Header} from './Header.tsx';

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
