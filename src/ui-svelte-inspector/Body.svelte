<script lang="ts">
  import {onDestroy} from 'svelte';
  import {NO_PROVIDED_OBJECTS_MESSAGE} from '../common/inspector/common.ts';
  import {
    cancelInspectorIdleCallback,
    requestInspectorIdleCallback,
  } from '../common/inspector/idle.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {isEmpty, isUndefined, mathFloor, number} from '../common/other.ts';
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
  import IndexesView from './IndexesView.svelte';
  import MetricsView from './MetricsView.svelte';
  import QueriesView from './QueriesView.svelte';
  import RelationshipsView from './RelationshipsView.svelte';
  import StoreView from './StoreView.svelte';

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
            mathFloor(number(scrollLeft)) + articleElement.clientWidth &&
          articleElement.scrollHeight >=
            mathFloor(number(scrollTop)) + articleElement.clientHeight
        ) {
          articleElement.scrollTo(number(scrollLeft), number(scrollTop));
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
  const noProvidedObjects = $derived(
    isUndefined(store) &&
      isEmpty(storeIds.current) &&
      isUndefined(metrics) &&
      isEmpty(metricsIds.current) &&
      isUndefined(indexes) &&
      isEmpty(indexesIds.current) &&
      isUndefined(relationships) &&
      isEmpty(relationshipsIds.current) &&
      isUndefined(queries) &&
      isEmpty(queriesIds.current),
  );
</script>

{#if noProvidedObjects}
  <span class="warn">
    {NO_PROVIDED_OBJECTS_MESSAGE}
  </span>
{:else}
  <article bind:this={article} onscroll={handleScroll}>
    <StoreView {s} />
    {#each storeIds.current as storeId (storeId)}
      <StoreView {storeId} {s} />
    {/each}
    <MetricsView {s} />
    {#each metricsIds.current as metricsId (metricsId)}
      <MetricsView {metricsId} {s} />
    {/each}
    <IndexesView {s} />
    {#each indexesIds.current as indexesId (indexesId)}
      <IndexesView {indexesId} {s} />
    {/each}
    <RelationshipsView {s} />
    {#each relationshipsIds.current as relationshipsId (relationshipsId)}
      <RelationshipsView {relationshipsId} {s} />
    {/each}
    <QueriesView {s} />
    {#each queriesIds.current as queriesId (queriesId)}
      <QueriesView {queriesId} {s} />
    {/each}
  </article>
{/if}
