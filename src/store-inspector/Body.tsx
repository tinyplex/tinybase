/** @jsx createElement */

import {BODY_STYLE} from './style';
import {StoreProp} from './types';
import {createElement} from './common';

export const Body = ({s}: StoreProp) => {
  return <div style={BODY_STYLE}>{s.getJson()}</div>;
};
