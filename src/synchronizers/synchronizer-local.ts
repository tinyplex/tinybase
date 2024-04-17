import {Id, IdOrNull} from '../types/common';
import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../common/map';
import {MessageType, Receive} from '../types/synchronizers';
import {MergeableStore} from '../types/mergeable-store';
import {collDel} from '../common/coll';
import {createCustomSynchronizer} from '../synchronizers';
import {createLocalSynchronizer as createLocalSynchronizerDecl} from '../types/synchronizers/synchronizer-local';
import {isUndefined} from '../common/other';

const clients: IdMap<Receive> = mapNew();

export const createLocalSynchronizer = ((
  store: MergeableStore,
  onIgnoredError?: (error: any) => void,
) => {
  const clientId: Id = '' + Math.random();

  const send = (
    toClientId: IdOrNull,
    requestId: IdOrNull,
    messageType: MessageType,
    messageBody: any,
  ): void => {
    isUndefined(toClientId)
      ? mapForEach(clients, (otherClientId, receive) =>
          otherClientId != clientId
            ? receive(clientId, requestId, messageType, messageBody)
            : 0,
        )
      : mapGet(clients, toClientId)?.(
          clientId,
          requestId,
          messageType,
          messageBody,
        );
  };

  const onReceive = (receive: Receive): void => {
    mapSet(clients, clientId, receive);
  };

  const destroy = (): void => {
    collDel(clients, clientId);
  };

  return createCustomSynchronizer(
    store,
    send,
    onReceive,
    destroy,
    0.001,
    onIgnoredError,
  );
}) as typeof createLocalSynchronizerDecl;
