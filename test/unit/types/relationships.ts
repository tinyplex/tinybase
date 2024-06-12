// NB: an exclamation mark after a line visually indicates an expected TS error

import {createRelationships, createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {
    c1: {type: 'number'},
    c1d: {type: 'string', default: ''},
  },
} as const;

const storeWithSchemas = createStore().setSchema(tablesSchema);
const relationshipsWithSchema = createRelationships(storeWithSchemas);

const relationshipsWithNoSchema = createRelationships(createStore());
relationshipsWithNoSchema.getStore().getTables().t1;
relationshipsWithNoSchema.getStore().getTables().t2;

relationshipsWithSchema.setRelationshipDefinition('r1', 't1', 't0', 'c1');
relationshipsWithSchema.setRelationshipDefinition('r1', 't1', 't0', (getCell) =>
  getCell('c1d'),
);
relationshipsWithSchema.setRelationshipDefinition('r1', 't1', 't0', 'c2'); // !
relationshipsWithSchema.setRelationshipDefinition('r1', 't1', 't2', 'c1'); // !
relationshipsWithSchema.setRelationshipDefinition('r1', 't2', 't0', 'c1'); // !
relationshipsWithSchema.setRelationshipDefinition(
  'r1',
  't1',
  't0',
  (getCell) => getCell('c1'), // !
);
relationshipsWithSchema.setRelationshipDefinition(
  'r1',
  't1',
  't0',
  (getCell) => getCell('c2'), // !
);

relationshipsWithSchema.delRelationshipDefinition('r1').getStore().getTables()
  .t1;
relationshipsWithSchema.delRelationshipDefinition('r1').getStore().getTables()
  .t2; // !

relationshipsWithSchema.getStore().getTables().t1;
relationshipsWithSchema.getStore().getTables().t2; // !

relationshipsWithSchema.forEachRelationship((_relationshipId, forEachRow) => {
  forEachRow((_rowId, forEachCell) => {
    forEachCell((cellId, cell) => {
      if (cellId == 'c1') {
        cell as number;
        cell as string; // !
      }
    });
  });
});

relationshipsWithSchema.getLocalTableId('r1') == 't0';
relationshipsWithSchema.getLocalTableId('r1') == 't1';
relationshipsWithSchema.getLocalTableId('r1') == 't2'; // !

relationshipsWithSchema.getRemoteTableId('r1') == 't0';
relationshipsWithSchema.getRemoteTableId('r1') == 't1';
relationshipsWithSchema.getRemoteTableId('r1') == 't2'; // !

relationshipsWithSchema.addRemoteRowIdListener('r1', 'r1', (relationships) => {
  relationships.getStore().getTables().t1;
  relationships.getStore().getTables().t2; // !
});

relationshipsWithSchema.addLocalRowIdsListener('r1', 'r1', (relationships) => {
  relationships.getStore().getTables().t1;
  relationships.getStore().getTables().t2; // !
});

relationshipsWithSchema.addLinkedRowIdsListener('r1', 'r1', (relationships) => {
  relationships.getStore().getTables().t1;
  relationships.getStore().getTables().t2; // !
});

relationshipsWithSchema.delListener('r1').getStore().getTables().t1;
relationshipsWithSchema.delListener('r1').getStore().getTables().t2; // !
