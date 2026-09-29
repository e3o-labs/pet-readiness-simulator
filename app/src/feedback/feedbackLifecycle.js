const CATEGORIES = new Set(['bug', 'confusion', 'feature', 'safety_privacy', 'other']);
const PLATFORMS = new Set(['ios', 'android', 'web', 'unknown']);
const EVIDENCE_LEVELS = new Set(['EL-OT-FEEDBACK', 'EL-SYN']);

function compactDate(iso) {
  return iso.slice(0, 10).replaceAll('-', '');
}

function randomSuffix(random) {
  return random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
}

export function validateFeedbackItem(item) {
  const errors = [];
  if (item?.schema_version !== 'service-feedback.item.v0') errors.push('schema_version');
  if (!/^CS-[0-9]{8}-[A-Z0-9]{6}$/.test(item?.client_submission_id || '')) errors.push('client_submission_id');
  if (item?.idempotency_key !== item?.client_submission_id) errors.push('idempotency_key');
  if (item?.source !== 'in_app') errors.push('source');
  if (!EVIDENCE_LEVELS.has(item?.evidence_level)) errors.push('evidence_level');
  if (!item?.app_version?.trim()) errors.push('app_version');
  if (!item?.build_number?.trim()) errors.push('build_number');
  if (!PLATFORMS.has(item?.platform)) errors.push('platform');
  if (!CATEGORIES.has(item?.category)) errors.push('category');
  if (!item?.user_message?.trim()) errors.push('user_message');
  if ((item?.user_message || '').length > 2000) errors.push('user_message_too_long');
  if (item?.consent_model_training !== false) errors.push('consent_model_training');
  if (item?.delivery_status !== 'queued') errors.push('delivery_status');
  if (typeof item?.contact_opt_in !== 'boolean') errors.push('contact_opt_in');
  if (!item?.contact_opt_in && item?.contact_ref) errors.push('contact_without_opt_in');
  return errors;
}

export function createFeedbackItem(input, clock = () => new Date(), random = Math.random) {
  const receivedAt = clock().toISOString();
  const clientSubmissionId = 'CS-' + compactDate(receivedAt) + '-' + randomSuffix(random);
  const item = {
    schema_version: 'service-feedback.item.v0',
    client_submission_id: clientSubmissionId,
    idempotency_key: clientSubmissionId,
    received_at: receivedAt,
    source: 'in_app',
    evidence_level: input.evidenceLevel || 'EL-OT-FEEDBACK',
    app_version: String(input.appVersion || '').trim(),
    build_number: String(input.buildNumber || '').trim(),
    platform: input.platform || 'unknown',
    os_version: String(input.osVersion || '').trim(),
    screen_id: String(input.screenId || '').trim(),
    category: input.category,
    user_message: String(input.userMessage || '').trim(),
    contact_opt_in: Boolean(input.contactOptIn),
    contact_ref: input.contactOptIn ? String(input.contactRef || '').trim() : '',
    attachment_count: 0,
    consent_model_training: false,
    delivery_status: 'queued',
  };
  const errors = validateFeedbackItem(item);
  if (errors.length) throw new Error('invalid_feedback_item:' + errors.join(','));
  return item;
}

export function enqueueFeedback(queue, item) {
  if (validateFeedbackItem(item).length) throw new Error('invalid_feedback_item');
  if (queue.some((existing) => existing.idempotency_key === item.idempotency_key)) return queue;
  return [...queue, item];
}

export function preserveFeedbackQueueOnSimulationReset(currentState, initialState) {
  return {
    ...initialState,
    serviceFeedbackQueue: currentState.serviceFeedbackQueue,
    serviceFeedbackReceipts: currentState.serviceFeedbackReceipts || [],
  };
}

export function buildFeedbackQueueExport(queue) {
  return {
    export_version: 'service-feedback.queue.v0',
    proof_boundary: 'Items are real EL-OT-FEEDBACK only when submitted by a real consenting user. Synthetic test items must remain EL-SYN and must not be imported as real service evidence.',
    items: queue,
  };
}

export function redactForNotification(value) {
  return String(value || '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/(?:\+?82[- ]?)?0?1[016789][-. ]?[0-9]{3,4}[-. ]?[0-9]{4}/g, '[REDACTED_PHONE]')
    .replace(/https?:\/\/\S+/gi, '[REDACTED_URL]')
    .slice(0, 300);
}

export function buildSlackNotification(item) {
  if (validateFeedbackItem(item).length) throw new Error('invalid_feedback_item');
  return [
    '[' + item.category.toUpperCase() + '][' + item.platform.toUpperCase() + '] ' + item.client_submission_id,
    'Version ' + item.app_version + ' (' + item.build_number + ') · ' + (item.screen_id || 'unknown screen'),
    'Summary: ' + redactForNotification(item.user_message),
    'Evidence: ' + item.evidence_level + ' · delivery queued',
  ].join('\n');
}

export function buildEmailAcknowledgement(item) {
  if (validateFeedbackItem(item).length) throw new Error('invalid_feedback_item');
  return {
    subject: '[나란히 걸어봄] 피드백 접수 ' + item.client_submission_id,
    body: '의견을 접수했습니다. 접수 번호는 ' + item.client_submission_id + '입니다. 이 번호는 중복 확인과 업데이트 반영 기록에만 사용됩니다.',
  };
}
