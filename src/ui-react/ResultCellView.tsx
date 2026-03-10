import type {
  ResultCellProps,
  ResultCellView as ResultCellViewDecl,
} from '../@types/ui-react/index.d.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {Wrap} from './common/Wrap.tsx';
import {useResultCell} from './hooks.ts';

export const ResultCellView: typeof ResultCellViewDecl = ({
  queryId,
  rowId,
  cellId,
  queries,
  debugIds,
}: ResultCellProps): any => (
  <Wrap debugIds={debugIds} id={cellId}>
    {EMPTY_STRING +
      (useResultCell(queryId, rowId, cellId, queries) ?? EMPTY_STRING)}
  </Wrap>
);
