/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {SortedTableProps} from '../@types/ui-solid/index.d.ts';
import {tableView} from './common/index.tsx';
import {useSortedRowIds} from './primitives.ts';

export const SortedTableView = (props: SortedTableProps): JSXElement =>
  tableView(
    props,
    useSortedRowIds(
      () => props.tableId,
      () => props.cellId,
      () => props.descending,
      () => props.offset,
      () => props.limit,
      undefined,
      () => props.store,
    ),
  );
