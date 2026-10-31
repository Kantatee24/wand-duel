import { createAudioPlayer } from 'expo-audio';

const sources = {
  fireball: require('../assets/sfx/cast_fireball.wav'),
  lightning: require('../assets/sfx/cast_lightning.wav'),
  shield: require('../assets/sfx/cast_shield.wav'),
  hit: require('../assets/sfx/hit.wav'),
  fizzle: require('../assets/sfx/fizzle.wav'),
  victory: require('../assets/sfx/victory.wav'),
  defeat: require('../assets/sfx/defeat.wav'),
  tap: require('../assets/sfx/ui_tap.wav'),
  countdown: require('../assets/sfx/countdown_beep.wav'),
};

const players = {};

function getPlayer(key) {
  if (!players[key]) {
    players[key] = createAudioPlayer(sources[key]);
  }
  return players[key];
}

// เสียงเป็นของเสริม — ถ้าเล่นไม่ได้ (เช่นโหมดเงียบ/เว็บยังไม่ปลดล็อก autoplay) ไม่ควรทำให้เกมพัง
export async function playSfx(key) {
  try {
    const player = getPlayer(key);
    await player.seekTo(0);
    player.play();
  } catch {
    // ignore
  }
}
