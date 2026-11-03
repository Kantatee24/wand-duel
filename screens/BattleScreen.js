import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import HPBar from '../components/HPBar';
import WizardAvatar from '../components/WizardAvatar';
import SpellEffectOverlay from '../components/SpellEffectOverlay';
import DamagePopup from '../components/DamagePopup';
import WandIcon from '../components/WandIcon';
import { HouseTag } from '../components/HouseBadge';
import { useSpellCast } from '../hooks/useSpellCast';
import { castSpell, markAvadaUsed } from '../utils/room';
import { playSfx } from '../utils/sound';
import { colors, fonts, spellColors, spellLabels } from '../theme';

// คูลดาวน์ปรับให้ dps ของแต่ละท่าใกล้เคียงกัน (กันสแปมท่าเดียวแล้วเก่งสุด) แต่สั้นพอให้จังหวะต่อสู้กระชับ
const COOLDOWN_MS = { fireball: 900, lightning: 1500, shield: 8000, fizzle: 600 };
const AVADA_COMBO_WINDOW_MS = 3000; // เวลาสูงสุดระหว่างแต่ละท่าในคอมโบ 3 ท่าติด ช้ากว่านี้ถือว่าพลาด

export default function BattleScreen({ room, roomCode, mySlot }) {
  const oppSlot = mySlot === 'player1' ? 'player2' : 'player1';
  const me = room.players?.[mySlot];
  const opp = room.players?.[oppSlot];

  const { charging, startCast, endCast } = useSpellCast();
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [myToast, setMyToast] = useState(null);
  const [oppToast, setOppToast] = useState(null);
  const [effect, setEffect] = useState(null);
  const [myHitTrigger, setMyHitTrigger] = useState(0);
  const [oppHitTrigger, setOppHitTrigger] = useState(0);
  const [myDamage, setMyDamage] = useState(0);
  const [oppDamage, setOppDamage] = useState(0);
  const [avadaArmed, setAvadaArmed] = useState(false);
  const [avadaStep, setAvadaStep] = useState(0);
  const [avadaMessage, setAvadaMessage] = useState(null);

  const prevHp = useRef(me?.hp ?? 100);
  const prevOppHp = useRef(opp?.hp ?? 100);
  const prevOppLastSpellAt = useRef(opp?.lastSpellAt ?? 0);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const chargeAnim = useRef(new Animated.Value(1)).current;
  const effectId = useRef(0);
  const avadaComboTimer = useRef(null);
  const avadaUsed = !!me?.avadaUsed;

  useEffect(() => () => clearTimeout(avadaComboTimer.current), []);

  const armAvada = () => {
    if (avadaUsed || avadaArmed) return;
    playSfx('tap');
    Haptics.selectionAsync();
    setAvadaArmed(true);
    setAvadaStep(0);
  };

  // คอมโบพลาด (ร่ายเพี้ยน, ยกเลิกเอง, หรือช้าเกินไประหว่างท่า) — เสียโอกาสครั้งเดียวต่อเกมไปเลย
  const failAvada = (message = 'The Killing Curse collapsed! You lose this chance in the duel') => {
    clearTimeout(avadaComboTimer.current);
    setAvadaArmed(false);
    setAvadaStep(0);
    setAvadaMessage(message);
    setTimeout(() => setAvadaMessage(null), 1600);
    markAvadaUsed(roomCode, mySlot).catch(() => {});
  };

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [cooldownUntil]);

  useEffect(() => {
    if (charging) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(chargeAnim, { toValue: 1.15, duration: 350, useNativeDriver: true }),
          Animated.timing(chargeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        ])
      ).start();
    } else {
      chargeAnim.stopAnimation();
      chargeAnim.setValue(1);
    }
  }, [charging]);

  // โดนโจมตี: สั่น + แฟลชแดง + เสียง + อวตารสะเทือน + เลขดาเมจลอย
  useEffect(() => {
    const hp = me?.hp ?? 100;
    if (hp < prevHp.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playSfx('hit');
      setMyHitTrigger((t) => t + 1);
      setMyDamage(Math.round(prevHp.current - hp));
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
    prevHp.current = hp;
  }, [me?.hp]);

  // คู่ปรับโดนตีสำเร็จ (ฝั่งเราโจมตีโดน) — ให้อวตารคู่ปรับสะเทือนด้วย + เลขดาเมจลอย
  useEffect(() => {
    const hp = opp?.hp ?? 100;
    if (hp < prevOppHp.current) {
      setOppHitTrigger((t) => t + 1);
      setOppDamage(Math.round(prevOppHp.current - hp));
    }
    prevOppHp.current = hp;
  }, [opp?.hp]);

  // แสดงเอฟเฟกต์เต็มจอ + toast เมื่อคู่ต่อสู้ร่ายคาถาสำเร็จ
  useEffect(() => {
    const ts = opp?.lastSpellAt ?? 0;
    if (ts && ts !== prevOppLastSpellAt.current) {
      prevOppLastSpellAt.current = ts;
      if (opp?.lastSpell) {
        setOppToast(opp.lastSpell);
        setTimeout(() => setOppToast(null), 1100);
        effectId.current += 1;
        setEffect({ type: opp.lastSpell, id: effectId.current });
        playSfx(opp.lastSpell);
      }
    }
  }, [opp?.lastSpellAt]);

  const onPressIn = () => {
    if (!avadaArmed && Date.now() < cooldownUntil) return;
    Haptics.selectionAsync();
    clearTimeout(avadaComboTimer.current);
    startCast();
  };

  const onPressOut = () => {
    if (!charging) return;
    const result = endCast();

    if (avadaArmed) {
      if (result.type === 'fizzle') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        playSfx('fizzle');
        failAvada('Spell fizzled! The Killing Curse collapsed — you lose this chance in the duel');
        return;
      }

      const next = avadaStep + 1;
      if (next >= 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playSfx('lightning');
        setTimeout(() => playSfx('hit'), 260);
        castSpell(roomCode, mySlot, 'avada').catch(() => {});
        effectId.current += 1;
        setEffect({ type: 'avada', id: effectId.current });
        setAvadaArmed(false);
        setAvadaStep(0);
        setAvadaMessage('Avada Kedavra! The Killing Curse succeeded');
        setTimeout(() => setAvadaMessage(null), 1600);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playSfx(result.type);
        setAvadaStep(next);
        clearTimeout(avadaComboTimer.current);
        avadaComboTimer.current = setTimeout(() => failAvada('Too slow! The Killing Curse collapsed'), AVADA_COMBO_WINDOW_MS);
      }
      return;
    }

    const cd = COOLDOWN_MS[result.type] ?? 600;
    setCooldownUntil(Date.now() + cd);

    if (result.type === 'fizzle') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      playSfx('fizzle');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      playSfx(result.type);
      castSpell(roomCode, mySlot, result.type).catch(() => {});
      effectId.current += 1;
      setEffect({ type: result.type, id: effectId.current });
    }
    setMyToast(result.type);
    setTimeout(() => setMyToast(null), 1100);
  };

  const onCooldown = !avadaArmed && cooldownUntil > now;
  const cooldownLeft = Math.max(0, cooldownUntil - now);

  const wandHintText = avadaArmed
    ? charging
      ? 'Flick now!'
      : `Casting step ${avadaStep + 1}/3 of the Killing Curse`
    : onCooldown
      ? `Cooldown ${(cooldownLeft / 1000).toFixed(1)}s`
      : charging
        ? 'Flick now!'
        : 'Press and hold, then flick your phone';

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.flex}>
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flashAnim }]} />
      <SpellEffectOverlay effect={effect} />

      <View style={styles.container}>
        <View style={styles.hpWrap}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarAnchor}>
              <WizardAvatar
                emoji="🧙‍♂️"
                color={colors.spellStorm}
                casting={false}
                hitTrigger={oppHitTrigger}
                defeated={(opp?.hp ?? 100) <= 0}
                size={64}
              />
              <DamagePopup triggerId={oppHitTrigger} amount={oppDamage} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              {!!opp?.house && <HouseTag houseKey={opp.house} />}
              <HPBar name={opp?.name ?? '...'} hp={opp?.hp ?? 100} shieldActive={opp?.shieldActive} />
            </View>
          </View>
          {oppToast && <Toast type={oppToast} />}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendText}>🔥 Quick flick up = Incendio ⚡ Zigzag flick = Stupefy 🛡 Circle swing = Protego · ☠️ Cast 3 in a row to unleash Avada Kedavra</Text>
        </View>

        {!!avadaMessage && (
          <View style={styles.avadaMessageWrap}>
            <Text style={styles.avadaMessageText}>{avadaMessage}</Text>
          </View>
        )}

        <View style={styles.wandWrap}>
          <Pressable onPressIn={onPressIn} onPressOut={onPressOut} disabled={onCooldown}>
            <Animated.View
              style={[
                styles.wandButton,
                {
                  borderColor: avadaArmed ? colors.avada : charging ? colors.spellFire : colors.gold,
                  transform: [{ scale: chargeAnim }],
                  opacity: onCooldown ? 0.5 : 1,
                },
              ]}
            >
              <WandIcon size={58} />
            </Animated.View>
          </Pressable>
          <Text style={[styles.wandHint, avadaArmed && { color: colors.avada }]}>{wandHintText}</Text>

          {avadaArmed ? (
            <View style={styles.avadaRow}>
              <View style={styles.avadaDots}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.avadaDot, { borderColor: colors.avada, backgroundColor: i < avadaStep ? colors.avada : 'transparent' }]} />
                ))}
              </View>
              <Pressable onPress={() => failAvada('Cancelled the Killing Curse — you lose this chance in the duel')}>
                <Text style={styles.avadaCancel}>Cancel ✕</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={armAvada} disabled={avadaUsed} style={[styles.avadaArmBtn, avadaUsed && { borderColor: colors.inkFaint, opacity: 0.6 }]}>
              <Text style={[styles.avadaArmText, avadaUsed && styles.avadaArmTextUsed]}>
                {avadaUsed ? '☠ Avada Kedavra already used' : '☠ Cast Avada Kedavra'}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.hpWrap}>
          {myToast && <Toast type={myToast} mine />}
          <View style={styles.avatarRow}>
            <View style={styles.avatarAnchor}>
              <WizardAvatar
                emoji="🧙"
                color={colors.spellFire}
                casting={charging}
                hitTrigger={myHitTrigger}
                defeated={(me?.hp ?? 100) <= 0}
                size={64}
              />
              <DamagePopup triggerId={myHitTrigger} amount={myDamage} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              {!!me?.house && <HouseTag houseKey={me.house} />}
              <HPBar name={me?.name ?? 'You'} hp={me?.hp ?? 100} shieldActive={me?.shieldActive} />
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

function Toast({ type, mine }) {
  return (
    <View style={[styles.toast, { borderColor: spellColors[type] }]}>
      <Text style={[styles.toastText, { color: spellColors[type] }]}>
        {mine ? 'You cast ' : ''}
        {spellLabels[type] ?? type}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.danger },
  container: { flex: 1, padding: 20, justifyContent: 'space-between' },
  hpWrap: { gap: 6 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarAnchor: { position: 'relative' },
  legend: { alignItems: 'center' },
  legendText: { color: colors.inkMuted, fontSize: 11, textAlign: 'center', fontFamily: fonts.serifItalic },
  wandWrap: { alignItems: 'center', justifyContent: 'center' },
  wandButton: {
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(57,255,110,0.1)',
  },
  wandHint: { color: colors.inkMuted, marginTop: 10, fontSize: 13, fontFamily: fonts.serifItalic },
  toast: {
    alignSelf: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 4,
    backgroundColor: 'rgba(10,22,15,0.92)',
  },
  toastText: { fontFamily: fonts.serifBold },
  avadaMessageWrap: { alignItems: 'center', marginTop: 4 },
  avadaMessageText: {
    color: colors.avada,
    fontFamily: fonts.serifBold,
    fontSize: 13,
    textAlign: 'center',
    textShadowColor: colors.avada,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  avadaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  avadaDots: { flexDirection: 'row', gap: 6 },
  avadaDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
  avadaCancel: { color: colors.danger, fontSize: 12, fontFamily: fonts.serifBold },
  avadaArmBtn: { marginTop: 10, borderWidth: 1.5, borderColor: colors.avada, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  avadaArmText: { color: colors.avada, fontFamily: fonts.serifBold, fontSize: 13 },
  avadaArmTextUsed: { color: colors.inkFaint },
});
