import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DOG_PROFILES } from '../src/content/dogProfiles.js';
import {
  COMPANION_EVENTS,
  companionEvidenceForChoice,
} from '../src/companion/companionEngine.js';
import { calculateReadiness } from '../src/core/readiness.js';
import {
  REPORT_EVIDENCE_BOUNDARY,
  suggestionAccessibilityLabel,
  supportingEvidenceText,
} from '../src/report/reportPresentation.js';

assert.equal(
  REPORT_EVIDENCE_BOUNDARY,
  '합성 시뮬레이션 근거(EL-SYN) · 실제 사용자·전문가·법률 검토 아님',
);

const completed = Array.from(
  { length: 7 },
  (_, index) => ({ day: index + 1, state: 'completed' }),
);

const recordedSuggestion = {
  sourceType: 'recorded_choice',
  observedInSimulation: '생활 조건과 관련해 다시 살펴볼 2개의 선택이 기록됐어요.',
  whyThisMatters: '소리를 키우면 긴장이 커질 수 있어요.',
  tryNext: '잠깐 거리를 두고 차분해진 순간을 기다린다',
  supportingEventIds: ['doorbell_barking', 'loud_noise_fear'],
};

assert.equal(
  supportingEvidenceText(recordedSuggestion),
  '근거 기록 ID · doorbell_barking · loud_noise_fear',
);
assert.equal(
  supportingEvidenceText({ sourceType: 'profile_context', supportingEventIds: [] }),
  '보조 맥락 · 선택한 가상 프로필',
);
assert.equal(
  supportingEvidenceText({ sourceType: 'general_context', supportingEventIds: [] }),
  '일반 확인 맥락 · 시뮬레이션 밖에서 확인할 항목',
);
assert.equal(
  suggestionAccessibilityLabel(recordedSuggestion, 0),
  [
    '제안 1',
    '시뮬레이션에서 본 점. 생활 조건과 관련해 다시 살펴볼 2개의 선택이 기록됐어요.',
    '왜 살펴보나요. 소리를 키우면 긴장이 커질 수 있어요.',
    '다음에 해 볼 일. 잠깐 거리를 두고 차분해진 순간을 기다린다',
    '근거 기록 ID · doorbell_barking · loud_noise_fear',
    REPORT_EVIDENCE_BOUNDARY,
  ].join('. '),
);

const forbiddenCopyPatterns = [
  /진단(?:합니다|했어요|됨|이다|입니다)/,
  /입양\s*(?:승인|거절|가능|적합|부적합)/,
  /반드시.{0,20}(?:교정|고쳐|해결)/,
  /(?:교정|치료|결과).{0,12}보장/,
  /(?:당신|보호자).{0,20}(?:잘못|탓|책임)/,
  /(?:게임\s*오버|탈락|자격\s*없음|벌점)/,
  /\d+(?:\.\d+)?%/,
];

const reports = [
  calculateReadiness(completed),
  ...DOG_PROFILES.map((profile) => calculateReadiness(completed, profile)),
  ...COMPANION_EVENTS.flatMap((event) => event.choices.map((choice) => calculateReadiness(
    completed,
    undefined,
    undefined,
    {
      [event.id]: companionEvidenceForChoice(event.id, choice.id),
    },
  ))),
];

for (const report of reports) {
  assert.equal(report.suggestions.length, 3);
  for (const suggestion of report.suggestions) {
    assert.ok(suggestion.observedInSimulation.trim());
    assert.ok(suggestion.whyThisMatters.trim());
    assert.ok(suggestion.tryNext.trim());
    assert.equal(suggestion.evidenceLevel, 'EL-SYN');
    assert.ok(Array.isArray(suggestion.supportingEventIds));
    if (suggestion.sourceType !== 'recorded_choice') {
      assert.deepEqual(suggestion.supportingEventIds, []);
    }
    const visibleCopy = [
      suggestion.observedInSimulation,
      suggestion.whyThisMatters,
      suggestion.tryNext,
    ].join(' ');
    for (const pattern of forbiddenCopyPatterns) {
      assert.doesNotMatch(visibleCopy, pattern);
    }
  }
}

const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
for (const marker of [
  'score.suggestions.map',
  'suggestion.observedInSimulation',
  'suggestion.whyThisMatters',
  'suggestion.tryNext',
  'supportingEvidenceText(suggestion)',
  'suggestionAccessibilityLabel(suggestion, index)',
  '시뮬레이션에서 본 점',
  '왜 살펴보나요',
  '다음에 해 볼 일',
  'REPORT_EVIDENCE_BOUNDARY',
]) {
  assert.ok(appSource.includes(marker), `App report is missing: ${marker}`);
}
assert.doesNotMatch(appSource, /score\.improvements\.map/);

console.log('Explainable report passed: visible traceability, bounded evidence labels, accessibility, and safe copy are enforced.');
