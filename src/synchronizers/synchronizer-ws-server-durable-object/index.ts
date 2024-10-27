import type {Connection, WSMessage} from 'partyserver';
import {createRawPayload, ifPayloadValid} from '../common.ts';
import {EMPTY_STRING} from '../../common/strings.ts';
import {Server} from 'partyserver';

export class WsServerDurableObject extends Server {
  onMessage(connection: Connection, message: WSMessage) {
    const payload = message.toString();
    ifPayloadValid(payload, (toClientId, remainder) => {
      const forwardedPayload = createRawPayload(connection.id, remainder);
      if (toClientId === EMPTY_STRING) {
        this.broadcast(forwardedPayload, [connection.id]);
      } else {
        this.getConnection(toClientId)?.send(forwardedPayload);
      }
    });
  }
}
