import type {
  ResultRowProps,
  ResultRowView as ResultRowViewDecl,
} from '../@types/ui-react/index.js';
import {arrayMap} from '../common/array.ts';
import {getProps} from '../common/react.ts';
import {wrap} from './common/wrap.tsx';
import {useResultCellIds} from './hooks.ts';
import {ResultCellView} from './ResultCellView.tsx';

export const ResultRowView: typeof ResultRowViewDecl = ({
  queryId,
  rowId,
  queries,
  resultCellComponent: ResultCell = ResultCellView,
  getResultCellComponentProps,
  separator,
  debugIds,
}: ResultRowProps): any =>
  wrap(
    arrayMap(useResultCellIds(queryId, rowId, queries), (cellId) => (
      <ResultCell
        key={cellId}
        {...getProps(getResultCellComponentProps, cellId)}
        queryId={queryId}
        rowId={rowId}
        cellId={cellId}
        queries={queries}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    rowId,
  );
