<script lang="ts">
  import type {
    HtmlTableProps,
    ValuesInHtmlTableProps,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import {arrayMap} from '../common/array.ts';
  import {isFalse} from '../common/other.ts';
  import {EXTRA, VALUE} from '../common/strings.ts';
  import {getValueIds} from '../ui-svelte/functions.svelte.ts';
  import ValueView from '../ui-svelte/ValueView.svelte';
  import EditableValueView from './EditableValueView.svelte';
  import {extraKey, getExtraHeaders, getProps} from './common/index.ts';

  let {
    store,
    editable = false,
    valueComponent,
    getValueComponentProps,
    extraCellsBefore = [],
    extraCellsAfter = [],
    className,
    headerRow,
    idColumn,
  }: ValuesInHtmlTableProps & HtmlTableProps = $props();

  const valueIds = getValueIds(() => store);
  const ValueComponent = $derived(
    valueComponent ?? (editable ? EditableValueView : ValueView),
  );
  const extraHeadersBefore = $derived(getExtraHeaders(extraCellsBefore));
  const extraHeadersAfter = $derived(getExtraHeaders(extraCellsAfter, 1));
</script>

<table class={className}>
  {#if headerRow !== false}
    <thead>
      <tr>
        {#each extraHeadersBefore as extraHeader (extraHeader.key)}
          <th class={extraHeader.className}>{extraHeader.label}</th>
        {/each}
        {#if idColumn !== false}
          <th>Id</th>
        {/if}
        <th>{VALUE}</th>
        {#each extraHeadersAfter as extraHeader (extraHeader.key)}
          <th class={extraHeader.className}>{extraHeader.label}</th>
        {/each}
      </tr>
    </thead>
  {/if}
  <tbody>
    {#each valueIds.current as valueId (valueId)}
      {@const valueProps = {valueId, store} as any}
      <tr>
        {#each extraCellsBefore as extraCell, index (extraKey(index, 0))}
          {@const ExtraCell = extraCell.component}
          <td class={EXTRA}>
            <ExtraCell {...valueProps} />
          </td>
        {/each}
        {#if !isFalse(idColumn)}
          <th title={valueId}>{valueId}</th>
        {/if}
        <td>
          <ValueComponent
            {...getProps(getValueComponentProps, valueId)}
            {...valueProps}
          />
        </td>
        {#each extraCellsAfter as extraCell, index (extraKey(index, 1))}
          {@const ExtraCell = extraCell.component}
          <td class={EXTRA}>
            <ExtraCell {...valueProps} />
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
