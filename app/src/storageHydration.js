export const HYDRATION_STATUS = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
});

export async function loadStorageHydration({
  loadProgress,
  loadFeedbackQueue,
  loadFeedbackReceipts,
}) {
  try {
    const [storedProgress, storedQueue, storedReceipts] = await Promise.all([
      loadProgress(),
      loadFeedbackQueue(),
      loadFeedbackReceipts(),
    ]);
    return {
      status: HYDRATION_STATUS.READY,
      storedProgress,
      storedQueue,
      storedReceipts,
    };
  } catch {
    return { status: HYDRATION_STATUS.ERROR };
  }
}

export function runHydratedEffect(hydrationStatus, effect) {
  if (hydrationStatus !== HYDRATION_STATUS.READY) return false;
  effect();
  return true;
}
