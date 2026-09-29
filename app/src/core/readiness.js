import {
  CARE_MESSAGE_PENALTY_CAP,
  CARE_MESSAGE_MISSED_PENALTY,
  CARE_MESSAGE_SCHEDULE,
  COMPANION_EVENTS,
  companionEvidenceForChoice,
} from '../companion/companionEngine.js';

const CATEGORY_LABELS = {
  environment_fit: '생활 조건', care_consistency: '돌봄 지속성', budget_readiness: '비용 준비', behavior_understanding: '상황 이해', species_knowledge: '기초 지식',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const IMPACT_PENALTIES = {
  safe: 0,
  needs_review: 5,
  risky: 12,
};

const IMPACT_WEIGHTS = {
  needs_review: 1,
  risky: 2,
};

const TAG_TO_CATEGORY = {
  alone_time_gap_risk: ['care_consistency', 'behavior_understanding'], routine_gap_risk: ['care_consistency'], noise_conflict_risk: ['environment_fit', 'behavior_understanding'], public_safety_gap_risk: ['environment_fit', 'species_knowledge'], body_care_gap_risk: ['species_knowledge', 'behavior_understanding'], budget_gap_risk: ['budget_readiness'], health_support_gap_risk: ['budget_readiness', 'species_knowledge'],
};

const IMPROVEMENTS = {
  alone_time_gap_risk: '평일 혼자 있는 시간과 대체 돌봄 계획을 적어 보세요.', routine_gap_risk: '산책·놀이 루틴을 평일과 주말로 나눠 다시 계획해 보세요.', noise_conflict_risk: '주거 소음과 이웃 배려를 위한 생활 규칙을 정해 보세요.', public_safety_gap_risk: '공용공간과 산책에서 지킬 안전한 대응을 연습해 보세요.', body_care_gap_risk: '기초관리와 병원 이동에 필요한 준비를 점검해 보세요.', budget_gap_risk: '월 비용과 응급비를 구분해 현실적인 예산을 정해 보세요.', health_support_gap_risk: '건강관리 계획과 전문가에게 물어볼 질문을 준비해 보세요.',
};

const GENERAL_IMPROVEMENTS = [
  '7일 기록을 가족·동거인과 함께 다시 읽고, 아직 확인하지 못한 조건을 적어 보세요.',
  '건너뛰거나 미기록인 날의 생활 조건을 한 가지씩 다시 확인해 보세요.',
  '시뮬레이션 결과를 실제 결정 대신 다음 확인 질문을 만드는 데 사용해 보세요.',
];

export const READINESS_SAFETY_NOTICE = {
  title: '결정하기 전에 한 번 더 살펴보세요',
  body: '이 점수와 안내는 7일 동안 남긴 기록으로 만든 시뮬레이션 결과예요. 실제 강아지의 성격과 건강, 보호자의 생활과 주거 환경은 여기 담긴 조건과 다를 수 있습니다.',
  action: '입양 여부를 대신 정해 주는 답은 아니니, 가족과 충분히 상의하고 보호소·수의사·행동 전문가에게 필요한 내용을 확인한 뒤 결정해 주세요.',
  escalation: '건강·행동·법률 문제가 걱정된다면 이 결과만으로 판단하지 말고 해당 분야 전문가나 기관에 확인해 주세요.',
};

function canonicalMissionLogs(logs) {
  const byDay = new Map();
  (Array.isArray(logs) ? logs : []).forEach((log) => {
    if (Number.isInteger(log?.day) && log.day >= 1 && log.day <= 7 && ['completed', 'skipped'].includes(log.state)) {
      byDay.set(log.day, log);
    }
  });
  return [...byDay.values()];
}

function canonicalCompanionEvidence(storedResponses) {
  if (!storedResponses || typeof storedResponses !== 'object') return [];
  return COMPANION_EVENTS.flatMap((event) => {
    const choiceId = storedResponses[event.id]?.choiceId;
    if (!event.choices.some((choice) => choice.id === choiceId)) return [];
    return [companionEvidenceForChoice(event.id, choiceId)];
  });
}

function canonicalCareEvidence(storedResponses) {
  if (!storedResponses || typeof storedResponses !== 'object') return [];
  return CARE_MESSAGE_SCHEDULE.flatMap((message) => {
    const response = storedResponses[message.id];
    if (response?.status === 'missed') return [{ messageId: message.id, status: 'missed' }];
    if (response?.completed === true) return [{ messageId: message.id, status: 'completed' }];
    return [];
  });
}

function emptyImpactCounts() {
  return { needs_review: 0, risky: 0 };
}

function safeChoiceLabel(eventId) {
  const event = COMPANION_EVENTS.find((candidate) => candidate.id === eventId);
  return event?.choices.find((choice) => choice.impact === 'safe')?.label || null;
}

function evidenceSuggestions(companionEvidence) {
  return CATEGORY_ORDER.map((categoryId, categoryIndex) => {
    const evidence = companionEvidence.filter((item) => (
      IMPACT_WEIGHTS[item.impact] && item.categories.includes(categoryId)
    ));
    const impactCounts = evidence.reduce((counts, item) => ({
      ...counts,
      [item.impact]: counts[item.impact] + 1,
    }), emptyImpactCounts());
    return {
      categoryId,
      categoryIndex,
      evidence,
      evidenceCount: evidence.length,
      impactCounts,
      weight: evidence.reduce((sum, item) => sum + IMPACT_WEIGHTS[item.impact], 0),
    };
  }).filter((item) => item.evidenceCount > 0)
    .sort((left, right) => (
      right.weight - left.weight
      || right.evidenceCount - left.evidenceCount
      || left.categoryIndex - right.categoryIndex
    ))
    .map((item) => {
      const topEvidence = [...item.evidence].sort((left, right) => (
        IMPACT_WEIGHTS[right.impact] - IMPACT_WEIGHTS[left.impact]
      ))[0];
      return {
        categoryId: item.categoryId,
        sourceType: 'recorded_choice',
        observedInSimulation: `${CATEGORY_LABELS[item.categoryId]}과 관련해 다시 살펴볼 ${item.evidenceCount}개의 선택이 기록됐어요.`,
        whyThisMatters: topEvidence.feedback,
        tryNext: safeChoiceLabel(topEvidence.eventId),
        supportingEventIds: item.evidence.map((evidence) => evidence.eventId),
        supportingChoiceIds: item.evidence.map((evidence) => evidence.choiceId),
        evidenceCount: item.evidenceCount,
        impactCounts: item.impactCounts,
        evidenceLevel: 'EL-SYN',
      };
    });
}

function profileSuggestions(profile) {
  const seen = new Set();
  return (profile?.tags || []).flatMap((tag) => {
    const tryNext = IMPROVEMENTS[tag];
    if (!tryNext || seen.has(tryNext)) return [];
    seen.add(tryNext);
    return [{
      categoryId: TAG_TO_CATEGORY[tag]?.[0] || null,
      sourceType: 'profile_context',
      observedInSimulation: '선택한 가상 프로필의 생활 조건을 보조 맥락으로 참고했어요.',
      whyThisMatters: '프로필 조건은 실제 개체나 생활환경을 확정하지 않지만 다음 확인 항목을 찾는 데 도움이 돼요.',
      tryNext,
      supportingEventIds: [],
      supportingChoiceIds: [],
      evidenceCount: 0,
      impactCounts: emptyImpactCounts(),
      evidenceLevel: 'EL-SYN',
    }];
  });
}

function generalSuggestion(tryNext) {
  return {
    categoryId: null,
    sourceType: 'general_context',
    observedInSimulation: '기록만으로 확인하기 어려운 조건이 남아 있어요.',
    whyThisMatters: '시뮬레이션은 실제 사용자·전문가·법률·실기기 확인을 대신하지 않아요.',
    tryNext,
    supportingEventIds: [],
    supportingChoiceIds: [],
    evidenceCount: 0,
    impactCounts: emptyImpactCounts(),
    evidenceLevel: 'EL-SYN',
  };
}

function readinessSuggestions(profile, companionEvidence) {
  const suggestions = [
    ...evidenceSuggestions(companionEvidence),
    ...profileSuggestions(profile),
  ].slice(0, 3);
  for (const tryNext of GENERAL_IMPROVEMENTS) {
    if (suggestions.length >= 3) break;
    if (!suggestions.some((suggestion) => suggestion.tryNext === tryNext)) {
      suggestions.push(generalSuggestion(tryNext));
    }
  }
  return suggestions;
}

export function calculateReadiness(logs, profile, eventResponse, companionResponses, careResponses) {
  const missionLogs = canonicalMissionLogs(logs);
  const companionEvidence = canonicalCompanionEvidence(companionResponses);
  const careEvidence = canonicalCareEvidence(careResponses);
  const scores = Object.fromEntries(CATEGORY_ORDER.map((key) => [key, 100]));
  const categoryEvidenceCounts = Object.fromEntries(CATEGORY_ORDER.map((key) => [key, 0]));
  const completed = missionLogs.filter((log) => log.state === 'completed').length;
  const skipped = missionLogs.filter((log) => log.state === 'skipped').length;
  const missing = Math.max(0, 7 - missionLogs.length);
  const missionPenalty = (skipped + missing) * 4;
  const completedCareMessageCount = careEvidence.filter((item) => item.status === 'completed').length;
  const missedCareMessageCount = careEvidence.filter((item) => item.status === 'missed').length;
  const careConsistencyPenalty = Math.min(
    CARE_MESSAGE_PENALTY_CAP,
    missedCareMessageCount * CARE_MESSAGE_MISSED_PENALTY,
  );
  CATEGORY_ORDER.forEach((key) => { scores[key] = Math.max(0, scores[key] - missionPenalty); });
  scores.care_consistency = Math.max(0, scores.care_consistency - careConsistencyPenalty);
  companionEvidence.forEach((evidence) => evidence.categories.forEach((category) => {
    categoryEvidenceCounts[category] += 1;
    scores[category] = Math.max(0, scores[category] - IMPACT_PENALTIES[evidence.impact]);
  }));
  if (eventResponse?.impact === 'risky') CATEGORY_ORDER.forEach((key) => { scores[key] = Math.max(0, scores[key] - 12); });
  if (eventResponse?.impact === 'needs_review') CATEGORY_ORDER.forEach((key) => { scores[key] = Math.max(0, scores[key] - 5); });
  (profile?.tags || []).forEach((tag) => (TAG_TO_CATEGORY[tag] || []).forEach((category) => { scores[category] = Math.max(0, scores[category] - 8); }));
  const overall = Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.keys(scores).length);
  const evidenceStatus = skipped > 0 || missing > 0 ? 'incomplete' : 'complete';
  const outcome = evidenceStatus === 'incomplete'
    ? '기록을 더 채운 뒤 살펴보세요'
    : overall >= 85 ? '준비한 점이 보여요' : overall >= 60 ? '조건을 조정하며 준비해 보세요' : '준비할 조건을 더 살펴보세요';
  const suggestions = readinessSuggestions(profile, companionEvidence);
  return {
    scores,
    overall,
    outcome,
    evidenceStatus,
    recordedMissionCount: missionLogs.length,
    completedMissionCount: completed,
    skippedMissionCount: skipped,
    missingMissionCount: missing,
    completedCareMessageCount,
    missedCareMessageCount,
    careConsistencyPenalty,
    companionEvidenceCount: companionEvidence.length,
    categoryEvidenceCounts,
    suggestions,
    improvements: suggestions.map((suggestion) => suggestion.tryNext),
    labels: CATEGORY_LABELS,
    boundary: 'Educational preparation result only. It is not an adoption approval, diagnosis, behavior assessment, or legal judgment.',
    safetyNotice: READINESS_SAFETY_NOTICE,
  };
}
