import assert from 'node:assert/strict';
import test from 'node:test';
import { appConfig } from '../src/config.js';

test('appConfig.name is Orbit', () => {
  assert.equal(appConfig.name, 'Orbit');
});

test('appConfig.version follows semver format', () => {
  assert.match(appConfig.version, /^\d+\.\d+\.\d+$/);
});

test('appConfig.port defaults to 3000', () => {
  assert.equal(appConfig.port, 3000);
});

test('appConfig.description is a non-empty string', () => {
  assert.equal(typeof appConfig.description, 'string');
  assert.ok(appConfig.description.length > 0);
});
