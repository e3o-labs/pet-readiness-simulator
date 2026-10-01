import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PHOTO_AVATAR_SIMULATION_SAMPLES, photoAvatarSampleById } from './companionEngine';

function SimulatedPhoto({ sample, compact = false }) {
  const { colors } = sample;
  return <View accessible accessibilityRole="image" accessibilityLabel={`${sample.label}. 실제 사진이 아닌 앱에서 제공하는 사진 예시입니다.`} style={[styles.photo, compact && styles.photoCompact, { backgroundColor: colors.background }]}>
    <View style={[styles.window, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
    <View style={[styles.floor, { backgroundColor: colors.floor }]} />
    <View style={[styles.tail, { backgroundColor: colors.body }]} />
    <View style={[styles.body, { backgroundColor: colors.body }]}><View style={[styles.chest, { backgroundColor: colors.accent }]} /></View>
    <View style={[styles.ear, styles.earLeft, { backgroundColor: colors.ear }]} />
    <View style={[styles.ear, styles.earRight, { backgroundColor: colors.ear }]} />
    <View style={[styles.face, { backgroundColor: colors.face }]}><View style={styles.eyeRow}><View style={styles.eye} /><View style={styles.eye} /></View><View style={[styles.muzzle, { backgroundColor: colors.accent }]}><View style={styles.nose} /></View></View>
    <View style={styles.photoStamp}><Text style={styles.photoStampText}>앱 내 사진 예시</Text></View>
  </View>;
}

export function PhotoAvatarPanel({ photoAvatarId, onRegister, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState('idle');
  const [previewId, setPreviewId] = useState(null);
  const current = photoAvatarSampleById(photoAvatarId);
  const preview = photoAvatarSampleById(previewId);
  function begin(sampleId) {
    setPreviewId(sampleId);
    setMode('preview');
  }
  function confirm() {
    if (!preview) return;
    onRegister(preview.id);
    setMode('idle');
    setPreviewId(null);
    setExpanded(false);
  }
  function collapse() {
    setExpanded(false);
    setMode('idle');
    setPreviewId(null);
  }
  function remove() {
    onRemove();
    collapse();
  }
  if (!expanded) {
    return <View style={styles.banner} accessibilityLabel="강아지 사진 예시 설정"><View style={styles.bannerCopy}><Text style={styles.eyebrow}>설정 · 사진 예시</Text><Text style={styles.bannerTitle}>{current ? `${current.shortLabel} 사용 중` : '사진 예시 선택은 선택 사항이에요'}</Text><Text style={styles.bannerBody}>오늘의 돌봄 요청과 행동 피드백에는 영향을 주지 않아요.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="강아지 사진 예시 설정 열기" onPress={() => setExpanded(true)} style={styles.bannerAction}><Text style={styles.bannerActionText}>사진 예시 설정</Text></Pressable></View>;
  }
  if (mode === 'preview' && preview) {
    return <View style={styles.panel}><View style={styles.settingsHeader}><Text style={styles.eyebrow}>사진 예시 · 체험</Text><Pressable accessibilityRole="button" onPress={collapse} style={styles.collapseAction}><Text style={styles.collapseText}>사진 예시 설정 접기</Text></Pressable></View><Text style={styles.title}>이 사진 예시를 함께 볼까요?</Text><Text style={styles.bodyText}>앱에서 제공하는 사진 예시를 고르는 체험입니다.</Text><SimulatedPhoto sample={preview} /><Text style={styles.caption}>{preview.label}</Text><Text style={styles.localNotice}>실제 카메라나 사진 보관함은 열지 않으며, 선택한 예시만 이 기기에 저장됩니다.</Text><View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel="이 사진 예시 선택" onPress={confirm} style={styles.primary}><Text style={styles.primaryText}>이 예시 선택</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="사진 예시 목록으로 돌아가기" onPress={() => setMode('source')} style={styles.secondary}><Text style={styles.secondaryText}>다시 고르기</Text></Pressable></View></View>;
  }
  if (mode === 'source') {
    return <View style={styles.panel}><View style={styles.settingsHeader}><Text style={styles.eyebrow}>사진 예시 · 체험</Text><Pressable accessibilityRole="button" onPress={collapse} style={styles.collapseAction}><Text style={styles.collapseText}>사진 예시 설정 접기</Text></Pressable></View><Text style={styles.title}>어떤 사진 예시를 볼까요?</Text><Text style={styles.bodyText}>두 선택 모두 앱에서 제공하는 사진 예시를 고르는 체험입니다.</Text><View style={styles.optionRow}>{PHOTO_AVATAR_SIMULATION_SAMPLES.map((sample) => <Pressable key={sample.id} accessibilityRole="button" accessibilityLabel={`${sample.sourceLabel}, ${sample.description}`} onPress={() => begin(sample.id)} style={styles.option}><SimulatedPhoto sample={sample} compact /><Text style={styles.optionTitle}>{sample.sourceLabel}</Text><Text style={styles.optionBody}>{sample.source === 'camera' ? '창가에서 쉬는 모습을 확인해요' : '쿠션에서 쉬는 모습을 확인해요'}</Text></Pressable>)}</View><Pressable accessibilityRole="button" onPress={() => setMode('idle')} style={styles.textAction}><Text style={styles.textActionLabel}>기본 모습으로 돌아가기</Text></Pressable></View>;
  }
  return <View style={styles.panel}><View style={styles.settingsHeader}><Text style={styles.eyebrow}>설정 · 사진 예시</Text><Pressable accessibilityRole="button" onPress={collapse} style={styles.collapseAction}><Text style={styles.collapseText}>사진 예시 설정 접기</Text></Pressable></View>{current ? <><View style={styles.activeHeader}><View><Text style={styles.title}>선택한 사진 예시를 보고 있어요</Text></View><Text style={styles.activeMark}>✓</Text></View><View style={styles.activeBody}><SimulatedPhoto sample={current} compact /><View style={styles.activeCopy}><Text style={styles.caption}>{current.shortLabel}</Text><Text style={styles.bodyText}>이 사진 예시는 표정·점수·난이도를 바꾸지 않아요.</Text><Text style={styles.localNotice}>이 선택은 앱 내 체험용 예시이며 실제 사진을 등록하지 않습니다.</Text></View></View><View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => setMode('source')} style={styles.secondary}><Text style={styles.secondaryText}>사진 예시 바꾸기</Text></Pressable><Pressable accessibilityRole="button" onPress={remove} style={styles.remove}><Text style={styles.removeText}>사진 예시 지우기</Text></Pressable></View></> : <><Text style={styles.title}>사진 예시를 함께 볼까요?</Text><Text style={styles.bodyText}>앱에서 제공하는 사진 예시를 고르는 흐름을 미리 체험할 수 있어요.</Text><Pressable accessibilityRole="button" accessibilityLabel="강아지 사진 예시 선택 체험 시작" onPress={() => setMode('source')} style={styles.primary}><Text style={styles.primaryText}>사진 예시 선택</Text><Text style={styles.primaryArrow}>→</Text></Pressable><Text style={styles.localNotice}>실제 사진 권한·업로드·모델 학습은 하지 않아요.</Text></>}</View>;
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#EEEAE1', borderWidth: 1, borderColor: '#D3CFC4', borderRadius: 12, padding: 12, marginTop: -8, marginBottom: 22, flexDirection: 'row', alignItems: 'center', gap: 12 }, bannerCopy: { flex: 1 }, bannerTitle: { color: '#34473A', fontSize: 12, lineHeight: 17, fontWeight: '900', marginTop: 3 }, bannerBody: { color: '#706E66', fontSize: 10, lineHeight: 15, marginTop: 2 }, bannerAction: { borderWidth: 1, borderColor: '#657A65', borderRadius: 17, paddingHorizontal: 10, paddingVertical: 8 }, bannerActionText: { color: '#355844', fontSize: 10, fontWeight: '900' },
  panel: { backgroundColor: '#F7F1E6', borderWidth: 1, borderColor: '#D1C2AA', borderRadius: 14, padding: 13, marginBottom: 14 },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, collapseAction: { paddingVertical: 4, paddingLeft: 8 }, collapseText: { color: '#5A6859', fontSize: 10, fontWeight: '800', textDecorationLine: 'underline' },
  eyebrow: { color: '#68765E', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }, title: { color: '#2D4031', fontSize: 16, lineHeight: 21, fontWeight: '900', marginTop: 5 }, bodyText: { color: '#625E55', fontSize: 11, lineHeight: 17, marginTop: 5 },
  photo: { height: 150, borderRadius: 12, overflow: 'hidden', marginTop: 13, position: 'relative', justifyContent: 'flex-end', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(62, 57, 47, 0.14)' }, photoCompact: { width: 92, height: 86, marginTop: 0 },
  window: { position: 'absolute', top: 10, right: 13, width: 43, height: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.55)' }, floor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%' }, body: { position: 'absolute', bottom: 18, width: 78, height: 49, borderRadius: 29, alignItems: 'center', overflow: 'hidden' }, chest: { width: 31, height: 42, borderRadius: 18, marginTop: 6, opacity: 0.9 }, tail: { position: 'absolute', bottom: 31, left: '57%', width: 28, height: 10, borderRadius: 6, transform: [{ rotate: '25deg' }] },
  face: { position: 'absolute', bottom: 54, width: 70, height: 63, borderRadius: 34, alignItems: 'center', paddingTop: 21 }, ear: { position: 'absolute', bottom: 82, width: 24, height: 40, borderRadius: 14 }, earLeft: { left: '35%', transform: [{ rotate: '-24deg' }] }, earRight: { right: '35%', transform: [{ rotate: '24deg' }] }, eyeRow: { flexDirection: 'row', width: 33, justifyContent: 'space-between' }, eye: { width: 6, height: 7, borderRadius: 4, backgroundColor: '#2F2A25' }, muzzle: { width: 32, height: 20, borderRadius: 12, marginTop: 5, alignItems: 'center', paddingTop: 4 }, nose: { width: 10, height: 6, borderRadius: 6, backgroundColor: '#2F2A25' },
  photoStamp: { position: 'absolute', right: 7, bottom: 6, backgroundColor: 'rgba(37, 54, 42, 0.72)', paddingHorizontal: 5, paddingVertical: 3 }, photoStampText: { color: '#F7F3E8', fontSize: 7, fontWeight: '900', letterSpacing: 0.6 }, caption: { color: '#334B38', fontSize: 12, fontWeight: '900', marginTop: 8 }, localNotice: { color: '#7A6654', fontSize: 10, lineHeight: 15, marginTop: 7 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }, primary: { minHeight: 41, borderRadius: 21, backgroundColor: '#355844', paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 13 }, primaryText: { color: '#FFF9EF', fontSize: 12, fontWeight: '900' }, primaryArrow: { color: '#CDE2AD', fontSize: 16, fontWeight: '900' }, secondary: { minHeight: 38, borderRadius: 19, borderWidth: 1, borderColor: '#657A65', paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' }, secondaryText: { color: '#355844', fontSize: 11, fontWeight: '900' }, remove: { minHeight: 38, borderRadius: 19, borderWidth: 1, borderColor: '#A77467', paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' }, removeText: { color: '#834C42', fontSize: 11, fontWeight: '900' }, textAction: { alignSelf: 'center', paddingTop: 13, paddingBottom: 1 }, textActionLabel: { color: '#5A6859', fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },
  optionRow: { gap: 9, marginTop: 13 }, option: { minHeight: 98, borderWidth: 1, borderColor: '#D3C5B0', borderRadius: 12, backgroundColor: '#FCF8EF', padding: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }, optionTitle: { color: '#31493A', fontSize: 12, fontWeight: '900', position: 'absolute', top: 15, left: 111 }, optionBody: { color: '#6B665D', fontSize: 10, lineHeight: 15, position: 'absolute', top: 35, left: 111, right: 11 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, activeMark: { color: '#355844', fontSize: 20, fontWeight: '900' }, activeBody: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 }, activeCopy: { flex: 1 },
});
