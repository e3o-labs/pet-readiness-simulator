import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const appConfig = JSON.parse(await readFile(new URL('app.json', root), 'utf8'));
const { default: resolveAppConfig } = await import('../app.config.cjs');
const resolvedConfig = resolveAppConfig({ config: appConfig.expo });

assert.equal(packageJson.expo, undefined, 'Unexpected platform autolinking configuration.');
assert.equal(Object.hasOwn(appConfig.expo.ios.infoPlist, 'NSCameraUsageDescription'), false);
assert.equal(Object.hasOwn(resolvedConfig.ios.infoPlist, 'NSCameraUsageDescription'), false);

console.log('Public platform configuration passed: no camera permission is declared.');
