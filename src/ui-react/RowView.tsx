import type {
  RowProps,
  RowView as RowViewDecl,
} from '../@types/ui-react/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps} from '../common/react.ts';
import {CellView} from './CellView.tsx';
import {useCustomOrDefaultCellIds} from './common/hooks.tsx';
import {wrap} from './common/wrap.tsx';

export const RowView: typeof RowViewDecl = ({
  tableId,
  rowId,
  store,
  cellComponent: Cell = CellView,
  getCellComponentProps,
  customCellIds,
  separator,
  debugIds,
}: RowProps): any =>
  wrap(
    arrayMap(
      useCustomOrDefaultCellIds(customCellIds, tableId, rowId, store),
      (cellId) => (
        <Cell
          key={cellId}
          {...getProps(getCellComponentProps, cellId)}
          tableId={tableId}
          rowId={rowId}
          cellId={cellId}
          store={store}
          debugIds={debugIds}
        />
      ),
    ),
    separator,
    debugIds,
    rowId,
  );
