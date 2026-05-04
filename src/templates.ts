import { appConfig } from './config.js';
import type { PageModel } from './types.js';

const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => htmlEscapeMap[character]);
}

function renderNavigation(): string {
  return `
    <nav class="site-nav">
      <a href="/" aria-current="page">Home</a>
      <a href="/features">Features</a>
      <a href="/docs">Docs</a>
      <a href="/api/status">API</a>
    </nav>
  `;
}

export function renderPage({
  title,
  eyebrow,
  headline,
  description,
  sections = []
}: PageModel): string {
  const safeTitle = escapeHtml(title);
  const safeEyebrow = escapeHtml(eyebrow);
  const safeHeadline = escapeHtml(headline);
  const safeDescription = escapeHtml(description);
  const cards = sections
    .map(
      (section) => `
        <article class="card">
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </article>
      `
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle} | ${appConfig.name}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="shell">
      ${renderNavigation()}
      <section class="hero">
        <p class="eyebrow">${safeEyebrow}</p>
        <h1>${safeHeadline}</h1>
        <p class="copy">${safeDescription}</p>
      </section>
      <section class="grid">
        ${cards}
      </section>
    </main>
  </body>
</html>`;
}
