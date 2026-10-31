import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlowButton from '../components/GlowButton';
import ParchmentPanel from '../components/ParchmentPanel';
import CastleSilhouette from '../components/CastleSilhouette';
import { playSfx } from '../utils/sound';
import { colors, fonts } from '../theme';

export default function LobbyScreen({ room, roomCode, mySlot, onReady, onLeave, onCountdownDone }) {
  const [count, setCount] = useState(3);
  const me = room.players?.[mySlot];
  const oppSlot = mySlot === 'player1' ? 'player2' : 'player1';
  const opp = room.players?.[oppSlot];
  const countingDown = room.status === 'countdown';

  useEffect(() => {
    if (!countingDown) {
      setCount(3);
      return;
    }
    if (count === 0) {
      onCountdownDone();
      return;
    }
    playSfx('countdown');
    const t = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [countingDown, count]);

  if (countingDown) {
    return (
      <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.center}>
        <Text style={styles.countdown}>{count > 0 ? count : 'ดวล!'}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.flex}>
      <View style={styles.container}>
        <Text style={styles.codeLabel}>รหัสตราผนึก</Text>
        <Text style={styles.code}>{roomCode}</Text>

        <ParchmentPanel style={{ width: '100%' }}>
          <PlayerRow label="คุณ" player={me} highlight />
          <View style={styles.vs}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <PlayerRow label="คู่ปรับ" player={opp} waiting={!opp} />
        </ParchmentPanel>

        {!opp && <Text style={styles.hint}>รอผู้เล่นอีกคนกรอกรหัสห้องเข้ามา…</Text>}

        <View style={{ marginTop: 28, gap: 12, width: '100%' }}>
          <GlowButton
            title={me?.ready ? '✓ พร้อมแล้ว' : 'พร้อมดวล!'}
            color={colors.spellFire}
            disabled={!opp || me?.ready}
            onPress={() => {
              playSfx('tap');
              onReady();
            }}
          />
          <GlowButton title="ออกจากห้อง" outline color={colors.inkMuted} onPress={onLeave} />
        </View>
      </View>
      <CastleSilhouette />
    </LinearGradient>
  );
}

function PlayerRow({ label, player, waiting, highlight }) {
  return (
    <View style={styles.playerRow}>
      <Text style={[styles.playerLabel, highlight && { color: colors.spellFire }]}>{label}</Text>
      <Text style={styles.playerName}>{waiting ? '…' : player?.name}</Text>
      {!waiting && (
        <Text style={[styles.readyTag, player?.ready && styles.readyTagOn]}>
          {player?.ready ? 'พร้อม' : 'รอ'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  countdown: {
    fontSize: 110,
    color: colors.spellFire,
    fontFamily: fonts.decorative,
  },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  codeLabel: { color: colors.inkMuted, fontSize: 14, fontFamily: fonts.serifItalic },
  code: {
    fontSize: 48,
    letterSpacing: 8,
    color: colors.ink,
    marginBottom: 24,
    fontFamily: fonts.decorative,
  },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  playerLabel: { color: colors.inkMuted, width: 90, fontFamily: fonts.serifBold },
  playerName: { color: colors.ink, flex: 1, fontSize: 16, fontFamily: fonts.serif },
  readyTag: {
    color: colors.inkMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    overflow: 'hidden',
    fontFamily: fonts.serifBold,
  },
  readyTagOn: { color: colors.hpHigh, borderColor: colors.hpHigh },
  vs: { alignItems: 'center', paddingVertical: 4 },
  vsText: { color: colors.gold, fontFamily: fonts.decorative, fontSize: 16, letterSpacing: 2 },
  hint: { color: colors.inkMuted, marginTop: 16, fontSize: 12, fontFamily: fonts.serifItalic },
});
