import {act, fireEvent, render} from '@testing-library/svelte';
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
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import {createMergeableStore} from 'tinybase/mergeable-store';
import type {AnyPersister} from 'tinybase/persisters';
import {createSessionPersister} from 'tinybase/persisters/persister-browser';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
import {beforeEach, describe, expect, test, vi} from 'vitest';

import ListenerFunctionCheckpoint from './components/ListenerFunctionCheckpoint.svelte';
import ListenerFunctionCheckpointIds from './components/ListenerFunctionCheckpointIds.svelte';
import ListenerFunctionLinkedRowIds from './components/ListenerFunctionLinkedRowIds.svelte';
import ListenerFunctionLocalRowIds from './components/ListenerFunctionLocalRowIds.svelte';
import ListenerFunctionMetric from './components/ListenerFunctionMetric.svelte';
import ListenerFunctionParamValue from './components/ListenerFunctionParamValue.svelte';
import ListenerFunctionParamValues from './components/ListenerFunctionParamValues.svelte';
import ListenerFunctionPersisterStatus from './components/ListenerFunctionPersisterStatus.svelte';
import ListenerFunctionRemoteRowId from './components/ListenerFunctionRemoteRowId.svelte';
import ListenerFunctionResultCell from './components/ListenerFunctionResultCell.svelte';
import ListenerFunctionResultCellIds from './components/ListenerFunctionResultCellIds.svelte';
import ListenerFunctionResultRow from './components/ListenerFunctionResultRow.svelte';
import ListenerFunctionResultRowCount from './components/ListenerFunctionResultRowCount.svelte';
import ListenerFunctionResultRowIds from './components/ListenerFunctionResultRowIds.svelte';
import ListenerFunctionResultSortedRowIds from './components/ListenerFunctionResultSortedRowIds.svelte';
import ListenerFunctionResultTable from './components/ListenerFunctionResultTable.svelte';
import ListenerFunctionResultTableCellIds from './components/ListenerFunctionResultTableCellIds.svelte';
import ListenerFunctionSliceIds from './components/ListenerFunctionSliceIds.svelte';
import ListenerFunctionSliceRowIds from './components/ListenerFunctionSliceRowIds.svelte';
import ListenerFunctionSynchronizerStatus from './components/ListenerFunctionSynchronizerStatus.svelte';

import {
  testCheckpointCallbackFunctions,
  testStoreListenerFunctions,
  testStoreReadFunctions,
} from '../ui-common/functions.ts';
import {testContextPrimitives} from '../ui-common/primitives.ts';
import CallbackFunction from './components/CallbackFunction.svelte';
import ContextPrimitiveNoContext from './components/ContextPrimitiveNoContext.svelte';
import ContextPrimitiveThings from './components/ContextPrimitiveThings.svelte';
import FunctionPersisterStatus from './components/FunctionPersisterStatus.svelte';
import FunctionReader from './components/FunctionReader.svelte';
import FunctionSynchronizerStatus from './components/FunctionSynchronizerStatus.svelte';
import FunctionWindowlessCoverage from './components/FunctionWindowlessCoverage.svelte';
import FunctionWritableCell from './components/FunctionWritableCell.svelte';
import FunctionWritableValue from './components/FunctionWritableValue.svelte';
import ListenerFunction from './components/ListenerFunction.svelte';
import ProvideThings from './components/TestProvide.svelte';

let store: Store;

beforeEach(() => {
  store = createStore()
    .setTables({t1: {r1: {c1: 1}}})
    .setValues({v1: 1});
});

type SvelteComponent = Parameters<typeof render>[0];

const primitiveHarness = {
  act: async (callback: () => unknown) => {
    await act(() => callback());
  },
  render: (component: unknown, props: {[key: string]: unknown}) => {
    let currentProps = props;
    const rendered = render(component as SvelteComponent, {props});
    return {
      container: rendered.container,
      rerender: async (nextProps: {[key: string]: unknown}) => {
        currentProps = {...currentProps, ...nextProps};
        await rendered.rerender(currentProps);
      },
      unmount: rendered.unmount,
    };
  },
};

testContextPrimitives('ui-svelte', primitiveHarness, {
  Things: ContextPrimitiveThings,
  NoContext: ContextPrimitiveNoContext,
});

testStoreReadFunctions('ui-svelte', primitiveHarness, {
  Callback: CallbackFunction,
  Listener: ListenerFunction,
  Reader: FunctionReader,
});
testStoreListenerFunctions('ui-svelte', primitiveHarness, {
  Callback: CallbackFunction,
  Listener: ListenerFunction,
  Reader: FunctionReader,
});
testCheckpointCallbackFunctions('ui-svelte', primitiveHarness, {
  Callback: CallbackFunction,
  Listener: ListenerFunction,
  Reader: FunctionReader,
});

describe('Svelte-specific', () => {
  test('windowless ui-svelte functions skip effects', () => {
    vi.stubGlobal('window', undefined);
    try {
      const {container, unmount} = render(FunctionWindowlessCoverage);
      expect(container.textContent).toEqual(
        JSON.stringify([['t1'], 1, 1, [], [], [], [], [], [], [], []]),
      );
      unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  describe('Context Functions', () => {
    test('provideXxx functions', () => {
      const {container, unmount} = render(ProvideThings, {
        props: {store},
      });
      expect(container.textContent).toContain('provided');

      unmount();
    });
  });

  describe('Read Functions', () => {
    test('getCell can set values', async () => {
      store.setCell('t1', 'r1', 'c1', 0);
      const {container, unmount} = render(FunctionWritableCell, {
        props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1', newValue: 1},
      });
      expect(container.textContent).toContain('0');

      await act(() =>
        fireEvent.click(container.querySelector('button') as Element),
      );
      expect(container.textContent).toContain('1');
      expect(store.getCell('t1', 'r1', 'c1')).toEqual(1);

      unmount();
    });

    test('getValue can set values', async () => {
      store.setValues({v1: false});
      const {container, unmount} = render(FunctionWritableValue, {
        props: {store, valueId: 'v1', newValue: true},
      });
      expect(container.textContent).toContain('false');

      await act(() =>
        fireEvent.click(container.querySelector('button') as Element),
      );
      expect(container.textContent).toContain('true');
      expect(store.getValue('v1')).toEqual(true);

      unmount();
    });

    test('getPersisterStatus', async () => {
      const persister: AnyPersister = createSessionPersister(store, 'test-key');
      const {container, unmount} = render(FunctionPersisterStatus, {
        props: {persister},
      });
      expect(container.textContent).toEqual('0');
      unmount();
      persister.destroy();
    });

    test('getSynchronizerStatus', async () => {
      const store2 = createMergeableStore();
      const synchronizer: Synchronizer = createLocalSynchronizer(store2);
      const {container, unmount} = render(FunctionSynchronizerStatus, {
        props: {synchronizer},
      });
      expect(container.textContent).toEqual('0');
      unmount();
      synchronizer.destroy();
    });
  });

  describe('Listener Functions', () => {
    test('onMetric', async () => {
      const metrics: Metrics = createMetrics(store).setMetricDefinition(
        'm1',
        't1',
        'max',
        'c1',
      );
      const listener = vi.fn();
      expect(metrics.getListenerStats().metric).toEqual(0);

      const {unmount} = render(ListenerFunctionMetric, {
        props: {metrics, metricId: 'm1', listener},
      });
      expect(metrics.getListenerStats().metric).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(metrics.getListenerStats().metric).toEqual(0);
    });

    test('onSliceIds', async () => {
      const indexes: Indexes = createIndexes(store).setIndexDefinition(
        'i1',
        't1',
        'c1',
      );
      const listener = vi.fn();
      expect(indexes.getListenerStats().sliceIds).toEqual(0);

      const {unmount} = render(ListenerFunctionSliceIds, {
        props: {indexes, indexId: 'i1', listener},
      });
      expect(indexes.getListenerStats().sliceIds).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 'a'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(indexes.getListenerStats().sliceIds).toEqual(0);
    });

    test('onSliceRowIds', async () => {
      const indexes: Indexes = createIndexes(store).setIndexDefinition(
        'i1',
        't1',
        'c1',
      );
      const listener = vi.fn();
      expect(indexes.getListenerStats().sliceRowIds).toEqual(0);

      const {unmount} = render(ListenerFunctionSliceRowIds, {
        props: {indexes, indexId: 'i1', sliceId: 'a', listener},
      });
      expect(indexes.getListenerStats().sliceRowIds).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 'a'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(indexes.getListenerStats().sliceRowIds).toEqual(0);
    });

    test('onRemoteRowId', async () => {
      const relationships: Relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      const listener = vi.fn();
      expect(relationships.getListenerStats().remoteRowId).toEqual(0);

      const {unmount} = render(ListenerFunctionRemoteRowId, {
        props: {
          relationships,
          relationshipId: 'r1',
          localRowId: 'r1',
          listener,
        },
      });
      expect(relationships.getListenerStats().remoteRowId).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 'R1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(relationships.getListenerStats().remoteRowId).toEqual(0);
    });

    test('onLocalRowIds', async () => {
      const relationships: Relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
      const listener = vi.fn();
      expect(relationships.getListenerStats().localRowIds).toEqual(0);

      const {unmount} = render(ListenerFunctionLocalRowIds, {
        props: {
          relationships,
          relationshipId: 'r1',
          remoteRowId: 'R1',
          listener,
        },
      });
      expect(relationships.getListenerStats().localRowIds).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 'R1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(relationships.getListenerStats().localRowIds).toEqual(0);
    });

    test('onLinkedRowIds', async () => {
      const relationships: Relationships = createRelationships(
        store,
      ).setRelationshipDefinition('r1', 't1', 't1', 'c1');
      const listener = vi.fn();
      expect(relationships.getListenerStats().linkedRowIds).toEqual(0);

      const {unmount} = render(ListenerFunctionLinkedRowIds, {
        props: {
          relationships,
          relationshipId: 'r1',
          firstRowId: 'r1',
          listener,
        },
      });
      expect(relationships.getListenerStats().linkedRowIds).toEqual(1);

      await act(() => store.setTables({t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}}}));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(relationships.getListenerStats().linkedRowIds).toEqual(0);
    });

    test('onResultTable', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().table).toEqual(0);

      const {unmount} = render(ListenerFunctionResultTable, {
        props: {queries, queryId: 'q1', listener},
      });
      expect(queries.getListenerStats().table).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().table).toEqual(0);
    });

    test('onResultTableCellIds', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => {
          select('c1');
          select('c2');
        },
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().tableCellIds).toEqual(0);

      const {unmount} = render(ListenerFunctionResultTableCellIds, {
        props: {queries, queryId: 'q1', listener},
      });
      expect(queries.getListenerStats().tableCellIds).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c2', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().tableCellIds).toEqual(0);
    });

    test('onResultRowCount', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().rowCount).toEqual(0);

      const {unmount} = render(ListenerFunctionResultRowCount, {
        props: {queries, queryId: 'q1', listener},
      });
      expect(queries.getListenerStats().rowCount).toEqual(1);

      await act(() => store.setCell('t1', 'r2', 'c1', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().rowCount).toEqual(0);
    });

    test('onResultRowIds', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().rowIds).toEqual(0);

      const {unmount} = render(ListenerFunctionResultRowIds, {
        props: {queries, queryId: 'q1', listener},
      });
      expect(queries.getListenerStats().rowIds).toEqual(1);

      await act(() => store.setCell('t1', 'r2', 'c1', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().rowIds).toEqual(0);
    });

    test('onResultSortedRowIds', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().sortedRowIds).toEqual(0);

      const {unmount} = render(ListenerFunctionResultSortedRowIds, {
        props: {queries, queryId: 'q1', cellId: 'c1', listener},
      });
      expect(queries.getListenerStats().sortedRowIds).toEqual(1);

      await act(() => store.setCell('t1', 'r2', 'c1', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().sortedRowIds).toEqual(0);
    });

    test('onResultRow', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().row).toEqual(0);

      const {unmount} = render(ListenerFunctionResultRow, {
        props: {queries, queryId: 'q1', rowId: 'r1', listener},
      });
      expect(queries.getListenerStats().row).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().row).toEqual(0);
    });

    test('onResultCellIds', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => {
          select('c1');
          select('c2');
        },
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().cellIds).toEqual(0);

      const {unmount} = render(ListenerFunctionResultCellIds, {
        props: {queries, queryId: 'q1', rowId: 'r1', listener},
      });
      expect(queries.getListenerStats().cellIds).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c2', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().cellIds).toEqual(0);
    });

    test('onResultCell', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => select('c1'),
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().cell).toEqual(0);

      const {unmount} = render(ListenerFunctionResultCell, {
        props: {queries, queryId: 'q1', rowId: 'r1', cellId: 'c1', listener},
      });
      expect(queries.getListenerStats().cell).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().cell).toEqual(0);
    });

    test('onParamValues', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as number);
        },
        {p1: 1},
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().paramValues).toEqual(0);

      const {unmount} = render(ListenerFunctionParamValues, {
        props: {queries, queryId: 'q1', listener},
      });
      expect(queries.getListenerStats().paramValues).toEqual(1);

      await act(() => queries.setParamValue('q1', 'p1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().paramValues).toEqual(0);
    });

    test('onParamValue', async () => {
      const queries: Queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as number);
        },
        {p1: 1},
      );
      const listener = vi.fn();
      expect(queries.getListenerStats().paramValue).toEqual(0);

      const {unmount} = render(ListenerFunctionParamValue, {
        props: {queries, queryId: 'q1', paramId: 'p1', listener},
      });
      expect(queries.getListenerStats().paramValue).toEqual(1);

      await act(() => queries.setParamValue('q1', 'p1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(queries.getListenerStats().paramValue).toEqual(0);
    });

    test('onCheckpointIds', async () => {
      const checkpoints: Checkpoints = createCheckpoints(store);
      const listener = vi.fn();
      expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);

      const {unmount} = render(ListenerFunctionCheckpointIds, {
        props: {checkpoints, listener},
      });
      expect(checkpoints.getListenerStats().checkpointIds).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);
    });

    test('onCheckpoint', async () => {
      const checkpoints: Checkpoints = createCheckpoints(store);
      const listener = vi.fn();
      expect(checkpoints.getListenerStats().checkpoint).toEqual(0);

      const {unmount} = render(ListenerFunctionCheckpoint, {
        props: {checkpoints, checkpointId: '0', listener},
      });
      expect(checkpoints.getListenerStats().checkpoint).toEqual(1);

      await act(() => checkpoints.setCheckpoint('0', 'c1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(checkpoints.getListenerStats().checkpoint).toEqual(0);
    });

    test('onPersisterStatus', async () => {
      const persister: AnyPersister = createSessionPersister(store, 'test-key');
      const listener = vi.fn();

      const {unmount} = render(ListenerFunctionPersisterStatus, {
        props: {persister, listener},
      });

      await act(() => persister.save());
      expect(listener).toHaveBeenCalled();

      unmount();
      persister.destroy();
    });

    test('onSynchronizerStatus', async () => {
      const store2 = createMergeableStore();
      const synchronizer: Synchronizer = createLocalSynchronizer(store2);
      const listener = vi.fn();

      const {unmount} = render(ListenerFunctionSynchronizerStatus, {
        props: {synchronizer, listener},
      });

      await act(() => synchronizer.save());
      expect(listener).toHaveBeenCalled();

      unmount();
      synchronizer.destroy();
    });
  });
});
