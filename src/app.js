import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchRoute } from './routes.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = normalize(join(__dirname, '..', 'public'));

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function resolvePath(urlPath) {
  const pathname = urlPath === '/' ? '/index.html' : urlPath;
  const safePath = normalize(join(publicDir, pathname));

  if (!safePath.startsWith(publicDir)) {
    return null;
  }

  return safePath;
}

function send(response, route) {
  response.writeHead(route.status, route.headers);
  response.end(route.body);
}

async function sendStaticAsset(pathname, response) {
  const filePath = resolvePath(pathname);

  if (!filePath || !existsSync(filePath)) {
    return false;
  }

  const fileStats = await stat(filePath);

  if (!fileStats.isFile()) {
    return false;
  }

  const extension = extname(filePath);
  const contentType = contentTypes[extension] || 'application/octet-stream';
  response.writeHead(200, { 'content-type': contentType });
  createReadStream(filePath).pipe(response);
  return true;
}

export function createApp() {
  return async (request, response) => {
    const url = new URL(request.url || '/', 'http://localhost');
    const route = matchRoute(request.method || 'GET', url.pathname);

    if (route) {
      send(response, route);
      return;
    }

    const servedStaticAsset = await sendStaticAsset(url.pathname, response);

    if (servedStaticAsset) {
      return;
    }

    send(response, {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      body: 'Orbit could not find that page.'
    });
  };
}
