/** @jsx createElement */

import {BODY_STYLE} from './style';
import {StoreProp} from './types';
import {createElement} from './common';

export const Body = ({store}: StoreProp) => {
  return <div style={BODY_STYLE}>{store.getJson()}</div>;
};
