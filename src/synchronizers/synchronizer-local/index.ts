import type {IdOrNull} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  Message,
  Receive,
  Send,
} from '../../@types/synchronizers/index.d.ts';
import type {createLocalSynchronizer as createLocalSynchronizerDecl} from '../../@types/synchronizers/synchronizer-local/index.d.ts';
import {getUniqueId} from '../../common/codec.ts';
import {collDel} from '../../common/coll.ts';
import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../../common/map.ts';
import {isNull, startTimeout} from '../../common/other.ts';
import {createCustomSynchronizer} from '../index.ts';

const clients: IdMap<Receive> = mapNew();

export const createLocalSynchronizer = ((
  store: MergeableStore,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
) => {
  const clientId = getUniqueId();

  const send = (
    toClientId: IdOrNull,
    requestId: IdOrNull,
    message: Message,
    body: any,
  ): number | NodeJS.Timeout =>
    startTimeout(() =>
      isNull(toClientId)
        ? mapForEach(clients, (otherClientId, receive) =>
            otherClientId != clientId
              ? receive(clientId, requestId, message, body)
              : 0,
          )
        : mapGet(clients, toClientId)?.(clientId, requestId, message, body),
    );

  const registerReceive = (receive: Receive): void => {
    mapSet(clients, clientId, receive);
  };

  const destroy = (): void => {
    collDel(clients, clientId);
  };

  return createCustomSynchronizer(
    store,
    send,
    registerReceive,
    destroy,
    0.01,
    onSend,
    onReceive,
    onIgnoredError,
  );
}) as typeof createLocalSynchronizerDecl;
