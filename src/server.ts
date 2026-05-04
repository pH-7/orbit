import { createServer } from 'node:http';
import { createApp } from './app.js';
import { appConfig } from './config.js';

const server = createServer(createApp());

server.on('error', (error: NodeJS.ErrnoException) => {
  const reason = error.code ? `${error.code}: ${error.message}` : error.message;
  console.error(`Orbit failed to start on ${appConfig.host}:${appConfig.port}. ${reason}`);
  process.exitCode = 1;
});

server.listen(appConfig.port, appConfig.host, () => {
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : appConfig.port;

  console.log(`Orbit is running at http://${appConfig.host}:${actualPort}`);
});
