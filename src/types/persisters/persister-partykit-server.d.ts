/// persister-partykit-server

import {Connection, Party, Request, Server} from 'partykit/server';
import {TransactionChanges} from '../store';

/// TinyBasePartyKitServerConfig
export type TinyBasePartyKitServerConfig = {
  /// TinyBasePartyKitServerConfig.storePath
  storePath?: string;
  /// TinyBasePartyKitServerConfig.storagePrefix
  storagePrefix?: string;
  /// TinyBasePartyKitServerConfig.responseHeaders
  responseHeaders?: HeadersInit;
};

/// TinyBasePartyKitServer
export class TinyBasePartyKitServer implements Server {
  constructor(party: Party);
  /// TinyBasePartyKitServer.config
  readonly config: TinyBasePartyKitServerConfig;
  /// TinyBasePartyKitServer.onRequest
  onRequest(request: Request): Promise<Response>;
  /// TinyBasePartyKitServer.onMessage
  onMessage(message: string, client: Connection): Promise<void>;
  /// TinyBasePartyKitServer.onWillSaveTransactionChanges
  onWillSaveTransactionChanges(
    transactionChanges: TransactionChanges,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
  ): Promise<void>;
}
