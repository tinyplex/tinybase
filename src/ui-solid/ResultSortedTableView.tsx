/* @jsxImportSource solid-js */
import type {
  ResultSortedTableProps,
} from '../@types/ui-solid/index.d.ts';
import {resultTableView} from './common/index.tsx';
import {useResultSortedRowIds} from './hooks.ts';

export const ResultSortedTableView = ({
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