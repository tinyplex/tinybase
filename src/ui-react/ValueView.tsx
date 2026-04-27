import type {
  ValueProps,
  ValueView as ValueViewDecl,
} from '../@types/ui-react/index.d.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {Wrap} from './common/Wrap.tsx';
import {useValue} from './hooks.ts';

export const ValueView: typeof ValueViewDecl = ({
  valueId,
  store,
  debugIds,
}: ValueProps): any => (
  <Wrap debugIds={debugIds} id={valueId}>
    {EMPTY_STRING + (useValue(valueId, store) ?? EMPTY_STRING)}
  </Wrap>
);
