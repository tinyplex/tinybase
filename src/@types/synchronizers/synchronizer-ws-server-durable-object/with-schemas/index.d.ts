/// synchronizer-ws-server-durable-object

import {Server} from 'partyserver';

/// WsServerDurableObject
export class WsServerDurableObject extends Server {}

/// getWsServerDurableObjectFetch
export function getWsServerDurableObjectFetch<Namespace extends string>(
  namespace: Namespace,
): (
  request: Request,
  env: {
    [namespace in Namespace]: DurableObjectNamespace<WsServerDurableObject>;
  },
) => Promise<Response>;
