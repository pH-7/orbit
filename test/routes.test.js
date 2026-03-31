import test from 'node:test';
import assert from 'node:assert/strict';
import { matchRoute } from '../src/routes.js';

test('home route renders successfully', () => {
  const response = matchRoute('GET', '/');

  assert.ok(response);
  assert.equal(response.status, 200);
  assert.match(response.body, /Launch with a clean starting point/);
});

test('status route exposes public access and CORS', () => {
  const response = matchRoute('GET', '/api/status');

  assert.ok(response);
  assert.equal(response.status, 200);
  assert.equal(response.headers['access-control-allow-origin'], '*');

  const payload = JSON.parse(response.body);
  assert.equal(payload.publicAccess, true);
  assert.equal(payload.status, 'ok');
});

test('unknown routes return null for server fallback handling', () => {
  const response = matchRoute('GET', '/missing');

  assert.equal(response, null);
});
