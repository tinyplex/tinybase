import {WebSocketServer} from 'ws';
import {createWsServer} from 'tinybase/debug/synchronizers/synchronizer-ws-server';

const webSocketServer = new WebSocketServer({port: 8043});
createWsServer(webSocketServer);
