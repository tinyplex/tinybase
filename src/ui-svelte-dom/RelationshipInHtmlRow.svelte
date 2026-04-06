<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {ExtraRowCell} from '../@types/ui-svelte-dom/index.d.ts';
  import {objEntries} from '../common/obj.ts';
  import {isFalse, isUndefined} from '../common/other.ts';
  import {EXTRA} from '../common/strings.ts';
  import {getRemoteRowId} from '../ui-svelte/functions.svelte.ts';
  import type {Cells} from './common/index.ts';
  import {extraKey, getProps} from './common/index.ts';

  type Props = {
    readonly localRowId: Id;
    readonly idColumn: boolean;
    readonly cells: Cells;
    readonly localTableId: Id | undefined;
    readonly remoteTableId: Id | undefined;
    readonly relationshipId: Id;
    readonly relationships: any;
    readonly store: any;
    readonly extraCellsBefore?: ExtraRowCell[];
    readonly extraCellsAfter?: ExtraRowCell[];
  };

  let {
    localRowId,
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    relationships,
    store,
    extraCellsBefore = [],
    extraCellsAfter = [],
  }: Props = $props();

  const remoteRowId = getRemoteRowId(
    () => relationshipId,
    () => localRowId,
    () => relationships,
  );
  const cellEntries = $derived(objEntries(cells));
  const rowProps = $derived({
    tableId: localTableId ?? '',
    rowId: localRowId,
    store,
  });
</script>

<tr>
  {#each extraCellsBefore as extraCell, index (extraKey(index, 0))}
    {@const ExtraCell = extraCell.component}
    <td class={EXTRA}>
      <ExtraCell {...rowProps} />
    </td>
  {/each}
  {#if !isFalse(idColumn)}
    <th title={localRowId}>{localRowId}</th>
    <th title={remoteRowId.current}>{remoteRowId.current}</th>
  {/if}
  {#each cellEntries as entry (entry[0])}
    {@const compoundCellId = entry[0]}
    {@const cell = entry[1]}
    {@const CellComponent = cell.component}
    {@const [tableId, cellId] = compoundCellId.split('.', 2)}
    {@const rowId =
      tableId === localTableId
        ? localRowId
        : tableId === remoteTableId
          ? remoteRowId.current
          : undefined}
    {#if !isUndefined(rowId)}
      <td>
        <CellComponent
          {...getProps(cell.getComponentProps, rowId, cellId)}
          {store}
          {tableId}
          {rowId}
          {cellId}
        />
      </td>
    {/if}
  {/each}
  {#each extraCellsAfter as extraCell, index (extraKey(index, 1))}
    {@const ExtraCell = extraCell.component}
    <td class={EXTRA}>
      <ExtraCell {...rowProps} />
    </td>
  {/each}
</tr>
