export const COMPANION_APPEARANCE_PRESETS = [
  {
    id: 'warm_caramel',
    label: '따뜻한 카라멜',
    shortLabel: '카라멜',
    description: '둥근 귀와 포근한 갈색 털',
    derivationMethod: 'owner_selected',
    earShape: 'drop',
    tailShape: 'curled',
    markingPattern: 'solid',
    colors: { face: '#C89B70', body: '#B9865D', accent: '#E3C39F', ear: '#8E684C' },
  },
  {
    id: 'cream_sage',
    label: '포근한 크림',
    shortLabel: '크림',
    description: '반듯한 귀와 밝은 크림 털',
    derivationMethod: 'owner_selected',
    earShape: 'upright',
    tailShape: 'feathered',
    markingPattern: 'two_tone',
    colors: { face: '#E8D8B9', body: '#D7C29D', accent: '#F5EBD7', ear: '#B69D76' },
  },
  {
    id: 'charcoal_socks',
    label: '차분한 먹빛',
    shortLabel: '먹빛',
    description: '살짝 접힌 귀와 밝은 양말 무늬',
    derivationMethod: 'owner_selected',
    earShape: 'semi_upright',
    tailShape: 'straight',
    markingPattern: 'masked',
    colors: { face: '#6E706B', body: '#565A55', accent: '#E6DDCB', ear: '#444842' },
  },
];

export const DEFAULT_COMPANION_PRESET_ID = 'warm_caramel';
export const PRODUCTION_COMPANION_ASSET_ID = 'DOGFIRST-CODE-NATIVE-V1';
export const COMPANION_EVIDENCE_SCHEMA = 'dog-first.companion-evidence.v1';
export const COMPANION_RULE_VERSION = '1.0.0';
export const COMPANION_APP_VERSION = '1.0.0';

export const PHOTO_AVATAR_SIMULATION_SAMPLES = [
  {
    id: 'camera_window_walk',
    source: 'camera',
    sourceLabel: '창가 사진 예시 보기',
    label: '창가 사진 예시',
    shortLabel: '창가 사진',
    description: '앱에서 제공하는 창가 사진 예시를 고르는 체험',
    colors: { background: '#CBD9D2', floor: '#E8DFCC', body: '#B9855A', face: '#D3A676', ear: '#845F46', accent: '#F1D9B8' },
  },
  {
    id: 'library_cushion_rest',
    source: 'library',
    sourceLabel: '휴식 사진 예시 보기',
    label: '휴식 사진 예시',
    shortLabel: '휴식 사진',
    description: '앱에서 제공하는 휴식 사진 예시를 고르는 체험',
    colors: { background: '#D9D8C8', floor: '#E9E1D2', body: '#696B65', face: '#797B74', ear: '#4C504B', accent: '#EEE4D2' },
  },
];

export const CARE_MESSAGE_SCHEDULE = [
  { id: 'day1_breakfast', day: 1, time: '07:10', kind: 'meal', title: '아침 밥을 기다리고 있어요', message: '첫날이에요. 정해 둔 양을 천천히 확인해 주세요.', actionLabel: '밥 주기', completedMessage: '아침 식사를 챙겼어요.' },
  { id: 'day1_toilet', day: 1, time: '10:40', kind: 'toilet', title: '배변 장소를 찾고 있어요', message: '실수하기 전에 조용히 정한 장소로 안내해 주세요.', actionLabel: '배변 자리 안내', completedMessage: '배변 자리를 다시 알려줬어요.' },
  { id: 'day1_rest', day: 1, time: '21:20', kind: 'rest', title: '오늘 쉴 자리를 정해 주세요', message: '낯선 하루 뒤에는 조용하고 안전한 휴식 자리가 필요해요.', actionLabel: '휴식 자리 만들기', completedMessage: '편안한 휴식 자리를 만들었어요.' },
  { id: 'day2_breakfast', day: 2, time: '07:30', kind: 'meal', title: '아침 밥과 물을 확인해 주세요', message: '사료 양을 확인하고 깨끗한 물도 함께 준비해 주세요.', actionLabel: '밥과 물 준비', completedMessage: '밥과 물을 준비했어요.' },
  { id: 'day2_toilet', day: 2, time: '12:15', kind: 'toilet', title: '다시 화장실에 가고 싶어요', message: '식사 뒤 신호를 놓치지 않고 천천히 안내해 주세요.', actionLabel: '배변 자리 안내', completedMessage: '배변 신호에 맞춰 안내했어요.' },
  { id: 'day2_clean', day: 2, time: '20:10', kind: 'clean', title: '배변 자리를 정리해 주세요', message: '냄새가 남지 않게 치우고 다음 성공을 준비해 주세요.', actionLabel: '배변 치우기', completedMessage: '배변 자리를 깨끗이 정리했어요.' },
  { id: 'day3_walk', day: 3, time: '08:00', kind: 'walk', title: '밖에 나갈 준비가 됐어요', message: '짧아도 괜찮아요. 오늘 가능한 산책 시간을 정해 주세요.', actionLabel: '산책 시작하기', completedMessage: '오늘의 산책을 시작했어요.' },
  { id: 'day3_water', day: 3, time: '14:30', kind: 'water', title: '물그릇을 확인해 주세요', message: '산책 뒤에는 깨끗한 물을 마실 수 있어야 해요.', actionLabel: '물 갈아주기', completedMessage: '깨끗한 물로 갈아줬어요.' },
  { id: 'day3_toilet', day: 3, time: '21:00', kind: 'toilet', title: '잠들기 전 마지막 배변 시간이에요', message: '오늘 밤을 편안히 보내도록 한 번 더 밖이나 정한 자리로 가요.', actionLabel: '마지막 배변 안내', completedMessage: '잠들기 전 배변 시간을 챙겼어요.' },
  { id: 'day4_breakfast', day: 4, time: '07:20', kind: 'meal', title: '오늘도 밥 시간이에요', message: '전날과 같은 기준으로 먹는 양을 확인해 주세요.', actionLabel: '밥 주기', completedMessage: '정한 양으로 밥을 줬어요.' },
  { id: 'day4_play', day: 4, time: '16:10', kind: 'play', title: '잠깐 같이 놀고 싶어요', message: '10분이라도 안전한 장난감으로 에너지를 풀어 주세요.', actionLabel: '놀이 시작하기', completedMessage: '짧고 안전한 놀이를 했어요.' },
  { id: 'day4_toilet', day: 4, time: '20:40', kind: 'toilet', title: '놀이 뒤 배변 신호예요', message: '흥분이 가라앉은 뒤 차분히 배변 자리를 안내해 주세요.', actionLabel: '배변 자리 안내', completedMessage: '놀이 뒤 배변 자리를 안내했어요.' },
  { id: 'day5_walk', day: 5, time: '07:50', kind: 'walk', title: '아침 산책을 기다려요', message: '사람과 소리를 마주칠 수 있으니 천천히 주변을 살펴요.', actionLabel: '산책 준비하기', completedMessage: '아침 산책을 준비했어요.' },
  { id: 'day5_meal', day: 5, time: '13:00', kind: 'meal', title: '점심 간식은 계획 안에 있나요?', message: '간식도 오늘의 총 급여량 안에서 확인해 주세요.', actionLabel: '급여 계획 확인', completedMessage: '간식과 급여 계획을 확인했어요.' },
  { id: 'day5_settle', day: 5, time: '20:30', kind: 'settle', title: '초인종 뒤 마음을 가라앉히고 싶어요', message: '현관과 거리를 두고 조용한 자리에서 진정할 시간을 주세요.', actionLabel: '차분한 자리 만들기', completedMessage: '진정할 수 있는 거리를 만들었어요.' },
  { id: 'day6_meal', day: 6, time: '07:15', kind: 'meal', title: '아침 밥을 챙겨 주세요', message: '바쁜 날도 급여 루틴은 미리 준비해야 해요.', actionLabel: '밥 주기', completedMessage: '바쁜 날의 밥 루틴을 지켰어요.' },
  { id: 'day6_enrichment', day: 6, time: '12:40', kind: 'enrichment', title: '혼자 있는 동안 할 일이 필요해요', message: '안전한 씹을거리와 위험물 정리를 함께 준비해 주세요.', actionLabel: '안전한 놀이 준비', completedMessage: '혼자 있는 시간의 놀이를 준비했어요.' },
  { id: 'day6_clean', day: 6, time: '19:45', kind: 'clean', title: '어질러진 방을 같이 정리해 주세요', message: '혼내기보다 위험물을 치우고 원인을 살펴봐요.', actionLabel: '안전하게 정리하기', completedMessage: '위험물을 치우고 방을 정리했어요.' },
  { id: 'day7_breakfast', day: 7, time: '08:10', kind: 'meal', title: '마지막 날도 아침 밥은 같아요', message: '돌봄은 특별한 날보다 반복되는 하루에서 시작돼요.', actionLabel: '밥 주기', completedMessage: '마지막 날 아침 밥을 챙겼어요.' },
  { id: 'day7_walk', day: 7, time: '15:10', kind: 'walk', title: '함께 걷는 시간을 정해 볼까요?', message: '산책 길이보다 오늘 가능한 리듬을 고르는 것이 중요해요.', actionLabel: '산책 시간 정하기', completedMessage: '함께 걸을 시간을 정했어요.' },
  { id: 'day7_rest', day: 7, time: '21:30', kind: 'rest', title: '이제 곁에서 쉬고 싶어요', message: '계속 놀지 않아도 괜찮아요. 서로 편한 거리를 정해 주세요.', actionLabel: '함께 쉬기', completedMessage: '오늘의 휴식 시간을 함께 보냈어요.' },
];

export const CARE_MESSAGE_MISSED_PENALTY = 2;
export const CARE_MESSAGE_PENALTY_CAP = 30;

export const COMPANION_AUDIO_SESSION_POLICY = {
  playsInSilentMode: false,
  shouldPlayInBackground: false,
  interruptionMode: 'mixWithOthers',
};

export const COMPANION_EXPRESSION_STATES = {
  uncertain: { id: 'uncertain', moodLabel: '조금 망설이는 중', motionId: 'gentle_sway', mouth: '·', eyeShape: 'soft' },
  waiting: { id: 'waiting', moodLabel: '차분히 기다리는 중', motionId: 'slow_breathe', mouth: '‿', eyeShape: 'soft' },
  eager: { id: 'eager', moodLabel: '함께 나갈 준비 중', motionId: 'ready_bounce', mouth: 'ᴗ', eyeShape: 'bright' },
  playful: { id: 'playful', moodLabel: '같이 놀고 싶은 중', motionId: 'play_bow', mouth: 'ᴗ', eyeShape: 'bright' },
  alert: { id: 'alert', moodLabel: '낯선 소리를 살피는 중', motionId: 'alert_pulse', mouth: 'ᴥ', eyeShape: 'wide' },
  resting: { id: 'resting', moodLabel: '곁에서 쉬는 중', motionId: 'slow_breathe', mouth: '—', eyeShape: 'resting' },
  reassured: { id: 'reassured', moodLabel: '마음이 놓였어요', motionId: 'happy_bounce', mouth: 'ᴗ', eyeShape: 'bright' },
  attentive: { id: 'attentive', moodLabel: '다음 돌봄을 기다려요', motionId: 'gentle_sway', mouth: '·', eyeShape: 'soft' },
  concerned: { id: 'concerned', moodLabel: '조금 불편해 보여요', motionId: 'still_low', mouth: '⌒', eyeShape: 'soft' },
};

const RESPONSE_EXPRESSION_BY_IMPACT = {
  safe: 'reassured',
  needs_review: 'attentive',
  risky: 'concerned',
};

const COMPANION_EVENT_CATEGORY_MAP = {
  toilet_accident: ['care_consistency', 'behavior_understanding'],
  meal_request: ['care_consistency', 'species_knowledge'],
  walk_request: ['environment_fit', 'care_consistency'],
  play_request: ['care_consistency', 'species_knowledge'],
  doorbell_barking: ['environment_fit', 'behavior_understanding'],
  room_mess: ['environment_fit', 'care_consistency', 'behavior_understanding'],
  quiet_companion: ['environment_fit', 'behavior_understanding'],
};

const COMPANION_EVENT_DEFINITIONS = [
  {
    id: 'toilet_accident', day: 1, title: '거실에 배변 실수를 했어요', request: '혼내지 말고, 어디에서 다시 연습하면 좋을지 알려주세요.', visualState: 'uncertain', soundCue: 'whine_text_only',
    choices: [
      { id: 'clean_and_reset', label: '조용히 치우고 배변 장소를 다시 알려준다', impact: 'safe', feedback: '실수보다 다음 성공 환경을 만드는 대응이에요.' },
      { id: 'watch_first', label: '우선 지켜보고 반복되면 계획한다', impact: 'needs_review', feedback: '반복 전에 배변 시간과 장소를 먼저 확인하면 부담을 줄일 수 있어요.' },
      { id: 'scold', label: '실수한 곳을 보여주며 혼낸다', impact: 'risky', feedback: '혼내면 숨은 배변과 불안이 커질 수 있어요. 환경 조정이 먼저예요.' },
    ],
  },
  {
    id: 'meal_request', day: 2, title: '밥 시간이 되었어요', request: '오늘 먹을 양과 간식까지 함께 확인해 주세요.', visualState: 'waiting', soundCue: 'none',
    choices: [
      { id: 'measure_meal', label: '정해 둔 양을 확인하고 기록한다', impact: 'safe', feedback: '반복 가능한 급여 기준을 만드는 대응이에요.' },
      { id: 'rough_guess', label: '오늘만 눈대중으로 준다', impact: 'needs_review', feedback: '눈대중이 반복되면 건강 변화를 알아차리기 어려워요.' },
      { id: 'snacks_only', label: '좋아하는 간식으로 식사를 대신한다', impact: 'risky', feedback: '간식은 균형 잡힌 식사를 대신하기 어려워요.' },
    ],
  },
  {
    id: 'walk_request', day: 3, title: '밖에 나가고 싶어요', request: '짧아도 괜찮아요. 오늘 가능한 산책이나 실내 놀이를 골라주세요.', visualState: 'eager', soundCue: 'bark_text_only',
    choices: [
      { id: 'walk_or_indoor_play', label: '가능한 산책 또는 실내 놀이 시간을 정한다', impact: 'safe', feedback: '날씨와 일정에 맞춘 대체 루틴도 좋은 돌봄이에요.' },
      { id: 'later_unscheduled', label: '시간이 나면 나중에 생각한다', impact: 'needs_review', feedback: '구체적인 시간이 없으면 돌봄이 계속 밀릴 수 있어요.' },
      { id: 'ignore_energy', label: '오늘은 그냥 참게 한다', impact: 'risky', feedback: '남은 에너지는 짖음이나 물건 훼손으로 이어질 수 있어요.' },
    ],
  },
  {
    id: 'play_request', day: 4, title: '같이 놀고 싶어요', request: '오래가 아니라도 좋아요. 안전한 놀이 한 가지를 골라주세요.', visualState: 'playful', soundCue: 'none',
    choices: [
      { id: 'short_safe_play', label: '10분 동안 안전한 장난감으로 놀아준다', impact: 'safe', feedback: '짧고 예측 가능한 교감도 충분히 의미 있어요.' },
      { id: 'give_random_object', label: '주변 물건을 장난감처럼 건넨다', impact: 'needs_review', feedback: '삼킴이나 훼손 위험이 없는 물건인지 먼저 확인해야 해요.' },
      { id: 'push_away', label: '계속 다가오지 못하게 밀어낸다', impact: 'risky', feedback: '요청을 무시하기보다 쉬는 신호와 대체 행동을 알려주세요.' },
    ],
  },
  {
    id: 'doorbell_barking', day: 5, title: '초인종 소리에 짖고 있어요', request: '멍! 멍! 낯선 소리가 들려요. 어떻게 하면 좋을까요?', visualState: 'alert', soundCue: 'bark_text_only',
    choices: [
      { id: 'create_distance', label: '현관과 거리를 두고 차분한 행동을 보상한다', impact: 'safe', feedback: '자극의 강도를 낮추고 다른 행동을 알려주는 대응이에요.' },
      { id: 'wait_for_silence', label: '그칠 때까지 아무 대응 없이 기다린다', impact: 'needs_review', feedback: '원인과 환경을 함께 조정해야 반복 부담을 줄일 수 있어요.' },
      { id: 'shout_back', label: '더 큰 소리로 조용히 하라고 한다', impact: 'risky', feedback: '큰 소리는 흥분과 불안을 더 키울 수 있어요.' },
    ],
  },
  {
    id: 'room_mess', day: 6, title: '휴지와 쿠션이 어질러졌어요', request: '혼자 있는 동안 심심하고 불안했어요. 다음에는 무엇을 바꿀까요?', visualState: 'uncertain', soundCue: 'none',
    choices: [
      { id: 'secure_and_enrich', label: '위험물을 치우고 안전한 씹을거리와 놀이를 준비한다', impact: 'safe', feedback: '환경 관리와 욕구 대체를 함께 하는 대응이에요.' },
      { id: 'clean_only', label: '일단 치우고 다음 상황을 지켜본다', impact: 'needs_review', feedback: '정리와 함께 혼자 있는 시간·에너지 원인을 확인해 보세요.' },
      { id: 'punish_after_return', label: '돌아온 뒤 어지른 것을 보여주며 혼낸다', impact: 'risky', feedback: '시간이 지난 뒤의 처벌은 원인을 알려주지 못하고 불안만 키울 수 있어요.' },
    ],
  },
  {
    id: 'quiet_companion', day: 7, title: '오늘은 곁에서 쉬고 싶어요', request: '무언가를 하지 않아도 괜찮아요. 함께 쉴 자리를 정해 주세요.', visualState: 'resting', soundCue: 'none',
    choices: [
      { id: 'make_rest_spot', label: '서로 방해받지 않는 편안한 자리를 만든다', impact: 'safe', feedback: '함께 쉬는 시간도 실제 반려 생활의 중요한 부분이에요.' },
      { id: 'constant_attention', label: '계속 안고 관심을 준다', impact: 'needs_review', feedback: '강아지가 스스로 쉬고 거리를 선택할 시간도 필요해요.' },
      { id: 'isolate', label: '귀찮지 않게 다른 공간에 계속 둔다', impact: 'risky', feedback: '휴식과 장시간 고립은 달라요. 안전한 동행 거리를 찾아보세요.' },
    ],
  },
];

export const COMPANION_EVENTS = COMPANION_EVENT_DEFINITIONS.map((event) => ({
  ...event,
  choices: event.choices.map((choice) => ({
    ...choice,
    affectedCategories: [...COMPANION_EVENT_CATEGORY_MAP[event.id]],
  })),
}));

function companionRuleId(eventId, choiceId) {
  const token = `${eventId}-${choiceId}`.replaceAll('_', '-').toUpperCase();
  return `RULE-${token}-001`;
}

export function companionEvidenceForChoice(eventId, choiceId) {
  const event = COMPANION_EVENTS.find((candidate) => candidate.id === eventId);
  const choice = event?.choices.find((candidate) => candidate.id === choiceId);
  if (!event || !choice) throw new Error('companion_response_invalid');
  return {
    schema: COMPANION_EVIDENCE_SCHEMA,
    eventId: event.id,
    choiceId: choice.id,
    impact: choice.impact,
    categories: [...choice.affectedCategories],
    feedback: choice.feedback,
    evidenceLevel: 'EL-SYN-INTERACTION',
    ruleEvidenceLevel: 'EL-SYN',
    ruleId: companionRuleId(event.id, choice.id),
    ruleVersion: COMPANION_RULE_VERSION,
    appVersion: COMPANION_APP_VERSION,
  };
}

function canonicalCompanionResponses(storedResponses) {
  const responses = {};
  if (!storedResponses || typeof storedResponses !== 'object') return responses;
  for (const event of COMPANION_EVENTS) {
    const choiceId = storedResponses[event.id]?.choiceId;
    if (!event.choices.some((choice) => choice.id === choiceId)) continue;
    responses[event.id] = companionEvidenceForChoice(event.id, choiceId);
  }
  return responses;
}

export function companionPresetById(presetId) {
  return COMPANION_APPEARANCE_PRESETS.find((preset) => preset.id === presetId) || null;
}

export function photoAvatarSampleById(photoAvatarId) {
  return PHOTO_AVATAR_SIMULATION_SAMPLES.find((sample) => sample.id === photoAvatarId) || null;
}

export function createCompanionState(appearancePresetId = DEFAULT_COMPANION_PRESET_ID) {
  if (!companionPresetById(appearancePresetId)) throw new Error('companion_preset_invalid');
  return {
    schema: 'dog-first.companion.v5',
    appearancePresetId,
    photoAvatarId: null,
    soundEnabled: false,
    careStartedOn: null,
    careResponses: {},
    responses: {},
  };
}

function canonicalCareResponses(storedResponses) {
  const responses = {};
  if (!storedResponses || typeof storedResponses !== 'object') return responses;
  for (const message of CARE_MESSAGE_SCHEDULE) {
    const stored = storedResponses[message.id];
    if (!stored || typeof stored !== 'object') continue;
    if (stored.status === 'missed') {
      responses[message.id] = {
        status: 'missed',
        completed: false,
        scheduledTime: message.time,
        windowEndTime: stored.windowEndTime || careWindowEndTime(message),
        reason: typeof stored.reason === 'string' ? stored.reason : 'time_window_elapsed',
        evidenceLevel: 'EL-SYN-INTERACTION',
      };
      continue;
    }
    if (stored.completed === true) {
      if (stored.status === 'completed') {
        responses[message.id] = {
          status: 'completed',
          completed: true,
          scheduledTime: message.time,
          windowEndTime: stored.windowEndTime || careWindowEndTime(message),
          completedLocalMinute: Number.isInteger(stored.completedLocalMinute) ? stored.completedLocalMinute : null,
          evidenceLevel: 'EL-SYN-INTERACTION',
        };
      } else {
        responses[message.id] = {
          status: 'legacy_completed',
          completed: true,
          evidenceLevel: 'EL-SYN-INTERACTION',
        };
      }
    }
  }
  return responses;
}

function validLocalDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

export function hydrateCompanionState(stored) {
  const supportedSchemas = new Set([
    'dog-first.companion.v0',
    'dog-first.companion.v1',
    'dog-first.companion.v2',
    'dog-first.companion.v3',
    'dog-first.companion.v4',
    'dog-first.companion.v5',
  ]);
  if (!supportedSchemas.has(stored?.schema)) return createCompanionState();
  const supportsAppearance = stored.schema !== 'dog-first.companion.v0';
  const appearancePresetId = supportsAppearance && companionPresetById(stored.appearancePresetId)
    ? stored.appearancePresetId
    : DEFAULT_COMPANION_PRESET_ID;
  return {
    ...createCompanionState(appearancePresetId),
    photoAvatarId: supportsAppearance && photoAvatarSampleById(stored.photoAvatarId) ? stored.photoAvatarId : null,
    soundEnabled: supportsAppearance && stored.soundEnabled === true,
    careStartedOn: supportsAppearance && validLocalDateKey(stored.careStartedOn) ? stored.careStartedOn : null,
    careResponses: supportsAppearance ? canonicalCareResponses(stored.careResponses) : {},
    responses: canonicalCompanionResponses(stored.responses),
  };
}

export function selectCompanionPreset(state, presetId) {
  if (!companionPresetById(presetId)) throw new Error('companion_preset_invalid');
  return { ...hydrateCompanionState(state), appearancePresetId: presetId };
}

export function setCompanionSoundEnabled(state, enabled) {
  return { ...hydrateCompanionState(state), soundEnabled: enabled === true };
}

export function registerPhotoAvatarSimulation(state, photoAvatarId) {
  if (!photoAvatarSampleById(photoAvatarId)) throw new Error('photo_avatar_simulation_invalid');
  return { ...hydrateCompanionState(state), photoAvatarId };
}

export function removePhotoAvatarSimulation(state) {
  return { ...hydrateCompanionState(state), photoAvatarId: null };
}

export function careMessagesForDay(day) {
  return CARE_MESSAGE_SCHEDULE.filter((message) => message.day === Number(day));
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromLocalKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function addLocalDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function minuteOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function applyTime(date, time) {
  const [hour, minute] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function careWindowEndTime(message) {
  const messages = careMessagesForDay(message.day);
  const index = messages.findIndex((candidate) => candidate.id === message.id);
  return messages[index + 1]?.time || '24:00';
}

function careWindow(state, message) {
  const dayDate = addLocalDays(dateFromLocalKey(state.careStartedOn), message.day - 1);
  const start = applyTime(dayDate, message.time);
  const endTime = careWindowEndTime(message);
  const end = endTime === '24:00' ? addLocalDays(dayDate, 1) : applyTime(dayDate, endTime);
  return { start, end, endTime };
}

export function startCareSchedule(state, now = new Date(), currentDay = 1) {
  const current = hydrateCompanionState(state);
  if (current.careStartedOn) return current;
  const boundedDay = Math.min(7, Math.max(1, Number(currentDay) || 1));
  return {
    ...current,
    careStartedOn: localDateKey(addLocalDays(now, -(boundedDay - 1))),
  };
}

export function careMessageTiming(state, messageId, now = new Date()) {
  const message = CARE_MESSAGE_SCHEDULE.find((candidate) => candidate.id === messageId);
  if (!message) throw new Error('care_message_invalid');
  const current = startCareSchedule(state, now, message.day);
  const response = current.careResponses[messageId];
  const { start, end, endTime } = careWindow(current, message);
  if (response?.completed === true) {
    return { status: 'completed', message, start, end, windowEndTime: endTime, response };
  }
  if (response?.status === 'missed') {
    return { status: 'missed', message, start, end, windowEndTime: endTime, response };
  }
  if (now < start) return { status: 'upcoming', message, start, end, windowEndTime: endTime, response: null };
  if (now >= end) return { status: 'missed', message, start, end, windowEndTime: endTime, response: null };
  return { status: 'available', message, start, end, windowEndTime: endTime, response: null };
}

function missedCareResponse(message, reason = 'time_window_elapsed') {
  return {
    status: 'missed',
    completed: false,
    scheduledTime: message.time,
    windowEndTime: careWindowEndTime(message),
    reason,
    evidenceLevel: 'EL-SYN-INTERACTION',
  };
}

export function reconcileElapsedCare(state, now = new Date()) {
  const current = hydrateCompanionState(state);
  if (!current.careStartedOn) return current;
  const careResponses = { ...current.careResponses };
  for (const message of CARE_MESSAGE_SCHEDULE) {
    if (careResponses[message.id]) continue;
    if (careMessageTiming(current, message.id, now).status === 'missed') {
      careResponses[message.id] = missedCareResponse(message);
    }
  }
  return { ...current, careResponses };
}

export function completeCareMessage(state, messageId, now = new Date()) {
  const message = CARE_MESSAGE_SCHEDULE.find((candidate) => candidate.id === messageId);
  if (!message) throw new Error('care_message_invalid');
  const scheduled = startCareSchedule(state, now, message.day);
  const timing = careMessageTiming(scheduled, messageId, now);
  if (timing.status !== 'available') throw new Error('care_message_not_available');
  const current = reconcileElapsedCare(scheduled, now);
  return {
    ...current,
    careResponses: {
      ...current.careResponses,
      [messageId]: {
        status: 'completed',
        completed: true,
        scheduledTime: message.time,
        windowEndTime: timing.windowEndTime,
        completedLocalMinute: minuteOfDay(now),
        evidenceLevel: 'EL-SYN-INTERACTION',
      },
    },
  };
}

export function closeCareDay(state, day, now = new Date(), reason = 'mission_closed') {
  const current = startCareSchedule(state, now, day);
  const careResponses = { ...reconcileElapsedCare(current, now).careResponses };
  for (const message of careMessagesForDay(day)) {
    if (!careResponses[message.id]) careResponses[message.id] = missedCareResponse(message, reason);
  }
  return { ...current, careResponses };
}

export function careDaySummary(state, day, now = new Date()) {
  const current = startCareSchedule(state, now, day);
  const items = careMessagesForDay(day).map((message) => careMessageTiming(current, message.id, now));
  const count = (status) => items.filter((item) => item.status === status).length;
  const completedCount = count('completed');
  const missedCount = count('missed');
  return {
    day: Number(day),
    items,
    completedCount,
    missedCount,
    availableCount: count('available'),
    upcomingCount: count('upcoming'),
    readyForMission: completedCount + missedCount === items.length,
  };
}

export function companionEventForDay(day) {
  return COMPANION_EVENTS.find((event) => event.day === Number(day)) || COMPANION_EVENTS[0];
}

export function companionExpressionFor(event, response = null) {
  const expressionId = RESPONSE_EXPRESSION_BY_IMPACT[response?.impact] || event?.visualState || 'waiting';
  return COMPANION_EXPRESSION_STATES[expressionId] || COMPANION_EXPRESSION_STATES.waiting;
}

export function companionMotionEnabled(motionId, reduceMotion) {
  return reduceMotion !== true && motionId !== 'still_low';
}

export function companionSoundCanPlay(state, event, userInitiated) {
  return state?.soundEnabled === true && event?.soundCue === 'bark_text_only' && userInitiated === true;
}

export function respondToCompanion(state, eventId, choiceId) {
  const current = hydrateCompanionState(state);
  const evidence = companionEvidenceForChoice(eventId, choiceId);
  return { ...current, responses: { ...current.responses, [eventId]: evidence } };
}
