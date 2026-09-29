export function careWindowLabel(item) {
  const start = item.start;
  const date = start ? `${start.getMonth() + 1}월 ${start.getDate()}일 ` : '';
  const end = item.windowEndTime === '24:00' ? '자정' : item.windowEndTime;
  return `${date}${item.message.time}부터 ${end} 전까지`;
}

export function completedCareLabel(response) {
  if (!Number.isInteger(response?.completedLocalMinute)) return '완료 기록';
  const hour = String(Math.floor(response.completedLocalMinute / 60)).padStart(2, '0');
  const minute = String(response.completedLocalMinute % 60).padStart(2, '0');
  return `${hour}:${minute}에 완료`;
}
