import type {ComponentType, ReactNode} from 'react';
import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {Relationships} from '../../@types/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import type {
  ExtraRowCell,
  ExtraValueCell,
} from '../../@types/ui-react-dom/index.d.ts';
import type {
  CellProps,
  ExtraProps,
  QueriesOrQueriesId,
  ResultCellProps,
  RowProps,
  StoreOrStoreId,
} from '../../@types/ui-react/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {EXTRA} from '../../common/strings.ts';

export type Cells<Props = CellProps> = {
  [cellId: Id]: {
    label: string;
    component: ComponentType<Props>;
    getComponentProps?: (rowId: Id, cellId: Id) => ExtraProps;
  };
};

export type CellComponent =
  | ComponentType<CellProps>
  | ComponentType<ResultCellProps>;
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
  cells: Cells,
  cellComponentProps: CellComponentProps,
  rowIds: Ids,
  extraCellsBefore?: ExtraRowCell[],
  extraCellsAfter?: ExtraRowCell[],
  sortAndOffset?: SortAndOffset,
  handleSort?: HandleSort,
  paginator?: ReactNode,
];
export type RelationshipInHtmlRowParams = [
  idColumn: boolean,
  cells: Cells,
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
  extraRowCells: ExtraRowCell[] = [],
  extraRowCellProps: RowProps,
  after: 0 | 1 = 0,
) =>
  arrayMap(extraRowCells, ({component: Component}, index) => (
    <td className={EXTRA} key={extraKey(index, after)}>
      <Component {...extraRowCellProps} />
    </td>
  ));

export const extraKey = (index: number, after: 0 | 1) =>
  (after ? '>' : '<') + index;

export const extraHeaders = (
  extraCells: (ExtraRowCell | ExtraValueCell)[] = [],
  after: 0 | 1 = 0,
) =>
  arrayMap(extraCells, ({label}, index) => (
    <th className={EXTRA} key={extraKey(index, after)}>
      {label}
    </th>
  ));
