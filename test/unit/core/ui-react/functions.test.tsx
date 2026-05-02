import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import {act, createElement} from 'react';
import type {Id, Store} from 'tinybase';
import {
  useHasTable,
  useHasTables,
  useTable,
  useTableIds,
  useTables,
} from 'tinybase/ui-react';

import {testStoreReadFunctions} from '../ui-common/functions.ts';
import {testContextPrimitives} from '../ui-common/primitives.ts';
import {ContextPrimitiveNoContext} from './components/ContextPrimitiveNoContext.tsx';
import {ContextPrimitiveThings} from './components/ContextPrimitiveThings.tsx';

type Props = {[key: string]: unknown};
type ReactComponent = ComponentType<Props>;

const primitiveHarness = {
  act: async (callback: () => unknown) => {
    await act(async () => {
      callback();
    });
  },
  render: (component: unknown, props: Props = {}) => {
    let currentProps = props;
    const Component = component as ReactComponent;
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

const Reader = ({
  mode,
  store,
  tableId,
}: {
  readonly mode: string;
  readonly store: Store;
  readonly tableId?: Id;
}) => {
  const hasTables = useHasTables(store);
  const tables = useTables(store);
  const tableIds = useTableIds(store);
  const hasTable = useHasTable(tableId, store);
  const table = useTable(tableId, store);
  const value =
    mode == 'hasTables'
      ? hasTables
      : mode == 'tables'
        ? tables
        : mode == 'tableIds'
          ? tableIds
          : mode == 'hasTable'
            ? hasTable
            : mode == 'table'
              ? table
              : undefined;
  return JSON.stringify(value);
};

testContextPrimitives('ui-react', primitiveHarness, {
  Things: ContextPrimitiveThings,
  NoContext: ContextPrimitiveNoContext,
  hasStores: true,
});

testStoreReadFunctions('ui-react', primitiveHarness, {Reader});
