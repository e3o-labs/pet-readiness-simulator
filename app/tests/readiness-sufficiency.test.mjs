import assert from 'node:assert/strict';
import { DOG_PROFILES } from '../src/content/dogProfiles.js';
import { calculateReadiness, READINESS_SAFETY_NOTICE } from '../src/core/readiness.js';

const completed = Array.from({ length: 7 }, (_, index) => ({ day: index + 1, state: 'completed' }));
const profile = DOG_PROFILES.find((item) => item.id === 'DOG_APP_D02');

const safe = calculateReadiness(completed, profile, { impact: 'safe' });
const review = calculateReadiness(completed, profile, { impact: 'needs_review' });
const risky = calculateReadiness(completed, profile, { impact: 'risky' });
assert.ok(safe.overall > review.overall && review.overall > risky.overall, 'Safer response must score above review and risky responses.');
assert.equal(safe.evidenceStatus, 'complete');
assert.equal(safe.recordedMissionCount, 7);

for (const result of [safe, review, risky]) {
  assert.ok(result.overall >= 0 && result.overall <= 100);
  assert.ok(Object.values(result.scores).every((value) => value >= 0 && value <= 100));
  assert.match(result.boundary, /not an adoption approval/i);
  assert.doesNotMatch(JSON.stringify(result), /입양 가능|입양 불가능|합격|불합격|진단 결과/);
}

for (let day = 0; day < 7; day += 1) {
  const before = calculateReadiness(completed.slice(0, day), profile, { impact: 'safe' });
  const after = calculateReadiness(completed.slice(0, day + 1), profile, { impact: 'safe' });
  assert.ok(after.overall >= before.overall, `Completing day ${day + 1} must not reduce the score.`);
}

const duplicateAndInvalid = calculateReadiness([
  ...completed,
  { day: 7, state: 'completed' },
  { day: 8, state: 'completed' },
  { day: 0, state: 'skipped' },
  { day: 3, state: 'unknown' },
], profile, { impact: 'safe' });
assert.deepEqual(duplicateAndInvalid.scores, safe.scores, 'Duplicate or invalid mission records must not inflate or reduce scores.');

const missing = calculateReadiness([], profile, { impact: 'safe' });
assert.equal(missing.evidenceStatus, 'incomplete');
assert.equal(missing.outcome, '기록을 더 채운 뒤 살펴보세요');
assert.ok(missing.improvements.length > 0);

const noProfile = calculateReadiness(completed, undefined, { impact: 'safe' });
assert.ok(noProfile.improvements.length > 0, 'Missing profile context must still produce a concrete review action.');
assert.equal(calculateReadiness(completed, profile, { impact: 'safe' }).overall, safe.overall, 'Same inputs must be deterministic.');

assert.match(READINESS_SAFETY_NOTICE.body, /실제.*다를 수 있습니다/);
assert.match(READINESS_SAFETY_NOTICE.action, /입양 여부를 대신 정해 주는 답은 아니니/);
assert.match(READINESS_SAFETY_NOTICE.escalation, /전문가나 기관/);

console.log('Readiness sufficiency passed: deterministic bounded scoring, monotonic missions, conservative incomplete-data handling, and human-readable safety boundaries.');
