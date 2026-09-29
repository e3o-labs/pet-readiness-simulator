import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  assertExpectedSubset,
  runFrozenRegressionFixture,
  validateAndFreezeFixtureSet,
} from './support/frozenRegressionRunner.mjs';

const fixtureUrl = new URL('./fixtures/public-regression-fixtures.v1.json', import.meta.url);
const fixtureRaw = await readFile(fixtureUrl, 'utf8');
const fixtureSha256 = createHash('sha256').update(fixtureRaw).digest('hex');
assert.equal(fixtureSha256, 'c7c76952ff5279b0fc5d3ce73f6ad9e695cbc26cc17742c93a8b98bfc6a62127');

const fixtureSet = validateAndFreezeFixtureSet(JSON.parse(fixtureRaw));
assert.ok(Object.isFrozen(fixtureSet));
assert.ok(Object.isFrozen(fixtureSet.cases));
assert.equal(fixtureSet.lifecycle, 'reviewed_frozen');
assert.equal(fixtureSet.evidence_level, 'EL-SYN');
assert.equal(fixtureSet.ai_boundary.dynamic_generation_allowed, false);
assert.equal(fixtureSet.ai_boundary.runtime_model_call_allowed, false);
assert.equal(fixtureSet.ai_boundary.pass_fail_source, 'committed_fixture_values_only');

assert.deepEqual(
  fixtureSet.cases.map((fixture) => fixture.id),
  [
    'SAFE-01',
    'RISKY-01',
    'SKIPPED-01',
    'MISSING-01',
    'DUPLICATE-01',
    'CONTRADICTORY-01',
    'LONG-COPY-01',
    'STORAGE-CORRUPTION-01',
    'FEEDBACK-RACE-01',
  ],
);

for (const fixture of fixtureSet.cases) {
  const result = await runFrozenRegressionFixture(fixture);
  assertExpectedSubset(result, fixture.expected, fixture.id);
}

const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
const cardStart = appSource.indexOf('function ReportSuggestionCard');
const cardEnd = appSource.indexOf('export default function App');
const reportCardSource = appSource.slice(cardStart, cardEnd);
assert.ok(cardStart >= 0 && cardEnd > cardStart);
assert.doesNotMatch(reportCardSource, /numberOfLines/);
assert.match(reportCardSource, /accessible/);
assert.match(reportCardSource, /suggestionAccessibilityLabel/);
assert.match(reportCardSource, /REPORT_EVIDENCE_BOUNDARY/);

console.log('Frozen regression fixtures passed: 9 reviewed EL-SYN cases are deterministic and runtime AI cannot affect pass/fail.');
