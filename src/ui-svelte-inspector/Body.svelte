<script lang="ts">
  import {onDestroy} from 'svelte';
  import {
    NO_PROVIDED_OBJECTS_MESSAGE,
  } from '../common/inspector/common.ts';
  import {
    cancelInspectorIdleCallback,
    requestInspectorIdleCallback,
  } from '../common/inspector/idle.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {arrayIsEmpty} from '../common/array.ts';
  import {isUndefined, mathFloor} from '../common/other.ts';
  import {
    getIndexes,
    getIndexesIds,
    getMetrics,
    getMetricsIds,
    getQueries,
    getQueriesIds,
    getRelationships,
    getRelationshipsIds,
    getStore,
    getStoreIds,
    getValues,
  } from '../ui-svelte/functions.svelte.ts';

  let {s}: StoreProp = $props();

  const store = getStore();
  const storeIds = getStoreIds();
  const metrics = getMetrics();
  const metricsIds = getMetricsIds();
  const indexes = getIndexes();
  const indexesIds = getIndexesIds();
  const relationships = getRelationships();
  const relationshipsIds = getRelationshipsIds();
  const queries = getQueries();
  const queriesIds = getQueriesIds();
  const values = getValues(() => s);

  let article = $state<HTMLElement | undefined>(undefined);
  let scrolled = $state(false);
  let idleCallback = 0;

  $effect(() => {
    const articleElement = article;
    const {scrollLeft = 0, scrollTop = 0} = values.current;

    if (articleElement && !scrolled) {
      const observer = new MutationObserver(() => {
        if (
          articleElement.scrollWidth >=
            mathFloor(Number(scrollLeft)) + articleElement.clientWidth &&
          articleElement.scrollHeight >=
            mathFloor(Number(scrollTop)) + articleElement.clientHeight
        ) {
          articleElement.scrollTo(Number(scrollLeft), Number(scrollTop));
        }
      });
      observer.observe(articleElement, {childList: true, subtree: true});

      return () => observer.disconnect();
    }
  });

  onDestroy(() => cancelInspectorIdleCallback(idleCallback));

  const handleScroll = (event: Event) => {
    const {scrollLeft, scrollTop} = event.currentTarget as HTMLElement;
    cancelInspectorIdleCallback(idleCallback);
    idleCallback = requestInspectorIdleCallback(() => {
      scrolled = true;
      s.setPartialValues({scrollLeft, scrollTop});
    });
  };
</script>

{#if isUndefined(store) &&
  arrayIsEmpty(storeIds.current) &&
  isUndefined(metrics) &&
  arrayIsEmpty(metricsIds.current) &&
  isUndefined(indexes) &&
  arrayIsEmpty(indexesIds.current) &&
  isUndefined(relationships) &&
  arrayIsEmpty(relationshipsIds.current) &&
  isUndefined(queries) &&
  arrayIsEmpty(queriesIds.current)}
  <span class="warn">
    {NO_PROVIDED_OBJECTS_MESSAGE}
  </span>
{:else}
  <article bind:this={article} onscroll={handleScroll}></article>
{/if}
