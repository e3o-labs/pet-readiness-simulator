import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = path.join(root, 'app');
const reportPath = path.join(root, 'docs', 'dependency-license-inventory.md');
const directManifest = JSON.parse(await readFile(path.join(appRoot, 'package.json'), 'utf8'));
const lock = JSON.parse(await readFile(path.join(appRoot, 'node_modules', '.package-lock.json'), 'utf8'));
const directNames = new Set(Object.keys(directManifest.dependencies || {}));
const entries = new Map();
const missing = [];

function licenseOf(pkg) {
  if (typeof pkg.license === 'string') return pkg.license;
  if (Array.isArray(pkg.licenses) && pkg.licenses.length) {
    return pkg.licenses.map((entry) => entry.type || 'UNDECLARED').join(' OR ');
  }
  return 'UNDECLARED';
}

for (const location of Object.keys(lock.packages || {}).filter((entry) => entry.startsWith('node_modules/'))) {
  const packagePath = path.join(appRoot, location, 'package.json');
  let pkg;
  try {
    pkg = JSON.parse(await readFile(packagePath, 'utf8'));
  } catch {
    missing.push(location + ': package metadata could not be read');
    continue;
  }
  const name = pkg.name || location.split('/').at(-1);
  const version = pkg.version || 'unknown';
  const license = licenseOf(pkg);
  const key = name + '@' + version;
  if (license === 'UNDECLARED') missing.push(key + ': no license metadata');
  const existing = entries.get(key);
  if (existing && existing.license !== license) {
    missing.push(key + ': inconsistent license metadata');
    continue;
  }
  entries.set(key, {
    name,
    version,
    license,
    type: directNames.has(name) ? 'direct dependency' : 'transitive dependency',
  });
}

if (missing.length) {
  console.error('Dependency license inventory is incomplete:');
  for (const item of missing) console.error('- ' + item);
  process.exit(1);
}

const sorted = [...entries.values()].sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
const lines = [
  '# Dependency license inventory',
  '',
  'Generated from app/package-lock.json. Regenerate with npm run licenses:scan from the app directory after dependency changes.',
  '',
  'This inventory records package-publisher license identifiers; it does not replace package license texts or legal review. Review any license change before upgrading a dependency.',
  '',
  '| Package | Version | License | Kind |',
  '| --- | --- | --- | --- |',
  ...sorted.map((item) => '| ' + item.name.replaceAll('|', '&#124;') + ' | ' + item.version.replaceAll('|', '&#124;') + ' | ' + item.license.replaceAll('|', '&#124;') + ' | ' + item.type + ' |'),
  '',
];
const generated = lines.join('\n');

if (process.argv.includes('--check')) {
  const current = await readFile(reportPath, 'utf8').catch(() => '');
  if (current !== generated) {
    console.error('Dependency license inventory is missing or stale. Run npm run licenses:scan from the app directory.');
    process.exit(1);
  }
  console.log('Dependency license inventory is current (' + sorted.length + ' package/version entries).');
} else {
  await writeFile(reportPath, generated, 'utf8');
  console.log('Wrote dependency license inventory (' + sorted.length + ' package/version entries).');
}
