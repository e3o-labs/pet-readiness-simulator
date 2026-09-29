import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DOG_PROFILES } from '../src/content/dogProfiles.js';
import { calculateReadiness } from '../src/core/readiness.js';

const matrix = JSON.parse(await readFile(new URL('./fixtures/synthetic-scenario-matrix.json', import.meta.url), 'utf8'));
const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
const completedLogs = Array.from({ length: 7 }, (_, index) => ({ day: index + 1, state: 'completed', includeInReport: true }));

assert.equal(DOG_PROFILES.length, 10, 'Alpha must expose all 10 Dog-first app profiles.');
assert.equal(matrix.scenarios.length, 12, 'Goal 4A matrix must retain 12 synthetic scenarios.');
for (const scenario of matrix.scenarios) {
  const profile = DOG_PROFILES.find((candidate) => candidate.id === scenario.app_profile_id);
  assert.ok(profile, scenario.scenario_id + ' must resolve to an Alpha profile.');
  const result = calculateReadiness(completedLogs, profile, { impact: 'safe' });
  assert.ok(result.overall >= 60, scenario.scenario_id + ' must reach a reportable score.');
  assert.ok(result.improvements.length >= 1, scenario.scenario_id + ' must surface a preparation task.');
  assert.match(result.boundary, /not an adoption approval/i);
}

const lowReadiness = calculateReadiness([], DOG_PROFILES.find((profile) => profile.id === 'DOG_APP_D02'), { impact: 'risky' });
assert.equal(lowReadiness.outcome, '기록을 더 채운 뒤 살펴보세요');
assert.equal(lowReadiness.evidenceStatus, 'incomplete');
assert.ok(lowReadiness.improvements.length >= 3, 'Low score must connect to concrete improvement tasks.');

for (const marker of ['recommendProfiles', 'EVENT_OPTIONS', 'calculateReadiness', '시뮬레이션 참고 점수', 'score.safetyNotice', 'configureReminder', 'saveProgress', '입양 전에, 7일을 먼저 연습해요.', '준비 여정 시작']) {
  assert.ok(appSource.includes(marker), 'App shell missing required Alpha marker: ' + marker);
}

console.log('Goal 8 Alpha harness passed: 12 synthetic scenarios resolve through profiles, scores, improvement tasks, and safe report boundaries.');
