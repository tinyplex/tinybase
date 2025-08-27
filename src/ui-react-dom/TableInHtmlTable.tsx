import type {
  HtmlTableProps,
  TableInHtmlTable as TableInHtmlTableDecl,
  TableInHtmlTableProps,
} from '../@types/ui-react-dom/index.js';
import {useRowIds, useTableCellIds} from '../ui-react/hooks.ts';
import {CellView} from '../ui-react/index.ts';
import {HtmlTable} from './common/components.tsx';
import {
  useCells,
  useParams,
  useStoreCellComponentProps,
} from './common/hooks.tsx';
import {EditableCellView} from './EditableCellView.tsx';

export const TableInHtmlTable: typeof TableInHtmlTableDecl = ({
  tableId,
  store,
  editable,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  ...props
}: TableInHtmlTableProps & HtmlTableProps): any => (
  <HtmlTable
    {...props}
    params={useParams(
      useCells(
        useTableCellIds(tableId, store),
        customCells,
        editable ? EditableCellView : CellView,
      ),
      useStoreCellComponentProps(store, tableId),
      useRowIds(tableId, store),
      extraCellsBefore,
      extraCellsAfter,
    )}
  />
);
