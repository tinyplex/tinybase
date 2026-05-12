/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {CellProps} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useCell} from './primitives.ts';

export const CellView = (props: CellProps): JSXElement => {
  const cell = useCell(
    () => props.tableId,
    () => props.rowId,
    () => props.cellId,
    () => props.store,
  );
  return (
    <>
      {wrap(
        EMPTY_STRING + (getValue(cell) ?? EMPTY_STRING),
        undefined,
        props.debugIds,
        props.cellId,
      )}
    </>
  );
};
