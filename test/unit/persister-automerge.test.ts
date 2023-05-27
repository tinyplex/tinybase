/**
 * @jest-environment node
 */

/* eslint-disable jest/no-conditional-expect */
import {DocHandle, Repo} from 'automerge-repo';
import {Persister, Store, createStore} from 'tinybase/debug';
import {createAutomergePersister} from 'tinybase/debug/persister-automerge';

let docHandler1: DocHandle<any>;
let store1: Store;
let _persister1: Persister;

const repo = new Repo({network: []});

beforeEach(() => {
  docHandler1 = repo.create();
  store1 = createStore();
  _persister1 = createAutomergePersister(store1, docHandler1);
});

test('custom name', async () => {
  const docHandler = repo.create();
  const persister = createAutomergePersister(store1, docHandler, 'test');
  await persister.save();
  expect(docHandler.doc).toEqual({});
});
