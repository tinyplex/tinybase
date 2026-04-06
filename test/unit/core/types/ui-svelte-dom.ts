/* eslint-disable @typescript-eslint/no-unused-expressions */
// NB: an exclamation mark after a line visually indicates an expected TS error
import type {Component, ComponentProps} from 'svelte';
import type {Id} from 'tinybase/with-schemas';
import * as UiSvelteDom from 'tinybase/ui-svelte-dom/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {
    c1: {type: 'number'},
    c1d: {type: 'string', default: ''},
  },
} as const;

const valuesSchema = {
  v1: {type: 'number'},
  v1d: {type: 'string', default: ''},
} as const;

const UiSvelteDomWithSchemas = UiSvelteDom as UiSvelteDom.WithSchemas<
  [typeof tablesSchema, typeof valuesSchema]
>;
const {
  TableInHtmlTable,
  SortedTableInHtmlTable,
  ValuesInHtmlTable,
  EditableCellView,
  EditableValueView,
} = UiSvelteDomWithSchemas;

const GoodCellView = undefined as unknown as Component<{
  readonly tableId: 't0' | 't1';
  readonly rowId: Id;
  readonly cellId: 'c0' | 'c1' | 'c1d';
}>;
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

const tableProps: ComponentProps<typeof TableInHtmlTable> = {tableId: 't1'};
tableProps.tableId = 't2'; // !

const sortedProps: ComponentProps<typeof SortedTableInHtmlTable> = {
  tableId: 't1',
  cellId: 'c1',
};
sortedProps.cellId = 'c2'; // !

const valuesProps: ComponentProps<typeof ValuesInHtmlTable> = {};
valuesProps.valueComponent = PoorValueView; // !

const editableCellProps: ComponentProps<typeof EditableCellView> = {
  tableId: 't1',
  rowId: 'r1',
  cellId: 'c1',
};
editableCellProps.cellId = 'c2'; // !

const editableValueProps: ComponentProps<typeof EditableValueView> = {
  valueId: 'v1',
};
editableValueProps.valueId = 'v2'; // !

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _App = {
  goodTable: (
    {
      tableId: 't1',
      customCells: {
        c1: {component: GoodCellView},
        c1d: {component: GoodT1C1CellView},
      },
    } satisfies ComponentProps<typeof TableInHtmlTable>
  ),
  badTable: (
    {
      tableId: 't1',
      customCells: {c1: {component: PoorCellView}},
    } satisfies ComponentProps<typeof TableInHtmlTable>
  ), // !
};
