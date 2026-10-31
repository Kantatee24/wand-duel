import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, hpColor } from '../theme';

export default function HPBar({ name, hp, shieldActive, mirrored }) {
  const widthAnim = useRef(new Animated.Value(hp)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.max(0, Math.min(100, hp)),
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [hp]);

  const widthPercent = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrap}>
      <View style={[styles.labelRow, mirrored && styles.labelRowMirrored]}>
        <Text style={styles.name} numberOfLines={1}>
          {shieldActive ? '🛡️ ' : ''}
          {name}
        </Text>
        <Text style={styles.hpText}>{Math.round(hp)}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: widthPercent, backgroundColor: hpColor(hp) }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  labelRowMirrored: { flexDirection: 'row-reverse' },
  name: { color: colors.textPrimary, fontFamily: fonts.serifBold, fontSize: 15, flexShrink: 1 },
  hpText: { color: colors.textMuted, fontFamily: fonts.serifBold, fontSize: 15 },
  track: {
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(107,68,35,0.18)',
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 8 },
});
