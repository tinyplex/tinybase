/** @jsx createElement */
/** @jsxFrag React.Fragment */

import {DEBUG} from './common/other';
import {App as StoreInspectorApp} from './store-inspector/App';
import {StoreInspectorProps} from './types/ui-react-dom.d';
import {_VALUE} from './common/strings';
import {createElement} from './ui-react/common';

export * from './ui-react/dom';

export const StoreInspector = (props: StoreInspectorProps) =>
  DEBUG ? <StoreInspectorApp {...props} /> : null;
