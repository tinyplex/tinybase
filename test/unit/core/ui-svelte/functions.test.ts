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

import ListenerFunctionCell from './components/ListenerFunctionCell.svelte';
import ListenerFunctionCellIds from './components/ListenerFunctionCellIds.svelte';
import ListenerFunctionCheckpoint from './components/ListenerFunctionCheckpoint.svelte';
import ListenerFunctionCheckpointIds from './components/ListenerFunctionCheckpointIds.svelte';
import ListenerFunctionDidFinishTransaction from './components/ListenerFunctionDidFinishTransaction.svelte';
import ListenerFunctionHasCell from './components/ListenerFunctionHasCell.svelte';
import ListenerFunctionHasRow from './components/ListenerFunctionHasRow.svelte';
import ListenerFunctionHasTable from './components/ListenerFunctionHasTable.svelte';
import ListenerFunctionHasTableCell from './components/ListenerFunctionHasTableCell.svelte';
import ListenerFunctionHasTables from './components/ListenerFunctionHasTables.svelte';
import ListenerFunctionHasValue from './components/ListenerFunctionHasValue.svelte';
import ListenerFunctionHasValues from './components/ListenerFunctionHasValues.svelte';
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
import ListenerFunctionRow from './components/ListenerFunctionRow.svelte';
import ListenerFunctionRowCount from './components/ListenerFunctionRowCount.svelte';
import ListenerFunctionRowIds from './components/ListenerFunctionRowIds.svelte';
import ListenerFunctionSliceIds from './components/ListenerFunctionSliceIds.svelte';
import ListenerFunctionSliceRowIds from './components/ListenerFunctionSliceRowIds.svelte';
import ListenerFunctionSortedRowIds from './components/ListenerFunctionSortedRowIds.svelte';
import ListenerFunctionStartTransaction from './components/ListenerFunctionStartTransaction.svelte';
import ListenerFunctionSynchronizerStatus from './components/ListenerFunctionSynchronizerStatus.svelte';
import ListenerFunctionTable from './components/ListenerFunctionTable.svelte';
import ListenerFunctionTableCellIds from './components/ListenerFunctionTableCellIds.svelte';
import ListenerFunctionTableIds from './components/ListenerFunctionTableIds.svelte';
import ListenerFunctionTables from './components/ListenerFunctionTables.svelte';
import ListenerFunctionValue from './components/ListenerFunctionValue.svelte';
import ListenerFunctionValueIds from './components/ListenerFunctionValueIds.svelte';
import ListenerFunctionValues from './components/ListenerFunctionValues.svelte';
import ListenerFunctionWillFinishTransaction from './components/ListenerFunctionWillFinishTransaction.svelte';

import {testStoreReadFunctions} from '../ui-common/functions.ts';
import {testContextPrimitives} from '../ui-common/primitives.ts';
import ContextPrimitiveNoContext from './components/ContextPrimitiveNoContext.svelte';
import ContextPrimitiveThings from './components/ContextPrimitiveThings.svelte';
import FunctionGoBackwardCallback from './components/FunctionGoBackwardCallback.svelte';
import FunctionGoForwardCallback from './components/FunctionGoForwardCallback.svelte';
import FunctionPersisterStatus from './components/FunctionPersisterStatus.svelte';
import FunctionReader from './components/FunctionReader.svelte';
import FunctionSynchronizerStatus from './components/FunctionSynchronizerStatus.svelte';
import FunctionWindowlessCoverage from './components/FunctionWindowlessCoverage.svelte';
import FunctionWritableCell from './components/FunctionWritableCell.svelte';
import FunctionWritableValue from './components/FunctionWritableValue.svelte';
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

testStoreReadFunctions('ui-svelte', primitiveHarness, {Reader: FunctionReader});

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

  describe('Checkpoint Callbacks', () => {
    let checkpoints: Checkpoints;

    beforeEach(() => {
      store = createStore().setTables({t1: {r1: {c1: 1}}});
      checkpoints = createCheckpoints(store);
      store.setTables({t1: {r1: {c1: 2}}});
      checkpoints.addCheckpoint();
      store.setTables({t1: {r1: {c1: 3}}});
      checkpoints.addCheckpoint();
    });

    test('createGoBackwardCallback', async () => {
      const {getByRole, unmount} = render(FunctionGoBackwardCallback, {
        props: {checkpoints},
      });

      await act(() => fireEvent.click(getByRole('button')));
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

      await act(() => fireEvent.click(getByRole('button')));
      expect(checkpoints.getCheckpointIds()).toEqual([[], '0', ['1', '2']]);

      unmount();
    });

    test('createGoForwardCallback', async () => {
      const {getByRole, unmount} = render(FunctionGoForwardCallback, {
        props: {checkpoints},
      });

      checkpoints.goTo('0');

      await act(() => fireEvent.click(getByRole('button')));
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

      await act(() => fireEvent.click(getByRole('button')));
      expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

      unmount();
    });
  });

  describe('Listener Functions', () => {
    test('onHasTables', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().hasTables).toEqual(0);

      const {unmount} = render(ListenerFunctionHasTables, {
        props: {store, listener},
      });
      expect(store.getListenerStats().hasTables).toEqual(1);

      await act(() => store.delTables());
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().hasTables).toEqual(0);
    });

    test('onTables', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().tables).toEqual(0);

      const {unmount} = render(ListenerFunctionTables, {
        props: {store, listener},
      });
      expect(store.getListenerStats().tables).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().tables).toEqual(0);
    });

    test('onTableIds', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().tableIds).toEqual(0);

      const {unmount} = render(ListenerFunctionTableIds, {
        props: {store, listener},
      });
      expect(store.getListenerStats().tableIds).toEqual(1);

      await act(() => store.setCell('t2', 'r1', 'c1', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().tableIds).toEqual(0);
    });

    test('onHasTable', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().hasTable).toEqual(0);

      const {unmount} = render(ListenerFunctionHasTable, {
        props: {store, tableId: 't1', listener},
      });
      expect(store.getListenerStats().hasTable).toEqual(1);

      await act(() => store.delTable('t1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().hasTable).toEqual(0);
    });

    test('onTable', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().table).toEqual(0);

      const {unmount} = render(ListenerFunctionTable, {
        props: {store, tableId: 't1', listener},
      });
      expect(store.getListenerStats().table).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().table).toEqual(0);
    });

    test('onTableCellIds', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().tableCellIds).toEqual(0);

      const {unmount} = render(ListenerFunctionTableCellIds, {
        props: {store, tableId: 't1', listener},
      });
      expect(store.getListenerStats().tableCellIds).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c2', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().tableCellIds).toEqual(0);
    });

    test('onHasTableCell', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().hasTableCell).toEqual(0);

      const {unmount} = render(ListenerFunctionHasTableCell, {
        props: {store, tableId: 't1', cellId: 'c1', listener},
      });
      expect(store.getListenerStats().hasTableCell).toEqual(1);

      await act(() => store.delCell('t1', 'r1', 'c1', true));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().hasTableCell).toEqual(0);
    });

    test('onRowCount', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().rowCount).toEqual(0);

      const {unmount} = render(ListenerFunctionRowCount, {
        props: {store, tableId: 't1', listener},
      });
      expect(store.getListenerStats().rowCount).toEqual(1);

      await act(() => store.setCell('t1', 'r2', 'c1', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().rowCount).toEqual(0);
    });

    test('onRowIds', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().rowIds).toEqual(0);

      const {unmount} = render(ListenerFunctionRowIds, {
        props: {store, tableId: 't1', listener},
      });
      expect(store.getListenerStats().rowIds).toEqual(1);

      await act(() => store.setCell('t1', 'r2', 'c1', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().rowIds).toEqual(0);
    });

    test('onSortedRowIds', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().sortedRowIds).toEqual(0);

      const {unmount} = render(ListenerFunctionSortedRowIds, {
        props: {store, tableId: 't1', cellId: 'c1', listener},
      });
      expect(store.getListenerStats().sortedRowIds).toEqual(1);

      await act(() => store.setCell('t1', 'r2', 'c1', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().sortedRowIds).toEqual(0);
    });

    test('onHasRow', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().hasRow).toEqual(0);

      const {unmount} = render(ListenerFunctionHasRow, {
        props: {store, tableId: 't1', rowId: 'r1', listener},
      });
      expect(store.getListenerStats().hasRow).toEqual(1);

      await act(() => store.delRow('t1', 'r1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().hasRow).toEqual(0);
    });

    test('onRow', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().row).toEqual(0);

      const {unmount} = render(ListenerFunctionRow, {
        props: {store, tableId: 't1', rowId: 'r1', listener},
      });
      expect(store.getListenerStats().row).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().row).toEqual(0);
    });

    test('onCellIds', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().cellIds).toEqual(0);

      const {unmount} = render(ListenerFunctionCellIds, {
        props: {store, tableId: 't1', rowId: 'r1', listener},
      });
      expect(store.getListenerStats().cellIds).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c2', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().cellIds).toEqual(0);
    });

    test('onHasCell', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().hasCell).toEqual(0);

      const {unmount} = render(ListenerFunctionHasCell, {
        props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1', listener},
      });
      expect(store.getListenerStats().hasCell).toEqual(1);

      await act(() => store.delCell('t1', 'r1', 'c1', true));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().hasCell).toEqual(0);
    });

    test('onCell', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().cell).toEqual(0);

      const {unmount} = render(ListenerFunctionCell, {
        props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1', listener},
      });
      expect(store.getListenerStats().cell).toEqual(1);

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().cell).toEqual(0);
    });

    test('onHasValues', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().hasValues).toEqual(0);

      const {unmount} = render(ListenerFunctionHasValues, {
        props: {store, listener},
      });
      expect(store.getListenerStats().hasValues).toEqual(1);

      await act(() => store.delValues());
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().hasValues).toEqual(0);
    });

    test('onValues', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().values).toEqual(0);

      const {unmount} = render(ListenerFunctionValues, {
        props: {store, listener},
      });
      expect(store.getListenerStats().values).toEqual(1);

      await act(() => store.setValue('v1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().values).toEqual(0);
    });

    test('onValueIds', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().valueIds).toEqual(0);

      const {unmount} = render(ListenerFunctionValueIds, {
        props: {store, listener},
      });
      expect(store.getListenerStats().valueIds).toEqual(1);

      await act(() => store.setValue('v2', 0));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().valueIds).toEqual(0);
    });

    test('onHasValue', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().hasValue).toEqual(0);

      const {unmount} = render(ListenerFunctionHasValue, {
        props: {store, valueId: 'v1', listener},
      });
      expect(store.getListenerStats().hasValue).toEqual(1);

      await act(() => store.delValue('v1'));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().hasValue).toEqual(0);
    });

    test('onValue', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().value).toEqual(0);

      const {unmount} = render(ListenerFunctionValue, {
        props: {store, valueId: 'v1', listener},
      });
      expect(store.getListenerStats().value).toEqual(1);

      await act(() => store.setValue('v1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().value).toEqual(0);
    });

    test('onStartTransaction', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().transaction).toEqual(0);

      const {unmount} = render(ListenerFunctionStartTransaction, {
        props: {store, listener},
      });
      expect(store.getListenerStats().transaction).toEqual(1);

      await act(() => store.setValue('v1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().transaction).toEqual(0);
    });

    test('onWillFinishTransaction', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().transaction).toEqual(0);

      const {unmount} = render(ListenerFunctionWillFinishTransaction, {
        props: {store, listener},
      });
      expect(store.getListenerStats().transaction).toEqual(1);

      await act(() => store.setValue('v1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().transaction).toEqual(0);
    });

    test('onDidFinishTransaction', async () => {
      const listener = vi.fn();
      expect(store.getListenerStats().transaction).toEqual(0);

      const {unmount} = render(ListenerFunctionDidFinishTransaction, {
        props: {store, listener},
      });
      expect(store.getListenerStats().transaction).toEqual(1);

      await act(() => store.setValue('v1', 2));
      expect(listener).toHaveBeenCalledTimes(1);

      unmount();
      expect(store.getListenerStats().transaction).toEqual(0);
    });

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
