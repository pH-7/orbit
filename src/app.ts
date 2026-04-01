import { createReadStream, existsSync } from 'node:fs';
import type { IncomingMessage, RequestListener, ServerResponse } from 'node:http';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { matchRoute } from './routes.js';
import type { RouteResponse } from './types.js';

const publicDir = normalize(join(process.cwd(), 'public'));

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function resolvePath(urlPath: string): string | null {
  const pathname = urlPath === '/' ? '/index.html' : urlPath;
  const safePath = normalize(join(publicDir, pathname));

  if (!safePath.startsWith(publicDir)) {
    return null;
  }

  return safePath;
}

function send(response: ServerResponse, route: RouteResponse): void {
  response.writeHead(route.status, route.headers);
  response.end(route.body);
}

async function sendStaticAsset(pathname: string, response: ServerResponse): Promise<boolean> {
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

async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
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
}

export function createApp(): RequestListener {
  return (request, response) => {
    void handleRequest(request, response).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unexpected server error';
      response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      response.end(
        JSON.stringify(
          {
            status: 'error',
            message
          },
          null,
          2
        )
      );
    });
  };
}
