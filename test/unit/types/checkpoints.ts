// NB: an exclamation mark after a line visually indicates an expected TS error

import {createCheckpoints, createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {c1: {type: 'number'}, c1d: {type: 'string', default: ''}},
} as const;

const storeWithSchemas = createStore().setSchema(tablesSchema);
const checkpointsWithSchema = createCheckpoints(storeWithSchemas);

const checkpointsWithNoSchema = createCheckpoints(createStore());
checkpointsWithNoSchema.getStore().getTables().t1;
checkpointsWithNoSchema.getStore().getTables().t2;

checkpointsWithSchema.setSize(1).getStore().getTables().t1;
checkpointsWithSchema.setSize(1).getStore().getTables().t2; // !

checkpointsWithSchema.setCheckpoint('c1', 'c1').getStore().getTables().t1;
checkpointsWithSchema.setCheckpoint('c1', 'c1').getStore().getTables().t2; // !

checkpointsWithSchema.getStore().getTables().t1;
checkpointsWithSchema.getStore().getTables().t2; // !

checkpointsWithSchema.addCheckpointIdsListener((checkpoints) => {
  checkpoints.getStore().getTables().t1;
  checkpoints.getStore().getTables().t2; // !
});

checkpointsWithSchema.addCheckpointListener('c1', (checkpoints) => {
  checkpoints.getStore().getTables().t1;
  checkpoints.getStore().getTables().t2; // !
});

checkpointsWithSchema.delListener('c1').getStore().getTables().t1;
checkpointsWithSchema.delListener('c1').getStore().getTables().t2; // !

checkpointsWithSchema.goBackward().getStore().getTables().t1;
checkpointsWithSchema.goBackward().getStore().getTables().t2; // !

checkpointsWithSchema.goForward().getStore().getTables().t1;
checkpointsWithSchema.goForward().getStore().getTables().t2; // !

checkpointsWithSchema.goTo('c1').getStore().getTables().t1;
checkpointsWithSchema.goTo('c1').getStore().getTables().t2; // !

checkpointsWithSchema.clear().getStore().getTables().t1;
checkpointsWithSchema.clear().getStore().getTables().t2; // !
