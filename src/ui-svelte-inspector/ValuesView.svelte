<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {isEmpty} from '../common/other.ts';
  import {VALUES} from '../common/strings.ts';
  import {getValueIds} from '../ui-svelte/functions.svelte.ts';
  import {ValuesInHtmlTable} from '../ui-svelte-dom/index.ts';
  import ValueActions from './actions/ValueActions.svelte';
  import ValuesActions from './actions/ValuesActions.svelte';
  import Details from './Details.svelte';
  import {getEditable} from './editable.ts';

  type Props = {store: Store; storeId?: Id} & StoreProp;

  let {store, storeId, s}: Props = $props();
  const uniqueId = $derived(getUniqueId('v', storeId));
  const valueIds = getValueIds(() => store);
  const [editable, handleEditable] = getEditable(
    () => uniqueId,
    () => s,
  );
  const valueActions = [{label: '', component: ValueActions}];
</script>

<Details
  {uniqueId}
  title={VALUES}
  editable={editable.current}
  {handleEditable}
  {s}
>
  {#if isEmpty(valueIds.current)}
    <p>No values.</p>
  {:else}
    <ValuesInHtmlTable
      {store}
      editable={editable.current}
      extraCellsAfter={editable.current ? valueActions : []}
    />
  {/if}
  {#if editable.current}
    <ValuesActions {store} />
  {/if}
</Details>
