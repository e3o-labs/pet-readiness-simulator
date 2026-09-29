import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  COMPANION_APPEARANCE_PRESETS,
  COMPANION_EXPRESSION_STATES,
  COMPANION_AUDIO_SESSION_POLICY,
  CARE_MESSAGE_SCHEDULE,
  PHOTO_AVATAR_SIMULATION_SAMPLES,
  PRODUCTION_COMPANION_ASSET_ID,
  COMPANION_EVENTS,
  careMessagesForDay,
  companionEventForDay,
  companionExpressionFor,
  companionMotionEnabled,
  companionSoundCanPlay,
  companionPresetById,
  createCompanionState,
  completeCareMessage,
  hydrateCompanionState,
  photoAvatarSampleById,
  registerPhotoAvatarSimulation,
  removePhotoAvatarSimulation,
  respondToCompanion,
  selectCompanionPreset,
  setCompanionSoundEnabled,
  startCareSchedule,
} from '../src/companion/companionEngine.js';

for (const required of ['uncertain', 'waiting', 'eager', 'playful', 'alert', 'resting', 'reassured', 'attentive', 'concerned']) {
  assert.ok(COMPANION_EXPRESSION_STATES[required], `Missing expression state: ${required}`);
  assert.ok(COMPANION_EXPRESSION_STATES[required].moodLabel);
  assert.ok(COMPANION_EXPRESSION_STATES[required].motionId);
}

assert.equal(COMPANION_APPEARANCE_PRESETS.length, 3);
assert.equal(new Set(COMPANION_APPEARANCE_PRESETS.map((preset) => preset.id)).size, 3);
for (const preset of COMPANION_APPEARANCE_PRESETS) {
  assert.equal(preset.derivationMethod, 'owner_selected');
  assert.ok(preset.label);
  assert.match(preset.colors.face, /^#[0-9A-F]{6}$/);
  assert.match(preset.colors.body, /^#[0-9A-F]{6}$/);
  assert.match(preset.colors.accent, /^#[0-9A-F]{6}$/);
}

assert.equal(COMPANION_EVENTS.length, 7);
assert.deepEqual(COMPANION_EVENTS.map((event) => event.day), [1, 2, 3, 4, 5, 6, 7]);
for (const required of ['toilet_accident', 'doorbell_barking', 'room_mess', 'quiet_companion']) assert.ok(COMPANION_EVENTS.some((event) => event.id === required), `Missing life event: ${required}`);
for (const event of COMPANION_EVENTS) {
  assert.equal(event.choices.length, 3);
  assert.ok(event.choices.some((choice) => choice.impact === 'safe'));
  assert.ok(event.choices.some((choice) => choice.impact === 'risky'));
  assert.equal(companionExpressionFor(event).id, event.visualState);
}
assert.equal(companionExpressionFor(companionEventForDay(5)).id, 'alert');
assert.equal(companionExpressionFor(companionEventForDay(7)).id, 'resting');
assert.equal(companionExpressionFor(companionEventForDay(5), { impact: 'safe' }).id, 'reassured');
assert.equal(companionExpressionFor(companionEventForDay(5), { impact: 'needs_review' }).id, 'attentive');
assert.equal(companionExpressionFor(companionEventForDay(5), { impact: 'risky' }).id, 'concerned');
assert.equal(companionMotionEnabled('happy_bounce', false), true);
assert.equal(companionMotionEnabled('happy_bounce', true), false);
assert.equal(companionMotionEnabled('still_low', false), false);
assert.deepEqual(COMPANION_AUDIO_SESSION_POLICY, {
  playsInSilentMode: false,
  shouldPlayInBackground: false,
  interruptionMode: 'mixWithOthers',
});
assert.equal(PRODUCTION_COMPANION_ASSET_ID, 'DOGFIRST-CODE-NATIVE-V1');
const state = createCompanionState();
assert.equal(state.schema, 'dog-first.companion.v5');
assert.equal(state.appearancePresetId, 'warm_caramel');
assert.equal(state.soundEnabled, false);
assert.deepEqual(state.careResponses, {});
assert.equal(companionSoundCanPlay(state, companionEventForDay(5), true), false);
const soundEnabled = setCompanionSoundEnabled(state, true);
assert.equal(soundEnabled.soundEnabled, true);
assert.equal(companionSoundCanPlay(soundEnabled, companionEventForDay(5), false), false);
assert.equal(companionSoundCanPlay(soundEnabled, companionEventForDay(5), true), true);
assert.equal(companionSoundCanPlay(soundEnabled, companionEventForDay(2), true), false);
const selected = selectCompanionPreset(state, 'cream_sage');
assert.equal(selected.appearancePresetId, 'cream_sage');
assert.equal(state.appearancePresetId, 'warm_caramel');
assert.equal(companionPresetById('cream_sage').label, '포근한 크림');
assert.throws(() => selectCompanionPreset(state, 'unknown'), /companion_preset_invalid/);
const migrated = hydrateCompanionState({ schema: 'dog-first.companion.v0', responses: { meal_request: { choiceId: 'measure_meal' } } });
assert.equal(migrated.schema, 'dog-first.companion.v5');
assert.equal(migrated.appearancePresetId, 'warm_caramel');
assert.equal(migrated.soundEnabled, false);
assert.equal(migrated.responses.meal_request.choiceId, 'measure_meal');
const bark = companionEventForDay(5);
const answered = respondToCompanion(selected, bark.id, 'create_distance');
assert.equal(answered.responses.doorbell_barking.impact, 'safe');
assert.equal(answered.responses.doorbell_barking.evidenceLevel, 'EL-SYN-INTERACTION');
assert.equal(answered.appearancePresetId, 'cream_sage');
const recoloredAfterResponse = selectCompanionPreset(answered, 'charcoal_socks');
assert.equal(recoloredAfterResponse.appearancePresetId, 'charcoal_socks');
assert.equal(recoloredAfterResponse.responses.doorbell_barking.choiceId, 'create_distance');
const repaired = hydrateCompanionState({ schema: 'dog-first.companion.v1', appearancePresetId: 'removed_future_preset', responses: answered.responses });
assert.equal(repaired.appearancePresetId, 'warm_caramel');
assert.equal(repaired.responses.doorbell_barking.choiceId, 'create_distance');
assert.equal(PHOTO_AVATAR_SIMULATION_SAMPLES.length, 2);
assert.equal(photoAvatarSampleById('camera_window_walk').source, 'camera');
assert.equal(photoAvatarSampleById('library_cushion_rest').source, 'library');
assert.equal(photoAvatarSampleById('missing'), null);
const photoRegistered = registerPhotoAvatarSimulation(answered, 'camera_window_walk');
assert.equal(photoRegistered.photoAvatarId, 'camera_window_walk');
assert.equal(photoRegistered.responses.doorbell_barking.choiceId, 'create_distance');
assert.throws(() => registerPhotoAvatarSimulation(state, 'missing'), /photo_avatar_simulation_invalid/);
assert.equal(removePhotoAvatarSimulation(photoRegistered).photoAvatarId, null);
assert.equal(CARE_MESSAGE_SCHEDULE.length, 21);
for (let day = 1; day <= 7; day += 1) assert.equal(careMessagesForDay(day).length, 3, `Day ${day} needs three care messages`);
for (const kind of ['meal', 'water', 'toilet', 'clean', 'walk', 'play', 'rest', 'settle', 'enrichment']) assert.ok(CARE_MESSAGE_SCHEDULE.some((message) => message.kind === kind), `Missing ${kind} message`);
const day3AtWalkTime = new Date(2026, 7, 5, 8, 0, 0, 0);
const scheduledPhoto = startCareSchedule(photoRegistered, day3AtWalkTime, 3);
const caredFor = completeCareMessage(scheduledPhoto, 'day3_walk', day3AtWalkTime);
assert.deepEqual(caredFor.careResponses.day3_walk, {
  status: 'completed',
  completed: true,
  scheduledTime: '08:00',
  windowEndTime: '14:30',
  completedLocalMinute: 480,
  evidenceLevel: 'EL-SYN-INTERACTION',
});
assert.equal(caredFor.photoAvatarId, 'camera_window_walk');
const restoredPhotoAndCare = hydrateCompanionState(caredFor);
assert.equal(restoredPhotoAndCare.photoAvatarId, 'camera_window_walk');
assert.deepEqual(restoredPhotoAndCare.careResponses.day3_walk, caredFor.careResponses.day3_walk);
assert.throws(() => completeCareMessage(state, 'missing'), /care_message_invalid/);
assert.equal(Object.keys(state.responses).length, 0);
assert.throws(() => respondToCompanion(state, bark.id, 'unknown'), /companion_response_invalid/);
const appSource = await readFile(new URL('../App.js', import.meta.url), 'utf8');
const panelSource = await readFile(new URL('../src/companion/CompanionPanel.js', import.meta.url), 'utf8');
const photoPanelSource = await readFile(new URL('../src/companion/PhotoAvatarPanel.js', import.meta.url), 'utf8');
const inboxSource = await readFile(new URL('../src/companion/CareMessageInbox.js', import.meta.url), 'utf8');
const audioRegister = JSON.parse(await readFile(new URL('./fixtures/audio-asset-register.json', import.meta.url), 'utf8'));
assert.equal(audioRegister.assets.length, 1);
assert.equal(audioRegister.assets[0].id, 'AUDIO-BARK-001');
assert.equal(audioRegister.assets[0].rights_status, 'public_domain_verified');
assert.equal(audioRegister.assets[0].sha256, '699b691884c647feabf561cba932fdbad820835c6e4b1ce38f2105e60c8fabcf');
for (const marker of ['CompanionMissionScreen', 'companionEventForDay', 'respondToCompanion', 'completeCareMessage', 'registerPhotoAvatarSimulation']) assert.ok(appSource.includes(marker));
for (const marker of ['오늘 곁에 있는 강아지', '생활 사건과 대응', '함께할 모습은 설정에서 바꿔요', '멍! 멍!', '가상 강아지 상태', '선택한 대응을 바탕으로 오늘의 돌봄을 돌아봐요.', 'Animated', 'AccessibilityInfo', 'reduceMotion', '지금 기분', 'useAudioPlayer', 'useAudioPlayerStatus', '소리 꺼짐', '직접 눌러 재생', '짖음 재생 중', '짖음 재생 완료', 'groundShadow', 'innerEar', 'muzzle', 'chestPatch', 'browRow']) assert.ok(panelSource.includes(marker));
for (const marker of ['사진 예시 · 체험', '사진 예시 선택', '실제 카메라나 사진 보관함은 열지 않으며', '사진 예시 지우기']) assert.ok(photoPanelSource.includes(marker));
for (const marker of ['오늘의 강아지 요청', '지금 강아지가 원하는 것', '오늘 루틴', '표시된 시간이 되어야 기록할 수 있어요', '완료 가능 시간이 끝나면 놓침으로 기록됩니다.']) assert.ok(inboxSource.includes(marker));
console.log('Companion experience passed: seven daily requests include barking, toilet, mess, rest, safe/risky choices, and a code-native dog visual.');
