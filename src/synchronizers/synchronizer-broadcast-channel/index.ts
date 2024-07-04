import type {Message, Receive} from '../../@types/synchronizers/index.d.ts';
import type {IdOrNull} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {createBroadcastChannelSynchronizer as createBroadcastChannelSynchronizerDecl} from '../../@types/synchronizers/synchronizer-broadcast-channel/index.d.ts';
import {createCustomSynchronizer} from '../index.ts';
import {getUniqueId} from '../../common/index.ts';
import {isUndefined} from '../../common/other.ts';

export const createBroadcastChannelSynchronizer = ((
  store: MergeableStore,
  channelName: string,
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

  const onReceive = (receive: Receive): void => {
    channel.onmessage = ({
      data: [fromClientId, toClientId, requestId, message, body],
    }) =>
      isUndefined(toClientId) || toClientId == clientId
        ? receive(fromClientId, requestId, message, body)
        : 0;
  };

  const destroy = (): void => {
    channel.close();
  };

  return createCustomSynchronizer(
    store,
    send,
    onReceive,
    destroy,
    0.01,
    onIgnoredError,
    {getChannelName: () => channelName},
  );
}) as typeof createBroadcastChannelSynchronizerDecl;
