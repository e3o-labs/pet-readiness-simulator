import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CARE_MESSAGE_MISSED_PENALTY,
  CARE_MESSAGE_PENALTY_CAP,
  careDaySummary,
  careMessageTiming,
  closeCareDay,
  completeCareMessage,
  createCompanionState,
  hydrateCompanionState,
  startCareSchedule,
} from '../src/companion/companionEngine.js';
import { calculateReadiness } from '../src/core/readiness.js';

const at = (day, hour, minute) => new Date(2026, 7, day, hour, minute, 0, 0);
const completedMissions = Array.from({ length: 7 }, (_, index) => ({ day: index + 1, state: 'completed' }));

const scheduled = startCareSchedule(createCompanionState(), at(5, 0, 0), 1);
assert.equal(scheduled.schema, 'dog-first.companion.v5');
assert.equal(scheduled.careStartedOn, '2026-08-05');
assert.equal(hydrateCompanionState({ ...scheduled, careStartedOn: '2026-99-99' }).careStartedOn, null);

assert.equal(careMessageTiming(scheduled, 'day1_breakfast', at(5, 7, 9)).status, 'upcoming');
assert.equal(careMessageTiming(scheduled, 'day1_breakfast', at(5, 7, 10)).status, 'available');
assert.equal(careMessageTiming(scheduled, 'day1_breakfast', at(5, 10, 39)).status, 'available');
assert.equal(careMessageTiming(scheduled, 'day1_breakfast', at(5, 10, 40)).status, 'missed');
assert.equal(careMessageTiming(scheduled, 'day1_toilet', at(5, 10, 40)).status, 'available');
assert.equal(careMessageTiming(scheduled, 'day2_breakfast', at(5, 10, 40)).status, 'upcoming');
assert.equal(careMessageTiming(scheduled, 'day1_rest', at(6, 0, 0)).status, 'missed');
assert.equal(careMessageTiming(scheduled, 'day2_breakfast', at(6, 7, 30)).status, 'available');

assert.throws(
  () => completeCareMessage(scheduled, 'day1_breakfast', at(5, 7, 9)),
  /care_message_not_available/,
);
const breakfastDone = completeCareMessage(scheduled, 'day1_breakfast', at(5, 7, 10));
assert.deepEqual(breakfastDone.careResponses.day1_breakfast, {
  status: 'completed',
  completed: true,
  scheduledTime: '07:10',
  windowEndTime: '10:40',
  completedLocalMinute: 430,
  evidenceLevel: 'EL-SYN-INTERACTION',
});
assert.equal(careDaySummary(breakfastDone, 1, at(5, 8, 0)).availableCount, 0);
assert.equal(careDaySummary(breakfastDone, 1, at(5, 8, 0)).upcomingCount, 2);
assert.equal(careDaySummary(breakfastDone, 1, at(5, 8, 0)).readyForMission, false);

const toiletDone = completeCareMessage(scheduled, 'day1_toilet', at(5, 10, 40));
assert.equal(toiletDone.careResponses.day1_breakfast.status, 'missed');
assert.equal(toiletDone.careResponses.day1_toilet.status, 'completed');
assert.throws(
  () => completeCareMessage(toiletDone, 'day1_breakfast', at(5, 10, 41)),
  /care_message_not_available/,
);

const earlySkip = closeCareDay(breakfastDone, 1, at(5, 8, 0), 'mission_skipped');
assert.equal(earlySkip.careResponses.day1_breakfast.status, 'completed');
assert.equal(earlySkip.careResponses.day1_toilet.status, 'missed');
assert.equal(earlySkip.careResponses.day1_rest.status, 'missed');
assert.equal(careDaySummary(earlySkip, 1, at(5, 8, 0)).readyForMission, true);

assert.equal(CARE_MESSAGE_MISSED_PENALTY, 2);
assert.equal(CARE_MESSAGE_PENALTY_CAP, 30);
const twoMissed = calculateReadiness(
  completedMissions,
  undefined,
  undefined,
  undefined,
  earlySkip.careResponses,
);
assert.equal(twoMissed.missedCareMessageCount, 2);
assert.equal(twoMissed.completedCareMessageCount, 1);
assert.equal(twoMissed.careConsistencyPenalty, 4);
assert.equal(twoMissed.scores.care_consistency, 96);
assert.equal(twoMissed.overall, 99);

let allMissed = scheduled;
for (let day = 1; day <= 7; day += 1) {
  allMissed = closeCareDay(allMissed, day, at(5, 0, 0), 'mission_skipped');
}
const capped = calculateReadiness(completedMissions, undefined, undefined, undefined, allMissed.careResponses);
assert.equal(capped.missedCareMessageCount, 21);
assert.equal(capped.careConsistencyPenalty, CARE_MESSAGE_PENALTY_CAP);
assert.equal(capped.scores.care_consistency, 70);

const missionSource = await readFile(new URL('../src/companion/CompanionMissionScreen.js', import.meta.url), 'utf8');
const panelSource = await readFile(new URL('../src/companion/CompanionPanel.js', import.meta.url), 'utf8');
const inboxSource = await readFile(new URL('../src/companion/CareMessageInbox.js', import.meta.url), 'utf8');
const photoSource = await readFile(new URL('../src/companion/PhotoAvatarPanel.js', import.meta.url), 'utf8');
assert.ok(missionSource.indexOf('<CompanionHero') < missionSource.indexOf('<CareMessageInbox'));
assert.ok(missionSource.indexOf('<CareMessageInbox') < missionSource.indexOf('<CompanionEventPanel'));
assert.ok(missionSource.indexOf('<CompanionEventPanel') < missionSource.indexOf('오늘의 되돌아보기'));
assert.ok(missionSource.indexOf('오늘의 되돌아보기') < missionSource.indexOf('<CompanionAppearanceSettings'));
assert.doesNotMatch(missionSource, /<PhotoAvatarPanel/);
assert.match(missionSource, /activeTab === 'care'/);
assert.match(missionSource, /activeTab === 'reflection'/);
assert.match(missionSource, /activeTab === 'settings'/);
assert.doesNotMatch(panelSource, /PhotoAvatarPanel/);
assert.match(missionSource, /careSummary\.readyForMission/);
assert.match(panelSource, /함께할 모습은 설정에서 바꿔요/);
assert.match(panelSource, /오늘 곁에 있는 강아지/);
assert.match(missionSource, /7일 중/);
assert.match(inboxSource, /지금 강아지가 원하는 것/);
assert.match(inboxSource, /오늘 루틴/);
assert.match(photoSource, /설정 · 사진 예시/);
assert.match(photoSource, /사진 예시 설정/);
assert.match(photoSource, /사진 예시 설정 접기/);

console.log('Care rhythm flow passed: companion-first care, bounded timing, focused tabs, and preserved but hidden photo samples.');
