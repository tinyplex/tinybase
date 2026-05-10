/* @jsxImportSource solid-js */
/* eslint-disable solid/reactivity */
import type {JSXElement} from 'solid-js';
import type {EditableCellView as EditableCellViewDecl} from '../@types/ui-solid-dom/index.d.ts';
import type {CellProps} from '../@types/ui-solid/index.d.ts';
import {CELL} from '../common/strings.ts';
import {useCellState, useStoreOrStoreById} from '../ui-solid/primitives.ts';
import {EditableThing} from './common/components.tsx';
import {EDITABLE} from './common/index.tsx';

export const EditableCellView: typeof EditableCellViewDecl = (
  props: CellProps & {readonly className?: string; readonly showType?: boolean},
): JSXElement => {
  const [cell, setCell] = useCellState(
    () => props.tableId,
    () => props.rowId,
    () => props.cellId,
    () => props.store,
  );
  const store = useStoreOrStoreById(() => props.store);
  return EditableThing({
    get thing() {
      return cell();
    },
    onThingChange: setCell,
    class: props.className ?? EDITABLE + CELL,
    showType: props.showType,
    hasSchema: () => !!store()?.hasTablesSchema(),
  });
};
