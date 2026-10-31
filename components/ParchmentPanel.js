import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

// แผ่นกระดาษโบราณ — กรอบทองบาง + กรอบไม้น้ำตาลหนา ซ้อนกันแบบตราประกาศ/ป้ายเก่า
export default function ParchmentPanel({ children, style, contentStyle, tone = 'light' }) {
  const bg = tone === 'dark' ? colors.parchmentDark : colors.parchment;
  return (
    <View style={[styles.outerGold, style]}>
      <View style={[styles.innerBrown, { backgroundColor: bg }]}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerGold: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.goldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  innerBrown: {
    borderRadius: 11,
    borderWidth: 3,
    borderColor: colors.border,
    margin: 3,
    overflow: 'hidden',
  },
  content: { padding: 20 },
});
