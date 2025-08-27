import type {
  SortedTableProps,
  SortedTableView as SortedTableViewDecl,
} from '../@types/ui-react/index.js';
import {tableView} from './common/index.tsx';
import {useSortedRowIds} from './hooks.ts';

export const SortedTableView: typeof SortedTableViewDecl = ({
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
