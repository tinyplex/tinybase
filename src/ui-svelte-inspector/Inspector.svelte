<script lang="ts">
  import {onMount} from 'svelte';
  import type {InspectorProps} from '../@types/ui-svelte-inspector/index.d.ts';
  import {createSessionPersister} from '../persisters/persister-browser/index.ts';
  import {createStore} from '../store/index.ts';
  import Nub from './Nub.svelte';
  import Panel from './Panel.svelte';
  import {POSITIONS, UNIQUE_ID} from './common.ts';
  import {APP_STYLESHEET} from './style.ts';

  let {position = 'right', open = false, hue = 270}: InspectorProps = $props();

  const s = createStore();
  const getInitialPosition = () => {
    const index = POSITIONS.indexOf(position);
    return index == -1 ? 1 : index;
  };

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
          position: getInitialPosition(),
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
