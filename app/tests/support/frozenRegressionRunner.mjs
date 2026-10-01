import assert from 'node:assert/strict';
import { companionEvidenceForChoice } from '../../src/companion/companionEngine.js';
import { calculateReadiness } from '../../src/core/readiness.js';
import { createFeedbackDeliveryCoordinator } from '../../src/feedback/feedbackDeliveryCoordinator.js';
import {
  REPORT_EVIDENCE_BOUNDARY,
  suggestionAccessibilityLabel,
  supportingEvidenceText,
} from '../../src/report/reportPresentation.js';
import {
  STORAGE_KEYS,
  createStorageRepository,
} from '../../src/storageRepository.js';
import {
  HYDRATION_STATUS,
  loadStorageHydration,
  runHydratedEffect,
} from '../../src/storageHydration.js';

const REQUIRED_CASE_IDS = [
  'SAFE-01',
  'RISKY-01',
  'SKIPPED-01',
  'MISSING-01',
  'DUPLICATE-01',
  'CONTRADICTORY-01',
  'LONG-COPY-01',
  'STORAGE-CORRUPTION-01',
  'FEEDBACK-RACE-01',
];

const ALLOWED_CASE_KINDS = new Set([
  'readiness',
  'presentation',
  'storage_corruption',
  'feedback_race',
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export function validateAndFreezeFixtureSet(fixtureSet) {
  assert.equal(fixtureSet?.schema, 'dog-first.lh01-regression-fixtures.v1');
  assert.equal(fixtureSet?.fixture_set_id, 'PUBLIC-BASELINE-2026-09-29');
  assert.equal(fixtureSet?.version, 1);
  assert.equal(fixtureSet?.lifecycle, 'reviewed_frozen');
  assert.equal(fixtureSet?.evidence_level, 'EL-SYN');
  assert.equal(fixtureSet?.review?.kind, 'deterministic_contract_review');
  assert.equal(fixtureSet?.review?.reviewer_role, 'public_project_maintainer');
  assert.ok(fixtureSet?.review?.claim_boundary?.includes('not real-user'));
  assert.ok(Array.isArray(fixtureSet?.review?.derived_from_committed_contracts));
  assert.ok(fixtureSet.review.derived_from_committed_contracts.length >= 6);
  assert.equal(fixtureSet?.ai_boundary?.structuring_assistance_used, true);
  assert.equal(fixtureSet?.ai_boundary?.dynamic_generation_allowed, false);
  assert.equal(fixtureSet?.ai_boundary?.runtime_model_call_allowed, false);
  assert.equal(fixtureSet?.ai_boundary?.pass_fail_source, 'committed_fixture_values_only');
  assert.ok(fixtureSet?.ai_boundary?.promotion_boundary?.includes('EL-SYN'));
  assert.ok(Array.isArray(fixtureSet?.cases));
  assert.deepEqual(fixtureSet.cases.map((fixture) => fixture.id), REQUIRED_CASE_IDS);
  assert.equal(new Set(fixtureSet.cases.map((fixture) => fixture.id)).size, REQUIRED_CASE_IDS.length);
  for (const fixture of fixtureSet.cases) {
    assert.ok(ALLOWED_CASE_KINDS.has(fixture.kind), fixture.id + ': invalid kind');
    assert.ok(typeof fixture.description === 'string' && fixture.description.trim(), fixture.id + ': missing description');
    assert.ok(fixture.input && typeof fixture.input === 'object', fixture.id + ': missing input');
    assert.ok(fixture.expected && typeof fixture.expected === 'object', fixture.id + ': missing expected result');
  }
  return deepFreeze(fixtureSet);
}

function readinessResult(fixture) {
  const companionResponses = fixture.input.companion_choices
    ? Object.fromEntries(fixture.input.companion_choices.map((choice) => [
      choice.event_id,
      companionEvidenceForChoice(choice.event_id, choice.choice_id),
    ]))
    : fixture.input.stored_companion_responses;
  const report = calculateReadiness(
    fixture.input.logs,
    undefined,
    undefined,
    companionResponses,
  );
  return {
    overall: report.overall,
    evidenceStatus: report.evidenceStatus,
    recordedMissionCount: report.recordedMissionCount,
    completedMissionCount: report.completedMissionCount,
    skippedMissionCount: report.skippedMissionCount,
    missingMissionCount: report.missingMissionCount,
    companionEvidenceCount: report.companionEvidenceCount,
    scores: report.scores,
    suggestionSources: report.suggestions.map((suggestion) => suggestion.sourceType),
    suggestionCategories: report.suggestions.map((suggestion) => suggestion.categoryId),
    supportingEventIds: report.suggestions.map((suggestion) => suggestion.supportingEventIds),
    suggestionEvidenceLevels: report.suggestions.map((suggestion) => suggestion.evidenceLevel),
  };
}

function presentationResult(fixture) {
  const { suggestion, index, minimum_accessibility_label_length: minimumLength } = fixture.input;
  const accessibilityLabel = suggestionAccessibilityLabel(suggestion, index);
  return {
    observationPreserved: accessibilityLabel.includes(suggestion.observedInSimulation),
    rationalePreserved: accessibilityLabel.includes(suggestion.whyThisMatters),
    nextActionPreserved: accessibilityLabel.includes(suggestion.tryNext),
    allEventIdsPreserved: suggestion.supportingEventIds.every((eventId) => (
      accessibilityLabel.includes(eventId)
    )),
    evidenceBoundaryPreserved: accessibilityLabel.includes(REPORT_EVIDENCE_BOUNDARY),
    minimumLengthMet: accessibilityLabel.length >= minimumLength,
    supportingEvidenceText: supportingEvidenceText(suggestion),
  };
}

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

async function storageCorruptionResult(fixture) {
  const storage = createMemoryStorage();
  const repository = createStorageRepository(storage);
  await repository.saveProgress({
    schema: 'dog-first-alpha.v1',
    screen: 'report',
    serviceFeedbackQueue: [],
    serviceFeedbackReceipts: [],
  });
  await repository.saveFeedbackQueue([{ client_submission_id: 'CS-LH01-STORAGE' }]);
  await repository.saveFeedbackReceipts([{ client_submission_id: 'CS-LH01-STORAGE' }]);

  const keys = [];
  const hydrationStatuses = [];
  const persistenceEffectsOpened = [];
  for (const fixtureKey of fixture.input.corrupt_keys) {
    const storageKey = STORAGE_KEYS[fixtureKey];
    assert.ok(storageKey, fixture.id + ': unknown storage key ' + fixtureKey);
    const validValue = storage.values.get(storageKey);
    storage.values.set(storageKey, fixture.input.corrupt_raw_value);
    const hydration = await loadStorageHydration(repository);
    let opened = false;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      runHydratedEffect(hydration.status, () => { opened = true; });
    }
    keys.push(fixtureKey);
    hydrationStatuses.push(hydration.status);
    persistenceEffectsOpened.push(opened);
    storage.values.set(storageKey, validValue);
  }
  return { keys, hydrationStatuses, persistenceEffectsOpened };
}

function deferred() {
  let resolve;
  const promise = new Promise((complete) => { resolve = complete; });
  return { promise, resolve };
}

async function waitFor(predicate, message) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (predicate()) return;
    await Promise.resolve();
  }
  assert.fail(message);
}

async function feedbackRaceResult(fixture) {
  const first = { client_submission_id: fixture.input.initial_submission_id };
  const second = { client_submission_id: fixture.input.new_submission_id };
  const gates = [deferred(), deferred()];
  const flushSubmissionIds = [];
  const acceptedSubmissionIds = [];
  let activeFlushes = 0;
  let maxActiveFlushes = 0;
  const coordinator = createFeedbackDeliveryCoordinator({
    flush: async (queue) => {
      const callIndex = flushSubmissionIds.length;
      flushSubmissionIds.push(queue.map((item) => item.client_submission_id));
      activeFlushes += 1;
      maxActiveFlushes = Math.max(maxActiveFlushes, activeFlushes);
      const result = await gates[callIndex].promise;
      activeFlushes -= 1;
      return result;
    },
    onResult: (result) => {
      acceptedSubmissionIds.push(...result.acceptedClientSubmissionIds);
    },
  });

  const initialOperation = coordinator.request([first]);
  await waitFor(() => flushSubmissionIds.length === 1, fixture.id + ': first flush did not start');
  const overlappingOperation = coordinator.request([first]);
  const appendedOperation = coordinator.request([first, second]);
  const sharedOperation = (
    initialOperation === overlappingOperation
    && initialOperation === appendedOperation
  );

  gates[0].resolve({
    status: 'delivered',
    queue: [],
    acceptedClientSubmissionIds: [first.client_submission_id],
    receipts: [],
  });
  await waitFor(() => flushSubmissionIds.length === 2, fixture.id + ': second flush did not start');
  gates[1].resolve({
    status: 'delivered',
    queue: [],
    acceptedClientSubmissionIds: [second.client_submission_id],
    receipts: [],
  });
  await initialOperation;
  return {
    sharedOperation,
    maxActiveFlushes,
    flushSubmissionIds,
    acceptedSubmissionIds,
  };
}

export async function runFrozenRegressionFixture(fixture) {
  if (fixture.kind === 'readiness') return readinessResult(fixture);
  if (fixture.kind === 'presentation') return presentationResult(fixture);
  if (fixture.kind === 'storage_corruption') return storageCorruptionResult(fixture);
  if (fixture.kind === 'feedback_race') return feedbackRaceResult(fixture);
  throw new Error(fixture.id + ': unsupported fixture kind');
}

export function assertExpectedSubset(actual, expected, path = 'fixture') {
  if (Array.isArray(expected) || expected === null || typeof expected !== 'object') {
    assert.deepEqual(actual, expected, path);
    return;
  }
  assert.ok(actual && typeof actual === 'object', path + ': actual result must be an object');
  for (const [key, expectedValue] of Object.entries(expected)) {
    assert.ok(Object.hasOwn(actual, key), path + ': missing result key ' + key);
    assertExpectedSubset(actual[key], expectedValue, path + '.' + key);
  }
}
