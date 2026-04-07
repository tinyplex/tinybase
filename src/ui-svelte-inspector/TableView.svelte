<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import {arrayMap} from '../common/array.ts';
  import {
    SORT_CELL,
    STATE_TABLE,
    getUniqueId,
  } from '../common/inspector/common.ts';
  import {objNew} from '../common/obj.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {jsonParse, jsonStringWithMap} from '../common/json.ts';
  import {CellView} from '../ui-svelte/index.ts';
  import {getCell, getTableCellIds} from '../ui-svelte/functions.svelte.ts';
  import {SortedTableInHtmlTable} from '../ui-svelte-dom/index.ts';
  import Actions from './actions/Actions.svelte';
  import RowActions from './actions/RowActions.svelte';
  import TableActions1 from './actions/TableActions1.svelte';
  import TableActions2 from './actions/TableActions2.svelte';
  import Details from './Details.svelte';
  import EditableCellViewWithActions from './EditableCellViewWithActions.svelte';
  import {getEditable} from './editable.ts';

  type Props = {tableId: Id; store: Store; storeId?: Id} & StoreProp;

  let {tableId, store, storeId, s}: Props = $props();

  const uniqueId = $derived(getUniqueId('t', storeId, tableId));
  const tableCellIds = getTableCellIds(
    () => tableId,
    () => store,
  );
  const sort = getCell(
    () => STATE_TABLE,
    () => uniqueId,
    () => SORT_CELL,
    () => s,
  );
  const [editable, handleEditable] = getEditable(
    () => uniqueId,
    () => s,
  );
  const sortAndOffset = $derived(
    jsonParse((sort.current as string) ?? '[]') as [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  );
  const title = $derived('Table: ' + tableId);
  const CellComponent = $derived(
    editable.current ? EditableCellViewWithActions : CellView,
  );
  const customCells = $derived(
    objNew(
      arrayMap(tableCellIds.current, (cellId) => [
        cellId,
        {label: cellId, component: CellComponent},
      ]),
    ),
  );
  const rowActions = [{label: '', component: RowActions}];

  const handleChange = (
    sortAndOffset: [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  ) => {
    sort.current = jsonStringWithMap(sortAndOffset);
  };
</script>

<Details {uniqueId} {title} editable={editable.current} {handleEditable} {s}>
  <SortedTableInHtmlTable
    {tableId}
    {store}
    cellId={sortAndOffset[0]}
    descending={sortAndOffset[1]}
    offset={sortAndOffset[2]}
    limit={10}
    paginator={true}
    sortOnClick={true}
    onChange={handleChange}
    editable={editable.current}
    extraCellsAfter={editable.current ? rowActions : []}
    {customCells}
  />
  {#if editable.current}
    <Actions>
      {#snippet left()}
        <TableActions1 {tableId} {store} />
      {/snippet}
      {#snippet right()}
        <TableActions2 {tableId} {store} />
      {/snippet}
    </Actions>
  {/if}
</Details>
