/** @jsx createElement */

import {StoreProp} from './types';
import {StoreView} from './StoreView';
import {arrayMap} from '../common/array';
import {createElement} from '../ui-react/common';
import {useStoreIds} from '../ui-react';

export const Body = (props: StoreProp) => (
  <article>
    <StoreView {...props} />
    {arrayMap(useStoreIds(), (storeId) => (
      <StoreView storeId={storeId} key={storeId} {...props} />
    ))}
  </article>
);
