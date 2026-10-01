export const STORAGE_KEYS = Object.freeze({
  progress: 'dog-first-mvp-alpha.progress.v1',
  feedbackQueue: 'dog-first-service-feedback.queue.v0',
  feedbackReceipts: 'dog-first-service-feedback.receipts.v0',
});

export function createStorageRepository(storage) {
  async function loadProgress() {
    const raw = await storage.getItem(STORAGE_KEYS.progress);
    return raw ? JSON.parse(raw) : null;
  }

  function saveProgress(progress) {
    const {
      serviceFeedbackQueue,
      serviceFeedbackReceipts,
      ...simulationProgress
    } = progress;
    return storage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify(simulationProgress),
    );
  }

  function clearProgress() {
    return storage.removeItem(STORAGE_KEYS.progress);
  }

  function clearAllLocalData() {
    return storage.multiRemove(Object.values(STORAGE_KEYS));
  }

  async function loadFeedbackQueue() {
    const raw = await storage.getItem(STORAGE_KEYS.feedbackQueue);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  }

  function saveFeedbackQueue(queue) {
    return storage.setItem(
      STORAGE_KEYS.feedbackQueue,
      JSON.stringify(queue),
    );
  }

  async function loadFeedbackReceipts() {
    const raw = await storage.getItem(STORAGE_KEYS.feedbackReceipts);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  }

  function saveFeedbackReceipts(receipts) {
    return storage.setItem(
      STORAGE_KEYS.feedbackReceipts,
      JSON.stringify(receipts),
    );
  }

  return {
    loadProgress,
    saveProgress,
    clearProgress,
    clearAllLocalData,
    loadFeedbackQueue,
    saveFeedbackQueue,
    loadFeedbackReceipts,
    saveFeedbackReceipts,
  };
}
