import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { READINESS_LEARNING_CARDS, isPublishedLearningCard } from '../content/readinessLearning';
import { LEARNING_SCENE_IMAGES } from '../content/learningSceneImages';

export function LearningArticle({ card }) {
  const { width } = useWindowDimensions();
  const sceneWidth = Math.max(0, Math.min(width, 430) - 48);
  const [linkError, setLinkError] = useState(false);
  if (!isPublishedLearningCard(card)) return null;
  const openSource = async (url) => { try { await Linking.openURL(url); setLinkError(false); } catch { setLinkError(true); } };
  return <View>
    <Text style={styles.meta}>{card.day}일차 · {card.evidenceStatus === 'product_reflection' ? '생활 점검 활동' : '공식 자료를 바탕으로 정리'}</Text>
    <Text accessibilityRole="header" style={styles.title}>{card.title}</Text>
    <Text style={styles.summary}>{card.summary}</Text><Text style={styles.body}>{card.why}</Text>
    {card.infographic.panels.map((panel, index) => <View key={panel.scene} style={styles.panel}>
      <Image source={LEARNING_SCENE_IMAGES[card.day][index]} accessible accessibilityRole="image" accessibilityLabel={panel.altText} style={{ width: sceneWidth, height: sceneWidth * 0.47, borderRadius: 8 }} resizeMode="contain" />
      <Text style={styles.label}>{index + 1}. {panel.title}</Text><Text style={styles.body}>{panel.caption}</Text>
    </View>)}
    <Text style={styles.note}>{card.infographic.contextNote}</Text>
    <View style={styles.action}><Text style={styles.label}>오늘 해볼 행동</Text><Text style={styles.body}>{card.tryToday}</Text></View>
    <Text style={styles.label}>오늘의 질문</Text><Text style={styles.body}>{card.reflectionQuestion}</Text>
    <Text style={styles.note}>{card.boundary}</Text>
    {card.sources.length ? <><Text style={styles.label}>참고한 자료</Text>{card.sources.map(source => <Pressable key={source.url} accessibilityRole="link" onPress={() => openSource(source.url)} style={styles.link}><Text style={styles.linkText}>{source.label} ↗</Text></Pressable>)}<Text style={styles.note}>출처 확인 {card.sourceCheckedAt} · 그림은 상황을 설명하는 삽화예요.</Text></> : null}
    {linkError ? <Text accessibilityRole="alert" style={styles.note}>자료를 열지 못했어요. 연결 상태를 확인하고 다시 눌러주세요.</Text> : null}
  </View>;
}

// Today and the complete library share one entry point in the learning tab.
export function LearningHub({ card, onNavigate }) {
  const [view, setView] = useState('today');
  const selectView = (next) => { setView(next); onNavigate?.(); };
  return <>
    <View style={styles.viewSwitch}>
      {[['today', '오늘의 배움'], ['all', '전체 7일 교육']].map(([id, label]) => <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: view === id }} onPress={() => selectView(id)} style={[styles.viewButton, view === id && styles.viewButtonSelected]}><Text style={[styles.viewButtonText, view === id && styles.viewButtonTextSelected]}>{label}</Text></Pressable>)}
    </View>
    {view === 'today' ? <LearningArticle key={card?.id} card={card} /> : <LearningLibrary onNavigate={onNavigate} />}
  </>;
}

export function LearningLibrary({ onNavigate }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const card = READINESS_LEARNING_CARDS.find(item => item.day === selectedDay);
  return card ? <><Pressable accessibilityRole="button" style={styles.link} onPress={() => { setSelectedDay(null); onNavigate?.(); }}><Text style={styles.linkText}>← 전체 교육 콘텐츠</Text></Pressable><LearningArticle key={card.id} card={card} /></> : <>
    <Text accessibilityRole="header" style={styles.title}>강아지와 함께 살기 전, 알아둘 7가지</Text>
    <Text style={styles.body}>짧은 설명과 그림을 보고 오늘 해볼 행동을 하나씩 준비해요.</Text>
    {READINESS_LEARNING_CARDS.filter(isPublishedLearningCard).map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => { setSelectedDay(item.day); onNavigate?.(); }} style={styles.card}><Text style={styles.meta}>{item.day}일차</Text><Text style={styles.label}>{item.title} →</Text><Text style={styles.body}>{item.summary}</Text></Pressable>)}
  </>;
}
const styles = StyleSheet.create({
  viewSwitch: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  viewButton: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: '#486548', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  viewButtonSelected: { backgroundColor: '#355844' },
  viewButtonText: { color: '#355844', fontSize: 15, fontWeight: '700' },
  viewButtonTextSelected: { color: '#FBF7ED' },
  meta: { color: '#617052', fontSize: 13, marginTop: 16 }, title: { color: '#20352C', fontSize: 26, lineHeight: 34, fontWeight: '700', marginTop: 12 }, summary: { color: '#254236', fontSize: 18, lineHeight: 27, marginVertical: 16 }, body: { color: '#526052', fontSize: 16, lineHeight: 26, marginTop: 8 }, label: { color: '#254236', fontSize: 17, lineHeight: 25, fontWeight: '700', marginTop: 14 }, panel: { marginTop: 24 }, note: { color: '#617052', fontSize: 14, lineHeight: 22, marginTop: 20 }, action: { backgroundColor: '#E2E9D6', borderRadius: 8, padding: 16, marginTop: 24 }, link: { minHeight: 44, justifyContent: 'center', paddingVertical: 12 }, linkText: { color: '#254236', fontSize: 15, lineHeight: 23, textDecorationLine: 'underline' }, card: { padding: 16, backgroundColor: '#FBF9F3', borderWidth: 1, borderColor: '#DCD6CB', borderRadius: 8, marginTop: 16 },
});
