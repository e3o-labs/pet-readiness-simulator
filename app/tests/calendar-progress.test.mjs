import assert from 'node:assert/strict';
import { reconcileSimulationCalendar, saveDailyReflection } from '../src/companion/calendarProgress.js';
import { careMessageTiming, completeCareMessage, createCompanionState, startCareSchedule } from '../src/companion/companionEngine.js';

const at = (day, hour = 0, minute = 0) => new Date(2026, 8, day, hour, minute);
const initial = { screen: 'mission', selectedProfileId: 'test', currentDay: 1, logs: [],
  missionDrafts: { 1: { note: '다음 날에도 보존할 메모', difficulty: 4 } },
  companion: startCareSchedule(createCompanionState(), at(5), 1) };
const morning = { ...initial, companion: completeCareMessage(initial.companion, 'day1_breakfast', at(5, 8)) };
const next = reconcileSimulationCalendar(morning, at(6, 8));
assert.equal(next.currentDay, 2, 'Unfinished reflection must not block tomorrow');
assert.equal(next.logs.length, 0, 'Calendar rollover must not invent completion or user skipping');
assert.equal(next.companion.careResponses.day1_breakfast.status, 'completed');
assert.equal(next.companion.careResponses.day1_toilet.status, 'missed');
assert.equal(next.missionDrafts[1].note, initial.missionDrafts[1].note);
assert.equal(careMessageTiming(next.companion, 'day2_breakfast', at(6, 8)).status, 'available');
assert.strictEqual(reconcileSimulationCalendar(next, at(6, 8)), next, 'Repeated reconciliation must be idempotent');

// A prior build could advance a day before that calendar date arrived.
assert.equal(reconcileSimulationCalendar({ ...initial, currentDay: 3 }, at(6, 8)).currentDay, 2);
const afterAbsence = reconcileSimulationCalendar(initial, at(9, 8));
assert.equal(afterAbsence.currentDay, 5);
assert.equal(Object.values(afterAbsence.companion.careResponses).filter(r => r.status === 'missed').length, 12);
assert.equal(reconcileSimulationCalendar(initial, at(12)).screen, 'report');
assert.equal(reconcileSimulationCalendar({ ...initial, screen: 'service_feedback' }, at(12)).screen, 'service_feedback');
assert.equal(reconcileSimulationCalendar({ ...initial, companion: createCompanionState() }, at(6)).companion.careStartedOn, null);

assert.throws(() => saveDailyReflection(initial, 1, 'completed', {}, at(5, 8)), /care_pending/);
const evening = { ...morning, companion: completeCareMessage(morning.companion, 'day1_rest', at(5, 22)) };
const saved = saveDailyReflection(evening, 1, 'completed', { note: '오늘 기록', difficulty: 3, emotion: '차분함' }, at(5, 22));
assert.equal(saved.currentDay, 1, 'Saving reflection must not expose tomorrow early');
assert.equal(saved.logs[0].state, 'completed');
assert.strictEqual(saveDailyReflection(saved, 1, 'completed', {}, at(5, 22)), saved, 'Double tap cannot overwrite the reflection');
assert.throws(() => saveDailyReflection(initial, 1, 'completed', {}, at(6, 8)), /day_changed/);
const skipped = saveDailyReflection(initial, 1, 'skipped', {}, at(5, 8));
assert.equal(skipped.currentDay, 1);
assert.equal(Object.values(skipped.companion.careResponses).filter(r => r.status === 'missed').length, 3);
assert.equal(reconcileSimulationCalendar(saved, at(6, 8)).logs[0].note, '오늘 기록');
console.log('Calendar progress: rollover, stale actions, draft preservation, expiry, and same-day completion passed.');
