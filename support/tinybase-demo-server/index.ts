import type {
  WsServer,
  WsServerStats,
} from 'tinybase/debug/synchronizers/synchronizer-ws-server';
import {WebSocketServer} from 'ws';
import {createServer} from 'http';
import {createWsServer} from 'tinybase/debug/synchronizers/synchronizer-ws-server';

const subDomains = ['todo.demo.tinybase.org'];

const wsServersBySubDomain = new Map<string, WsServer>(
  subDomains.map((subDomain) => {
    const wsServer = createWsServer(new WebSocketServer({noServer: true}));
    wsServer.addClientIdsListener(null, () => updatePeakStats(subDomain));
    return [subDomain, wsServer];
  }),
);

const httpServer = createServer();
httpServer.on('upgrade', (request, socket, head) => {
  const wsServer = wsServersBySubDomain.get(request.headers.host ?? '');
  if (wsServer) {
    const webSocketServer = wsServer.getWebSocketServer();
    webSocketServer.handleUpgrade(request, socket, head, (webSocket) =>
      webSocketServer.emit('connection', webSocket, request),
    );
  } else {
    socket.destroy();
  }
});
httpServer.listen(8043);

// --

createServer((request, response) => {
  if (request.url == '/metrics') {
    response.writeHead(200);
    response.write(`# HELP sub_domains The total number of sub-domains.\n`);
    response.write(`# TYPE sub_domains gauge\n`);
    response.write(`sub_domains ${subDomains.length}\n`);

    response.write(
      `# HELP peak_paths The highest number of paths recently managed.\n`,
    );
    response.write(`# TYPE peak_paths gauge\n`);
    statsBySubDomain.forEach((stats, subDomain) => {
      response.write(`peak_paths{sub_domain="${subDomain}"} ${stats.paths}\n`);
    });

    response.write(
      `# HELP peak_clients The highest number of clients recently managed.\n`,
    );
    response.write(`# TYPE peak_clients gauge\n`);
    statsBySubDomain.forEach((stats, subDomain) => {
      response.write(
        `peak_clients{sub_domain="${subDomain}"} ${stats.clients}\n`,
      );
    });

    subDomains.forEach((subDomain) => updatePeakStats(subDomain, 1));
  } else {
    response.writeHead(404);
  }
  response.end();
}).listen(8044);

const statsBySubDomain = new Map<string, WsServerStats>(
  subDomains.map((subDomain) => [subDomain, {paths: 0, clients: 0}]),
);

const updatePeakStats = (subDomain: string, reset = 0) => {
  const stats = statsBySubDomain.get(subDomain)!;
  if (reset) {
    stats.paths = 0;
    stats.clients = 0;
  }
  const newStats = wsServersBySubDomain.get(subDomain)!.getStats();
  stats.paths = Math.max(stats.paths!, newStats.paths!);
  stats.clients = Math.max(stats.clients!, newStats.clients!);
};
