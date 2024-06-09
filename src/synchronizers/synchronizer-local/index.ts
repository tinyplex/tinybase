import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../../common/map.ts';
import type {MessageType, Receive} from '../../@types/synchronizers/index.d.ts';
import type {IdOrNull} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import {collDel} from '../../common/coll.ts';
import {createCustomSynchronizer} from '../index.ts';
import type {createLocalSynchronizer as createLocalSynchronizerDecl} from '../../@types/synchronizers/synchronizer-local/index.d.ts';
import {getUniqueId} from '../../common/index.ts';
import {isUndefined} from '../../common/other.ts';

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
