import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import LightningBolt from './LightningBolt';

// เอฟเฟกต์เต็มจอตอนคำสาปมรณะสำเร็จ 3 ท่าติดต่อกัน — แฟลชเขียวทั้งจอ + สายฟ้าสีเขียวมรณะ 3 เส้นพุ่งลง
export default function AvadaCurseEffect({ triggerId }) {
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!triggerId) return;
    flash.setValue(0);
    Animated.sequence([
      Animated.timing(flash, { toValue: 0.85, duration: 70, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0.15, duration: 140, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [triggerId]);

  if (!triggerId) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.flash, { opacity: flash }]} />
      <LightningBolt seed={triggerId} delay={0} color={colors.avadaGlow} glowColor={colors.avada} strokeWidth={6} style={{ left: '20%' }} />
      <LightningBolt seed={triggerId + 0.42} delay={40} color={colors.avadaGlow} glowColor={colors.avada} strokeWidth={7} style={{ left: '46%' }} />
      <LightningBolt seed={triggerId + 0.81} delay={80} color={colors.avadaGlow} glowColor={colors.avada} strokeWidth={6} style={{ left: '72%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.avada },
});
