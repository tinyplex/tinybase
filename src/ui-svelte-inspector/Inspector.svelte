<script lang="ts">
  import type {InspectorProps} from '../@types/ui-svelte-inspector/index.d.ts';

  const UNIQUE_ID = 'tinybaseInspector';
  const TITLE = 'TinyBase Inspector';

  let {position = 'right', open = false, hue = 270}: InspectorProps = $props();
</script>

<aside
  id={UNIQUE_ID}
  title={TITLE}
  data-position={position}
  data-open={open}
  style={`--hue:${hue}`}
></aside>
