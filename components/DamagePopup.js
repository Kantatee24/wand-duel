import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

// เลขดาเมจลอยขึ้นแล้วจางหาย ขึ้นตอนโดนตี — triggerId เปลี่ยนทุกครั้งที่โดนตีใหม่
export default function DamagePopup({ triggerId, amount }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!triggerId) return;
    translateY.setValue(0);
    opacity.setValue(1);
    Animated.parallel([
      Animated.timing(translateY, { toValue: -44, duration: 750, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(250),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, [triggerId]);

  if (!triggerId || !amount) return null;

  return (
    <Animated.Text pointerEvents="none" style={[styles.text, { opacity, transform: [{ translateY }] }]}>
      -{amount}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    alignSelf: 'center',
    top: -6,
    color: colors.danger,
    fontFamily: fonts.decorative,
    fontSize: 22,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
});
