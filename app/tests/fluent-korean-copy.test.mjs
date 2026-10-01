import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PHOTO_AVATAR_SIMULATION_SAMPLES } from '../src/companion/companionEngine.js';

const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
const photoPanelSource = await readFile(new URL('../src/companion/PhotoAvatarPanel.js', import.meta.url), 'utf8');
const companionPanelSource = await readFile(new URL('../src/companion/CompanionPanel.js', import.meta.url), 'utf8');
const missionSource = await readFile(new URL('../src/companion/CompanionMissionScreen.js', import.meta.url), 'utf8');
const inboxSource = await readFile(new URL('../src/companion/CareMessageInbox.js', import.meta.url), 'utf8');

for (const marker of [
  '연습 프로필 살펴보기',
  '7일 준비 리포트',
  '이 기기에 저장됩니다.',
]) assert.ok(appSource.includes(marker), `Missing reviewed launch copy: ${marker}`);

for (const marker of [
  '사진 예시 · 체험',
  '사진 예시 선택',
  '앱에서 제공하는 사진 예시를 고르는 체험입니다.',
  '실제 카메라나 사진 보관함은 열지 않으며',
  '이 선택은 앱 내 체험용 예시이며 실제 사진을 등록하지 않습니다.',
]) assert.ok(photoPanelSource.includes(marker), `Missing clear photo-simulation copy: ${marker}`);

for (const staleMarker of ['사진 등록 체험 시작', '방금 촬영한 것처럼', '기존 사진에서 고른 것처럼', '사진 등록 취소']) {
  assert.equal(photoPanelSource.includes(staleMarker), false, `Ambiguous launch copy remains: ${staleMarker}`);
}

for (const marker of ['나란히 · 오늘 곁의 강아지', '오늘의 생활 장면', '설정 · 함께할 모습']) assert.ok(companionPanelSource.includes(marker));
for (const marker of ['오늘의 되돌아보기', '오늘의 돌봄 순서', '돌봄 지속성 조정 -2']) assert.ok((missionSource + inboxSource).includes(marker));
assert.equal(missionSource.includes('DAY {day} OF 7'), false, 'The day-progress label must remain Korean-first.');

assert.deepEqual(PHOTO_AVATAR_SIMULATION_SAMPLES.map((sample) => sample.sourceLabel), ['창가 사진 예시 보기', '휴식 사진 예시 보기']);
assert.deepEqual(PHOTO_AVATAR_SIMULATION_SAMPLES.map((sample) => sample.label), ['창가 사진 예시', '휴식 사진 예시']);

console.log('Fluent Korean launch copy passed: terminology is clear, Korean-first, and explicit about the non-camera photo simulation.');
