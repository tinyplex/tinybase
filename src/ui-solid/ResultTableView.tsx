/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {ResultTableProps} from '../@types/ui-solid/index.d.ts';
import {resultTableView} from './common/index.tsx';
import {useResultRowIds} from './primitives.ts';

export const ResultTableView = (props: ResultTableProps): JSXElement =>
  resultTableView(
    props,
    useResultRowIds(
      () => props.queryId,
      () => props.queries,
    ),
  );
