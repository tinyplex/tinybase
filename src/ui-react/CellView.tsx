import type {
  CellProps,
  CellView as CellViewDecl,
} from '../@types/ui-react/index.d.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {Wrap} from './common/Wrap.tsx';
import {useCell} from './hooks.ts';

export const CellView: typeof CellViewDecl = ({
  tableId,
  rowId,
  cellId,
  store,
  debugIds,
}: CellProps): any => (
  <Wrap debugIds={debugIds} id={cellId}>
    {EMPTY_STRING + (useCell(tableId, rowId, cellId, store) ?? EMPTY_STRING)}
  </Wrap>
);
