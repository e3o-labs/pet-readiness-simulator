import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  COMPANION_APP_VERSION,
  COMPANION_EVIDENCE_SCHEMA,
  COMPANION_EVENTS,
  COMPANION_RULE_VERSION,
  companionEvidenceForChoice,
  createCompanionState,
  hydrateCompanionState,
  respondToCompanion,
} from '../src/companion/companionEngine.js';

const ALLOWED_CATEGORIES = new Set([
  'environment_fit',
  'care_consistency',
  'budget_readiness',
  'behavior_understanding',
  'species_knowledge',
]);
const EXPECTED_EVENT_CATEGORIES = {
  toilet_accident: ['care_consistency', 'behavior_understanding'],
  meal_request: ['care_consistency', 'species_knowledge'],
  walk_request: ['environment_fit', 'care_consistency'],
  play_request: ['care_consistency', 'species_knowledge'],
  doorbell_barking: ['environment_fit', 'behavior_understanding'],
  room_mess: ['environment_fit', 'care_consistency', 'behavior_understanding'],
  quiet_companion: ['environment_fit', 'behavior_understanding'],
};

assert.equal(COMPANION_EVIDENCE_SCHEMA, 'dog-first.companion-evidence.v1');
assert.equal(COMPANION_RULE_VERSION, '1.0.0');
assert.equal(COMPANION_APP_VERSION, '1.0.0');
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(COMPANION_APP_VERSION, packageJson.version);
assert.deepEqual(
  COMPANION_EVENTS.map((event) => event.id),
  Object.keys(EXPECTED_EVENT_CATEGORIES),
);

const ruleIds = new Set();
for (const event of COMPANION_EVENTS) {
  assert.equal(event.choices.length, 3);
  for (const choice of event.choices) {
    assert.deepEqual(
      choice.affectedCategories,
      EXPECTED_EVENT_CATEGORIES[event.id],
      `${event.id}/${choice.id} must retain its declared local category mapping`,
    );
    assert.equal(new Set(choice.affectedCategories).size, choice.affectedCategories.length);
    assert.ok(choice.affectedCategories.every((category) => ALLOWED_CATEGORIES.has(category)));

    const evidence = companionEvidenceForChoice(event.id, choice.id);
    assert.deepEqual(evidence, {
      schema: COMPANION_EVIDENCE_SCHEMA,
      eventId: event.id,
      choiceId: choice.id,
      impact: choice.impact,
      categories: EXPECTED_EVENT_CATEGORIES[event.id],
      feedback: choice.feedback,
      evidenceLevel: 'EL-SYN-INTERACTION',
      ruleEvidenceLevel: 'EL-SYN',
      ruleId: evidence.ruleId,
      ruleVersion: COMPANION_RULE_VERSION,
      appVersion: COMPANION_APP_VERSION,
    });
    assert.match(evidence.ruleId, /^RULE-[A-Z0-9-]+-001$/);
    assert.equal(ruleIds.has(evidence.ruleId), false, `${evidence.ruleId} must be unique`);
    ruleIds.add(evidence.ruleId);
  }
}
assert.equal(ruleIds.size, 21);

assert.throws(
  () => companionEvidenceForChoice('unknown_event', 'clean_and_reset'),
  /companion_response_invalid/,
);
assert.throws(
  () => companionEvidenceForChoice('toilet_accident', 'unknown_choice'),
  /companion_response_invalid/,
);

const legacy = hydrateCompanionState({
  schema: 'dog-first.companion.v3',
  appearancePresetId: 'cream_sage',
  responses: {
    toilet_accident: {
      choiceId: 'clean_and_reset',
      impact: 'risky',
      categories: ['budget_readiness'],
      evidenceLevel: 'EL-EXPERT',
    },
    meal_request: { choiceId: 'snacks_only' },
    quiet_companion: { choiceId: 'choice_from_another_event' },
    unknown_event: { choiceId: 'clean_and_reset' },
  },
});
assert.equal(legacy.schema, 'dog-first.companion.v5');
assert.equal(legacy.appearancePresetId, 'cream_sage');
assert.deepEqual(
  legacy.responses.toilet_accident,
  companionEvidenceForChoice('toilet_accident', 'clean_and_reset'),
  'Hydration must rebuild impact, categories, and evidence levels from the canonical rule',
);
assert.deepEqual(
  legacy.responses.meal_request,
  companionEvidenceForChoice('meal_request', 'snacks_only'),
);
assert.equal('quiet_companion' in legacy.responses, false);
assert.equal('unknown_event' in legacy.responses, false);

const firstResponse = respondToCompanion(
  createCompanionState(),
  'doorbell_barking',
  'create_distance',
);
const replacementResponse = respondToCompanion(
  firstResponse,
  'doorbell_barking',
  'shout_back',
);
assert.deepEqual(Object.keys(replacementResponse.responses), ['doorbell_barking']);
assert.deepEqual(
  replacementResponse.responses.doorbell_barking,
  companionEvidenceForChoice('doorbell_barking', 'shout_back'),
  'A repeated response must deterministically replace the prior evidence for that event',
);

const restored = hydrateCompanionState(replacementResponse);
assert.deepEqual(restored, replacementResponse);
assert.deepEqual(hydrateCompanionState({
  schema: 'dog-first.companion.future',
  responses: replacementResponse.responses,
}), createCompanionState());

console.log('Companion evidence passed: 21 choices map to canonical synthetic evidence and hydrate fail closed.');
