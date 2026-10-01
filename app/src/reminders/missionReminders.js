const PREFIX = 'dogfirst-mission-';
const LEGACY_TEST_ID = 'dogfirst-notification-test';

export function validReminderSchedule(schedule) {
  return ['weekday', 'weekend'].every((key) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(schedule?.[key] || ''));
}

export function buildReminderPlan(state, now = new Date()) {
  if (!state.reminder?.optedIn || !validReminderSchedule(state.reminder.schedule) || state.logs?.some((log) => log.day === 7)) return [];
  const key = state.companion?.careStartedOn;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || '')) return [];
  const [year, month, day] = key.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day) return [];
  const plan = [];
  for (let missionDay = Math.max(1, state.currentDay || 1); missionDay <= 7; missionDay += 1) {
    if (state.logs?.some((log) => log.day === missionDay)) continue;
    const date = new Date(start);
    date.setDate(start.getDate() + missionDay - 1);
    const kind = [0, 6].includes(date.getDay()) ? 'weekend' : 'weekday';
    const [hour, minute] = state.reminder.schedule[kind].split(':').map(Number);
    date.setHours(hour, minute, 0, 0);
    if (date <= now) continue;
    plan.push({
      identifier: PREFIX + missionDay,
      content: { title: '나란히 걸어봄', body: '오늘의 강아지 돌봄 요청을 확인해 주세요.', sound: false },
      trigger: { type: 'date', date },
    });
  }
  return plan;
}

export function createReminderScheduler(notifications) {
  let tail = Promise.resolve();
  return (state, now = new Date()) => {
    const job = tail.then(async () => {
      // Remove the temporary QA notification when upgrading to user-selected times.
      await notifications.cancelScheduledNotificationAsync(LEGACY_TEST_ID);
      await notifications.dismissNotificationAsync(LEGACY_TEST_ID);
      const pending = await notifications.getAllScheduledNotificationsAsync();
      for (const request of pending) {
        if (request.identifier.startsWith(PREFIX)) await notifications.cancelScheduledNotificationAsync(request.identifier);
      }
      const reminder = state.reminder || {};
      if (!validReminderSchedule(reminder.schedule)) return { ...reminder, optedIn: false, status: 'needs_time' };
      if (!reminder.optedIn) return { ...reminder, optedIn: false, status: 'off' };
      const permission = await notifications.getPermissionsAsync();
      if (permission.status !== 'granted') return { ...reminder, optedIn: false, status: 'permission_denied' };
      const plan = buildReminderPlan(state, now);
      try {
        for (const request of plan) await notifications.scheduleNotificationAsync(request);
      } catch (error) {
        for (const request of plan) await notifications.cancelScheduledNotificationAsync(request.identifier).catch(() => {});
        throw error;
      }
      return { ...reminder, optedIn: true, status: plan.length ? 'permission_granted' : 'complete' };
    });
    tail = job.catch(() => {});
    return job;
  };
}
