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

    test('getTableCellIds', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'tableCellIds',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual(JSON.stringify(['c1']));

      await harness.act(() =>
        store
          .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}})
          .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['c2']));

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual(JSON.stringify(['c3', 'c4']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('hasTableCell', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasTableCell',
        {store, tableId: 't0', cellId: 'c0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({tableId: 't1', cellId: 'c1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}})
          .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({tableId: 't1', cellId: 'c2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getRowCount', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'rowCount',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual('0');

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
      );
      expect(container.textContent).toEqual('1');

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual('2');

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual('0');

      unmount();
    });

    test('getRowIds', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'rowIds',
        {store, tableId: 't0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({tableId: 't1'});
      expect(container.textContent).toEqual(JSON.stringify(['r1']));

      await harness.act(() =>
        store
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['r2']));

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual(JSON.stringify(['r3', 'r4']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getSortedRowIds', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'sortedRowIds',
        {
          store,
          tableId: 't0',
          cellId: 'c0',
          descending: false,
          offset: 0,
          limit: undefined,
        },
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({tableId: 't1', cellId: 'c1', descending: false});
      expect(container.textContent).toEqual(JSON.stringify(['r1']));

      await harness.act(() =>
        store
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
          .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['r2']));

      await rerender({
        tableId: 't2',
        cellId: 'c1',
        descending: true,
        offset: 0,
        limit: 2,
      });
      expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

      await harness.act(() => store.setRow('t2', 'r5', {c1: 5}));
      expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

      await harness.act(() => store.delTables());
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('getSortedRowIds defaults', () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'sortedRowIds',
        {store, tableId: 't1', cellId: 'c1'},
      );
      expect(container.textContent).toEqual(JSON.stringify(['r1']));
      unmount();
    });

    test('hasRow', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasRow',
        {store, tableId: 't0', rowId: 'r0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({tableId: 't1', rowId: 'r1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
          .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({tableId: 't1', rowId: 'r2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getRow', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'row',
        {store, tableId: 't0', rowId: 'r0'},
      );
      expect(container.textContent).toEqual(JSON.stringify({}));

      await rerender({tableId: 't1', rowId: 'r1'});
      expect(container.textContent).toEqual(JSON.stringify({c1: 1}));

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
          .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}}),
      );
      expect(container.textContent).toEqual(JSON.stringify({c1: 2}));

      await rerender({tableId: 't1', rowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify({c1: 3}));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getCellIds', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'cellIds',
        {store, tableId: 't0', rowId: 'r0'},
      );
      expect(container.textContent).toEqual(JSON.stringify([]));

      await rerender({tableId: 't1', rowId: 'r1'});
      expect(container.textContent).toEqual(JSON.stringify(['c1']));

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}})
          .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['c2']));

      await rerender({tableId: 't1', rowId: 'r2'});
      expect(container.textContent).toEqual(JSON.stringify(['c3', 'c4']));

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual(JSON.stringify([]));

      unmount();
    });

    test('hasCell', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasCell',
        {store, tableId: 't0', rowId: 'r0', cellId: 'c0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({tableId: 't1', rowId: 'r1', cellId: 'c1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2, c2: 2}})
          .setTable('t1', {r1: {c1: 2, c2: 2}}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({tableId: 't1', rowId: 'r1', cellId: 'c2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getCell', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'cell',
        {store, tableId: 't0', rowId: 'r0', cellId: 'c0'},
      );
      expect(container.textContent).toEqual('');

      await rerender({tableId: 't1', rowId: 'r1', cellId: 'c1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store
          .setTable('t1', {r1: {c1: 2, c2: 2}})
          .setTable('t1', {r1: {c1: 2, c2: 2}}),
      );
      expect(container.textContent).toEqual('2');

      await rerender({tableId: 't1', rowId: 'r1', cellId: 'c2'});
      expect(container.textContent).toEqual('2');

      await harness.act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('');

      unmount();
    });

    test('hasValues', async () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'hasValues',
        {store},
      );
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getValues', async () => {
      const {container, unmount} = renderReader(harness, components, 'values', {
        store,
      });
      expect(container.textContent).toEqual(JSON.stringify({v1: 1}));

      await harness.act(() => store.setValues({v1: 2}).setValues({v1: 2}));
      expect(container.textContent).toEqual(JSON.stringify({v1: 2}));

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual(JSON.stringify({}));

      unmount();
    });

    test('getValueIds', async () => {
      const {container, unmount} = renderReader(
        harness,
        components,
        'valueIds',
        {store},
      );
      expect(container.textContent).toEqual(JSON.stringify(['v1']));

      await harness.act(() =>
        store.setValues({v1: 1, v2: 2}).setValues({v1: 1, v2: 2}),
      );
      expect(container.textContent).toEqual(JSON.stringify(['v1', 'v2']));

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual('[]');

      unmount();
    });

    test('hasValue', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'hasValue',
        {store, valueId: 'v0'},
      );
      expect(container.textContent).toEqual('false');

      await rerender({valueId: 'v1'});
      expect(container.textContent).toEqual('true');

      await harness.act(() =>
        store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3}),
      );
      expect(container.textContent).toEqual('true');

      await rerender({valueId: 'v2'});
      expect(container.textContent).toEqual('true');

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual('false');

      unmount();
    });

    test('getValue', async () => {
      const {container, rerender, unmount} = renderReader(
        harness,
        components,
        'value',
        {store, valueId: 'v0'},
      );
      expect(container.textContent).toEqual('');

      await rerender({valueId: 'v1'});
      expect(container.textContent).toEqual('1');

      await harness.act(() =>
        store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3}),
      );
      expect(container.textContent).toEqual('2');

      await rerender({valueId: 'v2'});
      expect(container.textContent).toEqual('3');

      await harness.act(() => store.delValues());
      expect(container.textContent).toEqual('');

      unmount();
    });
  });
};
