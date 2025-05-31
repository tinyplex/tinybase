import {
  addOrRemoveHash,
  getCellHash,
  getCellInRowHash,
  getHash,
  getHlcFunctions,
  getRowHash,
  getRowInTableHash,
  getTableHash,
  getTableInTablesHash,
  getTablesHash,
  getValueHash,
  getValueInValuesHash,
  getValuesHash,
} from 'tinybase';
import {getTimeFunctions} from '../../common/mergeable.ts';
const [reset, getNow] = getTimeFunctions();

beforeEach(() => {
  reset();
});

test('getHlcFunctions', () => {
  const [
    getNextHlc,
    seenHlc,
    encodeHlc,
    decodeHlc,
    getLastLogicalTime,
    getLastCounter,
    getClientId,
  ] = getHlcFunctions('s1', getNow);
  expect(getNextHlc()).toEqual('Nn1JUF-----7JQY8');
  expect(getNextHlc()).toEqual('Nn1JUF----07JQY8');
  expect(getLastLogicalTime()).toEqual(1704067200000);

  expect(encodeHlc(1704067201000, 2, 's2')).toEqual('Nn1JUUc---14JQFF');
  expect(decodeHlc('Nn1JUUc---14JQFF')).toEqual([1704067201000, 2, '4JQFF']);

  seenHlc('Nn1JUUc---14JQFF');
  expect(getLastLogicalTime()).toEqual(1704067201000);
  expect(getLastCounter()).toEqual(2);
  expect(getClientId()).toEqual('7JQY8');
});

describe('hash functions', () => {
  test('getHash', () => {
    expect(getHash('Hello, world!')).toEqual(3985698964);
    expect(getHash('Hello, world?')).toEqual(3549480870);
  });

  test('addOrRemoveHash', () => {
    const hash1 = 123456789;
    const hash2 = 987654321;
    expect(addOrRemoveHash(hash1, hash2)).toEqual(1032168868);
    expect(addOrRemoveHash(1032168868, hash1)).toEqual(987654321);
    expect(addOrRemoveHash(1032168868, hash2)).toEqual(123456789);
  });

  test('collection hash functions', () => {
    // Hashes must match 'Create, with uniqueId' test for MergeableStore
    // [{t1: {r1: {c1: 1}}}, {v1: 1}];
    expect(getCellHash(1, 'Nn1JUF-----7JQY8')).toEqual(1003668370);
    expect(getCellHash(undefined, 'Nn1JUF-----7JQY8')).toEqual(3052999146);
    expect(getCellInRowHash('c1', 1003668370)).toEqual(1869781647);
    expect(getRowHash({c1: 1003668370})).toEqual(550994372);
    expect(getRowInTableHash('r1', 550994372)).toEqual(1072852846);
    expect(getTableHash({r1: 550994372})).toEqual(1072852846);
    expect(getTableInTablesHash('t1', 1072852846)).toEqual(1771939739);
    expect(getTablesHash({t1: 1072852846})).toEqual(1771939739);

    expect(getValueHash(1, 'Nn1JUF----07JQY8')).toEqual(1130939691);
    expect(getValueInValuesHash('v1', 1130939691)).toEqual(3884056078);
    expect(getValuesHash({v1: 1130939691})).toEqual(3877632732);
  });
});
