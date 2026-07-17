import { readFile, writeFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const configUrl = new URL('../src/config.ts', import.meta.url);
const config = await readFile(configUrl, 'utf8');
const updatedConfig = config.replace(
  /version: '[^']+',/,
  `version: '${packageJson.version}',`
);

if (updatedConfig === config) {
  throw new Error('Could not update appConfig.version in src/config.ts');
}

await writeFile(configUrl, updatedConfig);
