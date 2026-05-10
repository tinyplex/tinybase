/* @jsxImportSource solid-js */
/* eslint-disable solid/reactivity */
import type {JSXElement} from 'solid-js';
import type {
  HtmlTableProps,
  SortedTableInHtmlTable as SortedTableInHtmlTableDecl,
  SortedTableInHtmlTableProps,
} from '../@types/ui-solid-dom/index.d.ts';
import {CellView} from '../ui-solid/index.ts';
import {
  useRowCount,
  useSortedRowIds,
  useTableCellIds,
} from '../ui-solid/primitives.ts';
import {HtmlTable} from './common/components.tsx';
import {
  getParams,
  getStoreCellComponentProps,
  useCells,
} from './common/hooks.tsx';
import {EditableCellView} from './EditableCellView.tsx';
import {useSortingAndPagination} from './SortedTablePaginator.tsx';

export const SortedTableInHtmlTable: typeof SortedTableInHtmlTableDecl = (
  props: SortedTableInHtmlTableProps & HtmlTableProps,
): JSXElement => {
  const [sortAndOffset, handleSort, paginatorComponent] =
    useSortingAndPagination(
      () => props.cellId,
      () => props.descending,
      () => props.sortOnClick,
      () => props.offset,
      () => props.limit,
      useRowCount(
        () => props.tableId,
        () => props.store,
      ),
      () => props.paginator ?? false,
      () => props.onChange,
    );
  return HtmlTable({
    ...props,
    params: getParams(
      useCells(
        useTableCellIds(
          () => props.tableId,
          () => props.store,
        ),
        () => props.customCells,
        props.editable === true ? EditableCellView : CellView,
      ),
      getStoreCellComponentProps(props.store, props.tableId),
      useSortedRowIds(
        () => props.tableId,
        () => sortAndOffset()[0],
        () => sortAndOffset()[1],
        () => sortAndOffset()[2],
        () => props.limit,
        () => props.store,
      ),
      props.extraCellsBefore,
      props.extraCellsAfter,
      sortAndOffset,
      handleSort,
      paginatorComponent,
    ),
  });
};
