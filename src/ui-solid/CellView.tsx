/* @jsxImportSource solid-js */
import type {
  CellProps,
} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useCell} from './hooks.ts';

export const CellView = ({
  tableId,
  rowId,
  cellId,
  store,
  debugIds,
}: CellProps): any => {
  const cell = useCell(tableId, rowId, cellId, store) as any;
  return () =>
    wrap(
      EMPTY_STRING + ((getValue(cell) as any) ?? EMPTY_STRING),
      undefined,
      debugIds,
      cellId,
    );
};