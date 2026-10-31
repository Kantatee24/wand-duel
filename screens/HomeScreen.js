import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlowButton from '../components/GlowButton';
import ParchmentPanel from '../components/ParchmentPanel';
import MagicOrb from '../components/scene/MagicOrb';
import { playSfx } from '../utils/sound';
import { colors, fonts } from '../theme';

export default function HomeScreen({ onCreate, onJoin, onPractice, busy, error }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState(null); // null | 'join'

  const effectiveName = name.trim() || `Spellbinder${Math.floor(Math.random() * 900 + 100)}`;

  const tap = (fn) => (...args) => {
    playSfx('tap');
    fn(...args);
  };

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require('../assets/images/houses-banner.png')} style={styles.banner} resizeMode="contain" />

          <View style={{ alignItems: 'center' }}>
            <MagicOrb size={110} />
          </View>
          <Text style={styles.title}>Wand Duel</Text>
          <Text style={styles.subtitle}>สะบัดไม้กายสิทธิ์ ร่ายคาถาใส่คู่ปรับของเธอ</Text>

          <ParchmentPanel>
            <Text style={styles.label}>นามของนักเวท</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={effectiveName}
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
              maxLength={16}
            />

            {mode === 'join' && (
              <>
                <Text style={[styles.label, { marginTop: 14 }]}>รหัสตราผนึก (4 หลัก)</Text>
                <TextInput
                  value={joinCode}
                  onChangeText={(t) => setJoinCode(t.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="1234"
                  placeholderTextColor={colors.inkFaint}
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </>
            )}

            {!!error && <Text style={styles.error}>{error}</Text>}

            {busy ? (
              <ActivityIndicator color={colors.gold} style={{ marginTop: 20 }} />
            ) : mode === 'join' ? (
              <View style={styles.row}>
                <GlowButton title="ย้อนกลับ" outline color={colors.inkMuted} onPress={tap(() => setMode(null))} style={styles.flexBtn} />
                <GlowButton
                  title="เข้าห้อง"
                  color={colors.spellStorm}
                  disabled={joinCode.length !== 4}
                  onPress={tap(() => onJoin(effectiveName, joinCode))}
                  style={styles.flexBtn}
                />
              </View>
            ) : (
              <View style={{ marginTop: 20, gap: 12 }}>
                <GlowButton title="⚔ เปิดห้องดวล" color={colors.spellFire} onPress={tap(() => onCreate(effectiveName))} />
                <GlowButton title="เข้าร่วมห้อง" outline color={colors.spellStorm} onPress={tap(() => setMode('join'))} />
                <GlowButton title="🕯 ฝึกซ้อมท่าคนเดียว" outline color={colors.spellWard} onPress={tap(onPractice)} />
              </View>
            )}
          </ParchmentPanel>

          <Text style={styles.hint}>ต้องใช้ 2 เครื่อง — คนหนึ่งเปิดห้อง อีกคนกรอกรหัสเข้าร่วม</Text>

          <Image source={require('../assets/images/castle.png')} style={styles.castle} resizeMode="contain" />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  banner: {
    width: '82%',
    aspectRatio: 523 / 407,
    alignSelf: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  castle: {
    width: '85%',
    aspectRatio: 508 / 491,
    alignSelf: 'center',
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 52,
    color: colors.ink,
    textAlign: 'center',
    fontFamily: fonts.display,
  },
  subtitle: { color: colors.inkMuted, textAlign: 'center', marginTop: 4, marginBottom: 24, fontFamily: fonts.serifItalic, fontSize: 15 },
  label: { color: colors.inkMuted, marginBottom: 6, fontFamily: fonts.serifBold },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.ink,
    fontSize: 16,
    fontFamily: fonts.serif,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  row: { flexDirection: 'row', gap: 12, marginTop: 20 },
  flexBtn: { flex: 1 },
  error: { color: colors.danger, marginTop: 12, textAlign: 'center', fontFamily: fonts.serifBold },
  hint: { color: colors.inkMuted, textAlign: 'center', marginTop: 18, fontSize: 12, fontFamily: fonts.serifItalic },
});
