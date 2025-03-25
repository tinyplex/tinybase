import replace from 'buffer-replace';
import {readFileSync} from 'fs';
import {createServer} from 'http-server';

export const createTestServer = (dir, port, log = false) => {
  const server = createServer({
    root: dir,
    cache: -1,
    gzip: true,
    // eslint-disable-next-line no-console
    logFn: (req) => log && console.log(req.url),
    before: [
      (req, res) => {
        if (req.url.startsWith('/pseudo.esm.sh/')) {
          res.setHeader('Content-Type', 'application/javascript');
          res.write(readFileSync(dir + req.url + '/index.js', 'utf8'));
          return res.end();
        }
        res._write = res.write;
        res.write = (buffer) => {
          res._write(
            replace(
              replace(buffer, 'https://tinybase.org/', '                    /'),
              'https://esm.sh/tinybase',
              '/pseudo.esm.sh/tinybase',
            ),
          );
        };
        res.emit('next');
      },
    ],
  });
  server.listen(port, '0.0.0.0');
  return server;
};
