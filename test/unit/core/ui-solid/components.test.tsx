/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import {render} from 'solid-js/web';
import type {Checkpoints, Id, Store} from 'tinybase';
import {
  createCheckpoints,
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import type {
  BackwardCheckpointsProps,
  CellProps,
  IndexProps,
  LinkedRowsProps,
  LocalRowsProps,
  MetricProps,
  RemoteRowProps,
  ResultCellProps,
  ResultRowProps,
  ResultSortedTableProps,
  ResultTableProps,
  RowProps,
  SliceProps,
  SortedTableProps,
  TableProps,
  TablesProps,
  ValueProps,
  ValuesProps,
} from 'tinybase/ui-solid';
import {
  BackwardCheckpointsView,
  CellView,
  CheckpointView,
  CurrentCheckpointView,
  ForwardCheckpointsView,
  IndexView,
  LinkedRowsView,
  LocalRowsView,
  MetricView,
  RemoteRowView,
  ResultCellView,
  ResultRowView,
  ResultSortedTableView,
  ResultTableView,
  RowView,
  SliceView,
  SortedTableView,
  TablesView,
  TableView,
  ValuesView,
  ValueView,
} from 'tinybase/ui-solid';
import {beforeEach, describe, expect, test} from 'vitest';
import {pause} from '../../common/other.ts';

let store: Store;

const renderSolid = (view: () => JSXElement) => {
  const container = document.createElement('div');
  const unmount = render(view, container);
  return {container, unmount};
};

const expectText = async (
  container: HTMLElement,
  textContent: string,
): Promise<void> => {
  await pause();
  expect(container.textContent).toEqual(textContent);
};

beforeEach(() => {
  store = createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 3, v2: 4});
});

describe('ui-solid views', () => {
  const TestTablesView = (
    props: TablesProps & {readonly cellPrefix?: string},
  ) => (
    <TablesView
      {...props}
      tableComponent={TestTableView}
      getTableComponentProps={(_tableId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  );

  const TestTableView = (
    props: TableProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.tableId}:
      <TableView
        {...props}
        rowComponent={TestRowView}
        getRowComponentProps={(_rowId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestSortedTableView = (
    props: SortedTableProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.tableId},{props.cellId}:
      <SortedTableView
        {...props}
        rowComponent={TestRowView}
        getRowComponentProps={(_rowId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestRowView = (props: RowProps & {readonly cellPrefix?: string}) => (
    <>
      {props.rowId}:
      <RowView
        {...props}
        cellComponent={TestCellView}
        getCellComponentProps={(_cellId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestCellView = (props: CellProps & {readonly cellPrefix?: string}) => (
    <>
      {props.cellId}
      {props.cellPrefix}
      <CellView {...props} />
    </>
  );

  const TestValuesView = (
    props: ValuesProps & {readonly valuePrefix?: string},
  ) => (
    <ValuesView
      {...props}
      valueComponent={TestValueView}
      getValueComponentProps={(_valueId: Id) => ({
        valuePrefix: props.valuePrefix,
      })}
    />
  );

  const TestValueView = (
    props: ValueProps & {readonly valuePrefix?: string},
  ) => (
    <>
      {props.valueId}
      {props.valuePrefix}
      <ValueView {...props} />
    </>
  );

  const TestMetricView = (props: MetricProps) => (
    <>
      {props.metricId}:<MetricView {...props} />
    </>
  );

  const TestIndexView = (
    props: IndexProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.indexId}:
      <IndexView
        {...props}
        sliceComponent={TestSliceView}
        getSliceComponentProps={(_sliceId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestSliceView = (
    props: SliceProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.sliceId}:
      <SliceView
        {...props}
        rowComponent={TestRowView}
        getRowComponentProps={(_rowId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestRemoteRowView = (
    props: RemoteRowProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.localRowId}:
      <RemoteRowView
        {...props}
        rowComponent={TestRowView}
        getRowComponentProps={(_rowId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestLocalRowsView = (
    props: LocalRowsProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.remoteRowId}:
      <LocalRowsView
        {...props}
        rowComponent={TestRowView}
        getRowComponentProps={(_rowId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestLinkedRowsView = (
    props: LinkedRowsProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.firstRowId}:
      <LinkedRowsView
        {...props}
        rowComponent={TestRowView}
        getRowComponentProps={(_rowId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestResultTableView = (
    props: ResultTableProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.queryId}:
      <ResultTableView
        {...props}
        resultRowComponent={TestResultRowView}
        getResultRowComponentProps={(_rowId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestResultSortedTableView = (
    props: ResultSortedTableProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.queryId},{props.cellId}:
      <ResultSortedTableView
        {...props}
        resultRowComponent={TestResultRowView}
        getResultRowComponentProps={(_rowId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestResultRowView = (
    props: ResultRowProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.rowId}:
      <ResultRowView
        {...props}
        resultCellComponent={TestResultCellView}
        getResultCellComponentProps={(_cellId: Id) => ({
          cellPrefix: props.cellPrefix,
        })}
      />
    </>
  );

  const TestResultCellView = (
    props: ResultCellProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.cellId}
      {props.cellPrefix}
      <ResultCellView {...props} />
    </>
  );

  const TestAllCheckpointsView = (props: BackwardCheckpointsProps) => (
    <>
      <BackwardCheckpointsView {...props} />
      |
      <CurrentCheckpointView {...props} />
      |
      <ForwardCheckpointsView {...props} />
      |
      <CheckpointView {...props} checkpointId="" />|
    </>
  );

  describe('table and value views', () => {
    test('renders base views with separators and debug IDs', async () => {
      let rendered = renderSolid(() => <TablesView store={store} />);
      await expectText(rendered.container, '1234');
      rendered.unmount();

      rendered = renderSolid(() => (
        <TablesView store={store} separator="/" debugIds={true} />
      ));
      await expectText(
        rendered.container,
        't1:{r1:{c1:{1}}}/t2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );
      rendered.unmount();

      rendered = renderSolid(() => (
        <TableView store={store} tableId="t2" separator="/" />
      ));
      await expectText(rendered.container, '2/34');
      rendered.unmount();

      rendered = renderSolid(() => (
        <SortedTableView
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          debugIds={true}
        />
      ));
      await expectText(rendered.container, 't2:{r2:{c1:{3}c2:{4}}r1:{c1:{2}}}');
      rendered.unmount();

      rendered = renderSolid(() => (
        <RowView store={store} tableId="t2" rowId="r2" separator="/" />
      ));
      await expectText(rendered.container, '3/4');
      rendered.unmount();

      rendered = renderSolid(() => (
        <CellView
          store={store}
          tableId="t2"
          rowId="r2"
          cellId="c2"
          debugIds={true}
        />
      ));
      await expectText(rendered.container, 'c2:{4}');
      rendered.unmount();

      rendered = renderSolid(() => (
        <ValuesView store={store} separator="/" debugIds={true} />
      ));
      await expectText(rendered.container, 'v1:{3}/v2:{4}');
      rendered.unmount();

      rendered = renderSolid(() => (
        <ValueView store={store} valueId="v2" debugIds={true} />
      ));
      await expectText(rendered.container, 'v2:{4}');
      rendered.unmount();
    });

    test('supports custom table, row, cell, value components', async () => {
      const rendered = renderSolid(() => (
        <>
          <TestTablesView store={store} cellPrefix=":" />
          |
          <TestValuesView store={store} valuePrefix=":" />
        </>
      ));

      await expectText(
        rendered.container,
        't1:r1:c1:1t2:r1:c1:2r2:c1:3c2:4|v1:3v2:4',
      );

      store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 4);
      await expectText(
        rendered.container,
        't1:r1:c1:2t2:r1:c1:2r2:c1:3c2:4|v1:4v2:4',
      );

      rendered.unmount();
    });

    test('reacts to store changes', async () => {
      const rendered = renderSolid(() => (
        <>
          <TestTableView store={store} tableId="t2" cellPrefix=":" />
          |
          <TestSortedTableView
            store={store}
            tableId="t2"
            cellId="c1"
            descending={true}
            cellPrefix=":"
          />
        </>
      ));

      await expectText(
        rendered.container,
        't2:r1:c1:2r2:c1:3c2:4|t2,c1:r2:c1:3c2:4r1:c1:2',
      );

      store.setCell('t2', 'r2', 'c1', 1);
      await expectText(
        rendered.container,
        't2:r1:c1:2r2:c1:1c2:4|t2,c1:r1:c1:2r2:c1:1c2:4',
      );

      rendered.unmount();
    });
  });

  describe('derived views', () => {
    test('renders metrics, indexes, and slices', async () => {
      const metrics = createMetrics(store)
        .setMetricDefinition('m1', 't1')
        .setMetricDefinition('m2', 't2');
      const indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't2', 'c1');
      store.setCell('t1', 'r2', 'c1', 1);

      const rendered = renderSolid(() => (
        <>
          <TestMetricView metrics={metrics} metricId="m1" />
          |
          <IndexView indexes={indexes} indexId="i1" separator="/" />
          |
          <SliceView indexes={indexes} indexId="i1" sliceId="1" debugIds />
          |
          <TestIndexView indexes={indexes} indexId="i2" cellPrefix=":" />
        </>
      ));

      await expectText(
        rendered.container,
        'm1:2|11|1:{r1:{c1:{1}}r2:{c1:{1}}}|i2:2:r1:c1:23:r2:c1:3c2:4',
      );

      store.setCell('t1', 'r3', 'c1', 1);
      await expectText(
        rendered.container,
        'm1:3|111|1:{r1:{c1:{1}}r2:{c1:{1}}r3:{c1:{1}}}|' +
          'i2:2:r1:c1:23:r2:c1:3c2:4',
      );

      rendered.unmount();
    });

    test('renders relationship views', async () => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}, r3: {c1: 'R0'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
        t2: {a: {next: 'b'}, b: {next: 'c'}, c: {next: 'd'}},
      });
      const relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 't2', 'next');

      const rendered = renderSolid(() => (
        <>
          <RemoteRowView
            relationships={relationships}
            relationshipId="r1"
            localRowId="r1"
            debugIds
          />
          |
          <LocalRowsView
            relationships={relationships}
            relationshipId="r1"
            remoteRowId="R1"
            separator="/"
          />
          |
          <LinkedRowsView
            relationships={relationships}
            relationshipId="r2"
            firstRowId="a"
            separator="/"
          />
          |
          <TestRemoteRowView
            relationships={relationships}
            relationshipId="r1"
            localRowId="r2"
            cellPrefix=":"
          />
          |
          <TestLocalRowsView
            relationships={relationships}
            relationshipId="r1"
            remoteRowId="R1"
            cellPrefix=":"
          />
          |
          <TestLinkedRowsView
            relationships={relationships}
            relationshipId="r2"
            firstRowId="a"
            cellPrefix=":"
          />
        </>
      ));

      await expectText(
        rendered.container,
        'r1:{R1:{C1:{1}}}|R1/R1|b/c/d/|r2:R1:C1:1|' +
          'R1:r1:c1:R1r2:c1:R1|a:a:next:bb:next:cc:next:dd:',
      );

      store.delTable('t1');
      await expectText(
        rendered.container,
        'r1:{}||b/c/d/|r2:|R1:|a:a:next:bb:next:cc:next:dd:',
      );

      rendered.unmount();
    });

    test('renders query result views', async () => {
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't2',
        ({select}) => {
          select('c1');
          select('c2');
        },
      );

      const rendered = renderSolid(() => (
        <>
          <ResultTableView queries={queries} queryId="q1" separator="/" />
          |
          <ResultSortedTableView
            queries={queries}
            queryId="q1"
            cellId="c2"
            debugIds
          />
          |
          <ResultRowView queries={queries} queryId="q1" rowId="r2" />
          |
          <ResultCellView
            queries={queries}
            queryId="q1"
            rowId="r2"
            cellId="c1"
            debugIds
          />
          |
          <TestResultTableView queries={queries} queryId="q1" cellPrefix=":" />
          |
          <TestResultSortedTableView
            queries={queries}
            queryId="q1"
            cellId="c2"
            cellPrefix=":"
          />
        </>
      ));

      await expectText(
        rendered.container,
        '2/34|q1:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}|34|c1:{3}|' +
          'q1:r1:c1:2r2:c1:3c2:4|q1,c2:r1:c1:2r2:c1:3c2:4',
      );

      store.setCell('t2', 'r1', 'c2', 5);
      await expectText(
        rendered.container,
        '25/34|q1:{r2:{c1:{3}c2:{4}}r1:{c1:{2}c2:{5}}}|34|c1:{3}|' +
          'q1:r1:c1:2c2:5r2:c1:3c2:4|q1,c2:r2:c1:3c2:4r1:c1:2c2:5',
      );

      rendered.unmount();
    });

    test('renders checkpoint views', async () => {
      const checkpoints: Checkpoints = createCheckpoints(store);
      checkpoints.setCheckpoint('0', 'c1');
      store.setCell('t1', 'r1', 'c1', 2);
      checkpoints.addCheckpoint();
      store.setCell('t1', 'r1', 'c1', 3);
      checkpoints.addCheckpoint('c2');
      store.setCell('t1', 'r1', 'c1', 4);
      checkpoints.addCheckpoint('c3');
      checkpoints.goTo('2');

      const rendered = renderSolid(() => (
        <>
          <BackwardCheckpointsView checkpoints={checkpoints} separator="/" />
          |
          <CurrentCheckpointView checkpoints={checkpoints} />
          |
          <ForwardCheckpointsView checkpoints={checkpoints} separator="/" />
          |
          <TestAllCheckpointsView checkpoints={checkpoints} debugIds />
        </>
      ));

      await expectText(
        rendered.container,
        'c1/|c2|c3|0:{c1}1:{}|2:{c2}|3:{c3}|:{}|',
      );

      checkpoints.goTo('0');
      await expectText(
        rendered.container,
        '|c1|/c2/c3||0:{c1}|1:{}2:{c2}3:{c3}|:{}|',
      );

      rendered.unmount();
    });
  });
});
