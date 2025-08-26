import type {
  HtmlTableProps,
  ResultTableInHtmlTable as ResultTableInHtmlTableDecl,
  ResultTableInHtmlTableProps,
} from '../@types/ui-react-dom/index.js';
import {ResultCellView} from '../ui-react/components.tsx';
import {useResultRowIds, useResultTableCellIds} from '../ui-react/hooks.ts';
import {
  HtmlTable,
  useCells,
  useParams,
  useQueriesCellComponentProps,
} from './common.tsx';

export const ResultTableInHtmlTable: typeof ResultTableInHtmlTableDecl = ({
  queryId,
  queries,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  ...props
}: ResultTableInHtmlTableProps & HtmlTableProps): any => (
  <HtmlTable
    {...props}
    params={useParams(
      useCells(
        useResultTableCellIds(queryId, queries),
        customCells,
        ResultCellView,
      ),
      useQueriesCellComponentProps(queries, queryId),
      useResultRowIds(queryId, queries),
      extraCellsBefore,
      extraCellsAfter,
    )}
  />
);
