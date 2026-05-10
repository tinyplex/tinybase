/* @jsxImportSource solid-js */
/* eslint-disable solid/reactivity */
import type {JSXElement} from 'solid-js';
import type {
  HtmlTableProps,
  TableInHtmlTable as TableInHtmlTableDecl,
  TableInHtmlTableProps,
} from '../@types/ui-solid-dom/index.d.ts';
import {CellView} from '../ui-solid/index.ts';
import {useRowIds, useTableCellIds} from '../ui-solid/primitives.ts';
import {HtmlTable} from './common/components.tsx';
import {
  getParams,
  getStoreCellComponentProps,
  useCells,
} from './common/hooks.tsx';
import {EditableCellView} from './EditableCellView.tsx';

export const TableInHtmlTable: typeof TableInHtmlTableDecl = (
  props: TableInHtmlTableProps & HtmlTableProps,
): JSXElement =>
  HtmlTable({
    ...props,
    params: getParams(
      useCells(
        useTableCellIds(
          () => props.tableId,
          () => props.store,
        ),
        props.customCells,
        props.editable ? EditableCellView : CellView,
      ),
      getStoreCellComponentProps(props.store, props.tableId),
      useRowIds(
        () => props.tableId,
        () => props.store,
      ),
      props.extraCellsBefore,
      props.extraCellsAfter,
    ),
  });
