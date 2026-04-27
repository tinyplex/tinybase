/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {Id} from '../@types/index.d.ts';
import type {ResultRowProps} from '../@types/ui-solid/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps, getValue} from '../common/solid.ts';
import {renderView, wrap} from './common/wrap.tsx';
import {useResultCellIds} from './primitives.ts';
import {ResultCellView} from './ResultCellView.tsx';

export const ResultRowView = (props: ResultRowProps): JSXElement => {
  const resultCellIds = useResultCellIds(
    () => props.queryId,
    () => props.rowId,
    () => props.queries,
  );
  return renderView(() => {
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
  });
};
