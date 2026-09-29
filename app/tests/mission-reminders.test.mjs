import assert from 'node:assert/strict';
import { buildReminderPlan, createReminderScheduler, validReminderSchedule } from '../src/reminders/missionReminders.js';

const state = { reminder: { optedIn: true, schedule: { weekday: '20:15', weekend: '10:30' } }, currentDay: 1, logs: [], companion: { careStartedOn: '2026-09-05' } };
const now = new Date(2026, 8, 5, 12);
const plan = buildReminderPlan(state, now);
assert.equal(plan.length, 6);
assert.equal(plan[0].trigger.date.getDate(), 6);
assert.equal(plan[0].trigger.date.getHours(), 10);
assert.equal(plan[0].trigger.date.getMinutes(), 30);
assert.equal(plan[1].trigger.date.getHours(), 20);
assert.equal(plan[1].trigger.date.getMinutes(), 15);
assert.equal(validReminderSchedule({ weekday: '24:00', weekend: '10:30' }), false);
assert.equal(validReminderSchedule({ weekday: '20:60', weekend: '10:30' }), false);
assert.equal(buildReminderPlan({ ...state, reminder: { optedIn: true } }, now).length, 0, 'No guessed default time');
assert.equal(plan.at(-1).trigger.date.getDate(), 11);
assert.equal(buildReminderPlan({ ...state, reminder: { optedIn: false } }, now).length, 0);
assert.equal(buildReminderPlan({ ...state, logs: [{ day: 7 }] }, now).length, 0);
assert.equal(buildReminderPlan({ ...state, companion: { careStartedOn: 'bad' } }, now).length, 0);

const scheduled = new Map([['unrelated', { identifier: 'unrelated' }]]);
let permission = 'granted';
let fail = false;
const dismissed = new Set();
const sdk = {
  dismissNotificationAsync: async (id) => dismissed.add(id),
  getPermissionsAsync: async () => ({ status: permission }),
  getAllScheduledNotificationsAsync: async () => [...scheduled.values()],
  cancelScheduledNotificationAsync: async (id) => scheduled.delete(id),
  scheduleNotificationAsync: async (request) => {
    if (fail) throw new Error('native scheduler unavailable');
    scheduled.set(request.identifier, request);
    return request.identifier;
  },
};
const sync = createReminderScheduler(sdk);
scheduled.set('dogfirst-notification-test', { identifier: 'dogfirst-notification-test' });
const migrated = await sync({ ...state, reminder: { optedIn: true } }, now);
assert.equal(migrated.status, 'needs_time');
assert.equal(migrated.optedIn, false);
assert.equal(scheduled.has('dogfirst-notification-test'), false);
assert.equal(dismissed.has('dogfirst-notification-test'), true);
assert.equal((await sync(state, now)).status, 'permission_granted');
assert.equal(scheduled.size, 7);
const changed = { ...state, reminder: { ...state.reminder, schedule: { weekday: '18:45', weekend: '11:00' } } };
const changedResult = await sync(changed, now);
assert.deepEqual(changedResult.schedule, changed.reminder.schedule);
assert.equal(scheduled.get('dogfirst-mission-3').trigger.date.getHours(), 18);
assert.equal(scheduled.get('dogfirst-mission-3').trigger.date.getMinutes(), 45);
await sync(state, now);
assert.equal(scheduled.size, 7, 'Repeated reconciliation must not duplicate reminders');
await Promise.all([sync(state, now), sync({ ...state, reminder: { optedIn: false } }, now)]);
assert.deepEqual([...scheduled.keys()], ['unrelated'], 'Disable must win over an earlier in-flight enable');
await sync(state, now);
permission = 'denied';
assert.equal((await sync(state, now)).status, 'permission_denied');
assert.equal(scheduled.size, 1);
permission = 'granted';
fail = true;
await assert.rejects(sync(state, now), /native scheduler/);
fail = false;
await sync(state, now);
await sync({ ...state, logs: [{ day: 7 }] }, now);
assert.deepEqual([...scheduled.keys()], ['unrelated']);
console.log('Mission reminders passed: finite scheduling, denial, retry, completion, cancellation and overlap.');
