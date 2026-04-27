/* @jsxImportSource solid-js */
import type {
  CellProps,
} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useCell} from './hooks.ts';

export const CellView = (props: CellProps): any => {
  const cell = useCell(
    (() => props.tableId) as any,
    (() => props.rowId) as any,
    (() => props.cellId) as any,
    (() => props.store) as any,
  ) as any;
  return () =>
    wrap(
      EMPTY_STRING + ((getValue(cell) as any) ?? EMPTY_STRING),
      undefined,
      props.debugIds,
      props.cellId,
    );
};
