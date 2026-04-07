<script lang="ts">
  import {onMount} from 'svelte';
  import type {InspectorProps} from '../@types/ui-svelte-inspector/index.d.ts';
  import {
    UNIQUE_ID,
    getInitialPosition,
  } from '../common/inspector/common.ts';
  import {APP_STYLESHEET} from '../common/inspector/style.ts';
  import {createSessionPersister} from '../persisters/persister-browser/index.ts';
  import {createStore} from '../store/index.ts';
  import Nub from './Nub.svelte';
  import Panel from './Panel.svelte';

  let {position = 'right', open = false, hue = 270}: InspectorProps = $props();

  const s = createStore();

  onMount(() => {
    let mounted = true;
    let persister:
      | ReturnType<typeof createSessionPersister>
      | undefined;

    void (async () => {
      persister = createSessionPersister(s, UNIQUE_ID);
      await persister.load([
        {},
        {
          position: getInitialPosition(position),
          open: !!open,
        },
      ]);
      if (!mounted) {
        await persister.destroy();
        return;
      }
      await persister.startAutoSave();
    })();

    return () => {
      mounted = false;
      void persister?.destroy();
    };
  });
</script>

<aside id={UNIQUE_ID} style={`--hue:${hue}`}>
  <Nub {s} />
  <Panel {s} />
</aside>
<svelte:head>
  {@html `<style>${APP_STYLESHEET}</style>`}
</svelte:head>
