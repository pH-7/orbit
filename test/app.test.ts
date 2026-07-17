import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createServer, request as httpRequest, type Server } from 'node:http';
import { createApp } from '../src/app.js';
import type { OrbitAppOptions } from '../src/types.js';

function request(
  url: string,
  method = 'GET'
): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        const headers: Record<string, string> = {};
        for (const [key, val] of Object.entries(res.headers)) {
          if (typeof val === 'string') headers[key] = val;
        }
        resolve({ status: res.statusCode ?? 0, headers, body: data });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

async function withApp(
  options: OrbitAppOptions,
  run: (baseUrl: string) => Promise<void>
): Promise<void> {
  const appServer = createServer(createApp(options));

  await new Promise<void>((resolve) => appServer.listen(0, '127.0.0.1', resolve));
  const address = appServer.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve) => appServer.close(() => resolve()));
  }
}

describe('HTTP integration tests', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    server = createServer(createApp());
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        const port = typeof addr === 'object' && addr ? addr.port : 0;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test('GET / returns 200 with HTML content', async () => {
    const res = await request(`${baseUrl}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] ?? '', /text\/html/);
    assert.match(res.body, /<!doctype html>/i);
  });

  test('HEAD / returns headers without a response body', async () => {
    const res = await request(`${baseUrl}/`, 'HEAD');
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] ?? '', /text\/html/);
    assert.equal(res.body, '');
  });

  test('GET /features returns 200', async () => {
    const res = await request(`${baseUrl}/features`);
    assert.equal(res.status, 200);
    assert.match(res.body, /Capabilities/);
  });

  test('GET /docs returns 200', async () => {
    const res = await request(`${baseUrl}/docs`);
    assert.equal(res.status, 200);
    assert.match(res.body, /Documentation/);
  });

  test('GET /api/status returns JSON with correct structure', async () => {
    const res = await request(`${baseUrl}/api/status`);
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] ?? '', /application\/json/);
    assert.equal(res.headers['access-control-allow-origin'], '*');

    const payload = JSON.parse(res.body) as Record<string, unknown>;
    assert.equal(payload.status, 'ok');
    assert.equal(payload.name, 'Orbit');
    assert.equal(typeof payload.version, 'string');
    assert.equal(payload.publicAccess, true);
  });

  test('OPTIONS /api/status returns CORS preflight headers', async () => {
    const res = await request(`${baseUrl}/api/status`, 'OPTIONS');
    assert.equal(res.status, 204);
    assert.equal(res.headers['access-control-allow-origin'], '*');
    assert.equal(res.headers['access-control-allow-methods'], 'GET, HEAD, OPTIONS');
  });

  test('GET /styles.css serves the static stylesheet', async () => {
    const res = await request(`${baseUrl}/styles.css`);
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] ?? '', /text\/css/);
    assert.match(res.body, /:root/);
  });

  test('HEAD /styles.css returns static headers without a body', async () => {
    const res = await request(`${baseUrl}/styles.css`, 'HEAD');
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] ?? '', /text\/css/);
    assert.equal(res.body, '');
  });

  test('GET /nonexistent returns 404', async () => {
    const res = await request(`${baseUrl}/nonexistent`);
    assert.equal(res.status, 404);
    assert.match(res.body, /Orbit could not find that page/);
  });

  test('POST method to / returns 405 for known routes', async () => {
    const res = await request(`${baseUrl}/`, 'POST');
    assert.equal(res.status, 405);
    assert.equal(res.headers.allow, 'GET, HEAD');
  });

  test('path traversal attempt is blocked', async () => {
    const res = await request(`${baseUrl}/../package.json`);
    assert.ok(res.status === 404 || !res.body.includes('"name": "orbit"'));
  });

  test('encoded path traversal attempt is blocked', async () => {
    const res = await request(`${baseUrl}/%2e%2e/package.json`);
    assert.ok(res.status === 404 || !res.body.includes('"name": "orbit"'));
  });

  test('custom routes can replace the built-in website', async () => {
    await withApp(
      {
        publicDir: false,
        route: ({ method, url }) => {
          if (method === 'GET' && url.pathname === '/') {
            return {
              status: 200,
              headers: { 'content-type': 'text/html; charset=utf-8' },
              body: `<h1>${url.searchParams.get('name') ?? 'Custom Orbit app'}</h1>`
            };
          }

          return null;
        }
      },
      async (customBaseUrl) => {
        const res = await request(`${customBaseUrl}/?name=Launchpad`);
        assert.equal(res.status, 200);
        assert.match(res.body, /Launchpad/);
        assert.doesNotMatch(res.body, /Launch with a clean starting point/);
      }
    );
  });

  test('custom route handlers may resolve asynchronously', async () => {
    await withApp(
      {
        publicDir: false,
        route: async ({ url }) => {
          if (url.pathname !== '/api/demo') return null;

          return {
            status: 200,
            headers: { 'content-type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ status: 'ok' })
          };
        }
      },
      async (customBaseUrl) => {
        const res = await request(`${customBaseUrl}/api/demo`);
        assert.equal(res.status, 200);
        assert.deepEqual(JSON.parse(res.body), { status: 'ok' });
      }
    );
  });

  test('custom not-found handlers receive request context', async () => {
    await withApp(
      {
        publicDir: false,
        route: () => null,
        notFound: ({ url }) => ({
          status: 404,
          headers: { 'content-type': 'text/html; charset=utf-8' },
          body: `<h1>Missing ${url.pathname}</h1>`
        })
      },
      async (customBaseUrl) => {
        const res = await request(`${customBaseUrl}/unknown`);
        assert.equal(res.status, 404);
        assert.match(res.body, /Missing \/unknown/);
      }
    );
  });

  test('static assets can be disabled', async () => {
    await withApp(
      { publicDir: false, route: () => null },
      async (customBaseUrl) => {
        const res = await request(`${customBaseUrl}/styles.css`);
        assert.equal(res.status, 404);
      }
    );
  });
});
