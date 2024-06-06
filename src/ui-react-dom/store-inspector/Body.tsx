/** @jsx createElement */

import {arrayIsEmpty, arrayMap} from '../../common/array';
import {
  createElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from '../../common/react';
import {isUndefined, mathFloor} from '../../common/other';
import {
  useIndexes,
  useIndexesIds,
  useMetrics,
  useMetricsIds,
  useQueries,
  useQueriesIds,
  useRelationships,
  useRelationshipsIds,
  useStore,
  useStoreIds,
  useValues,
} from '../../ui-react';
import {CURRENT_TARGET} from '../../common/strings';
import {IndexesView} from './IndexesView';
import {MetricsView} from './MetricsView';
import {QueriesView} from './QueriesView';
import {RelationshipsView} from './RelationshipsView';
import type {StoreProp} from './types';
import {StoreView} from './StoreView';
import {SyntheticEvent} from 'react';

export const Body = ({s}: StoreProp) => {
  const articleRef = useRef<HTMLElement>(null);
  const idleCallbackRef = useRef<number>(0);
  const [scrolled, setScrolled] = useState(false);
  const {scrollLeft, scrollTop} = useValues(s);

  useLayoutEffect(() => {
    const article = articleRef.current;
    if (article && !scrolled) {
      const observer = new MutationObserver(() => {
        if (
          article.scrollWidth >=
            mathFloor(scrollLeft as number) + article.clientWidth &&
          article.scrollHeight >=
            mathFloor(scrollTop as number) + article.clientHeight
        ) {
          article.scrollTo(scrollLeft as number, scrollTop as number);
        }
      });
      observer.observe(article, {childList: true, subtree: true});
      return () => observer.disconnect();
    }
  }, [scrolled, scrollLeft, scrollTop]);

  const handleScroll = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      const {scrollLeft, scrollTop} = event[CURRENT_TARGET];
      cancelIdleCallback(idleCallbackRef.current);
      idleCallbackRef.current = requestIdleCallback(() => {
        setScrolled(true);
        s.setPartialValues({scrollLeft, scrollTop});
      });
    },
    [s],
  );

  const store = useStore();
  const storeIds = useStoreIds();
  const metrics = useMetrics();
  const metricsIds = useMetricsIds();
  const indexes = useIndexes();
  const indexesIds = useIndexesIds();
  const relationships = useRelationships();
  const relationshipsIds = useRelationshipsIds();
  const queries = useQueries();
  const queriesIds = useQueriesIds();

  return isUndefined(store) &&
    arrayIsEmpty(storeIds) &&
    isUndefined(metrics) &&
    arrayIsEmpty(metricsIds) &&
    isUndefined(indexes) &&
    arrayIsEmpty(indexesIds) &&
    isUndefined(relationships) &&
    arrayIsEmpty(relationshipsIds) &&
    isUndefined(queries) &&
    arrayIsEmpty(queriesIds) ? (
    <span className="warn">
      There are no Stores or other objects to inspect. Make sure you placed the
      StoreInspector inside a Provider component.
    </span>
  ) : (
    <article ref={articleRef} onScroll={handleScroll}>
      <StoreView s={s} />
      {arrayMap(storeIds, (storeId) => (
        <StoreView storeId={storeId} s={s} key={storeId} />
      ))}
      <MetricsView s={s} />
      {arrayMap(metricsIds, (metricsId) => (
        <MetricsView metricsId={metricsId} s={s} key={metricsId} />
      ))}
      <IndexesView s={s} />
      {arrayMap(indexesIds, (indexesId) => (
        <IndexesView indexesId={indexesId} s={s} key={indexesId} />
      ))}
      <RelationshipsView s={s} />
      {arrayMap(relationshipsIds, (relationshipsId) => (
        <RelationshipsView
          relationshipsId={relationshipsId}
          s={s}
          key={relationshipsId}
        />
      ))}
      <QueriesView s={s} />
      {arrayMap(queriesIds, (queriesId) => (
        <QueriesView queriesId={queriesId} s={s} key={queriesId} />
      ))}
    </article>
  );
};
