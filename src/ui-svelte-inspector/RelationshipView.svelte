<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Relationships} from '../@types/relationships/index.d.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {RelationshipInHtmlTable} from '../ui-svelte-dom/index.ts';
  import Details from './Details.svelte';

  type Props = {
    relationships?: Relationships;
    relationshipsId?: Id;
    relationshipId: Id;
  } & StoreProp;

  let {relationships, relationshipsId, relationshipId, s}: Props = $props();
  const title = $derived('Relationship: ' + relationshipId);
</script>

<Details uniqueId={getUniqueId('r', relationshipsId, relationshipId)} {title} {s}>
  {#snippet children()}
    <RelationshipInHtmlTable {relationshipId} {relationships} />
  {/snippet}
</Details>
