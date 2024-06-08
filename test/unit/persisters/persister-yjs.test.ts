import type {Persister, Store} from 'tinybase/debug';
import {Doc as YDoc, Map as YMap, applyUpdate, encodeStateAsUpdate} from 'yjs';
import {createStore} from 'tinybase/debug';
import {createYjsPersister} from 'tinybase/debug/persisters/persister-yjs';
import {pause} from '../common/other';

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
  expect(doc.toJSON()).toEqual({test: {t: {}, v: {}}});
});

describe('Save to empty doc', () => {
  test('nothing', async () => {
    await persister1.save();
    expect(doc1.toJSON()).toEqual({tinybase: {t: {}, v: {}}});
  });

  test('tables', async () => {
    store1.setTables({t1: {r1: {c1: 1}}});
    await persister1.save();
    expect(doc1.toJSON()).toEqual({tinybase: {t: {t1: {r1: {c1: 1}}}, v: {}}});
  });

  test('values', async () => {
    store1.setValues({v1: 1});
    await persister1.save();
    expect(doc1.toJSON()).toEqual({tinybase: {t: {}, v: {v1: 1}}});
  });

  test('both', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    expect(doc1.toJSON()).toEqual({
      tinybase: {t: {t1: {r1: {c1: 1}}}, v: {v1: 1}},
    });
  });
});

describe('Load from doc', () => {
  test('nothing', async () => {
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {}]);
  });

  test('defaulted', async () => {
    await persister1.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('broken', async () => {
    doc1.getMap('tinybase').set('t', 1);
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {}]);
  });

  test('slightly broken, can default', async () => {
    doc1.getMap('tinybase').set('t', 1);
    await persister1.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('tables', async () => {
    doc1
      .getMap('tinybase')
      .set('t', new YMap([['t1', new YMap([['r1', new YMap([['c1', 1]])]])]]));
    doc1.getMap('tinybase').set('v', new YMap());
    await persister1.load();
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
  });

  test('values', async () => {
    doc1.getMap('tinybase').set('t', new YMap());
    doc1.getMap('tinybase').set('v', new YMap([['v1', 1]]));
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {v1: 1}]);
  });

  test('both', async () => {
    doc1
      .getMap('tinybase')
      .set('t', new YMap([['t1', new YMap([['r1', new YMap([['c1', 1]])]])]]));
    doc1.getMap('tinybase').set('v', new YMap([['v1', 1]]));
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
    await pause();
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
    await pause();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2, complex transactions', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1
      .setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}})
      .setValues({v1: 1, v2: 2});
    await pause();
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delCell('t1', 'r1', 'c2');
    await pause();
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delRow('t1', 'r2');
    await pause();
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delTable('t2');
    await pause();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1, v2: 2}]);
    store1.delValue('v2');
    await pause();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    store1.setCell('t1', 'r1', 'c1', 2);
    await pause();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    store1.setValue('v1', 2);
    await pause();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
  });
});

describe('Two stores, two docs', () => {
  let doc2: YDoc;
  let store2: Store;
  let persister2: Persister;

  const syncDocs = async () => {
    await pause();
    applyUpdate(doc1, encodeStateAsUpdate(doc2));
    applyUpdate(doc2, encodeStateAsUpdate(doc1));
    await pause();
  };

  beforeEach(() => {
    doc2 = new YDoc();
    store2 = createStore();
    persister2 = createYjsPersister(store2, doc2);
  });

  test('manual', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    await syncDocs();
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1', async () => {
    await persister1.startAutoSave();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await syncDocs();
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoLoad2', async () => {
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('Full synchronization, complex transactions', async () => {
    await persister1.startAutoSave();
    await persister1.startAutoLoad();
    await persister2.startAutoSave();
    await persister2.startAutoLoad();
    await syncDocs();
    store1.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 1}},
    });
    store2.setValues({v1: 1, v2: 2});
    await syncDocs();
    expect(store1.getContent()).toEqual([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delCell('t1', 'r1', 'c2');
    await syncDocs();
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delRow('t1', 'r2');
    await syncDocs();
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delTable('t2');
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1, v2: 2}]);
    store1.delValue('v2');
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    store1.setCell('t1', 'r1', 'c1', 2);
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    store1.setValue('v1', 2);
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
  });
});
