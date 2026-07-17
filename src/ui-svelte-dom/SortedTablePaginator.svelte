<script lang="ts">
  import type {SortedTablePaginatorProps} from '../@types/ui-svelte-dom/index.d.ts';
  import {mathMax, mathMin} from '../common/other.ts';

  const LEFT_ARROW = '\u2190';
  const RIGHT_ARROW = '\u2192';

  let props: SortedTablePaginatorProps = $props();

  const offset = $derived(
    props.offset == null ||
      props.offset < 0 ||
      (props.offset > 0 && props.offset >= props.total)
      ? 0
      : props.offset,
  );
  const limit = $derived(props.limit ?? props.total);
  const singular = $derived(props.singular ?? 'row');
  const plural = $derived(props.plural ?? singular + 's');
  const rangeLabel = $derived(
    `${offset + 1} to ${mathMin(props.total, offset + limit)} of `,
  );
  const totalLabel = $derived(
    `${props.total} ${props.total != 1 ? plural : singular}`,
  );

  $effect(() => {
    const offset = props.offset ?? 0;
    if (offset < 0 || (offset > 0 && offset >= props.total)) {
      props.onChange(0);
    }
  });
</script>

{#if props.total > limit}
  <button
    class="previous"
    disabled={offset == 0}
    onclick={() => props.onChange(mathMax(0, offset - limit))}
    >{LEFT_ARROW}</button
  ><button
    class="next"
    disabled={offset + limit >= props.total}
    onclick={() => props.onChange(offset + limit)}>{RIGHT_ARROW}</button
  >{rangeLabel}
{/if}{totalLabel}
