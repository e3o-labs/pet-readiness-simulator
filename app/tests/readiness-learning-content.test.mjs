import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  READINESS_LEARNING_CARDS,
  READINESS_LEARNING_RUNTIME_ENABLED,
  learningCardForDay,
} from '../src/content/readinessLearning.js';

assert.equal(READINESS_LEARNING_RUNTIME_ENABLED, false, 'Learning remains disabled until public review is complete.');
assert.deepEqual(READINESS_LEARNING_CARDS, [], 'Unreviewed learning content is not shipped in the public baseline.');
assert.equal(learningCardForDay(1), null);
assert.equal(learningCardForDay(7), null);

const missionSource = await readFile(new URL('../src/companion/CompanionMissionScreen.js', import.meta.url), 'utf8');
for (const marker of ['배움', '오늘 알아둘 1가지', '오늘 해볼 것', '이런 반응은 관찰해요']) {
  assert.ok(missionSource.includes(marker), `Learning UI scaffold marker missing: ${marker}`);
}
assert.ok(missionSource.includes('READINESS_LEARNING_RUNTIME_ENABLED'), 'Learning UI must remain protected by the disabled runtime gate.');
assert.ok(missionSource.includes('learningCardForDay(day)'), 'The disabled learning surface must remain connected to the gate.');

console.log('Readiness learning gate passed: unreviewed cards are absent and the UI remains disabled.');
