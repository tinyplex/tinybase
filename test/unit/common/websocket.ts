import {once} from 'node:events';
import type {AddressInfo} from 'node:net';
import {WebSocketServer} from 'ws';

export const createTestWebSocketServer = async (): Promise<
  readonly [WebSocketServer, number]
> => {
  const webSocketServer = new WebSocketServer({port: 0});
  await once(webSocketServer, 'listening');
  return [webSocketServer, (webSocketServer.address() as AddressInfo).port];
};

export const getTestWebSocketUrl = (port: number, path = ''): string =>
  `ws://127.0.0.1:${port}${path}`;
