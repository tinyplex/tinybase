<script lang="ts">
  import type {
    HtmlTableProps,
    RelationshipInHtmlTableProps,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import {arrayMap} from '../common/array.ts';
  import {objEntries} from '../common/obj.ts';
  import {isFalse} from '../common/other.ts';
  import {DOT} from '../common/strings.ts';
  import {
    getRelationshipsStoreTableIds,
    getRowIds,
    getTableCellIds,
  } from '../ui-svelte/functions.svelte.ts';
  import CellView from '../ui-svelte/CellView.svelte';
  import EditableCellView from './EditableCellView.svelte';
  import RelationshipInHtmlRow from './RelationshipInHtmlRow.svelte';
  import {getCells, getExtraHeaders} from './common/index.ts';

  let {
    relationshipId,
    relationships,
    editable,
    customCells,
    extraCellsBefore = [],
    extraCellsAfter = [],
    className,
    headerRow,
    idColumn = true,
  }: RelationshipInHtmlTableProps & HtmlTableProps = $props();

  const relationship = getRelationshipsStoreTableIds(
    () => relationships,
    () => relationshipId,
  );
  const localCellIds = getTableCellIds(
    () => relationship.localTableId as any,
    () => relationship.store,
  );
  const remoteCellIds = getTableCellIds(
    () => relationship.remoteTableId as any,
    () => relationship.store,
  );
  const localRowIds = getRowIds(
    () => relationship.localTableId as any,
    () => relationship.store,
  );
  const defaultCellComponent = $derived(editable ? EditableCellView : CellView);
  const cells = $derived(
    getCells(
      [
        ...arrayMap(
          localCellIds.current,
          (cellId) => relationship.localTableId + DOT + cellId,
        ),
        ...arrayMap(
          remoteCellIds.current,
          (cellId) => relationship.remoteTableId + DOT + cellId,
        ),
      ],
      customCells,
      defaultCellComponent,
    ),
  );
  const cellEntries = $derived(objEntries(cells));
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
        {#if !isFalse(idColumn)}
          <th>{relationship.localTableId}.Id</th>
          <th>{relationship.remoteTableId}.Id</th>
        {/if}
        {#each cellEntries as entry (entry[0])}
          <th>{entry[1].label}</th>
        {/each}
        {#each extraHeadersAfter as extraHeader (extraHeader.key)}
          <th class={extraHeader.className}>{extraHeader.label}</th>
        {/each}
      </tr>
    </thead>
  {/if}
  <tbody>
    {#each localRowIds.current as localRowId (localRowId)}
      <RelationshipInHtmlRow
        {localRowId}
        {idColumn}
        {cells}
        localTableId={relationship.localTableId}
        remoteTableId={relationship.remoteTableId}
        {relationshipId}
        {relationships}
        store={relationship.store}
        {extraCellsBefore}
        {extraCellsAfter}
      />
    {/each}
  </tbody>
</table>
