import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { COMPANION_APPEARANCE_PRESETS, COMPANION_AUDIO_SESSION_POLICY, DEFAULT_COMPANION_PRESET_ID, companionExpressionFor, companionMotionEnabled, companionPresetById, companionSoundCanPlay } from './companionEngine';

function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => { if (active) setReduceMotion(enabled); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription?.remove(); };
  }, []);
  return reduceMotion;
}

function useCompanionMotion(motionId, reduceMotion) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    if (!companionMotionEnabled(motionId, reduceMotion)) return undefined;
    const duration = ['ready_bounce', 'happy_bounce', 'play_bow'].includes(motionId) ? 520 : 1050;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(progress, { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [motionId, progress, reduceMotion]);
  if (!companionMotionEnabled(motionId, reduceMotion)) return undefined;
  if (motionId === 'gentle_sway') return { transform: [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) }] };
  if (motionId === 'ready_bounce' || motionId === 'happy_bounce') return { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] };
  if (motionId === 'play_bow') return { transform: [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-3deg'] }) }, { scaleY: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }) }] };
  if (motionId === 'alert_pulse') return { transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) }] };
  return { transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.018] }) }] };
}

function DogIllustration({ expression, preset, reduceMotion }) {
  const earShape = preset.earShape === 'upright' ? styles.earUpright : preset.earShape === 'semi_upright' ? styles.earSemiUpright : styles.earDrop;
  const rightEarShape = preset.earShape === 'upright' ? styles.earUprightRight : preset.earShape === 'semi_upright' ? styles.earSemiUprightRight : styles.earDropRight;
  const tailShape = preset.tailShape === 'straight' ? styles.tailStraight : preset.tailShape === 'feathered' ? styles.tailFeathered : styles.tailCurled;
  const showMarking = preset.markingPattern !== 'solid';
  const motionStyle = useCompanionMotion(expression.motionId, reduceMotion);
  const eyeStyle = expression.eyeShape === 'resting' ? styles.eyeResting : expression.eyeShape === 'wide' ? styles.eyeWide : null;
  const browsConcerned = expression.id === 'concerned' || expression.id === 'uncertain';
  const browsAlert = expression.id === 'alert';
  return (
    <Animated.View accessible accessibilityRole="image" accessibilityLabel={`${preset.label} 가상 강아지 상태: ${expression.moodLabel}`} accessibilityHint={reduceMotion ? '동작 줄이기 설정에 따라 정지된 표정으로 표시됩니다.' : '표정과 짧은 반복 동작으로 현재 상태를 보여줍니다.'} style={[styles.dogWrap, motionStyle]}>
      <View style={styles.groundShadow} />
      <View style={[styles.tail, tailShape, { backgroundColor: preset.colors.body }]} />
      <View style={[styles.body, { backgroundColor: preset.colors.body }]}>
        <View style={[styles.chestPatch, { backgroundColor: preset.colors.accent }]} />
      </View>
      <View style={styles.pawRow}>
        <View style={[styles.paw, { backgroundColor: preset.colors.accent }]}><View style={styles.pawToe} /></View>
        <View style={[styles.paw, { backgroundColor: preset.colors.accent }]}><View style={styles.pawToe} /></View>
      </View>
      <View style={styles.earRow}>
        <View style={[styles.ear, earShape, { backgroundColor: preset.colors.ear }]}><View style={[styles.innerEar, { backgroundColor: preset.colors.accent }]} /></View>
        <View style={[styles.ear, rightEarShape, { backgroundColor: preset.colors.ear }]}><View style={[styles.innerEar, { backgroundColor: preset.colors.accent }]} /></View>
      </View>
      <View style={[styles.neckBand, { backgroundColor: '#64785F' }]}><View style={styles.neckTag} /></View>
      <View style={[styles.face, { backgroundColor: preset.colors.face }]}>
        {showMarking ? <View style={[styles.faceMarking, { backgroundColor: preset.colors.accent }]} /> : null}
        <View style={styles.browRow}>
          <View style={[styles.brow, browsConcerned && styles.browConcernedLeft, browsAlert && styles.browAlertLeft]} />
          <View style={[styles.brow, browsConcerned && styles.browConcernedRight, browsAlert && styles.browAlertRight]} />
        </View>
        <View style={styles.eyeRow}><View style={[styles.eye, eyeStyle]} /><View style={[styles.eye, eyeStyle]} /></View>
        <View style={[styles.blush, styles.blushLeft]} /><View style={[styles.blush, styles.blushRight]} />
        <View style={[styles.muzzle, { backgroundColor: preset.colors.accent }]}><View style={styles.nose} /><Text style={styles.mouth}>{expression.mouth}</Text></View>
      </View>
    </Animated.View>
  );
}

function PresetPicker({ selectedId, onSelect }) {
  return <View style={styles.presetSection}><View style={styles.presetHeading}><Text style={styles.presetTitle}>함께할 모습</Text><Text style={styles.presetHint}>모습만 바뀌며 돌봄 조건과 점수는 같아요.</Text></View><View style={styles.presetRow}>{COMPANION_APPEARANCE_PRESETS.map((preset) => { const selected = preset.id === selectedId; return <Pressable key={preset.id} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${preset.label}, ${preset.description}`} onPress={() => onSelect(preset.id)} style={[styles.presetButton, selected && styles.presetButtonSelected]}><View style={[styles.presetSwatch, { backgroundColor: preset.colors.face }]}><View style={[styles.presetSwatchAccent, { backgroundColor: preset.colors.accent }]} /></View><Text style={[styles.presetLabel, selected && styles.presetLabelSelected]}>{preset.shortLabel}</Text></Pressable>; })}</View></View>;
}

function BarkControls({ event, soundEnabled, onSoundEnabled }) {
  const [soundError, setSoundError] = useState(false);
  const [playbackState, setPlaybackState] = useState('idle');
  const barkPlayer = useAudioPlayer(require('../../assets/audio/dog-bark-george-public-domain.mp3'), { downloadFirst: true });
  const barkStatus = useAudioPlayerStatus(barkPlayer);
  useEffect(() => { setAudioModeAsync(COMPANION_AUDIO_SESSION_POLICY).catch(() => setSoundError(true)); }, []);
  useEffect(() => { if (!soundEnabled) barkPlayer.pause(); }, [barkPlayer, soundEnabled]);
  useEffect(() => {
    if (barkStatus.playing) setPlaybackState('playing');
    if (barkStatus.didJustFinish) setPlaybackState('completed');
  }, [barkStatus.didJustFinish, barkStatus.playing]);
  async function playBark() {
    if (!companionSoundCanPlay({ soundEnabled }, event, true)) return;
    try {
      setSoundError(false);
      setPlaybackState('starting');
      await barkPlayer.seekTo(0);
      barkPlayer.play();
    } catch {
      setPlaybackState('idle');
      setSoundError(true);
    }
  }
  function muteBark() {
    barkPlayer.pause();
    setPlaybackState('idle');
    onSoundEnabled(false);
  }
  const playbackLabel = playbackState === 'playing' || playbackState === 'starting' ? '짖음 재생 중' : playbackState === 'completed' ? '짖음 재생 완료' : '';
  return <View style={styles.soundPanel}><Text accessibilityLabel="강아지가 두 번 짖는 소리" style={styles.sound}>멍! 멍!</Text><Text style={styles.soundPolicy}>{soundEnabled ? '소리 켜짐 · 직접 눌러 재생 · 무음 모드 존중' : '소리 꺼짐 · 자막은 항상 표시돼요.'}</Text><View style={styles.soundActions}>{soundEnabled ? <><Pressable accessibilityRole="button" accessibilityLabel="짖음 소리 한 번 재생" onPress={playBark} style={styles.soundPrimary}><Text style={styles.soundPrimaryText}>짖음 듣기</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="강아지 소리 끄기" onPress={muteBark} style={styles.soundSecondary}><Text style={styles.soundSecondaryText}>소리 끄기</Text></Pressable></> : <Pressable accessibilityRole="button" accessibilityLabel="강아지 소리 켜기, 자동 재생 안 함" onPress={() => onSoundEnabled(true)} style={styles.soundSecondary}><Text style={styles.soundSecondaryText}>소리 켜기</Text></Pressable>}</View>{playbackLabel ? <Text accessibilityRole="text" accessibilityLiveRegion="polite" style={styles.soundStatus}>{playbackLabel}</Text> : null}{soundError ? <Text accessibilityRole="alert" style={styles.soundError}>소리를 재생하지 못했어요. 자막으로 계속 확인할 수 있어요.</Text> : null}</View>;
}

export function CompanionHero({ event, presetId = DEFAULT_COMPANION_PRESET_ID, profileName }) {
  const preset = companionPresetById(presetId) || companionPresetById(DEFAULT_COMPANION_PRESET_ID);
  const expression = companionExpressionFor(event);
  const reduceMotion = useReduceMotion();
  return <View style={styles.heroCard} accessibilityLabel={`오늘 곁에 있는 ${preset.label} 가상 강아지, ${profileName}, 지금 기분 ${expression.moodLabel}`}><Text style={styles.heroEyebrow}>나란히 · 오늘 곁의 강아지</Text><View style={styles.heroTop}><DogIllustration expression={expression} preset={preset} reduceMotion={reduceMotion} /><View style={styles.copy}><Text style={styles.heroLabel}>오늘 곁에 있는 강아지</Text><Text style={styles.heroName}>{profileName}</Text><Text style={styles.heroMood}>지금 기분 · {expression.moodLabel}</Text><Text style={styles.heroScene}>{event.title}</Text></View></View></View>;
}

export function CompanionEventPanel({ event, response, soundEnabled = false, onSoundEnabled, onRespond }) {
  return <View style={styles.card} accessibilityLabel="오늘의 생활 사건과 돌봄 대응"><Text style={styles.eventEyebrow}>오늘의 생활 장면</Text><Text style={styles.eventTitle}>생활 사건과 대응</Text><Text style={styles.title}>{event.title}</Text><Text style={styles.request}>{event.request}</Text>{event.soundCue === 'bark_text_only' ? <BarkControls event={event} soundEnabled={soundEnabled} onSoundEnabled={onSoundEnabled} /> : null}{response ? <View style={styles.feedback}><Text style={styles.feedbackLabel}>내가 선택한 돌봄</Text><Text style={styles.feedbackText}>{response.feedback}</Text></View> : <View style={styles.choices}>{event.choices.map((choice) => <Pressable accessibilityRole="button" key={choice.id} onPress={() => onRespond(choice.id)} style={styles.choice}><Text style={styles.choiceText}>{choice.label}</Text><Text style={styles.arrow}>→</Text></Pressable>)}</View>}<Text style={styles.boundary}>선택한 대응을 바탕으로 오늘의 돌봄을 돌아봐요.</Text></View>;
}

export function CompanionAppearanceSettings({ presetId = DEFAULT_COMPANION_PRESET_ID, onSelectPreset }) {
  const [expanded, setExpanded] = useState(false);
  const preset = companionPresetById(presetId) || companionPresetById(DEFAULT_COMPANION_PRESET_ID);
  return <View style={styles.settingsCard}><Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={styles.settingsToggle}><View style={styles.settingsCopy}><Text style={styles.settingsEyebrow}>설정 · 함께할 모습</Text><Text style={styles.settingsTitle}>함께할 모습은 설정에서 바꿔요</Text><Text style={styles.settingsHint}>현재 {preset.shortLabel} · 모습만 바뀌며 돌봄 조건과 점수는 같아요.</Text></View><Text style={styles.settingsButton}>{expanded ? '외형 설정 접기' : '외형 설정 열기'}</Text></Pressable>{expanded ? <PresetPicker selectedId={preset.id} onSelect={onSelectPreset} /> : null}</View>;
}

const styles = StyleSheet.create({
  heroCard: { backgroundColor: '#E4EBD8', borderRadius: 20, padding: 17, marginBottom: 18, borderWidth: 1, borderColor: '#C6D2BA' },
  heroEyebrow: { color: '#61715D', fontSize: 9, lineHeight: 13, fontWeight: '900', letterSpacing: 1.1, marginBottom: 4 },
  heroTop: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  heroLabel: { color: '#5E715C', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  heroName: { color: '#244032', fontSize: 20, lineHeight: 25, fontWeight: '900', marginTop: 4 },
  heroMood: { color: '#49634F', fontSize: 12, lineHeight: 17, fontWeight: '900', marginTop: 7 },
  heroScene: { color: '#5E685F', fontSize: 11, lineHeight: 16, marginTop: 4 },
  card: { backgroundColor: '#E9E1D2', borderRadius: 18, padding: 16, marginBottom: 22, borderWidth: 1, borderColor: '#D3C4AF' },
  eventEyebrow: { color: '#6D604F', fontSize: 9, lineHeight: 13, fontWeight: '900', letterSpacing: 1.1 },
  eventTitle: { color: '#294334', fontSize: 18, lineHeight: 24, fontWeight: '900', marginTop: 4, marginBottom: 10 },
  presetSection: { paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#CDBFAE' },
  presetHeading: { marginBottom: 10 },
  presetTitle: { color: '#34473A', fontSize: 13, fontWeight: '800' },
  presetHint: { color: '#746C60', fontSize: 10, lineHeight: 15, marginTop: 3 },
  presetRow: { flexDirection: 'row', gap: 8 },
  presetButton: { flex: 1, minHeight: 58, borderWidth: 1, borderColor: '#C7B9A7', borderRadius: 12, backgroundColor: '#F4EDE2', alignItems: 'center', justifyContent: 'center', paddingVertical: 7 },
  presetButtonSelected: { borderWidth: 2, borderColor: '#395C48', backgroundColor: '#F8F4EB' },
  presetSwatch: { width: 25, height: 25, borderRadius: 13, alignItems: 'flex-end', justifyContent: 'flex-end', padding: 2 },
  presetSwatchAccent: { width: 9, height: 9, borderRadius: 5 },
  presetLabel: { color: '#6B6257', fontSize: 11, marginTop: 5, fontWeight: '700' },
  presetLabelSelected: { color: '#244534' },
  top: { flexDirection: 'row', gap: 14, alignItems: 'center' }, copy: { flex: 1 }, kicker: { color: '#6D604F', fontSize: 10, fontWeight: '800', letterSpacing: 0.7 }, title: { color: '#2D3E31', fontSize: 18, lineHeight: 23, fontWeight: '800', marginTop: 5 }, request: { color: '#5E5A4E', fontSize: 13, lineHeight: 19, marginTop: 5 }, mood: { color: '#49634F', fontSize: 11, lineHeight: 16, fontWeight: '800', marginTop: 7 },
  soundPanel: { backgroundColor: '#F5EEE3', borderRadius: 11, padding: 11, marginTop: 12 }, sound: { color: '#7A4D37', fontSize: 14, fontWeight: '800' }, soundPolicy: { color: '#6B6257', fontSize: 10, lineHeight: 15, marginTop: 3 }, soundActions: { flexDirection: 'row', gap: 8, marginTop: 9 }, soundPrimary: { backgroundColor: '#355844', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }, soundPrimaryText: { color: '#FFF9EF', fontSize: 11, fontWeight: '800' }, soundSecondary: { borderWidth: 1, borderColor: '#6A7A68', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }, soundSecondaryText: { color: '#3F5947', fontSize: 11, fontWeight: '800' }, soundStatus: { color: '#49634F', fontSize: 10, lineHeight: 15, fontWeight: '800', marginTop: 8 }, soundError: { color: '#8A433A', fontSize: 10, lineHeight: 15, marginTop: 8 },
  dogWrap: { width: 108, height: 128, alignItems: 'center', justifyContent: 'flex-end' },
  groundShadow: { position: 'absolute', bottom: 1, width: 78, height: 12, borderRadius: 39, backgroundColor: 'rgba(55, 62, 50, 0.14)' },
  earRow: { width: 88, flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', top: 1, zIndex: 3 },
  ear: { width: 32, height: 48, borderRadius: 18, alignItems: 'center', paddingTop: 7 }, innerEar: { width: 14, height: 27, borderRadius: 9, opacity: 0.48 },
  earDrop: { transform: [{ rotate: '-22deg' }] }, earDropRight: { transform: [{ rotate: '22deg' }] },
  earUpright: { width: 26, height: 47, borderRadius: 13, transform: [{ rotate: '-5deg' }] }, earUprightRight: { width: 26, height: 47, borderRadius: 13, transform: [{ rotate: '5deg' }] },
  earSemiUpright: { width: 29, height: 46, borderRadius: 15, transform: [{ rotate: '-12deg' }] }, earSemiUprightRight: { width: 29, height: 46, borderRadius: 15, transform: [{ rotate: '12deg' }] },
  neckBand: { position: 'absolute', top: 79, width: 61, height: 12, borderRadius: 7, zIndex: 2, alignItems: 'center' }, neckTag: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#D8C67E', marginTop: 7, borderWidth: 1.5, borderColor: '#F3E9C0' },
  face: { position: 'absolute', top: 25, width: 84, height: 78, borderRadius: 38, alignItems: 'center', paddingTop: 17, zIndex: 4, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(70, 54, 42, 0.08)' },
  faceMarking: { position: 'absolute', width: 34, height: 51, borderRadius: 19, left: 3, top: -4, transform: [{ rotate: '18deg' }], opacity: 0.9 },
  browRow: { width: 39, height: 6, flexDirection: 'row', justifyContent: 'space-between', zIndex: 3 }, brow: { width: 10, height: 2, borderRadius: 2, backgroundColor: 'rgba(55, 43, 36, 0.58)' }, browConcernedLeft: { transform: [{ rotate: '14deg' }] }, browConcernedRight: { transform: [{ rotate: '-14deg' }] }, browAlertLeft: { transform: [{ translateY: -2 }, { rotate: '-5deg' }] }, browAlertRight: { transform: [{ translateY: -2 }, { rotate: '5deg' }] },
  eyeRow: { width: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 10, marginTop: 2, zIndex: 3 }, eye: { width: 7, height: 8, borderRadius: 4, backgroundColor: '#2F2A25', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' }, eyeWide: { width: 8, height: 10 }, eyeResting: { width: 9, height: 2, borderRadius: 1, borderWidth: 0 },
  blush: { position: 'absolute', top: 38, width: 11, height: 5, borderRadius: 6, backgroundColor: 'rgba(184, 106, 92, 0.22)', zIndex: 3 }, blushLeft: { left: 14 }, blushRight: { right: 14 },
  muzzle: { width: 39, height: 29, borderRadius: 18, alignItems: 'center', marginTop: 4, zIndex: 3, opacity: 0.96 }, nose: { width: 12, height: 8, borderRadius: 7, backgroundColor: '#2F2A25', marginTop: 4 }, mouth: { color: '#49382D', fontSize: 13, lineHeight: 14, marginTop: -1 },
  body: { position: 'absolute', bottom: 8, width: 70, height: 49, borderRadius: 29, alignItems: 'center', overflow: 'hidden', zIndex: 1 }, chestPatch: { width: 33, height: 42, borderRadius: 18, marginTop: 5, opacity: 0.9 }, pawRow: { position: 'absolute', bottom: 4, width: 51, flexDirection: 'row', justifyContent: 'space-between', zIndex: 5 }, paw: { width: 20, height: 15, borderRadius: 9, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 3 }, pawToe: { width: 9, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(70,54,42,0.24)' },
  tail: { position: 'absolute', right: 5, bottom: 17, zIndex: 0 },
  tailCurled: { width: 25, height: 25, borderRadius: 14, borderWidth: 6, borderColor: '#E9E1D2', transform: [{ rotate: '15deg' }] },
  tailFeathered: { width: 14, height: 38, borderRadius: 9, transform: [{ rotate: '34deg' }] },
  tailStraight: { width: 10, height: 37, borderRadius: 6, transform: [{ rotate: '49deg' }] },
  choices: { marginTop: 14 }, choice: { minHeight: 46, borderTopWidth: 1, borderTopColor: '#CDBFAE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 10 }, choiceText: { color: '#3E4D40', fontSize: 13, lineHeight: 18, flex: 1 }, arrow: { color: '#667A61', fontSize: 17 }, feedback: { backgroundColor: '#F6F0E5', borderRadius: 10, padding: 12, marginTop: 14 }, feedbackLabel: { color: '#68745F', fontSize: 10, fontWeight: '800', letterSpacing: 1 }, feedbackText: { color: '#3E4D40', fontSize: 13, lineHeight: 19, marginTop: 5 }, boundary: { color: '#7B7367', fontSize: 10, lineHeight: 15, marginTop: 12 },
  settingsCard: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#CFCBC0', paddingVertical: 14, marginTop: 8 },
  settingsToggle: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settingsCopy: { flex: 1 },
  settingsEyebrow: { color: '#71806E', fontSize: 9, lineHeight: 13, fontWeight: '900', letterSpacing: 1 },
  settingsTitle: { color: '#2D4332', fontSize: 14, lineHeight: 19, fontWeight: '900', marginTop: 3 },
  settingsHint: { color: '#6F786E', fontSize: 10, lineHeight: 15, marginTop: 3 },
  settingsButton: { color: '#355438', fontSize: 11, fontWeight: '900', borderWidth: 1, borderColor: '#6A7A68', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
});
