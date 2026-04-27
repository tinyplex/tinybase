/* @jsxImportSource solid-js */
import type {
  ResultCellProps,
} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useResultCell} from './hooks.ts';

export const ResultCellView = (props: ResultCellProps): any => {
  const resultCell = useResultCell(
    (() => props.queryId) as any,
    (() => props.rowId) as any,
    (() => props.cellId) as any,
    (() => props.queries) as any,
  ) as any;
  return () =>
    wrap(
      EMPTY_STRING + ((getValue(resultCell) as any) ?? EMPTY_STRING),
      undefined,
      props.debugIds,
      props.cellId,
    );
};
