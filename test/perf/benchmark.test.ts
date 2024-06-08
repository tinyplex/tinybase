import type {TablesSchema} from 'tinybase/debug';
import {createStore} from 'tinybase/debug';
import {µs} from './common';

const SIZE = 50;

test(`${Math.pow(SIZE, 3)} cells benchmark`, () => {
  const tablesSchema: TablesSchema = {};
  for (let tableId = 0; tableId <= SIZE; tableId++) {
    tablesSchema[tableId] = {};
    for (let cellId = 0; cellId <= SIZE; cellId++) {
      tablesSchema[tableId][cellId] = {type: 'number', default: -1};
    }
  }

  const store2 = createStore();
  let cells2 = 0;
  store2.addCellListener(null, null, null, () => cells2++);
  const time2 = µs(() => {
    for (let tableId = 1; tableId <= SIZE; tableId++) {
      for (let rowId = 1; rowId <= SIZE; rowId++) {
        for (let cellId = 1; cellId <= SIZE; cellId++) {
          store2.setPartialRow(tableId + '', rowId + '', {[cellId + '']: 2});
        }
      }
    }
  });
  // eslint-disable-next-line no-console
  console.log(`${cells2} cells changed in ${Math.round(time2 / 10000) / 100}s`);

  const store = createStore();
  let cells = 0;
  store.addCellListener(null, null, null, () => cells++);
  const time = µs(() => {
    for (let tableId = 1; tableId <= SIZE; tableId++) {
      for (let rowId = 1; rowId <= SIZE; rowId++) {
        for (let cellId = 1; cellId <= SIZE; cellId++) {
          store.setCell(tableId + '', rowId + '', cellId + '', 2);
        }
      }
    }
  });
  // eslint-disable-next-line no-console
  console.log(`${cells} cells changed in ${Math.round(time / 10000) / 100}s`);

  expect(1).toEqual(1);
});
