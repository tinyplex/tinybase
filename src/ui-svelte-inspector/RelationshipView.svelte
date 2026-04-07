<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Relationships} from '../@types/relationships/index.d.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {RelationshipInHtmlTable} from '../ui-svelte-dom/index.ts';
  import Details from './Details.svelte';
  import {getEditable} from './editable.ts';

  type Props = {
    relationships?: Relationships;
    relationshipsId?: Id;
    relationshipId: Id;
  } & StoreProp;

  let {relationships, relationshipsId, relationshipId, s}: Props = $props();
  const uniqueId = $derived(getUniqueId('r', relationshipsId, relationshipId));
  const title = $derived('Relationship: ' + relationshipId);
  const [editable, handleEditable] = getEditable(
    () => uniqueId,
    () => s,
  );
</script>

<Details {uniqueId} {title} editable={editable.current} {handleEditable} {s}>
  <RelationshipInHtmlTable
    {relationshipId}
    {relationships}
    editable={editable.current}
  />
</Details>
