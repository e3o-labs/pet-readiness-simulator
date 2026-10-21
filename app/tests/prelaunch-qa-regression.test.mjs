import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validOnboarding, validWeekdayHours } from '../src/onboarding/validation.js';
import { careDaySummary, careMessageTiming, closeCareDay, completeCareMessage, createCompanionState, hydrateCompanionState, reconcileElapsedCare, startCareSchedule } from '../src/companion/companionEngine.js';
import { saveDailyReflection } from '../src/companion/calendarProgress.js';
import { calculateReadiness } from '../src/core/readiness.js';

const valid = { household: 'single', home: 'apartment', weekdayHours: '8', budget: 'medium', experience: 'first', preference: 'calm', confidence: 'careful' };
for (const value of ['', ' ', '-1', '25', '80', 'NaN', 'Infinity', '1e1', '0x10', '8 hours', '.', '24.1']) {
  assert.equal(validWeekdayHours(value), false, `Reject ${JSON.stringify(value)}`);
  assert.equal(validOnboarding({ ...valid, weekdayHours: value }), false);
}
for (const value of ['0', '0.5', '8', '24', ' 8 ']) assert.equal(validOnboarding({ ...valid, weekdayHours: value }), true, value);
for (const key of Object.keys(valid)) {
  const missing = { ...valid }; delete missing[key];
  assert.equal(validOnboarding(missing), false, key);
}
assert.equal(validOnboarding({ ...valid, home: 'unknown' }), false);
assert.equal(validOnboarding(null), false);

const at = (day, h = 0, m = 0) => new Date(2026, 9, day, h, m);
const newStart = (h, m) => startCareSchedule(createCompanionState(), at(21, h, m), 1);
const midnight = newStart(0, 0);
assert.equal(careDaySummary(midnight, 1, at(21)).notRequiredCount, 0);
const boundary = newStart(10, 40);
assert.equal(careMessageTiming(boundary, 'day1_breakfast', at(21, 10, 40)).status, 'not_required');
assert.equal(careMessageTiming(boundary, 'day1_toilet', at(21, 10, 40)).status, 'available');
const evening = newStart(21, 30);
assert.equal(careDaySummary(evening, 1, at(21, 21, 30)).notRequiredCount, 2);
assert.equal(careDaySummary(evening, 1, at(21, 21, 30)).missedCount, 0);
assert.equal(careMessageTiming(evening, 'day1_rest', at(21, 21, 30)).status, 'available');
assert.throws(() => completeCareMessage(evening, 'day1_breakfast', at(21, 21, 30)), /not_available/);
const restored = hydrateCompanionState(JSON.parse(JSON.stringify(evening)));
assert.deepEqual(restored.careResponses, evening.careResponses);
const done = completeCareMessage(restored, 'day1_rest', at(21, 21, 31));
assert.equal(careDaySummary(done, 1, at(21, 21, 31)).readyForMission, true);
const saved = saveDailyReflection({ screen: 'mission', selectedProfileId: 'test', currentDay: 1, logs: [], companion: done }, 1, 'completed', { note: '합성 첫날' }, at(21, 22));
assert.equal(saved.logs.length, 1);
const report = calculateReadiness(saved.logs, undefined, undefined, undefined, saved.companion.careResponses);
assert.equal(report.missedCareMessageCount, 0);
assert.equal(report.completedCareMessageCount, 1);
assert.equal(report.careConsistencyPenalty, 0);
assert.equal(report.notRequiredCareMessageCount, 2);
assert.deepEqual(closeCareDay(evening, 1, at(21, 22)).careResponses.day1_breakfast, evening.careResponses.day1_breakfast);
const missed = reconcileElapsedCare(evening, at(22));
assert.equal(careDaySummary(missed, 1, at(22)).missedCount, 1, 'Actual post-start omission still counts');
assert.equal(careDaySummary(missed, 1, at(22)).notRequiredCount, 2);
// Existing schedules must not retroactively convert earlier evidence into exemptions.
assert.equal(careMessageTiming(startCareSchedule(midnight, at(21, 21, 30)), 'day1_breakfast', at(21, 21, 30)).status, 'missed');
const legacyMissed = closeCareDay(midnight, 1, at(21, 22));
assert.deepEqual(startCareSchedule(legacyMissed, at(22)).careResponses, legacyMissed.careResponses);
assert.equal(careMessageTiming(newStart(23, 59), 'day2_breakfast', at(22, 7, 30)).status, 'available');

const reminders = await readFile(new URL('../src/reminders/ReminderSettings.js', import.meta.url), 'utf8');
assert.match(reminders, /disabled=\{webUnsupported \|\| !valid\}/);
assert.match(reminders, /웹에서는 기기 알림을 예약하지 않아요/);
const app = await readFile(new URL('../App.js', import.meta.url), 'utf8');
assert.match(app, /if \(!validOnboarding\(current.onboarding\)\)/);
assert.match(app, /setState\(\(current\) => validOnboarding\(current.onboarding\)/);
console.log('Prelaunch QA regressions passed: bounded onboarding, first-day exclusions, persistence, real omissions, legacy evidence, and explicit web reminder fallback.');
