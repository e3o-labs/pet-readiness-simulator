import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { validReminderSchedule } from './missionReminders';

export function ReminderSettings({ reminder, onToggle, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ weekday: '', weekend: '' });
  const normalizedDraft = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.split(':').map((part) => part ? part.padStart(2, '0') : '').join(':')]));
  const valid = validReminderSchedule(reminder.schedule);
  const edit = () => { setDraft(reminder.schedule || { weekday: '', weekend: '' }); setOpen(true); };
  const status = reminder.status === 'schedule_error' ? '예약하지 못했어요. 다시 켜 주세요.'
    : reminder.status === 'permission_denied' ? '아이폰 설정에서 알림을 허용해 주세요.'
    : reminder.status === 'complete' ? '남은 알림이 없어요.'
    : reminder.optedIn ? (reminder.status === 'permission_granted' ? '선택한 시간에 알려드려요.' : '알림을 예약하고 있어요.')
    : '알림 꺼짐';
  return <View style={s.section}>
    <View style={s.row}>
      <View style={s.copy}><Text style={s.title}>돌봄 알림</Text><Text style={s.body}>{valid ? status : '알림 받을 시간을 선택해 주세요.'}</Text></View>
      <Switch accessibilityLabel="돌봄 알림" value={Boolean(reminder.optedIn)} disabled={!valid} onValueChange={onToggle} trackColor={{ true: '#486548' }} />
    </View>
    {valid && <Text style={s.times}>평일 {reminder.schedule.weekday} · 주말 {reminder.schedule.weekend}</Text>}
    <Pressable accessibilityRole="button" onPress={edit} style={s.button}><Text style={s.buttonText}>{valid ? '시간 변경' : '시간 선택'}</Text></Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.backdrop}><View accessibilityViewIsModal style={s.modal}><ScrollView keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>알림 받을 시간</Text>
        <Text style={s.body}>기기 현지 시각 · 24시간 기준</Text>
        {['weekday', 'weekend'].map((kind) => {
          const [hour = '', minute = ''] = draft[kind].split(':');
          const label = kind === 'weekday' ? '평일' : '주말';
          return <View key={kind} style={s.timeRow}>
            <Text style={s.label}>{label}</Text>
            <TextInput accessibilityLabel={label + ' 알림 시 (0~23)'} keyboardType="number-pad" maxLength={2} placeholder="시" value={hour} onChangeText={(v) => setDraft((d) => ({ ...d, [kind]: v.replace(/\D/g, '') + ':' + minute }))} style={s.input} />
            <Text>:</Text>
            <TextInput accessibilityLabel={label + ' 알림 분 (0~59)'} keyboardType="number-pad" maxLength={2} placeholder="분" value={minute} onChangeText={(v) => setDraft((d) => ({ ...d, [kind]: hour + ':' + v.replace(/\D/g, '') }))} style={s.input} />
          </View>;
        })}
        <View style={s.actions}>
          <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={s.button}><Text style={s.buttonText}>취소</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={!validReminderSchedule(normalizedDraft)} onPress={() => { onSave(normalizedDraft); setOpen(false); }} style={[s.button, !validReminderSchedule(normalizedDraft) && s.disabled]}><Text style={s.buttonText}>저장</Text></Pressable>
        </View>
      </ScrollView></View></KeyboardAvoidingView>
    </Modal>
  </View>;
}
const s = StyleSheet.create({
  section: { marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#D6D3C8' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, copy: { flex: 1 },
  title: { color: '#2D4332', fontWeight: '800', fontSize: 14 },
  body: { color: '#526053', fontSize: 13, marginTop: 6, lineHeight: 20 },
  times: { color: '#2D4332', fontSize: 14, marginTop: 12 },
  button: { minHeight: 44, borderWidth: 1, borderColor: '#486548', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 12, alignSelf: 'flex-start', marginTop: 12 },
  buttonText: { color: '#355438', fontSize: 14, fontWeight: '700' }, disabled: { opacity: 0.4 },
  backdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#00000066' },
  modal: { backgroundColor: '#F5F1E9', borderRadius: 8, padding: 20, maxHeight: '85%', width: '100%', maxWidth: 420, alignSelf: 'center' },
  heading: { fontSize: 22, fontWeight: '700', color: '#2D4332' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' },
  label: { width: 52, fontSize: 16, color: '#2D4332' },
  input: { width: 64, height: 48, borderWidth: 1, borderColor: '#7B8875', borderRadius: 6, fontSize: 20, textAlign: 'center', color: '#2D4332', backgroundColor: '#FFFFFF' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
});
