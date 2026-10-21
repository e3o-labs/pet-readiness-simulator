import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  READINESS_LEARNING_CARDS,
  READINESS_LEARNING_RUNTIME_ENABLED,
  READINESS_LEARNING_RUNTIME_STATUS,
  learningCardForDay,
  isPublishedLearningCard,
} from '../src/content/readinessLearning.js';

assert.equal(READINESS_LEARNING_CARDS.length, 7, 'Exactly one learning card is required for each simulation day.');
assert.deepEqual(READINESS_LEARNING_CARDS.map((card) => card.day), [1, 2, 3, 4, 5, 6, 7]);
assert.equal(new Set(READINESS_LEARNING_CARDS.map((card) => card.id)).size, 7, 'Learning card ids must be unique.');

for (const card of READINESS_LEARNING_CARDS) {
  assert.ok(card.title.length >= 8, `Day ${card.day} needs a meaningful title.`);
  assert.ok(card.summary.length >= 20, `Day ${card.day} needs a useful summary.`);
  assert.ok(card.why.length >= 20, `Day ${card.day} needs an explanation.`);
  assert.ok(card.tryToday.length >= 15, `Day ${card.day} needs an actionable practice.`);
  assert.ok(Array.isArray(card.watchFor) && card.watchFor.length >= 3, `Day ${card.day} needs observation cues.`);
  assert.ok(card.boundary.length >= 20, `Day ${card.day} needs a safety boundary.`);
  assert.ok(card.reviewStatus, `Day ${card.day} needs an explicit review status.`);
  assert.ok(card.evidenceStatus, `Day ${card.day} needs an explicit evidence status.`);
}

assert.equal(learningCardForDay(1)?.id, 'learning-day-1-alone-time');
assert.equal(learningCardForDay(7)?.id, 'learning-day-7-reflection');
assert.equal(learningCardForDay(8), null);

for (const day of [1, 2, 4, 5, 6]) {
  const card = learningCardForDay(day);
  assert.equal(card?.evidenceStatus, 'source_verified', `Day ${day} must keep its resolved evidence mapping.`);
}
assert.notEqual(learningCardForDay(2)?.evidenceStatus, 'source_gap', 'Day 2 source gap must not regress.');
assert.notEqual(learningCardForDay(5)?.evidenceStatus, 'source_gap', 'Day 5 source gap must not regress.');

assert.equal(READINESS_LEARNING_RUNTIME_ENABLED, true);
for (const card of READINESS_LEARNING_CARDS) {
  assert.equal(card.publicationStatus, 'enabled');
  if (card.day < 7) assert.ok(card.sources.length > 0 && card.sources.every(source => source.url.startsWith('https://')));
}
assert.equal(READINESS_LEARNING_RUNTIME_STATUS, 'source_reviewed');

const missionSource = await readFile(new URL('../src/companion/CompanionMissionScreen.js', import.meta.url), 'utf8');
for (const marker of ['배움', '오늘 알아둘 1가지', 'LearningArticle']) {
  assert.ok(missionSource.includes(marker), `Learning UI scaffold marker missing: ${marker}`);
}
assert.ok(missionSource.includes('READINESS_LEARNING_RUNTIME_ENABLED'), 'Learning UI must be protected by the runtime evidence gate.');
assert.ok(missionSource.includes('learningCardForDay(day)'), 'Daily learning content must follow the current simulation day.');
assert.ok(missionSource.includes("tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingVertical: 10 }"), 'Gated learning must preserve the current three-tab spacing.');
assert.ok(missionSource.includes("tabText: { color: '#49634F', fontWeight: '800', fontSize: 14 }"), 'Gated learning must preserve the current three-tab label size.');

console.log('Readiness learning content passed: seven lessons, source links, publication gating and shared article integration are intact.');

assert.equal(isPublishedLearningCard({ ...READINESS_LEARNING_CARDS[0], sources: [] }), false, 'Unverified factual content must not publish without a source.');
assert.equal(isPublishedLearningCard({ ...READINESS_LEARNING_CARDS[0], publicationStatus: 'draft' }), false);
assert.equal(isPublishedLearningCard({ ...READINESS_LEARNING_CARDS[0], reviewStatus: 'research_candidate' }), false);
assert.equal(isPublishedLearningCard(READINESS_LEARNING_CARDS[6]), true, 'The explicit product reflection activity has no clinical claim.');
