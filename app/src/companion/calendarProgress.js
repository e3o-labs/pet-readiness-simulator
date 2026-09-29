import { MISSIONS } from '../content/missionPack.js';
import { careDaySummary, closeCareDay, reconcileElapsedCare } from './companionEngine.js';

export function simulationCalendarDay(companion, now = new Date()) {
  if (!companion?.careStartedOn) return null;
  const [year, month, day] = companion.careStartedOn.split('-').map(Number);
  // Compare calendar labels, not 24-hour durations (DST days can be shorter).
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(1, Math.floor((today - Date.UTC(year, month - 1, day)) / 86400000) + 1);
}

export function reconcileSimulationCalendar(state, now = new Date()) {
  const calendarDay = simulationCalendarDay(state.companion, now);
  if (!calendarDay || !state.selectedProfileId) return state;
  const companion = reconcileElapsedCare(state.companion, now);
  const currentDay = Math.min(7, calendarDay);
  const screen = calendarDay > 7 && state.screen === 'mission' ? 'report' : state.screen;
  if (currentDay === state.currentDay && screen === state.screen
    && JSON.stringify(companion.careResponses) === JSON.stringify(state.companion.careResponses)) return state;
  // Missing reflections remain missing. A clock tick is not a tester action.
  return { ...state, currentDay, screen, companion };
}

export function saveDailyReflection(state, expectedDay, mark, draft, now = new Date()) {
  const current = reconcileSimulationCalendar(state, now);
  if (current.currentDay !== expectedDay || simulationCalendarDay(current.companion, now) > 7) throw new Error('day_changed');
  if (current.logs.some(log => log.day === expectedDay)) return current;
  if (!['completed', 'skipped'].includes(mark)) throw new Error('reflection_mark_invalid');
  if (mark === 'completed' && !careDaySummary(current.companion, expectedDay, now).readyForMission) throw new Error('care_pending');
  const mission = MISSIONS[expectedDay - 1];
  const log = { day: expectedDay, missionId: mission.id, state: mark, note: (draft.note || '').trim(),
    difficulty: draft.difficulty ?? 3, emotion: draft.emotion || '차분함', visibility: 'private', includeInReport: mark === 'completed' };
  return { ...current, companion: closeCareDay(current.companion, expectedDay, now, `mission_${mark}`),
    logs: [...current.logs, log], screen: expectedDay === 7 ? 'report' : 'mission' };
}
