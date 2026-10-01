export async function flushFeedbackQueue(queue, options = {}) {
  const endpoint = String(options.endpoint || '').replace(/\/$/, '');
  if (!queue.length) return { status: 'empty', queue, acceptedClientSubmissionIds: [], receipts: [] };
  if (!endpoint) return { status: 'not_configured', queue, acceptedClientSubmissionIds: [], receipts: [] };

  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || 5000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (options.apiKey) headers['X-Feedback-API-Key'] = options.apiKey;
    const response = await fetchImpl(endpoint + '/v1/feedback', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        export_version: 'service-feedback.queue.v0',
        proof_boundary: 'Real user queue. Synthetic QA submissions must not be sent to the production endpoint.',
        items: queue,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return { status: 'http_error', httpStatus: response.status, queue, acceptedClientSubmissionIds: [], receipts: [] };
    }
    const payload = await response.json();
    const accepted = Array.isArray(payload.accepted_client_submission_ids)
      ? payload.accepted_client_submission_ids.filter((id) => typeof id === 'string')
      : [];
    const submittedSet = new Set(queue.map((item) => item.client_submission_id));
    const acceptedSet = new Set(accepted);
    const receipts = normalizeDeletionReceipts(payload.deletion_receipts, acceptedSet, submittedSet, options.clock);
    if (payload.status !== 'accepted' || !accepted.length || !receipts) {
      return { status: 'invalid_response', queue, acceptedClientSubmissionIds: [], receipts: [] };
    }
    return {
      status: 'delivered',
      queue: queue.filter((item) => !acceptedSet.has(item.client_submission_id)),
      acceptedClientSubmissionIds: accepted,
      receipts,
    };
  } catch (error) {
    return {
      status: error?.name === 'AbortError' ? 'timeout' : 'network_error',
      queue,
      acceptedClientSubmissionIds: [],
      receipts: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function validateFeedbackReceipt(receipt) {
  const errors = [];
  if (receipt?.schema_version !== 'service-feedback.receipt.v0') errors.push('schema_version');
  if (typeof receipt?.client_submission_id !== 'string' || !receipt.client_submission_id) errors.push('client_submission_id');
  if (typeof receipt?.feedback_id !== 'string' || !receipt.feedback_id.startsWith('FB-')) errors.push('feedback_id');
  if (typeof receipt?.deletion_token !== 'string' || receipt.deletion_token.length < 32) errors.push('deletion_token');
  if (!['accepted', 'deletion_requested', 'deleted'].includes(receipt?.status)) errors.push('status');
  return errors;
}

function normalizeDeletionReceipts(receipts, acceptedSet, submittedSet, clock) {
  if (!Array.isArray(receipts) || receipts.length !== acceptedSet.size) return null;
  const seen = new Set();
  const acceptedAt = (clock ? clock() : new Date()).toISOString();
  const normalized = [];
  for (const receipt of receipts) {
    if (validateFeedbackReceipt(receipt).length) return null;
    if (!acceptedSet.has(receipt.client_submission_id) || !submittedSet.has(receipt.client_submission_id)) return null;
    if (seen.has(receipt.client_submission_id)) return null;
    seen.add(receipt.client_submission_id);
    normalized.push({ ...receipt, accepted_at: receipt.accepted_at || acceptedAt });
  }
  return seen.size === acceptedSet.size ? normalized : null;
}

export function mergeFeedbackReceipts(existing, incoming) {
  const statusRank = { accepted: 0, deletion_requested: 1, deleted: 2 };
  const merged = new Map((existing || []).map((receipt) => [receipt.feedback_id, receipt]));
  for (const receipt of incoming || []) {
    if (validateFeedbackReceipt(receipt).length) continue;
    const previous = merged.get(receipt.feedback_id);
    const previousRank = statusRank[previous?.status] ?? -1;
    const incomingRank = statusRank[receipt.status] ?? -1;
    merged.set(receipt.feedback_id, incomingRank < previousRank ? previous : { ...previous, ...receipt });
  }
  return [...merged.values()];
}

async function sendFeedbackDeletionRequest(receipt, options = {}, statusWhenPending = 'requested') {
  const endpoint = String(options.endpoint || '').replace(/\/$/, '');
  if (validateFeedbackReceipt(receipt).length) return { status: 'invalid_receipt', receipt };
  if (!endpoint) return { status: 'not_configured', receipt };
  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || 5000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (options.apiKey) headers['X-Feedback-API-Key'] = options.apiKey;
    const response = await fetchImpl(
      endpoint + '/v1/feedback/' + encodeURIComponent(receipt.feedback_id) + '/deletion-request',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          client_submission_id: receipt.client_submission_id,
          deletion_token: receipt.deletion_token,
        }),
        signal: controller.signal,
      },
    );
    if (!response.ok) return { status: 'http_error', httpStatus: response.status, receipt };
    const payload = await response.json();
    if (!['deletion_requested', 'already_requested', 'already_deleted'].includes(payload.status)) {
      return { status: 'invalid_response', receipt };
    }
    const requestedAt = (options.clock ? options.clock() : new Date()).toISOString();
    const deleted = payload.status === 'already_deleted';
    return {
      status: deleted ? 'deleted' : statusWhenPending,
      receipt: {
        ...receipt,
        status: deleted ? 'deleted' : 'deletion_requested',
        deletion_requested_at: receipt.deletion_requested_at || requestedAt,
        ...(deleted ? { deletion_confirmed_at: requestedAt } : {}),
      },
    };
  } catch (error) {
    return { status: error?.name === 'AbortError' ? 'timeout' : 'network_error', receipt };
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestFeedbackDeletion(receipt, options = {}) {
  if (validateFeedbackReceipt(receipt).length) return { status: 'invalid_receipt', receipt };
  if (receipt.status === 'deletion_requested') return { status: 'already_requested', receipt };
  if (receipt.status === 'deleted') return { status: 'already_deleted', receipt };
  return sendFeedbackDeletionRequest(receipt, options, 'requested');
}

export async function refreshFeedbackDeletionStatus(receipt, options = {}) {
  if (validateFeedbackReceipt(receipt).length) return { status: 'invalid_receipt', receipt };
  if (receipt.status === 'accepted') return { status: 'not_requested', receipt };
  if (receipt.status === 'deleted') return { status: 'deleted', receipt };
  return sendFeedbackDeletionRequest(receipt, options, 'pending');
}
