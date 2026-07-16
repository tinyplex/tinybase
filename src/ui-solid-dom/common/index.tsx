/* @jsxImportSource solid-js */
import type {Component, JSXElement} from 'solid-js';
import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {Relationships} from '../../@types/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import type {
  ExtraRowCell,
  ExtraValueCell,
} from '../../@types/ui-solid-dom/index.d.ts';
import type {
  CellProps,
  ExtraProps,
  QueriesOrQueriesId,
  ResultCellProps,
  RowProps,
  StoreOrStoreId,
} from '../../@types/ui-solid/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import type {MaybeAccessor} from '../../common/solid.ts';
import {getValue} from '../../common/solid.ts';
import {EXTRA} from '../../common/strings.ts';

export type Cells<Props extends Record<string, any> = CellProps> = {
  [cellId: Id]: {
    label: string;
    component: Component<Props>;
    getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
  };
};

export type CellComponent = Component<CellProps> | Component<ResultCellProps>;
type CellComponentProps =
  | {store?: StoreOrStoreId; tableId: Id}
  | {queries?: QueriesOrQueriesId; queryId: Id};
export type SortAndOffset = [
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
];
export type HandleSort = (cellId: Id | undefined) => void;
export type HtmlTableParams = [
  cells: MaybeAccessor<Cells>,
  cellComponentProps: CellComponentProps,
  rowIds: MaybeAccessor<Ids>,
  extraCellsBefore?: MaybeAccessor<ExtraRowCell[] | undefined>,
  extraCellsAfter?: MaybeAccessor<ExtraRowCell[] | undefined>,
  sortAndOffset?: MaybeAccessor<SortAndOffset>,
  handleSort?: HandleSort,
  paginator?: MaybeAccessor<JSXElement>,
];
export type RelationshipInHtmlRowParams = [
  idColumn: boolean,
  cells: MaybeAccessor<Cells>,
  localTableId: Id | undefined,
  remoteTableId: Id | undefined,
  relationshipId: Id,
  relationships: Relationships | undefined,
  store: Store | undefined,
  extraCellsBefore?: ExtraRowCell[],
  extraCellsAfter?: ExtraRowCell[],
];

export const UP_ARROW = '\u2191';
export const DOWN_ARROW = '\u2193';

export const EDITABLE = 'editable';

export const extraRowCells = (
  extraRowCells: MaybeAccessor<ExtraRowCell[] | undefined> = [],
  extraRowCellProps: RowProps,
) =>
  arrayMap(getValue(extraRowCells) ?? [], (extraRowCell) => {
    const Component = extraRowCell.component;
    return (
      <td class={EXTRA}>
        <Component {...extraRowCellProps} />
      </td>
    );
  });

export const extraHeaders = (
  extraCells: MaybeAccessor<(ExtraRowCell | ExtraValueCell)[] | undefined> = [],
) =>
  arrayMap(getValue(extraCells) ?? [], (extraCell) => (
    <th class={EXTRA}>{extraCell.label}</th>
  ));
