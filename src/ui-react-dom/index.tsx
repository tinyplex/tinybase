/** @jsx createElement */
/** @jsxFrag React.Fragment */

import {DEBUG} from '../common/other';
import {App as StoreInspectorApp} from './store-inspector/App';
import type {StoreInspectorProps} from '../@types/ui-react-dom';
import {_VALUE} from '../common/strings';
import {createElement} from '../common/react';

export * from './components';

export const StoreInspector = (props: StoreInspectorProps) =>
  DEBUG ? <StoreInspectorApp {...props} /> : null;
