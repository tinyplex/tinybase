/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {
  ResultSortedTableProps,
} from '../@types/ui-solid/index.d.ts';
import {resultTableView} from './common/index.tsx';
import {useResultSortedRowIds} from './hooks.ts';

export const ResultSortedTableView = (
  props: ResultSortedTableProps,
): JSXElement =>
  resultTableView(
    props,
    useResultSortedRowIds(
      () => props.queryId,
      () => props.cellId,
      () => props.descending,
      () => props.offset,
      () => props.limit,
      () => props.queries,
    ),
  );
