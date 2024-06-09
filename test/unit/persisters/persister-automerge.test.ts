import {
  AutomergeTestNetworkAdapter,
  resetNetwork,
} from '../common/automerge-adaptor.ts';
import {DocHandle, Repo} from '@automerge/automerge-repo';
import type {Persister, Store} from 'tinybase/debug';
import {createAutomergePersister} from 'tinybase/debug/persisters/persister-automerge';
import {createStore} from 'tinybase/debug';
import {pause} from '../common/other.ts';

let repo1: Repo;
let docHandler1: DocHandle<any>;
let store1: Store;
let persister1: Persister;

beforeEach(async () => {
  resetNetwork();
  repo1 = new Repo({network: [new AutomergeTestNetworkAdapter()]});
  docHandler1 = repo1.create();
  store1 = createStore();
  persister1 = createAutomergePersister(store1, docHandler1);
});

test('custom name', async () => {
  const docHandler = repo1.create();
  const persister = createAutomergePersister(store1, docHandler, 'test');
  await persister.save();
  expect(await docHandler.doc()).toEqual({test: {t: {}, v: {}}});
});

describe('Save to empty doc', () => {
  test('nothing', async () => {
    await persister1.save();
    expect(await docHandler1.doc()).toEqual({tinybase: {t: {}, v: {}}});
  });

  test('tables', async () => {
    store1.setTables({t1: {r1: {c1: 1}}});
    await persister1.save();
    expect(await docHandler1.doc()).toEqual({
      tinybase: {t: {t1: {r1: {c1: 1}}}, v: {}},
    });
  });

  test('values', async () => {
    store1.setValues({v1: 1});
    await persister1.save();
    expect(await docHandler1.doc()).toEqual({tinybase: {t: {}, v: {v1: 1}}});
  });

  test('both', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    expect(await docHandler1.doc()).toEqual({
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
    docHandler1.change((doc: any) => (doc['tinybase'] = {t: 1}));
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {}]);
  });

  test('slightly broken, can default', async () => {
    docHandler1.change((doc: any) => (doc['tinybase'] = {t: 1}));
    await persister1.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('tables', async () => {
    docHandler1.change(
      (doc: any) => (doc['tinybase'] = {t: {t1: {r1: {c1: 1}}}, v: {}}),
    );
    await persister1.load();
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
  });

  test('values', async () => {
    docHandler1.change((doc: any) => (doc['tinybase'] = {t: {}, v: {v1: 1}}));
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {v1: 1}]);
  });

  test('both', async () => {
    docHandler1.change(
      (doc: any) => (doc['tinybase'] = {t: {t1: {r1: {c1: 1}}}, v: {v1: 1}}),
    );
    await persister1.load();
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });
});

describe('Two stores, one doc', () => {
  let store2: Store;
  let persister2: Persister;
  beforeEach(() => {
    store2 = createStore();
    persister2 = createAutomergePersister(store2, docHandler1);
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
  let docHandler2: DocHandle<any>;
  let store2: Store;
  let persister2: Persister;

  const syncDocs = async () => {
    await pause();
    await docHandler1.doc();
    await docHandler2.doc();
    await pause();
  };

  beforeEach(async () => {
    const repo2 = new Repo({network: [new AutomergeTestNetworkAdapter()]});
    docHandler2 = repo2.find(docHandler1.documentId);
    await syncDocs();
    store2 = createStore();
    persister2 = createAutomergePersister(store2, docHandler2);
    await persister2.save();
    await syncDocs();
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
