/// persister-partykit-server

import {
  Cell,
  CellOrUndefined,
  Tables,
  TransactionChanges,
  Value,
  ValueOrUndefined,
  Values,
} from '../store.d';
import {Connection, Party, Request, Server, Storage} from 'partykit/server';
import {Id} from '../common.d';

/// TinyBasePartyKitServerConfig
export type TinyBasePartyKitServerConfig = {
  /// TinyBasePartyKitServerConfig.storePath
  storePath?: string;
  /// TinyBasePartyKitServerConfig.messagePrefix
  messagePrefix?: string;
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
  onMessage(message: string, connection: Connection): Promise<void>;
  /// TinyBasePartyKitServer.canSetTable
  canSetTable(
    tableId: Id,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
  ): Promise<boolean>;
  /// TinyBasePartyKitServer.canDelTable
  canDelTable(tableId: Id, connection: Connection): Promise<boolean>;
  /// TinyBasePartyKitServer.canSetRow
  canSetRow(
    tableId: Id,
    rowId: Id,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
  ): Promise<boolean>;
  /// TinyBasePartyKitServer.canDelRow
  canDelRow(tableId: Id, rowId: Id, connection: Connection): Promise<boolean>;
  /// TinyBasePartyKitServer.canSetCell
  canSetCell(
    tableId: Id,
    rowId: Id,
    cellId: Id,
    cell: Cell,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
    oldCell: CellOrUndefined,
  ): Promise<boolean>;
  /// TinyBasePartyKitServer.canDelCell
  canDelCell(
    tableId: Id,
    rowId: Id,
    cellId: Id,
    connection: Connection,
  ): Promise<boolean>;
  /// TinyBasePartyKitServer.canSetValue
  canSetValue(
    valueId: Id,
    value: Value,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
    oldValue: ValueOrUndefined,
  ): Promise<boolean>;
  /// TinyBasePartyKitServer.canDelValue
  canDelValue(valueId: Id, connection: Connection): Promise<boolean>;
}

/// hasStoreInStorage
export function hasStoreInStorage(
  storage: Storage,
  storagePrefix?: string,
): Promise<boolean>;

/// loadStoreFromStorage
export function loadStoreFromStorage(
  storage: Storage,
  storagePrefix?: string,
): Promise<[Tables, Values]>;

/// broadcastTransactionChanges
export function broadcastTransactionChanges(
  server: TinyBasePartyKitServer,
  transactionChanges: TransactionChanges,
  without?: string[],
): Promise<void>;
