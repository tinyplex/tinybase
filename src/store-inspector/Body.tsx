/** @jsx createElement */

import {SCROLL_X_VALUE, SCROLL_Y_VALUE} from './common';
import {useIndexesIds, useMetricsIds, useStoreIds, useValue} from '../ui-react';
import {CURRENT_TARGET} from '../common/strings';
import {IndexesView} from './IndexesView';
import {MetricsView} from './MetricsView';
import React from 'react';
import {StoreProp} from './types';
import {StoreView} from './StoreView';
import {arrayMap} from '../common/array';
import {createElement} from '../ui-react/common';

const {useCallback, useRef, useState} = React;

export const Body = ({s}: StoreProp) => {
  const ref = useRef<HTMLElement>(null);
  const article = ref.current;
  const [scrolled, setScrolled] = useState(false);
  const scrollX = (useValue(SCROLL_X_VALUE, s) as number) ?? 0;
  const scrollY = (useValue(SCROLL_Y_VALUE, s) as number) ?? 0;

  if (article && !scrolled) {
    new MutationObserver((_, observer) => {
      article.scrollTo(scrollX, scrollY);
      setScrolled(true);
      observer.disconnect();
    }).observe(article, {childList: true, subtree: true});
  }

  const handleScroll = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      const target = event[CURRENT_TARGET];
      requestIdleCallback(() =>
        s.setPartialValues({
          [SCROLL_X_VALUE]: target.scrollLeft,
          [SCROLL_Y_VALUE]: target.scrollTop,
        }),
      );
    },
    [s],
  );

  return (
    <article ref={ref} onScroll={handleScroll}>
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
