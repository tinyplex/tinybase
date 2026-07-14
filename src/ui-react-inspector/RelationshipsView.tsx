import type {Id} from '../@types/common/index.d.ts';
import type {Relationships} from '../@types/relationships/index.d.ts';

import {getUniqueId, sortedIdsMap} from '../common/inspector/common.ts';
import type {StoreProp} from '../common/inspector/types.ts';
import {isEmpty, isUndefined} from '../common/other.ts';
import {DEFAULT} from '../common/strings.ts';
import {RelationshipInHtmlTable} from '../ui-react-dom/index.tsx';
import {useRelationshipIds, useRelationships} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {useEditable} from './editable.ts';

const RelationshipView = ({
  relationships,
  relationshipsId,
  relationshipId,
  s,
}: {
  readonly relationships?: Relationships | undefined;
  readonly relationshipsId?: Id;
  readonly relationshipId: Id;
} & StoreProp) => {
  const uniqueId = getUniqueId('r', relationshipsId, relationshipId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return (
    <Details
      uniqueId={uniqueId}
      title={'Relationship: ' + relationshipId}
      editable={editable}
      handleEditable={handleEditable}
      s={s}
    >
      <RelationshipInHtmlTable
        relationshipId={relationshipId}
        relationships={relationships}
        editable={editable}
      />
    </Details>
  );
};

export const RelationshipsView = ({
  relationshipsId,
  s,
}: {readonly relationshipsId?: Id} & StoreProp) => {
  const relationships = useRelationships(relationshipsId);
  const relationshipIds = useRelationshipIds(relationships);
  return isUndefined(relationships) ? null : (
    <Details
      uniqueId={getUniqueId('r', relationshipsId)}
      title={'Relationships: ' + (relationshipsId ?? DEFAULT)}
      s={s}
    >
      {isEmpty(relationshipIds)
        ? 'No relationships defined'
        : sortedIdsMap(relationshipIds, (relationshipId) => (
            <RelationshipView
              relationships={relationships}
              relationshipsId={relationshipsId}
              relationshipId={relationshipId}
              s={s}
              key={relationshipId}
            />
          ))}
    </Details>
  );
};
