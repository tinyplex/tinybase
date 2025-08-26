import type {
  HtmlTableProps,
  ResultSortedTableInHtmlTable as ResultSortedTableInHtmlTableDecl,
  ResultSortedTableInHtmlTableProps,
} from '../@types/ui-react-dom/index.js';
import {ResultCellView} from '../ui-react/components.tsx';
import {
  useResultRowCount,
  useResultSortedRowIds,
  useResultTableCellIds,
} from '../ui-react/hooks.ts';
import {
  HtmlTable,
  useCells,
  useParams,
  useQueriesCellComponentProps,
  useSortingAndPagination,
} from './common.tsx';

export const ResultSortedTableInHtmlTable: typeof ResultSortedTableInHtmlTableDecl =
  ({
    queryId,
    cellId,
    descending,
    offset,
    limit,
    queries,
    sortOnClick,
    paginator = false,
    customCells,
    extraCellsBefore,
    extraCellsAfter,
    onChange,
    ...props
  }: ResultSortedTableInHtmlTableProps & HtmlTableProps): any => {
    const [sortAndOffset, handleSort, paginatorComponent] =
      useSortingAndPagination(
        cellId,
        descending,
        sortOnClick,
        offset,
        limit,
        useResultRowCount(queryId, queries),
        paginator,
        onChange,
      );
    return (
      <HtmlTable
        {...props}
        params={useParams(
          useCells(
            useResultTableCellIds(queryId, queries),
            customCells,
            ResultCellView,
          ),
          useQueriesCellComponentProps(queries, queryId),
          useResultSortedRowIds(queryId, ...sortAndOffset, limit, queries),
          extraCellsBefore,
          extraCellsAfter,
          sortAndOffset,
          handleSort,
          paginatorComponent,
        )}
      />
    );
  };
