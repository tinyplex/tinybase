/** @jsx createElement */

import {
  createElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from '../ui-react/common';
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
import {mathFloor} from '../common/other';

export const Body = ({s}: StoreProp) => {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const {scrollLeft, scrollTop} = useValues(s);

  useLayoutEffect(() => {
    const article = ref.current;
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
      requestIdleCallback(() => {
        setScrolled(true);
        s.setPartialValues({scrollLeft, scrollTop});
      });
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
