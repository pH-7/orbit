
# Orbit - Launch-Ready TypeScript Framework

Turn any web application into a scalable, maintainable, and successful product

![Orbit Project logo](assets/orbit-project-logo.svg)

Orbit is a simple, efficient TypeScript web starter built for anyone to use, adapt, and contribute to.

## Overview

Orbit now ships as a ready-to-use minimal application with:

- strict TypeScript (latest)
- PNPM as default package manager
- Node.js 22+ runtime targeting
- multi-page routing
- a public JSON API
- zero external runtime dependencies
- a built-in test suite
- GitHub Actions CI

## Accessibility

Orbit is intended to be open and accessible to anyone. The API responds with permissive CORS headers so it can be consumed from anywhere.

## Included Routes

- `/` home page
- `/features` feature overview
- `/docs` starter documentation
- `/api/status` JSON health and metadata endpoint

## Install

```bash
npm install @ph7/orbit
```

```bash
pnpm add @ph7/orbit
```

```bash
yarn add @ph7/orbit
```

Create a server with your own routes:

```ts
import { createServer } from 'node:http';
import { createApp } from '@ph7/orbit';

const app = createApp({
  route: ({ url }) =>
    url.pathname === '/'
      ? { status: 200, headers: { 'content-type': 'text/html' }, body: '<h1>Hello from Orbit</h1>' }
      : null
});

createServer(app).listen(3000);
```

## Run Locally

Use Node.js 22 or newer. If you use a version manager, the project includes `.node-version`.

```bash
pnpm install
pnpm start
```

By default the server binds to `127.0.0.1:3000`. Override it with `HOST` and `PORT` when needed:

```bash
HOST=0.0.0.0 PORT=8080 pnpm start
```

Use `PORT=0` if you want Node.js to pick an available port automatically.

For automatic reload during development:

```bash
pnpm run dev
```

Run the test suite:

```bash
pnpm test
```

Build without starting the server:

```bash
pnpm run build
```

## Continuous Integration

GitHub Actions runs the build and test suite against Node.js 22 and 24 on every push to `main` and on pull requests. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Screenshots

![Orbit Project Screenshot](assets/orbit-project.png)

## 👨‍🍳 Author

Designed and developed with ❤️ by **[Pierre-Henry Soria](https://ph7.me)**.  
Product Engineer building systems for better thinking and decision-making.  
Roquefort 🧀 and ristretto enthusiast.

---

[![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white&labelColor=000000&color=000000)](https://x.com/phenrysay)
[![BlueSky](https://img.shields.io/badge/BlueSky-000000?style=for-the-badge&logo=bluesky&logoColor=white&labelColor=000000&color=000000)](https://bsky.app/profile/pierrehenry.dev "Follow Me on BlueSky")
[![GitHub](https://img.shields.io/badge/GitHub-000000?style=for-the-badge&logo=github&logoColor=white&labelColor=000000&color=000000)](https://github.com/pH-7)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-000000?style=for-the-badge&logo=kofi&logoColor=white&labelColor=000000&color=000000)](https://ko-fi.com/phenry)
