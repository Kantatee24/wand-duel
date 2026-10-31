import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { guideTemplate } from '../utils/gesture';
import { colors, spellColors } from '../theme';

function pointsToPath(points) {
  if (!points.length) return '';
  return points.reduce((d, p, i) => d + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');
}

// กระดานแสดงเส้นประนำทางของท่าคาถา + เส้นที่สะบัดได้จริงจากไจโร/accelerometer แบบ real-time
export default function WandTraceBoard({ target, width, height, points, active }) {
  const guideD = useMemo(() => pointsToPath(guideTemplate(target, { width, height })), [target, width, height]);
  const drawnD = useMemo(() => pointsToPath(points), [points]);
  const tip = points[points.length - 1];
  const color = spellColors[target] ?? colors.gold;

  return (
    <View style={[styles.board, { width, height }, active && styles.boardActive]}>
      <Svg width={width} height={height}>
        <Path
          d={guideD}
          stroke="rgba(166,121,15,0.5)"
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
        {tip && <Circle cx={tip.x} cy={tip.y} r={10} fill={color} opacity={0.95} />}
        {tip && <Circle cx={tip.x} cy={tip.y} r={18} fill={color} opacity={0.22} />}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(243,230,196,0.35)',
    borderWidth: 2,
    borderColor: 'rgba(166,121,15,0.35)',
  },
  boardActive: {
    borderColor: colors.gold,
  },
});
