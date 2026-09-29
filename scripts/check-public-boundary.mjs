import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const allowedMedia = new Set(['app/assets/audio/dog-bark-george-public-domain.mp3']);
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
    if (['.git', 'node_modules', '.expo', 'dist'].includes(entry.name)) continue;
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
