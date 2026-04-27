<script lang="ts">
  import {
    RemoteRowView,
    LocalRowsView,
    LinkedRowsView,
    getRemoteRowId,
    getLocalRowIds,
    getLinkedRowIds,
  } from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {relationshipsId}: {relationshipsId?: Id} = $props();

  const remoteRowId = getRemoteRowId(
    () => 'r1',
    () => 'r1',
    () => relationshipsId,
  );
  const localRowIds = getLocalRowIds(
    () => 'r1',
    () => 'R1',
    () => relationshipsId,
  );
  const linkedRowIds = getLinkedRowIds(
    () => 'r1',
    () => 'r1',
    () => relationshipsId,
  );
</script>

<RemoteRowView
  relationshipId="r1"
  localRowId="r1"
  relationships={relationshipsId}
/>{JSON.stringify(remoteRowId.current)}<LocalRowsView
  relationshipId="r1"
  remoteRowId="R1"
  relationships={relationshipsId}
/>{JSON.stringify(localRowIds.current)}<LinkedRowsView
  relationshipId="r1"
  firstRowId="r1"
  relationships={relationshipsId}
/>{JSON.stringify(linkedRowIds.current)}
