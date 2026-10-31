import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import GlowButton from '../components/GlowButton';
import WizardAvatar from '../components/WizardAvatar';
import CastleSilhouette from '../components/CastleSilhouette';
import { playSfx } from '../utils/sound';
import { colors, fonts } from '../theme';

export default function GameOverScreen({ room, mySlot, onRematch, onExit }) {
  const won = room.winner === mySlot;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Haptics.notificationAsync(
      won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    playSfx(won ? 'victory' : 'defeat');
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, []);

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.container}>
      <WizardAvatar
        emoji={won ? '🧙' : '🧙‍♂️'}
        color={won ? colors.hpHigh : colors.danger}
        defeated={!won}
        size={100}
      />

      <Animated.Text
        style={[
          styles.result,
          { color: won ? colors.hpHigh : colors.danger, transform: [{ scale }] },
        ]}
      >
        {won ? 'ชัยชนะ' : 'ปราชัย'}
      </Animated.Text>
      <Text style={styles.subtitle}>
        {won ? 'คาถาของเธอทรงพลังที่สุดในสนามดวล' : 'ฝึกสะบัดไม้กายสิทธิ์แล้วมาดวลใหม่'}
      </Text>

      <View style={{ marginTop: 36, gap: 12, width: '100%' }}>
        <GlowButton title="⚔ ดวลใหม่อีกครั้ง" color={colors.spellFire} onPress={onRematch} />
        <GlowButton title="กลับหน้าหลัก" outline color={colors.inkMuted} onPress={onExit} />
      </View>

      <CastleSilhouette style={styles.castle} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  result: { fontSize: 48, textAlign: 'center', marginTop: 16, fontFamily: fonts.display },
  subtitle: { color: colors.inkMuted, marginTop: 10, textAlign: 'center', fontFamily: fonts.serifItalic },
  castle: { position: 'absolute', bottom: 0 },
});
