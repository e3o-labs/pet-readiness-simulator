import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calculateReadiness } from '../src/core/readiness.js';

const completed = (days) => days.map((day) => ({ day, state: 'completed' }));
const skipped = (days) => days.map((day) => ({ day, state: 'skipped' }));

const allMissing = calculateReadiness([]);
const allSkipped = calculateReadiness(skipped([1, 2, 3, 4, 5, 6, 7]));

assert.equal(
  allSkipped.overall,
  allMissing.overall,
  'Recording a skip must not score lower or higher than leaving the same day unanswered',
);
assert.deepEqual(allMissing.scores, allSkipped.scores);
assert.equal(allMissing.evidenceStatus, 'incomplete');
assert.equal(allSkipped.evidenceStatus, 'incomplete');
assert.deepEqual(
  {
    recorded: allMissing.recordedMissionCount,
    completed: allMissing.completedMissionCount,
    skipped: allMissing.skippedMissionCount,
    missing: allMissing.missingMissionCount,
  },
  { recorded: 0, completed: 0, skipped: 0, missing: 7 },
);
assert.deepEqual(
  {
    recorded: allSkipped.recordedMissionCount,
    completed: allSkipped.completedMissionCount,
    skipped: allSkipped.skippedMissionCount,
    missing: allSkipped.missingMissionCount,
  },
  { recorded: 7, completed: 0, skipped: 7, missing: 0 },
);

const completedOnly = calculateReadiness(completed([1, 2, 3]));
const mixedNonResponse = calculateReadiness([
  ...completed([1, 2, 3]),
  ...skipped([4, 5]),
]);
assert.equal(
  mixedNonResponse.overall,
  completedOnly.overall,
  'Replacing missing days with skipped days must not change the readiness score',
);
assert.deepEqual(mixedNonResponse.scores, completedOnly.scores);
assert.deepEqual(
  {
    recorded: mixedNonResponse.recordedMissionCount,
    completed: mixedNonResponse.completedMissionCount,
    skipped: mixedNonResponse.skippedMissionCount,
    missing: mixedNonResponse.missingMissionCount,
  },
  { recorded: 5, completed: 3, skipped: 2, missing: 2 },
);

const allCompleted = calculateReadiness(completed([1, 2, 3, 4, 5, 6, 7]));
assert.equal(allCompleted.evidenceStatus, 'complete');
assert.deepEqual(
  {
    recorded: allCompleted.recordedMissionCount,
    completed: allCompleted.completedMissionCount,
    skipped: allCompleted.skippedMissionCount,
    missing: allCompleted.missingMissionCount,
  },
  { recorded: 7, completed: 7, skipped: 0, missing: 0 },
);
assert.ok(
  allCompleted.overall > allSkipped.overall,
  'Completing missions must score above either kind of non-response',
);

const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
assert.match(appSource, /건너뜀 \{score\.skippedMissionCount\}/);
assert.match(appSource, /미기록 \{score\.missingMissionCount\}/);

console.log('Mission evidence passed: missing and skipped stay distinct without changing the score for non-response.');
