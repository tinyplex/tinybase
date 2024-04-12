import {
  Client,
  ClientStats,
  MessageType,
  Receive,
  Send,
  createLocalClient as createLocalClientDecl,
} from '../../types/persisters/persister-sync';
import {DEBUG, isUndefined} from '../../common/other';
import {Id, IdOrNull} from '../../types/common';
import {IdMap, mapGet, mapNew, mapSet} from '../../common/map';
import {collDel, collForEach, collSize} from '../../common/coll';

export const createLocalClient = (() => {
  let sends = 0;
  let receives = 0;
  const stores: IdMap<Receive> = mapNew();

  const connect = (storeId: Id, receive: Receive): [Send, () => void] => {
    mapSet(stores, storeId, receive);
    const send = (
      requestId: IdOrNull,
      toStoreId: IdOrNull,
      messageType: MessageType,
      messageBody: any,
    ): void => {
      if (DEBUG) {
        sends++;
        receives += isUndefined(toStoreId) ? collSize(stores) - 1 : 1;
      }
      isUndefined(toStoreId)
        ? collForEach(stores, (receive, otherStoreId) =>
            otherStoreId != storeId
              ? receive(requestId, storeId, messageType, messageBody)
              : 0,
          )
        : mapGet(stores, toStoreId)?.(
            requestId,
            storeId,
            messageType,
            messageBody,
          );
    };
    const disconnect = (): void => {
      collDel(stores, storeId);
    };
    return [send, disconnect];
  };

  const getStats = (): ClientStats => (DEBUG ? {sends, receives} : {});

  return {connect, getStats} as Client;
}) as typeof createLocalClientDecl;
