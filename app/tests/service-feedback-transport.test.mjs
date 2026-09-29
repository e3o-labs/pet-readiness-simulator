import assert from 'node:assert/strict';
import { flushFeedbackQueue, mergeFeedbackReceipts, refreshFeedbackDeletionStatus, requestFeedbackDeletion, validateFeedbackReceipt } from '../src/feedback/feedbackTransport.js';

const first = { client_submission_id: 'CS-20260711-ONE111' };
const second = { client_submission_id: 'CS-20260711-TWO222' };
const queue = [first, second];
const fixedClock = () => new Date('2026-07-11T09:00:00.000Z');
const firstReceipt = {
  schema_version: 'service-feedback.receipt.v0',
  client_submission_id: first.client_submission_id,
  feedback_id: 'FB-20260711-RECEIPT001',
  deletion_token: 'abcdefghijklmnopqrstuvwxyz1234567890TOKEN',
  status: 'accepted',
};

const notConfigured = await flushFeedbackQueue(queue);
assert.equal(notConfigured.status, 'not_configured');
assert.strictEqual(notConfigured.queue, queue);

let observedRequest;
const delivered = await flushFeedbackQueue(queue, {
  endpoint: 'https://feedback.example.test/',
  apiKey: 'public-ingestion-token',
  clock: fixedClock,
  fetchImpl: async (url, request) => {
    observedRequest = { url, request };
    return {
      ok: true,
      status: 202,
      json: async () => ({
        status: 'accepted',
        accepted_client_submission_ids: [first.client_submission_id],
        deletion_receipts: [firstReceipt],
      }),
    };
  },
});
assert.equal(delivered.status, 'delivered');
assert.deepEqual(delivered.queue, [second]);
assert.deepEqual(delivered.receipts, [{ ...firstReceipt, accepted_at: '2026-07-11T09:00:00.000Z' }]);
assert.equal(observedRequest.url, 'https://feedback.example.test/v1/feedback');
assert.equal(observedRequest.request.headers['X-Feedback-API-Key'], 'public-ingestion-token');
assert.deepEqual(JSON.parse(observedRequest.request.body).items, queue);

const serverError = await flushFeedbackQueue(queue, {
  endpoint: 'https://feedback.example.test',
  fetchImpl: async () => ({ ok: false, status: 503 }),
});
assert.equal(serverError.status, 'http_error');
assert.strictEqual(serverError.queue, queue);

const malformed = await flushFeedbackQueue(queue, {
  endpoint: 'https://feedback.example.test',
  fetchImpl: async () => ({ ok: true, status: 202, json: async () => ({ status: 'accepted' }) }),
});
assert.equal(malformed.status, 'invalid_response');
assert.strictEqual(malformed.queue, queue);

const mismatchedReceipt = await flushFeedbackQueue(queue, {
  endpoint: 'https://feedback.example.test',
  fetchImpl: async () => ({
    ok: true,
    status: 202,
    json: async () => ({
      status: 'accepted',
      accepted_client_submission_ids: [first.client_submission_id],
      deletion_receipts: [{ ...firstReceipt, client_submission_id: second.client_submission_id }],
    }),
  }),
});
assert.equal(mismatchedReceipt.status, 'invalid_response');
assert.strictEqual(mismatchedReceipt.queue, queue);

const networkError = await flushFeedbackQueue(queue, {
  endpoint: 'https://feedback.example.test',
  fetchImpl: async () => { throw new Error('offline'); },
});
assert.equal(networkError.status, 'network_error');
assert.strictEqual(networkError.queue, queue);

assert.deepEqual(validateFeedbackReceipt(firstReceipt), []);
assert.ok(validateFeedbackReceipt({ ...firstReceipt, deletion_token: 'short' }).includes('deletion_token'));
const deletionRequestedReceipt = { ...firstReceipt, status: 'deletion_requested', deletion_requested_at: '2026-07-11T10:00:00.000Z' };
assert.deepEqual(mergeFeedbackReceipts([deletionRequestedReceipt], [firstReceipt]), [deletionRequestedReceipt]);
const deletedReceipt = { ...deletionRequestedReceipt, status: 'deleted', deletion_confirmed_at: '2026-07-11T11:00:00.000Z' };
assert.deepEqual(mergeFeedbackReceipts([deletionRequestedReceipt], [deletedReceipt]), [deletedReceipt]);
assert.deepEqual(mergeFeedbackReceipts([deletedReceipt], [firstReceipt]), [deletedReceipt]);

let observedDeletionRequest;
const deletion = await requestFeedbackDeletion(firstReceipt, {
  endpoint: 'https://feedback.example.test/',
  apiKey: 'public-ingestion-token',
  clock: fixedClock,
  fetchImpl: async (url, request) => {
    observedDeletionRequest = { url, request };
    return { ok: true, status: 200, json: async () => ({ status: 'deletion_requested' }) };
  },
});
assert.equal(deletion.status, 'requested');
assert.equal(deletion.receipt.status, 'deletion_requested');
assert.equal(deletion.receipt.deletion_requested_at, '2026-07-11T09:00:00.000Z');
assert.equal(observedDeletionRequest.url, 'https://feedback.example.test/v1/feedback/FB-20260711-RECEIPT001/deletion-request');
assert.equal(observedDeletionRequest.request.headers['X-Feedback-API-Key'], 'public-ingestion-token');
assert.deepEqual(JSON.parse(observedDeletionRequest.request.body), {
  client_submission_id: first.client_submission_id,
  deletion_token: firstReceipt.deletion_token,
});

const deletionOffline = await requestFeedbackDeletion(firstReceipt, {
  endpoint: 'https://feedback.example.test',
  fetchImpl: async () => { throw new Error('offline'); },
});
assert.equal(deletionOffline.status, 'network_error');
assert.strictEqual(deletionOffline.receipt, firstReceipt);

const alreadyDeleted = await requestFeedbackDeletion(firstReceipt, {
  endpoint: 'https://feedback.example.test',
  clock: fixedClock,
  fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ status: 'already_deleted' }) }),
});
assert.equal(alreadyDeleted.status, 'deleted');
assert.equal(alreadyDeleted.receipt.status, 'deleted');

let refreshCalls = 0;
const acceptedRefresh = await refreshFeedbackDeletionStatus(firstReceipt, {
  endpoint: 'https://feedback.example.test',
  fetchImpl: async () => { refreshCalls += 1; },
});
assert.equal(acceptedRefresh.status, 'not_requested');
assert.equal(refreshCalls, 0);

const pendingRefresh = await refreshFeedbackDeletionStatus(deletionRequestedReceipt, {
  endpoint: 'https://feedback.example.test',
  clock: fixedClock,
  fetchImpl: async () => {
    refreshCalls += 1;
    return { ok: true, status: 200, json: async () => ({ status: 'already_requested' }) };
  },
});
assert.equal(pendingRefresh.status, 'pending');
assert.equal(pendingRefresh.receipt.status, 'deletion_requested');
assert.equal(refreshCalls, 1);

const completedRefresh = await refreshFeedbackDeletionStatus(deletionRequestedReceipt, {
  endpoint: 'https://feedback.example.test',
  clock: fixedClock,
  fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ status: 'already_deleted' }) }),
});
assert.equal(completedRefresh.status, 'deleted');
assert.equal(completedRefresh.receipt.status, 'deleted');
assert.equal(completedRefresh.receipt.deletion_confirmed_at, '2026-07-11T09:00:00.000Z');

console.log('Service feedback transport passed: signed receipts gate queue removal and user deletion requests preserve retry safety.');
