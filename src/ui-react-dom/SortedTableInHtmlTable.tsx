import type {
  HtmlTableProps,
  SortedTableInHtmlTable as SortedTableInHtmlTableDecl,
  SortedTableInHtmlTableProps,
} from '../@types/ui-react-dom/index.d.ts';
import {
  useRowCount,
  useSortedRowIds,
  useTableCellIds,
} from '../ui-react/hooks.ts';
import {CellView} from '../ui-react/index.ts';
import {HtmlTable} from './common/components.tsx';
import {
  useCells,
  useParams,
  useStoreCellComponentProps,
} from './common/hooks.tsx';
import {EditableCellView} from './EditableCellView.tsx';
import {useSortingAndPagination} from './SortedTablePaginator.tsx';

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
