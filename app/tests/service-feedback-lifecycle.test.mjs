import assert from 'node:assert/strict';
import {
  buildEmailAcknowledgement,
  buildFeedbackQueueExport,
  buildSlackNotification,
  createFeedbackItem,
  enqueueFeedback,
  preserveFeedbackQueueOnSimulationReset,
  redactForNotification,
  validateFeedbackItem,
} from '../src/feedback/feedbackLifecycle.js';

const fixedClock = () => new Date('2026-07-11T08:00:00.000Z');
const fixedRandom = () => 0.123456789;
const item = createFeedbackItem({
  evidenceLevel: 'EL-SYN',
  appVersion: '1.0.0',
  buildNumber: '18',
  platform: 'ios',
  osVersion: '26.5',
  screenId: 'final_report',
  category: 'confusion',
  userMessage: '문의 user@example.com, 010-1234-5678, https://example.com/private',
}, fixedClock, fixedRandom);

assert.deepEqual(validateFeedbackItem(item), []);
assert.match(item.client_submission_id, /^CS-20260711-[A-Z0-9]{6}$/);
assert.equal(item.idempotency_key, item.client_submission_id);
assert.equal(item.consent_model_training, false);

const once = enqueueFeedback([], item);
const twice = enqueueFeedback(once, item);
assert.equal(once.length, 1);
assert.equal(twice.length, 1);
assert.strictEqual(twice, once);
const resetState = preserveFeedbackQueueOnSimulationReset(
  { screen: 'report', logs: [{ day: 7 }], serviceFeedbackQueue: once, serviceFeedbackReceipts: [{ feedback_id: 'FB-KEEP' }] },
  { screen: 'welcome', logs: [], serviceFeedbackQueue: [], serviceFeedbackReceipts: [] },
);
assert.equal(resetState.screen, 'welcome');
assert.deepEqual(resetState.logs, []);
assert.strictEqual(resetState.serviceFeedbackQueue, once);
assert.deepEqual(resetState.serviceFeedbackReceipts, [{ feedback_id: 'FB-KEEP' }]);

const redacted = redactForNotification(item.user_message);
assert.equal(redacted.includes('user@example.com'), false);
assert.equal(redacted.includes('010-1234-5678'), false);
assert.equal(redacted.includes('https://example.com/private'), false);
assert.match(redacted, /REDACTED_EMAIL/);
assert.match(redacted, /REDACTED_PHONE/);
assert.match(redacted, /REDACTED_URL/);

const slack = buildSlackNotification(item);
assert.match(slack, /CS-20260711-/);
assert.equal(slack.includes('user@example.com'), false);
assert.equal(slack.includes('010-1234-5678'), false);
const email = buildEmailAcknowledgement(item);
assert.match(email.subject, /^\[나란히 걸어봄\] 피드백 접수 /);
assert.match(email.subject, /CS-20260711-/);
assert.match(email.body, /중복 확인과 업데이트 반영 기록/);

const exported = buildFeedbackQueueExport(once);
assert.equal(exported.export_version, 'service-feedback.queue.v0');
assert.equal(exported.items.length, 1);
assert.match(exported.proof_boundary, /Synthetic test items must remain EL-SYN/);

assert.throws(() => createFeedbackItem({
  appVersion: '1.0.0',
  buildNumber: '18',
  platform: 'ios',
  category: 'bug',
  userMessage: '',
}, fixedClock, fixedRandom), /invalid_feedback_item:user_message/);

console.log('Service feedback lifecycle passed: validation, idempotent reset-safe queue, evidence boundary, Slack redaction, and email acknowledgement.');
