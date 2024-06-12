// NB: an exclamation mark after a line visually indicates an expected TS error

import {createStore} from 'tinybase/with-schemas';
import {createTools} from 'tinybase/tools/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {
    c1: {type: 'number'},
    c1d: {type: 'string', default: ''},
  },
} as const;

const storeWithSchemas = createStore().setSchema(tablesSchema);
const toolsWithSchema = createTools(storeWithSchemas);

const toolsWithNoSchema = createTools(createStore());
toolsWithNoSchema.getStore().getTables().t1;
toolsWithNoSchema.getStore().getTables().t2;

toolsWithSchema.getStoreTablesSchema().t1;
toolsWithSchema.getStoreTablesSchema().t2; // !

toolsWithSchema.getStoreValuesSchema().v1;
toolsWithSchema.getStoreValuesSchema().v2;

toolsWithSchema.getStore().getTables().t1;
toolsWithSchema.getStore().getTables().t2; // !
