function mergeQueueSnapshots(...snapshots) {
  const merged = [];
  const seenSubmissionIds = new Set();
  for (const snapshot of snapshots) {
    for (const item of Array.isArray(snapshot) ? snapshot : []) {
      const submissionId = item?.client_submission_id;
      if (typeof submissionId === 'string' && submissionId) {
        if (seenSubmissionIds.has(submissionId)) continue;
        seenSubmissionIds.add(submissionId);
      }
      merged.push(item);
    }
  }
  return merged;
}

function removeAcceptedItems(queue, acceptedClientSubmissionIds) {
  const accepted = new Set(
    Array.isArray(acceptedClientSubmissionIds) ? acceptedClientSubmissionIds : [],
  );
  return queue.filter((item) => !accepted.has(item?.client_submission_id));
}

export function createFeedbackDeliveryCoordinator({ flush, onResult = () => {} }) {
  let inFlight = null;
  let queuedDuringFlight = [];

  async function drain(initialQueue) {
    let queue = mergeQueueSnapshots(initialQueue);
    let lastResult = {
      status: 'empty',
      queue: [],
      acceptedClientSubmissionIds: [],
      receipts: [],
    };

    while (queue.length) {
      let result;
      try {
        result = await flush(queue);
      } catch {
        result = {
          status: 'network_error',
          queue,
          acceptedClientSubmissionIds: [],
          receipts: [],
        };
      }
      lastResult = result;
      onResult(result);

      const remaining = Array.isArray(result?.queue) ? result.queue : queue;
      const nextQueue = removeAcceptedItems(
        mergeQueueSnapshots(queuedDuringFlight, remaining),
        result?.acceptedClientSubmissionIds,
      );
      queuedDuringFlight = [];

      if (result?.status !== 'delivered') return result;
      queue = nextQueue;
    }

    return lastResult;
  }

  function request(queue) {
    const snapshot = mergeQueueSnapshots(queue);
    if (inFlight) {
      queuedDuringFlight = mergeQueueSnapshots(queuedDuringFlight, snapshot);
      return inFlight;
    }

    const operation = drain(snapshot);
    const trackedOperation = operation.finally(() => {
      if (inFlight === trackedOperation) {
        inFlight = null;
        queuedDuringFlight = [];
      }
    });
    inFlight = trackedOperation;
    return trackedOperation;
  }

  return { request };
}
