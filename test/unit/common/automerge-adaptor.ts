/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {Message, PeerId, PeerMetadata} from '@automerge/automerge-repo';
import {NetworkAdapter} from '@automerge/automerge-repo';

type ArriveMessage = {
  type: 'arrive';
  senderId: PeerId;
  peerMetadata: PeerMetadata;
  targetId: never;
};
type WelcomeMessage = {
  type: 'welcome';
  senderId: PeerId;
  peerMetadata: PeerMetadata;
  targetId: PeerId;
};
type BroadcastChannelMessage = ArriveMessage | WelcomeMessage | Message;

const adaptors: Set<AutomergeTestNetworkAdapter> = new Set();

const broadcast = (message: BroadcastChannelMessage): void =>
  adaptors.forEach((adaptor) => adaptor.receiveMessage(message));

export const resetNetwork = () => adaptors.clear();

export class AutomergeTestNetworkAdapter extends NetworkAdapter {
  connect(peerId: PeerId, peerMetadata?: PeerMetadata) {
    this.peerId = peerId;
    this.peerMetadata = peerMetadata;
    adaptors.add(this);
    broadcast({type: 'arrive', senderId: peerId} as ArriveMessage);
    this.emit('ready', {network: this});
  }

  receiveMessage(message: BroadcastChannelMessage) {
    const peerId: PeerId = this.peerId!;
    const {targetId, senderId, type, peerMetadata} = message as any;
    if (targetId && targetId !== peerId) {
      return;
    }
    switch (type) {
      case 'arrive':
        broadcast({
          senderId: this.peerId!,
          targetId: senderId,
          type: 'welcome',
        });
        this.emit('peer-candidate', {peerId: senderId, peerMetadata});
        break;
      case 'welcome':
        this.emit('peer-candidate', {peerId: senderId, peerMetadata});
        break;
      default:
        if (!('data' in message)) {
          this.emit('message', message);
        } else {
          this.emit('message', {
            ...message,
            data: new Uint8Array(message.data as ArrayBufferLike),
          });
        }
        break;
    }
  }

  send(message: Message) {
    if (message.data) {
      broadcast({
        ...message,
        data: message.data.buffer.slice(
          message.data.byteOffset,
          message.data.byteOffset + message.data.byteLength,
        ) as any,
      });
    } else {
      broadcast(message);
    }
  }

  disconnect() {
    adaptors.delete(this);
  }
}
