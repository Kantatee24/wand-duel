import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const SIZE = 190;
const TICKS = 8;

// โล่เรืองแสงหมุน พร้อม spring เด้งเข้า แทนวงแหวนนิ่งๆ ตอนร่าย Protego
export default function ShieldBarrier({ color, triggerId }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!triggerId) return;
    scale.setValue(0.5);
    opacity.setValue(0);
    spin.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 260, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(opacity, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]),
    ]).start();
  }, [triggerId]);

  if (!triggerId) return null;

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '160deg'] });

  return (
    <View pointerEvents="none" style={styles.center}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 6} stroke={color} strokeWidth={10} fill={`${color}22`} />
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 20} stroke={color} strokeWidth={2} strokeDasharray="4 7" fill="none" />
        </Svg>
        <Animated.View style={[styles.ticks, { transform: [{ rotate }] }]}>
          {Array.from({ length: TICKS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.tick,
                { backgroundColor: color, transform: [{ rotate: `${(360 / TICKS) * i}deg` }, { translateY: -SIZE / 2 + 6 }] },
              ]}
            />
          ))}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ticks: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: { position: 'absolute', width: 4, height: 16, borderRadius: 2 },
});
