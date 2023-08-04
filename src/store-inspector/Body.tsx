/** @jsx createElement */

import {useMetricsIds, useStoreIds} from '../ui-react';
import {MetricsView} from './MetricsView';
import {StoreProp} from './types';
import {StoreView} from './StoreView';
import {arrayMap} from '../common/array';
import {createElement} from '../ui-react/common';

export const Body = (props: StoreProp) => (
  <article>
    <StoreView {...props} />
    {arrayMap(useStoreIds(), (storeId) => (
      <StoreView storeId={storeId} key={storeId} {...props} />
    ))}
    <MetricsView {...props} />
    {arrayMap(useMetricsIds(), (metricsId) => (
      <MetricsView metricsId={metricsId} key={metricsId} {...props} />
    ))}
  </article>
);
