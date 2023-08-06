/** @jsx createElement */

import {useIndexesIds, useMetricsIds, useStoreIds} from '../ui-react';
import {IndexesView} from './IndexesView';
import {MetricsView} from './MetricsView';
import React from 'react';
import {SCROLL_VALUE} from './common';
import {StoreProp} from './types';
import {StoreView} from './StoreView';
import {arrayMap} from '../common/array';
import {createElement} from '../ui-react/common';
import {isUndefined} from '../common/other';

const {useLayoutEffect, useRef} = React;

export const Body = ({s}: StoreProp) => {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const article = ref.current;
    const scroll = s.getValue(SCROLL_VALUE) as number;
    if (article && !isUndefined(scroll)) {
      article.scrollTop = scroll;
    }
    const interval = setInterval(
      () => s.setValue(SCROLL_VALUE, article?.scrollTop ?? 0),
      1000,
    );
    return () => clearInterval(interval);
  }, [ref, s]);
  return (
    <article ref={ref}>
      <StoreView s={s} />
      {arrayMap(useStoreIds(), (storeId) => (
        <StoreView storeId={storeId} key={storeId} s={s} />
      ))}
      <MetricsView s={s} />
      {arrayMap(useMetricsIds(), (metricsId) => (
        <MetricsView metricsId={metricsId} key={metricsId} s={s} />
      ))}
      <IndexesView s={s} />
      {arrayMap(useIndexesIds(), (indexesId) => (
        <IndexesView indexesId={indexesId} key={indexesId} s={s} />
      ))}
    </article>
  );
};
