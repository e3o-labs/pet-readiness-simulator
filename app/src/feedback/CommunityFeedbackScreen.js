import { useState } from 'react';
import { Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from '../KeyboardAwareScrollView';
import { openCommunityLink } from './communityLinks';

const OPTIONS = [
  ['experience', '사용 경험 공유', '어느 화면에서 무엇이 어렵거나 좋았는지 알려주세요.'],
  ['feature', '기능 제안', '해결하고 싶은 문제와 가장 작은 개선을 제안해 주세요.'],
  ['roadmap', '다음 작업 살펴보기', '공개 알파에서 준비 중인 작업을 볼 수 있어요.'],
  ['contribute', '작은 기여 시작하기', '문서, UX, 테스트, 코드, 연구로 함께할 수 있어요.'],
];

export function CommunityFeedbackScreen({ header, onReturn }) {
  const [error, setError] = useState('');
  async function open(kind) {
    setError('');
    const result = await openCommunityLink(kind, Linking);
    if (result.status !== 'opened') setError('페이지를 열지 못했어요. 연결 상태를 확인하고 다시 눌러주세요.');
  }
  return (
    <SafeAreaView style={styles.safe}>
      {header}
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.eyebrow}>함께 만드는 서비스</Text>
        <Text accessibilityRole="header" style={styles.title}>어떤 점이{`\n`}더 나아지면 좋을까요?</Text>
        <Text style={styles.intro}>작은 불편부터 새로운 아이디어까지, 다음 개선을 함께 정해요.</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>GitHub의 공개 공간으로 이동해요</Text>
          <Text style={styles.body}>글을 남기려면 GitHub 로그인이 필요해요. 작성한 내용은 누구나 볼 수 있으니 연락처, 실제 돌봄 기록, 개인 사정이나 건강 정보는 적지 마세요.</Text>
          <Text style={styles.body}>이 기기의 생활 조건과 연습 기록은 자동으로 첨부되지 않아요.</Text>
        </View>
        {OPTIONS.map(([kind, title, description]) => (
          <Pressable key={kind} accessibilityRole="link" accessibilityLabel={title + ', GitHub 열기'} onPress={() => open(kind)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
            <View style={styles.optionHeading}><Text style={styles.optionTitle}>{title}</Text><Text aria-hidden style={styles.arrow}>↗</Text></View>
            <Text style={styles.description}>{description}</Text>
          </Pressable>
        ))}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Text style={styles.hint}>관리자가 비슷한 의견을 묶고 검토 결과를 연결해요. 기능 채택이나 개발 일정이 바로 확정되지는 않아요.</Text>
        <Pressable accessibilityRole="button" onPress={onReturn} style={styles.returnButton}><Text style={styles.returnText}>이전 화면으로 돌아가기</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F1E9' },
  page: { padding: 24, paddingBottom: 52, width: '100%', maxWidth: 680, alignSelf: 'center' },
  eyebrow: { color: '#526553', fontWeight: '700', fontSize: 12 },
  title: { color: '#20352C', fontSize: 32, lineHeight: 39, fontWeight: '700', marginTop: 12 },
  intro: { color: '#5E685F', fontSize: 15, lineHeight: 23, marginTop: 14, marginBottom: 22 },
  notice: { backgroundColor: '#E2E9D6', borderLeftWidth: 3, borderLeftColor: '#56754B', padding: 16, marginBottom: 20 },
  noticeTitle: { color: '#254235', fontWeight: '700', fontSize: 15, lineHeight: 22 },
  body: { color: '#435845', fontSize: 14, lineHeight: 22, marginTop: 8 },
  option: { minHeight: 72, paddingVertical: 17, borderTopWidth: 1, borderTopColor: '#C7CBBF' },
  pressed: { backgroundColor: '#DFE8CF' },
  optionHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  optionTitle: { flex: 1, color: '#254235', fontSize: 16, fontWeight: '700', lineHeight: 24 },
  arrow: { color: '#254235', fontSize: 20 },
  description: { color: '#5E685F', fontSize: 14, lineHeight: 22, marginTop: 6 },
  error: { color: '#7A403A', fontSize: 14, lineHeight: 22, marginTop: 14 },
  hint: { color: '#526553', fontSize: 13, lineHeight: 21, marginTop: 18 },
  returnButton: { minHeight: 50, borderWidth: 1, borderColor: '#466247', alignItems: 'center', justifyContent: 'center', marginTop: 25 },
  returnText: { color: '#355139', fontWeight: '700', fontSize: 14 },
});
