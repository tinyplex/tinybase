/* @jsxImportSource solid-js */
import type {
  SortedTableProps,
} from '../@types/ui-solid/index.d.ts';
import {tableView} from './common/index.tsx';
import {useSortedRowIds} from './hooks.ts';

export const SortedTableView = (props: SortedTableProps): any =>
  tableView(
    props,
    useSortedRowIds(
      (() => props.tableId) as any,
      (() => props.cellId) as any,
      (() => props.descending) as any,
      (() => props.offset) as any,
      (() => props.limit) as any,
      (() => props.store) as any,
    ),
  );
