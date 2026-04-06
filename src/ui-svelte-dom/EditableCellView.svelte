<script lang="ts">
  import type {
    EditableCellView as EditableCellViewDecl,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import type {CellViewProps} from '../@types/ui-svelte/index.d.ts';
  import {CELL} from '../common/strings.ts';
  import {getCell, resolveStore} from '../ui-svelte/functions.svelte.ts';
  import EditableThing from './common/EditableThing.svelte';
  import {EDITABLE} from './common/index.ts';

  let {
    tableId,
    rowId,
    cellId,
    store,
    className,
    showType,
  }: CellViewProps & {readonly className?: string; readonly showType?: boolean} =
    $props();

  const cell = getCell(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
  const resolvedStore = resolveStore(() => store);
</script>

<EditableThing
  thing={cell.current}
  onThingChange={(thing) => (cell.current = thing)}
  className={className ?? EDITABLE + CELL}
  {showType}
  hasSchema={() => resolvedStore()?.hasTablesSchema() ?? false}
/>
