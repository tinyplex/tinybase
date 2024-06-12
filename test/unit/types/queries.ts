// NB: an exclamation mark after a line visually indicates an expected TS error

import {createQueries, createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {c1: {type: 'number'}, c1d: {type: 'string', default: ''}},
} as const;

const storeWithSchemas = createStore().setSchema(tablesSchema);
const queriesWithSchema = createQueries(storeWithSchemas);

const queriesWithNoSchema = createQueries(createStore());
queriesWithNoSchema.getStore().getTables().t1;
queriesWithNoSchema.getStore().getTables().t2;

queriesWithSchema.setQueryDefinition('q1', 't1', ({select, join, where}) => {
  select('c1');
  select('c2'); // !
  select('jt1', 'jc1');
  select((getTableCell) => {
    getTableCell('c1') as number;
    getTableCell('c2'); // !
    getTableCell('t0', 'c0') as number;
    getTableCell('c1') as string; // !
    getTableCell('t0', 'c0') as string; // !
    getTableCell('t0', 'c2'); // !
    return 'c';
  });
  select((_getCell) => null); // !

  join('t1', 'c1');
  join('t1', 'c2'); // !
  join('t2', 'c1'); // !
  join('t1', (getCell) => {
    getCell('c1') as number;
    getCell('c1') as string; // !
    getCell('c2'); // !
    return '';
  });
  join('t1', (_getCell) => null); // !
  join('t1', 't0', 'c0');
  join('t1', 't0', 'c1'); // !
  join('t1', 't0', (getCell) => {
    getCell('c0') as number;
    getCell('c0') as string; // !
    getCell('c2'); // !
    return '';
  });
  join('t1', 't0', (_getCell) => null); // !

  where('c1', 0);
  where('c1', ''); // !
  where('c2', ''); // !
  where('jt1', 'jc1', 0);
  where('jt1', 'jc1', '');
  where((getTableCell) => {
    getTableCell('c1') as number;
    getTableCell('c1') as string;
    getTableCell('c2');
    getTableCell('jt1', 'jc1');
    return true;
  });
  where((_getTableCell) => null); // !
});
queriesWithSchema.setQueryDefinition('q1', 't2', () => null); // !

queriesWithSchema.delQueryDefinition('q1').getStore().getTables().t1;
queriesWithSchema.delQueryDefinition('q1').getStore().getTables().t2; // !

queriesWithSchema.getStore().getTables().t1;
queriesWithSchema.getStore().getTables().t2; // !

queriesWithSchema.getTableId('q1') == 't0';
queriesWithSchema.getTableId('q1') == 't1';
queriesWithSchema.getTableId('q1') == 't2'; // !

queriesWithSchema.addResultTableListener('q1', (queries) => {
  queries.getStore().getTables().t1;
  queries.getStore().getTables().t2; // !
});

queriesWithSchema.addResultRowIdsListener('q1', (queries) => {
  queries.getStore().getTables().t1;
  queries.getStore().getTables().t2; // !
});

queriesWithSchema.addResultSortedRowIdsListener(
  'q1',
  'rc1',
  true,
  0,
  10,
  (queries) => {
    queries.getStore().getTables().t1;
    queries.getStore().getTables().t2; // !
  },
);

queriesWithSchema.addResultRowListener('q1', 'rr1', (queries) => {
  queries.getStore().getTables().t1;
  queries.getStore().getTables().t2; // !
});

queriesWithSchema.addResultCellIdsListener('q1', 'rr1', (queries) => {
  queries.getStore().getTables().t1;
  queries.getStore().getTables().t2; // !
});

queriesWithSchema.addResultCellListener('q1', 'rr1', 'c1', (queries) => {
  queries.getStore().getTables().t1;
  queries.getStore().getTables().t2; // !
});

queriesWithSchema.delListener('q1').getStore().getTables().t1;
queriesWithSchema.delListener('q1').getStore().getTables().t2; // !
