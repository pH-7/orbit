
# Orbit

Turn any web application into a scalable, maintainable, and successful product

![Orbit Project logo](assets/orbit-project-logo.svg)

Orbit is a simple, efficient Node.js web starter built for anyone to use, adapt, and contribute to.

## Overview

Orbit now ships as a ready-to-use minimal application with:

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

## Run Locally

```bash
npm install
npm run start
```

For automatic reload during development:

```bash
npm run dev
```

Run the test suite:

```bash
npm test
```

## Continuous Integration

GitHub Actions is configured in [.github/workflows/ci.yml](.github/workflows/ci.yml).

It runs on pushes to `main` and on pull requests, then:

- checks out the repository
- sets up Node.js
- installs dependencies
- runs `npm test`


## Project Structure

```text
.
├── .github/workflows/ci.yml
├── public/styles.css
├── src/app.js
├── src/config.js
├── src/routes.js
├── src/server.js
├── src/templates.js
└── test/routes.test.js
```

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
