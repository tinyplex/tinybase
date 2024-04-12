import {
  Client,
  ClientStats,
  MessageType,
  Receive,
  createLocalClient as createLocalClientDecl,
} from '../../types/persisters/persister-sync';
import {DEBUG, isUndefined} from '../../common/other';
import {Id, IdOrNull} from '../../types/common';
import {IdMap, mapGet, mapNew, mapSet} from '../../common/map';
import {IdObj, objNew} from '../../common/obj';
import {collDel, collForEach} from '../../common/coll';

const clients: IdMap<Receive> = mapNew();

const sends: IdObj<number> = objNew();
const receives: IdObj<number> = objNew();
const incrementSends = (fromClientId: Id) =>
  (sends[fromClientId] = (sends[fromClientId] ?? 0) + 1);
const incrementReceives = (toClientId: Id) =>
  (receives[toClientId] = (receives[toClientId] ?? 0) + 1);

export const createLocalClient = (() => {
  const clientId: Id = '' + Math.random();

  const onReceive = (receive: Receive): void => {
    mapSet(
      clients,
      clientId,
      DEBUG
        ? (...args) => {
            incrementReceives(clientId);
            receive(...args);
          }
        : receive,
    );
  };

  const send = (
    requestId: IdOrNull,
    toClientId: IdOrNull,
    messageType: MessageType,
    messageBody: any,
  ): void => {
    if (DEBUG) {
      incrementSends(clientId);
    }
    isUndefined(toClientId)
      ? collForEach(clients, (receive, toClientId) =>
          toClientId != clientId
            ? receive(requestId, clientId, messageType, messageBody)
            : 0,
        )
      : mapGet(clients, toClientId)?.(
          requestId,
          clientId,
          messageType,
          messageBody,
        );
  };

  const destroy = (): void => {
    collDel(clients, clientId);
  };

  const getStats = (): ClientStats =>
    DEBUG
      ? {sends: sends[clientId] ?? 0, receives: receives[clientId] ?? 0}
      : {};

  return {send, onReceive, destroy, getStats} as Client;
}) as typeof createLocalClientDecl;
