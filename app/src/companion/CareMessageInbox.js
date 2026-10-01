import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { careWindowLabel, completedCareLabel } from './carePresentation';

export function CareMessageInbox({ summary, onComplete }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const items = summary.items;
  const allDone = summary.completedCount === items.length;
  const statusLabel = (item) => item.status === 'completed' ? '완료' : item.status === 'missed' ? '놓침' : item.status === 'available' ? '지금' : '예정';
  return (
    <View style={styles.inbox}>
      <Text style={styles.eyebrow}>오늘의 강아지 요청 · 오늘의 돌봄 순서</Text>
      <View style={styles.heading}><Text style={styles.title}>오늘 루틴</Text><Text style={styles.count}>{summary.completedCount} 완료 · {summary.missedCount} 놓침</Text></View>
      <Text style={styles.intro}>표시된 시간이 되어야 기록할 수 있어요. 아래에서 요청과 완료 가능 시간을 함께 확인해 주세요.</Text>
      {allDone ? <Text accessibilityLiveRegion="polite" style={styles.done}>오늘 요청을 모두 마쳤어요. 회고 탭에서 하루를 정리해 주세요.</Text> : null}
      {items.map(item => {
        const available = item.status === 'available';
        const completed = item.status === 'completed';
        return <View key={item.message.id} style={[styles.item, available && styles.current]}>
          <View style={styles.heading}><Text style={styles.time}>{item.message.time}</Text><Text style={styles.status}>{statusLabel(item)}</Text></View>
          {available ? <Text style={styles.eyebrow}>지금 강아지가 원하는 것</Text> : null}
          <Text style={styles.itemTitle}>{item.message.title}</Text>
          <Text style={styles.window}>{careWindowLabel(item)}</Text>
          {(available || completed || detailsOpen) ? <Text style={styles.body}>{completed ? item.message.completedMessage : item.message.message}</Text> : null}
          {available ? <Pressable accessibilityRole="button" accessibilityLabel={item.message.actionLabel + ': ' + item.message.title} onPress={() => onComplete(item.message.id)} style={styles.action}><Text style={styles.actionText}>{item.message.actionLabel}</Text><Text style={styles.actionText}>→</Text></Pressable> : null}
          {completed ? <Text accessibilityLiveRegion="polite" style={styles.done}>{completedCareLabel(item.response)}</Text> : null}
          {item.status === 'missed' ? <Text style={styles.missed}>놓친 돌봄 · 돌봄 지속성 조정 -2</Text> : null}
        </View>;
      })}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: detailsOpen }} onPress={() => setDetailsOpen(value => !value)} style={styles.toggle}><Text style={styles.toggleText}>{detailsOpen ? '루틴 설명 접기' : '루틴 설명 펼쳐보기'}</Text></Pressable>
      {detailsOpen ? <Text style={styles.intro}>완료 가능 시간이 끝나면 놓침으로 기록됩니다. 놓친 요청은 돌봄 지속성에서 2점씩, 7일 합계 최대 30점까지 조정돼요. 완료한 시각은 각 요청에 남습니다.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inbox: { marginBottom: 20 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  eyebrow: { color: '#64745F', fontWeight: '800', fontSize: 10, marginBottom: 5 },
  title: { color: '#294334', fontSize: 22, fontWeight: '900' },
  count: { color: '#31533D', fontSize: 12, fontWeight: '800' },
  intro: { color: '#697367', fontSize: 12, lineHeight: 18, marginTop: 8 },
  item: { backgroundColor: '#EEEAE0', borderRadius: 14, padding: 14, marginTop: 10 },
  current: { backgroundColor: '#E3ECD9', borderWidth: 1, borderColor: '#66805B' },
  time: { color: '#49634F', fontSize: 12, fontWeight: '900' },
  status: { color: '#355844', fontSize: 12, fontWeight: '800' },
  itemTitle: { color: '#273E30', fontSize: 16, lineHeight: 22, fontWeight: '800', marginTop: 5 },
  window: { color: '#5F655D', fontSize: 12, lineHeight: 18, marginTop: 5 },
  body: { color: '#5F655D', fontSize: 13, lineHeight: 20, marginTop: 6 },
  action: { minHeight: 48, backgroundColor: '#355844', borderRadius: 24, paddingHorizontal: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionText: { color: '#FBF7ED', fontSize: 14, fontWeight: '800' },
  done: { color: '#3E6845', fontSize: 12, lineHeight: 18, fontWeight: '800', marginTop: 8 },
  missed: { color: '#8A4F42', fontSize: 12, lineHeight: 18, marginTop: 8 },
  toggle: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  toggleText: { color: '#49634F', fontSize: 12, fontWeight: '800', textDecorationLine: 'underline' },
});
