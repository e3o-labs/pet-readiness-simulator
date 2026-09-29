import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DOG_PROFILES } from '../src/content/dogProfiles.js';
import {
  COMPANION_EVENTS,
  companionEvidenceForChoice,
} from '../src/companion/companionEngine.js';
import { calculateReadiness } from '../src/core/readiness.js';

const completed = Array.from(
  { length: 7 },
  (_, index) => ({ day: index + 1, state: 'completed' }),
);

function responsesFor(entries) {
  return Object.fromEntries(entries.map(([eventId, choiceId]) => [
    eventId,
    companionEvidenceForChoice(eventId, choiceId),
  ]));
}

const riskyToiletResponses = responsesFor([
  ['toilet_accident', 'scold'],
]);
const riskyToilet = calculateReadiness(
  completed,
  undefined,
  undefined,
  riskyToiletResponses,
);
assert.deepEqual(riskyToilet.scores, {
  environment_fit: 100,
  care_consistency: 88,
  budget_readiness: 100,
  behavior_understanding: 88,
  species_knowledge: 100,
});
assert.equal(riskyToilet.companionEvidenceCount, 1);
assert.deepEqual(riskyToilet.categoryEvidenceCounts, {
  environment_fit: 0,
  care_consistency: 1,
  budget_readiness: 0,
  behavior_understanding: 1,
  species_knowledge: 0,
});
assert.deepEqual(
  riskyToilet.suggestions.map((suggestion) => suggestion.categoryId),
  ['care_consistency', 'behavior_understanding', null],
);
for (const suggestion of riskyToilet.suggestions.slice(0, 2)) {
  assert.equal(suggestion.sourceType, 'recorded_choice');
  assert.deepEqual(suggestion.supportingEventIds, ['toilet_accident']);
  assert.deepEqual(suggestion.supportingChoiceIds, ['scold']);
  assert.equal(suggestion.evidenceCount, 1);
  assert.deepEqual(suggestion.impactCounts, { needs_review: 0, risky: 1 });
  assert.match(suggestion.observedInSimulation, /1개의 선택/);
  assert.match(suggestion.whyThisMatters, /혼내면/);
  assert.equal(suggestion.tryNext, '조용히 치우고 배변 장소를 다시 알려준다');
  assert.equal(suggestion.evidenceLevel, 'EL-SYN');
}
assert.equal(riskyToilet.suggestions[2].sourceType, 'general_context');
assert.deepEqual(
  riskyToilet.improvements,
  riskyToilet.suggestions.map((suggestion) => suggestion.tryNext),
);

const repeatedEvidence = calculateReadiness(
  completed,
  undefined,
  undefined,
  responsesFor([
    ['toilet_accident', 'scold'],
    ['doorbell_barking', 'shout_back'],
  ]),
);
assert.deepEqual(
  repeatedEvidence.suggestions.map((suggestion) => suggestion.categoryId),
  ['behavior_understanding', 'environment_fit', 'care_consistency'],
  'Repeated and higher-impact evidence must rank before the fixed category order',
);
assert.deepEqual(
  repeatedEvidence.suggestions[0].supportingEventIds,
  ['toilet_accident', 'doorbell_barking'],
);
assert.deepEqual(
  repeatedEvidence.suggestions[0].supportingChoiceIds,
  ['scold', 'shout_back'],
);
assert.equal(repeatedEvidence.suggestions[0].evidenceCount, 2);

const tiedEvidence = calculateReadiness(
  completed,
  undefined,
  undefined,
  responsesFor([['doorbell_barking', 'shout_back']]),
);
assert.deepEqual(
  tiedEvidence.suggestions.slice(0, 2).map((suggestion) => suggestion.categoryId),
  ['environment_fit', 'behavior_understanding'],
  'Exact ties must follow the stable readiness category order',
);

const profile = DOG_PROFILES.find((item) => item.id === 'DOG_APP_D02');
const evidenceBeforeProfile = calculateReadiness(
  completed,
  profile,
  undefined,
  riskyToiletResponses,
);
assert.deepEqual(
  evidenceBeforeProfile.suggestions.map((suggestion) => suggestion.sourceType),
  ['recorded_choice', 'recorded_choice', 'profile_context'],
);
assert.deepEqual(evidenceBeforeProfile.suggestions[2].supportingEventIds, []);

const profileOnly = calculateReadiness(completed, profile);
assert.ok(profileOnly.suggestions.every((suggestion) => suggestion.sourceType === 'profile_context'));
assert.ok(profileOnly.suggestions.every((suggestion) => suggestion.supportingEventIds.length === 0));

const safeEvidence = calculateReadiness(
  completed,
  undefined,
  undefined,
  responsesFor([['toilet_accident', 'clean_and_reset']]),
);
assert.ok(Object.values(safeEvidence.scores).every((score) => score === 100));
assert.equal(safeEvidence.companionEvidenceCount, 1);
assert.equal(safeEvidence.suggestions[0].sourceType, 'general_context');

const tamperedEvidence = {
  toilet_accident: {
    ...companionEvidenceForChoice('toilet_accident', 'clean_and_reset'),
    impact: 'risky',
    categories: ['budget_readiness'],
    evidenceLevel: 'EL-EXPERT',
  },
  unknown_event: {
    choiceId: 'scold',
    impact: 'risky',
    categories: ['budget_readiness'],
  },
};
const canonicalizedTampered = calculateReadiness(
  completed,
  undefined,
  undefined,
  tamperedEvidence,
);
assert.deepEqual(canonicalizedTampered.scores, safeEvidence.scores);
assert.equal(canonicalizedTampered.companionEvidenceCount, 1);
assert.equal(canonicalizedTampered.categoryEvidenceCounts.budget_readiness, 0);

const allRiskyResponses = responsesFor(COMPANION_EVENTS.map((event) => [
  event.id,
  event.choices.find((choice) => choice.impact === 'risky').id,
]));
const allRisky = calculateReadiness(completed, profile, { impact: 'risky' }, allRiskyResponses);
assert.ok(allRisky.overall >= 0 && allRisky.overall <= 100);
assert.ok(Object.values(allRisky.scores).every((score) => score >= 0 && score <= 100));
assert.deepEqual(
  calculateReadiness(completed, profile, { impact: 'risky' }, allRiskyResponses),
  allRisky,
  'The same evidence must always produce the same ranking and scores',
);

const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
assert.match(
  appSource,
  /calculateReadiness\(state\.logs, profile, state\.eventResponse, state\.companion\.responses, state\.companion\.careResponses\)/,
);
assert.match(
  appSource,
  /\[state\.logs, profile, state\.eventResponse, state\.companion\.responses, state\.companion\.careResponses\]/,
);

console.log('Evidence-first readiness passed: category-local scores, traceable suggestions, and stable ordering are deterministic.');
