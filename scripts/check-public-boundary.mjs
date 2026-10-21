import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const allowedMedia = new Set(['app/assets/audio/dog-bark-george-public-domain.mp3']);
// Only these five reviewed application screenshots may cross the media boundary.
const guideNames = ['01-intro', '02-conditions', '03-profiles', '04-care', '05-reflection'];
const guideManifest = JSON.parse(await readFile(path.join(root, 'docs/usage-guide-assets.json'), 'utf8'));
const expectedGuidePaths = new Set(guideNames.map(name => `app/assets/usage-guide/${name}.jpg`));
if (guideManifest.assets.length !== expectedGuidePaths.size) failures.push('usage guide asset count differs from reviewed set');
for (const asset of guideManifest.assets) {
  if (!expectedGuidePaths.delete(asset.path)) { failures.push('unreviewed or duplicate usage guide path'); continue; }
  const digest = createHash('sha256').update(await readFile(path.join(root, asset.path))).digest('hex');
  if (digest !== asset.sha256) failures.push(asset.path + ': screenshot changed; renew capture review');
  else allowedMedia.add(asset.path);
}
if (expectedGuidePaths.size) failures.push('reviewed usage guide screenshot missing');
const learningManifest = JSON.parse(await readFile(path.join(root, 'docs/learning-illustration-assets.json'), 'utf8'));
const expectedLearningPaths = new Set(Array.from({ length: 7 }, (_, day) => Array.from({ length: 3 }, (_, scene) => `app/assets/learning/v3/day-${day + 1}-scene-${scene + 1}.png`)).flat());
if (learningManifest.assets.length !== 21) failures.push('learning asset count differs from reviewed set');
for (const asset of learningManifest.assets) {
  if (!expectedLearningPaths.delete(asset.path)) { failures.push('unreviewed or duplicate learning path'); continue; }
  const digest = createHash('sha256').update(await readFile(path.join(root, asset.path))).digest('hex');
  if (digest !== asset.sha256) failures.push(asset.path + ': illustration changed; renew context review');
  else allowedMedia.add(asset.path);
}
if (expectedLearningPaths.size) failures.push('reviewed learning illustration missing');
const forbiddenRoots = new Set(['.agent', '_workspace', 'data', 'deploy', 'plans', 'web']);
const privateKeyHeader = ['-----BEGIN ', '(?:RSA |EC |OPENSSH |DSA )?', 'PRIVATE KEY-----'].join('');
const certificateHeader = ['-----BEGIN ', 'CERTIFICATE-----'].join('');
const secretPatterns = [
  new RegExp(privateKeyHeader),
  new RegExp(certificateHeader),
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/,
];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', '.vercel', 'node_modules', '.expo', 'dist'].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (entry.isDirectory()) {
      if (path.dirname(relative) === '.' && forbiddenRoots.has(entry.name)) {
        failures.push(relative + ': private or unreviewed source area');
        continue;
      }
      await walk(absolute);
      continue;
    }
    if (/^(?:task\.md|project_status\.md)$/i.test(entry.name)) failures.push(relative + ': internal status file');
    if (/\.(?:csv|xlsx?|numbers|p12|mobileprovision|xcarchive|ipa|apk|aab)$/i.test(entry.name)) failures.push(relative + ': operational or binary record');
    if (/\.(?:png|jpe?g|gif|webp|svg|mp4|mov)$/i.test(entry.name) && !allowedMedia.has(relative)) failures.push(relative + ': asset requires a separate rights review');
    if (/\.(?:md|mjs|js|cjs|json|yml|yaml|sh|txt|plist)$/i.test(entry.name)) {
      const content = await readFile(absolute, 'utf8');
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          failures.push(relative + ': possible secret or certificate');
          break;
        }
      }
    }
  }
}

await walk(root);
if (failures.length) {
  console.error('Public boundary check failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exitCode = 1;
} else {
  console.log('Public boundary checks passed.');
}
