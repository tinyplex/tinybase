import type {IdOrNull} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeables/mergeable-store/index.d.ts';
import type {
  Message,
  Receive,
  Send,
} from '../../@types/synchronizers/index.d.ts';
import type {createLocalSynchronizer as createLocalSynchronizerDecl} from '../../@types/synchronizers/synchronizer-local/index.d.ts';
import {collDel, collForEach} from '../../common/coll.ts';
import {getUniqueId} from '../../common/index.ts';
import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../../common/map.ts';
import {isUndefined, startTimeout, stopTimeout} from '../../common/other.ts';
import {setAdd, setNew} from '../../common/set.ts';
import {createCustomSynchronizer} from '../index.ts';

const clients: IdMap<Receive> = mapNew();

export const createLocalSynchronizer = ((
  store: MergeableStore,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
) => {
  const sendHandles: Set<number> = setNew();

  const clientId = getUniqueId();

  const send = (
    toClientId: IdOrNull,
    requestId: IdOrNull,
    message: Message,
    body: any,
  ): any => {
    const sendHandle = startTimeout(() => {
      collDel(sendHandles, sendHandle);
      if (isUndefined(toClientId)) {
        mapForEach(clients, (otherClientId, receive) =>
          otherClientId != clientId
            ? receive(clientId, requestId, message, body)
            : 0,
        );
      } else {
        mapGet(clients, toClientId)?.(clientId, requestId, message, body);
      }
    });
    setAdd(sendHandles, sendHandle);
  };

  const registerReceive = (receive: Receive): void => {
    mapSet(clients, clientId, receive);
  };

  const destroy = (): void => {
    collForEach(sendHandles, stopTimeout);
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
