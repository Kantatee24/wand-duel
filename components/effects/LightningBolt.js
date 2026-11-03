import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const WIDTH = 80;
const HEIGHT = 280;

// สร้างเส้นฟ้าผ่าซิกแซกแบบสุ่มจาก seed (คงที่ต่อ seed เดียวกัน ไม่กระพริบสุ่มใหม่ทุก re-render)
function boltPath(seed) {
  const rand = (n) => {
    const v = Math.sin(seed * 999 + n * 57.13) * 43758.5453;
    return v - Math.floor(v);
  };
  const steps = 7;
  let d = `M ${WIDTH * (0.35 + rand(0) * 0.3)} 0`;
  for (let i = 1; i <= steps; i++) {
    const y = (HEIGHT / steps) * i;
    const x = WIDTH * (0.2 + rand(i) * 0.6);
    d += ` L ${x} ${y}`;
  }
  return d;
}

// ฟ้าผ่าซิกแซกจริงเป็นเส้นหยัก พร้อม glow ด้านหลัง ตอนร่าย Stupefy (หรือ Avada Kedavra ถ้าเปลี่ยนสี)
export default function LightningBolt({ seed, delay = 0, style, color = '#eaf4ff', glowColor = '#bcd9ff', strokeWidth = 4 }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, { toValue: 1, duration: 35, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.3, duration: 55, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 35, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [seed, delay, opacity]);

  const d = boltPath(seed);

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { opacity }, style]}>
      <Svg width={WIDTH} height={HEIGHT}>
        <Path d={d} stroke={glowColor} strokeWidth={strokeWidth * 3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.35} />
        <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0 },
});
