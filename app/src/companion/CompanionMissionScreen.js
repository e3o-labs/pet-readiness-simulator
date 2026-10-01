import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CompanionAppearanceSettings, CompanionEventPanel, CompanionHero } from './CompanionPanel';
import { CareMessageInbox } from './CareMessageInbox';
import { KeyboardAwareScrollView as ScrollView } from '../KeyboardAwareScrollView';
import { ReminderSettings } from '../reminders/ReminderSettings';
import { careDaySummary } from './companionEngine';
import { READINESS_LEARNING_RUNTIME_ENABLED, learningCardForDay } from '../content/readinessLearning';

function DayDots({ day }) {
  return <View style={styles.dots}>{[1, 2, 3, 4, 5, 6, 7].map((value) => <View key={value} style={[styles.dot, value < day && styles.dotDone, value === day && styles.dotCurrent]} />)}</View>;
}

function LearningCard({ card }) {
  if (!card) return null;
  return (
    <View style={styles.learningCard}>
      <Text style={styles.learningEyebrow}>오늘 알아둘 1가지</Text>
      <Text style={styles.learningTitle}>{card.title}</Text>
      <Text style={styles.learningSummary}>{card.summary}</Text>
      <Text style={styles.learningLabel}>왜 살펴보나요</Text>
      <Text style={styles.learningBody}>{card.why}</Text>
      <Text style={styles.learningLabel}>오늘 해볼 것</Text>
      <Text style={styles.learningTry}>{card.tryToday}</Text>
      <Text style={styles.learningLabel}>이런 반응은 관찰해요</Text>
      {card.watchFor.map((item) => <View key={item} style={styles.learningBulletRow}><Text style={styles.learningBullet}>•</Text><Text style={styles.learningBody}>{item}</Text></View>)}
      <Text style={styles.learningBoundary}>{card.boundary}</Text>
    </View>
  );
}

export function CompanionMissionScreen({ now = new Date(), missingReflectionCount = 0, onOpenRecords, header, day, mission, profile, companionEvent, companionResponse, companionPresetId, onCompanionPreset, photoAvatarId, onRegisterPhotoAvatar, onRemovePhotoAvatar, careStartedOn, careMessages, careResponses, onCompleteCareMessage, companionSoundEnabled, onCompanionSoundEnabled, onCompanionResponse, note, onNote, difficulty, onDifficulty, emotion, onEmotion, eventResponse, eventOptions, onEventResponse, completedToday, onSaveMission, reminder, onConfigureReminder, onSaveReminderSchedule }) {
  const [activeTab, setActiveTab] = useState('care');
  const careSummary = careDaySummary({ schema: 'dog-first.companion.v5', careStartedOn, careResponses }, day, now);
  const primaryDisabled = completedToday || !careSummary.readyForMission;
  const learningCard = learningCardForDay(day);
  const missionTabs = READINESS_LEARNING_RUNTIME_ENABLED
    ? [['care', '돌봄'], ['learning', '배움'], ['reflection', '회고'], ['settings', '설정']]
    : [['care', '돌봄'], ['reflection', '회고'], ['settings', '설정']];

  return (
    <SafeAreaView style={styles.safe}>
      {header}
      <View style={styles.tabs} accessibilityRole="tablist">
        {missionTabs.map(([id, label]) => <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: activeTab === id }} onPress={() => setActiveTab(id)} style={[styles.tab, activeTab === id && styles.tabSelected]}><Text style={[styles.tabText, activeTab === id && styles.tabTextSelected]}>{label}</Text></Pressable>)}
      </View>
      <ScrollView key={activeTab} contentContainerStyle={styles.page}>
        <View accessibilityLabel={`7일 중 ${day}일째`}>
          <View style={styles.dayRail}>
            <Text style={styles.eyebrow}>7일 중 {day}일</Text>
            <Text style={styles.dayCount}>7일 중 {day}일</Text>
          </View>
          <DayDots day={day} />
        </View>

        {missingReflectionCount > 0 ? <Pressable accessibilityRole="button" onPress={onOpenRecords} style={styles.careGate}><Text style={styles.notice}>이전 {missingReflectionCount}일의 회고가 남아 있어요. 오늘 돌봄은 계속할 수 있으며, 작성 중이던 메모는 기록에서 확인할 수 있어요.</Text></Pressable> : null}
        {completedToday ? <Text accessibilityLiveRegion="polite" style={styles.careGate}>{day === 7 ? '7일의 기록을 저장했어요.' : '오늘 기록을 저장했어요. 내일 날짜가 되면 다음 요청이 열립니다.'}</Text> : null}
        {activeTab === 'care' ? <>
        <CompanionHero event={companionEvent} presetId={companionPresetId} profileName={profile?.name} />
        <CareMessageInbox messages={careMessages} responses={careResponses} summary={careSummary} onComplete={onCompleteCareMessage} />
        <CompanionEventPanel event={companionEvent} response={companionResponse} soundEnabled={companionSoundEnabled} onSoundEnabled={onCompanionSoundEnabled} onRespond={onCompanionResponse} />

        {READINESS_LEARNING_RUNTIME_ENABLED ? <Pressable accessibilityRole="button" onPress={() => setActiveTab('learning')} style={styles.skip}><Text style={styles.skipText}>오늘 알아둘 1가지 보기 →</Text></Pressable> : null}
        <Pressable accessibilityRole="button" onPress={() => setActiveTab('reflection')} style={styles.skip}><Text style={styles.skipText}>오늘의 회고 {completedToday ? '확인' : '작성'} →</Text></Pressable>
        </> : null}

        {READINESS_LEARNING_RUNTIME_ENABLED && activeTab === 'learning' ? <>
          <LearningCard card={learningCard} />
          <Pressable accessibilityRole="button" onPress={() => setActiveTab('reflection')} style={styles.skip}><Text style={styles.skipText}>오늘의 회고로 이동 →</Text></Pressable>
        </> : null}

        {activeTab === 'reflection' ? <>
        {completedToday ? (
          <View>
            <Text style={styles.reflectionEyebrow}>오늘의 되돌아보기</Text>
            <Text style={styles.title}>{mission?.title}</Text>
            <Text style={styles.intro}>{note || '남긴 메모가 없어요.'}</Text>
            <Text style={styles.notice}>체감 난이도 {difficulty}/5 · {emotion}</Text>
          </View>
        ) : day === 6 && !eventResponse ? (
          <View style={styles.eventBox}>
            <Text style={styles.sectionTitle}>생활 조건도 함께 바뀌었다면?</Text>
            <Text style={styles.intro}>강아지가 집을 어지른 상황과 함께, 평일 외출이 길어진 상황에도 답해 보세요.</Text>
            {eventOptions.map((option) => <Pressable accessibilityRole="button" key={option.id} style={styles.option} onPress={() => onEventResponse(option)}><Text style={styles.optionText}>{option.label}</Text><Text style={styles.arrow}>→</Text></Pressable>)}
          </View>
        ) : (
          <>
            <View style={styles.reflectionHeading}>
              <Text style={styles.reflectionEyebrow}>오늘의 되돌아보기</Text>
              <Text style={styles.title}>{mission?.title}</Text>
              <Text style={styles.intro}>{mission?.prompt}</Text>
            </View>
            <Text style={styles.label}>오늘 남길 한 줄</Text>
            <TextInput editable={!completedToday} multiline accessibilityLabel="오늘 남길 한 줄" placeholder={mission?.prompt} placeholderTextColor="#8C9385" value={note} onChangeText={onNote} style={styles.input} />
            <Text style={styles.label}>오늘의 체감 난이도</Text>
            <View style={styles.scale}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} accessibilityRole="button" onPress={() => onDifficulty(value)} style={[styles.scaleItem, difficulty === value && styles.scaleSelected]}><Text style={styles.scaleText}>{value}</Text></Pressable>)}</View>
            <Text style={styles.label}>지금의 느낌</Text>
            <View style={styles.emotions}>{['차분함', '현실적임', '조금 불안함'].map((value) => <Pressable accessibilityRole="button" key={value} onPress={() => onEmotion(value)} style={[styles.emotion, emotion === value && styles.emotionSelected]}><Text style={[styles.emotionText, emotion === value && styles.emotionTextSelected]}>{value}</Text></Pressable>)}</View>
            {eventResponse ? <View style={styles.feedback}><Text style={styles.feedbackLabel}>선택한 생활 대응</Text><Text style={styles.feedbackText}>{eventResponse.feedback}</Text></View> : null}
            {!careSummary.readyForMission ? <Text accessibilityLiveRegion="polite" style={styles.careGate}>오늘 요청이 모두 완료되거나 놓친 돌봄으로 확정된 뒤 완료할 수 있어요. 건너뛰면 남은 요청은 놓친 돌봄으로 기록됩니다.</Text> : null}
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: primaryDisabled }} disabled={primaryDisabled} style={[styles.primary, primaryDisabled && styles.disabled]} onPress={() => onSaveMission('completed')}><Text style={styles.primaryText}>{day === 7 ? '최종 리포트 만들기' : '오늘 돌봄 확인 완료'}</Text><Text style={styles.arrow}>↗</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={completedToday} style={styles.skip} onPress={() => onSaveMission('skipped')}><Text style={styles.skipText}>오늘은 건너뛰기 · 남은 요청은 놓침 처리</Text></Pressable>
          </>
        )}

        <Pressable accessibilityRole="button" onPress={onOpenRecords} style={styles.skip}><Text style={styles.skipText}>이전 기록과 작성 중인 메모 보기</Text></Pressable>
        </> : null}

        {activeTab === 'settings' ? <>
        <Text style={styles.settingsSectionTitle}>설정</Text>
        <CompanionAppearanceSettings presetId={companionPresetId} onSelectPreset={onCompanionPreset} />
        <ReminderSettings reminder={reminder} onToggle={onConfigureReminder} onSave={onSaveReminderSchedule} />
        </> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F1E9' },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingVertical: 10 },
  tab: { flex: 1, minHeight: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9E5DA' },
  tabSelected: { backgroundColor: '#355844' },
  tabText: { color: '#49634F', fontWeight: '800', fontSize: 14 },
  tabTextSelected: { color: '#FBF7ED' },
  notice: { color: '#5E685F', fontSize: 12, lineHeight: 18 },
  page: { padding: 22, paddingBottom: 54 },
  dayRail: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayCount: { color: '#526553', fontSize: 11, fontWeight: '800' },
  eyebrow: { color: '#72806B', fontWeight: '800', fontSize: 10, letterSpacing: 1.5 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 10, marginBottom: 16 },
  dot: { flex: 1, height: 4, backgroundColor: '#D9D6CB' },
  dotDone: { backgroundColor: '#789068' },
  dotCurrent: { backgroundColor: '#284536' },
  reflectionHeading: { borderTopWidth: 2, borderTopColor: '#5D735B', paddingTop: 14, marginTop: 2 },
  reflectionEyebrow: { color: '#64745F', fontWeight: '900', letterSpacing: 1.1, fontSize: 9 },
  title: { color: '#20352C', fontSize: 29, lineHeight: 35, fontWeight: '800', marginTop: 5 },
  intro: { color: '#5E685F', fontSize: 15, lineHeight: 22, marginTop: 10, marginBottom: 18 },
  label: { color: '#273A2D', fontSize: 15, fontWeight: '800', marginTop: 16, marginBottom: 9 },
  input: { minHeight: 100, backgroundColor: '#FCFAF5', padding: 14, color: '#283D2D', fontSize: 15, lineHeight: 22, textAlignVertical: 'top', borderWidth: 1, borderColor: '#D5D3C9' },
  scale: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  scaleItem: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#BFC8B9', justifyContent: 'center', alignItems: 'center' },
  scaleSelected: { backgroundColor: '#C4DC9D', borderColor: '#628157' },
  scaleText: { color: '#314738', fontWeight: '800' },
  emotions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotion: { borderWidth: 1, borderColor: '#C7CBBF', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10 },
  emotionSelected: { backgroundColor: '#284536', borderColor: '#284536' },
  emotionText: { color: '#526053', fontSize: 13 },
  emotionTextSelected: { color: '#F9F6ED', fontWeight: '800' },
  careGate: { color: '#7A5A45', fontSize: 11, lineHeight: 17, marginTop: 18, backgroundColor: '#F2E9DE', padding: 11 },
  primary: { minHeight: 58, backgroundColor: '#C4DC9D', paddingHorizontal: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  primaryText: { color: '#173126', fontSize: 16, fontWeight: '800' },
  arrow: { color: '#506D4D', fontSize: 18 },
  disabled: { opacity: 0.42 },
  skip: { paddingVertical: 20, alignItems: 'center' },
  skipText: { color: '#526553', fontSize: 14, textDecorationLine: 'underline', textAlign: 'center' },
  eventBox: { backgroundColor: '#F1EADF', padding: 18, marginTop: 6 },
  sectionTitle: { color: '#284236', fontSize: 18, fontWeight: '800' },
  option: { borderTopWidth: 1, borderTopColor: '#D4CFC4', paddingVertical: 14, flexDirection: 'row', gap: 10 },
  optionText: { color: '#334737', fontSize: 14, lineHeight: 20, flex: 1 },
  feedback: { backgroundColor: '#E2E9D6', padding: 13, marginTop: 18 },
  feedbackLabel: { color: '#49633E', fontSize: 10, fontWeight: '800' },
  feedbackText: { color: '#334737', fontSize: 13, lineHeight: 19, marginTop: 5 },
  settingsSectionTitle: { color: '#294334', fontSize: 18, lineHeight: 24, fontWeight: '900', marginTop: 26 },
  learningCard: { backgroundColor: '#FCFAF5', borderWidth: 1, borderColor: '#D4D9CA', padding: 18 },
  learningEyebrow: { color: '#64745F', fontWeight: '900', letterSpacing: 1.1, fontSize: 9 },
  learningTitle: { color: '#20352C', fontSize: 25, lineHeight: 31, fontWeight: '800', marginTop: 6 },
  learningSummary: { color: '#4F5E52', fontSize: 15, lineHeight: 22, marginTop: 10, marginBottom: 18 },
  learningLabel: { color: '#2D4938', fontSize: 13, fontWeight: '900', marginTop: 14, marginBottom: 6 },
  learningBody: { color: '#5E685F', fontSize: 14, lineHeight: 21, flex: 1 },
  learningTry: { color: '#294334', backgroundColor: '#E6EDD9', padding: 13, fontSize: 14, lineHeight: 21, fontWeight: '700' },
  learningBulletRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  learningBullet: { color: '#66805E', fontWeight: '900' },
  learningBoundary: { color: '#7A6B58', fontSize: 11, lineHeight: 17, borderTopWidth: 1, borderTopColor: '#DDD9CF', paddingTop: 12, marginTop: 18 },
  reminder: { marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#D6D3C8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  reminderCopy: { flex: 1 },
  reminderTitle: { color: '#2D4332', fontWeight: '800', fontSize: 14 },
  reminderBody: { color: '#6F7A70', fontSize: 12, marginTop: 4, lineHeight: 17 },
  reminderButton: { borderWidth: 1, borderColor: '#486548', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 },
  reminderButtonText: { color: '#355438', fontWeight: '800', fontSize: 12 },
});
