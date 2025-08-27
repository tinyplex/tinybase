import type {
  ResultSortedTableProps,
  ResultSortedTableView as ResultSortedTableViewDecl,
} from '../@types/ui-react/index.js';
import {resultTableView} from './common/index.tsx';
import {useResultSortedRowIds} from './hooks.ts';

export const ResultSortedTableView: typeof ResultSortedTableViewDecl = ({
  cellId,
  descending,
  offset,
  limit,
  ...props
}: ResultSortedTableProps): any =>
  resultTableView(
    props,
    useResultSortedRowIds(
      props.queryId,
      cellId,
      descending,
      offset,
      limit,
      props.queries,
    ),
  );
