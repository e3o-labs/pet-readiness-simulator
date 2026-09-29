import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCompanionState, hydrateCompanionState } from '../src/companion/companionEngine.js';
import { createFeedbackItem, enqueueFeedback } from '../src/feedback/feedbackLifecycle.js';

const source = await readFile(new URL('../App.js', import.meta.url), 'utf8');
const section = (name, next) => source.slice(
  source.indexOf("  if (state.screen === '" + name + "')"),
  source.indexOf("  if (state.screen === '" + next + "')"),
);
const welcome = section('welcome', 'service_intro');
const intro = section('service_intro', 'service_feedback');
const feedback = section('service_feedback', 'service_feedback_export');
const queue = section('service_feedback_export', 'service_feedback_receipts');
const onboarding = section('onboarding', 'profiles');
const profiles = section('profiles', 'feed');

assert.ok(welcome.includes("setScreen('service_intro')"));
assert.ok(welcome.includes('accessibilityLabel="준비 여정 시작"'));
assert.ok(intro.includes("setScreen('onboarding')"));
assert.ok(onboarding.includes('onPress={completeOnboarding}'));
assert.ok(onboarding.includes('accessibilityLabel="평일 가장 긴 외출 시간, 시간 단위"'));
assert.ok(source.includes('accessibilityState={{ selected: value === id }}'));
assert.ok(profiles.includes('chooseProfile(item.id)'));
assert.ok(profiles.includes('이 강아지와 7일 시작하기'));
for (const screen of [welcome, intro, feedback, queue, onboarding, profiles]) {
  for (const forbidden of ['JSON.stringify', 'EL-OT', 'EL-SYN', 'alpha-local', '정식 서비스로 운영', '공개 테스트', '내부 검증', '모델 학습']) {
    assert.equal(screen.includes(forbidden), false, 'Customer routes must not expose private diagnostics.');
  }
}
assert.ok(queue.includes('item.user_message'));
assert.ok(queue.includes('FEEDBACK_CATEGORIES.find'));
assert.ok(feedback.includes('이용 화면, 앱 버전, 기기 종류가 전송됩니다'));
assert.ok(feedback.includes('이전 화면으로 돌아가기'));
assert.ok(feedback.includes('disabled={(!FEEDBACK_AVAILABLE || !serviceFeedbackMessage.trim())}'));
assert.ok(source.includes('const FEEDBACK_AVAILABLE = Boolean(FEEDBACK_API_URL && FEEDBACK_PRIVACY_URL)'));
assert.ok(source.includes("flushFeedbackQueue(queue, { endpoint: FEEDBACK_AVAILABLE ? FEEDBACK_API_URL : ''"));

const initialText = source.slice(source.indexOf('const initialState = ') + 21, source.indexOf('\nfunction hydrateState'));
const initialState = new Function('createCompanionState', 'return ' + initialText)(createCompanionState);
const hydrateText = source.slice(source.indexOf('function hydrateState'), source.indexOf('\nconst CHOICES'));
const publicScreens = new Set(['welcome', 'service_intro', 'service_feedback', 'service_feedback_export', 'service_feedback_receipts', 'onboarding', 'profiles', 'feed', 'report', 'mission']);
const hydrate = new Function('initialState', 'hydrateCompanionState', 'PUBLIC_SCREENS', hydrateText + '; return hydrateState;')(
  initialState, hydrateCompanionState, publicScreens,
);
for (const screen of ['welcome', 'mission', 'report', 'feed', 'profiles', 'onboarding', 'service_intro', 'service_feedback', 'service_feedback_export', 'service_feedback_receipts', 'unknown_screen']) {
  const stored = {
    ...initialState,
    screen,
    currentDay: 4,
    selectedProfileId: 'DOG_APP_D02',
    logs: [{ day: 2, note: '유지할 회고' }],
    missionDrafts: { 4: { note: '초안' } },
    reminder: { optedIn: true },
    serviceFeedbackQueue: [{ client_submission_id: 'keep' }],
    serviceFeedbackReceipts: [{ feedback_id: 'keep-receipt' }],
    unexpectedMetadata: { value: 'drop' },
  };
  const before = structuredClone(stored);
  const result = hydrate(stored);
  assert.equal(result.screen, publicScreens.has(screen) ? screen : 'welcome');
  assert.deepEqual(Object.keys(result).sort(), Object.keys(initialState).sort());
  assert.equal(result.currentDay, 4);
  assert.deepEqual(result.logs, stored.logs);
  assert.deepEqual(result.missionDrafts, stored.missionDrafts);
  assert.equal(result.selectedProfileId, 'DOG_APP_D02');
  assert.deepEqual(result.serviceFeedbackQueue, stored.serviceFeedbackQueue);
  assert.deepEqual(result.serviceFeedbackReceipts, stored.serviceFeedbackReceipts);
  assert.equal(result.reminder.optedIn, true);
  assert.deepEqual(stored, before);
}
assert.equal(hydrate(null).screen, 'welcome');

const submitText = source.slice(source.indexOf('  function submitServiceFeedback()'), source.indexOf('  function confirmFeedbackDeletion'));
for (const available of [false, true]) {
  let state = { serviceFeedbackQueue: [] };
  let cleared = false;
  const alerts = [];
  const submit = new Function(
    'FEEDBACK_AVAILABLE', 'createFeedbackItem', 'enqueueFeedback', 'COMPANION_APP_VERSION',
    'Platform', 'serviceFeedbackSourceScreen', 'serviceFeedbackCategory', 'serviceFeedbackMessage',
    'setState', 'setServiceFeedbackMessage', 'Alert',
    submitText + '; return submitServiceFeedback;',
  )(
    available, createFeedbackItem, enqueueFeedback, '1.0.0', { OS: 'ios' },
    'profiles', 'confusion', '프로필 설명이 어려워요',
    (fn) => { state = fn(state); },
    () => { cleared = true; },
    { alert: (...args) => alerts.push(args) },
  );
  submit();
  assert.equal(state.serviceFeedbackQueue.length, available ? 1 : 0);
  assert.equal(cleared, available);
  assert.equal(alerts.length, available ? 1 : 0);
  if (available) {
    assert.equal(state.serviceFeedbackQueue[0].screen_id, 'profiles');
    assert.equal(state.serviceFeedbackQueue[0].consent_model_training, false);
    assert.match(alerts[0][0], /전송 대기/);
  }
}
console.log('Release onboarding passed: customer routes, public-state migration, consent boundary, and guarded service feedback.');
