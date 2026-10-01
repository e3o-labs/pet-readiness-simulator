import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  profileRecommendationContext,
  profileSizeLabel,
  recommendProfiles,
} from '../src/content/dogProfiles.js';

const longAbsenceOnboarding = {
  household: 'single',
  home: 'apartment',
  weekdayHours: '8',
  budget: 'medium',
  experience: 'first',
  preference: 'calm',
  confidence: 'careful',
};

const longAbsenceContext = profileRecommendationContext(longAbsenceOnboarding);
assert.deepEqual(longAbsenceContext.conditions, [
  '1인 가구',
  '아파트·공동주택',
  '평일 최대 8시간 외출',
  '기본 비용 준비',
]);
assert.equal(longAbsenceContext.practiceReasons.length, 2);
assert.match(longAbsenceContext.practiceReasons[0], /혼자 있는 시간과 대체 돌봄/);
assert.match(longAbsenceContext.practiceReasons[1], /첫 반려견/);
assert.equal(recommendProfiles(longAbsenceOnboarding)[0].id, 'DOG_APP_D02');

const budgetContext = profileRecommendationContext({
  ...longAbsenceOnboarding,
  weekdayHours: '4',
  budget: 'low',
  experience: 'some',
  household: 'family',
});
assert.match(budgetContext.practiceReasons[0], /정기 비용과 예상 밖 지출/);
assert.match(budgetContext.practiceReasons[1], /가족·동거인과 역할/);

for (const text of [...longAbsenceContext.conditions, ...longAbsenceContext.practiceReasons]) {
  assert.doesNotMatch(text, /(?:_risk|alone_time|budget_gap|routine_gap)/);
}

assert.equal(profileSizeLabel('small'), '소형');
assert.equal(profileSizeLabel('medium'), '중형');
assert.equal(profileSizeLabel('large'), '대형');
assert.equal(profileSizeLabel('variable'), '크기 다양');

const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
for (const marker of [
  'profileRecommendationContext(onboarding)',
  '내가 알려준 생활 조건',
  '7일 동안 살펴볼 점',
  '생활 조건 수정',
  '알려주신 생활 조건을 바탕으로 연습하며, 입양 적합성을 판정하지 않습니다.',
  '이 강아지와 7일 시작하기 ↗',
]) {
  assert.ok(appSource.includes(marker), `Profile selection is missing: ${marker}`);
}
assert.doesNotMatch(appSource, /item\.tags\.map/);
assert.doesNotMatch(appSource, /tag\.replace/);
assert.doesNotMatch(appSource, /item\.size\.toUpperCase/);

console.log('Profile recommendation context passed: conditions, practice reasons, edit path, safe boundary, and Korean labels are enforced.');
