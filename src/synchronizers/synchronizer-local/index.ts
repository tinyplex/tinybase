import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../../common/map';
import type {MessageType, Receive} from '../../@types/synchronizers';
import type {IdOrNull} from '../../@types/common';
import type {MergeableStore} from '../../@types/mergeable-store';
import {collDel} from '../../common/coll';
import {createCustomSynchronizer} from '../';
import type {createLocalSynchronizer as createLocalSynchronizerDecl} from '../../@types/synchronizers/synchronizer-local';
import {getUniqueId} from '../../common';
import {isUndefined} from '../../common/other';

const clients: IdMap<Receive> = mapNew();

export const createLocalSynchronizer = ((
  store: MergeableStore,
  onIgnoredError?: (error: any) => void,
) => {
  const clientId = getUniqueId();

  const send = (
    toClientId: IdOrNull,
    requestId: IdOrNull,
    messageType: MessageType,
    messageBody: any,
  ): void => {
    setTimeout(
      () =>
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
            ),
      0,
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
    0.01,
    onIgnoredError,
  );
}) as typeof createLocalSynchronizerDecl;