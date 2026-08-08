// NB: an exclamation mark after a line visually indicates an expected TS error
import type {Component, ComponentProps} from 'svelte';
import * as UiSvelteDom from 'tinybase/ui-svelte-dom/with-schemas';
import type {Id} from 'tinybase/with-schemas';

const _tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {
    c1: {type: 'number'},
    c1d: {type: 'string', default: ''},
  },
} as const;

const _valuesSchema = {
  v1: {type: 'number'},
  v1d: {type: 'string', default: ''},
} as const;

type _UiSvelteDomWithSchemas = UiSvelteDom.WithSchemas<
  [typeof _tablesSchema, typeof _valuesSchema]
>;

const GoodT1C1CellView = undefined as unknown as Component<{
  readonly tableId: 't1';
  readonly rowId: Id;
  readonly cellId: 'c1';
}>;
const PoorCellView = undefined as unknown as Component<{
  readonly tableId: 't0' | 't1';
  readonly rowId: Id;
  readonly cellId: 'c0' | 'c2';
}>;
const PoorValueView = undefined as unknown as Component<{
  readonly valueId: 'v1' | 'v2';
}>;

const tableProps: ComponentProps<_UiSvelteDomWithSchemas['TableInHtmlTable']> =
  {tableId: 't1'};
tableProps.tableId = 't2'; // !

const sortedProps: ComponentProps<
  _UiSvelteDomWithSchemas['SortedTableInHtmlTable']
> = {
  tableId: 't1',
  cellId: 'c1',
};
sortedProps.cellId = 'c2'; // !

const valuesProps: ComponentProps<
  _UiSvelteDomWithSchemas['ValuesInHtmlTable']
> = {};
valuesProps.valueComponent = PoorValueView; // !

const editableCellProps: ComponentProps<
  _UiSvelteDomWithSchemas['EditableCellView']
> = {
  tableId: 't1',
  rowId: 'r1',
  cellId: 'c1',
};
editableCellProps.cellId = 'c2'; // !

const editableValueProps: ComponentProps<
  _UiSvelteDomWithSchemas['EditableValueView']
> = {
  valueId: 'v1',
};
editableValueProps.valueId = 'v2'; // !

const _App = {
  goodTable: {
    tableId: 't1',
    customCells: {c1d: {component: GoodT1C1CellView}}, // !
  } satisfies ComponentProps<_UiSvelteDomWithSchemas['TableInHtmlTable']>,
  badTable: {
    tableId: 't1',
    customCells: {c1: {component: PoorCellView}}, // !
  } satisfies ComponentProps<_UiSvelteDomWithSchemas['TableInHtmlTable']>,
};

type Schemas = [typeof _tablesSchema, typeof _valuesSchema];
const extraT1Cells = [] as UiSvelteDom.ExtraRowCell<Schemas, 't1'>[];
const extraRowCells = [] as UiSvelteDom.ExtraRowCell<
  import('tinybase/with-schemas').NoSchemas,
  Id
>[];
const extraValueCells = [] as UiSvelteDom.ExtraValueCell<Schemas>[];

const _extraCellProps = {
  table: {
    tableId: 't1',
    extraCellsBefore: extraT1Cells,
    extraCellsAfter: extraT1Cells,
  } satisfies UiSvelteDom.TableInHtmlTableProps<Schemas, 't1'>,
  sortedTable: {
    tableId: 't1',
    extraCellsBefore: extraT1Cells,
    extraCellsAfter: extraT1Cells,
  } satisfies UiSvelteDom.SortedTableInHtmlTableProps<Schemas, 't1'>,
  values: {
    extraCellsBefore: extraValueCells,
    extraCellsAfter: extraValueCells,
  } satisfies UiSvelteDom.ValuesInHtmlTableProps<Schemas>,
  slice: {
    indexId: 'i1',
    sliceId: 's1',
    extraCellsBefore: extraRowCells,
    extraCellsAfter: extraRowCells,
  } satisfies UiSvelteDom.SliceInHtmlTableProps<Schemas>,
  relationship: {
    relationshipId: 'r1',
    extraCellsBefore: extraRowCells,
    extraCellsAfter: extraRowCells,
  } satisfies UiSvelteDom.RelationshipInHtmlTableProps<Schemas>,
  resultTable: {
    queryId: 'q1',
    extraCellsBefore: extraRowCells,
    extraCellsAfter: extraRowCells,
  } satisfies UiSvelteDom.ResultTableInHtmlTableProps<Schemas>,
  resultSortedTable: {
    queryId: 'q1',
    extraCellsBefore: extraRowCells,
    extraCellsAfter: extraRowCells,
  } satisfies UiSvelteDom.ResultSortedTableInHtmlTableProps<Schemas>,
};
