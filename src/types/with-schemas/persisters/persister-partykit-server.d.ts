/// persister-partykit-server

import {
  Cell,
  CellOrUndefined,
  Changes,
  Content,
  NoTablesSchema,
  NoValuesSchema,
  OptionalSchemas,
  Value,
  ValueOrUndefined,
} from '../store.d';
import {Connection, Party, Request, Server} from 'partykit/server';
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
  /// TinyBasePartyKitServer.constructor
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
    cell: Cell<NoTablesSchema, Id, Id>,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
    oldCell: CellOrUndefined<NoTablesSchema, Id, Id>,
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
    value: Value<NoValuesSchema, Id>,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
    oldValue: ValueOrUndefined<NoValuesSchema, Id>,
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
export function loadStoreFromStorage<Schemas extends OptionalSchemas>(
  storage: Storage,
  storagePrefix?: string,
): Promise<Content<Schemas>>;

/// broadcastChanges
export function broadcastChanges<Schemas extends OptionalSchemas>(
  server: TinyBasePartyKitServer,
  changes: Changes<Schemas>,
  without?: string[],
): Promise<void>;
