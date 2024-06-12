// NB: an exclamation mark after a line visually indicates an expected TS error

import {createIndexes, createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {c1: {type: 'number'}, c1d: {type: 'string', default: ''}},
} as const;

const storeWithSchemas = createStore().setSchema(tablesSchema);
const indexesWithSchema = createIndexes(storeWithSchemas);

const indexesWithNoSchema = createIndexes(createStore());
indexesWithNoSchema.getStore().getTables().t1;
indexesWithNoSchema.getStore().getTables().t2;

indexesWithSchema.setIndexDefinition('i1', 't1', 'c1', 'c1');
indexesWithSchema.setIndexDefinition(
  'i1',
  't1',
  (getCell) => getCell('c1d'),
  (getCell) => getCell('c1d'),
);
indexesWithSchema.setIndexDefinition('i1', 't2', 'c1', 'c1'); // !
indexesWithSchema.setIndexDefinition('i1', 't1', 'c2', 'c1'); // !
indexesWithSchema.setIndexDefinition('i1', 't1', 'c1', 'c2'); // !
indexesWithSchema.setIndexDefinition(
  'i1',
  't1',
  (getCell) => getCell('c1'), // !
);
indexesWithSchema.setIndexDefinition(
  'i1',
  't1',
  (getCell) => getCell('c1d'),
  (getCell) => getCell('c1'), // !
);
indexesWithSchema.setIndexDefinition(
  'i1',
  't1',
  (getCell) => getCell('c2'), // !
  (getCell) => getCell('c2'), // !
);

indexesWithSchema.delIndexDefinition('i1').getStore().getTables().t1;
indexesWithSchema.delIndexDefinition('i1').getStore().getTables().t2; // !

indexesWithSchema.getStore().getTables().t1;
indexesWithSchema.getStore().getTables().t2; // !

indexesWithSchema.forEachIndex((_indexId, forEachSlice) => {
  forEachSlice((_sliceId, forEachRow) => {
    forEachRow((_rowId, forEachCell) => {
      forEachCell((cellId, cell) => {
        if (cellId == 'c0') {
          cell as number;
          cell as undefined; // !
          cell as string; // !
        }
        if (cellId == 'c1') {
          cell as number;
          cell as undefined; // !
          cell as string; // !
        }
        if (cellId == 'c1d') {
          cell as string;
          cell as number; // !
          cell as undefined; // !
        }
        cellId == 'c2'; // !
      });
    });
  });
});

indexesWithSchema.forEachSlice('i1', (_sliceId, forEachRow) => {
  forEachRow((_rowId, forEachCell) => {
    forEachCell((cellId, cell) => {
      if (cellId == 'c0') {
        cell as number;
        cell as undefined; // !
        cell as string; // !
      }
      if (cellId == 'c1') {
        cell as number;
        cell as undefined; // !
        cell as string; // !
      }
      if (cellId == 'c1d') {
        cell as string;
        cell as number; // !
        cell as undefined; // !
      }
      cellId == 'c2'; // !
    });
  });
});

indexesWithSchema.getTableId('i1') == 't0';
indexesWithSchema.getTableId('i1') == 't1';
indexesWithSchema.getTableId('i1') == 't2'; // !

indexesWithSchema.addSliceIdsListener('i1', (indexes) => {
  indexes.getStore().getTables().t1;
  indexes.getStore().getTables().t2; // !
});

indexesWithSchema.addSliceRowIdsListener('i1', 's1', (indexes) => {
  indexes.getStore().getTables().t1;
  indexes.getStore().getTables().t2; // !
});

indexesWithSchema.delListener('i1').getStore().getTables().t1;
indexesWithSchema.delListener('i1').getStore().getTables().t2; // !
