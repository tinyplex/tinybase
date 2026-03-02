/* @jsxImportSource solid-js */
import type {
  SortedTableProps,
} from '../@types/ui-solid/index.d.ts';
import {tableView} from './common/index.tsx';
import {useSortedRowIds} from './hooks.ts';

export const SortedTableView = ({
  cellId,
  descending,
  offset,
  limit,
  ...props
}: SortedTableProps): any =>
  tableView(
    props,
    useSortedRowIds(
      props.tableId,
      cellId,
      descending,
      offset,
      limit,
      props.store,
    ),
  );