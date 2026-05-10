/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {
  HtmlTableProps,
  ResultTableInHtmlTable as ResultTableInHtmlTableDecl,
  ResultTableInHtmlTableProps,
} from '../@types/ui-solid-dom/index.d.ts';
import {ResultCellView} from '../ui-solid/index.ts';
import {
  useResultRowIds,
  useResultTableCellIds,
} from '../ui-solid/primitives.ts';
import {HtmlTable} from './common/components.tsx';
import {
  getParams,
  getQueriesCellComponentProps,
  useCells,
} from './common/hooks.tsx';

export const ResultTableInHtmlTable: typeof ResultTableInHtmlTableDecl = (
  props: ResultTableInHtmlTableProps & HtmlTableProps,
): JSXElement => (
  <HtmlTable
    {...props}
    params={getParams(
      useCells(
        useResultTableCellIds(
          () => props.queryId,
          () => props.queries,
        ),
        props.customCells,
        ResultCellView,
      ),
      getQueriesCellComponentProps(props.queries, props.queryId),
      useResultRowIds(
        () => props.queryId,
        () => props.queries,
      ),
      props.extraCellsBefore,
      props.extraCellsAfter,
    )}
  />
);
