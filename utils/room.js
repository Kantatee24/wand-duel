import { ref, get, update, onValue, runTransaction, onDisconnect } from 'firebase/database';
import { db } from '../firebase';

const ROOT = 'wandDuelRooms';

// ดาเมจคู่กับคูลดาวน์ใน BattleScreen.js ให้ dps ของ fireball/lightning ใกล้เคียงกัน
// (fireball ~13/0.9s ≈14.4 dps, lightning ~20/1.5s ≈13.3 dps) ไม่มีท่าไหนเด่นจนสแปมแล้วชนะทันที
const SPELL_DAMAGE = { fireball: 13, lightning: 20 };
const SHIELD_DAMAGE_KEPT = 0.5; // shield blocks 50% of incoming damage
const SHIELD_DURATION_MS = 3500;
const SHIELD_HEAL = 5;

function initialPlayer(name) {
  return {
    name,
    ready: false,
    connected: true,
    hp: 100,
    shieldActive: false,
    shieldExpiresAt: 0,
    lastSpell: null,
    lastSpellAt: 0,
  };
}

export function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function createRoom(name) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateRoomCode();
    const roomRef = ref(db, `${ROOT}/${code}`);
    const result = await runTransaction(roomRef, (room) => {
      if (room) return undefined; // code taken, retry with a new one
      return {
        createdAt: Date.now(),
        status: 'waiting',
        winner: null,
        round: 1,
        players: { player1: initialPlayer(name) },
      };
    });
    if (result.committed) {
      onDisconnect(ref(db, `${ROOT}/${code}/players/player1/connected`)).set(false);
      return { code, slot: 'player1' };
    }
  }
  throw new Error('สร้างห้องไม่สำเร็จ ลองใหม่อีกครั้ง');
}

export async function joinRoom(code, name) {
  const roomRef = ref(db, `${ROOT}/${code}`);

  // เช็คว่าห้องมีจริงด้วย get() ตรงๆ ก่อน (ให้ error "ไม่พบห้องนี้" ที่แม่นยำ)
  const existingSnap = await get(roomRef);
  if (!existingSnap.exists()) {
    throw new Error('ไม่พบห้องนี้');
  }

  let failReason = null;
  const result = await runTransaction(roomRef, (room) => {
    // Firebase อาจเรียก callback นี้ครั้งแรกด้วย null แม้ get() ข้างบนเพิ่งยืนยันว่าห้องมีจริง
    // (เครื่องนี้ยังไม่เคย sync path นี้แบบ realtime มาก่อน) ห้าม return undefined (abort) ทันที
    // ตรงนี้เด็ดขาด เพราะ transaction ของ Firebase จะยกเลิกถาวรไม่ retry ต่อ — ให้ใช้ค่าจาก
    // get() เป็นฐานแทน แล้วปล่อยให้กลไก retry (เทียบ hash กับเซิร์ฟเวอร์) ของตัว SDK เองจัดการ
    // ถ้าค่าจริงไม่ตรงมันจะเรียกฟังก์ชันนี้ซ้ำพร้อมค่าจริงให้อัตโนมัติ
    const current = room ?? existingSnap.val();
    if (!current) return undefined; // เคสขอบจริงๆ: ห้องถูกลบไปแล้วระหว่างนี้
    if (current.players?.player2?.connected) {
      failReason = 'FULL';
      return undefined;
    }
    return {
      ...current,
      players: { ...current.players, player2: initialPlayer(name) },
    };
  });
  if (!result.committed) {
    if (failReason === 'FULL') throw new Error('ห้องนี้เต็มแล้ว');
    throw new Error('เข้าห้องไม่สำเร็จ ลองใหม่อีกครั้ง');
  }
  onDisconnect(ref(db, `${ROOT}/${code}/players/player2/connected`)).set(false);
  return 'player2';
}

export function listenRoom(code, cb) {
  const roomRef = ref(db, `${ROOT}/${code}`);
  return onValue(roomRef, (snap) => cb(snap.val()));
}

export async function setReady(code, slot) {
  await update(ref(db, `${ROOT}/${code}/players/${slot}`), { ready: true });
  await runTransaction(ref(db, `${ROOT}/${code}`), (room) => {
    if (!room) return undefined;
    if (room.status === 'waiting' && room.players?.player1?.ready && room.players?.player2?.ready) {
      room.status = 'countdown';
    }
    return room;
  });
}

export async function beginBattle(code) {
  await runTransaction(ref(db, `${ROOT}/${code}`), (room) => {
    if (!room) return undefined;
    if (room.status === 'countdown') room.status = 'battle';
    return room;
  });
}

export async function castSpell(code, casterSlot, spellType) {
  const targetSlot = casterSlot === 'player1' ? 'player2' : 'player1';
  await runTransaction(ref(db, `${ROOT}/${code}`), (room) => {
    if (!room || room.status !== 'battle') return undefined;
    const caster = room.players?.[casterSlot];
    const target = room.players?.[targetSlot];
    if (!caster || !target) return undefined;

    const now = Date.now();
    caster.lastSpell = spellType;
    caster.lastSpellAt = now;

    if (spellType === 'shield') {
      caster.shieldActive = true;
      caster.shieldExpiresAt = now + SHIELD_DURATION_MS;
      caster.hp = Math.min(100, caster.hp + SHIELD_HEAL);
    } else {
      let damage = SPELL_DAMAGE[spellType] ?? 0;
      if (target.shieldActive && target.shieldExpiresAt > now) {
        damage = Math.round(damage * SHIELD_DAMAGE_KEPT);
        target.shieldActive = false;
        target.shieldExpiresAt = 0;
      }
      target.hp = Math.max(0, target.hp - damage);
      if (target.hp <= 0) {
        room.status = 'finished';
        room.winner = casterSlot;
      }
    }
    return room;
  });
}

export async function rematch(code) {
  await runTransaction(ref(db, `${ROOT}/${code}`), (room) => {
    if (!room) return undefined;
    room.status = 'waiting';
    room.winner = null;
    room.round = (room.round || 1) + 1;
    for (const slot of ['player1', 'player2']) {
      if (room.players?.[slot]) {
        room.players[slot].hp = 100;
        room.players[slot].ready = false;
        room.players[slot].shieldActive = false;
        room.players[slot].shieldExpiresAt = 0;
        room.players[slot].lastSpell = null;
        room.players[slot].lastSpellAt = 0;
      }
    }
    return room;
  });
}

export async function leaveRoom(code, slot) {
  try {
    await update(ref(db, `${ROOT}/${code}/players/${slot}`), { connected: false });
  } catch {
    // room may already be gone, nothing to do
  }
}
