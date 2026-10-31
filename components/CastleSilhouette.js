import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

// ปราสาทเงาซิลูเอตที่ออกแบบเอง (ไม่อ้างอิงภาพถ่ายหรือโลโก้ของสื่อใดๆ)
const TOWERS = [
  { h: 60, w: 30 },
  { h: 95, w: 36 },
  { h: 130, w: 42 },
  { h: 90, w: 34 },
  { h: 68, w: 28 },
];

export default function CastleSilhouette({ tint = colors.vignette, style }) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      <View style={styles.row}>
        {TOWERS.map((t, i) => (
          <Tower key={i} height={t.h} width={t.w} color={tint} />
        ))}
      </View>
      <View style={[styles.baseWall, { backgroundColor: tint }]}>
        <View style={styles.crenellationRow}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={[styles.crenellation, { backgroundColor: tint }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

function Tower({ height, width, color }) {
  return (
    <View style={styles.towerCol}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: width / 2 + 4,
          borderRightWidth: width / 2 + 4,
          borderBottomWidth: width * 0.55,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View style={{ width, height, backgroundColor: color }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 170, justifyContent: 'flex-end' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
  },
  towerCol: { alignItems: 'center', justifyContent: 'flex-end' },
  baseWall: { height: 24, width: '100%', marginTop: -2 },
  crenellationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  crenellation: { width: 11, height: 9, marginTop: -9 },
});
