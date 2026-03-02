/* @jsxImportSource solid-js */
import type {
  ResultTableProps,
} from '../@types/ui-solid/index.d.ts';
import {resultTableView} from './common/index.tsx';
import {useResultRowIds} from './hooks.ts';

export const ResultTableView = (
  props: ResultTableProps,
): any => resultTableView(props, useResultRowIds(props.queryId, props.queries));