export const DOG_PROFILES = [
  { id: 'DOG_APP_D01', name: '차분한 실내 교감형 소형견', size: 'small', tone: '차분한 일상 교감', tags: ['routine_gap_risk'], summary: '작고 차분해 보여도 매일의 교감과 루틴은 함께 준비해야 합니다.' },
  { id: 'DOG_APP_D02', name: '소리와 외출 공백에 민감한 소형견', size: 'small', tone: '조용한 집의 루틴', tags: ['alone_time_gap_risk', 'noise_conflict_risk', 'body_care_gap_risk'], summary: '소리, 공용공간, 긴 외출이 생활 조건과 부딪힐 수 있습니다.' },
  { id: 'DOG_APP_D03', name: '기초관리와 미용 루틴이 중요한 소형견', size: 'small', tone: '손질과 비용 계획', tags: ['body_care_gap_risk', 'budget_gap_risk'], summary: '기초관리와 정기 비용을 미리 생활 계획에 넣어 보는 프로필입니다.' },
  { id: 'DOG_APP_D04', name: '매일 산책과 사회적 자극이 필요한 중형견', size: 'medium', tone: '산책과 놀이 계획', tags: ['routine_gap_risk', 'public_safety_gap_risk'], summary: '활동량만큼 산책, 통제, 공용공간 계획을 함께 점검합니다.' },
  { id: 'DOG_APP_D05', name: '짧고 꾸준한 훈련 루틴이 중요한 중형견', size: 'medium', tone: '일관된 연습', tags: ['routine_gap_risk', 'noise_conflict_risk', 'body_care_gap_risk'], summary: '작은 연습을 오래 이어가는 생활 구조를 확인합니다.' },
  { id: 'DOG_APP_D06', name: '천천히 적응할 시간이 필요한 중형견', size: 'medium', tone: '관찰과 적응', tags: ['alone_time_gap_risk', 'noise_conflict_risk', 'body_care_gap_risk'], summary: '개체의 적응 시간을 존중하는 조용한 돌봄 환경을 생각합니다.' },
  { id: 'DOG_APP_D07', name: '공간과 비용 계획이 중요한 대형견', size: 'large', tone: '공간과 비용', tags: ['budget_gap_risk'], summary: '공간이 있어도 월 비용과 생활 동선은 따로 준비해야 합니다.' },
  { id: 'DOG_APP_D08', name: '활동량과 산책 통제가 중요한 대형견', size: 'large', tone: '활동과 안전', tags: ['routine_gap_risk', 'public_safety_gap_risk', 'budget_gap_risk'], summary: '활동 자신감과 별개로 산책 통제·비용·안전 계획을 확인합니다.' },
  { id: 'DOG_APP_D09', name: '개체차 관찰이 중요한 믹스/이력 미상견', size: 'variable', tone: '관찰 노트', tags: ['alone_time_gap_risk', 'body_care_gap_risk'], summary: '견종 단정 대신 적응 과정과 개체별 관찰을 중심에 둡니다.' },
  { id: 'DOG_APP_D10', name: '차분하지만 건강관리 계획이 중요한 노령견', size: 'variable', tone: '차분한 건강 지원', tags: ['budget_gap_risk', 'health_support_gap_risk'], summary: '불안을 키우기보다 건강관리와 지원 계획을 함께 준비합니다.' },
];

const ONBOARDING_LABELS = {
  household: {
    single: '1인 가구',
    family: '가족·동거인과 함께',
  },
  home: {
    apartment: '아파트·공동주택',
    house: '마당 또는 단독주택',
    other: '그 외 주거',
  },
  budget: {
    low: '비용을 빠듯하게 계획 중',
    medium: '기본 비용 준비',
    high: '비용을 여유 있게 계획',
  },
};

const PROFILE_SIZE_LABELS = {
  small: '소형',
  medium: '중형',
  large: '대형',
  variable: '크기 다양',
};

function primaryProfileId(onboarding) {
  const weekdayHours = Number(onboarding.weekdayHours || 0);
  let primaryId = 'DOG_APP_D05';
  if (weekdayHours >= 8) primaryId = 'DOG_APP_D02';
  else if (onboarding.budget === 'low') primaryId = 'DOG_APP_D03';
  else if (onboarding.home === 'house') primaryId = 'DOG_APP_D07';
  else if (onboarding.preference === 'active') primaryId = 'DOG_APP_D08';
  else if (onboarding.preference === 'senior') primaryId = 'DOG_APP_D10';
  return primaryId;
}

function primaryPracticeReason(onboarding) {
  const weekdayHours = Number(onboarding.weekdayHours || 0);
  if (weekdayHours >= 8) return '평일 외출 공백을 기준으로 혼자 있는 시간과 대체 돌봄 계획을 살펴봐요.';
  if (onboarding.budget === 'low') return '현재 비용 계획을 기준으로 정기 비용과 예상 밖 지출을 함께 살펴봐요.';
  if (onboarding.home === 'house') return '공간의 크기와 별개로 매일의 생활 동선과 꾸준한 돌봄 비용을 살펴봐요.';
  if (onboarding.preference === 'active') return '활동적인 일상을 생각하며 산책 지속성과 공용공간 안전을 살펴봐요.';
  if (onboarding.preference === 'senior') return '차분한 노령견 일상을 생각하며 건강관리와 지원 계획을 살펴봐요.';
  return '짧은 돌봄과 생활 규칙을 매일 이어갈 수 있는지 살펴봐요.';
}

function secondaryPracticeReason(onboarding) {
  if (onboarding.experience === 'first') return '첫 반려견을 준비하는 만큼, 돌봄 요청을 알아차리고 반복 가능한 루틴으로 바꾸는 연습을 해봐요.';
  if (onboarding.household === 'family') return '가족·동거인과 역할을 어떻게 나눌지 7일 기록에서 확인해 봐요.';
  return '혼자 돌보는 날에도 요청 시간을 지킬 수 있는 루틴을 7일 기록에서 확인해 봐요.';
}

export function profileSizeLabel(size) {
  return PROFILE_SIZE_LABELS[size] || '크기 정보 없음';
}

export function profileRecommendationContext(onboarding = {}) {
  const weekdayHours = Number(onboarding.weekdayHours);
  const conditions = [
    ONBOARDING_LABELS.household[onboarding.household],
    ONBOARDING_LABELS.home[onboarding.home],
    Number.isFinite(weekdayHours) && weekdayHours >= 0 ? `평일 최대 ${weekdayHours}시간 외출` : null,
    ONBOARDING_LABELS.budget[onboarding.budget],
  ].filter(Boolean).slice(0, 4);
  return {
    conditions,
    practiceReasons: [primaryPracticeReason(onboarding), secondaryPracticeReason(onboarding)],
  };
}

export function recommendProfiles(onboarding) {
  const primaryId = primaryProfileId(onboarding);
  const primaryIndex = DOG_PROFILES.findIndex((profile) => profile.id === primaryId);
  return [DOG_PROFILES[primaryIndex], DOG_PROFILES[(primaryIndex + 1) % DOG_PROFILES.length], DOG_PROFILES[(primaryIndex + 5) % DOG_PROFILES.length]];
}
