/** @jsx createElement */

import {createElement, useCallback, useRef, useState} from '../ui-react/common';
import {
  useIndexesIds,
  useMetricsIds,
  useQueriesIds,
  useRelationshipsIds,
  useStoreIds,
  useValues,
} from '../ui-react';
import {CURRENT_TARGET} from '../common/strings';
import {IndexesView} from './IndexesView';
import {MetricsView} from './MetricsView';
import {QueriesView} from './QueriesView';
import {RelationshipsView} from './RelationshipsView';
import {StoreProp} from './types';
import {StoreView} from './StoreView';
import {SyntheticEvent} from 'react';
import {arrayMap} from '../common/array';

export const Body = ({s}: StoreProp) => {
  const ref = useRef<HTMLElement>(null);
  const article = ref.current;
  const [scrolled, setScrolled] = useState(false);
  const {scrollLeft, scrollTop} = useValues(s);

  if (article && !scrolled) {
    new MutationObserver((_, observer) => {
      article.scrollTo((scrollLeft as number) ?? 0, (scrollTop as number) ?? 0);
      setScrolled(true);
      observer.disconnect();
    }).observe(article, {childList: true, subtree: true});
  }

  const handleScroll = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      const {scrollLeft, scrollTop} = event[CURRENT_TARGET];
      requestIdleCallback(() => s.setPartialValues({scrollLeft, scrollTop}));
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
      <RelationshipsView s={s} />
      {arrayMap(useRelationshipsIds(), (relationshipsId) => (
        <RelationshipsView
          relationshipsId={relationshipsId}
          key={relationshipsId}
          s={s}
        />
      ))}
      <QueriesView s={s} />
      {arrayMap(useQueriesIds(), (queriesId) => (
        <QueriesView queriesId={queriesId} key={queriesId} s={s} />
      ))}
    </article>
  );
};
