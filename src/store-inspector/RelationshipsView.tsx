/** @jsx createElement */

import {getUniqueId, sortedIdsMap} from './common';
import {useRelationshipIds, useRelationships} from '../ui-react';
import {DEFAULT} from '../common/strings';
import {Details} from './Details';
import {Id} from '../types/common';
import {RelationshipInHtmlTable} from '../ui-react/dom';
import {Relationships} from '../types/relationships';
import {StoreProp} from './types';
import {arrayIsEmpty} from '../common/array';
import {createElement} from '../ui-react/common';
import {isUndefined} from '../common/other';

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
  return (
    <Details
      uniqueId={getUniqueId('r', relationshipsId, relationshipId)}
      summary={'Relationship: ' + relationshipId}
      s={s}
    >
      <RelationshipInHtmlTable
        relationshipId={relationshipId}
        relationships={relationships}
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
            />
          ))}
    </Details>
  );
};
