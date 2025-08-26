import type {
  HtmlTableProps,
  SortedTableInHtmlTable as SortedTableInHtmlTableDecl,
  SortedTableInHtmlTableProps,
} from '../@types/ui-react-dom/index.js';
import {CellView} from '../ui-react/components.tsx';
import {
  useRowCount,
  useSortedRowIds,
  useTableCellIds,
} from '../ui-react/hooks.ts';
import {EditableCellView} from './EditableCellView.tsx';
import {
  HtmlTable,
  useCells,
  useParams,
  useSortingAndPagination,
  useStoreCellComponentProps,
} from './common.tsx';

export const SortedTableInHtmlTable: typeof SortedTableInHtmlTableDecl = ({
  tableId,
  cellId,
  descending,
  offset,
  limit,
  store,
  editable,
  sortOnClick,
  paginator = false,
  onChange,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  ...props
}: SortedTableInHtmlTableProps & HtmlTableProps): any => {
  const [sortAndOffset, handleSort, paginatorComponent] =
    useSortingAndPagination(
      cellId,
      descending,
      sortOnClick,
      offset,
      limit,
      useRowCount(tableId, store),
      paginator,
      onChange,
    );
  return (
    <HtmlTable
      {...props}
      params={useParams(
        useCells(
          useTableCellIds(tableId, store),
          customCells,
          editable ? EditableCellView : CellView,
        ),
        useStoreCellComponentProps(store, tableId),
        useSortedRowIds(tableId, ...sortAndOffset, limit, store),
        extraCellsBefore,
        extraCellsAfter,
        sortAndOffset,
        handleSort,
        paginatorComponent,
      )}
    />
  );
};
