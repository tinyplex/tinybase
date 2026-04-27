/* @jsxImportSource solid-js */
import type {
  RowProps,
} from '../@types/ui-solid/index.d.ts';
import type {Id} from '../@types/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps, getValue} from '../common/solid.ts';
import {CellView} from './CellView.tsx';
import {useCustomOrDefaultCellIds} from './common/hooks.tsx';
import {wrap} from './common/wrap.tsx';

export const RowView = (props: RowProps): any => {
  const cellIds = useCustomOrDefaultCellIds(
    () => props.customCellIds,
    () => props.tableId,
    () => props.rowId,
    () => props.store,
  ) as any;
  return () => {
    const Cell = props.cellComponent ?? CellView;
    return wrap(
      arrayMap(getValue(cellIds) as Id[], (cellId: Id) => (
        <Cell
          {...getProps(props.getCellComponentProps, cellId)}
          tableId={props.tableId}
          rowId={props.rowId}
          cellId={cellId}
          store={props.store}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
      props.debugIds,
      props.rowId,
    );
  };
};
