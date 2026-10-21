import { useEffect, useRef, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ONBOARDING_GUIDE_STEPS } from './guideSteps';

const GUIDE_IMAGES = {
  intro: require('../../assets/usage-guide/01-intro.jpg'),
  conditions: require('../../assets/usage-guide/02-conditions.jpg'),
  profiles: require('../../assets/usage-guide/03-profiles.jpg'),
  care: require('../../assets/usage-guide/04-care.jpg'),
  reflection: require('../../assets/usage-guide/05-reflection.jpg'),
};

// Viewing these guides never changes the saved simulation or its drafts.
export function HeaderGuideMenu() {
  const { width } = useWindowDimensions();
  const screenshotWidth = Math.max(0, Math.min(width, 430) - 48);
  const [menu, setMenu] = useState(null);
  const [step, setStep] = useState(0);
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [step, menu]);
  const close = () => setMenu(null);
  const guide = ONBOARDING_GUIDE_STEPS[step];
  return <>
    <Pressable accessibilityRole="button" onPress={() => setMenu('education')} style={styles.link}><Text style={styles.linkText}>교육 콘텐츠</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => { setStep(0); setMenu('onboarding'); }} style={styles.link}><Text style={styles.linkText}>사용법</Text></Pressable>
    <Modal visible={menu !== null} animationType="slide" onRequestClose={close} presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}><Text style={styles.label}>{menu === 'education' ? '교육 콘텐츠' : '사용법'}</Text><Pressable accessibilityRole="button" accessibilityLabel="안내 닫기" style={styles.link} onPress={close}><Text style={styles.linkText}>닫기</Text></Pressable></View>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.page}>
          {menu === 'education' ? <><Text accessibilityRole="header" style={styles.title}>교육 콘텐츠를 준비하고 있어요.</Text><Text style={styles.body}>강아지를 이해하고 함께 살아가는 데 도움이 되는 짧은 글과 그림을 준비하고 있어요. 전문가 검토를 마친 뒤 이곳에서 안내해 드릴게요.</Text><Pressable accessibilityRole="button" style={styles.button} onPress={close}><Text style={styles.buttonText}>이전 화면으로 돌아가기</Text></Pressable></> : <>
            <Text accessibilityLiveRegion="polite" style={styles.label}>{step + 1} / {ONBOARDING_GUIDE_STEPS.length}</Text>
            <Text accessibilityRole="header" style={styles.title}>{guide.title}</Text><Text style={styles.body}>{guide.body}</Text>
            <View style={styles.action}><Text style={styles.actionLabel}>이 화면에서 할 일</Text><Text style={styles.actionText}>{guide.action}</Text></View>
            <Text style={styles.caption}>실제 앱 화면 예시</Text><Image source={GUIDE_IMAGES[guide.screenshotKey]} accessible accessibilityRole="image" accessibilityLabel={guide.altText} style={[styles.screenshot, { width: screenshotWidth, height: screenshotWidth * 720 / 430 }]} resizeMode="contain" />
            <Text style={styles.note}>다시 보기를 마쳐도 기존 돌봄 기록과 입력한 내용은 그대로 유지돼요.</Text>
            <Pressable accessibilityRole="button" style={styles.button} onPress={() => step < ONBOARDING_GUIDE_STEPS.length - 1 ? setStep(step + 1) : close()}><Text style={styles.buttonText}>{step < ONBOARDING_GUIDE_STEPS.length - 1 ? '다음' : '사용법 닫기'}</Text></Pressable>
            {step > 0 ? <Pressable accessibilityRole="button" style={styles.link} onPress={() => setStep(step - 1)}><Text style={styles.linkText}>이전</Text></Pressable> : null}
          </>}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: '#F5F1E9' },
  top: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#DCD6CB' },
  link: { minHeight: 44, justifyContent: 'center', paddingVertical: 8 },
  linkText: { fontSize: 14, color: '#254236', fontWeight: '600' },
  page: { padding: 24, paddingBottom: 48 },
  label: { fontSize: 14, color: '#526553' },
  title: { fontSize: 26, lineHeight: 34, color: '#20352C', fontWeight: '700', marginTop: 24 },
  body: { fontSize: 16, lineHeight: 26, color: '#526052', marginTop: 20 },
  screenshot: { backgroundColor: '#F5F1E9', borderWidth: 1, borderColor: '#DCD6CB', borderRadius: 8 },
  caption: { fontSize: 13, color: '#526052', marginTop: 22, marginBottom: 8 },
  action: { backgroundColor: '#E2E9D6', padding: 16, marginTop: 20, borderRadius: 8 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#254236', marginBottom: 6 },
  actionText: { fontSize: 16, lineHeight: 25, color: '#254236' },
  note: { fontSize: 14, lineHeight: 22, color: '#526052', marginTop: 24 },
  button: { minHeight: 52, padding: 16, backgroundColor: '#C4DC9D', marginTop: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 16, color: '#173126', fontWeight: '700' },
});
