/* eslint-disable react/jsx-no-useless-fragment */

import * as UiReact from 'tinybase/ui-react/with-schemas';
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
} from 'tinybase/ui-react';
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
  Provider,
  RemoteRowView,
  ResultCellView,
  ResultRowView,
  ResultSortedTableView,
  ResultTableView,
  RowView,
  SliceView,
  SortedTableView,
  TableView,
  TablesView,
  ValueView,
  ValuesView,
  useCell,
  useCheckpointIds,
  useDelCellCallback,
  useDelRowCallback,
  useDelTableCallback,
  useDelTablesCallback,
  useLinkedRowIds,
  useLocalRowIds,
  useMetric,
  usePersister,
  useRemoteRowId,
  useResultCell,
  useResultCellIds,
  useResultRow,
  useResultRowIds,
  useResultTable,
  useRow,
  useSetCellCallback,
  useSetRowCallback,
  useSetTableCallback,
  useSetTablesCallback,
  useSliceIds,
  useSliceRowIds,
  useStore,
  useStoreIds,
  useSynchronizer,
  useTable,
  useTables,
} from 'tinybase/ui-react';
import type {
  Checkpoints,
  Id,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase';
import React, {act, useCallback} from 'react';
import {
  createCheckpoints,
  createIndexes,
  createMergeableStore,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import {fireEvent, render} from '@testing-library/react';
import type {NoSchemas} from 'tinybase/with-schemas';
import {createLocalPersister} from 'tinybase/persisters/persister-browser';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
import {createStore as createStore2} from 'tinybase/with-schemas';

const {Provider: Provider2, useStore: useStore2} =
  UiReact as UiReact.WithSchemas<NoSchemas>;

let store: Store;

beforeEach(() => {
  store = createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 3, v2: 4});
});

describe('Read Components', () => {
  const TestIndexView = (
    props: IndexProps & {readonly cellPrefix?: string},
  ) => (
    <>
      {props.indexId}:
      <IndexView
        {...props}
        sliceComponent={TestSliceView}
        getSliceComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
        getRowComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
        getRowComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
        getRowComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
        getRowComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
        getResultRowComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
        getResultRowComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
        getResultCellComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <CheckpointView {...props} />
    </>
  );

  const TestTablesView = (
    props: TablesProps & {readonly cellPrefix?: string},
  ) => (
    <TablesView
      {...props}
      tableComponent={TestTableView}
      getTableComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
        getRowComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
        getRowComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
      />
    </>
  );

  const TestRowView = (props: RowProps & {readonly cellPrefix?: string}) => (
    <>
      {props.rowId}:
      <RowView
        {...props}
        cellComponent={TestCellView}
        getCellComponentProps={useCallback(
          () => ({cellPrefix: props.cellPrefix}),
          [props.cellPrefix],
        )}
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
      getValueComponentProps={useCallback(
        () => ({valuePrefix: props.valuePrefix}),
        [props.valuePrefix],
      )}
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

  describe('TablesView', () => {
    test('Basic', () => {
      const {container, unmount} = render(<TablesView store={store} />);
      expect(container.textContent).toEqual('1234');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <TablesView store={store} separator="/" />,
      );
      expect(container.textContent).toEqual('1/234');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <TablesView store={store} debugIds={true} />,
      );
      expect(container.textContent).toEqual(
        't1:{r1:{c1:{1}}}t2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );

      unmount();
    });

    test('Custom', () => {
      const Test = () => <TestTablesView store={store} cellPrefix=":" />;
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('t1:r1:c1:1t2:r1:c1:2r2:c1:3c2:4');

      act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(container.textContent).toEqual('t1:r1:c1:2t2:r1:c1:2r2:c1:3c2:4');

      act(() => store.delTables());
      expect(container.textContent).toEqual('');

      unmount();
    });
  });

  describe('TableView', () => {
    test('Basic', () => {
      const {container, unmount} = render(
        <TableView store={store} tableId="t2" />,
      );
      expect(container.textContent).toEqual('234');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <TableView store={store} tableId="t2" separator="/" />,
      );
      expect(container.textContent).toEqual('2/34');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, rerender, unmount} = render(
        <TableView store={store} tableId="t2" separator="/" />,
      );
      expect(container.textContent).toEqual('2/34');

      rerender(<TableView store={store} tableId="t2" debugIds={true} />);
      expect(container.textContent).toEqual(
        't2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );

      unmount();
    });

    test('Custom', () => {
      const Test = ({tableId}: {readonly tableId: Id}) => (
        <TestTableView store={store} tableId={tableId} cellPrefix=":" />
      );
      const {container, rerender, unmount} = render(<Test tableId="t0" />);
      expect(container.textContent).toEqual('t0:');

      rerender(<Test tableId="t2" />);
      expect(container.textContent).toEqual('t2:r1:c1:2r2:c1:3c2:4');

      act(() => store.setCell('t2', 'r1', 'c1', 3));
      expect(container.textContent).toEqual('t2:r1:c1:3r2:c1:3c2:4');

      act(() => store.delTables());
      expect(container.textContent).toEqual('t2:');

      unmount();
    });
  });

  describe('SortedTableView', () => {
    test('Basic', () => {
      const {container, unmount} = render(
        <SortedTableView
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
        />,
      );
      expect(container.textContent).toEqual('342');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <SortedTableView
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          separator="/"
        />,
      );
      expect(container.textContent).toEqual('34/2');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, rerender, unmount} = render(
        <SortedTableView
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          separator="/"
        />,
      );
      expect(container.textContent).toEqual('34/2');

      rerender(
        <SortedTableView
          store={store}
          tableId="t2"
          cellId="c1"
          descending={true}
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual(
        't2:{r2:{c1:{3}c2:{4}}r1:{c1:{2}}}',
      );

      rerender(
        <SortedTableView
          store={store}
          tableId="t2"
          cellId="c1"
          offset={1}
          limit={1}
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual('t2:{r2:{c1:{3}c2:{4}}}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        tableId,
        cellId,
      }: {
        readonly tableId: Id;
        readonly cellId: Id;
      }) => (
        <TestSortedTableView
          store={store}
          tableId={tableId}
          cellId={cellId}
          descending={true}
          cellPrefix=":"
        />
      );
      const {container, rerender, unmount} = render(
        <Test tableId="t0" cellId="c0" />,
      );
      expect(container.textContent).toEqual('t0,c0:');

      rerender(<Test tableId="t2" cellId="c1" />);
      expect(container.textContent).toEqual('t2,c1:r2:c1:3c2:4r1:c1:2');

      act(() => store.setCell('t2', 'r1', 'c1', 3));
      expect(container.textContent).toEqual('t2,c1:r2:c1:3c2:4r1:c1:3');

      act(() => store.delTables());
      expect(container.textContent).toEqual('t2,c1:');

      unmount();
    });
  });

  describe('RowView', () => {
    test('Basic', () => {
      const {container, unmount} = render(
        <RowView store={store} tableId="t2" rowId="r2" />,
      );
      expect(container.textContent).toEqual('34');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <RowView store={store} tableId="t2" rowId="r2" separator="/" />,
      );
      expect(container.textContent).toEqual('3/4');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <RowView store={store} tableId="t2" rowId="r2" debugIds={true} />,
      );
      expect(container.textContent).toEqual('r2:{c1:{3}c2:{4}}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        tableId,
        rowId,
      }: {
        readonly tableId: Id;
        readonly rowId: Id;
      }) => (
        <TestRowView
          store={store}
          tableId={tableId}
          rowId={rowId}
          cellPrefix=":"
        />
      );
      const {container, rerender, unmount} = render(
        <Test tableId="t0" rowId="r0" />,
      );
      expect(container.textContent).toEqual('r0:');

      act(() => rerender(<Test tableId="t2" rowId="r2" />));
      expect(container.textContent).toEqual('r2:c1:3c2:4');

      act(() => store.setCell('t2', 'r2', 'c1', 4));
      expect(container.textContent).toEqual('r2:c1:4c2:4');

      act(() => store.delTables());
      expect(container.textContent).toEqual('r2:');

      unmount();
    });
  });

  describe('CellView', () => {
    test('Basic', () => {
      const {container, unmount} = render(
        <CellView store={store} tableId="t2" rowId="r2" cellId="c2" />,
      );
      expect(container.textContent).toEqual('4');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <CellView
          store={store}
          tableId="t2"
          rowId="r2"
          cellId="c2"
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual('c2:{4}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        tableId,
        rowId,
        cellId,
      }: {
        readonly tableId: Id;
        readonly rowId: Id;
        readonly cellId: Id;
      }) => (
        <TestCellView
          store={store}
          tableId={tableId}
          rowId={rowId}
          cellId={cellId}
          cellPrefix=":"
        />
      );
      const {container, rerender, unmount} = render(
        <Test tableId="t0" rowId="r0" cellId="c0" />,
      );
      expect(container.textContent).toEqual('c0:');

      rerender(<Test tableId="t2" rowId="r2" cellId="c2" />);
      expect(container.textContent).toEqual('c2:4');

      act(() => store.setCell('t2', 'r2', 'c2', 5));
      expect(container.textContent).toEqual('c2:5');

      act(() => store.delTables());
      expect(container.textContent).toEqual('c2:');

      unmount();
    });
  });

  describe('ValuesView', () => {
    test('Basic', () => {
      const {container, unmount} = render(<ValuesView store={store} />);
      expect(container.textContent).toEqual('34');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <ValuesView store={store} separator="/" />,
      );
      expect(container.textContent).toEqual('3/4');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <ValuesView store={store} debugIds={true} />,
      );
      expect(container.textContent).toEqual('v1:{3}v2:{4}');

      unmount();
    });

    test('Custom', () => {
      const Test = () => <TestValuesView store={store} valuePrefix=":" />;
      const {container, unmount} = render(<Test />);
      expect(container.textContent).toEqual('v1:3v2:4');

      act(() => store.setValue('v1', 4));
      expect(container.textContent).toEqual('v1:4v2:4');

      act(() => store.delValues());
      expect(container.textContent).toEqual('');

      unmount();
    });
  });

  describe('ValueView', () => {
    test('Basic', () => {
      const {container, unmount} = render(
        <ValueView store={store} valueId="v2" />,
      );
      expect(container.textContent).toEqual('4');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <ValueView store={store} valueId="v2" debugIds={true} />,
      );
      expect(container.textContent).toEqual('v2:{4}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({valueId}: {readonly valueId: Id}) => (
        <TestValueView store={store} valueId={valueId} valuePrefix=":" />
      );
      const {container, rerender, unmount} = render(<Test valueId="v0" />);
      expect(container.textContent).toEqual('v0:');

      rerender(<Test valueId="v2" />);
      expect(container.textContent).toEqual('v2:4');

      act(() => store.setValue('v2', 5));
      expect(container.textContent).toEqual('v2:5');

      act(() => store.delValues());
      expect(container.textContent).toEqual('v2:');

      unmount();
    });
  });

  describe('MetricView', () => {
    let metrics: Metrics;

    beforeEach(() => {
      metrics = createMetrics(store)
        .setMetricDefinition('m1', 't1')
        .setMetricDefinition('m2', 't2');
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <MetricView metrics={metrics} metricId="m1" />,
      );
      expect(container.textContent).toEqual('1');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <MetricView metrics={metrics} metricId="m1" debugIds={true} />,
      );
      expect(container.textContent).toEqual('m1:{1}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({metricId}: {readonly metricId: Id}) => (
        <TestMetricView metrics={metrics} metricId={metricId} />
      );
      const {container, rerender, unmount} = render(<Test metricId="m0" />);
      expect(container.textContent).toEqual('m0:');

      rerender(<Test metricId="m1" />);
      expect(container.textContent).toEqual('m1:1');

      act(() => store.setCell('t1', 'r2', 'c1', 2));
      expect(container.textContent).toEqual('m1:2');

      rerender(<Test metricId="m2" />);
      expect(container.textContent).toEqual('m2:2');

      act(() => store.delTables());
      expect(container.textContent).toEqual('m2:');

      unmount();
    });
  });

  describe('IndexView', () => {
    let indexes: Indexes;

    beforeEach(() => {
      indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't2', 'c1');
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <IndexView indexes={indexes} indexId="i1" />,
      );
      expect(container.textContent).toEqual('1');

      unmount();
    });

    test('Separator', () => {
      store.setCell('t1', 'r2', 'c1', 2);
      const {container, unmount} = render(
        <IndexView indexes={indexes} indexId="i1" separator="/" />,
      );
      expect(container.textContent).toEqual('1/2');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <IndexView indexes={indexes} indexId="i1" debugIds={true} />,
      );
      expect(container.textContent).toEqual('i1:{1:{r1:{c1:{1}}}}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({indexId}: {readonly indexId: Id}) => (
        <TestIndexView indexes={indexes} indexId={indexId} cellPrefix=":" />
      );
      const {container, rerender, unmount} = render(<Test indexId="i0" />);
      expect(container.textContent).toEqual('i0:');

      rerender(<Test indexId="i1" />);
      expect(container.textContent).toEqual('i1:1:r1:c1:1');

      act(() => store.setCell('t1', 'r2', 'c1', 1));
      expect(container.textContent).toEqual('i1:1:r1:c1:1r2:c1:1');

      rerender(<Test indexId="i2" />);
      expect(container.textContent).toEqual('i2:2:r1:c1:23:r2:c1:3c2:4');

      act(() => store.delTables());
      expect(container.textContent).toEqual('i2:');

      unmount();
    });
  });

  describe('SliceView', () => {
    let indexes: Indexes;

    beforeEach(() => {
      indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't2', 'c1');
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <SliceView indexes={indexes} indexId="i1" sliceId="1" />,
      );
      expect(container.textContent).toEqual('1');

      unmount();
    });

    test('Separator', () => {
      store.setCell('t1', 'r2', 'c1', 1);
      const {container, unmount} = render(
        <SliceView indexes={indexes} indexId="i1" sliceId="1" separator="/" />,
      );
      expect(container.textContent).toEqual('1/1');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <SliceView
          indexes={indexes}
          indexId="i1"
          sliceId="1"
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual('1:{r1:{c1:{1}}}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        indexId,
        sliceId,
      }: {
        readonly indexId: Id;
        readonly sliceId: Id;
      }) => (
        <TestSliceView
          indexes={indexes}
          indexId={indexId}
          sliceId={sliceId}
          cellPrefix=":"
        />
      );

      const {container, rerender, unmount} = render(
        <Test indexId="i0" sliceId="0" />,
      );
      expect(container.textContent).toEqual('0:');

      rerender(<Test indexId="i1" sliceId="0" />);
      expect(container.textContent).toEqual('0:');

      rerender(<Test indexId="i1" sliceId="1" />);
      expect(container.textContent).toEqual('1:r1:c1:1');

      act(() => store.setCell('t1', 'r2', 'c1', 1));
      expect(container.textContent).toEqual('1:r1:c1:1r2:c1:1');

      rerender(<Test indexId="i2" sliceId="2" />);
      expect(container.textContent).toEqual('2:r1:c1:2');

      act(() => store.delTables());
      expect(container.textContent).toEqual('2:');

      unmount();
    });
  });

  describe('RemoteRowView', () => {
    let relationships: Relationships;

    beforeEach(() => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}, r3: {c1: 'R0'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
      relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <RemoteRowView
          relationships={relationships}
          relationshipId="r1"
          localRowId="r1"
        />,
      );
      expect(container.textContent).toEqual('1');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <RemoteRowView
          relationships={relationships}
          relationshipId="r1"
          localRowId="r1"
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual('r1:{R1:{C1:{1}}}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        relationshipId,
        localRowId,
      }: {
        readonly relationshipId: Id;
        readonly localRowId: Id;
      }) => (
        <TestRemoteRowView
          relationships={relationships}
          relationshipId={relationshipId}
          localRowId={localRowId}
          cellPrefix=":"
        />
      );
      const {container, rerender, unmount} = render(
        <Test relationshipId="r0" localRowId="r0" />,
      );
      expect(container.textContent).toEqual('r0:');

      rerender(<Test relationshipId="r1" localRowId="r1" />);
      expect(container.textContent).toEqual('r1:R1:C1:1');

      rerender(<Test relationshipId="r1" localRowId="r2" />);
      expect(container.textContent).toEqual('r2:R1:C1:1');

      rerender(<Test relationshipId="r1" localRowId="r1" />);
      act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('r1:');

      rerender(<Test relationshipId="r2" localRowId="r2" />);
      expect(container.textContent).toEqual('r2:');

      unmount();
    });
  });

  describe('LocalRowsView', () => {
    let relationships: Relationships;

    beforeEach(() => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
      relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <LocalRowsView
          relationships={relationships}
          relationshipId="r1"
          remoteRowId="R1"
        />,
      );
      expect(container.textContent).toEqual('R1R1');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <LocalRowsView
          relationships={relationships}
          relationshipId="r1"
          remoteRowId="R1"
          separator="/"
        />,
      );
      expect(container.textContent).toEqual('R1/R1');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <LocalRowsView
          relationships={relationships}
          relationshipId="r1"
          remoteRowId="R1"
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual('R1:{r1:{c1:{R1}}r2:{c1:{R1}}}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        relationshipId,
        remoteRowId,
      }: {
        readonly relationshipId: Id;
        readonly remoteRowId: Id;
      }) => (
        <TestLocalRowsView
          relationships={relationships}
          relationshipId={relationshipId}
          remoteRowId={remoteRowId}
          cellPrefix=":"
        />
      );

      const {container, rerender, unmount} = render(
        <Test relationshipId="r0" remoteRowId="R0" />,
      );
      expect(container.textContent).toEqual('R0:');

      rerender(<Test relationshipId="r1" remoteRowId="R1" />);
      expect(container.textContent).toEqual('R1:r1:c1:R1r2:c1:R1');

      rerender(<Test relationshipId="r1" remoteRowId="R2" />);
      expect(container.textContent).toEqual('R2:');

      store.delTable('t1');
      expect(container.textContent).toEqual('R2:');

      rerender(<Test relationshipId="r2" remoteRowId="R2" />);
      expect(container.textContent).toEqual('R2:');

      unmount();
    });
  });

  describe('LinkedRowsView', () => {
    let relationships: Relationships;

    beforeEach(() => {
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
      });
      relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 't1', 'c1')
        .setRelationshipDefinition('r2', 't2', 't2', 'c2');
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <LinkedRowsView
          relationships={relationships}
          relationshipId="r1"
          firstRowId="r1"
        />,
      );
      expect(container.textContent).toEqual('r2r3r4');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <LinkedRowsView
          relationships={relationships}
          relationshipId="r1"
          firstRowId="r1"
          separator="/"
        />,
      );
      expect(container.textContent).toEqual('r2/r3/r4/');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <LinkedRowsView
          relationships={relationships}
          relationshipId="r1"
          firstRowId="r1"
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual(
        'r1:{r1:{c1:{r2}}r2:{c1:{r3}}r3:{c1:{r4}}r4:{}}',
      );

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        relationshipId,
        firstRowId,
      }: {
        readonly relationshipId: Id;
        readonly firstRowId: Id;
      }) => (
        <TestLinkedRowsView
          relationships={relationships}
          relationshipId={relationshipId}
          firstRowId={firstRowId}
          cellPrefix=":"
        />
      );

      const {container, rerender, unmount} = render(
        <Test relationshipId="r0" firstRowId="r0" />,
      );
      expect(container.textContent).toEqual('r0:r0:');

      rerender(<Test relationshipId="r1" firstRowId="r1" />);
      expect(container.textContent).toEqual('r1:r1:c1:r2r2:c1:r3r3:c1:r4r4:');

      rerender(<Test relationshipId="r1" firstRowId="r2" />);
      expect(container.textContent).toEqual('r2:r2:c1:r3r3:c1:r4r4:');

      act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('r2:r2:');

      rerender(<Test relationshipId="r2" firstRowId="r2" />);
      expect(container.textContent).toEqual('r2:r2:');

      unmount();
    });
  });

  describe('ResultTableView', () => {
    let queries: Queries;

    beforeEach(() => {
      queries = createQueries(store).setQueryDefinition(
        'q1',
        't2',
        ({select}) => {
          select('c1');
          select('c2');
        },
      );
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <ResultTableView queries={queries} queryId="q1" />,
      );
      expect(container.textContent).toEqual('234');

      act(() => store.setCell('t2', 'r1', 'c2', 5));
      expect(container.textContent).toEqual('2534');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <ResultTableView queries={queries} queryId="q1" separator="/" />,
      );
      expect(container.textContent).toEqual('2/34');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, rerender, unmount} = render(
        <ResultTableView queries={queries} queryId="q1" separator="/" />,
      );
      expect(container.textContent).toEqual('2/34');

      rerender(
        <ResultTableView queries={queries} queryId="q1" debugIds={true} />,
      );
      expect(container.textContent).toEqual(
        'q1:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );

      unmount();
    });

    test('Custom', () => {
      const Test = ({queryId}: {readonly queryId: Id}) => (
        <TestResultTableView
          queries={queries}
          queryId={queryId}
          cellPrefix=":"
        />
      );
      const {container, rerender, unmount} = render(<Test queryId="q0" />);
      expect(container.textContent).toEqual('q0:');

      rerender(<Test queryId="q1" />);
      expect(container.textContent).toEqual('q1:r1:c1:2r2:c1:3c2:4');

      act(() => store.setCell('t2', 'r1', 'c1', 3));
      expect(container.textContent).toEqual('q1:r1:c1:3r2:c1:3c2:4');

      act(() => store.delTables());
      expect(container.textContent).toEqual('q1:');

      unmount();
    });
  });

  describe('ResultSortedTableView', () => {
    let queries: Queries;

    beforeEach(() => {
      queries = createQueries(store).setQueryDefinition(
        'q1',
        't2',
        ({select}) => {
          select('c1');
          select('c2');
        },
      );
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <ResultSortedTableView queries={queries} queryId="q1" cellId="c2" />,
      );
      expect(container.textContent).toEqual('234');

      act(() => store.setCell('t2', 'r1', 'c2', 5));
      expect(container.textContent).toEqual('3425');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <ResultSortedTableView
          queries={queries}
          queryId="q1"
          cellId="c2"
          separator="/"
        />,
      );
      expect(container.textContent).toEqual('2/34');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, rerender, unmount} = render(
        <ResultSortedTableView
          queries={queries}
          queryId="q1"
          cellId="c2"
          separator="/"
        />,
      );
      expect(container.textContent).toEqual('2/34');

      rerender(
        <ResultSortedTableView
          queries={queries}
          queryId="q1"
          cellId="c2"
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual(
        'q1:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );

      rerender(
        <ResultSortedTableView
          queries={queries}
          queryId="q1"
          cellId="c2"
          offset={1}
          limit={1}
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual('q1:{r2:{c1:{3}c2:{4}}}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        queryId,
        cellId,
      }: {
        readonly queryId: Id;
        readonly cellId: Id;
      }) => (
        <TestResultSortedTableView
          queries={queries}
          queryId={queryId}
          cellId={cellId}
          cellPrefix=":"
        />
      );
      const {container, rerender, unmount} = render(
        <Test queryId="q0" cellId="c0" />,
      );
      expect(container.textContent).toEqual('q0,c0:');

      rerender(<Test queryId="q1" cellId="c2" />);
      expect(container.textContent).toEqual('q1,c2:r1:c1:2r2:c1:3c2:4');

      act(() => store.setCell('t2', 'r1', 'c1', 3));
      expect(container.textContent).toEqual('q1,c2:r1:c1:3r2:c1:3c2:4');

      act(() => store.delTables());
      expect(container.textContent).toEqual('q1,c2:');

      unmount();
    });
  });

  describe('ResultRowView', () => {
    let queries: Queries;

    beforeEach(() => {
      queries = createQueries(store).setQueryDefinition(
        'q1',
        't2',
        ({select}) => {
          select('c1');
          select('c2');
        },
      );
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <ResultRowView queries={queries} queryId="q1" rowId="r2" />,
      );
      expect(container.textContent).toEqual('34');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <ResultRowView
          queries={queries}
          queryId="q1"
          rowId="r2"
          separator="/"
        />,
      );
      expect(container.textContent).toEqual('3/4');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <ResultRowView
          queries={queries}
          queryId="q1"
          rowId="r2"
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual('r2:{c1:{3}c2:{4}}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        queryId,
        rowId,
      }: {
        readonly queryId: Id;
        readonly rowId: Id;
      }) => (
        <TestResultRowView
          queries={queries}
          queryId={queryId}
          rowId={rowId}
          cellPrefix=":"
        />
      );
      const {container, rerender, unmount} = render(
        <Test queryId="q0" rowId="r0" />,
      );
      expect(container.textContent).toEqual('r0:');

      rerender(<Test queryId="q1" rowId="r2" />);
      expect(container.textContent).toEqual('r2:c1:3c2:4');

      act(() => store.setCell('t2', 'r2', 'c1', 4));
      expect(container.textContent).toEqual('r2:c1:4c2:4');

      act(() => store.delTables());
      expect(container.textContent).toEqual('r2:');

      unmount();
    });
  });

  describe('ResultCellView', () => {
    let queries: Queries;

    beforeEach(() => {
      queries = createQueries(store).setQueryDefinition(
        'q1',
        't2',
        ({select}) => select('c1'),
      );
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <ResultCellView
          queries={queries}
          queryId="q1"
          rowId="r2"
          cellId="c1"
        />,
      );
      expect(container.textContent).toEqual('3');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <ResultCellView
          queries={queries}
          queryId="q1"
          rowId="r2"
          cellId="c1"
          debugIds={true}
        />,
      );
      expect(container.textContent).toEqual('c1:{3}');

      unmount();
    });

    test('Custom', () => {
      const Test = ({
        queryId,
        rowId,
        cellId,
      }: {
        readonly queryId: Id;
        readonly rowId: Id;
        readonly cellId: Id;
      }) => (
        <TestResultCellView
          queries={queries}
          queryId={queryId}
          rowId={rowId}
          cellId={cellId}
          cellPrefix=":"
        />
      );
      const {container, rerender, unmount} = render(
        <Test queryId="q0" rowId="r0" cellId="c0" />,
      );
      expect(container.textContent).toEqual('c0:');

      rerender(<Test queryId="q1" rowId="r2" cellId="c1" />);
      expect(container.textContent).toEqual('c1:3');

      act(() => store.setCell('t2', 'r2', 'c1', 4));
      expect(container.textContent).toEqual('c1:4');

      act(() => store.delTables());
      expect(container.textContent).toEqual('c1:');

      unmount();
    });
  });

  describe('CheckpointsViews', () => {
    let checkpoints: Checkpoints;

    beforeEach(() => {
      checkpoints = createCheckpoints(store);
      checkpoints.setCheckpoint('0', 'c1');
      store.setTables({t1: {r1: {c1: 2}}});
      checkpoints.addCheckpoint();
      store.setTables({t1: {r1: {c1: 3}}});
      checkpoints.addCheckpoint('c2');
      store.setTables({t1: {r1: {c1: 4}}});
      checkpoints.addCheckpoint('c3');
      store.setTables({t1: {r1: {c1: 5}}});
      checkpoints.addCheckpoint();
      checkpoints.goTo('2');
    });

    test('Basic', () => {
      const {container, unmount} = render(
        <>
          <BackwardCheckpointsView checkpoints={checkpoints} />
          |
          <CurrentCheckpointView checkpoints={checkpoints} />
          |
          <ForwardCheckpointsView checkpoints={checkpoints} />
        </>,
      );
      expect(container.textContent).toEqual('c1|c2|c3');

      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(
        <>
          <BackwardCheckpointsView checkpoints={checkpoints} separator="/" />
          |
          <ForwardCheckpointsView checkpoints={checkpoints} separator="/" />
        </>,
      );
      expect(container.textContent).toEqual('c1/|c3/');

      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(
        <>
          <BackwardCheckpointsView checkpoints={checkpoints} debugIds={true} />
          |
          <CurrentCheckpointView checkpoints={checkpoints} debugIds={true} />
          |
          <ForwardCheckpointsView checkpoints={checkpoints} debugIds={true} />
        </>,
      );
      expect(container.textContent).toEqual('0:{c1}1:{}|2:{c2}|3:{c3}4:{}');

      unmount();
    });

    test('Custom', () => {
      const Test = () => <TestAllCheckpointsView checkpoints={checkpoints} />;

      const {container, unmount} = render(<Test />);
      act(() => checkpoints.clear());
      expect(container.textContent).toEqual('||||');

      act(() => checkpoints.setCheckpoint('0', 'c1'));
      expect(container.textContent).toEqual('|c1|||');

      act(() => store.setTables({t1: {r1: {c1: 2}}}));
      expect(container.textContent).toEqual('c1||||');

      act(() => checkpoints.addCheckpoint());
      expect(container.textContent).toEqual('c1||||');

      act(() => store.setTables({t1: {r1: {c1: 3}}}));
      expect(container.textContent).toEqual('c1||||');

      act(() => checkpoints.addCheckpoint('c2'));
      expect(container.textContent).toEqual('c1|c2|||');

      act(() => checkpoints.goTo('0'));
      expect(container.textContent).toEqual('|c1|c2||');

      unmount();
    });
  });
});

describe('Context Provider', () => {
  describe('default', () => {
    describe('store', () => {
      test('for tables', () => {
        const then = jest.fn((store1: Store) => expect(store1).toEqual(store));
        const Test = () => (
          <>
            <span>
              <TablesView />
            </span>
            <span>{JSON.stringify(useTables())}</span>
            <button
              onClick={useSetTablesCallback(() => ({t1: {r1: {c1: 2}}}))}
            />
            <button onClick={useDelTablesCallback(undefined, then)} />
          </>
        );
        const {container, getAllByRole, unmount} = render(
          <Provider store={store}>
            <Test />
          </Provider>,
        );
        expect(container.textContent).toEqual(
          '1234' +
            '{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
        );

        fireEvent.click(getAllByRole('button')[0]);
        expect(container.textContent).toEqual('2' + '{"t1":{"r1":{"c1":2}}}');

        fireEvent.click(getAllByRole('button')[1]);
        expect(container.textContent).toEqual('{}');
        expect(then).toHaveBeenCalledTimes(1);

        unmount();
      });

      test('for table', () => {
        const then = jest.fn((store1: Store) => expect(store1).toEqual(store));
        const Test = () => (
          <>
            <span>
              <TableView tableId="t1" />
            </span>
            <span>{JSON.stringify(useTable('t1'))}</span>
            <button
              onClick={useSetTableCallback('t1', () => ({r1: {c1: 2}}))}
            />
            <button onClick={useDelTableCallback('t1', undefined, then)} />
          </>
        );
        const {container, getAllByRole, unmount} = render(
          <Provider store={store}>
            <Test />
          </Provider>,
        );
        expect(container.textContent).toEqual('1{"r1":{"c1":1}}');

        fireEvent.click(getAllByRole('button')[0]);
        expect(container.textContent).toEqual('2{"r1":{"c1":2}}');

        fireEvent.click(getAllByRole('button')[1]);
        expect(container.textContent).toEqual('{}');
        expect(then).toHaveBeenCalledTimes(1);

        unmount();
      });

      test('for row', () => {
        const then = jest.fn((store1: Store) => expect(store1).toEqual(store));
        const Test = () => (
          <>
            <span>
              <RowView tableId="t1" rowId="r1" />
            </span>
            <span>{JSON.stringify(useRow('t1', 'r1'))}</span>
            <button onClick={useSetRowCallback('t1', 'r1', () => ({c1: 2}))} />
            <button onClick={useDelRowCallback('t1', 'r1', undefined, then)} />
          </>
        );
        const {container, getAllByRole, unmount} = render(
          <Provider store={store}>
            <Test />
          </Provider>,
        );
        expect(container.textContent).toEqual('1{"c1":1}');

        fireEvent.click(getAllByRole('button')[0]);
        expect(container.textContent).toEqual('2{"c1":2}');

        fireEvent.click(getAllByRole('button')[1]);
        expect(container.textContent).toEqual('{}');
        expect(then).toHaveBeenCalledTimes(1);

        unmount();
      });

      test('for cell', () => {
        const then = jest.fn((store1: Store) => expect(store1).toEqual(store));
        const Test = () => (
          <>
            <span>
              <CellView tableId="t1" rowId="r1" cellId="c1" />
            </span>
            <span>{JSON.stringify(useCell('t1', 'r1', 'c1'))}</span>
            <button onClick={useSetCellCallback('t1', 'r1', 'c1', () => 2)} />
            <button
              onClick={useSetCellCallback(
                't1',
                'r1',
                'c1',
                (e) => e.screenX,
                [],
              )}
            />
            <button
              onClick={useDelCellCallback(
                't1',
                'r1',
                'c1',
                false,
                undefined,
                then,
              )}
            />
          </>
        );
        const {container, getAllByRole, unmount} = render(
          <Provider store={store}>
            <Test />
          </Provider>,
        );
        expect(container.textContent).toEqual('11');

        fireEvent.click(getAllByRole('button')[0]);
        expect(container.textContent).toEqual('22');

        fireEvent.click(getAllByRole('button')[1], {screenX: 3});
        expect(container.textContent).toEqual('33');

        fireEvent.click(getAllByRole('button')[2]);
        expect(container.textContent).toEqual('');
        expect(then).toHaveBeenCalledTimes(1);

        unmount();
      });
    });

    test('metrics', () => {
      const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
      const Test = () => (
        <>
          <MetricView metricId="m1" />
          {useMetric('m1')}
        </>
      );
      const {container, unmount} = render(
        <Provider metrics={metrics}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('11');

      unmount();
    });

    test('indexes', () => {
      const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
      const Test = () => (
        <>
          <IndexView indexId="i1" />
          {JSON.stringify(useSliceIds('i1'))}
          <SliceView indexId="i1" sliceId="1" />
          {JSON.stringify(useSliceRowIds('i1', '1'))}
        </>
      );
      const {container, unmount} = render(
        <Provider indexes={indexes}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('1["1"]1["r1"]');

      unmount();
    });

    test('relationships', () => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });

      const relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      const Test = () => (
        <>
          <RemoteRowView relationshipId="r1" localRowId="r1" />
          {JSON.stringify(useRemoteRowId('r1', 'r1'))}
          <LocalRowsView relationshipId="r1" remoteRowId="R1" />
          {JSON.stringify(useLocalRowIds('r1', 'R1'))}
          <LinkedRowsView relationshipId="r1" firstRowId="r1" />
          {JSON.stringify(useLinkedRowIds('r1', 'r1'))}
        </>
      );
      const {container, unmount} = render(
        <Provider relationships={relationships}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('1"R1"R1R1["r1","r2"]R1["r1"]');

      unmount();
    });

    test('queries', () => {
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const Test = () => (
        <>
          <ResultTableView queryId="q1" />
          {JSON.stringify(useResultTable('q1'))}
          {JSON.stringify(useResultRowIds('q1'))}
          <ResultRowView queryId="q1" rowId="r1" />
          {JSON.stringify(useResultRow('q1', 'r1'))}
          {JSON.stringify(useResultCellIds('q1', 'r1'))}
          <ResultCellView queryId="q1" rowId="r1" cellId="c1" />
          {JSON.stringify(useResultCell('q1', 'r1', 'c1'))}
        </>
      );
      const {container, unmount} = render(
        <Provider queries={queries}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        '1{"r1":{"c1":1}}["r1"]1{"c1":1}["c1"]11',
      );

      unmount();
    });

    test('checkpoints', () => {
      const checkpoints = createCheckpoints(store);
      const Test = () => <>{JSON.stringify(useCheckpointIds())}</>;
      const {container, unmount} = render(
        <Provider checkpoints={checkpoints}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(JSON.stringify([[], '0', []]));

      unmount();
    });

    test('persister', () => {
      const persister = createLocalPersister(store, '');
      const Test = () => <>{usePersister()?.getStatus()}</>;
      const {container, unmount} = render(
        <Provider persister={persister}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('0');

      unmount();
    });

    test('synchronizer', () => {
      const synchronizer = createLocalSynchronizer(createMergeableStore());
      const Test = () => <>{useSynchronizer()?.getStatus()}</>;
      const {container, unmount} = render(
        <Provider synchronizer={synchronizer}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('0');

      unmount();
    });
  });

  describe('named', () => {
    describe('store', () => {
      test('for tables', () => {
        const Test = () => (
          <>
            <span>
              <TablesView store="store1" />
            </span>
            <span>{JSON.stringify(useTables('store1'))}</span>
            <button
              onClick={useSetTablesCallback(
                () => ({t1: {r1: {c1: 2}}}),
                [],
                'store1',
              )}
            />
            <button onClick={useDelTablesCallback('store1')} />
          </>
        );
        const {container, getAllByRole, unmount} = render(
          <Provider storesById={{store1: store}}>
            <Test />
          </Provider>,
        );
        expect(container.textContent).toEqual(
          '1234' +
            '{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
        );

        fireEvent.click(getAllByRole('button')[0]);
        expect(container.textContent).toEqual('2{"t1":{"r1":{"c1":2}}}');

        fireEvent.click(getAllByRole('button')[1]);
        expect(container.textContent).toEqual('{}');

        unmount();
      });

      test('for table', () => {
        const Test = () => (
          <>
            <span>
              <TableView store="store1" tableId="t1" />
            </span>
            <span>{JSON.stringify(useTable('t1', 'store1'))}</span>
            <button
              onClick={useSetTableCallback(
                't1',
                () => ({r1: {c1: 2}}),
                [],
                'store1',
              )}
            />
            <button onClick={useDelTableCallback('t1', 'store1')} />
          </>
        );
        const {container, getAllByRole, unmount} = render(
          <Provider storesById={{store1: store}}>
            <Test />
          </Provider>,
        );
        expect(container.textContent).toEqual('1{"r1":{"c1":1}}');

        fireEvent.click(getAllByRole('button')[0]);
        expect(container.textContent).toEqual('2{"r1":{"c1":2}}');

        fireEvent.click(getAllByRole('button')[1]);
        expect(container.textContent).toEqual('{}');

        unmount();
      });

      test('for row', () => {
        const Test = () => (
          <>
            <span>
              <RowView store="store1" tableId="t1" rowId="r1" />
            </span>
            <span>{JSON.stringify(useRow('t1', 'r1', 'store1'))}</span>
            <button
              onClick={useSetRowCallback(
                't1',
                'r1',
                () => ({c1: 2}),
                [],
                'store1',
              )}
            />
            <button onClick={useDelRowCallback('t1', 'r1', 'store1')} />
          </>
        );
        const {container, getAllByRole, unmount} = render(
          <Provider storesById={{store1: store}}>
            <Test />
          </Provider>,
        );
        expect(container.textContent).toEqual('1{"c1":1}');

        fireEvent.click(getAllByRole('button')[0]);
        expect(container.textContent).toEqual('2{"c1":2}');

        fireEvent.click(getAllByRole('button')[1]);
        expect(container.textContent).toEqual('{}');

        unmount();
      });

      test('for cell', () => {
        const Test = () => (
          <>
            <span>
              <CellView store="store1" tableId="t1" rowId="r1" cellId="c1" />
            </span>
            <span>{JSON.stringify(useCell('t1', 'r1', 'c1', 'store1'))}</span>
            <button
              onClick={useSetCellCallback(
                't1',
                'r1',
                'c1',
                () => 2,
                [],
                'store1',
              )}
            />
            <button
              onClick={useSetCellCallback(
                't1',
                'r1',
                'c1',
                (e) => e.screenX,
                [],
                'store1',
              )}
            />
            <button
              onClick={useDelCellCallback('t1', 'r1', 'c1', false, 'store1')}
            />
          </>
        );
        const {container, getAllByRole, unmount} = render(
          <Provider storesById={{store1: store}}>
            <Test />
          </Provider>,
        );
        expect(container.textContent).toEqual('11');

        fireEvent.click(getAllByRole('button')[0]);
        expect(container.textContent).toEqual('22');

        fireEvent.click(getAllByRole('button')[1], {screenX: 3});
        expect(container.textContent).toEqual('33');

        fireEvent.click(getAllByRole('button')[2]);
        expect(container.textContent).toEqual('');

        unmount();
      });
    });

    test('metrics', () => {
      const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
      const Test = () => (
        <>
          <MetricView metrics="metrics1" metricId="m1" />
          {useMetric('m1', 'metrics1')}
        </>
      );
      const {container, unmount} = render(
        <Provider metricsById={{metrics1: metrics}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('11');

      unmount();
    });

    test('indexes', () => {
      const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
      const Test = () => (
        <>
          <IndexView indexes="indexes1" indexId="i1" />
          {JSON.stringify(useSliceIds('i1', 'indexes1'))}
          <SliceView indexes="indexes1" indexId="i1" sliceId="1" />
          {JSON.stringify(useSliceRowIds('i1', '1', 'indexes1'))}
        </>
      );
      const {container, unmount} = render(
        <Provider indexesById={{indexes1: indexes}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('1["1"]1["r1"]');

      unmount();
    });

    test('relationships', () => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
      const relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      const Test = () => (
        <>
          <RemoteRowView
            relationships="relationships1"
            relationshipId="r1"
            localRowId="r1"
          />
          {JSON.stringify(useRemoteRowId('r1', 'r1', 'relationships1'))}
          <LocalRowsView
            relationships="relationships1"
            relationshipId="r1"
            remoteRowId="R1"
          />
          {JSON.stringify(useLocalRowIds('r1', 'R1', 'relationships1'))}
          <LinkedRowsView
            relationships="relationships1"
            relationshipId="r1"
            firstRowId="r1"
          />
          {JSON.stringify(useLinkedRowIds('r1', 'r1', 'relationships1'))}
        </>
      );
      const {container, unmount} = render(
        <Provider relationshipsById={{relationships1: relationships}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('1"R1"R1R1["r1","r2"]R1["r1"]');

      unmount();
    });

    test('queries', () => {
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const Test = () => (
        <>
          <ResultTableView queries="queries1" queryId="q1" />
          {JSON.stringify(useResultTable('q1', 'queries1'))}
          {JSON.stringify(useResultRowIds('q1', 'queries1'))}
          <ResultRowView queries="queries1" queryId="q1" rowId="r1" />
          {JSON.stringify(useResultRow('q1', 'r1', 'queries1'))}
          {JSON.stringify(useResultCellIds('q1', 'r1', 'queries1'))}
          <ResultCellView
            queries="queries1"
            queryId="q1"
            rowId="r1"
            cellId="c1"
          />
          {JSON.stringify(useResultCell('q1', 'r1', 'c1', 'queries1'))}
        </>
      );
      const {container, unmount} = render(
        <Provider queriesById={{queries1: queries}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual(
        '1{"r1":{"c1":1}}["r1"]1{"c1":1}["c1"]11',
      );

      unmount();
    });

    test('checkpoints', () => {
      const checkpoints = createCheckpoints(store);
      const Test = () => (
        <>{JSON.stringify(useCheckpointIds('checkpoints1'))}</>
      );
      const {container, unmount} = render(
        <Provider checkpointsById={{checkpoints1: checkpoints}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('[[],"0",[]]');

      unmount();
    });

    test('persister', () => {
      const persister = createLocalPersister(store, '');
      const Test = () => (
        <>{JSON.stringify(usePersister('persister1')?.getStatus())}</>
      );
      const {container, unmount} = render(
        <Provider persistersById={{persister1: persister}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('0');

      unmount();
    });

    test('synchronizer', () => {
      const synchronizer = createLocalSynchronizer(createMergeableStore());
      const Test = () => (
        <>{JSON.stringify(useSynchronizer('synchronizer1')?.getStatus())}</>
      );
      const {container, unmount} = render(
        <Provider synchronizersById={{synchronizer1: synchronizer}}>
          <Test />
        </Provider>,
      );
      expect(container.textContent).toEqual('0');

      unmount();
    });
  });

  describe('nested', () => {
    test('same provider', () => {
      const store1 = createStore();
      const store2 = createStore();
      const Test = () => (
        <>
          {JSON.stringify(useStoreIds())}
          {useStore('a') == store1 ? 1 : 0}
          {useStore('a') == store2 ? 1 : 0}
          {useStore('b') == store1 ? 1 : 0}
          {useStore('b') == store2 ? 1 : 0}
        </>
      );
      const {container, unmount} = render(
        <Provider storesById={{a: store1}}>
          <Provider storesById={{b: store2}}>
            <Test />
          </Provider>
        </Provider>,
      );
      expect(container.textContent).toEqual('["a","b"]1001');

      unmount();
    });
    test('same provider, masked', () => {
      const store1 = createStore();
      const store2 = createStore();
      const Test = () => (
        <>
          {JSON.stringify(useStoreIds())}
          {useStore('a') == store1 ? 1 : 0}
          {useStore('a') == store2 ? 1 : 0}
          {useStore('b') == store1 ? 1 : 0}
          {useStore('b') == store2 ? 1 : 0}
        </>
      );
      const {container, unmount} = render(
        <Provider storesById={{a: store1, b: store1}}>
          <Provider storesById={{b: store2}}>
            <Test />
          </Provider>
        </Provider>,
      );
      expect(container.textContent).toEqual('["a","b"]1001');

      unmount();
    });
    test('different provider', () => {
      const store1 = createStore();
      const store2 = createStore2();
      const Test = () => (
        <>
          {JSON.stringify(useStoreIds())}
          {useStore('a') == store1 ? 1 : 0}
          {useStore2('a') == store2 ? 1 : 0}
          {useStore('b') == store1 ? 1 : 0}
          {useStore2('b') == store2 ? 1 : 0}
        </>
      );
      const {container, unmount} = render(
        <Provider storesById={{a: store1}}>
          <Provider2 storesById={{b: store2}}>
            <Test />
          </Provider2>
        </Provider>,
      );
      expect(container.textContent).toEqual('["a","b"]1001');

      unmount();
    });
  });
});
