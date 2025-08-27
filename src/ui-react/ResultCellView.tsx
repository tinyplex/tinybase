import type {
  ResultCellProps,
  ResultCellView as ResultCellViewDecl,
} from '../@types/ui-react/index.js';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useResultCell} from './hooks.ts';

export const ResultCellView: typeof ResultCellViewDecl = ({
  queryId,
  rowId,
  cellId,
  queries,
  debugIds,
}: ResultCellProps): any =>
  wrap(
    EMPTY_STRING +
      (useResultCell(queryId, rowId, cellId, queries) ?? EMPTY_STRING),
    undefined,
    debugIds,
    cellId,
  );
