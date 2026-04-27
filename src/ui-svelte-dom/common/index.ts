import type {Component} from 'svelte';
import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {
  ExtraRowCell,
  ExtraValueCell,
  SortedTablePaginatorProps,
} from '../../@types/ui-svelte-dom/index.d.ts';
import type {
  QueriesOrQueriesId,
  StoreOrStoreId,
} from '../../@types/ui-svelte/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import type {IdObj} from '../../common/obj.ts';
import {objMap, objNew} from '../../common/obj.ts';
import {isArray, isString} from '../../common/other.ts';
import {EXTRA} from '../../common/strings.ts';

type CustomCellLike = {
  label?: string;
  component?: Component<any>;
  getComponentProps?: (rowId: Id, cellId: Id) => IdObj<any>;
};

export type CellConfig<Props extends IdObj<any> = IdObj<any>> = {
  label: string;
  component: Component<Props>;
  getComponentProps?: (rowId: Id, cellId: Id) => IdObj<any>;
};

export type Cells<Props extends IdObj<any> = IdObj<any>> = {
  [cellId: Id]: CellConfig<Props>;
};

export type CellComponentProps =
  | {store?: StoreOrStoreId; tableId: Id}
  | {queries?: QueriesOrQueriesId; queryId: Id};

export type SortAndOffset = [
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
];

export type HandleSort = (cellId: Id | undefined) => void;

export type Paginator = {
  component: Component<SortedTablePaginatorProps>;
  props: SortedTablePaginatorProps;
};

export const UP_ARROW = '\u2191';
export const DOWN_ARROW = '\u2193';

export const EDITABLE = 'editable';

export const extraKey = (index: number, after: 0 | 1) =>
  (after ? '>' : '<') + index;

export const getProps = <Props extends IdObj<any>>(
  getComponentProps: ((...ids: Ids) => Props) | undefined,
  ...ids: Ids
): Props =>
  getComponentProps == null ? ({} as Props) : getComponentProps(...ids);

export const getCells = (
  defaultCellIds: Ids,
  customCells: Ids | {[cellId: Id]: string | CustomCellLike} | undefined,
  defaultCellComponent: Component<any>,
): Cells => {
  const cellIds = customCells ?? defaultCellIds;
  const source = isArray(cellIds)
    ? objNew(arrayMap(cellIds, (cellId): [string, string] => [cellId, cellId]))
    : cellIds;
  return objMap(source, (labelOrCustomCell, cellId) => ({
    ...{label: cellId, component: defaultCellComponent},
    ...(isString(labelOrCustomCell)
      ? {label: labelOrCustomCell}
      : (labelOrCustomCell as CustomCellLike)),
  }));
};

export const getExtraHeaders = (
  extraCells: (ExtraRowCell | ExtraValueCell)[] = [],
  after: 0 | 1 = 0,
) =>
  arrayMap(extraCells, ({label}, index) => ({
    className: EXTRA,
    key: extraKey(index, after),
    label,
  }));
