import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import {createElement} from 'react';

import {testContextPrimitives} from '../ui-common/primitives.ts';
import {ContextPrimitiveNoContext} from './components/ContextPrimitiveNoContext.tsx';
import {ContextPrimitiveThings} from './components/ContextPrimitiveThings.tsx';

type ReactComponent = ComponentType<Record<string, unknown>>;

const primitiveHarness = {
  render: (component: unknown, props: {[key: string]: unknown}) => {
    const rendered = render(createElement(component as ReactComponent, props));
    return {container: rendered.container, unmount: rendered.unmount};
  },
};

testContextPrimitives('ui-react', primitiveHarness, {
  Things: ContextPrimitiveThings,
  NoContext: ContextPrimitiveNoContext,
  hasStores: true,
});
