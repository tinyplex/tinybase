/* @jsxImportSource solid-js */
/* eslint-disable solid/reactivity */
import type {JSXElement} from 'solid-js';
import type {
  HtmlTableProps,
  ResultSortedTableInHtmlTable as ResultSortedTableInHtmlTableDecl,
  ResultSortedTableInHtmlTableProps,
} from '../@types/ui-solid-dom/index.d.ts';
import {ResultCellView} from '../ui-solid/index.ts';
import {
  useResultRowCount,
  useResultSortedRowIds,
  useResultTableCellIds,
} from '../ui-solid/primitives.ts';
import {HtmlTable} from './common/components.tsx';
import {
  getParams,
  getQueriesCellComponentProps,
  useCells,
} from './common/hooks.tsx';
import {useSortingAndPagination} from './SortedTablePaginator.tsx';

export const ResultSortedTableInHtmlTable: typeof ResultSortedTableInHtmlTableDecl =
  (props: ResultSortedTableInHtmlTableProps & HtmlTableProps): JSXElement => {
    const [sortAndOffset, handleSort, paginatorComponent] =
      useSortingAndPagination(
        () => props.cellId,
        () => props.descending,
        () => props.sortOnClick,
        () => props.offset,
        () => props.limit,
        useResultRowCount(
          () => props.queryId,
          () => props.queries,
        ),
        () => props.paginator ?? false,
        () => props.onChange,
      );
    return HtmlTable({
      ...props,
      params: getParams(
        useCells(
          useResultTableCellIds(
            () => props.queryId,
            () => props.queries,
          ),
          () => props.customCells,
          () => ResultCellView,
        ),
        getQueriesCellComponentProps(props.queries, props.queryId),
        useResultSortedRowIds(
          () => props.queryId,
          () => sortAndOffset()[0],
          () => sortAndOffset()[1],
          () => sortAndOffset()[2],
          () => props.limit,
          () => props.queries,
        ),
        props.extraCellsBefore,
        props.extraCellsAfter,
        sortAndOffset,
        handleSort,
        paginatorComponent,
      ),
    });
  };
