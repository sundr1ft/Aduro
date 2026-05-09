import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';
import { build } from './build';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const RELOAD_SCRIPT = `<script>
(function(){const ws=new WebSocket('ws://'+location.host+'/__lr');ws.onmessage=()=>location.reload();ws.onclose=()=>setTimeout(()=>location.reload(),500);})();
</script>`;

export function serve(siteDir: string, outDir: string, port = 3000): void {
  build(siteDir, outDir);

  const wss = new WebSocketServer({ noServer: true });

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    let urlPath = req.url?.split('?')[0] ?? '/';
    if (urlPath.endsWith('/')) urlPath += 'index.html';

    const filePath = join(outDir, urlPath);

    if (existsSync(filePath)) {
      const ext = extname(filePath).toLowerCase();
      let body: Buffer | string = readFileSync(filePath);
      if (ext === '.html') {
        body = body.toString('utf-8').replace('</body>', `${RELOAD_SCRIPT}</body>`);
      }
      res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
      res.end(body);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/__lr') {
      wss.handleUpgrade(req, socket as import('net').Socket, head, (ws) =>
        wss.emit('connection', ws, req)
      );
    } else {
      socket.destroy();
    }
  });

  const watchPaths = [
    join(siteDir, 'content'),
    join(siteDir, 'layouts'),
    join(siteDir, 'static'),
    join(siteDir, 'config.yaml'),
  ].filter(existsSync);

  chokidar.watch(watchPaths, { ignoreInitial: true }).on('all', (event, file) => {
    console.log(`  ${event}: ${file}`);
    try {
      build(siteDir, outDir);
      wss.clients.forEach((client) => client.send('reload'));
    } catch (err) {
      console.error('build error:', err);
    }
  });

  server.listen(port, () => {
    console.log(`serving http://localhost:${port}  (watching ${siteDir})`);
  });
}
