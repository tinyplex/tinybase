import type {IdOrNull} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  Message,
  Receive,
  Send,
} from '../../@types/synchronizers/index.d.ts';
import type {createBroadcastChannelSynchronizer as createBroadcastChannelSynchronizerDecl} from '../../@types/synchronizers/synchronizer-broadcast-channel/index.d.ts';
import {getUniqueId} from '../../common/codec.ts';
import {ERROR_SYNC_MESSAGE, errorNew} from '../../common/error.ts';
import {isArray, isNull, isString, size} from '../../common/other.ts';
import {isProtocolMessageValid} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

export const createBroadcastChannelSynchronizer = ((
  store: MergeableStore,
  channelName: string,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
) => {
  const clientId = getUniqueId();
  const channel = new BroadcastChannel(channelName);

  const send = (
    toClientId: IdOrNull,
    requestId: IdOrNull,
    message: Message,
    body: any,
  ): void =>
    channel.postMessage([clientId, toClientId, requestId, message, body]);

  const registerReceive = (receive: Receive) => {
    channel.onmessage = ({data}) => {
      if (isArray(data) && size(data) == 5) {
        const [fromClientId, toClientId, requestId, message, body] = data;
        if (
          isString(fromClientId) &&
          (isNull(toClientId) || isString(toClientId)) &&
          isProtocolMessageValid(requestId, message, body)
        ) {
          if (isNull(toClientId) || toClientId == clientId) {
            receive(fromClientId, requestId, message, body);
          }
          return;
        }
      }
      onIgnoredError?.(errorNew(ERROR_SYNC_MESSAGE));
    };
  };

  const destroy = (): void => {
    channel.onmessage = null;
    channel.close();
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
    {getChannelName: () => channelName},
  );
}) as typeof createBroadcastChannelSynchronizerDecl;
