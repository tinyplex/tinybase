<script lang="ts">
  import type {
    EditableValueView as EditableValueViewDecl,
  } from '../@types/ui-svelte-dom/index.d.ts';
  import type {ValueViewProps} from '../@types/ui-svelte/index.d.ts';
  import {VALUE} from '../common/strings.ts';
  import {getValue, resolveStore} from '../ui-svelte/functions.svelte.ts';
  import EditableThing from './common/EditableThing.svelte';
  import {EDITABLE} from './common/index.ts';

  let {
    valueId,
    store,
    className,
    showType,
  }: ValueViewProps & {
    readonly className?: string;
    readonly showType?: boolean;
  } = $props();

  const value = getValue(
    () => valueId,
    () => store,
  );
  const resolvedStore = resolveStore(() => store);
</script>

<EditableThing
  thing={value.current}
  onThingChange={(thing) => (value.current = thing)}
  className={className ?? EDITABLE + VALUE}
  {showType}
  hasSchema={() => resolvedStore()?.hasValuesSchema() ?? false}
/>
