import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HYDRATION_STATUS,
  loadStorageHydration,
  runHydratedEffect,
} from '../src/storageHydration.js';
import {
  STORAGE_KEYS,
  createStorageRepository,
} from '../src/storageRepository.js';

function createMemoryStorage() {
  const values = new Map();
  return {
    values,
    async getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    async setItem(key, value) {
      values.set(key, value);
    },
    async removeItem(key) {
      values.delete(key);
    },
    async multiRemove(keys) {
      for (const key of keys) values.delete(key);
    },
  };
}

function runAllPersistenceEffects(hydrationStatus) {
  const calls = {
    saveProgress: 0,
    saveFeedbackQueue: 0,
    saveFeedbackReceipts: 0,
  };
  for (const saver of Object.keys(calls)) {
    runHydratedEffect(hydrationStatus, () => {
      calls[saver] += 1;
    });
  }
  return calls;
}

const storage = createMemoryStorage();
const repository = createStorageRepository(storage);
const queue = [{
  client_submission_id: 'feedback-local-restart-1',
  status: 'pending',
}];
const receipts = [{
  client_submission_id: 'feedback-local-restart-1',
  feedback_id: 'feedback-server-restart-1',
}];
const progress = {
  schema: 'dog-first-alpha.v1',
  screen: 'mission',
  currentDay: 5,
  serviceFeedbackQueue: queue,
  serviceFeedbackReceipts: receipts,
};

await repository.saveProgress(progress);
await repository.saveFeedbackQueue(queue);
await repository.saveFeedbackReceipts(receipts);

const persistedProgress = JSON.parse(storage.values.get(STORAGE_KEYS.progress));
assert.equal('serviceFeedbackQueue' in persistedProgress, false);
assert.equal('serviceFeedbackReceipts' in persistedProgress, false);

const restartedRepository = createStorageRepository(storage);
const restartedHydration = await loadStorageHydration(restartedRepository);
assert.deepEqual(restartedHydration, {
  status: HYDRATION_STATUS.READY,
  storedProgress: {
    schema: 'dog-first-alpha.v1',
    screen: 'mission',
    currentDay: 5,
  },
  storedQueue: queue,
  storedReceipts: receipts,
});

const validRawValues = new Map(storage.values);
for (const key of Object.values(STORAGE_KEYS)) {
  storage.values.set(key, '{"truncated"');
  const corruptHydration = await loadStorageHydration(restartedRepository);
  assert.equal(
    corruptHydration.status,
    HYDRATION_STATUS.ERROR,
    `${key} corruption must fail closed`,
  );
  assert.deepEqual(
    runAllPersistenceEffects(corruptHydration.status),
    {
      saveProgress: 0,
      saveFeedbackQueue: 0,
      saveFeedbackReceipts: 0,
    },
    `${key} corruption must not overwrite recoverable local data`,
  );
  storage.values.set(key, validRawValues.get(key));
}

await restartedRepository.clearProgress();
assert.equal(storage.values.has(STORAGE_KEYS.progress), false);
assert.deepEqual(await restartedRepository.loadFeedbackQueue(), queue);
assert.deepEqual(await restartedRepository.loadFeedbackReceipts(), receipts);

await repository.saveProgress(progress);
await restartedRepository.clearAllLocalData();
assert.deepEqual([...storage.values.keys()], []);

const nonArrayStorage = createMemoryStorage();
for (const key of [STORAGE_KEYS.feedbackQueue, STORAGE_KEYS.feedbackReceipts]) {
  nonArrayStorage.values.set(key, JSON.stringify({ unexpected: true }));
}
const nonArrayRepository = createStorageRepository(nonArrayStorage);
assert.equal(await nonArrayRepository.loadFeedbackQueue(), null);
assert.equal(await nonArrayRepository.loadFeedbackReceipts(), null);

const storageSource = await readFile(new URL('../src/storage.js', import.meta.url), 'utf8');
assert.match(storageSource, /createStorageRepository\(AsyncStorage\)/);

console.log('Storage repository passed: restart restores data and corrupt JSON fails closed until reset.');
