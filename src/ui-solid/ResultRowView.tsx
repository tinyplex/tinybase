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

export const ResultRowView = (props: ResultRowProps): any => {
  const resultCellIds = useResultCellIds(
    (() => props.queryId) as any,
    (() => props.rowId) as any,
    (() => props.queries) as any,
  ) as any;
  return () => {
    const ResultCell = props.resultCellComponent ?? ResultCellView;
    return wrap(
      arrayMap(getValue(resultCellIds) as Id[], (cellId: Id) => (
        <ResultCell
          {...getProps(props.getResultCellComponentProps, cellId)}
          queryId={props.queryId}
          rowId={props.rowId}
          cellId={cellId}
          queries={props.queries}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
      props.debugIds,
      props.rowId,
    );
  };
};
