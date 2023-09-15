/// persister-partykit-server

import {Connection, Request, Server} from 'partykit/server';

/// TinyBasePartyKitServer
export class TinyBasePartyKitServer implements Server {
  /// TinyBasePartyKitServer.onRequest
  onRequest(request: Request): Promise<Response>;
  /// TinyBasePartyKitServer.onMessage
  onMessage(message: string, client: Connection): void;
}
