export const REPORT_EVIDENCE_BOUNDARY =
  '합성 시뮬레이션 근거(EL-SYN) · 실제 사용자·전문가·법률 검토 아님';

export function supportingEvidenceText(suggestion) {
  const eventIds = Array.isArray(suggestion?.supportingEventIds)
    ? suggestion.supportingEventIds.filter(Boolean)
    : [];
  if (eventIds.length > 0) {
    return ['근거 기록 ID', ...eventIds].join(' · ');
  }
  if (suggestion?.sourceType === 'profile_context') {
    return '보조 맥락 · 선택한 가상 프로필';
  }
  return '일반 확인 맥락 · 시뮬레이션 밖에서 확인할 항목';
}

export function suggestionAccessibilityLabel(suggestion, index) {
  return [
    '제안 ' + (index + 1),
    '시뮬레이션에서 본 점. ' + suggestion.observedInSimulation,
    '왜 살펴보나요. ' + suggestion.whyThisMatters,
    '다음에 해 볼 일. ' + suggestion.tryNext,
    supportingEvidenceText(suggestion),
    REPORT_EVIDENCE_BOUNDARY,
  ].join('. ');
}
