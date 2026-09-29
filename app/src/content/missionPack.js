export const MISSIONS = [
  { day: 1, id: 'day-1-long-term-routine', title: '생활 시간표와 혼자 있는 시간', prompt: '평일에 가장 길게 비는 시간과, 그때를 위한 대체 돌봄 한 가지를 적어 보세요.', action: '시간표 확인하기' },
  { day: 2, id: 'day-2-cost-plan', title: '월 비용과 비상 비용', prompt: '월 관리비와 예상 밖 비용을 분리해, 지금 준비할 수 있는 한 가지를 적어 보세요.', action: '비용 계획 적기' },
  { day: 3, id: 'day-3-walk-routine', title: '산책·놀이 루틴', prompt: '평일과 주말에 각각 가능한 산책·놀이 시간을 한 줄씩 적어 보세요.', action: '루틴 만들기' },
  { day: 4, id: 'day-4-basic-care', title: '기초관리와 병원 이동', prompt: '발톱·양치·미용·병원 이동 중 지금 더 알아볼 한 가지를 고르세요.', action: '관리 준비하기' },
  { day: 5, id: 'day-5-role-plan', title: '가족·동거인 역할 계획', prompt: '돌봄을 나눌 사람이 있다면 역할 하나를, 없다면 대체 돌봄 계획 하나를 적어 보세요.', action: '역할 정하기' },
  { day: 6, id: 'day-6-situation-event', title: '상황 이벤트 대응', prompt: '예상 밖 상황에서 안전과 돌봄을 먼저 두는 선택을 연습합니다.', action: '상황 선택하기' },
  { day: 7, id: 'day-7-reflection', title: '기록 회고와 다음 행동', prompt: '7일 동안 가장 다시 확인하고 싶은 조건과 다음 행동 하나를 적어 보세요.', action: '리포트 만들기' },
];

export const EVENT_OPTIONS = [
  { id: 'adjust_routine', label: '산책·돌봄 루틴을 다시 설계한다', impact: 'safe', feedback: '생활 변화에 맞춰 준비 조건을 조정하는 선택이에요.' },
  { id: 'seek_support', label: '가족·서비스·전문가와 대안을 확인한다', impact: 'safe', feedback: '혼자 감당하기 어려운 공백을 미리 확인하는 선택이에요.' },
  { id: 'delay_decision', label: '준비 조건을 보완한 뒤 다시 시뮬레이션한다', impact: 'needs_review', feedback: '보류는 실패가 아니라 더 안전한 준비를 위한 선택일 수 있어요.' },
  { id: 'ignore_risk', label: '문제가 생기면 그때 생각한다', impact: 'risky', feedback: '돌봄 공백은 미리 조정할수록 안전합니다. 다른 대안을 다시 살펴보세요.' },
];
