import assert from 'node:assert/strict';
import test from 'node:test';
import { matchRoute } from '../src/routes.js';

// ── Home ────────────────────────────────────────────────

test('home route renders successfully', () => {
  const response = matchRoute('GET', '/');

  assert.ok(response);
  assert.equal(response.status, 200);
  assert.match(response.body, /Launch with a clean starting point/);
});

test('home route sets HTML content-type', () => {
  const response = matchRoute('GET', '/');

  assert.ok(response);
  assert.match(response.headers['content-type'] ?? '', /text\/html/);
});

// ── Features ────────────────────────────────────────────

test('features route returns 200 with page content', () => {
  const response = matchRoute('GET', '/features');

  assert.ok(response);
  assert.equal(response.status, 200);
  assert.match(response.body, /Small surface area/);
});

// ── Docs ────────────────────────────────────────────────

test('docs route returns 200 with page content', () => {
  const response = matchRoute('GET', '/docs');

  assert.ok(response);
  assert.equal(response.status, 200);
  assert.match(response.body, /Start, extend, and ship Orbit/);
});

// ── API status ──────────────────────────────────────────

test('status route exposes public access and CORS', () => {
  const response = matchRoute('GET', '/api/status');

  assert.ok(response);
  assert.equal(response.status, 200);
  assert.equal(response.headers['access-control-allow-origin'], '*');

  const payload = JSON.parse(response.body) as { publicAccess: boolean; status: string };
  assert.equal(payload.publicAccess, true);
  assert.equal(payload.status, 'ok');
});

test('status route returns valid JSON', () => {
  const response = matchRoute('GET', '/api/status');

  assert.ok(response);
  assert.doesNotThrow(() => JSON.parse(response.body));
});

test('status body includes name and version', () => {
  const response = matchRoute('GET', '/api/status');
  assert.ok(response);
  const payload = JSON.parse(response.body) as Record<string, unknown>;
  assert.equal(payload.name, 'Orbit');
  assert.equal(typeof payload.version, 'string');
});

// ── Missing / non-GET ───────────────────────────────────

test('unknown routes return null for server fallback handling', () => {
  const response = matchRoute('GET', '/missing');

  assert.equal(response, null);
});

test('POST method returns null', () => {
  assert.equal(matchRoute('POST', '/'), null);
  assert.equal(matchRoute('POST', '/api/status'), null);
});

test('PUT method returns null', () => {
  assert.equal(matchRoute('PUT', '/'), null);
});

test('DELETE method returns null', () => {
  assert.equal(matchRoute('DELETE', '/features'), null);
});

// ── All page routes return well-formed HTML ─────────────

test('all page routes produce valid HTML structure', () => {
  const pages = ['/', '/features', '/docs'];
  for (const path of pages) {
    const response = matchRoute('GET', path);
    assert.ok(response, `Expected route for ${path}`);
    assert.match(response.body, /<!doctype html>/i, `${path} missing doctype`);
    assert.match(response.body, /<\/html>/, `${path} missing closing html tag`);
    assert.match(response.body, /<nav class="site-nav">/, `${path} missing navigation`);
  }
});
