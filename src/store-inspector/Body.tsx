/** @jsx createElement */

import {StoreProp} from './types';
import {createElement} from './common';
import {getBodyStyle} from './styles';

export const Body = ({store}: StoreProp) => {
  return <div style={getBodyStyle()}>{store.getJson()}</div>;
};
