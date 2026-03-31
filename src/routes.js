import { appConfig } from './config.js';
import { renderPage } from './templates.js';

const jsonHeaders = {
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8'
};

function pageResponse(html, status = 200) {
  return {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
    body: html
  };
}

function jsonResponse(body, status = 200) {
  return {
    status,
    headers: jsonHeaders,
    body: JSON.stringify(body, null, 2)
  };
}

export function matchRoute(method, pathname) {
  if (method !== 'GET') {
    return null;
  }

  if (pathname === '/') {
    return pageResponse(
      renderPage({
        title: 'Home',
        eyebrow: appConfig.name,
        headline: 'Launch with a clean starting point.',
        description:
          'Orbit gives you a minimal Node.js foundation with static pages, a JSON API, and CI-ready structure.',
        sections: [
          {
            title: 'Zero dependencies',
            body: 'The starter uses only built-in Node.js modules so you can run it immediately.'
          },
          {
            title: 'Open by default',
            body: 'The JSON API ships with permissive CORS headers so it can be consumed from anywhere.'
          },
          {
            title: 'Ready for extension',
            body: 'Add routes, swap templates, or layer a larger framework on top without ripping this apart.'
          }
        ]
      })
    );
  }

  if (pathname === '/features') {
    return pageResponse(
      renderPage({
        title: 'Features',
        eyebrow: 'Capabilities',
        headline: 'Small surface area, useful defaults.',
        description:
          'Orbit is intentionally compact but already organized around pages, APIs, assets, and tests.',
        sections: [
          {
            title: 'Multi-page structure',
            body: 'Home, feature, and docs pages are handled as explicit routes instead of one-off static files.'
          },
          {
            title: 'Structured API',
            body: 'A versionless status endpoint returns machine-readable service information.'
          },
          {
            title: 'Testable core',
            body: 'Routing is separated from the server bootstrap so behavior can be validated without opening ports.'
          }
        ]
      })
    );
  }

  if (pathname === '/docs') {
    return pageResponse(
      renderPage({
        title: 'Docs',
        eyebrow: 'Documentation',
        headline: 'Start, extend, and ship Orbit.',
        description:
          'Use Orbit as-is for a lightweight site or evolve it into a larger application with your own route modules.',
        sections: [
          {
            title: 'Run locally',
            body: 'Use npm run start for a stable run and npm run dev during development.'
          },
          {
            title: 'Add a route',
            body: 'Extend matchRoute in src/routes.js or add dedicated modules as the surface area grows.'
          },
          {
            title: 'Automate checks',
            body: 'The CI workflow runs the test suite on pushes and pull requests using the same npm test entry point.'
          }
        ]
      })
    );
  }

  if (pathname === '/api/status') {
    return jsonResponse({
      name: appConfig.name,
      status: 'ok',
      version: '0.1.0',
      publicAccess: true
    });
  }

  return null;
}
