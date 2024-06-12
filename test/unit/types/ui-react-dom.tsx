/* eslint-disable @typescript-eslint/no-non-null-assertion */

// NB: an exclamation mark after a line visually indicates an expected TS error

import * as UiReactDom from 'tinybase/ui-react-dom/with-schemas';
import type {Id} from 'tinybase/with-schemas';
import React from 'react';

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

const UiReactDomWithSchemas = UiReactDom as UiReactDom.WithSchemas<
  [typeof tablesSchema, typeof valuesSchema]
>;
const {
  TableInHtmlTable,
  SortedTableInHtmlTable,
  ValuesInHtmlTable,
  EditableCellView,
  EditableValueView,
} = UiReactDomWithSchemas;

const GoodCellView = ({
  tableId,
  rowId,
  cellId,
}: {
  readonly tableId: 't0' | 't1';
  readonly rowId: Id;
  readonly cellId: 'c0' | 'c1' | 'c1d';
}) => (
  <b>
    {tableId}/{rowId}/{cellId}
  </b>
);
const GoodT1C1CellView = ({
  tableId,
  rowId,
  cellId,
}: {
  readonly tableId: 't1';
  readonly rowId: Id;
  readonly cellId: 'c1';
}) => (
  <b>
    {tableId}/{rowId}/{cellId}
  </b>
);
const PoorCellView = ({
  tableId,
  rowId,
  cellId,
}: {
  readonly tableId: 't0' | 't1';
  readonly rowId: Id;
  readonly cellId: 'c0' | 'c2';
}) => (
  <b>
    {tableId}/{rowId}/{cellId}
  </b>
);
const PoorT1CellView = ({
  tableId,
  rowId,
  cellId,
}: {
  readonly tableId: 't1';
  readonly rowId: Id;
  readonly cellId: 'c2';
}) => (
  <b>
    {tableId}/{rowId}/{cellId}
  </b>
);

const GoodValueView = ({valueId}: {readonly valueId: 'v1' | 'v1d'}) => (
  <b>{valueId}</b>
);
const PoorValueView = ({valueId}: {readonly valueId: 'v1' | 'v2'}) => (
  <b>{valueId}</b>
);

const _App = () => (
  <>
    <TableInHtmlTable tableId="t1" />
    <TableInHtmlTable tableId="t1" customCells={['c1']} />
    <TableInHtmlTable tableId="t1" customCells={{c1: ''}} />
    <TableInHtmlTable
      tableId="t1"
      customCells={{c1: {component: GoodCellView}}}
    />
    <TableInHtmlTable
      tableId="t1"
      customCells={{c1: {component: GoodT1C1CellView}}}
    />
    <TableInHtmlTable tableId="t2" /> {/* ! */}
    <TableInHtmlTable tableId="t1" customCells={['c2']} /> {/* ! */}
    <TableInHtmlTable tableId="t1" customCells={{c2: 'C2'}} /> {/* ! */}
    <TableInHtmlTable
      tableId="t1"
      customCells={{c1: {component: PoorCellView}}} // !
    />
    <TableInHtmlTable
      tableId="t1"
      customCells={{c1d: {component: GoodT1C1CellView}}}
    />
    <TableInHtmlTable
      tableId="t1"
      customCells={{c1: {component: PoorT1CellView}}} // !
    />
    <TableInHtmlTable
      tableId="t1"
      customCells={{c2: {component: GoodCellView}}} // !
    />
    {/*
    
    */}
    <SortedTableInHtmlTable tableId="t1" />
    <SortedTableInHtmlTable tableId="t1" cellId="c1" />
    <SortedTableInHtmlTable tableId="t1" customCells={['c1']} />
    <SortedTableInHtmlTable tableId="t1" customCells={{c1: ''}} />
    <SortedTableInHtmlTable
      tableId="t1"
      customCells={{c1: {component: GoodCellView}}}
    />
    <SortedTableInHtmlTable
      tableId="t1"
      customCells={{c1: {component: GoodT1C1CellView}}}
    />
    <SortedTableInHtmlTable tableId="t2" /> {/* ! */}
    <SortedTableInHtmlTable tableId="t1" cellId="c2" /> {/* ! */}
    <SortedTableInHtmlTable tableId="t1" customCells={['c2']} /> {/* ! */}
    <SortedTableInHtmlTable tableId="t1" customCells={{c2: 'C2'}} /> {/* ! */}
    <SortedTableInHtmlTable
      tableId="t1"
      customCells={{c1: {component: PoorCellView}}} // !
    />
    <SortedTableInHtmlTable
      tableId="t1"
      customCells={{c1d: {component: GoodT1C1CellView}}}
    />
    <SortedTableInHtmlTable
      tableId="t1"
      customCells={{c1: {component: PoorT1CellView}}} // !
    />
    <SortedTableInHtmlTable
      tableId="t1"
      customCells={{c2: {component: GoodCellView}}} // !
    />
    {/* 
    
    */}
    <ValuesInHtmlTable />
    <ValuesInHtmlTable valueComponent={GoodValueView} />
    <ValuesInHtmlTable valueComponent={PoorValueView} /> {/* ! */}
    {/* 
    
    */}
    <EditableCellView tableId="t1" rowId="r1" cellId="c1" />
    <EditableCellView tableId="t1" rowId="r1" cellId="c2" /> {/* ! */}
    <EditableCellView tableId="t2" rowId="r1" cellId="c2" /> {/* ! */}
    {/* 
    
    */}
    <EditableValueView valueId="v1" />
    <EditableValueView valueId="v2" /> {/* ! */}
  </>
);
