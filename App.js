import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, PirataOne_400Regular } from '@expo-google-fonts/pirata-one';
import { CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative';
import {
  EBGaramond_400Regular,
  EBGaramond_700Bold,
  EBGaramond_500Medium_Italic,
} from '@expo-google-fonts/eb-garamond';

import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import BattleScreen from './screens/BattleScreen';
import GameOverScreen from './screens/GameOverScreen';
import PracticeScreen from './screens/PracticeScreen';
import { createRoom, joinRoom, leaveRoom, listenRoom, setReady, beginBattle, rematch } from './utils/room';
import { colors } from './theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    PirataOne_400Regular,
    CinzelDecorative_700Bold,
    EBGaramond_400Regular,
    EBGaramond_700Bold,
    EBGaramond_500Medium_Italic,
  });

  const [roomCode, setRoomCode] = useState(null);
  const [mySlot, setMySlot] = useState(null);
  const [room, setRoom] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [practiceMode, setPracticeMode] = useState(false);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      return;
    }
    const unsub = listenRoom(roomCode, setRoom);
    return unsub;
  }, [roomCode]);

  const resetToHome = () => {
    setRoomCode(null);
    setMySlot(null);
    setRoom(null);
    setError('');
  };

  const handleCreate = async (name) => {
    setBusy(true);
    setError('');
    try {
      const { code, slot } = await createRoom(name);
      setRoomCode(code);
      setMySlot(slot);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (name, code) => {
    setBusy(true);
    setError('');
    try {
      const slot = await joinRoom(code, name);
      setRoomCode(code);
      setMySlot(slot);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (roomCode && mySlot) await leaveRoom(roomCode, mySlot);
    resetToHome();
  };

  if (!fontsLoaded) {
    return (
      <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.loading}>
        <ActivityIndicator color={colors.gold} size="large" />
        <StatusBar style="dark" />
      </LinearGradient>
    );
  }

  if (practiceMode) {
    return (
      <>
        <PracticeScreen onExit={() => setPracticeMode(false)} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (!roomCode) {
    return (
      <>
        <HomeScreen
          onCreate={handleCreate}
          onJoin={handleJoin}
          onPractice={() => setPracticeMode(true)}
          busy={busy}
          error={error}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  if (!room) {
    return (
      <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.loading}>
        <ActivityIndicator color={colors.gold} size="large" />
        <StatusBar style="dark" />
      </LinearGradient>
    );
  }

  let screen;
  if (room.status === 'battle') {
    screen = <BattleScreen room={room} roomCode={roomCode} mySlot={mySlot} />;
  } else if (room.status === 'finished') {
    screen = (
      <GameOverScreen
        room={room}
        mySlot={mySlot}
        onRematch={() => rematch(roomCode)}
        onExit={handleLeave}
      />
    );
  } else {
    // 'waiting' | 'countdown'
    screen = (
      <LobbyScreen
        room={room}
        roomCode={roomCode}
        mySlot={mySlot}
        onReady={() => setReady(roomCode, mySlot)}
        onLeave={handleLeave}
        onCountdownDone={() => beginBattle(roomCode)}
      />
    );
  }

  return (
    <>
      {screen}
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
