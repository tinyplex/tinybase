import type {Store} from 'tinybase';
import {createStore} from 'tinybase';
import {beforeEach, describe, expect, test} from 'vitest';

export type FunctionRendered = {
  readonly container: HTMLElement;
  readonly rerender: (props: {[key: string]: unknown}) => Promise<void>;
  readonly unmount: () => void;
};

export type FunctionHarness = {
  readonly act: (callback: () => unknown) => Promise<void>;
  readonly render: (
    component: unknown,
    props?: {[key: string]: unknown},
  ) => FunctionRendered;
};

export type FunctionComponents = {
  readonly Reader: unknown;
};

const renderReader = (
  harness: FunctionHarness,
  components: FunctionComponents,
  mode: string,
  props: {[key: string]: unknown} = {},
) => harness.render(components.Reader, {mode, ...props});

export const testStoreReadFunctions = (
  framework: string,
  harness: FunctionHarness,
  components: FunctionComponents,
): void => {
  let store: Store;

  beforeEach(() => {
    store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
  });

  describe(`${framework} store read function scenarios`, () => {
    test('hasTables', async () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'hasTables',
        {store},
      );
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getTables', async () => {
      const {container, unmount} = renderReader(harness, components, 'tables', {
        store,
      });
      expect(container.textContent).toEqual(
        JSON.stringify({t1: {r1: {c1: 1}}}),
      );

      await harness.act(() =>
        store.setTables({t1: {r1: {c1: 2}}}).setTables({t1: {r1: {c1: 2}}}),
      );
      expect(container.textContent).toEqual(
        JSON.stringify({t1: {r1: {c1: 2}}}),
      );

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getTableIds', async () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'tableIds',
        {store},
      );
      expect(container.textContent).toEqual(JSON.stringify(['t1']));

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['t1', 't2']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual('[]');

      unmount();
    });

    test('hasTable', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasTable',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getTable', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'table',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual(JSON.stringify({}));

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));

      await harness.act(() =>
        store
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
          .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 2}}));

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 3}}));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });
  });
};
