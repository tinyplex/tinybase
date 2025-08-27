import type {
  ValueProps,
  ValueView as ValueViewDecl,
} from '../@types/ui-react/index.js';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useValue} from './hooks.ts';

export const ValueView: typeof ValueViewDecl = ({
  valueId,
  store,
  debugIds,
}: ValueProps): any =>
  wrap(
    EMPTY_STRING + (useValue(valueId, store) ?? EMPTY_STRING),
    undefined,
    debugIds,
    valueId,
  );
