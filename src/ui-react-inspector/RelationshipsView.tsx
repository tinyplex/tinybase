/** @jsx createElement */

import {getUniqueId, sortedIdsMap, useEditable} from './common.ts';
import {useRelationshipIds, useRelationships} from '../ui-react/index.ts';
import {DEFAULT} from '../common/strings.ts';
import {Details} from './Details.tsx';
import type {Id} from '../@types/common/index.d.ts';
import {RelationshipInHtmlTable} from '../ui-react-dom/index.tsx';
import type {Relationships} from '../@types/relationships/index.d.ts';
import type {StoreProp} from './types.ts';
import {arrayIsEmpty} from '../common/array.ts';
import {createElement} from '../common/react.ts';
import {isUndefined} from '../common/other.ts';

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
      summary={'Relationship: ' + relationshipId}
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
      summary={'Relationships: ' + (relationshipsId ?? DEFAULT)}
      s={s}
    >
      {arrayIsEmpty(relationshipIds)
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
