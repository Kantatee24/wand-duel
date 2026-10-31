import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import HPBar from '../components/HPBar';
import WizardAvatar from '../components/WizardAvatar';
import SpellEffectOverlay from '../components/SpellEffectOverlay';
import DamagePopup from '../components/DamagePopup';
import WandIcon from '../components/WandIcon';
import { useSpellCast } from '../hooks/useSpellCast';
import { castSpell } from '../utils/room';
import { playSfx } from '../utils/sound';
import { colors, fonts, spellColors, spellLabels } from '../theme';

// คูลดาวน์ปรับให้ dps ของแต่ละท่าใกล้เคียงกัน (กันสแปมท่าเดียวแล้วเก่งสุด) แต่สั้นพอให้จังหวะต่อสู้กระชับ
const COOLDOWN_MS = { fireball: 900, lightning: 1500, shield: 1800, fizzle: 600 };

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

  const prevHp = useRef(me?.hp ?? 100);
  const prevOppHp = useRef(opp?.hp ?? 100);
  const prevOppLastSpellAt = useRef(opp?.lastSpellAt ?? 0);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const chargeAnim = useRef(new Animated.Value(1)).current;
  const effectId = useRef(0);

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
    if (Date.now() < cooldownUntil) return;
    Haptics.selectionAsync();
    startCast();
  };

  const onPressOut = () => {
    if (!charging) return;
    const result = endCast();
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

  const onCooldown = cooldownUntil > now;
  const cooldownLeft = Math.max(0, cooldownUntil - now);

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
              <HPBar name={opp?.name ?? '...'} hp={opp?.hp ?? 100} shieldActive={opp?.shieldActive} />
            </View>
          </View>
          {oppToast && <Toast type={oppToast} />}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendText}>🔥 พุ่งไปข้างหน้า = Incendio ⚡ สะบัดซิกแซก = Stupefy 🛡 หมุนวงกลม = Protego</Text>
        </View>

        <View style={styles.wandWrap}>
          <Pressable onPressIn={onPressIn} onPressOut={onPressOut} disabled={onCooldown}>
            <Animated.View
              style={[
                styles.wandButton,
                {
                  borderColor: charging ? colors.spellFire : colors.gold,
                  transform: [{ scale: chargeAnim }],
                  opacity: onCooldown ? 0.5 : 1,
                },
              ]}
            >
              <WandIcon size={58} />
            </Animated.View>
          </Pressable>
          <Text style={styles.wandHint}>
            {onCooldown ? `พักกาย ${(cooldownLeft / 1000).toFixed(1)}s` : charging ? 'สะบัดเลย!' : 'กดค้างแล้วสะบัดโทรศัพท์'}
          </Text>
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
              <HPBar name={me?.name ?? 'คุณ'} hp={me?.hp ?? 100} shieldActive={me?.shieldActive} />
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
        {mine ? 'คุณร่าย ' : ''}
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
    backgroundColor: 'rgba(166,121,15,0.12)',
  },
  wandHint: { color: colors.inkMuted, marginTop: 10, fontSize: 13, fontFamily: fonts.serifItalic },
  toast: {
    alignSelf: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 4,
    backgroundColor: 'rgba(243,230,196,0.9)',
  },
  toastText: { fontFamily: fonts.serifBold },
});
