import { createReadStream, existsSync } from 'node:fs';
import type { IncomingMessage, RequestListener, ServerResponse } from 'node:http';
import { stat } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { matchRoute } from './routes.js';
import type { OrbitAppOptions, OrbitRequest, RouteResponse } from './types.js';

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function isInsideDirectory(directory: string, targetPath: string): boolean {
  const pathFromDirectory = relative(directory, targetPath);

  return pathFromDirectory === '' || (!pathFromDirectory.startsWith('..') && !isAbsolute(pathFromDirectory));
}

function resolvePath(publicDir: string, urlPath: string): string | null {
  let pathname: string;

  try {
    pathname = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  } catch {
    return null;
  }

  const safePath = resolve(join(publicDir, `.${pathname}`));

  if (!isInsideDirectory(publicDir, safePath)) {
    return null;
  }

  return safePath;
}

function send(response: ServerResponse, route: RouteResponse, includeBody = true): void {
  response.writeHead(route.status, route.headers);
  response.end(includeBody ? route.body : undefined);
}

async function sendStaticAsset(
  publicDir: string,
  pathname: string,
  response: ServerResponse,
  includeBody = true
): Promise<boolean> {
  const filePath = resolvePath(publicDir, pathname);

  if (!filePath || !existsSync(filePath)) {
    return false;
  }

  const fileStats = await stat(filePath).catch(() => null);

  if (!fileStats?.isFile()) {
    return false;
  }

  const extension = extname(filePath);
  const contentType = contentTypes[extension] || 'application/octet-stream';
  response.writeHead(200, { 'content-type': contentType });

  if (!includeBody) {
    response.end();
    return true;
  }

  createReadStream(filePath).pipe(response);
  return true;
}

function defaultNotFoundResponse(): RouteResponse {
  return {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: 'Orbit could not find that page.'
  };
}

async function resolveNotFound(
  notFound: OrbitAppOptions['notFound'],
  context: OrbitRequest
): Promise<RouteResponse> {
  if (typeof notFound === 'function') {
    return notFound(context);
  }

  return notFound ?? defaultNotFoundResponse();
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: OrbitAppOptions,
  publicDir: string | null
): Promise<void> {
  const method = request.method || 'GET';
  const url = new URL(request.url || '/', 'http://localhost');
  const context = { method, request, url };
  const route = options.route
    ? await options.route(context)
    : matchRoute(method, url.pathname);
  const includeBody = method !== 'HEAD';

  if (route) {
    send(response, route, includeBody);
    return;
  }

  const servedStaticAsset = publicDir
    ? await sendStaticAsset(publicDir, url.pathname, response, includeBody)
    : false;

  if (servedStaticAsset) {
    return;
  }

  send(response, await resolveNotFound(options.notFound, context), includeBody);
}

export function createApp(options: OrbitAppOptions = {}): RequestListener {
  const publicDir =
    options.publicDir === false
      ? null
      : resolve(process.cwd(), options.publicDir ?? 'public');

  return (request, response) => {
    void handleRequest(request, response, options, publicDir).catch((error: unknown) => {
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
