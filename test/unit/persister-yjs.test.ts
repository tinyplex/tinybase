/* eslint-disable jest/no-conditional-expect */
import {Persister, Store, createStore} from 'tinybase/debug';
import {Doc as YDoc, Map as YMap, applyUpdate, encodeStateAsUpdate} from 'yjs';
import {createYjsPersister} from 'tinybase/debug/persister-yjs';

let doc1: YDoc;
let store1: Store;
let persister1: Persister;

beforeEach(() => {
  doc1 = new YDoc();
  store1 = createStore();
  persister1 = createYjsPersister(store1, doc1);
});

test('custom name', async () => {
  const doc = new YDoc();
  const persister = createYjsPersister(store1, doc, 'test');
  await persister.save();
  expect(doc.toJSON()).toEqual({test: [{}, {}]});
});

describe('Save to empty doc', () => {
  test('nothing', async () => {
    await persister1.save();
    expect(doc1.toJSON()).toEqual({tinybase: [{}, {}]});
  });

  test('tables', async () => {
    store1.setTables({t1: {r1: {c1: 1}}});
    await persister1.save();
    expect(doc1.toJSON()).toEqual({tinybase: [{t1: {r1: {c1: 1}}}, {}]});
  });

  test('values', async () => {
    store1.setValues({v1: 1});
    await persister1.save();
    expect(doc1.toJSON()).toEqual({tinybase: [{}, {v1: 1}]});
  });

  test('both', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    expect(doc1.toJSON()).toEqual({tinybase: [{t1: {r1: {c1: 1}}}, {v1: 1}]});
  });
});

describe('Load from doc', () => {
  test('nothing', async () => {
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {}]);
  });

  test('defaulted', async () => {
    await persister1.load({t1: {r1: {c1: 1}}}, {v1: 1});
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('broken', async () => {
    doc1.getArray('tinybase').push([1, 2]);
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {}]);
  });

  test('slightly broken, cannot default', async () => {
    doc1.getArray('tinybase').push([1, 2]);
    await persister1.load({t1: {r1: {c1: 1}}}, {v1: 1});
    expect(store1.getContent()).toEqual([{}, {}]);
  });

  test('tables', async () => {
    doc1
      .getArray('tinybase')
      .push([
        new YMap([['t1', new YMap([['r1', new YMap([['c1', 1]])]])]]),
        new YMap(),
      ]);
    await persister1.load();
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
  });

  test('values', async () => {
    doc1.getArray('tinybase').push([new YMap(), new YMap([['v1', 1]])]);
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {v1: 1}]);
  });

  test('both', async () => {
    doc1
      .getArray('tinybase')
      .push([
        new YMap([['t1', new YMap([['r1', new YMap([['c1', 1]])]])]]),
        new YMap([['v1', 1]]),
      ]);
    await persister1.load();
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });
});

describe('Two stores, one doc', () => {
  let store2: Store;
  let persister2: Persister;
  beforeEach(() => {
    store2 = createStore();
    persister2 = createYjsPersister(store2, doc1);
  });

  test('manual', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1', async () => {
    await persister1.startAutoSave();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoLoad2', async () => {
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2, complex transactions', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1
      .setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}})
      .setValues({v1: 1, v2: 2});
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delCell('t1', 'r1', 'c2');
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delRow('t1', 'r2');
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delTable('t2');
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1, v2: 2}]);
    store1.delValue('v2');
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    store1.setCell('t1', 'r1', 'c1', 2);
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    store1.setValue('v1', 2);
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
  });
});

describe('Two stores, two docs', () => {
  let doc2: YDoc;
  let store2: Store;
  let persister2: Persister;
  beforeEach(() => {
    doc2 = new YDoc();
    store2 = createStore();
    persister2 = createYjsPersister(store2, doc2);
  });

  test('manual', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1', async () => {
    await persister1.startAutoSave();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoLoad2', async () => {
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2, complex transactions', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1
      .setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}})
      .setValues({v1: 1, v2: 2});
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delCell('t1', 'r1', 'c2');
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delRow('t1', 'r2');
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delTable('t2');
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1, v2: 2}]);
    store1.delValue('v2');
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    store1.setCell('t1', 'r1', 'c1', 2);
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    store1.setValue('v1', 2);
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
  });
});
