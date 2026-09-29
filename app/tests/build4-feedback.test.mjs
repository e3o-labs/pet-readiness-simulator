import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { careWindowLabel, completedCareLabel } from '../src/companion/carePresentation.js';
import { careMessageTiming, completeCareMessage, createCompanionState, startCareSchedule } from '../src/companion/companionEngine.js';

const at = (day, h, m) => new Date(2026, 8, day, h, m);
const state = startCareSchedule(createCompanionState(), at(5, 0, 0), 1);
const future = careMessageTiming(state, 'day3_walk', at(6, 8, 14));
assert.equal(future.status, 'upcoming');
assert.equal(careWindowLabel(future), '9월 7일 08:00부터 14:30 전까지', 'Future days need an explicit date, not just 08:00');
assert.equal(careMessageTiming(state, 'day3_walk', at(7, 8, 14)).status, 'available');
const done = completeCareMessage(state, 'day3_water', at(7, 20, 51));
assert.equal(completedCareLabel(done.careResponses.day3_water), '20:51에 완료');
assert.throws(() => completeCareMessage(state, 'day3_water', at(7, 21, 0)), /not_available/);
assert.equal(completedCareLabel({ status: 'legacy_completed' }), '완료 기록');

const config = JSON.parse(await readFile(new URL('../app.json', import.meta.url), 'utf8'));
const app = await readFile(new URL('../App.js', import.meta.url), 'utf8');
const screen = await readFile(new URL('../src/companion/CompanionMissionScreen.js', import.meta.url), 'utf8');
const keyboard = await readFile(new URL('../src/KeyboardAwareScrollView.js', import.meta.url), 'utf8');
assert.match(app, /KeyboardAwareScrollView as ScrollView/);
assert.match(screen, /KeyboardAwareScrollView as ScrollView/);
assert.match(keyboard, /automaticallyAdjustKeyboardInsets/);
assert.match(keyboard, /keyboardShouldPersistTaps="handled"/);
assert.match(app, /next === 'active'\) refresh\(\)/);
assert.match(app, /서비스 소개로 이동합니다/);
assert.doesNotMatch(screen, /<PhotoAvatarPanel/);
assert.doesNotMatch(app, /사진과 영상은 선택 사항입니다/);
console.log('Build 4 feedback: calendar labels, actual completion time, expiry, and keyboard integration passed.');
