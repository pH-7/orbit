import { appConfig } from './config.js';

function renderNavigation() {
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
}) {
  const cards = sections
    .map(
      (section) => `
        <article class="card">
          <h2>${section.title}</h2>
          <p>${section.body}</p>
        </article>
      `
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | ${appConfig.name}</title>
    <meta name="description" content="${description}" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="shell">
      ${renderNavigation()}
      <section class="hero">
        <p class="eyebrow">${eyebrow}</p>
        <h1>${headline}</h1>
        <p class="copy">${description}</p>
      </section>
      <section class="grid">
        ${cards}
      </section>
    </main>
  </body>
</html>`;
}
