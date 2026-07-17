import type {Store} from 'tinybase';
import {createStore} from 'tinybase';
import type {Persister} from 'tinybase/persisters';
import {createYjsPersister} from 'tinybase/persisters/persister-yjs';
import {beforeEach, describe, expect, test, vi} from 'vitest';
import {Doc as YDoc, Map as YMap, applyUpdate, encodeStateAsUpdate} from 'yjs';
import {pause} from '../common/other.ts';

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

describe('Observe doc', () => {
  test('contains ignored-error handler failures', async () => {
    const ignoredError = vi.fn(() => {
      throw new Error('ignored-error handler failed');
    });
    const persister = createYjsPersister(
      store1,
      doc1,
      'tinybase',
      ignoredError,
    );
    store1.setCell('t1', 'r1', 'c1', 1);
    await persister.save();
    await persister.startAutoLoad();

    doc1.getMap('tinybase').set('t', new YMap([['t1', 1]]));
    await pause();

    expect(ignoredError).toHaveBeenCalledOnce();
    expect(store1.getCell('t1', 'r1', 'c1')).toBe(1);
    await persister.destroy();
  });

  test('preserves event paths for other observers', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await persister1.save();
    await persister1.startAutoLoad();

    const paths: (string | number)[][] = [];
    doc1
      .getMap('tinybase')
      .observeDeep((events) => events.forEach(({path}) => paths.push(path)));

    const yTables = doc1.getMap('tinybase').get('t') as YMap<
      YMap<YMap<number>>
    >;
    yTables.get('t1')?.get('r1')?.set('c1', 2);
    await pause();

    expect(paths).toEqual([['t', 't1', 'r1']]);
    expect(store1.getCell('t1', 'r1', 'c1')).toBe(2);
  });

  test('reports malformed containers without changing the Store', async () => {
    const ignoredErrors: Error[] = [];
    const persister = createYjsPersister(store1, doc1, 'tinybase', (error) =>
      ignoredErrors.push(error),
    );
    store1.setCell('t1', 'r1', 'c1', 1).setValue('v1', 1);
    await persister.startAutoLoad();

    const yContent = doc1.getMap('tinybase');
    expect(() => yContent.set('t', 1)).not.toThrow();
    expect(() =>
      doc1.transact(() => {
        yContent.set('t', new YMap());
        yContent.set('v', 1);
      }),
    ).not.toThrow();
    expect(() =>
      doc1.transact(() => {
        yContent.set('t', new YMap([['t1', 1]]));
        yContent.set('v', new YMap());
      }),
    ).not.toThrow();
    expect(() =>
      yContent.set('t', new YMap([['t1', new YMap([['r1', 1]])]])),
    ).not.toThrow();
    await pause();

    expect(ignoredErrors.map(({message}) => message)).toEqual([
      'tinybase:1',
      'tinybase:1',
      'tinybase:1',
      'tinybase:1',
    ]);
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

  test('reserved identifiers', async () => {
    await persister2.startAutoLoad();
    store1
      .setCell('__proto__', 'constructor', 'prototype', 'safe')
      .setValue('__proto__', 'safe');
    await persister1.save();

    const [tables, values] = store2.getContent();
    expect(Object.hasOwn(tables, '__proto__')).toEqual(true);
    expect(tables['__proto__']['constructor']['prototype']).toEqual('safe');
    expect(Object.hasOwn(values, '__proto__')).toEqual(true);
    expect(values['__proto__']).toEqual('safe');
  });

  test('autoSave1', async () => {
    await persister1.startAutoSave();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await pause();
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('falls back when incremental containers are missing', async () => {
    store1.setCell('t1', 'r1', 'c1', 1);
    await persister1.save();
    await persister1.startAutoSave();
    const yTables = doc1.getMap('tinybase').get('t') as YMap<
      YMap<YMap<number>>
    >;

    yTables.get('t1')?.delete('r1');
    store1.setCell('t1', 'r1', 'c1', 2);
    await pause();
    expect(yTables.get('t1')?.get('r1')?.toJSON()).toEqual({c1: 2});

    yTables.delete('t1');
    store1.setCell('t1', 'r1', 'c1', 3);
    await pause();
    expect(yTables.get('t1')?.get('r1')?.toJSON()).toEqual({c1: 3});
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
