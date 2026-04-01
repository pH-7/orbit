import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createServer, type Server } from 'node:http';
import { createApp } from '../src/app.js';

function fetch(url: string): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  return new Promise((resolve, reject) => {
    const req = import('node:http').then((http) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          const headers: Record<string, string> = {};
          for (const [key, val] of Object.entries(res.headers)) {
            if (typeof val === 'string') headers[key] = val;
          }
          resolve({ status: res.statusCode ?? 0, headers, body: data });
        });
        res.on('error', reject);
      });
    });
    void req;
  });
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
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] ?? '', /text\/html/);
    assert.match(res.body, /<!doctype html>/i);
  });

  test('GET /features returns 200', async () => {
    const res = await fetch(`${baseUrl}/features`);
    assert.equal(res.status, 200);
    assert.match(res.body, /Capabilities/);
  });

  test('GET /docs returns 200', async () => {
    const res = await fetch(`${baseUrl}/docs`);
    assert.equal(res.status, 200);
    assert.match(res.body, /Documentation/);
  });

  test('GET /api/status returns JSON with correct structure', async () => {
    const res = await fetch(`${baseUrl}/api/status`);
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] ?? '', /application\/json/);
    assert.equal(res.headers['access-control-allow-origin'], '*');

    const payload = JSON.parse(res.body) as Record<string, unknown>;
    assert.equal(payload.status, 'ok');
    assert.equal(payload.name, 'Orbit');
    assert.equal(typeof payload.version, 'string');
    assert.equal(payload.publicAccess, true);
  });

  test('GET /styles.css serves the static stylesheet', async () => {
    const res = await fetch(`${baseUrl}/styles.css`);
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] ?? '', /text\/css/);
    assert.match(res.body, /:root/);
  });

  test('GET /nonexistent returns 404', async () => {
    const res = await fetch(`${baseUrl}/nonexistent`);
    assert.equal(res.status, 404);
    assert.match(res.body, /Orbit could not find that page/);
  });

  test('POST method to / returns 404 (only GET is routed)', async () => {
    const res = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      import('node:http').then((http) => {
        const req = http.request(`${baseUrl}/`, { method: 'POST' }, (res) => {
          let data = '';
          res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
          res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
          res.on('error', reject);
        });
        req.end();
      }).catch(reject);
    });
    assert.equal(res.status, 404);
  });

  test('path traversal attempt is blocked', async () => {
    const res = await fetch(`${baseUrl}/../package.json`);
    // Should either 404 or not serve the file
    assert.ok(res.status === 404 || !res.body.includes('"name": "orbit"'));
  });
});
