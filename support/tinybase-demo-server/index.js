import {WebSocketServer} from 'ws';
import {createServer} from 'http';
import {createWsServer} from 'tinybase/debug/synchronizers/synchronizer-ws-server';

const hosts = ['vite.demo.tinybase.org', 'todo.demo.tinybase.org'];

const tinybaseServers = new Map(
  hosts.map((host) => {
    const wsServer = createWsServer(new WebSocketServer({noServer: true}));
    return [host, wsServer];
  }),
);

const server = createServer();
server.on('upgrade', (request, socket, head) => {
  const tinybaseServer = tinybaseServers.get(request.headers.host);
  if (tinybaseServer) {
    const webSocketServer = tinybaseServer.getWebSocketServer();
    webSocketServer.handleUpgrade(request, socket, head, (webSocket) =>
      webSocketServer.emit('connection', webSocket, request),
    );
  } else {
    socket.destroy();
  }
});
server.listen(8043);

createServer((request, response) => {
  if (request.url == '/metrics') {
    response.writeHead(200);
    response.write(`# HELP hosts The total number of hosts.\n`);
    response.write(`# TYPE hosts gauge\n`);
    response.write(`hosts ${hosts.length}\n`);
  } else {
    response.writeHead(404);
  }
  response.end();
}).listen(8044);
