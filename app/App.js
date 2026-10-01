import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Linking, Platform, Pressable as NativePressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from './src/KeyboardAwareScrollView';
import { reconcileSimulationCalendar, saveDailyReflection } from './src/companion/calendarProgress';
import { COMPANION_APP_VERSION } from './src/companion/companionEngine';
import * as Notifications from 'expo-notifications';
import { createReminderScheduler, validReminderSchedule } from './src/reminders/missionReminders';
import { ReminderSettings } from './src/reminders/ReminderSettings';
import { DOG_PROFILES, profileRecommendationContext, profileSizeLabel, recommendProfiles } from './src/content/dogProfiles';
import { EVENT_OPTIONS, MISSIONS } from './src/content/missionPack';
import { calculateReadiness } from './src/core/readiness';
import { REPORT_EVIDENCE_BOUNDARY, suggestionAccessibilityLabel, supportingEvidenceText } from './src/report/reportPresentation';
import { clearAllLocalData, clearProgress, loadFeedbackQueue, loadFeedbackReceipts, loadProgress, saveFeedbackQueue, saveFeedbackReceipts, saveProgress } from './src/storage';
import { HYDRATION_STATUS, loadStorageHydration, runHydratedEffect } from './src/storageHydration';
import { createFeedbackItem, enqueueFeedback, preserveFeedbackQueueOnSimulationReset } from './src/feedback/feedbackLifecycle';
import { createFeedbackDeliveryCoordinator } from './src/feedback/feedbackDeliveryCoordinator';
import { flushFeedbackQueue, mergeFeedbackReceipts, refreshFeedbackDeletionStatus, requestFeedbackDeletion } from './src/feedback/feedbackTransport';
import { normalizePrivacyNoticeUrl, openPrivacyNotice } from './src/feedback/privacyNotice';
import { normalizeFeedbackApiUrl } from './src/feedback/feedbackEndpoint';
import { CommunityFeedbackScreen } from './src/feedback/CommunityFeedbackScreen';
import { careDaySummary, careMessagesForDay, closeCareDay, companionEventForDay, completeCareMessage, createCompanionState, hydrateCompanionState, registerPhotoAvatarSimulation, removePhotoAvatarSimulation, respondToCompanion, selectCompanionPreset, setCompanionSoundEnabled, startCareSchedule } from './src/companion/companionEngine';
import { CompanionMissionScreen } from './src/companion/CompanionMissionScreen';
if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});
const FEEDBACK_API_URL = normalizeFeedbackApiUrl(process.env.EXPO_PUBLIC_FEEDBACK_API_URL || '', {
  allowLocalHttp: process.env.EXPO_PUBLIC_FEEDBACK_ALLOW_LOCAL_HTTP === 'true',
});
const FEEDBACK_API_KEY = process.env.EXPO_PUBLIC_FEEDBACK_API_KEY || '';
const FEEDBACK_PRIVACY_URL = normalizePrivacyNoticeUrl(process.env.EXPO_PUBLIC_FEEDBACK_PRIVACY_URL || '');
const FEEDBACK_AVAILABLE = Boolean(FEEDBACK_API_URL && FEEDBACK_PRIVACY_URL);
const FEEDBACK_CATEGORIES = [["bug", '불편 신고'], ["confusion", '이해하기 어려움'], ["feature", '기능 제안'], ["safety_privacy", '안전·개인정보'], ["other", '기타']];
const PUBLIC_SCREENS = new Set(['welcome', 'service_intro', 'service_feedback', 'service_feedback_export', 'service_feedback_receipts', 'onboarding', 'profiles', 'feed', 'report', 'mission']);
const initialState = {
  schema: 'dog-first-alpha.v1',
  screen: 'welcome',
  onboarding: { household: '', home: '', weekdayHours: '', budget: '', experience: '', preference: '', confidence: '' },
  selectedProfileId: '',
  currentDay: 1,
  missionDrafts: {},
  logs: [],
  eventResponse: null,
  companion: createCompanionState(),
  reminder: { optedIn: false, status: 'off' },
  serviceFeedbackQueue: [],
  serviceFeedbackReceipts: [],
};
function hydrateState(stored) {
  if (!stored || stored.schema !== initialState.schema) return initialState;
  return {
    ...initialState,
    screen: PUBLIC_SCREENS.has(stored.screen) ? stored.screen : initialState.screen,
    onboarding: { ...initialState.onboarding, ...(stored.onboarding || {}) },
    selectedProfileId: stored.selectedProfileId || '',
    currentDay: Number.isInteger(stored.currentDay) ? stored.currentDay : initialState.currentDay,
    missionDrafts: stored.missionDrafts && typeof stored.missionDrafts === 'object' ? stored.missionDrafts : {},
    logs: Array.isArray(stored.logs) ? stored.logs : [],
    eventResponse: stored.eventResponse || null,
    companion: hydrateCompanionState(stored.companion),
    reminder: { ...initialState.reminder, ...(stored.reminder || {}) },
    serviceFeedbackQueue: Array.isArray(stored.serviceFeedbackQueue) ? stored.serviceFeedbackQueue : [],
    serviceFeedbackReceipts: Array.isArray(stored.serviceFeedbackReceipts) ? stored.serviceFeedbackReceipts : [],
  };
}
const CHOICES = {
  household: [['single', '1인 가구'], ['family', '가족·동거인과 함께']],
  home: [['apartment', '아파트·공동주택'], ['house', '마당 또는 단독주택'], ['other', '그 외 주거']],
  budget: [['low', '빠듯하게 계획 중'], ['medium', '기본 비용 가능'], ['high', '여유 있게 계획 가능']],
  experience: [['first', '첫 반려견'], ['some', '조금 경험 있음']],
  preference: [['calm', '차분한 일상'], ['active', '활동적인 산책'], ['senior', '차분한 노령견']],
  confidence: [['careful', '신중하게 확인 중'], ['optimistic', '잘할 수 있을 것 같음']],
};
function Pressable(props) {
  return <NativePressable accessible accessibilityRole="button" {...props} />;
}
function ChoiceRow({ label, value, choices, onChange }) {
  return <View style={styles.question}><Text style={styles.questionLabel}>{label}</Text><View style={styles.choiceRow}>{choices.map(([id, text]) => <Pressable key={id} accessibilityState={{ selected: value === id }} onPress={() => onChange(id)} style={[styles.choice, value === id && styles.choiceSelected]}><Text style={[styles.choiceText, value === id && styles.choiceTextSelected]}>{text}</Text></Pressable>)}</View></View>;
}
function ProfileRecommendationContext({ onboarding, onEdit }) {
  const context = profileRecommendationContext(onboarding);
  return (
    <View style={styles.profileContext}>
      <View style={styles.profileContextHeading}>
        <View>
          <Text style={styles.profileContextEyebrow}>생활 조건</Text>
          <Text style={styles.profileContextTitle}>내가 알려준 생활 조건</Text>
        </View>
        <Pressable accessibilityLabel="생활 조건 수정" onPress={onEdit} style={styles.profileEditButton}>
          <Text style={styles.profileEditButtonText}>생활 조건 수정</Text>
        </Pressable>
      </View>
      <View style={styles.conditionList}>
        {context.conditions.map((condition) => <Text key={condition} style={styles.conditionItem}>{condition}</Text>)}
      </View>
      <Text style={styles.practiceTitle}>7일 동안 살펴볼 점</Text>
      {context.practiceReasons.map((reason) => <View key={reason} style={styles.practiceRow}><Text style={styles.practiceMark}>•</Text><Text style={styles.practiceText}>{reason}</Text></View>)}
      <Text style={styles.profileBoundary}>알려주신 생활 조건을 바탕으로 연습하며, 입양 적합성을 판정하지 않습니다.</Text>
    </View>
  );
}
function ProgressDots({ day }) {
  return <View style={styles.dots}>{MISSIONS.map((mission) => <View key={mission.id} style={[styles.dot, mission.day < day && styles.dotDone, mission.day === day && styles.dotCurrent]} />)}</View>;
}

function ReportSuggestionCard({ suggestion, index }) {
  return (
    <View
      accessible
      accessibilityLabel={suggestionAccessibilityLabel(suggestion, index)}
      style={styles.profile}
    >
      <Text style={styles.profileIndex}>제안 {index + 1}</Text>
      <Text style={styles.questionLabel}>시뮬레이션에서 본 점</Text>
      <Text style={styles.profileSummary}>{suggestion.observedInSimulation}</Text>
      <Text style={styles.questionLabel}>왜 살펴보나요</Text>
      <Text style={styles.profileSummary}>{suggestion.whyThisMatters}</Text>
      <Text style={styles.questionLabel}>다음에 해 볼 일</Text>
      <Text style={styles.profileCTA}>{suggestion.tryNext}</Text>
      <Text style={styles.reportEvidence}>{supportingEvidenceText(suggestion)}</Text>
      <Text style={styles.hint}>{REPORT_EVIDENCE_BOUNDARY}</Text>
    </View>
  );
}

export default function App() {
  const [state, setState] = useState(initialState);
  const reminderBusy = useRef(false);
  const syncReminders = useMemo(() => createReminderScheduler(Notifications), []);
  const [hydration, setHydration] = useState({ status: HYDRATION_STATUS.LOADING, attempt: 0 });
  const [now, setNow] = useState(() => new Date());
  const draft = state.logs.find(log => log.day === state.currentDay) || state.missionDrafts?.[state.currentDay] || {};
  const note = draft.note || '';
  const difficulty = draft.difficulty ?? 3;
  const emotion = draft.emotion || '차분함';
  const updateDraft = (patch) => setState(current => ({ ...current,
    missionDrafts: { ...current.missionDrafts, [state.currentDay]: { ...current.missionDrafts?.[state.currentDay], ...patch } },
  }));
  const setNote = (value) => updateDraft({ note: value });
  const setDifficulty = (value) => updateDraft({ difficulty: value });
  const setEmotion = (value) => updateDraft({ emotion: value });
  const [serviceFeedbackCategory, setServiceFeedbackCategory] = useState('confusion');
  const [serviceFeedbackMessage, setServiceFeedbackMessage] = useState('');
  const [serviceFeedbackSourceScreen, setServiceFeedbackSourceScreen] = useState('unknown');
  const feedbackDelivery = useMemo(() => createFeedbackDeliveryCoordinator({
    flush: (queue) => flushFeedbackQueue(queue, { endpoint: FEEDBACK_AVAILABLE ? FEEDBACK_API_URL : '', apiKey: FEEDBACK_API_KEY }),
    onResult: (result) => {
      if (!result.acceptedClientSubmissionIds.length) return;
      const accepted = new Set(result.acceptedClientSubmissionIds);
      setState((current) => ({
        ...current,
        serviceFeedbackQueue: current.serviceFeedbackQueue.filter((item) => !accepted.has(item.client_submission_id)),
        serviceFeedbackReceipts: mergeFeedbackReceipts(current.serviceFeedbackReceipts, result.receipts),
      }));
    },
  }), []);
  useEffect(() => {
    let active = true;
    setHydration((current) => ({ ...current, status: HYDRATION_STATUS.LOADING }));
    loadStorageHydration({ loadProgress, loadFeedbackQueue, loadFeedbackReceipts }).then((result) => {
      if (!active) return;
      if (result.status === HYDRATION_STATUS.ERROR) {
        setHydration((current) => ({ ...current, status: HYDRATION_STATUS.ERROR }));
        return;
      }
      const hydrated = result.storedProgress?.schema === initialState.schema ? hydrateState(result.storedProgress) : initialState;
      setState({
        ...reconcileSimulationCalendar(hydrated, new Date()),
        serviceFeedbackQueue: Array.isArray(result.storedQueue) ? result.storedQueue : hydrated.serviceFeedbackQueue,
        serviceFeedbackReceipts: Array.isArray(result.storedReceipts) ? result.storedReceipts : hydrated.serviceFeedbackReceipts,
      });
      setHydration((current) => ({ ...current, status: HYDRATION_STATUS.READY }));
    });
    return () => { active = false; };
  }, [hydration.attempt]);
  useEffect(() => {
    runHydratedEffect(hydration.status, () => { saveProgress(state).catch(() => {}); });
  }, [state, hydration.status]);
  useEffect(() => {
    runHydratedEffect(hydration.status, () => { saveFeedbackQueue(state.serviceFeedbackQueue).catch(() => {}); });
  }, [state.serviceFeedbackQueue, hydration.status]);
  useEffect(() => {
    runHydratedEffect(hydration.status, () => { saveFeedbackReceipts(state.serviceFeedbackReceipts).catch(() => {}); });
  }, [state.serviceFeedbackReceipts, hydration.status]);
  useEffect(() => {
    if (hydration.status !== HYDRATION_STATUS.READY) return undefined;
    if (state.serviceFeedbackQueue.length) feedbackDelivery.request(state.serviceFeedbackQueue);
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && state.serviceFeedbackQueue.length) feedbackDelivery.request(state.serviceFeedbackQueue);
    });
    return () => subscription.remove();
  }, [feedbackDelivery, hydration.status, state.serviceFeedbackQueue]);
  useEffect(() => {
    if (hydration.status !== HYDRATION_STATUS.READY || Platform.OS === 'web') return undefined;
    let active = true;
    const reconcile = () => syncReminders(state).then((reminder) => {
      if (active) setState((current) => {
        if (reminder.status === 'off' && ['schedule_error', 'permission_denied'].includes(current.reminder.status)) return current;
        return { ...current, reminder };
      });
    }).catch(() => {
      if (active) setState((current) => ({ ...current, reminder: { ...current.reminder, optedIn: false, status: 'schedule_error' } }));
    });
    reconcile();
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') reconcile();
    });
    return () => { active = false; subscription.remove(); };
  }, [hydration.status, state.reminder.optedIn, state.reminder.schedule, state.currentDay, state.logs, state.companion.careStartedOn, syncReminders]);
  useEffect(() => {
    if (hydration.status !== HYDRATION_STATUS.READY) return undefined;
    const refresh = () => {
      const timestamp = new Date();
      setNow(timestamp);
      setState(current => reconcileSimulationCalendar(current, timestamp));
    };
    refresh();
    const timer = setInterval(refresh, 15000);
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') refresh();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [hydration.status]);
  const profile = useMemo(() => DOG_PROFILES.find((item) => item.id === state.selectedProfileId), [state.selectedProfileId]);
  const mission = MISSIONS[state.currentDay - 1];
  const companionEvent = useMemo(() => companionEventForDay(state.currentDay), [state.currentDay]);
  const careMessages = useMemo(() => careMessagesForDay(state.currentDay), [state.currentDay]);
  const completedToday = state.logs.some((log) => log.day === mission?.day);
  const score = useMemo(() => calculateReadiness(state.logs, profile, state.eventResponse, state.companion.responses, state.companion.careResponses), [state.logs, profile, state.eventResponse, state.companion.responses, state.companion.careResponses]);
  const setScreen = (screen) => setState((current) => reconcileSimulationCalendar({ ...current, screen }, new Date()));
  const updateOnboarding = (field, value) => setState((current) => ({ ...current, onboarding: { ...current.onboarding, [field]: value } }));
  const isOnboardingComplete = Object.values(state.onboarding).every(Boolean);
  const chooseProfile = (id) => setState((current) => ({ ...current, selectedProfileId: id, screen: isOnboardingComplete ? 'mission' : 'onboarding', companion: startCareSchedule(current.companion, new Date(), current.currentDay) }));
  const respondToCurrentCompanion = (choiceId) => setState((current) => ({ ...current, companion: respondToCompanion(current.companion, companionEvent.id, choiceId) }));
  const selectCurrentCompanionPreset = (presetId) => setState((current) => ({ ...current, companion: selectCompanionPreset(current.companion, presetId) }));
  const registerCurrentPhotoAvatar = (photoAvatarId) => setState((current) => ({ ...current, companion: registerPhotoAvatarSimulation(current.companion, photoAvatarId) }));
  const removeCurrentPhotoAvatar = () => setState((current) => ({ ...current, companion: removePhotoAvatarSimulation(current.companion) }));
  const completeCurrentCareMessage = (messageId) => {
    const now = new Date();
    setState((current) => {
      try {
        const refreshed = reconcileSimulationCalendar(current, now);
        return { ...refreshed, companion: completeCareMessage(refreshed.companion, messageId, now) };
      } catch {
        return reconcileSimulationCalendar(current, now);
      }
    });
    setNow(now);
  };
  const setCurrentCompanionSoundEnabled = (enabled) => setState((current) => ({ ...current, companion: setCompanionSoundEnabled(current.companion, enabled) }));
  function saveMission(mark) {
    const timestamp = new Date();
    let saved;
    try {
      saved = saveDailyReflection(state, mission.day, mark, { note, difficulty, emotion }, timestamp);
    } catch (error) {
      setState(current => reconcileSimulationCalendar(current, timestamp));
      Alert.alert(error.message === 'day_changed' ? '오늘 날짜로 바뀌었어요' : '아직 오늘 돌봄 시간이 남아 있어요',
        error.message === 'day_changed' ? '오늘의 요청을 확인해 주세요. 작성하던 메모는 이전 날짜에 보관했어요.' : '남은 요청을 확인한 뒤 회고를 마쳐 주세요.');
      return;
    }
    if (saved === state) return;
    setState(current => saveDailyReflection(current, mission.day, mark, { note, difficulty, emotion }, timestamp));
  }
  function saveReminderSchedule(schedule) {
    if (!validReminderSchedule(schedule)) return;
    setState((current) => ({ ...current, reminder: { ...current.reminder, schedule, status: current.reminder.optedIn ? 'scheduling' : 'off' } }));
  }
  async function configureReminder() {
    if (reminderBusy.current) return;
    if (!validReminderSchedule(state.reminder.schedule)) return;
    if (state.reminder.optedIn) {
      setState((current) => ({ ...current, reminder: { ...current.reminder, optedIn: false, status: 'off' } }));
      return;
    }
    if (Platform.OS === 'web') {
      Alert.alert('아이폰에서 알림을 켜 주세요', '이 웹 화면에서는 기기 알림을 예약하지 않습니다.');
      return;
    }
    reminderBusy.current = true;
    try {
      const existing = await Notifications.getPermissionsAsync();
      const result = existing.status === 'granted' ? existing : await Notifications.requestPermissionsAsync();
      if (result.status !== 'granted') {
        setState((current) => ({ ...current, reminder: { ...current.reminder, optedIn: false, status: 'permission_denied' } }));
        Alert.alert('알림이 꺼져 있어요', '언제든 앱 안에서 오늘의 미션을 확인할 수 있습니다.');
        return;
      }
      setState((current) => ({ ...current, reminder: { ...current.reminder, optedIn: true, status: 'scheduling' } }));
    } catch {
      setState((current) => ({ ...current, reminder: { ...current.reminder, optedIn: false, status: 'schedule_error' } }));
      Alert.alert('알림을 켜지 못했어요', '잠시 후 다시 시도해 주세요.');
    } finally {
      reminderBusy.current = false;
    }
  }
  function completeOnboarding() {
    setState((current) => ({ ...current, screen: 'profiles' }));
  }
  function openServiceFeedback() {
    if (!state.screen.startsWith('service_feedback')) setServiceFeedbackSourceScreen(state.screen);
    setScreen('service_feedback');
  }
  async function showFeedbackPrivacyNotice() {
    const result = await openPrivacyNotice(FEEDBACK_PRIVACY_URL, Linking);
    if (result.status !== 'opened') {
      Alert.alert('개인정보 처리 안내를 열지 못했어요', '연결 상태를 확인하거나 잠시 후 다시 시도해 주세요.');
    }
  }
  function submitServiceFeedback() {
    if (!FEEDBACK_AVAILABLE) return;
    try {
      const item = createFeedbackItem({
        appVersion: COMPANION_APP_VERSION,
        buildNumber: 'alpha-local',
        platform: Platform.OS,
        screenId: serviceFeedbackSourceScreen,
        category: serviceFeedbackCategory,
        userMessage: serviceFeedbackMessage,
      });
      setState((current) => ({ ...current, serviceFeedbackQueue: enqueueFeedback(current.serviceFeedbackQueue, item) }));
      setServiceFeedbackMessage('');
      Alert.alert('의견을 전송 대기 목록에 담았어요', '접수가 완료되면 접수 내역에서 확인할 수 있습니다. 연결이 끊기면 앱을 다시 열 때 전송을 시도합니다.');
    } catch {
      Alert.alert('의견을 확인해 주세요', '내용을 입력한 뒤 다시 시도해 주세요.');
    }
  }
  function confirmFeedbackDeletion(receipt) {
    Alert.alert('접수된 의견의 삭제를 요청할까요?', '요청 후 운영자가 관련 내용과 연락 정보를 삭제하고 감사 기록만 남깁니다.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제 요청', style: 'destructive', onPress: () => submitFeedbackDeletion(receipt) },
    ]);
  }
  async function submitFeedbackDeletion(receipt) {
    const result = await requestFeedbackDeletion(receipt, { endpoint: FEEDBACK_API_URL, apiKey: FEEDBACK_API_KEY });
    if (['requested', 'deleted'].includes(result.status)) {
      setState((current) => ({ ...current, serviceFeedbackReceipts: mergeFeedbackReceipts(current.serviceFeedbackReceipts, [result.receipt]) }));
      Alert.alert(
        result.status === 'deleted' ? '삭제 처리가 완료됐어요' : '삭제 요청을 접수했어요',
        result.status === 'deleted' ? '피드백 내용은 삭제됐고 접수 ID는 감사 기록으로만 남습니다.' : '운영자 확인 후 피드백 내용이 삭제됩니다. 접수 ID는 감사 기록으로만 남습니다.',
      );
      return;
    }
    Alert.alert('삭제 요청을 보내지 못했어요', '네트워크 연결을 확인한 뒤 다시 시도해 주세요.');
  }
  async function refreshFeedbackDeletion(receipt) {
    const result = await refreshFeedbackDeletionStatus(receipt, { endpoint: FEEDBACK_API_URL, apiKey: FEEDBACK_API_KEY });
    if (['pending', 'deleted'].includes(result.status)) {
      setState((current) => ({ ...current, serviceFeedbackReceipts: mergeFeedbackReceipts(current.serviceFeedbackReceipts, [result.receipt]) }));
      Alert.alert(
        result.status === 'deleted' ? '삭제 처리가 완료됐어요' : '아직 삭제 처리 중이에요',
        result.status === 'deleted' ? '피드백 내용은 삭제됐고 접수 ID는 감사 기록으로만 남습니다.' : '운영자가 요청을 확인하고 있습니다. 잠시 후 다시 확인해 주세요.',
      );
      return;
    }
    Alert.alert('삭제 상태를 확인하지 못했어요', '네트워크 연결을 확인한 뒤 다시 시도해 주세요.');
  }
  function clearQueuedServiceFeedback() {
    Alert.alert('전송 대기 의견을 삭제할까요?', '이 기기의 전송 대기 목록을 비웁니다. 이미 전송 중이거나 접수된 의견은 취소되지 않으며, 접수 내역에서 삭제를 요청해야 합니다.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => setState((current) => ({ ...current, serviceFeedbackQueue: [] })) },
    ]);
  }
  function retryHydration() {
    setHydration((current) => ({
      status: HYDRATION_STATUS.LOADING,
      attempt: current.attempt + 1,
    }));
  }
  async function resetLocalDataAndRetry() {
    setHydration((current) => ({ ...current, status: HYDRATION_STATUS.LOADING }));
    try {
      await clearAllLocalData();
      setState(initialState);
      setHydration((current) => ({
        status: HYDRATION_STATUS.LOADING,
        attempt: current.attempt + 1,
      }));
    } catch {
      setHydration((current) => ({ ...current, status: HYDRATION_STATUS.ERROR }));
    }
  }
  function confirmLocalDataReset() {
    Alert.alert(
      '이 기기의 기록을 초기화할까요?',
      '시뮬레이션 진행 기록, 전송 대기 의견, 서버 접수 내역과 삭제 권한이 모두 삭제됩니다. 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '모두 초기화', style: 'destructive', onPress: resetLocalDataAndRetry },
      ],
    );
  }
  async function reset() { await clearProgress(); setState((current) => preserveFeedbackQueueOnSimulationReset(current, initialState)); }
  if (hydration.status === HYDRATION_STATUS.LOADING) return <SafeAreaView style={styles.loading}><Text style={styles.eyebrow}>나란히 걸어봄</Text><Text style={styles.loadingText}>준비 기록을 불러오는 중…</Text></SafeAreaView>;
  if (hydration.status === HYDRATION_STATUS.ERROR) return <SafeAreaView style={styles.hydrationError}><View accessibilityRole="alert" style={styles.hydrationErrorCard}><Text style={styles.eyebrow}>기기 내 기록 · 읽기 오류</Text><Text style={styles.hydrationErrorTitle}>기록을 안전하게{`\n`}불러오지 못했어요.</Text><Text style={styles.hydrationErrorBody}>기존 기록을 덮어쓰지 않도록 저장을 멈췄습니다. 먼저 다시 시도해 주세요. 기기 기록을 모두 지우려면 아래 초기화 안내를 확인해야 합니다.</Text><Pressable style={styles.primaryButton} onPress={retryHydration}><Text style={styles.primaryButtonText}>다시 시도</Text><Text style={styles.arrow}>↻</Text></Pressable><Pressable style={styles.resetButton} onPress={confirmLocalDataReset}><Text style={styles.resetButtonText}>이 기기 기록 모두 초기화</Text></Pressable></View></SafeAreaView>;
  const header = <View style={styles.header}><Pressable onPress={() => setScreen(state.selectedProfileId ? 'mission' : 'service_intro')} accessibilityLabel={state.selectedProfileId ? '돌봄 화면으로 돌아가기' : '서비스 소개로 돌아가기'}><Text style={styles.wordmark}>나란히 걸어봄</Text></Pressable><View style={styles.headerActions}><Pressable onPress={openServiceFeedback}><Text style={styles.headerAction}>의견 보내기</Text></Pressable></View></View>;
  if (state.screen === 'welcome') return <View style={styles.intro}><StatusBar barStyle="dark-content" translucent backgroundColor="transparent" /><View style={[styles.introImage, { alignItems: 'center', justifyContent: 'center', padding: 28 }]}><Text style={styles.wordmark}>나란히 걸어봄</Text><Text style={[styles.pageTitle, { textAlign: 'center', marginTop: 22 }]}>입양 전에, 7일을 먼저 연습해요.</Text><Text style={[styles.pageIntro, { textAlign: 'center' }]}>가상 강아지와 함께 돌봄의 시간과 생활 조건을 살펴보세요.</Text><Pressable accessibilityRole="button" accessibilityLabel="준비 여정 시작" accessibilityHint="서비스 소개로 이동합니다" onPress={() => setScreen('service_intro')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>연습 시작하기</Text><Text style={styles.arrow}>→</Text></Pressable></View></View>;
  if (state.screen === 'service_intro') return <SafeAreaView style={styles.safe}>{header}<ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>강아지와 함께 살아보는 7일</Text><Text style={styles.pageTitle}>입양하기 전에,{`\n`}강아지와의 일상을 연습해 봐요.</Text><Text style={styles.pageIntro}>가상 강아지의 돌봄 요청에 응답하고 하루를 돌아보며, 시간과 비용, 가족의 역할을 차근차근 살펴봐요.</Text><View style={styles.profile}><Text style={styles.profileIndex}>이 서비스에서 확인하는 것</Text><Text style={styles.profileName}>함께 살기 위해 준비할 것</Text><Text style={styles.profileSummary}>강아지를 평가하거나 입양 자격을 판정하지 않습니다. 실제 생활에서 무엇을 더 준비하면 좋을지 알아보는 연습입니다.</Text></View><Pressable style={styles.primaryButton} onPress={() => setScreen('onboarding')}><Text style={styles.primaryButtonText}>내 생활부터 확인하기</Text><Text style={styles.arrow}>↗</Text></Pressable><Text style={styles.hint}>생활 조건을 알려주고 연습할 강아지를 고르면 7일이 시작됩니다.</Text></ScrollView></SafeAreaView>;
  if (state.screen === 'service_feedback' && !FEEDBACK_AVAILABLE) return <CommunityFeedbackScreen header={header} onReturn={() => setScreen(serviceFeedbackSourceScreen)} />;
  if (state.screen === 'service_feedback') return <SafeAreaView style={styles.safe}>{header}<ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>서비스 의견</Text><Text style={styles.pageTitle}>사용하면서 느낀 점을{`\n`}알려주세요.</Text><Text style={styles.pageIntro}>불편했던 점이나 바라는 기능을 알려주세요. 의견과 함께 이용 화면, 앱 버전, 기기 종류가 전송됩니다. 이메일·전화번호·주소 같은 개인정보는 의견 본문에 적지 마세요.</Text>{FEEDBACK_PRIVACY_URL ? <Pressable style={styles.privacyLink} onPress={showFeedbackPrivacyNotice}><Text style={styles.privacyLinkText}>개인정보 처리 안내 열기 ↗</Text></Pressable> : <Text style={styles.privacyPending}>개인정보 처리 안내를 제공할 수 없어 지금은 의견을 보낼 수 없습니다.</Text>}<Text style={[styles.transportConfig, !FEEDBACK_AVAILABLE && styles.transportConfigPending]}>{FEEDBACK_AVAILABLE ? '보내기를 누르면 전송을 시도합니다. 연결이 끊기면 전송 대기 목록에 보관됩니다.' : '지금은 의견 접수를 이용할 수 없습니다. 기존 전송 대기 의견은 이 기기에 보관됩니다.'}</Text><ChoiceRow label="어떤 의견인가요?" value={serviceFeedbackCategory} choices={FEEDBACK_CATEGORIES} onChange={setServiceFeedbackCategory} /><Text style={styles.questionLabel}>의견 내용</Text><TextInput multiline placeholder="어느 화면에서 무엇이 불편했는지 알려주세요." placeholderTextColor="#8C9385" accessibilityLabel="의견 내용" value={serviceFeedbackMessage} onChangeText={setServiceFeedbackMessage} maxLength={2000} style={styles.noteInput} /><Text style={styles.queueStatus}>전송 대기 {state.serviceFeedbackQueue.length}개 · 접수 완료 {state.serviceFeedbackReceipts.length}개</Text><Pressable disabled={(!FEEDBACK_AVAILABLE || !serviceFeedbackMessage.trim())} style={[styles.primaryButton, (!FEEDBACK_AVAILABLE || !serviceFeedbackMessage.trim()) && styles.disabledButton]} onPress={submitServiceFeedback}><Text style={styles.primaryButtonText}>{FEEDBACK_AVAILABLE ? '의견 보내기' : '지금은 접수할 수 없어요'}</Text><Text style={styles.arrow}>↗</Text></Pressable>{state.serviceFeedbackQueue.length ? <Pressable style={styles.secondaryButton} onPress={() => setScreen('service_feedback_export')}><Text style={styles.secondaryButtonText}>전송 대기 의견 확인</Text></Pressable> : null}{state.serviceFeedbackReceipts.length ? <Pressable style={styles.secondaryButton} onPress={() => setScreen('service_feedback_receipts')}><Text style={styles.secondaryButtonText}>접수 내역과 삭제 요청</Text></Pressable> : null}<Pressable style={styles.secondaryButton} onPress={() => setScreen(['service_intro', 'onboarding', 'profiles', 'mission', 'feed', 'report'].includes(serviceFeedbackSourceScreen) ? serviceFeedbackSourceScreen : (state.selectedProfileId ? 'mission' : 'service_intro'))}><Text style={styles.secondaryButtonText}>이전 화면으로 돌아가기</Text></Pressable></ScrollView></SafeAreaView>;
  if (state.screen === 'service_feedback_export') return <SafeAreaView style={styles.safe}>{header}<ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>전송 대기 의견 · 기기 내 보관</Text><Text style={styles.pageTitle}>전송 대기 의견{`\n`}목록</Text><Text style={styles.pageIntro}>아직 접수를 확인하지 못한 의견입니다. 앱을 다시 열면 전송을 시도합니다. 목록을 지워도 이미 접수된 의견은 접수 내역에서 따로 삭제 요청해야 합니다.</Text>{state.serviceFeedbackQueue.map((item) => <View key={item.client_submission_id} style={styles.feedbackReceipt}><Text style={styles.feedbackReceiptId}>{FEEDBACK_CATEGORIES.find(([id]) => id === item.category)?.[1] || '기타'}</Text><Text style={styles.profileSummary}>{item.user_message}</Text><Text style={styles.feedbackReceiptStatus}>접수 확인 대기</Text></View>)}{!state.serviceFeedbackQueue.length ? <Text style={styles.pageIntro}>전송 대기 중인 의견이 없습니다.</Text> : null}<Pressable style={styles.secondaryButton} onPress={() => setScreen('service_feedback')}><Text style={styles.secondaryButtonText}>의견 화면으로 돌아가기</Text></Pressable><Pressable style={styles.textButton} onPress={clearQueuedServiceFeedback}><Text style={styles.textButtonLabel}>전송 대기 의견 삭제</Text></Pressable></ScrollView></SafeAreaView>;
  if (state.screen === 'service_feedback_receipts') return <SafeAreaView style={styles.safe}>{header}<ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>접수 내역 · 이 기기에 보관</Text><Text style={styles.pageTitle}>의견 접수 내역과{`\n`}삭제 요청</Text><Text style={styles.pageIntro}>이 기기에서 보낸 의견의 접수 상태를 확인하고 삭제를 요청할 수 있습니다. 앱을 삭제하거나 기기 기록을 초기화하면 이 내역으로 삭제를 요청할 수 없습니다.</Text>{state.serviceFeedbackReceipts.map((receipt) => <View key={receipt.feedback_id} style={styles.feedbackReceipt}><Text style={styles.feedbackReceiptId}>{receipt.feedback_id}</Text><Text style={styles.feedbackReceiptStatus}>{receipt.status === 'deleted' ? '삭제 처리 완료 · 감사 ID만 유지' : receipt.status === 'deletion_requested' ? '삭제 요청 접수됨 · 운영자 처리 대기' : '접수 완료'}</Text>{receipt.status === 'accepted' ? <Pressable style={styles.receiptDeleteButton} onPress={() => confirmFeedbackDeletion(receipt)}><Text style={styles.receiptDeleteButtonText}>이 의견 삭제 요청</Text></Pressable> : null}{receipt.status === 'deletion_requested' ? <Pressable style={styles.receiptRefreshButton} onPress={() => refreshFeedbackDeletion(receipt)}><Text style={styles.receiptRefreshButtonText}>삭제 상태 새로고침</Text></Pressable> : null}</View>)}<Pressable style={styles.secondaryButton} onPress={() => setScreen('service_feedback')}><Text style={styles.secondaryButtonText}>의견 화면으로 돌아가기</Text></Pressable></ScrollView></SafeAreaView>;
  if (state.screen === 'onboarding') return <SafeAreaView style={styles.safe}>{header}<ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>시작 전 · 생활 조건</Text><Text style={styles.pageTitle}>우리 집의 하루를{`\n`}알려주세요.</Text><Text style={styles.pageIntro}>강아지와 함께 살 때 달라질 부분을 7일 동안 함께 확인할게요. 응답은 이 기기에 저장되며, 연습 프로필과 준비할 내용을 안내하는 데 사용합니다.</Text><ChoiceRow label="누구와 살고 있나요?" value={state.onboarding.household} choices={CHOICES.household} onChange={(value) => updateOnboarding('household', value)} /><ChoiceRow label="주거 환경은 어떤가요?" value={state.onboarding.home} choices={CHOICES.home} onChange={(value) => updateOnboarding('home', value)} /><View style={styles.question}><Text style={styles.questionLabel}>평일 가장 긴 외출 시간</Text><TextInput accessibilityLabel="평일 가장 긴 외출 시간, 시간 단위" keyboardType="number-pad" placeholder="예: 8" placeholderTextColor="#8C9385" value={state.onboarding.weekdayHours} onChangeText={(value) => updateOnboarding('weekdayHours', value)} style={styles.hourInput} /><Text style={styles.hint}>시간 단위로 적어주세요.</Text></View><ChoiceRow label="비용 준비는 어떤가요?" value={state.onboarding.budget} choices={CHOICES.budget} onChange={(value) => updateOnboarding('budget', value)} /><ChoiceRow label="반려견 돌봄 경험" value={state.onboarding.experience} choices={CHOICES.experience} onChange={(value) => updateOnboarding('experience', value)} /><ChoiceRow label="끌리는 일상" value={state.onboarding.preference} choices={CHOICES.preference} onChange={(value) => updateOnboarding('preference', value)} /><ChoiceRow label="지금의 마음" value={state.onboarding.confidence} choices={CHOICES.confidence} onChange={(value) => updateOnboarding('confidence', value)} /><Pressable disabled={!isOnboardingComplete} style={[styles.primaryButton, !isOnboardingComplete && styles.disabledButton]} onPress={completeOnboarding}><Text style={styles.primaryButtonText}>연습 프로필 살펴보기</Text><Text style={styles.arrow}>↗</Text></Pressable></ScrollView></SafeAreaView>;
  if (state.screen === 'profiles') {
    const profiles = recommendProfiles(state.onboarding);
    return <SafeAreaView style={styles.safe}>{header}<ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>연습 프로필</Text><Text style={styles.pageTitle}>어떤 강아지와{`\n`}7일을 살아볼까요?</Text><Text style={styles.pageIntro}>견종·크기·나이만으로 성격을 단정하지 않습니다. 서로 다른 돌봄 상황을 경험하기 위한 연습 프로필입니다.</Text><ProfileRecommendationContext onboarding={state.onboarding} onEdit={() => setScreen('onboarding')} />{profiles.map((item, index) => <Pressable key={item.id} style={[styles.profile, index === 0 && styles.profileFeatured, state.selectedProfileId === item.id && styles.profileSelected]} onPress={() => chooseProfile(item.id)}><View style={styles.profileTop}><Text style={styles.profileIndex}>{index === 0 ? '먼저 살펴볼 연습 프로필' : '다른 연습 프로필 ' + index}</Text><Text style={styles.profileSize}>{profileSizeLabel(item.size)}</Text></View><Text style={styles.profileName}>{item.name}</Text><Text style={styles.profileSummary}>{item.summary}</Text><Text style={styles.profileCTA}>이 강아지와 7일 시작하기 ↗</Text></Pressable>)}</ScrollView></SafeAreaView>;
  }
  if (state.screen === 'feed') return <SafeAreaView style={styles.safe}>{header}<ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>나만 보는 기록</Text><Text style={styles.pageTitle}>7일의 작은{`\n`}확인 기록</Text><Text style={styles.pageIntro}>사진·영상 없이도 모든 미션을 마칠 수 있습니다. 돌봄과 회고 기록은 이 기기에 저장됩니다.</Text>{MISSIONS.map((item) => { const log = state.logs.find((record) => record.day === item.day); return <View key={item.id} style={styles.logRow}><View style={[styles.logNumber, log?.state === 'completed' && styles.logDone]}><Text style={styles.logNumberText}>{item.day}</Text></View><View style={styles.logBody}><Text style={styles.logTitle}>{item.title}</Text><Text style={styles.logMeta}>{log ? (log.state === 'completed' ? '확인 완료' : '나중에 확인') + ' · 난이도 ' + log.difficulty + '/5' : '아직 기록 없음'}</Text>{(log?.note || state.missionDrafts?.[item.day]?.note) ? <Text style={styles.logNote}>{log?.note || `작성 중이던 메모: ${state.missionDrafts[item.day].note}`}</Text> : null}</View>{log?.includeInReport ? <Text style={styles.reportDot}>●</Text> : null}</View>; })}<Pressable style={styles.secondaryButton} onPress={() => setScreen(state.selectedProfileId ? 'mission' : 'profiles')}><Text style={styles.secondaryButtonText}>시뮬레이션으로 돌아가기</Text></Pressable></ScrollView></SafeAreaView>;
  if (state.screen === 'report') return (
    <SafeAreaView style={styles.safe}>
      {header}
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.eyebrow}>7일 준비 리포트</Text>
        <Text style={styles.reportOutcome}>{score.outcome}</Text>
        <Text style={styles.referenceScoreLabel}>시뮬레이션 참고 점수</Text>
        <Text style={styles.reportNumber}>
          {score.overall}
          <Text style={styles.reportUnit}> / 100</Text>
        </Text>
        <Text style={styles.reportEvidence}>완료 {score.completedMissionCount}/7 · 건너뜀 {score.skippedMissionCount} · 미기록 {score.missingMissionCount}</Text>
        <Text style={styles.reportEvidence}>시간 내 돌봄 {score.completedCareMessageCount}/21 · 놓친 돌봄 {score.missedCareMessageCount} · 돌봄 지속성 조정 -{score.careConsistencyPenalty}</Text>
        {score.evidenceStatus === 'incomplete' ? <Text style={styles.incompleteWarning}>건너뛰거나 기록하지 않은 날이 있어 이 점수만으로 준비 상태를 해석하기 어렵습니다.</Text> : null}
        <View style={styles.safetyNotice}>
          <Text style={styles.safetyNoticeTitle}>{score.safetyNotice.title}</Text>
          <Text style={styles.safetyNoticeBody}>{score.safetyNotice.body}</Text>
          <Text style={styles.safetyNoticeBody}>{score.safetyNotice.action}</Text>
          <Text style={styles.safetyNoticeEscalation}>{score.safetyNotice.escalation}</Text>
        </View>
        <View style={styles.scoreList}>
          {Object.entries(score.scores).map(([key, value]) => (
            <View key={key} style={styles.scoreItem}>
              <View>
                <Text style={styles.scoreLabel}>{score.labels[key]}</Text>
                <Text style={styles.scoreValue}>{value}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: String(value) + '%' }]} />
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>다음에 해 볼 3가지</Text>
        {score.suggestions.map((suggestion, index) => (
          <ReportSuggestionCard
            index={index}
            key={suggestion.sourceType + '-' + (suggestion.categoryId || 'general') + '-' + index}
            suggestion={suggestion}
          />
        ))}
        <Text style={styles.sectionTitle}>리포트에 담긴 기록</Text>
        <Text style={styles.reportEvidence}>{state.logs.filter((log) => log.includeInReport).length}개의 기기 내 기록 요약 · 원본 사진·영상은 기본 포함하지 않음</Text>
        <Pressable style={styles.primaryButton} onPress={() => setScreen('feed')}>
          <Text style={styles.primaryButtonText}>기록 다시 보기</Text>
          <Text style={styles.arrow}>↗</Text>
        </Pressable>
        <Pressable style={styles.textButton} onPress={reset}>
          <Text style={styles.textButtonLabel}>새 시뮬레이션 시작</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
  if (state.screen === 'mission') return <CompanionMissionScreen key={state.currentDay} now={now} onOpenRecords={() => setScreen('feed')} missingReflectionCount={MISSIONS.filter(item => item.day < state.currentDay && !state.logs.some(log => log.day === item.day)).length} header={header} day={state.currentDay} mission={mission} profile={profile} companionEvent={companionEvent} companionResponse={state.companion.responses[companionEvent.id]} companionPresetId={state.companion.appearancePresetId} onCompanionPreset={selectCurrentCompanionPreset} photoAvatarId={state.companion.photoAvatarId} onRegisterPhotoAvatar={registerCurrentPhotoAvatar} onRemovePhotoAvatar={removeCurrentPhotoAvatar} careStartedOn={state.companion.careStartedOn} careMessages={careMessages} careResponses={state.companion.careResponses} onCompleteCareMessage={completeCurrentCareMessage} companionSoundEnabled={state.companion.soundEnabled} onCompanionSoundEnabled={setCurrentCompanionSoundEnabled} onCompanionResponse={respondToCurrentCompanion} note={note} onNote={setNote} difficulty={difficulty} onDifficulty={setDifficulty} emotion={emotion} onEmotion={setEmotion} eventResponse={state.eventResponse} eventOptions={EVENT_OPTIONS} onEventResponse={(option) => setState((current) => ({ ...current, eventResponse: option }))} completedToday={completedToday} onSaveMission={saveMission} reminder={state.reminder} onConfigureReminder={configureReminder} onSaveReminderSchedule={saveReminderSchedule} />;
  return <SafeAreaView style={styles.safe}>{header}<ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>7일 중 {state.currentDay}일 · {profile?.tone || '준비 노트'}</Text><ProgressDots day={state.currentDay} /><Text style={styles.pageTitle}>{mission?.title}</Text><Text style={styles.missionPrompt}>{mission?.prompt}</Text><View style={styles.profileStrip}><Text style={styles.profileStripLabel}>함께 살펴보는 프로필</Text><Text style={styles.profileStripName}>{profile?.name}</Text></View>{mission?.day === 6 && !state.eventResponse ? <View style={styles.eventBox}><Text style={styles.sectionTitle}>갑자기 평일 외출이 길어졌다면?</Text><Text style={styles.pageIntro}>어떤 선택이 지금의 생활에서 가장 현실적인가요?</Text>{EVENT_OPTIONS.map((option) => <Pressable key={option.id} style={styles.eventOption} onPress={() => setState((current) => ({ ...current, eventResponse: option }))}><Text style={styles.eventLabel}>{option.label}</Text><Text style={styles.eventArrow}>→</Text></Pressable>)}</View> : <><Text style={styles.questionLabel}>오늘 남길 한 줄</Text><TextInput multiline placeholder="예: 퇴근 후 30분은 확보할 수 있지만, 야근 날 대안이 필요해요." placeholderTextColor="#8C9385" value={note} onChangeText={setNote} style={styles.noteInput} /><Text style={styles.questionLabel}>오늘의 체감 난이도</Text><View style={styles.difficultyRow}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setDifficulty(value)} style={[styles.difficulty, difficulty === value && styles.difficultySelected]}><Text style={[styles.difficultyText, difficulty === value && styles.difficultyTextSelected]}>{value}</Text></Pressable>)}</View><Text style={styles.questionLabel}>지금의 느낌</Text><View style={styles.choiceRow}>{['차분함', '현실적임', '조금 불안함'].map((value) => <Pressable key={value} onPress={() => setEmotion(value)} style={[styles.choice, emotion === value && styles.choiceSelected]}><Text style={[styles.choiceText, emotion === value && styles.choiceTextSelected]}>{value}</Text></Pressable>)}</View>{state.eventResponse ? <View style={styles.eventFeedback}><Text style={styles.eventFeedbackTitle}>선택한 대응</Text><Text style={styles.eventFeedbackText}>{state.eventResponse.feedback}</Text></View> : null}<Pressable disabled={completedToday} style={[styles.primaryButton, completedToday && styles.disabledButton]} onPress={() => saveMission('completed')}><Text style={styles.primaryButtonText}>{mission?.day === 7 ? '최종 리포트 만들기' : '오늘 확인 완료'}</Text><Text style={styles.arrow}>↗</Text></Pressable><Pressable disabled={completedToday} style={styles.textButton} onPress={() => saveMission('skipped')}><Text style={styles.textButtonLabel}>오늘은 나중에 확인할게요</Text></Pressable></>}<ReminderSettings reminder={state.reminder} onToggle={configureReminder} onSave={saveReminderSchedule} /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  profileContext: { backgroundColor: '#E8ECDD', borderLeftWidth: 3, borderLeftColor: '#607B57', padding: 17, marginBottom: 20 },
  profileContextHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  profileContextEyebrow: { color: '#64745F', fontWeight: '800', letterSpacing: 1, fontSize: 9 },
  profileContextTitle: { color: '#294334', fontSize: 18, lineHeight: 24, fontWeight: '800', marginTop: 3 },
  profileEditButton: { minHeight: 40, borderWidth: 1, borderColor: '#607B57', borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  profileEditButtonText: { color: '#355438', fontSize: 12, fontWeight: '800' },
  conditionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 },
  conditionItem: { color: '#405646', backgroundColor: '#F8F5ED', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, fontSize: 11, lineHeight: 15, fontWeight: '700' },
  practiceTitle: { color: '#294334', fontSize: 14, lineHeight: 20, fontWeight: '800', marginTop: 18, marginBottom: 4 },
  practiceRow: { flexDirection: 'row', gap: 7, marginTop: 7 },
  practiceMark: { color: '#607B57', fontSize: 15, lineHeight: 20, fontWeight: '900' },
  practiceText: { color: '#4F6052', fontSize: 13, lineHeight: 20, flex: 1 },
  profileBoundary: { color: '#6F786F', fontSize: 10, lineHeight: 16, borderTopWidth: 1, borderTopColor: '#C9D1C2', paddingTop: 10, marginTop: 13 },
  safe: { flex: 1, backgroundColor: '#F5F1E9' }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#20352C' }, loadingText: { color: '#F4F0E8', fontSize: 16, marginTop: 12 }, hydrationError: { flex: 1, justifyContent: 'center', backgroundColor: '#F5F1E9', padding: 24 }, hydrationErrorCard: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#C8CDBF', paddingVertical: 30 }, hydrationErrorTitle: { color: '#20352C', fontSize: 34, lineHeight: 40, letterSpacing: -1.2, fontWeight: '700', marginTop: 12 }, hydrationErrorBody: { color: '#5E685F', fontSize: 15, lineHeight: 23, marginTop: 16 }, resetButton: { minHeight: 50, borderWidth: 1, borderColor: '#7A514C', alignItems: 'center', justifyContent: 'center', marginTop: 14 }, resetButtonText: { color: '#7A403A', fontSize: 14, fontWeight: '700' }, intro: { flex: 1, backgroundColor: '#F5F1E9' }, introImage: { flex: 1, width: '100%', height: '100%' }, introAction: { position: 'absolute', left: '7%', right: '7%', bottom: '3.8%', height: '8.2%', borderRadius: 36 }, introActionPressed: { backgroundColor: 'rgba(196, 220, 157, 0.12)' }, header: { height: 60, paddingHorizontal: 22, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#DCD6CB' }, headerActions: { flexDirection: 'row', gap: 16, alignItems: 'center' }, wordmark: { fontSize: 12, letterSpacing: 2.2, color: '#254236', fontWeight: '700' }, headerAction: { fontSize: 14, color: '#254236', fontWeight: '600' }, page: { padding: 24, paddingBottom: 52 }, eyebrow: { color: '#72806B', fontWeight: '700', fontSize: 11, letterSpacing: 1.8 }, hero: { color: '#F8F5EE', fontSize: 47, lineHeight: 53, letterSpacing: -1.8, fontWeight: '700', marginTop: 18 }, lede: { color: '#D8DED3', fontSize: 16, lineHeight: 25, marginTop: 25, maxWidth: 330 }, heroRule: { height: 1, width: 58, backgroundColor: '#B7D19A', marginTop: 30, marginBottom: 14 }, assetBadge: { color: '#AEB9AA', fontSize: 12, lineHeight: 18, marginBottom: 32 }, primaryButton: { minHeight: 58, backgroundColor: '#C4DC9D', borderRadius: 4, paddingHorizontal: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 23 }, primaryButtonText: { color: '#173126', fontSize: 16, fontWeight: '700' }, arrow: { color: '#173126', fontSize: 20 }, textButton: { paddingVertical: 20, alignItems: 'center' }, textButtonLabel: { color: '#526553', fontSize: 14, textDecorationLine: 'underline' }, pageTitle: { color: '#20352C', fontSize: 34, lineHeight: 39, letterSpacing: -1.2, fontWeight: '700', marginTop: 12 }, pageIntro: { color: '#5E685F', fontSize: 15, lineHeight: 23, marginTop: 14, marginBottom: 22 }, question: { marginTop: 19 }, questionLabel: { color: '#273A2D', fontSize: 15, fontWeight: '700', marginBottom: 10 }, choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { borderWidth: 1, borderColor: '#C7CBBF', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#FAF8F2' }, choiceSelected: { backgroundColor: '#284536', borderColor: '#284536' }, choiceText: { color: '#526053', fontSize: 13 }, choiceTextSelected: { color: '#F9F6ED', fontWeight: '700' }, hourInput: { backgroundColor: '#FAF8F2', borderBottomWidth: 1.5, borderBottomColor: '#6E806A', fontSize: 18, color: '#263B2B', paddingVertical: 10, paddingHorizontal: 2 }, hint: { color: '#7B857B', fontSize: 12, marginTop: 6 }, queueStatus: { color: '#667166', fontSize: 12, lineHeight: 18, marginTop: 12 }, profile: { backgroundColor: '#FBF9F3', padding: 20, borderTopWidth: 1, borderColor: '#D9D5C9', marginBottom: 12 }, profileFeatured: { backgroundColor: '#DFE8CF', borderTopColor: '#617352' }, profileSelected: { borderWidth: 2, borderColor: '#284536' }, profileTop: { flexDirection: 'row', justifyContent: 'space-between' }, profileIndex: { color: '#49633E', fontSize: 12, fontWeight: '700' }, profileSize: { color: '#738270', fontSize: 11, letterSpacing: 1.2 }, profileName: { color: '#223B2B', fontSize: 21, lineHeight: 27, fontWeight: '700', marginTop: 12 }, profileSummary: { color: '#5C695E', fontSize: 14, lineHeight: 20, marginTop: 8 }, tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }, tag: { color: '#536C50', fontSize: 10, textTransform: 'uppercase', backgroundColor: '#EEF1E7', paddingHorizontal: 7, paddingVertical: 5 }, profileCTA: { color: '#285040', fontSize: 13, fontWeight: '700', marginTop: 16 }, dots: { flexDirection: 'row', gap: 6, marginTop: 17, marginBottom: 21 }, dot: { flex: 1, height: 5, backgroundColor: '#D9D6CB' }, dotDone: { backgroundColor: '#789068' }, dotCurrent: { backgroundColor: '#284536' }, missionPrompt: { color: '#4B5C4E', fontSize: 18, lineHeight: 28, marginTop: 17, marginBottom: 24 }, profileStrip: { backgroundColor: '#E2E9D6', borderLeftWidth: 3, borderLeftColor: '#56754B', padding: 14, marginBottom: 24 }, profileStripLabel: { color: '#5F705B', fontSize: 11, fontWeight: '700', letterSpacing: 1 }, profileStripName: { color: '#254235', fontSize: 15, fontWeight: '700', marginTop: 5 }, noteInput: { minHeight: 105, backgroundColor: '#FCFAF5', padding: 14, color: '#283D2D', fontSize: 15, lineHeight: 22, textAlignVertical: 'top', borderWidth: 1, borderColor: '#D5D3C9' }, difficultyRow: { flexDirection: 'row', gap: 8, marginBottom: 20 }, difficulty: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#BFC8B9', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF8F2' }, difficultySelected: { backgroundColor: '#C4DC9D', borderColor: '#628157' }, difficultyText: { color: '#536553', fontWeight: '700' }, difficultyTextSelected: { color: '#193325' }, eventBox: { backgroundColor: '#F1EADF', padding: 18, marginTop: 22 }, sectionTitle: { color: '#284236', fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 8 }, eventOption: { borderTopWidth: 1, borderTopColor: '#D4CFC4', paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, eventLabel: { color: '#334737', fontSize: 15, lineHeight: 21, flex: 1 }, eventArrow: { color: '#506D4D', fontSize: 18 }, eventFeedback: { backgroundColor: '#E2E9D6', padding: 13, marginTop: 20 }, eventFeedbackTitle: { color: '#49633E', fontSize: 11, letterSpacing: 1, fontWeight: '700' }, eventFeedbackText: { color: '#334737', fontSize: 14, lineHeight: 20, marginTop: 5 }, reminder: { marginTop: 30, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#D6D3C8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, reminderTitle: { color: '#2D4332', fontWeight: '700', fontSize: 14 }, reminderBody: { color: '#6F7A70', fontSize: 12, maxWidth: 185, marginTop: 4, lineHeight: 17 }, reminderButton: { borderWidth: 1, borderColor: '#486548', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 }, reminderButtonText: { color: '#355438', fontWeight: '700', fontSize: 12 }, logRow: { flexDirection: 'row', gap: 13, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#DDD9CF' }, logNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DDDCD4', justifyContent: 'center', alignItems: 'center' }, logDone: { backgroundColor: '#90AC76' }, logNumberText: { color: '#244032', fontSize: 12, fontWeight: '700' }, logBody: { flex: 1 }, logTitle: { color: '#2A4030', fontSize: 15, fontWeight: '700' }, logMeta: { color: '#748075', fontSize: 12, marginTop: 4 }, logNote: { color: '#536053', fontSize: 13, lineHeight: 19, marginTop: 7 }, reportDot: { color: '#789B61', fontSize: 12 }, secondaryButton: { borderWidth: 1, borderColor: '#466247', alignItems: 'center', paddingVertical: 15, marginTop: 25 }, secondaryButtonText: { color: '#355139', fontWeight: '700' }, reportOutcome: { color: '#284536', fontSize: 28, fontWeight: '700', lineHeight: 36, marginTop: 14 }, referenceScoreLabel: { color: '#667166', fontSize: 12, fontWeight: '700', marginTop: 12 }, reportNumber: { color: '#263E2E', fontSize: 57, fontWeight: '700', marginTop: 2, letterSpacing: -2 }, reportUnit: { color: '#778175', fontSize: 18, letterSpacing: 0 }, incompleteWarning: { color: '#7A514C', fontSize: 13, lineHeight: 20, marginTop: 9 }, safetyNotice: { backgroundColor: '#E8ECDD', borderLeftWidth: 3, borderLeftColor: '#607B57', padding: 16, marginTop: 18, marginBottom: 12 }, safetyNoticeTitle: { color: '#294634', fontSize: 16, fontWeight: '800', marginBottom: 8 }, safetyNoticeBody: { color: '#526052', fontSize: 13, lineHeight: 20, marginTop: 4 }, safetyNoticeEscalation: { color: '#4F5C50', fontSize: 12, lineHeight: 19, marginTop: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: '#C9D1C2' }, scoreList: { marginTop: 8, paddingTop: 5 }, scoreItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, gap: 12 }, scoreLabel: { color: '#536052', fontSize: 13 }, scoreValue: { color: '#284236', fontSize: 18, fontWeight: '700', marginTop: 2 }, barTrack: { width: 130, height: 6, backgroundColor: '#DBD9CF' }, barFill: { height: 6, backgroundColor: '#769568' }, improvement: { flexDirection: 'row', gap: 9, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#DED9CF' }, improvementMark: { color: '#607D56', fontSize: 16 }, improvementText: { color: '#4D5C4D', flex: 1, fontSize: 14, lineHeight: 20 }, reportEvidence: { color: '#687369', fontSize: 13, lineHeight: 20, marginBottom: 2 }, disabledButton: { opacity: 0.42 },
  feedbackReceipt: { backgroundColor: '#FBF9F3', borderTopWidth: 1, borderTopColor: '#C9CEC1', padding: 18, marginBottom: 12 }, feedbackReceiptId: { color: '#203B2D', fontSize: 15, fontWeight: '700' }, feedbackReceiptStatus: { color: '#667166', fontSize: 13, lineHeight: 19, marginTop: 7 }, receiptDeleteButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#7A514C', paddingHorizontal: 12, paddingVertical: 9, marginTop: 14 }, receiptDeleteButtonText: { color: '#7A403A', fontSize: 12, fontWeight: '700' }, receiptRefreshButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#607B67', paddingHorizontal: 12, paddingVertical: 9, marginTop: 14 }, receiptRefreshButtonText: { color: '#31543D', fontSize: 12, fontWeight: '700' },
  privacyLink: { alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#607B67', marginTop: 12, marginBottom: 8, paddingBottom: 3 }, privacyLinkText: { color: '#31543D', fontSize: 13, fontWeight: '700' }, privacyPending: { color: '#7A514C', fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 6 },
  transportConfig: { color: '#31543D', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 }, transportConfigPending: { color: '#7A514C' },
});
