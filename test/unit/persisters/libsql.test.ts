import type {Client} from '@libsql/client';
import {createStore} from 'tinybase';
import {createLibSqlPersister} from 'tinybase/persisters/persister-libsql';
import {expect, test, vi} from 'vitest';

const createClient = (fail = false) => {
  const execute = vi.fn(async ({sql}: {sql: string}) => {
    if (fail && sql.startsWith('INSERT')) {
      throw new Error('insert failed');
    }
    return {rows: []};
  });
  const transaction = {
    close: vi.fn(),
    commit: vi.fn(),
    execute,
    rollback: vi.fn(),
  };
  const client = {
    execute: vi.fn(),
    transaction: vi.fn(async () => transaction),
  } as any as Client;
  return {client, execute, transaction};
};

test('uses one libSQL transaction session', async () => {
  const {client, execute, transaction} = createClient();
  const persister = createLibSqlPersister(
    createStore().setValue('species', 'dog'),
    client,
  );
  await persister.save();

  expect(client.transaction).toHaveBeenCalledWith('write');
  expect(client.execute).not.toHaveBeenCalled();
  expect(execute).toHaveBeenCalled();
  expect(transaction.commit).toHaveBeenCalledOnce();
  expect(transaction.rollback).not.toHaveBeenCalled();
  expect(transaction.close).toHaveBeenCalledOnce();
});

test('rolls back failed libSQL transaction sessions', async () => {
  const {client, transaction} = createClient(true);
  const ignoredError = vi.fn();
  const persister = createLibSqlPersister(
    createStore().setValue('species', 'dog'),
    client,
    undefined,
    undefined,
    ignoredError,
  );
  await persister.save();

  expect(transaction.commit).not.toHaveBeenCalled();
  expect(transaction.rollback).toHaveBeenCalledOnce();
  expect(transaction.close).toHaveBeenCalledOnce();
  expect(ignoredError).toHaveBeenCalledOnce();
  expect(ignoredError.mock.calls[0][0].message).toBe('insert failed');
});
