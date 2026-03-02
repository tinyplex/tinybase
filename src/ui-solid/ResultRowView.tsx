/* @jsxImportSource solid-js */
import type {
  ResultRowProps,
} from '../@types/ui-solid/index.d.ts';
import type {Id} from '../@types/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps, getValue} from '../common/solid.ts';
import {wrap} from './common/wrap.tsx';
import {useResultCellIds} from './hooks.ts';
import {ResultCellView} from './ResultCellView.tsx';

export const ResultRowView = ({
  queryId,
  rowId,
  queries,
  resultCellComponent: ResultCell = ResultCellView,
  getResultCellComponentProps,
  separator,
  debugIds,
}: ResultRowProps): any => {
  const resultCellIds = useResultCellIds(queryId, rowId, queries) as any;
  return () =>
    wrap(
      arrayMap(getValue(resultCellIds) as Id[], (cellId: Id) => (
        <ResultCell
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
};
