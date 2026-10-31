import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import GlowButton from '../components/GlowButton';
import ParchmentPanel from '../components/ParchmentPanel';
import WizardAvatar from '../components/WizardAvatar';
import SpellEffectOverlay from '../components/SpellEffectOverlay';
import WandTraceBoard from '../components/WandTraceBoard';
import WandIcon from '../components/WandIcon';
import SpellRune from '../components/scene/SpellRune';
import { useWandTrace } from '../hooks/useWandTrace';
import { classifyStroke } from '../utils/gesture';
import { playSfx } from '../utils/sound';
import { colors, fonts, spellColors, spellLabels } from '../theme';

const TARGETS = ['fireball', 'lightning', 'shield'];
const PASS_SCORE = 55;

const INSTRUCTIONS = {
  fireball: 'กดค้างแล้วกระดกโทรศัพท์ขึ้นข้างบนเร็วๆ แรงๆ',
  lightning: 'กดค้างแล้วสะบัดข้อมือซิกแซกซ้าย-ขวาเร็วๆ',
  shield: 'กดค้างแล้วแกว่งโทรศัพท์เป็นครึ่งวงกลม (ซ้าย-บน-ขวา)',
};

function pickNextTarget(current) {
  const choices = TARGETS.filter((t) => t !== current);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function PracticeScreen({ onExit }) {
  const { width } = useWindowDimensions();
  const boardWidth = Math.min(width - 56, 340);
  const boardHeight = Math.round(boardWidth * 0.68);

  const { charging, start, stop } = useWandTrace();
  const [target, setTarget] = useState(TARGETS[0]);
  const [tracePoints, setTracePoints] = useState([]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [effect, setEffect] = useState(null);
  const [hitTrigger, setHitTrigger] = useState(0);
  const [locked, setLocked] = useState(false);
  const chargeAnim = useRef(new Animated.Value(1)).current;
  const advanceTimer = useRef(null);
  const effectId = useRef(0);

  const onPressIn = () => {
    if (locked) return;
    clearTimeout(advanceTimer.current);
    setLastResult(null);
    Haptics.selectionAsync();
    Animated.loop(
      Animated.sequence([
        Animated.timing(chargeAnim, { toValue: 1.15, duration: 350, useNativeDriver: true }),
        Animated.timing(chargeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ])
    ).start();
    start({ width: boardWidth, height: boardHeight }, setTracePoints);
  };

  const onPressOut = () => {
    if (!charging) return;
    chargeAnim.stopAnimation();
    chargeAnim.setValue(1);
    const points = stop();
    const result = classifyStroke(points, { width: boardWidth, height: boardHeight });
    const isCorrect = result.type === target && result.score >= PASS_SCORE;

    setAttempts((a) => a + 1);
    setLastResult({ ...result, isCorrect });
    playSfx(result.type);

    if (result.type !== 'fizzle') {
      effectId.current += 1;
      setEffect({ type: result.type, id: effectId.current });
    }

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrect((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setBest((b) => Math.max(b, next));
        return next;
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setStreak(0);
      setHitTrigger((t) => t + 1);
    }

    // ล็อกปุ่มสั้นๆ ระหว่างโชว์ผล กันกดสะบัดซ้อนตอนเป้าหมายยังไม่เปลี่ยน
    setLocked(true);
    advanceTimer.current = setTimeout(() => {
      setTarget((t) => pickNextTarget(t));
      setTracePoints([]);
      setLastResult(null);
      setLocked(false);
    }, 1600);
  };

  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.flex}>
      <SpellEffectOverlay effect={effect} />
      <View style={styles.container}>
        <View style={styles.statsRow}>
          <Stat label="สตรีค" value={streak} />
          <Stat label="สูงสุด" value={best} />
          <Stat label="แม่นยำ" value={`${accuracy}%`} />
        </View>

        <View style={styles.headRow}>
          <WizardAvatar emoji="🧙" color={spellColors[target]} casting={charging} hitTrigger={hitTrigger} size={58} />
          <SpellRune color={spellColors[target]} size={76} spinning={charging} />
        </View>

        <ParchmentPanel contentStyle={{ alignItems: 'center', paddingVertical: 12 }} style={{ borderColor: spellColors[target] }}>
          <Text style={styles.targetLabel}>ลองร่าย</Text>
          <Text style={[styles.targetSpell, { color: spellColors[target] }]}>{spellLabels[target]}</Text>
          <Text style={styles.targetInstruction}>{INSTRUCTIONS[target]}</Text>
        </ParchmentPanel>

        <View style={styles.boardWrap}>
          <WandTraceBoard target={target} width={boardWidth} height={boardHeight} points={tracePoints} active={charging} />
        </View>

        <View style={styles.wandWrap}>
          <Pressable onPressIn={onPressIn} onPressOut={onPressOut} disabled={locked}>
            <Animated.View
              style={[
                styles.wandButton,
                {
                  borderColor: charging ? colors.spellFire : colors.gold,
                  opacity: locked ? 0.5 : 1,
                  transform: [{ scale: chargeAnim }],
                },
              ]}
            >
              <WandIcon size={40} />
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.feedbackWrap}>
          {lastResult ? (
            <>
              <Text style={[styles.feedbackTitle, { color: lastResult.isCorrect ? colors.hpHigh : colors.danger }]}>
                {lastResult.type === 'fizzle'
                  ? '✗ มนตร์เพี้ยน — สะบัดสั้นหรือรูปทรงไม่ชัด'
                  : lastResult.isCorrect
                    ? `✓ ถูกต้อง! (${lastResult.score}%)`
                    : `✗ ได้ ${spellLabels[lastResult.type] ?? lastResult.type} แทน (${lastResult.score}%)`}
              </Text>
              {lastResult.metrics && (
                <Text style={styles.debugText}>
                  ความตรง {Math.round((lastResult.metrics.straightness ?? 0) * 100)}% · หมุน {Math.round(Math.abs(lastResult.metrics.netRotationDeg ?? 0))}° · สะบัด {lastResult.metrics.directionChanges ?? 0} ครั้ง
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.wandHint}>{charging ? 'สะบัดตามเส้นประเลย!' : 'กดค้างแล้วสะบัดโทรศัพท์ตามเส้นประ'}</Text>
          )}
        </View>

        <GlowButton title="กลับหน้าหลัก" outline color={colors.inkMuted} onPress={onExit} />
      </View>
    </LinearGradient>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'space-between' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { color: colors.ink, fontSize: 22, fontFamily: fonts.decorative },
  statLabel: { color: colors.inkMuted, fontSize: 12, fontFamily: fonts.serifItalic },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  targetLabel: { color: colors.inkMuted, fontSize: 13, fontFamily: fonts.serifItalic },
  targetSpell: { fontSize: 22, marginTop: 2, fontFamily: fonts.display },
  targetInstruction: { color: colors.inkMuted, marginTop: 8, textAlign: 'center', fontFamily: fonts.serif, fontSize: 13 },
  boardWrap: { alignItems: 'center' },
  wandWrap: { alignItems: 'center', justifyContent: 'center' },
  wandButton: {
    width: 86,
    height: 86,
    borderRadius: 999,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(166,121,15,0.12)',
  },
  feedbackWrap: { alignItems: 'center', minHeight: 50, justifyContent: 'center' },
  feedbackTitle: { fontFamily: fonts.serifBold, fontSize: 16, textAlign: 'center' },
  debugText: { color: colors.inkMuted, fontSize: 11, marginTop: 4, fontFamily: fonts.serif },
  wandHint: { color: colors.inkMuted, fontSize: 13, fontFamily: fonts.serifItalic },
});
