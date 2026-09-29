import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HYDRATION_STATUS,
  loadStorageHydration,
  runHydratedEffect,
} from '../src/storageHydration.js';

const storedProgress = {
  schema: 'dog-first-alpha.v1',
  screen: 'mission',
  currentDay: 4,
};
const storedQueue = [{ client_submission_id: 'feedback-local-1' }];
const storedReceipts = [{ feedback_id: 'feedback-server-1' }];

function createLoaders(failingLoader = null) {
  return {
    loadProgress: async () => {
      if (failingLoader === 'loadProgress') throw new Error('progress unavailable');
      return storedProgress;
    },
    loadFeedbackQueue: async () => {
      if (failingLoader === 'loadFeedbackQueue') throw new Error('queue unavailable');
      return storedQueue;
    },
    loadFeedbackReceipts: async () => {
      if (failingLoader === 'loadFeedbackReceipts') throw new Error('receipts unavailable');
      return storedReceipts;
    },
  };
}

function runAllPersistenceEffects(hydrationStatus) {
  const calls = {
    saveProgress: 0,
    saveFeedbackQueue: 0,
    saveFeedbackReceipts: 0,
  };
  const effects = [
    runHydratedEffect(hydrationStatus, () => { calls.saveProgress += 1; }),
    runHydratedEffect(hydrationStatus, () => { calls.saveFeedbackQueue += 1; }),
    runHydratedEffect(hydrationStatus, () => { calls.saveFeedbackReceipts += 1; }),
  ];
  return { calls, effects };
}

const loadingEffects = runAllPersistenceEffects(HYDRATION_STATUS.LOADING);
assert.deepEqual(loadingEffects.effects, [false, false, false]);
assert.deepEqual(loadingEffects.calls, {
  saveProgress: 0,
  saveFeedbackQueue: 0,
  saveFeedbackReceipts: 0,
});

for (const failingLoader of [
  'loadProgress',
  'loadFeedbackQueue',
  'loadFeedbackReceipts',
]) {
  const failedHydration = await loadStorageHydration(createLoaders(failingLoader));
  assert.equal(failedHydration.status, HYDRATION_STATUS.ERROR);

  const failedEffects = runAllPersistenceEffects(failedHydration.status);
  assert.deepEqual(
    failedEffects.effects,
    [false, false, false],
    `${failingLoader} failure must keep every persistence effect closed`,
  );
  assert.deepEqual(failedEffects.calls, {
    saveProgress: 0,
    saveFeedbackQueue: 0,
    saveFeedbackReceipts: 0,
  });
}

const retriedHydration = await loadStorageHydration(createLoaders());
assert.deepEqual(retriedHydration, {
  status: HYDRATION_STATUS.READY,
  storedProgress,
  storedQueue,
  storedReceipts,
});

const retriedEffects = runAllPersistenceEffects(retriedHydration.status);
assert.deepEqual(retriedEffects.effects, [true, true, true]);
assert.deepEqual(retriedEffects.calls, {
  saveProgress: 1,
  saveFeedbackQueue: 1,
  saveFeedbackReceipts: 1,
});

const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
for (const saver of [
  'saveProgress(state)',
  'saveFeedbackQueue(state.serviceFeedbackQueue)',
  'saveFeedbackReceipts(state.serviceFeedbackReceipts)',
]) {
  assert.match(
    appSource,
    new RegExp(`runHydratedEffect\\(hydration\\.status, \\(\\) => \\{ ${saver.replaceAll('.', '\\.').replace(/[()]/g, '\\$&')}`),
    `${saver} must remain behind the shared ready-only gate`,
  );
}
assert.doesNotMatch(appSource, /\.finally\(\(\) => setReady\(true\)\)/);
assert.match(appSource, /hydration\.status === HYDRATION_STATUS\.LOADING/);
assert.match(appSource, /hydration\.status === HYDRATION_STATUS\.ERROR/);
assert.match(appSource, /onPress=\{retryHydration\}/);
assert.match(appSource, /onPress=\{confirmLocalDataReset\}/);
assert.match(appSource, /style: 'destructive', onPress: resetLocalDataAndRetry/);

const storageSource = await readFile(new URL('../src/storage.js', import.meta.url), 'utf8');
assert.match(storageSource, /createStorageRepository\(AsyncStorage\)/);
assert.match(storageSource, /export const clearAllLocalData = repository\.clearAllLocalData/);

console.log('Storage hydration passed: every read failure keeps persistence closed until a successful retry.');
