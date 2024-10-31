/// synchronizer-ws-server-durable-object

import type {Id, IdAddedOrRemoved, Ids} from '../../index.d.ts';
import {DurableObject} from 'cloudflare:workers';

/// WsServerDurableObject
export class WsServerDurableObject<Env = unknown> extends DurableObject<Env> {
  /// WsServerDurableObject.getClientIds
  getClientIds(pathId: Id): Ids;

  /// WsServerDurableObject.onPathId
  onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved): void;

  /// WsServerDurableObject.onClientId
  onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved): void;
}

/// getWsServerDurableObjectFetch
export function getWsServerDurableObjectFetch<Namespace extends string>(
  namespace: Namespace,
): (
  request: Request,
  env: {
    [namespace in Namespace]: DurableObjectNamespace<WsServerDurableObject>;
  },
) => Response;
