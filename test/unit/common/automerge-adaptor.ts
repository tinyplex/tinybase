/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {ChannelId, NetworkAdapter, PeerId} from 'automerge-repo';

type NetworkEvent = {
  senderId: PeerId;
  targetId?: PeerId;
  type: string;
  channelId?: ChannelId;
  message?: any;
  broadcast?: boolean;
};

const adaptors: Set<AutomergeTestNetworkAdapter> = new Set();

const sendEvent = (event: NetworkEvent) =>
  adaptors.forEach((adaptor) => adaptor.receiveEvent(event));

export const resetNetwork = () => adaptors.clear();

export class AutomergeTestNetworkAdapter extends NetworkAdapter {
  connect(peerId: PeerId) {
    this.peerId = peerId;
    adaptors.add(this);
  }

  receiveEvent({
    senderId,
    targetId,
    type,
    channelId,
    message,
    broadcast,
  }: NetworkEvent) {
    if (targetId && targetId !== this.peerId && !broadcast) {
      return;
    }
    switch (type) {
      case 'arrive':
        sendEvent({
          senderId: this.peerId!,
          targetId: senderId,
          type: 'welcome',
        });
        this.announceConnection(channelId!, senderId);
        break;
      case 'welcome':
        this.announceConnection(channelId!, senderId);
        break;
      case 'message':
        this.emit('message', {
          senderId,
          targetId: targetId!,
          channelId: channelId!,
          message: new Uint8Array(message),
          broadcast: broadcast!,
        });
        break;
      default:
        throw new Error('unhandled message from network');
    }
  }

  announceConnection(channelId: ChannelId, peerId: PeerId) {
    this.emit('peer-candidate', {peerId, channelId});
  }

  sendMessage(
    peerId: PeerId,
    channelId: ChannelId,
    uint8message: Uint8Array,
    broadcast: boolean,
  ) {
    const message = uint8message.buffer.slice(
      uint8message.byteOffset,
      uint8message.byteOffset + uint8message.byteLength,
    );
    sendEvent({
      senderId: this.peerId!,
      targetId: peerId,
      type: 'message',
      channelId,
      message,
      broadcast,
    });
  }

  join(joinChannelId: ChannelId) {
    sendEvent({
      senderId: this.peerId!,
      channelId: joinChannelId,
      type: 'arrive',
      broadcast: true,
    });
  }

  leave() {
    adaptors.delete(this);
  }
}
