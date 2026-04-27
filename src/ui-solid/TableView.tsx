/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {
  TableProps,
} from '../@types/ui-solid/index.d.ts';
import {tableView} from './common/index.tsx';
import {useRowIds} from './hooks.ts';

export const TableView = (props: TableProps): JSXElement =>
  tableView(
    props,
    useRowIds(() => props.tableId, () => props.store),
  );
