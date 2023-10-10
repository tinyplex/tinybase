/// persister-partykit-server

import {
  Cell,
  CellOrUndefined,
  NoTablesSchema,
  NoValuesSchema,
  Value,
  ValueOrUndefined,
} from '../store';
import {Connection, Party, Request, Server} from 'partykit/server';
import {Id} from '../common';

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
  ): boolean;
  /// TinyBasePartyKitServer.canDelTable
  canDelTable(tableId: Id, connection: Connection): boolean;
  /// TinyBasePartyKitServer.canSetRow
  canSetRow(
    tableId: Id,
    rowId: Id,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
  ): boolean;
  /// TinyBasePartyKitServer.canDelRow
  canDelRow(tableId: Id, rowId: Id, connection: Connection): boolean;
  /// TinyBasePartyKitServer.canSetCell
  canSetCell(
    tableId: Id,
    rowId: Id,
    cellId: Id,
    cell: Cell<NoTablesSchema, Id, Id>,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
    oldCell: CellOrUndefined<NoTablesSchema, Id, Id>,
  ): boolean;
  /// TinyBasePartyKitServer.canDelCell
  canDelCell(
    tableId: Id,
    rowId: Id,
    cellId: Id,
    connection: Connection,
  ): boolean;
  /// TinyBasePartyKitServer.canSetValue
  canSetValue(
    valueId: Id,
    value: Value<NoValuesSchema, Id>,
    initialSave: boolean,
    requestOrConnection: Request | Connection,
    oldValue: ValueOrUndefined<NoValuesSchema, Id>,
  ): boolean;
  /// TinyBasePartyKitServer.canDelValue
  canDelValue(valueId: Id, connection: Connection): boolean;
}
