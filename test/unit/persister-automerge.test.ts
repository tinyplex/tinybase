/**
 * @jest-environment node
 */

/* eslint-disable jest/no-conditional-expect */
import {DocHandle, Repo} from 'automerge-repo';
import {Persister, Store, createStore} from 'tinybase/debug';
import {createAutomergePersister} from 'tinybase/debug/persister-automerge';

let docHandler1: DocHandle<any>;
let store1: Store;
let persister1: Persister;

const repo = new Repo({network: []});

beforeEach(() => {
  docHandler1 = repo.create();
  store1 = createStore();
  persister1 = createAutomergePersister(store1, docHandler1);
});

test('custom name', async () => {
  const docHandler = repo.create();
  const persister = createAutomergePersister(store1, docHandler, 'test');
  await persister.save();
  expect(docHandler.doc).toEqual({test: {t: {}, v: {}}});
});

describe('Save to empty doc', () => {
  test('nothing', async () => {
    await persister1.save();
    expect(docHandler1.doc).toEqual({tinybase: {t: {}, v: {}}});
  });

  test('tables', async () => {
    store1.setTables({t1: {r1: {c1: 1}}});
    await persister1.save();
    expect(docHandler1.doc).toEqual({
      tinybase: {t: {t1: {r1: {c1: 1}}}, v: {}},
    });
  });

  test('values', async () => {
    store1.setValues({v1: 1});
    await persister1.save();
    expect(docHandler1.doc).toEqual({tinybase: {t: {}, v: {v1: 1}}});
  });

  test('both', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    expect(docHandler1.doc).toEqual({
      tinybase: {t: {t1: {r1: {c1: 1}}}, v: {v1: 1}},
    });
  });
});
