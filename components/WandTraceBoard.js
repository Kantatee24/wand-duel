import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { guideTemplate } from '../utils/gesture';
import { colors, spellColors } from '../theme';

const WAND_SIZE = 30;

function pointsToPath(points) {
  if (!points.length) return '';
  return points.reduce((d, p, i) => d + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');
}

// มุมที่ปลายไม้กายสิทธิ์ควรหมุนไปตามทิศที่กำลังสะบัดจริง (จากจุดสองจุดหลังสุด)
function headingDeg(tip, prev) {
  if (!tip || !prev || (tip.x === prev.x && tip.y === prev.y)) return -90; // ค่าเริ่มต้น: ชี้ขึ้น
  return (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI;
}

// กระดานแสดงเส้นประนำทางของท่าคาถา + เส้นที่สะบัดได้จริงจากไจโร/accelerometer แบบ real-time
// ปลายเส้นที่กำลังลากใช้รูปไม้กายสิทธิ์หมุนตามทิศทางแทนจุดวงกลม — เส้นที่ลากยังวาดเหมือนเดิมทุกอย่าง
export default function WandTraceBoard({ target, width, height, points, active }) {
  const guideD = useMemo(() => pointsToPath(guideTemplate(target, { width, height })), [target, width, height]);
  const drawnD = useMemo(() => pointsToPath(points), [points]);
  const tip = points[points.length - 1];
  const prev = points[points.length - 2];
  const color = spellColors[target] ?? colors.gold;
  const angle = headingDeg(tip, prev);

  return (
    <View style={[styles.board, { width, height }, active && styles.boardActive]}>
      <Svg width={width} height={height}>
        <Path
          d={guideD}
          stroke="rgba(57,255,110,0.45)"
          strokeWidth={3}
          strokeDasharray="10 9"
          strokeLinecap="round"
          fill="none"
        />
        {!!drawnD && (
          <>
            <Path d={drawnD} stroke={color} strokeOpacity={0.28} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d={drawnD} stroke={color} strokeOpacity={0.5} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d={drawnD} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </Svg>
      {tip && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.tipGlow,
              {
                left: tip.x - 20,
                top: tip.y - 20,
                backgroundColor: color,
                shadowColor: color,
              },
            ]}
          />
          <Image
            source={require('../assets/images/wand.png')}
            resizeMode="contain"
            pointerEvents="none"
            style={[
              styles.tipWand,
              {
                left: tip.x - WAND_SIZE / 2,
                top: tip.y - (WAND_SIZE * 1.35) / 2,
                transform: [{ rotate: `${angle + 90}deg` }],
              },
            ]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,22,15,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(57,255,110,0.35)',
  },
  boardActive: {
    borderColor: colors.gold,
  },
  tipGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.28,
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  tipWand: {
    position: 'absolute',
    width: WAND_SIZE,
    height: WAND_SIZE * 1.35,
  },
});
