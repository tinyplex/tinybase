/** @jsx createElement */

import {useIndexesIds, useMetricsIds, useStoreIds} from '../ui-react';
import {IndexesView} from './IndexesView';
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
    <IndexesView {...props} />
    {arrayMap(useIndexesIds(), (indexesId) => (
      <IndexesView indexesId={indexesId} key={indexesId} {...props} />
    ))}
  </article>
);
