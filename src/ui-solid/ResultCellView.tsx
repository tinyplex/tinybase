/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {
  ResultCellProps,
} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {renderView, wrap} from './common/wrap.tsx';
import {useResultCell} from './hooks.ts';

export const ResultCellView = (props: ResultCellProps): JSXElement => {
  const resultCell = useResultCell(
    () => props.queryId,
    () => props.rowId,
    () => props.cellId,
    () => props.queries,
  );
  return renderView(() =>
    wrap(
      EMPTY_STRING + (getValue(resultCell) ?? EMPTY_STRING),
      undefined,
      props.debugIds,
      props.cellId,
    ),
  );
};
