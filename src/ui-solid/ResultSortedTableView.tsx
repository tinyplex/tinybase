/* @jsxImportSource solid-js */
import type {
  ResultSortedTableProps,
} from '../@types/ui-solid/index.d.ts';
import {resultTableView} from './common/index.tsx';
import {useResultSortedRowIds} from './hooks.ts';

export const ResultSortedTableView = (props: ResultSortedTableProps): any =>
  resultTableView(
    props,
    useResultSortedRowIds(
      (() => props.queryId) as any,
      (() => props.cellId) as any,
      (() => props.descending) as any,
      (() => props.offset) as any,
      (() => props.limit) as any,
      (() => props.queries) as any,
    ),
  );
