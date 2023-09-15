/// persister-partykit-server

import {Connection, Request, Server} from 'partykit/server';

export interface TinyBasePartyKitServer extends Server {
  onRequest(request: Request): Promise<Response>;
  onMessage(message: string, client: Connection): void;
}
