/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import {render as solidRender} from 'solid-js/web';

import {testContextPrimitives} from '../ui-common/primitives.ts';
import {ContextPrimitiveNoContext} from './components/ContextPrimitiveNoContext.tsx';
import {ContextPrimitiveThings} from './components/ContextPrimitiveThings.tsx';

type SolidComponent = (props: Record<string, unknown>) => JSXElement;

const primitiveHarness = {
  render: (component: unknown, props: {[key: string]: unknown}) => {
    const container = document.createElement('div');
    const unmount = solidRender(
      () => (component as SolidComponent)(props),
      container,
    );
    return {container, unmount};
  },
};

testContextPrimitives('ui-solid', primitiveHarness, {
  Things: ContextPrimitiveThings,
  NoContext: ContextPrimitiveNoContext,
  hasStores: true,
});
