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

export const RowView = ({
  tableId,
  rowId,
  store,
  cellComponent: Cell = CellView,
  getCellComponentProps,
  customCellIds,
  separator,
  debugIds,
}: RowProps): any => {
  const cellIds = useCustomOrDefaultCellIds(
    customCellIds,
    tableId,
    rowId,
    store,
  ) as any;
  return () =>
    wrap(
      arrayMap(getValue(cellIds) as Id[], (cellId: Id) => (
        <Cell
          {...getProps(getCellComponentProps, cellId)}
          tableId={tableId}
          rowId={rowId}
          cellId={cellId}
          store={store}
          debugIds={debugIds}
        />
      )),
      separator,
      debugIds,
      rowId,
    );
};
