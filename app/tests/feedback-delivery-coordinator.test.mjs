import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createFeedbackDeliveryCoordinator } from '../src/feedback/feedbackDeliveryCoordinator.js';

const first = { client_submission_id: 'CS-20260725-FIRST' };
const second = { client_submission_id: 'CS-20260725-SECOND' };

function deferred() {
  let resolve;
  const promise = new Promise((complete) => { resolve = complete; });
  return { promise, resolve };
}

async function waitFor(predicate, message) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) return;
    await Promise.resolve();
  }
  assert.fail(message);
}

const firstFlush = deferred();
const secondFlush = deferred();
const flushGates = [firstFlush, secondFlush];
const flushCalls = [];
const observedResults = [];
let activeFlushes = 0;
let maxActiveFlushes = 0;

const coordinator = createFeedbackDeliveryCoordinator({
  flush: async (queue) => {
    const callIndex = flushCalls.length;
    flushCalls.push(queue);
    activeFlushes += 1;
    maxActiveFlushes = Math.max(maxActiveFlushes, activeFlushes);
    const result = await flushGates[callIndex].promise;
    activeFlushes -= 1;
    return result;
  },
  onResult: (result) => observedResults.push(result),
});

const initialRequest = coordinator.request([first]);
await waitFor(() => flushCalls.length === 1, 'initial queue must start one flush');

const appActiveOverlap = coordinator.request([first]);
const newItemDuringSend = coordinator.request([first, second]);
assert.strictEqual(appActiveOverlap, initialRequest);
assert.strictEqual(newItemDuringSend, initialRequest);
assert.equal(flushCalls.length, 1);
assert.equal(maxActiveFlushes, 1);

firstFlush.resolve({
  status: 'delivered',
  queue: [],
  acceptedClientSubmissionIds: [first.client_submission_id],
  receipts: [{ client_submission_id: first.client_submission_id }],
});
await waitFor(() => flushCalls.length === 2, 'new item must start one sequential follow-up flush');
assert.deepEqual(flushCalls[1], [second]);
assert.equal(maxActiveFlushes, 1);

secondFlush.resolve({
  status: 'delivered',
  queue: [],
  acceptedClientSubmissionIds: [second.client_submission_id],
  receipts: [{ client_submission_id: second.client_submission_id }],
});
const finalResult = await initialRequest;
assert.equal(finalResult.status, 'delivered');
assert.equal(maxActiveFlushes, 1);
assert.deepEqual(
  observedResults.flatMap((result) => result.acceptedClientSubmissionIds),
  [first.client_submission_id, second.client_submission_id],
);

const retryCalls = [];
const retryCoordinator = createFeedbackDeliveryCoordinator({
  flush: async (queue) => {
    retryCalls.push(queue);
    if (retryCalls.length === 1) {
      return {
        status: 'network_error',
        queue,
        acceptedClientSubmissionIds: [],
        receipts: [],
      };
    }
    return {
      status: 'delivered',
      queue: [],
      acceptedClientSubmissionIds: [queue[0].client_submission_id],
      receipts: [{ client_submission_id: queue[0].client_submission_id }],
    };
  },
});

const failedAttempt = await retryCoordinator.request([first]);
assert.equal(failedAttempt.status, 'network_error');
assert.equal(retryCalls.length, 1);

const successfulRetry = await retryCoordinator.request([first]);
assert.equal(successfulRetry.status, 'delivered');
assert.equal(retryCalls.length, 2);
assert.strictEqual(retryCalls[0][0], first);
assert.strictEqual(retryCalls[1][0], first);
assert.equal(retryCalls[1][0].client_submission_id, first.client_submission_id);

const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
assert.match(appSource, /createFeedbackDeliveryCoordinator/);
assert.match(appSource, /feedbackDelivery\.request\(state\.serviceFeedbackQueue\)/);
assert.match(
  appSource,
  /\[feedbackDelivery, hydration\.status, state\.serviceFeedbackQueue\]/,
);
assert.doesNotMatch(appSource, /async function deliverServiceFeedback/);

console.log('Feedback delivery coordinator passed: app-active overlap is single-flight, new items drain sequentially, and retries preserve submission IDs.');
