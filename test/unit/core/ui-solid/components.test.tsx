/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import {render as solidRender} from 'solid-js/web';
import type {
  Checkpoints,
  Id,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase';
import {
  createCheckpoints,
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import type {AnyPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
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
  Provider,
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
  useCheckpoints,
  useIndexes,
  useMetrics,
  usePersister,
  useProvideCheckpoints,
  useProvideIndexes,
  useProvideMetrics,
  useProvidePersister,
  useProvideQueries,
  useProvideRelationships,
  useProvideStore,
  useProvideSynchronizer,
  useQueries,
  useRelationships,
  useStore,
  useStoreIds,
  useSynchronizer,
  ValuesView,
  ValueView,
} from 'tinybase/ui-solid';
import * as UiSolid from 'tinybase/ui-solid/with-schemas';
import type {NoSchemas} from 'tinybase/with-schemas';
import {createStore as createStore2} from 'tinybase/with-schemas';
import {beforeEach, describe, expect, test} from 'vitest';
import {pause} from '../../common/other.ts';
import {testComponents} from '../ui-common/components.ts';

const {Provider: Provider2, useStore: useStore2} =
  UiSolid as UiSolid.WithSchemas<NoSchemas>;

let store: Store;
const sep = '/';
type Props = {[key: string]: unknown};

const createTestPersister = () => ({}) as unknown as AnyPersister;
const createTestSynchronizer = () => ({}) as unknown as Synchronizer;

const renderSolid = (view: () => JSXElement) => {
  const container = document.createElement('div');
  const unmount = solidRender(view, container);
  return {container, unmount};
};

const render = <Props extends object>(
  Component: (props: Props) => JSXElement,
  options: {props: Props},
) => {
  let props = options.props;
  const container = document.createElement('div');
  let unmount = solidRender(() => <Component {...props} />, container);
  const rerender = async (
    nextProps: Partial<Props> & {[key: string]: unknown},
  ) => {
    unmount();
    props = {...props, ...nextProps};
    unmount = solidRender(() => <Component {...props} />, container);
    await pause();
  };
  return {container, rerender, unmount: () => unmount()};
};

const act = async (cb: () => unknown) => {
  cb();
  await pause();
};

const expectText = async (
  container: HTMLElement,
  textContent: string,
): Promise<void> => {
  await pause();
  expect(container.textContent).toEqual(textContent);
};

testComponents(
  'ui-solid',
  {
    separator: sep,
    act: async (callback) => {
      callback();
      await pause();
    },
    render: (component, props) => {
      const Component = component as (props: Props) => JSXElement;
      let currentProps = props;
      const container = document.createElement('div');
      let unmount = solidRender(
        () => <Component {...currentProps} />,
        container,
      );
      return {
        container,
        rerender: async (nextProps) => {
          unmount();
          currentProps = {...currentProps, ...nextProps};
          unmount = solidRender(
            () => <Component {...currentProps} />,
            container,
          );
          await pause();
        },
        unmount: () => unmount(),
      };
    },
  },
  {
    BackwardCheckpointsView,
    CellView,
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
    TableView,
    TablesView,
    ValueView,
    ValuesView,
  },
);

describe('Specific', () => {
  beforeEach(() => {
    store = createStore()
      .setTables({
        t1: {r1: {c1: 1}},
        t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
      })
      .setValues({v1: 3, v2: 4});
  });

  describe('Read Components', () => {
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

    const TestCellView = (
      props: CellProps & {readonly cellPrefix?: string},
    ) => (
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

    describe('TablesView', () => {
      test('Basic', () => {
        const {container, unmount} = render(TablesView, {props: {store}});
        expect(container.textContent).toEqual('1234');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(TablesView, {
          props: {store, separator: sep},
        });
        expect(container.textContent).toEqual('1/234');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(TablesView, {
          props: {store, debugIds: true},
        });
        expect(container.textContent).toEqual(
          't1:{r1:{c1:{1}}}t2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
        );
        unmount();
      });

      test('Custom', async () => {
        const {container, unmount} = render(TestTablesView, {
          props: {store, cellPrefix: ':'},
        });
        expect(container.textContent).toEqual(
          't1:r1:c1:1t2:r1:c1:2r2:c1:3c2:4',
        );

        await act(() => store.setCell('t1', 'r1', 'c1', 2));
        expect(container.textContent).toEqual(
          't1:r1:c1:2t2:r1:c1:2r2:c1:3c2:4',
        );

        await act(() => store.delTables());
        expect(container.textContent).toEqual('');

        unmount();
      });
    });

    describe('TableView', () => {
      test('Basic', () => {
        const {container, unmount} = render(TableView, {
          props: {store, tableId: 't2'},
        });
        expect(container.textContent).toEqual('234');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(TableView, {
          props: {store, tableId: 't2', separator: sep},
        });
        expect(container.textContent).toEqual('2/34');
        unmount();
      });

      test('Debug Ids', async () => {
        const {container, rerender, unmount} = render(TableView, {
          props: {store, tableId: 't2', separator: sep},
        });
        expect(container.textContent).toEqual('2/34');

        await rerender({tableId: 't2', debugIds: true, separator: undefined});
        expect(container.textContent).toEqual(
          't2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
        );
        unmount();
      });

      test('Debug Ids with null tableId', () => {
        const {container, unmount} = render(TableView, {
          props: {store, tableId: null as any, debugIds: true},
        });
        expect(container.textContent).toEqual(':{}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestTableView, {
          props: {store, tableId: 't0', cellPrefix: ':'},
        });
        expect(container.textContent).toEqual('t0:');

        await rerender({tableId: 't2'});
        expect(container.textContent).toEqual('t2:r1:c1:2r2:c1:3c2:4');

        await act(() => store.setCell('t2', 'r1', 'c1', 3));
        expect(container.textContent).toEqual('t2:r1:c1:3r2:c1:3c2:4');

        await act(() => store.delTables());
        expect(container.textContent).toEqual('t2:');

        unmount();
      });
    });

    describe('SortedTableView', () => {
      test('Basic', () => {
        const {container, unmount} = render(SortedTableView, {
          props: {store, tableId: 't2', cellId: 'c1', descending: true},
        });
        expect(container.textContent).toEqual('342');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(SortedTableView, {
          props: {
            store,
            tableId: 't2',
            cellId: 'c1',
            descending: true,
            separator: sep,
          },
        });
        expect(container.textContent).toEqual('34/2');
        unmount();
      });

      test('Debug Ids', async () => {
        const {container, rerender, unmount} = render(SortedTableView, {
          props: {
            store,
            tableId: 't2',
            cellId: 'c1',
            descending: true,
            separator: sep,
          },
        });
        expect(container.textContent).toEqual('34/2');

        await rerender({
          tableId: 't2',
          cellId: 'c1',
          descending: true,
          debugIds: true,
          separator: undefined,
        });
        expect(container.textContent).toEqual(
          't2:{r2:{c1:{3}c2:{4}}r1:{c1:{2}}}',
        );

        await rerender({
          tableId: 't2',
          cellId: 'c1',
          offset: 1,
          limit: 1,
          descending: undefined,
          debugIds: true,
        });
        expect(container.textContent).toEqual('t2:{r2:{c1:{3}c2:{4}}}');

        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestSortedTableView, {
          props: {
            store,
            tableId: 't0',
            cellId: 'c0',
            descending: true,
            cellPrefix: ':',
          },
        });
        expect(container.textContent).toEqual('t0,c0:');

        await rerender({tableId: 't2', cellId: 'c1'});
        expect(container.textContent).toEqual('t2,c1:r2:c1:3c2:4r1:c1:2');

        await act(() => store.setCell('t2', 'r1', 'c1', 3));
        expect(container.textContent).toEqual('t2,c1:r2:c1:3c2:4r1:c1:3');

        await act(() => store.delTables());
        expect(container.textContent).toEqual('t2,c1:');

        unmount();
      });
    });

    describe('RowView', () => {
      test('Basic', () => {
        const {container, unmount} = render(RowView, {
          props: {store, tableId: 't2', rowId: 'r2'},
        });
        expect(container.textContent).toEqual('34');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(RowView, {
          props: {store, tableId: 't2', rowId: 'r2', separator: sep},
        });
        expect(container.textContent).toEqual('3/4');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(RowView, {
          props: {store, tableId: 't2', rowId: 'r2', debugIds: true},
        });
        expect(container.textContent).toEqual('r2:{c1:{3}c2:{4}}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestRowView, {
          props: {store, tableId: 't0', rowId: 'r0', cellPrefix: ':'},
        });
        expect(container.textContent).toEqual('r0:');

        await rerender({tableId: 't2', rowId: 'r2'});
        expect(container.textContent).toEqual('r2:c1:3c2:4');

        await act(() => store.setCell('t2', 'r2', 'c1', 4));
        expect(container.textContent).toEqual('r2:c1:4c2:4');

        await act(() => store.delTables());
        expect(container.textContent).toEqual('r2:');

        unmount();
      });
    });

    describe('CellView', () => {
      test('Basic', () => {
        const {container, unmount} = render(CellView, {
          props: {store, tableId: 't2', rowId: 'r2', cellId: 'c2'},
        });
        expect(container.textContent).toEqual('4');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(CellView, {
          props: {
            store,
            tableId: 't2',
            rowId: 'r2',
            cellId: 'c2',
            debugIds: true,
          },
        });
        expect(container.textContent).toEqual('c2:{4}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestCellView, {
          props: {
            store,
            tableId: 't0',
            rowId: 'r0',
            cellId: 'c0',
            cellPrefix: ':',
          },
        });
        expect(container.textContent).toEqual('c0:');

        await rerender({tableId: 't2', rowId: 'r2', cellId: 'c2'});
        expect(container.textContent).toEqual('c2:4');

        await act(() => store.setCell('t2', 'r2', 'c2', 5));
        expect(container.textContent).toEqual('c2:5');

        await act(() => store.delTables());
        expect(container.textContent).toEqual('c2:');

        unmount();
      });
    });

    describe('ValuesView', () => {
      test('Basic', () => {
        const {container, unmount} = render(ValuesView, {props: {store}});
        expect(container.textContent).toEqual('34');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(ValuesView, {
          props: {store, separator: sep},
        });
        expect(container.textContent).toEqual('3/4');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(ValuesView, {
          props: {store, debugIds: true},
        });
        expect(container.textContent).toEqual('v1:{3}v2:{4}');
        unmount();
      });

      test('Custom', async () => {
        const {container, unmount} = render(TestValuesView, {
          props: {store, valuePrefix: ':'},
        });
        expect(container.textContent).toEqual('v1:3v2:4');

        await act(() => store.setValue('v1', 4));
        expect(container.textContent).toEqual('v1:4v2:4');

        await act(() => store.delValues());
        expect(container.textContent).toEqual('');

        unmount();
      });
    });

    describe('ValueView', () => {
      test('Basic', () => {
        const {container, unmount} = render(ValueView, {
          props: {store, valueId: 'v2'},
        });
        expect(container.textContent).toEqual('4');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(ValueView, {
          props: {store, valueId: 'v2', debugIds: true},
        });
        expect(container.textContent).toEqual('v2:{4}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestValueView, {
          props: {store, valueId: 'v0', valuePrefix: ':'},
        });
        expect(container.textContent).toEqual('v0:');

        await rerender({valueId: 'v2'});
        expect(container.textContent).toEqual('v2:4');

        await act(() => store.setValue('v2', 5));
        expect(container.textContent).toEqual('v2:5');

        await act(() => store.delValues());
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
        const {container, unmount} = render(MetricView, {
          props: {metrics, metricId: 'm1'},
        });
        expect(container.textContent).toEqual('1');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(MetricView, {
          props: {metrics, metricId: 'm1', debugIds: true},
        });
        expect(container.textContent).toEqual('m1:{1}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestMetricView, {
          props: {metrics, metricId: 'm0'},
        });
        expect(container.textContent).toEqual('m0:');

        await rerender({metricId: 'm1'});
        expect(container.textContent).toEqual('m1:1');

        await act(() => store.setCell('t1', 'r2', 'c1', 2));
        expect(container.textContent).toEqual('m1:2');

        await rerender({metricId: 'm2'});
        expect(container.textContent).toEqual('m2:2');

        await act(() => store.delTables());
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
        const {container, unmount} = render(IndexView, {
          props: {indexes, indexId: 'i1'},
        });
        expect(container.textContent).toEqual('1');
        unmount();
      });

      test('Separator', async () => {
        store.setCell('t1', 'r2', 'c1', 2);
        const {container, unmount} = render(IndexView, {
          props: {indexes, indexId: 'i1', separator: sep},
        });
        expect(container.textContent).toEqual('1/2');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(IndexView, {
          props: {indexes, indexId: 'i1', debugIds: true},
        });
        expect(container.textContent).toEqual('i1:{1:{r1:{c1:{1}}}}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestIndexView, {
          props: {indexes, indexId: 'i0', cellPrefix: ':'},
        });
        expect(container.textContent).toEqual('i0:');

        await rerender({indexId: 'i1'});
        expect(container.textContent).toEqual('i1:1:r1:c1:1');

        await act(() => store.setCell('t1', 'r2', 'c1', 1));
        expect(container.textContent).toEqual('i1:1:r1:c1:1r2:c1:1');

        await rerender({indexId: 'i2'});
        expect(container.textContent).toEqual('i2:2:r1:c1:23:r2:c1:3c2:4');

        await act(() => store.delTables());
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
        const {container, unmount} = render(SliceView, {
          props: {indexes, indexId: 'i1', sliceId: '1'},
        });
        expect(container.textContent).toEqual('1');
        unmount();
      });

      test('Separator', () => {
        store.setCell('t1', 'r2', 'c1', 1);
        const {container, unmount} = render(SliceView, {
          props: {indexes, indexId: 'i1', sliceId: '1', separator: sep},
        });
        expect(container.textContent).toEqual('1/1');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(SliceView, {
          props: {indexes, indexId: 'i1', sliceId: '1', debugIds: true},
        });
        expect(container.textContent).toEqual('1:{r1:{c1:{1}}}');
        unmount();
      });

      test('Falsy tableId renders rows', () => {
        store.setTable('', {r1: {c1: 1}});
        indexes.setIndexDefinition('i0', '' as any, 'c1');
        const {container, unmount} = render(SliceView, {
          props: {indexes, indexId: 'i0', sliceId: '1'},
        });
        expect(container.textContent).toEqual('1');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestSliceView, {
          props: {indexes, indexId: 'i0', sliceId: '0', cellPrefix: ':'},
        });
        expect(container.textContent).toEqual('0:');

        await rerender({indexId: 'i1', sliceId: '0'});
        expect(container.textContent).toEqual('0:');

        await rerender({indexId: 'i1', sliceId: '1'});
        expect(container.textContent).toEqual('1:r1:c1:1');

        await act(() => store.setCell('t1', 'r2', 'c1', 1));
        expect(container.textContent).toEqual('1:r1:c1:1r2:c1:1');

        await rerender({indexId: 'i2', sliceId: '2'});
        expect(container.textContent).toEqual('2:r1:c1:2');

        await act(() => store.delTables());
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
        const {container, unmount} = render(RemoteRowView, {
          props: {relationships, relationshipId: 'r1', localRowId: 'r1'},
        });
        expect(container.textContent).toEqual('1');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(RemoteRowView, {
          props: {
            relationships,
            relationshipId: 'r1',
            localRowId: 'r1',
            debugIds: true,
          },
        });
        expect(container.textContent).toEqual('r1:{R1:{C1:{1}}}');
        unmount();
      });

      test('Debug Ids with null localRowId', () => {
        const {container, unmount} = render(RemoteRowView, {
          props: {
            relationships,
            relationshipId: 'r1',
            localRowId: null as any,
            debugIds: true,
          },
        });
        expect(container.textContent).toEqual(':{}');
        unmount();
      });

      test('Missing remote table skips row rendering', () => {
        relationships.setRelationshipDefinition(
          'r3',
          't1',
          undefined as any,
          'c1',
        );
        const {container, unmount} = render(RemoteRowView, {
          props: {relationships, relationshipId: 'r3', localRowId: 'r1'},
        });
        expect(container.textContent).toEqual('');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestRemoteRowView, {
          props: {
            relationships,
            relationshipId: 'r0',
            localRowId: 'r0',
            cellPrefix: ':',
          },
        });
        expect(container.textContent).toEqual('r0:');

        await rerender({relationshipId: 'r1', localRowId: 'r1'});
        expect(container.textContent).toEqual('r1:R1:C1:1');

        await rerender({relationshipId: 'r1', localRowId: 'r2'});
        expect(container.textContent).toEqual('r2:R1:C1:1');

        await rerender({relationshipId: 'r1', localRowId: 'r1'});
        await act(() => store.delTable('t1'));
        expect(container.textContent).toEqual('r1:');

        await rerender({relationshipId: 'r2', localRowId: 'r2'});
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
        const {container, unmount} = render(LocalRowsView, {
          props: {relationships, relationshipId: 'r1', remoteRowId: 'R1'},
        });
        expect(container.textContent).toEqual('R1R1');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(LocalRowsView, {
          props: {
            relationships,
            relationshipId: 'r1',
            remoteRowId: 'R1',
            separator: sep,
          },
        });
        expect(container.textContent).toEqual('R1/R1');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(LocalRowsView, {
          props: {
            relationships,
            relationshipId: 'r1',
            remoteRowId: 'R1',
            debugIds: true,
          },
        });
        expect(container.textContent).toEqual('R1:{r1:{c1:{R1}}r2:{c1:{R1}}}');
        unmount();
      });

      test('Falsy localTableId renders rows', () => {
        store.setTable('', {r1: {c1: 'R1'}, r2: {c1: 'R1'}});
        relationships.setRelationshipDefinition('r0', '' as any, 'T1', 'c1');
        const {container, unmount} = render(LocalRowsView, {
          props: {relationships, relationshipId: 'r0', remoteRowId: 'R1'},
        });
        expect(container.textContent).toEqual('R1R1');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestLocalRowsView, {
          props: {
            relationships,
            relationshipId: 'r0',
            remoteRowId: 'R0',
            cellPrefix: ':',
          },
        });
        expect(container.textContent).toEqual('R0:');

        await rerender({relationshipId: 'r1', remoteRowId: 'R1'});
        expect(container.textContent).toEqual('R1:r1:c1:R1r2:c1:R1');

        await rerender({relationshipId: 'r1', remoteRowId: 'R2'});
        expect(container.textContent).toEqual('R2:');

        await act(() => store.delTable('t1'));
        expect(container.textContent).toEqual('R2:');

        await rerender({relationshipId: 'r2', remoteRowId: 'R2'});
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
        const {container, unmount} = render(LinkedRowsView, {
          props: {relationships, relationshipId: 'r1', firstRowId: 'r1'},
        });
        expect(container.textContent).toEqual('r2r3r4');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(LinkedRowsView, {
          props: {
            relationships,
            relationshipId: 'r1',
            firstRowId: 'r1',
            separator: sep,
          },
        });
        expect(container.textContent).toEqual('r2/r3/r4/');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(LinkedRowsView, {
          props: {
            relationships,
            relationshipId: 'r1',
            firstRowId: 'r1',
            debugIds: true,
          },
        });
        expect(container.textContent).toEqual(
          'r1:{r1:{c1:{r2}}r2:{c1:{r3}}r3:{c1:{r4}}r4:{}}',
        );
        unmount();
      });

      test('Falsy localTableId renders rows', () => {
        store.setTable('', {
          r1: {c1: 'r2'},
          r2: {c1: 'r3'},
          r3: {c1: 'r4'},
        });
        relationships.setRelationshipDefinition(
          'r0',
          '' as any,
          '' as any,
          'c1',
        );
        const {container, unmount} = render(LinkedRowsView, {
          props: {relationships, relationshipId: 'r0', firstRowId: 'r1'},
        });
        expect(container.textContent).toEqual('r2r3r4');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestLinkedRowsView, {
          props: {
            relationships,
            relationshipId: 'r0',
            firstRowId: 'r0',
            cellPrefix: ':',
          },
        });
        expect(container.textContent).toEqual('r0:r0:');

        await rerender({relationshipId: 'r1', firstRowId: 'r1'});
        expect(container.textContent).toEqual('r1:r1:c1:r2r2:c1:r3r3:c1:r4r4:');

        await act(() => store.setCell('t1', 'r2', 'c1', 'r4'));
        expect(container.textContent).toEqual('r1:r1:c1:r2r2:c1:r4r4:');

        await act(() => store.delTables());
        expect(container.textContent).toEqual('r1:r1:');

        unmount();
      });
    });

    describe('ResultTableView', () => {
      let queries: Queries;

      beforeEach(() => {
        queries = createQueries(store)
          .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
          .setQueryDefinition('q2', 't2', ({select}) => select('c1'));
      });

      test('Basic', () => {
        const {container, unmount} = render(ResultTableView, {
          props: {queries, queryId: 'q1'},
        });
        expect(container.textContent).toEqual('1');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(ResultTableView, {
          props: {queries, queryId: 'q2', separator: sep},
        });
        expect(container.textContent).toEqual('2/3');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(ResultTableView, {
          props: {queries, queryId: 'q1', debugIds: true},
        });
        expect(container.textContent).toEqual('q1:{r1:{c1:{1}}}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestResultTableView, {
          props: {queries, queryId: 'q0', cellPrefix: ':'},
        });
        expect(container.textContent).toEqual('q0:');

        await rerender({queryId: 'q1'});
        expect(container.textContent).toEqual('q1:r1:c1:1');

        await act(() => store.setCell('t1', 'r2', 'c1', 2));
        expect(container.textContent).toEqual('q1:r1:c1:1r2:c1:2');

        await rerender({queryId: 'q2'});
        expect(container.textContent).toEqual('q2:r1:c1:2r2:c1:3');

        await act(() => store.delTables());
        expect(container.textContent).toEqual('q2:');

        unmount();
      });
    });

    describe('ResultSortedTableView', () => {
      let queries: Queries;

      beforeEach(() => {
        queries = createQueries(store)
          .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
          .setQueryDefinition('q2', 't2', ({select}) => select('c1'));
      });

      test('Basic', () => {
        const {container, unmount} = render(ResultSortedTableView, {
          props: {queries, queryId: 'q2', cellId: 'c1', descending: true},
        });
        expect(container.textContent).toEqual('32');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(ResultSortedTableView, {
          props: {
            queries,
            queryId: 'q2',
            cellId: 'c1',
            descending: true,
            separator: sep,
          },
        });
        expect(container.textContent).toEqual('3/2');
        unmount();
      });

      test('Debug Ids', async () => {
        const {container, rerender, unmount} = render(ResultSortedTableView, {
          props: {
            queries,
            queryId: 'q2',
            cellId: 'c1',
            descending: true,
            separator: sep,
          },
        });
        expect(container.textContent).toEqual('3/2');

        await rerender({
          queryId: 'q2',
          cellId: 'c1',
          descending: true,
          debugIds: true,
          separator: undefined,
        });
        expect(container.textContent).toEqual('q2:{r2:{c1:{3}}r1:{c1:{2}}}');

        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(
          TestResultSortedTableView,
          {
            props: {queries, queryId: 'q0', cellId: 'c0', cellPrefix: ':'},
          },
        );
        expect(container.textContent).toEqual('q0,c0:');

        await rerender({queryId: 'q2', cellId: 'c1'});
        expect(container.textContent).toEqual('q2,c1:r1:c1:2r2:c1:3');

        await act(() => store.setCell('t2', 'r1', 'c1', 4));
        expect(container.textContent).toEqual('q2,c1:r2:c1:3r1:c1:4');

        await act(() => store.delTables());
        expect(container.textContent).toEqual('q2,c1:');

        unmount();
      });
    });

    describe('ResultRowView', () => {
      let queries: Queries;

      beforeEach(() => {
        queries = createQueries(store)
          .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
          .setQueryDefinition('q2', 't2', ({select}) => {
            select('c1');
            select('c2');
          });
      });

      test('Basic', () => {
        const {container, unmount} = render(ResultRowView, {
          props: {queries, queryId: 'q2', rowId: 'r2'},
        });
        expect(container.textContent).toEqual('34');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(ResultRowView, {
          props: {queries, queryId: 'q2', rowId: 'r2', separator: sep},
        });
        expect(container.textContent).toEqual('3/4');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(ResultRowView, {
          props: {queries, queryId: 'q2', rowId: 'r2', debugIds: true},
        });
        expect(container.textContent).toEqual('r2:{c1:{3}c2:{4}}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestResultRowView, {
          props: {queries, queryId: 'q0', rowId: 'r0', cellPrefix: ':'},
        });
        expect(container.textContent).toEqual('r0:');

        await rerender({queryId: 'q1', rowId: 'r1'});
        expect(container.textContent).toEqual('r1:c1:1');

        await act(() => store.setCell('t1', 'r1', 'c1', 2));
        expect(container.textContent).toEqual('r1:c1:2');

        await rerender({queryId: 'q2', rowId: 'r2'});
        expect(container.textContent).toEqual('r2:c1:3c2:4');

        await act(() => store.delTables());
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
          ({select}) => {
            select('c1');
            select('c2');
          },
        );
      });

      test('Basic', () => {
        const {container, unmount} = render(ResultCellView, {
          props: {queries, queryId: 'q1', rowId: 'r2', cellId: 'c2'},
        });
        expect(container.textContent).toEqual('4');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(ResultCellView, {
          props: {
            queries,
            queryId: 'q1',
            rowId: 'r2',
            cellId: 'c2',
            debugIds: true,
          },
        });
        expect(container.textContent).toEqual('c2:{4}');
        unmount();
      });

      test('Custom', async () => {
        const {container, rerender, unmount} = render(TestResultCellView, {
          props: {
            queries,
            queryId: 'q0',
            rowId: 'r0',
            cellId: 'c0',
            cellPrefix: ':',
          },
        });
        expect(container.textContent).toEqual('c0:');

        await rerender({queryId: 'q1', rowId: 'r2', cellId: 'c2'});
        expect(container.textContent).toEqual('c2:4');

        await act(() => store.setCell('t2', 'r2', 'c2', 5));
        expect(container.textContent).toEqual('c2:5');

        await act(() => store.delTables());
        expect(container.textContent).toEqual('c2:');

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
        const {container, unmount} = render(BackwardCheckpointsView, {
          props: {checkpoints},
        });
        expect(container.textContent).toEqual('c1');
        unmount();
      });

      test('Separator', () => {
        const {container, unmount} = render(BackwardCheckpointsView, {
          props: {checkpoints, separator: sep},
        });
        expect(container.textContent).toEqual('c1/');
        unmount();
      });

      test('Debug Ids', () => {
        const {container, unmount} = render(BackwardCheckpointsView, {
          props: {checkpoints, debugIds: true},
        });
        expect(container.textContent).toEqual('0:{c1}1:{}');
        unmount();
      });

      test('Custom', async () => {
        const {container, unmount} = render(TestAllCheckpointsView, {
          props: {checkpoints},
        });
        await act(() => checkpoints.clear());
        expect(container.textContent).toEqual('||||');

        await act(() => checkpoints.setCheckpoint('0', 'c1'));
        expect(container.textContent).toEqual('|c1|||');

        await act(() => store.setTables({t1: {r1: {c1: 2}}}));
        expect(container.textContent).toEqual('c1||||');

        await act(() => checkpoints.addCheckpoint());
        expect(container.textContent).toEqual('c1||||');

        await act(() => store.setTables({t1: {r1: {c1: 3}}}));
        expect(container.textContent).toEqual('c1||||');

        await act(() => checkpoints.addCheckpoint('c2'));
        expect(container.textContent).toEqual('c1|c2|||');

        await act(() => checkpoints.goTo('0'));
        expect(container.textContent).toEqual('|c1|c2||');

        unmount();
      });
    });
    describe('context provider', () => {
      test('merges nested stores from the same provider', async () => {
        const store1 = createStore();
        const store2 = createStore();
        const Test = () => {
          const storeIds = useStoreIds();
          const storeA = useStore('a');
          const storeB = useStore('b');
          return (
            <>
              {JSON.stringify(storeIds())}
              {storeA() == store1 ? 1 : 0}
              {storeA() == store2 ? 1 : 0}
              {storeB() == store1 ? 1 : 0}
              {storeB() == store2 ? 1 : 0}
            </>
          );
        };
        const rendered = renderSolid(() => (
          <Provider storesById={{a: store1}}>
            <Provider storesById={{b: store2}}>
              <Test />
            </Provider>
          </Provider>
        ));

        await expectText(rendered.container, '["a","b"]1001');

        rendered.unmount();
      });

      test('merges nested stores from different providers', async () => {
        const store1 = createStore();
        const store2 = createStore2();
        const Test = () => {
          const storeIds = useStoreIds();
          const storeA = useStore('a');
          const store2A = useStore2('a');
          const storeB = useStore('b');
          const store2B = useStore2('b');
          return (
            <>
              {JSON.stringify(storeIds())}
              {storeA() == store1 ? 1 : 0}
              {store2A() == store2 ? 1 : 0}
              {storeB() == store1 ? 1 : 0}
              {store2B() == store2 ? 1 : 0}
            </>
          );
        };
        const rendered = renderSolid(() => (
          <Provider storesById={{a: store1}}>
            <Provider2 storesById={{b: store2}}>
              <Test />
            </Provider2>
          </Provider>
        ));

        await expectText(rendered.container, '["a","b"]1001');

        rendered.unmount();
      });

      test('supports provideXxx primitives', async () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister = createTestPersister();
        const synchronizer = createTestSynchronizer();

        const ProvidedThings = () => {
          const providedStore = useStore('store1');
          const providedMetrics = useMetrics('metrics1');
          const providedIndexes = useIndexes('indexes1');
          const providedRelationships = useRelationships('relationships1');
          const providedQueries = useQueries('queries1');
          const providedCheckpoints = useCheckpoints('checkpoints1');
          const providedPersister = usePersister('persister1');
          const providedSynchronizer = useSynchronizer('synchronizer1');
          return (
            <>
              {providedStore() == store ? 's' : ''}
              {providedMetrics() == metrics ? 'm' : ''}
              {providedIndexes() == indexes ? 'i' : ''}
              {providedRelationships() == relationships ? 'r' : ''}
              {providedQueries() == queries ? 'q' : ''}
              {providedCheckpoints() == checkpoints ? 'c' : ''}
              {providedPersister() == persister ? 'p' : ''}
              {providedSynchronizer() == synchronizer ? 'z' : ''}
            </>
          );
        };
        const ProvideThings = () => {
          useProvideStore('store1', store);
          useProvideMetrics('metrics1', metrics);
          useProvideIndexes('indexes1', indexes);
          useProvideRelationships('relationships1', relationships);
          useProvideQueries('queries1', queries);
          useProvideCheckpoints('checkpoints1', checkpoints);
          useProvidePersister('persister1', persister);
          useProvideSynchronizer('synchronizer1', synchronizer);
          return <ProvidedThings />;
        };
        const rendered = renderSolid(() => (
          <Provider>
            <ProvideThings />
          </Provider>
        ));

        await expectText(rendered.container, 'smirqcpz');

        rendered.unmount();
      });

      test('uses parent context fallbacks for nested defaults', async () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister = createTestPersister();
        const synchronizer = createTestSynchronizer();

        const Test = () => {
          const providedStore = useStore();
          const providedMetrics = useMetrics();
          const providedIndexes = useIndexes();
          const providedRelationships = useRelationships();
          const providedQueries = useQueries();
          const providedCheckpoints = useCheckpoints();
          const providedPersister = usePersister();
          const providedSynchronizer = useSynchronizer();
          return (
            <>
              {providedStore() == store ? 's' : ''}
              {providedMetrics() == metrics ? 'm' : ''}
              {providedIndexes() == indexes ? 'i' : ''}
              {providedRelationships() == relationships ? 'r' : ''}
              {providedQueries() == queries ? 'q' : ''}
              {providedCheckpoints() == checkpoints ? 'c' : ''}
              {providedPersister() == persister ? 'p' : ''}
              {providedSynchronizer() == synchronizer ? 'z' : ''}
            </>
          );
        };
        const rendered = renderSolid(() => (
          <Provider
            store={store}
            metrics={metrics}
            indexes={indexes}
            relationships={relationships}
            queries={queries}
            checkpoints={checkpoints}
            persister={persister}
            synchronizer={synchronizer}
          >
            <Provider>
              <Test />
            </Provider>
          </Provider>
        ));

        await expectText(rendered.container, 'smirqcpz');

        rendered.unmount();
      });
    });
  });
});
