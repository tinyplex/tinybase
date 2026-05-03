import {act, fireEvent, render} from '@testing-library/svelte';
import type {Store} from 'tinybase';
import {createStore} from 'tinybase';
import {createMergeableStore} from 'tinybase/mergeable-store';
import type {AnyPersister} from 'tinybase/persisters';
import {createSessionPersister} from 'tinybase/persisters/persister-browser';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
import {beforeEach, describe, expect, test, vi} from 'vitest';

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
});
