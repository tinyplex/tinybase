<script lang="ts">
  import type {Id, Ids} from '../../@types/common/index.d.ts';
  import type {
    ExtraRowCell,
    HtmlTableProps,
  } from '../../@types/ui-svelte-dom/index.d.ts';
  import {objEntries} from '../../common/obj.ts';
  import {isFalse, isUndefined} from '../../common/other.ts';
  import {EXTRA} from '../../common/strings.ts';
  import type {
    CellComponentProps,
    Cells,
    HandleSort,
    Paginator,
    SortAndOffset,
  } from './index.ts';
  import {
    DOWN_ARROW,
    UP_ARROW,
    extraKey,
    getExtraHeaders,
    getProps,
  } from './index.ts';

  type Props = HtmlTableProps & {
    readonly cells: Cells;
    readonly cellComponentProps: CellComponentProps;
    readonly rowIds: {readonly current: Ids};
    readonly extraCellsBefore?: ExtraRowCell[];
    readonly extraCellsAfter?: ExtraRowCell[];
    readonly sortAndOffset?: SortAndOffset;
    readonly handleSort?: HandleSort;
    readonly paginator?: Paginator;
  };

  let {
    className,
    headerRow,
    idColumn,
    cells,
    cellComponentProps,
    rowIds,
    extraCellsBefore = [],
    extraCellsAfter = [],
    sortAndOffset,
    handleSort,
    paginator,
  }: Props = $props();

  const cellEntries = $derived(objEntries(cells));
  const extraHeadersBefore = $derived(getExtraHeaders(extraCellsBefore));
  const extraHeadersAfter = $derived(getExtraHeaders(extraCellsAfter, 1));
  const PaginatorComponent = $derived(paginator?.component);
  const paginatorProps = $derived(paginator?.props);
</script>

<table class={className}>
  {#if PaginatorComponent && paginatorProps}
    <caption>
      <PaginatorComponent {...paginatorProps} />
    </caption>
  {/if}
  {#if headerRow !== false}
    <thead>
      <tr>
        {#each extraHeadersBefore as extraHeader (extraHeader.key)}
          <th class={extraHeader.className}>{extraHeader.label}</th>
        {/each}
        {#if idColumn !== false}
          <th
            class={isUndefined(sortAndOffset) || sortAndOffset[0] != null
              ? undefined
              : `sorted ${sortAndOffset[1] ? 'de' : 'a'}scending`}
            onclick={() => handleSort?.(undefined)}
          >
            {#if !isUndefined(sortAndOffset) && sortAndOffset[0] == null}
              {(sortAndOffset[1] ? DOWN_ARROW : UP_ARROW) + ' '}
            {/if}
            Id
          </th>
        {/if}
        {#each cellEntries as entry (entry[0])}
          {@const cellId = entry[0] as Id}
          {@const cell = entry[1]}
          <th
            class={isUndefined(sortAndOffset) || sortAndOffset[0] != cellId
              ? undefined
              : `sorted ${sortAndOffset[1] ? 'de' : 'a'}scending`}
            onclick={() => handleSort?.(cellId)}
          >
            {#if !isUndefined(sortAndOffset) && sortAndOffset[0] == cellId}
              {(sortAndOffset[1] ? DOWN_ARROW : UP_ARROW) + ' '}
            {/if}
            {cell.label}
          </th>
        {/each}
        {#each extraHeadersAfter as extraHeader (extraHeader.key)}
          <th class={extraHeader.className}>{extraHeader.label}</th>
        {/each}
      </tr>
    </thead>
  {/if}
  <tbody>
    {#each rowIds.current as rowId (rowId)}
      {@const rowProps = {...cellComponentProps, rowId} as any}
      <tr>
        {#each extraCellsBefore as extraCell, index (extraKey(index, 0))}
          {@const ExtraCell = extraCell.component}
          <td class={EXTRA}>
            <ExtraCell {...rowProps} />
          </td>
        {/each}
        {#if !isFalse(idColumn)}
          <th title={rowId}>{rowId}</th>
        {/if}
        {#each cellEntries as entry (entry[0])}
          {@const cellId = entry[0] as Id}
          {@const cell = entry[1]}
          {@const CellComponent = cell.component}
          <td>
            <CellComponent
              {...getProps(cell.getComponentProps, rowId, cellId)}
              {...rowProps}
              {cellId}
            />
          </td>
        {/each}
        {#each extraCellsAfter as extraCell, index (extraKey(index, 1))}
          {@const ExtraCell = extraCell.component}
          <td class={EXTRA}>
            <ExtraCell {...rowProps} />
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
