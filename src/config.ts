export function resolvePort(value = process.env.PORT): number {
  const port = Number(value || 3000);

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT must be an integer between 0 and 65535. Received: ${value}`);
  }

  return port;
}

export const appConfig = {
  name: 'Orbit',
  version: '0.1.0',
  description: 'A small TypeScript starter focused on clarity, speed, and zero runtime dependencies.',
  host: process.env.HOST || '127.0.0.1',
  port: resolvePort()
};
