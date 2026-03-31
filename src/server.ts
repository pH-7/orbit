import { createServer } from 'node:http';
import { createApp } from './app.js';
import { appConfig } from './config.js';

const server = createServer(createApp());

server.listen(appConfig.port, () => {
  console.log(`Orbit is running at http://localhost:${appConfig.port}`);
});
