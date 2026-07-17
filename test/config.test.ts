import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { appConfig, resolvePort } from '../src/config.js';

const packageJson = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
) as { version: string };

test('appConfig.name is Orbit', () => {
  assert.equal(appConfig.name, 'Orbit');
});

test('appConfig.version follows semver format', () => {
  assert.match(appConfig.version, /^\d+\.\d+\.\d+$/);
});

test('appConfig.version matches the package version', () => {
  assert.equal(appConfig.version, packageJson.version);
});

test('appConfig.port defaults to 3000', () => {
  assert.equal(appConfig.port, 3000);
});

test('appConfig.host defaults to localhost', () => {
  assert.equal(appConfig.host, '127.0.0.1');
});

test('appConfig.description is a non-empty string', () => {
  assert.equal(typeof appConfig.description, 'string');
  assert.ok(appConfig.description.length > 0);
});

test('resolvePort accepts valid port values', () => {
  assert.equal(resolvePort('0'), 0);
  assert.equal(resolvePort('8080'), 8080);
  assert.equal(resolvePort(undefined), 3000);
});

test('resolvePort rejects invalid port values', () => {
  assert.throws(() => resolvePort('-1'), /PORT must be an integer/);
  assert.throws(() => resolvePort('65536'), /PORT must be an integer/);
  assert.throws(() => resolvePort('not-a-port'), /PORT must be an integer/);
});
