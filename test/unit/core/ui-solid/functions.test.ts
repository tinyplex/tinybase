/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import {render as solidRender} from 'solid-js/web';
import type {Id, Store} from 'tinybase';
import {
  useHasTable,
  useHasTables,
  useTable,
  useTableIds,
  useTables,
} from 'tinybase/ui-solid';
import {pause} from '../../common/other.ts';

import {testStoreReadFunctions} from '../ui-common/functions.ts';
import {testContextPrimitives} from '../ui-common/primitives.ts';
import {ContextPrimitiveNoContext} from './components/ContextPrimitiveNoContext.tsx';
import {ContextPrimitiveThings} from './components/ContextPrimitiveThings.tsx';

type Props = {[key: string]: unknown};
type SolidComponent = (props: Props) => JSXElement;

const primitiveHarness = {
  act: async (callback: () => unknown) => {
    callback();
    await pause();
  },
  render: (component: unknown, props: Props = {}) => {
    const container = document.createElement('div');
    let currentProps = props;
    const Component = component as SolidComponent;
    let unmount = solidRender(() => Component(currentProps), container);
    return {
      container,
      rerender: async (nextProps: Props) => {
        unmount();
        currentProps = {...currentProps, ...nextProps};
        unmount = solidRender(() => Component(currentProps), container);
        await pause();
      },
      unmount: () => unmount(),
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
  const hasTable = useHasTable(() => tableId, store);
  const table = useTable(() => tableId, store);
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
              : () => undefined;
  return (() => JSON.stringify(value())) as unknown as JSXElement;
};

testContextPrimitives('ui-solid', primitiveHarness, {
  Things: ContextPrimitiveThings,
  NoContext: ContextPrimitiveNoContext,
  hasStores: true,
});

testStoreReadFunctions('ui-solid', primitiveHarness, {Reader});
