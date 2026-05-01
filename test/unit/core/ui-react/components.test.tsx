/* eslint-disable react/jsx-no-useless-fragment */
import '@testing-library/jest-dom/vitest';
import {fireEvent, render} from '@testing-library/react';
import type {ComponentType} from 'react';
import {act, createElement, useCallback} from 'react';
import type {
  Checkpoints,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase';
import {
  createCheckpoints,
  createIndexes,
  createMergeableStore,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import type {AnyPersister} from 'tinybase/persisters';
import {createLocalPersister} from 'tinybase/persisters/persister-browser';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
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
  useCheckpoints,
  useDelCellCallback,
  useDelRowCallback,
  useDelTableCallback,
  useDelTablesCallback,
  useIndexes,
  useLinkedRowIds,
  useLocalRowIds,
  useMetric,
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
import * as UiReact from 'tinybase/ui-react/with-schemas';
import type {NoSchemas} from 'tinybase/with-schemas';
import {createStore as createStore2} from 'tinybase/with-schemas';
import {beforeEach, describe, expect, test, vi} from 'vitest';
import {
  testComponents,
  testCustomCheckpointComponents,
  testCustomComponents,
} from '../ui-common/components.ts';

const {Provider: Provider2, useStore: useStore2} =
  UiReact as UiReact.WithSchemas<NoSchemas>;

let store: Store;

type Props = {[key: string]: unknown};

const componentHarness = {
  separator: '/',
  act: async (callback: () => unknown) => {
    await act(async () => {
      callback();
    });
  },
  render: (component: unknown, props: Props) => {
    const Component = component as ComponentType<Props>;
    let currentProps = props;
    const rendered = render(createElement(Component, currentProps));
    return {
      container: rendered.container,
      rerender: async (nextProps: Props) => {
        currentProps = {...currentProps, ...nextProps};
        await act(async () => {
          rendered.rerender(createElement(Component, currentProps));
        });
      },
      unmount: rendered.unmount,
    };
  },
};

const TestIndexView = (props: IndexProps & {readonly cellPrefix?: string}) => (
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

const TestSliceView = (props: SliceProps & {readonly cellPrefix?: string}) => (
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

const TestTableView = (props: TableProps & {readonly cellPrefix?: string}) => (
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

const TestValueView = (props: ValueProps & {readonly valuePrefix?: string}) => (
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

const customComponents = {
  CellView: TestCellView,
  IndexView: TestIndexView,
  LinkedRowsView: TestLinkedRowsView,
  LocalRowsView: TestLocalRowsView,
  MetricView: TestMetricView,
  RemoteRowView: TestRemoteRowView,
  ResultCellView: TestResultCellView,
  ResultRowView: TestResultRowView,
  ResultSortedTableView: TestResultSortedTableView,
  ResultTableView: TestResultTableView,
  RowView: TestRowView,
  SliceView: TestSliceView,
  SortedTableView: TestSortedTableView,
  TableView: TestTableView,
  TablesView: TestTablesView,
  ValueView: TestValueView,
  ValuesView: TestValuesView,
};

const TestCurrentCheckpointView = (props: BackwardCheckpointsProps) => (
  <CurrentCheckpointView
    {...props}
    checkpointComponent={({checkpointId}) => <>current:{checkpointId}</>}
  />
);

testComponents('ui-react', componentHarness, {
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
});

testCustomComponents('ui-react', componentHarness, customComponents);

testCustomCheckpointComponents('ui-react', componentHarness, {
  CheckpointsView: TestAllCheckpointsView,
  CurrentCheckpointView: TestCurrentCheckpointView,
});

describe('React-specific', () => {
  beforeEach(() => {
    store = createStore()
      .setTables({
        t1: {r1: {c1: 1}},
        t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
      })
      .setValues({v1: 3, v2: 4});
  });

  describe('Context Provider', () => {
    describe('default', () => {
      describe('store', () => {
        test('for tables', () => {
          const then = vi.fn((store1: Store) => expect(store1).toEqual(store));
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
            // eslint-disable-next-line max-len
            '1234{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
          );

          fireEvent.click(getAllByRole('button')[0]);
          expect(container.textContent).toEqual('2' + '{"t1":{"r1":{"c1":2}}}');

          fireEvent.click(getAllByRole('button')[1]);
          expect(container.textContent).toEqual('{}');
          expect(then).toHaveBeenCalledTimes(1);

          unmount();
        });

        test('for table', () => {
          const then = vi.fn((store1: Store) => expect(store1).toEqual(store));
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
          const then = vi.fn((store1: Store) => expect(store1).toEqual(store));
          const Test = () => (
            <>
              <span>
                <RowView tableId="t1" rowId="r1" />
              </span>
              <span>{JSON.stringify(useRow('t1', 'r1'))}</span>
              <button
                onClick={useSetRowCallback('t1', 'r1', () => ({c1: 2}))}
              />
              <button
                onClick={useDelRowCallback('t1', 'r1', undefined, then)}
              />
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
          const then = vi.fn((store1: Store) => expect(store1).toEqual(store));
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
        const indexes = createIndexes(store).setIndexDefinition(
          'i1',
          't1',
          'c1',
        );
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
            // eslint-disable-next-line max-len
            '1234{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
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
        const indexes = createIndexes(store).setIndexDefinition(
          'i1',
          't1',
          'c1',
        );
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

    describe('provide', () => {
      test('provideXxx hooks', () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister: AnyPersister = createLocalPersister(store, 'pt');
        const synchronizer: Synchronizer = createLocalSynchronizer(
          createMergeableStore(),
        );

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
        const ProvidedThings = () => (
          <>
            {useStore('store1') == store ? 's' : ''}
            {useMetrics('metrics1') == metrics ? 'm' : ''}
            {useIndexes('indexes1') == indexes ? 'i' : ''}
            {useRelationships('relationships1') == relationships ? 'r' : ''}
            {useQueries('queries1') == queries ? 'q' : ''}
            {useCheckpoints('checkpoints1') == checkpoints ? 'c' : ''}
            {usePersister('persister1') == persister ? 'p' : ''}
            {useSynchronizer('synchronizer1') == synchronizer ? 'z' : ''}
          </>
        );

        const {container, unmount} = render(
          <Provider>
            <ProvideThings />
          </Provider>,
        );
        expect(container.textContent).toEqual('smirqcpz');

        unmount();
        synchronizer.destroy();
      });
    });

    describe('nested defaults', () => {
      test('parentCtx fallbacks', () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister: AnyPersister = createLocalPersister(store, 'nd');
        const synchronizer: Synchronizer = createLocalSynchronizer(
          createMergeableStore(),
        );
        const Test = () => (
          <>
            {useStore() == store ? 's' : ''}
            {useMetrics() == metrics ? 'm' : ''}
            {useIndexes() == indexes ? 'i' : ''}
            {useRelationships() == relationships ? 'r' : ''}
            {useQueries() == queries ? 'q' : ''}
            {useCheckpoints() == checkpoints ? 'c' : ''}
            {usePersister() == persister ? 'p' : ''}
            {useSynchronizer() == synchronizer ? 'z' : ''}
          </>
        );

        const {container, unmount} = render(
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
          </Provider>,
        );
        expect(container.textContent).toEqual('smirqcpz');

        unmount();
        synchronizer.destroy();
      });
    });
  });
});
