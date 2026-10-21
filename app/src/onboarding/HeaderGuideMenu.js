import { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ONBOARDING_GUIDE_STEPS } from './guideSteps';

// Viewing these guides never changes the saved simulation or its drafts.
export function HeaderGuideMenu() {
  const [menu, setMenu] = useState(null);
  const [step, setStep] = useState(0);
  const close = () => setMenu(null);
  const guide = ONBOARDING_GUIDE_STEPS[step];
  return <>
    <Pressable accessibilityRole="button" onPress={() => setMenu('education')} style={styles.link}><Text style={styles.linkText}>교육 콘텐츠</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => { setStep(0); setMenu('onboarding'); }} style={styles.link}><Text style={styles.linkText}>온보딩 다시 보기</Text></Pressable>
    <Modal visible={menu !== null} animationType="slide" onRequestClose={close} presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}><Text style={styles.label}>{menu === 'education' ? '교육 콘텐츠' : '온보딩 다시 보기'}</Text><Pressable accessibilityRole="button" accessibilityLabel="안내 닫기" style={styles.link} onPress={close}><Text style={styles.linkText}>닫기</Text></Pressable></View>
        <ScrollView contentContainerStyle={styles.page}>
          {menu === 'education' ? <><Text accessibilityRole="header" style={styles.title}>교육 콘텐츠를 준비하고 있어요.</Text><Text style={styles.body}>강아지를 이해하고 함께 살아가는 데 도움이 되는 짧은 글과 그림을 준비하고 있어요. 전문가 검토를 마친 뒤 이곳에서 안내해 드릴게요.</Text><Pressable accessibilityRole="button" style={styles.button} onPress={close}><Text style={styles.buttonText}>이전 화면으로 돌아가기</Text></Pressable></> : <>
            <Text accessibilityLiveRegion="polite" style={styles.label}>{step + 1} / {ONBOARDING_GUIDE_STEPS.length}</Text>
            <Text accessibilityRole="header" style={styles.title}>{guide.title}</Text><Text style={styles.body}>{guide.body}</Text>
            <Text style={styles.note}>다시 보기를 마쳐도 기존 돌봄 기록과 입력한 내용은 그대로 유지돼요.</Text>
            <Pressable accessibilityRole="button" style={styles.button} onPress={() => step < ONBOARDING_GUIDE_STEPS.length - 1 ? setStep(step + 1) : close()}><Text style={styles.buttonText}>{step < ONBOARDING_GUIDE_STEPS.length - 1 ? '다음' : '이전 화면으로 돌아가기'}</Text></Pressable>
            {step > 0 ? <Pressable accessibilityRole="button" style={styles.link} onPress={() => setStep(step - 1)}><Text style={styles.linkText}>이전</Text></Pressable> : null}
          </>}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F1E9' },
  top: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#DCD6CB' },
  link: { minHeight: 44, justifyContent: 'center', paddingVertical: 8 },
  linkText: { fontSize: 14, color: '#254236', fontWeight: '600' },
  page: { padding: 24, paddingBottom: 48 },
  label: { fontSize: 14, color: '#526553' },
  title: { fontSize: 30, lineHeight: 38, color: '#20352C', fontWeight: '700', marginTop: 24 },
  body: { fontSize: 16, lineHeight: 26, color: '#526052', marginTop: 20 },
  note: { fontSize: 14, lineHeight: 22, color: '#526052', marginTop: 24 },
  button: { minHeight: 52, padding: 16, backgroundColor: '#C4DC9D', marginTop: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 16, color: '#173126', fontWeight: '700' },
});
