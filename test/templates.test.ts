import assert from 'node:assert/strict';
import test from 'node:test';
import { renderPage } from '../src/templates.js';

test('renderPage returns valid HTML document', () => {
  const html = renderPage({
    title: 'Test',
    eyebrow: 'E',
    headline: 'H',
    description: 'D'
  });

  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<\/html>/);
});

test('renderPage interpolates title into <title> tag', () => {
  const html = renderPage({
    title: 'About',
    eyebrow: 'Info',
    headline: 'About us',
    description: 'Learn more'
  });

  assert.match(html, /<title>About \| Orbit<\/title>/);
});

test('renderPage renders eyebrow, headline, and description', () => {
  const html = renderPage({
    title: 'T',
    eyebrow: 'MyEyebrow',
    headline: 'MyHeadline',
    description: 'MyDescription'
  });

  assert.match(html, /MyEyebrow/);
  assert.match(html, /<h1>MyHeadline<\/h1>/);
  assert.match(html, /MyDescription/);
});

test('renderPage renders section cards when provided', () => {
  const html = renderPage({
    title: 'T',
    eyebrow: 'E',
    headline: 'H',
    description: 'D',
    sections: [
      { title: 'Card One', body: 'Body one' },
      { title: 'Card Two', body: 'Body two' }
    ]
  });

  assert.match(html, /<article class="card">/);
  assert.match(html, /<h2>Card One<\/h2>/);
  assert.match(html, /<p>Body one<\/p>/);
  assert.match(html, /<h2>Card Two<\/h2>/);
});

test('renderPage omits cards section when no sections given', () => {
  const html = renderPage({
    title: 'T',
    eyebrow: 'E',
    headline: 'H',
    description: 'D'
  });

  assert.ok(!html.includes('<article class="card">'));
});

test('renderPage includes navigation links', () => {
  const html = renderPage({
    title: 'T',
    eyebrow: 'E',
    headline: 'H',
    description: 'D'
  });

  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/features"/);
  assert.match(html, /href="\/docs"/);
  assert.match(html, /href="\/api\/status"/);
});

test('renderPage includes meta description', () => {
  const html = renderPage({
    title: 'T',
    eyebrow: 'E',
    headline: 'H',
    description: 'Custom meta text'
  });

  assert.match(html, /<meta name="description" content="Custom meta text" \/>/);
});

test('renderPage links the stylesheet', () => {
  const html = renderPage({
    title: 'T',
    eyebrow: 'E',
    headline: 'H',
    description: 'D'
  });

  assert.match(html, /<link rel="stylesheet" href="\/styles\.css" \/>/);
});
