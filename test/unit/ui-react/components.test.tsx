/* eslint-disable react/jsx-no-useless-fragment */

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
import React, {useCallback} from 'react';
import {ReactTestRenderer, act, create} from 'react-test-renderer';
import {
  createCheckpoints,
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import {jest} from '@jest/globals';

let store: Store;
let renderer: ReactTestRenderer;

const rendererToString = (renderer: ReactTestRenderer): string => {
  const result = renderer.toJSON() as any;
  if (Array.isArray(result)) {
    return result.join('');
  }
  return result;
};

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
      act(() => {
        renderer = create(<TablesView store={store} />);
      });
      expect(rendererToString(renderer)).toEqual('1234');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(<TablesView store={store} separator="/" />);
      });
      expect(rendererToString(renderer)).toEqual('1/234');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(<TablesView store={store} debugIds={true} />);
      });
      expect(rendererToString(renderer)).toEqual(
        't1:{r1:{c1:{1}}}t2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );
    });

    test('Custom', () => {
      const Test = () => <TestTablesView store={store} cellPrefix=":" />;
      act(() => {
        renderer = create(<Test />);
      });
      expect(rendererToString(renderer)).toEqual(
        't1:r1:c1:1t2:r1:c1:2r2:c1:3c2:4',
      );

      act(() => {
        store.setCell('t1', 'r1', 'c1', 2);
      });
      expect(rendererToString(renderer)).toEqual(
        't1:r1:c1:2t2:r1:c1:2r2:c1:3c2:4',
      );

      act(() => {
        store.delTables();
      });
      expect(renderer.toJSON()).toBeNull();
    });
  });

  describe('TableView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(<TableView store={store} tableId="t2" />);
      });
      expect(rendererToString(renderer)).toEqual('234');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <TableView store={store} tableId="t2" separator="/" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('2/34');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <TableView store={store} tableId="t2" separator="/" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('2/34');

      act(() => {
        renderer = create(
          <TableView store={store} tableId="t2" debugIds={true} />,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        't2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );
    });

    test('Custom', () => {
      const Test = ({tableId}: {readonly tableId: Id}) => (
        <TestTableView store={store} tableId={tableId} cellPrefix=":" />
      );
      act(() => {
        renderer = create(<Test tableId="t0" />);
      });
      expect(rendererToString(renderer)).toEqual('t0:');

      act(() => {
        renderer.update(<Test tableId="t2" />);
      });
      expect(rendererToString(renderer)).toEqual('t2:r1:c1:2r2:c1:3c2:4');

      act(() => {
        store.setCell('t2', 'r1', 'c1', 3);
      });
      expect(rendererToString(renderer)).toEqual('t2:r1:c1:3r2:c1:3c2:4');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('t2:');
    });
  });

  describe('SortedTableView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(
          <SortedTableView
            store={store}
            tableId="t2"
            cellId="c1"
            descending={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('342');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <SortedTableView
            store={store}
            tableId="t2"
            cellId="c1"
            descending={true}
            separator="/"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('34/2');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <SortedTableView
            store={store}
            tableId="t2"
            cellId="c1"
            descending={true}
            separator="/"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('34/2');

      act(() => {
        renderer = create(
          <SortedTableView
            store={store}
            tableId="t2"
            cellId="c1"
            descending={true}
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        't2:{r2:{c1:{3}c2:{4}}r1:{c1:{2}}}',
      );

      act(() => {
        renderer = create(
          <SortedTableView
            store={store}
            tableId="t2"
            cellId="c1"
            offset={1}
            limit={1}
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('t2:{r2:{c1:{3}c2:{4}}}');
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
      act(() => {
        renderer = create(<Test tableId="t0" cellId="c0" />);
      });
      expect(rendererToString(renderer)).toEqual('t0,c0:');

      act(() => {
        renderer.update(<Test tableId="t2" cellId="c1" />);
      });
      expect(rendererToString(renderer)).toEqual('t2,c1:r2:c1:3c2:4r1:c1:2');

      act(() => {
        store.setCell('t2', 'r1', 'c1', 3);
      });
      expect(rendererToString(renderer)).toEqual('t2,c1:r2:c1:3c2:4r1:c1:3');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('t2,c1:');
    });
  });

  describe('RowView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(<RowView store={store} tableId="t2" rowId="r2" />);
      });
      expect(rendererToString(renderer)).toEqual('34');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <RowView store={store} tableId="t2" rowId="r2" separator="/" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('3/4');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <RowView store={store} tableId="t2" rowId="r2" debugIds={true} />,
        );
      });
      expect(rendererToString(renderer)).toEqual('r2:{c1:{3}c2:{4}}');
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
      act(() => {
        renderer = create(<Test tableId="t0" rowId="r0" />);
      });
      expect(rendererToString(renderer)).toEqual('r0:');

      act(() => {
        renderer.update(<Test tableId="t2" rowId="r2" />);
      });
      expect(rendererToString(renderer)).toEqual('r2:c1:3c2:4');

      act(() => {
        store.setCell('t2', 'r2', 'c1', 4);
      });
      expect(rendererToString(renderer)).toEqual('r2:c1:4c2:4');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('r2:');
    });
  });

  describe('CellView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(
          <CellView store={store} tableId="t2" rowId="r2" cellId="c2" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('4');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <CellView
            store={store}
            tableId="t2"
            rowId="r2"
            cellId="c2"
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('c2:{4}');
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
      act(() => {
        renderer = create(<Test tableId="t0" rowId="r0" cellId="c0" />);
      });
      expect(rendererToString(renderer)).toEqual('c0:');

      act(() => {
        renderer.update(<Test tableId="t2" rowId="r2" cellId="c2" />);
      });
      expect(rendererToString(renderer)).toEqual('c2:4');

      act(() => {
        store.setCell('t2', 'r2', 'c2', 5);
      });
      expect(rendererToString(renderer)).toEqual('c2:5');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('c2:');
    });
  });

  describe('ValuesView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(<ValuesView store={store} />);
      });
      expect(rendererToString(renderer)).toEqual('34');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(<ValuesView store={store} separator="/" />);
      });
      expect(rendererToString(renderer)).toEqual('3/4');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(<ValuesView store={store} debugIds={true} />);
      });
      expect(rendererToString(renderer)).toEqual('v1:{3}v2:{4}');
    });

    test('Custom', () => {
      const Test = () => <TestValuesView store={store} valuePrefix=":" />;
      act(() => {
        renderer.update(<Test />);
      });
      expect(rendererToString(renderer)).toEqual('v1:3v2:4');

      act(() => {
        store.setValue('v1', 4);
      });
      expect(rendererToString(renderer)).toEqual('v1:4v2:4');

      act(() => {
        store.delValues();
      });
      expect(renderer.toJSON()).toBeNull();
    });
  });

  describe('ValueView', () => {
    test('Basic', () => {
      act(() => {
        renderer = create(<ValueView store={store} valueId="v2" />);
      });
      expect(rendererToString(renderer)).toEqual('4');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <ValueView store={store} valueId="v2" debugIds={true} />,
        );
      });
      expect(rendererToString(renderer)).toEqual('v2:{4}');
    });

    test('Custom', () => {
      const Test = ({valueId}: {readonly valueId: Id}) => (
        <TestValueView store={store} valueId={valueId} valuePrefix=":" />
      );
      act(() => {
        renderer = create(<Test valueId="v0" />);
      });
      expect(rendererToString(renderer)).toEqual('v0:');

      act(() => {
        renderer.update(<Test valueId="v2" />);
      });
      expect(rendererToString(renderer)).toEqual('v2:4');

      act(() => {
        store.setValue('v2', 5);
      });
      expect(rendererToString(renderer)).toEqual('v2:5');

      act(() => {
        store.delValues();
      });
      expect(rendererToString(renderer)).toEqual('v2:');
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
      act(() => {
        renderer = create(<MetricView metrics={metrics} metricId="m1" />);
      });
      expect(rendererToString(renderer)).toEqual('1');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <MetricView metrics={metrics} metricId="m1" debugIds={true} />,
        );
      });
      expect(rendererToString(renderer)).toEqual('m1:{1}');
    });

    test('Custom', () => {
      const Test = ({metricId}: {readonly metricId: Id}) => (
        <TestMetricView metrics={metrics} metricId={metricId} />
      );
      act(() => {
        renderer = create(<Test metricId="m0" />);
      });
      expect(rendererToString(renderer)).toEqual('m0:');

      act(() => {
        renderer.update(<Test metricId="m1" />);
      });
      expect(rendererToString(renderer)).toEqual('m1:1');

      act(() => {
        store.setCell('t1', 'r2', 'c1', 2);
      });
      expect(rendererToString(renderer)).toEqual('m1:2');

      act(() => {
        renderer.update(<Test metricId="m2" />);
      });
      expect(rendererToString(renderer)).toEqual('m2:2');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('m2:');
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
      act(() => {
        renderer = create(<IndexView indexes={indexes} indexId="i1" />);
      });
      expect(rendererToString(renderer)).toEqual('1');
    });

    test('Separator', () => {
      act(() => {
        store.setCell('t1', 'r2', 'c1', 2);
        renderer = create(
          <IndexView indexes={indexes} indexId="i1" separator="/" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('1/2');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <IndexView indexes={indexes} indexId="i1" debugIds={true} />,
        );
      });
      expect(rendererToString(renderer)).toEqual('i1:{1:{r1:{c1:{1}}}}');
    });

    test('Custom', () => {
      const Test = ({indexId}: {readonly indexId: Id}) => (
        <TestIndexView indexes={indexes} indexId={indexId} cellPrefix=":" />
      );
      act(() => {
        renderer = create(<Test indexId="i0" />);
      });
      expect(rendererToString(renderer)).toEqual('i0:');

      act(() => {
        renderer.update(<Test indexId="i1" />);
      });
      expect(rendererToString(renderer)).toEqual('i1:1:r1:c1:1');

      act(() => {
        store.setCell('t1', 'r2', 'c1', 1);
      });
      expect(rendererToString(renderer)).toEqual('i1:1:r1:c1:1r2:c1:1');

      act(() => {
        renderer = create(<Test indexId="i2" />);
      });
      expect(rendererToString(renderer)).toEqual('i2:2:r1:c1:23:r2:c1:3c2:4');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('i2:');
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
      act(() => {
        renderer = create(
          <SliceView indexes={indexes} indexId="i1" sliceId="1" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('1');
    });

    test('Separator', () => {
      act(() => {
        store.setCell('t1', 'r2', 'c1', 1);
        renderer = create(
          <SliceView
            indexes={indexes}
            indexId="i1"
            sliceId="1"
            separator="/"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('1/1');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <SliceView
            indexes={indexes}
            indexId="i1"
            sliceId="1"
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('1:{r1:{c1:{1}}}');
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

      act(() => {
        renderer = create(<Test indexId="i0" sliceId="0" />);
      });
      expect(rendererToString(renderer)).toEqual('0:');

      act(() => {
        renderer.update(<Test indexId="i1" sliceId="0" />);
      });
      expect(rendererToString(renderer)).toEqual('0:');

      act(() => {
        renderer.update(<Test indexId="i1" sliceId="1" />);
      });
      expect(rendererToString(renderer)).toEqual('1:r1:c1:1');

      act(() => {
        store.setCell('t1', 'r2', 'c1', 1);
      });
      expect(rendererToString(renderer)).toEqual('1:r1:c1:1r2:c1:1');

      act(() => {
        renderer.update(<Test indexId="i2" sliceId="2" />);
      });
      expect(rendererToString(renderer)).toEqual('2:r1:c1:2');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('2:');
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
      act(() => {
        renderer = create(
          <RemoteRowView
            relationships={relationships}
            relationshipId="r1"
            localRowId="r1"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('1');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <RemoteRowView
            relationships={relationships}
            relationshipId="r1"
            localRowId="r1"
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('r1:{R1:{C1:{1}}}');
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
      act(() => {
        renderer = create(<Test relationshipId="r0" localRowId="r0" />);
      });
      expect(rendererToString(renderer)).toEqual('r0:');

      act(() => {
        renderer.update(<Test relationshipId="r1" localRowId="r1" />);
      });
      expect(rendererToString(renderer)).toEqual('r1:R1:C1:1');

      act(() => {
        renderer.update(<Test relationshipId="r1" localRowId="r2" />);
      });
      expect(rendererToString(renderer)).toEqual('r2:R1:C1:1');

      act(() => {
        renderer.update(<Test relationshipId="r1" localRowId="r1" />);
        store.delTable('t1');
      });
      expect(rendererToString(renderer)).toEqual('r1:');

      act(() => {
        renderer.update(<Test relationshipId="r2" localRowId="r2" />);
      });
      expect(rendererToString(renderer)).toEqual('r2:');
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
      act(() => {
        renderer = create(
          <LocalRowsView
            relationships={relationships}
            relationshipId="r1"
            remoteRowId="R1"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('R1R1');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <LocalRowsView
            relationships={relationships}
            relationshipId="r1"
            remoteRowId="R1"
            separator="/"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('R1/R1');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <LocalRowsView
            relationships={relationships}
            relationshipId="r1"
            remoteRowId="R1"
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        'R1:{r1:{c1:{R1}}r2:{c1:{R1}}}',
      );
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

      act(() => {
        renderer = create(<Test relationshipId="r0" remoteRowId="R0" />);
      });
      expect(rendererToString(renderer)).toEqual('R0:');

      act(() => {
        renderer.update(<Test relationshipId="r1" remoteRowId="R1" />);
      });
      expect(rendererToString(renderer)).toEqual('R1:r1:c1:R1r2:c1:R1');

      act(() => {
        renderer.update(<Test relationshipId="r1" remoteRowId="R2" />);
      });
      expect(rendererToString(renderer)).toEqual('R2:');

      act(() => {
        store.delTable('t1');
      });
      expect(rendererToString(renderer)).toEqual('R2:');

      act(() => {
        renderer.update(<Test relationshipId="r2" remoteRowId="R2" />);
      });
      expect(rendererToString(renderer)).toEqual('R2:');
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
      act(() => {
        renderer = create(
          <LinkedRowsView
            relationships={relationships}
            relationshipId="r1"
            firstRowId="r1"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('r2r3r4');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <LinkedRowsView
            relationships={relationships}
            relationshipId="r1"
            firstRowId="r1"
            separator="/"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('r2/r3/r4/');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <LinkedRowsView
            relationships={relationships}
            relationshipId="r1"
            firstRowId="r1"
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        'r1:{r1:{c1:{r2}}r2:{c1:{r3}}r3:{c1:{r4}}r4:{}}',
      );
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

      act(() => {
        renderer = create(<Test relationshipId="r0" firstRowId="r0" />);
      });
      expect(rendererToString(renderer)).toEqual('r0:r0:');

      act(() => {
        renderer.update(<Test relationshipId="r1" firstRowId="r1" />);
      });
      expect(rendererToString(renderer)).toEqual(
        'r1:r1:c1:r2r2:c1:r3r3:c1:r4r4:',
      );

      act(() => {
        renderer.update(<Test relationshipId="r1" firstRowId="r2" />);
      });
      expect(rendererToString(renderer)).toEqual('r2:r2:c1:r3r3:c1:r4r4:');

      act(() => {
        store.delTable('t1');
      });
      expect(rendererToString(renderer)).toEqual('r2:r2:');

      act(() => {
        renderer.update(<Test relationshipId="r2" firstRowId="r2" />);
      });
      expect(rendererToString(renderer)).toEqual('r2:r2:');
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
      act(() => {
        renderer = create(<ResultTableView queries={queries} queryId="q1" />);
      });
      expect(rendererToString(renderer)).toEqual('234');

      act(() => {
        store.setCell('t2', 'r1', 'c2', 5);
      });
      expect(rendererToString(renderer)).toEqual('2534');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <ResultTableView queries={queries} queryId="q1" separator="/" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('2/34');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <ResultTableView queries={queries} queryId="q1" separator="/" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('2/34');

      act(() => {
        renderer = create(
          <ResultTableView queries={queries} queryId="q1" debugIds={true} />,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        'q1:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );
    });

    test('Custom', () => {
      const Test = ({queryId}: {readonly queryId: Id}) => (
        <TestResultTableView
          queries={queries}
          queryId={queryId}
          cellPrefix=":"
        />
      );
      act(() => {
        renderer = create(<Test queryId="q0" />);
      });
      expect(rendererToString(renderer)).toEqual('q0:');

      act(() => {
        renderer.update(<Test queryId="q1" />);
      });
      expect(rendererToString(renderer)).toEqual('q1:r1:c1:2r2:c1:3c2:4');

      act(() => {
        store.setCell('t2', 'r1', 'c1', 3);
      });
      expect(rendererToString(renderer)).toEqual('q1:r1:c1:3r2:c1:3c2:4');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('q1:');
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
      act(() => {
        renderer = create(
          <ResultSortedTableView queries={queries} queryId="q1" cellId="c2" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('234');

      act(() => {
        store.setCell('t2', 'r1', 'c2', 5);
      });
      expect(rendererToString(renderer)).toEqual('3425');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <ResultSortedTableView
            queries={queries}
            queryId="q1"
            cellId="c2"
            separator="/"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('2/34');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <ResultSortedTableView
            queries={queries}
            queryId="q1"
            cellId="c2"
            separator="/"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('2/34');

      act(() => {
        renderer = create(
          <ResultSortedTableView
            queries={queries}
            queryId="q1"
            cellId="c2"
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        'q1:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );

      act(() => {
        renderer = create(
          <ResultSortedTableView
            queries={queries}
            queryId="q1"
            cellId="c2"
            offset={1}
            limit={1}
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('q1:{r2:{c1:{3}c2:{4}}}');
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
      act(() => {
        renderer = create(<Test queryId="q0" cellId="c0" />);
      });
      expect(rendererToString(renderer)).toEqual('q0,c0:');

      act(() => {
        renderer.update(<Test queryId="q1" cellId="c2" />);
      });
      expect(rendererToString(renderer)).toEqual('q1,c2:r1:c1:2r2:c1:3c2:4');

      act(() => {
        store.setCell('t2', 'r1', 'c1', 3);
      });
      expect(rendererToString(renderer)).toEqual('q1,c2:r1:c1:3r2:c1:3c2:4');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('q1,c2:');
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
      act(() => {
        renderer = create(
          <ResultRowView queries={queries} queryId="q1" rowId="r2" />,
        );
      });
      expect(rendererToString(renderer)).toEqual('34');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <ResultRowView
            queries={queries}
            queryId="q1"
            rowId="r2"
            separator="/"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('3/4');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <ResultRowView
            queries={queries}
            queryId="q1"
            rowId="r2"
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('r2:{c1:{3}c2:{4}}');
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
      act(() => {
        renderer = create(<Test queryId="q0" rowId="r0" />);
      });
      expect(rendererToString(renderer)).toEqual('r0:');

      act(() => {
        renderer.update(<Test queryId="q1" rowId="r2" />);
      });
      expect(rendererToString(renderer)).toEqual('r2:c1:3c2:4');

      act(() => {
        store.setCell('t2', 'r2', 'c1', 4);
      });
      expect(rendererToString(renderer)).toEqual('r2:c1:4c2:4');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('r2:');
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
      act(() => {
        renderer = create(
          <ResultCellView
            queries={queries}
            queryId="q1"
            rowId="r2"
            cellId="c1"
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('3');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <ResultCellView
            queries={queries}
            queryId="q1"
            rowId="r2"
            cellId="c1"
            debugIds={true}
          />,
        );
      });
      expect(rendererToString(renderer)).toEqual('c1:{3}');
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
      act(() => {
        renderer = create(<Test queryId="q0" rowId="r0" cellId="c0" />);
      });
      expect(rendererToString(renderer)).toEqual('c0:');

      act(() => {
        renderer.update(<Test queryId="q1" rowId="r2" cellId="c1" />);
      });
      expect(rendererToString(renderer)).toEqual('c1:3');

      act(() => {
        store.setCell('t2', 'r2', 'c1', 4);
      });
      expect(rendererToString(renderer)).toEqual('c1:4');

      act(() => {
        store.delTables();
      });
      expect(rendererToString(renderer)).toEqual('c1:');
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
      act(() => {
        renderer = create(
          <>
            <BackwardCheckpointsView checkpoints={checkpoints} />
            |
            <CurrentCheckpointView checkpoints={checkpoints} />
            |
            <ForwardCheckpointsView checkpoints={checkpoints} />
          </>,
        );
      });
      expect(rendererToString(renderer)).toEqual('c1|c2|c3');
    });

    test('Separator', () => {
      act(() => {
        renderer = create(
          <>
            <BackwardCheckpointsView checkpoints={checkpoints} separator="/" />
            |
            <ForwardCheckpointsView checkpoints={checkpoints} separator="/" />
          </>,
        );
      });
      expect(rendererToString(renderer)).toEqual('c1/|c3/');
    });

    test('Debug Ids', () => {
      act(() => {
        renderer = create(
          <>
            <BackwardCheckpointsView
              checkpoints={checkpoints}
              debugIds={true}
            />
            |
            <CurrentCheckpointView checkpoints={checkpoints} debugIds={true} />
            |
            <ForwardCheckpointsView checkpoints={checkpoints} debugIds={true} />
          </>,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        '0:{c1}1:{}|2:{c2}|3:{c3}4:{}',
      );
    });

    test('Custom', () => {
      const Test = () => <TestAllCheckpointsView checkpoints={checkpoints} />;

      act(() => {
        renderer = create(<Test />);
        checkpoints.clear();
      });
      expect(rendererToString(renderer)).toEqual('||||');

      act(() => {
        checkpoints.setCheckpoint('0', 'c1');
      });
      expect(rendererToString(renderer)).toEqual('|c1|||');

      act(() => {
        store.setTables({t1: {r1: {c1: 2}}});
      });
      expect(rendererToString(renderer)).toEqual('c1||||');

      act(() => {
        checkpoints.addCheckpoint();
      });
      expect(rendererToString(renderer)).toEqual('c1||||');

      act(() => {
        store.setTables({t1: {r1: {c1: 3}}});
      });
      expect(rendererToString(renderer)).toEqual('c1||||');

      act(() => {
        checkpoints.addCheckpoint('c2');
      });
      expect(rendererToString(renderer)).toEqual('c1|c2|||');

      act(() => {
        checkpoints.goTo('0');
      });
      expect(rendererToString(renderer)).toEqual('|c1|c2||');
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
            <h1 onClick={useSetTablesCallback(() => ({t1: {r1: {c1: 2}}}))} />
            <h2 onClick={useDelTablesCallback(undefined, then)} />
          </>
        );
        act(() => {
          renderer = create(
            <Provider store={store}>
              <Test />
            </Provider>,
          );
        });
        expect((renderer.toJSON() as any)[0].children).toEqual([
          '1',
          '2',
          '3',
          '4',
        ]);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({
            t1: {r1: {c1: 1}},
            t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
          }),
        ]);

        act(() => {
          renderer.root.findByType('h1').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['2']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({t1: {r1: {c1: 2}}}),
        ]);

        act(() => {
          renderer.root.findByType('h2').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toBeNull();
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({}),
        ]);
        expect(then).toHaveBeenCalledTimes(1);
      });

      test('for table', () => {
        const then = jest.fn((store1: Store) => expect(store1).toEqual(store));
        const Test = () => (
          <>
            <span>
              <TableView tableId="t1" />
            </span>
            <span>{JSON.stringify(useTable('t1'))}</span>
            <h1 onClick={useSetTableCallback('t1', () => ({r1: {c1: 2}}))} />
            <h2 onClick={useDelTableCallback('t1', undefined, then)} />
          </>
        );
        act(() => {
          renderer = create(
            <Provider store={store}>
              <Test />
            </Provider>,
          );
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['1']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({r1: {c1: 1}}),
        ]);

        act(() => {
          renderer.root.findByType('h1').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['2']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({r1: {c1: 2}}),
        ]);

        act(() => {
          renderer.root.findByType('h2').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toBeNull();
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({}),
        ]);
        expect(then).toHaveBeenCalledTimes(1);
      });

      test('for row', () => {
        const then = jest.fn((store1: Store) => expect(store1).toEqual(store));
        const Test = () => (
          <>
            <span>
              <RowView tableId="t1" rowId="r1" />
            </span>
            <span>{JSON.stringify(useRow('t1', 'r1'))}</span>
            <h1 onClick={useSetRowCallback('t1', 'r1', () => ({c1: 2}))} />
            <h2 onClick={useDelRowCallback('t1', 'r1', undefined, then)} />
          </>
        );
        act(() => {
          renderer = create(
            <Provider store={store}>
              <Test />
            </Provider>,
          );
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['1']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({c1: 1}),
        ]);

        act(() => {
          renderer.root.findByType('h1').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['2']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({c1: 2}),
        ]);

        act(() => {
          renderer.root.findByType('h2').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toBeNull();
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({}),
        ]);
        expect(then).toHaveBeenCalledTimes(1);
      });

      test('for cell', () => {
        const then = jest.fn((store1: Store) => expect(store1).toEqual(store));
        const Test = () => (
          <>
            <span>
              <CellView tableId="t1" rowId="r1" cellId="c1" />
            </span>
            <span>{JSON.stringify(useCell('t1', 'r1', 'c1'))}</span>
            <h1 onClick={useSetCellCallback('t1', 'r1', 'c1', () => 2)} />
            <h2
              onClick={useSetCellCallback(
                't1',
                'r1',
                'c1',
                (e) => e.screenX,
                [],
              )}
            />
            <h3
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
        act(() => {
          renderer = create(
            <Provider store={store}>
              <Test />
            </Provider>,
          );
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['1']);
        expect((renderer.toJSON() as any)[1].children).toEqual(['1']);

        act(() => {
          renderer.root.findByType('h1').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['2']);
        expect((renderer.toJSON() as any)[1].children).toEqual(['2']);

        act(() => {
          renderer.root.findByType('h2').props.onClick({screenX: 3});
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['3']);
        expect((renderer.toJSON() as any)[1].children).toEqual(['3']);

        act(() => {
          renderer.root.findByType('h3').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toBeNull();
        expect((renderer.toJSON() as any)[1].children).toBeNull();
        expect(then).toHaveBeenCalledTimes(1);
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
      act(() => {
        renderer = create(
          <Provider metrics={metrics}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual('11');
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
      act(() => {
        renderer = create(
          <Provider indexes={indexes}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual('1["1"]1["r1"]');
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
      act(() => {
        renderer = create(
          <Provider relationships={relationships}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        '1"R1"R1R1["r1","r2"]R1["r1"]',
      );
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
      act(() => {
        renderer = create(
          <Provider queries={queries}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        '1{"r1":{"c1":1}}["r1"]1{"c1":1}["c1"]11',
      );
    });

    test('checkpoints', () => {
      const checkpoints = createCheckpoints(store);
      const Test = () => <>{JSON.stringify(useCheckpointIds())}</>;
      act(() => {
        renderer = create(
          <Provider checkpoints={checkpoints}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual(JSON.stringify([[], '0', []]));
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
            <h1
              onClick={useSetTablesCallback(
                () => ({t1: {r1: {c1: 2}}}),
                [],
                'store1',
              )}
            />
            <h2 onClick={useDelTablesCallback('store1')} />
          </>
        );
        act(() => {
          renderer = create(
            <Provider storesById={{store1: store}}>
              <Test />
            </Provider>,
          );
        });
        expect((renderer.toJSON() as any)[0].children).toEqual([
          '1',
          '2',
          '3',
          '4',
        ]);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({
            t1: {r1: {c1: 1}},
            t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
          }),
        ]);

        act(() => {
          renderer.root.findByType('h1').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['2']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({t1: {r1: {c1: 2}}}),
        ]);

        act(() => {
          renderer.root.findByType('h2').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toBeNull();
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({}),
        ]);
      });

      test('for table', () => {
        const Test = () => (
          <>
            <span>
              <TableView store="store1" tableId="t1" />
            </span>
            <span>{JSON.stringify(useTable('t1', 'store1'))}</span>
            <h1
              onClick={useSetTableCallback(
                't1',
                () => ({r1: {c1: 2}}),
                [],
                'store1',
              )}
            />
            <h2 onClick={useDelTableCallback('t1', 'store1')} />
          </>
        );
        act(() => {
          renderer = create(
            <Provider storesById={{store1: store}}>
              <Test />
            </Provider>,
          );
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['1']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({r1: {c1: 1}}),
        ]);

        act(() => {
          renderer.root.findByType('h1').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['2']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({r1: {c1: 2}}),
        ]);

        act(() => {
          renderer.root.findByType('h2').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toBeNull();
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({}),
        ]);
      });

      test('for row', () => {
        const Test = () => (
          <>
            <span>
              <RowView store="store1" tableId="t1" rowId="r1" />
            </span>
            <span>{JSON.stringify(useRow('t1', 'r1', 'store1'))}</span>
            <h1
              onClick={useSetRowCallback(
                't1',
                'r1',
                () => ({c1: 2}),
                [],
                'store1',
              )}
            />
            <h2 onClick={useDelRowCallback('t1', 'r1', 'store1')} />
          </>
        );
        act(() => {
          renderer = create(
            <Provider storesById={{store1: store}}>
              <Test />
            </Provider>,
          );
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['1']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({c1: 1}),
        ]);

        act(() => {
          renderer.root.findByType('h1').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['2']);
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({c1: 2}),
        ]);

        act(() => {
          renderer.root.findByType('h2').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toBeNull();
        expect((renderer.toJSON() as any)[1].children).toEqual([
          JSON.stringify({}),
        ]);
      });

      test('for cell', () => {
        const Test = () => (
          <>
            <span>
              <CellView store="store1" tableId="t1" rowId="r1" cellId="c1" />
            </span>
            <span>{JSON.stringify(useCell('t1', 'r1', 'c1', 'store1'))}</span>
            <h1
              onClick={useSetCellCallback(
                't1',
                'r1',
                'c1',
                () => 2,
                [],
                'store1',
              )}
            />
            <h2
              onClick={useSetCellCallback(
                't1',
                'r1',
                'c1',
                (e) => e.screenX,
                [],
                'store1',
              )}
            />
            <h3
              onClick={useDelCellCallback('t1', 'r1', 'c1', false, 'store1')}
            />
          </>
        );
        act(() => {
          renderer = create(
            <Provider storesById={{store1: store}}>
              <Test />
            </Provider>,
          );
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['1']);
        expect((renderer.toJSON() as any)[1].children).toEqual(['1']);

        act(() => {
          renderer.root.findByType('h1').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['2']);
        expect((renderer.toJSON() as any)[1].children).toEqual(['2']);

        act(() => {
          renderer.root.findByType('h2').props.onClick({screenX: 3});
        });
        expect((renderer.toJSON() as any)[0].children).toEqual(['3']);
        expect((renderer.toJSON() as any)[1].children).toEqual(['3']);

        act(() => {
          renderer.root.findByType('h3').props.onClick();
        });
        expect((renderer.toJSON() as any)[0].children).toBeNull();
        expect((renderer.toJSON() as any)[1].children).toBeNull();
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
      act(() => {
        renderer = create(
          <Provider metricsById={{metrics1: metrics}}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual('11');
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
      act(() => {
        renderer = create(
          <Provider indexesById={{indexes1: indexes}}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual('1["1"]1["r1"]');
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
      act(() => {
        renderer = create(
          <Provider relationshipsById={{relationships1: relationships}}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        '1"R1"R1R1["r1","r2"]R1["r1"]',
      );
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
      act(() => {
        renderer = create(
          <Provider queriesById={{queries1: queries}}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual(
        '1{"r1":{"c1":1}}["r1"]1{"c1":1}["c1"]11',
      );
    });

    test('checkpoints', () => {
      const checkpoints = createCheckpoints(store);
      const Test = () => (
        <>{JSON.stringify(useCheckpointIds('checkpoints1'))}</>
      );
      act(() => {
        renderer = create(
          <Provider checkpointsById={{checkpoints1: checkpoints}}>
            <Test />
          </Provider>,
        );
      });
      expect(rendererToString(renderer)).toEqual('[[],"0",[]]');
    });
  });
});
