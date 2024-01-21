/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Message, NetworkAdapter, PeerId} from '@automerge/automerge-repo';

type ArriveMessage = {type: 'arrive'; senderId: PeerId; targetId: never};
type WelcomeMessage = {type: 'welcome'; senderId: PeerId; targetId: PeerId};
type BroadcastChannelMessage = ArriveMessage | WelcomeMessage | Message;

const adaptors: Set<AutomergeTestNetworkAdapter> = new Set();

const broadcast = (message: BroadcastChannelMessage): void =>
  adaptors.forEach((adaptor) => adaptor.receiveMessage(message));

export const resetNetwork = () => adaptors.clear();

export class AutomergeTestNetworkAdapter extends NetworkAdapter {
  connect(peerId: PeerId) {
    this.peerId = peerId;
    adaptors.add(this);
    broadcast({type: 'arrive', senderId: peerId} as ArriveMessage);
    this.emit('ready', {network: this});
  }

  receiveMessage(message: BroadcastChannelMessage) {
    const peerId: PeerId = this.peerId!;
    const {targetId, senderId, type} = message;
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
        this.emit('peer-candidate', {peerId: senderId});
        break;
      case 'welcome':
        this.emit('peer-candidate', {peerId: senderId});
        break;
      default:
        if (!('data' in message)) {
          this.emit('message', message);
        } else {
          this.emit('message', {
            ...message,
            data: new Uint8Array(message.data),
          });
        }
        break;
    }
  }

  send(message: BroadcastChannelMessage) {
    if ('data' in message) {
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
