import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const PARTICLE_COUNT = 12;

function makeParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 45 + Math.random() * 55;
    const size = 16 + Math.random() * 20;
    const hueMix = Math.random(); // 0 = ไส้เหลือง, 1 = ขอบแดงเข้ม
    return { angle, distance, size, hueMix };
  });
}

// เอฟเฟกต์ไฟกระจายเป็นประกายเคลื่อนไหวจริง (ไม่ใช่วงกลมนิ่งๆ) ตอนร่าย Incendio
export default function FireBurst({ triggerId }) {
  const progress = useRef(new Animated.Value(0)).current;
  const particles = useMemo(() => makeParticles(), [triggerId]);

  useEffect(() => {
    if (!triggerId) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 680, useNativeDriver: true }).start();
  }, [triggerId]);

  if (!triggerId) return null;

  return (
    <View pointerEvents="none" style={styles.center}>
      <Animated.View
        style={[
          styles.coreGlow,
          {
            opacity: progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.9, 0] }),
            transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.4] }) }],
          },
        ]}
      />
      {particles.map((p, i) => {
        const tx = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.angle) * p.distance] });
        const ty = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(p.angle) * p.distance - p.distance * 0.45],
        });
        const scale = progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.2, 1, 0.15] });
        const opacity = progress.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 0.7, 0] });
        const color = `rgb(255, ${Math.round(150 - p.hueMix * 95)}, ${Math.round(45 - p.hueMix * 40)})`;
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size * 1.3,
                borderRadius: p.size,
                backgroundColor: color,
                opacity,
                transform: [{ translateX: tx }, { translateY: ty }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  coreGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#ff8a3d',
  },
  particle: { position: 'absolute' },
});
