// ธีม "ลอร์ดเวทมนตร์มืด" — ความมืดดุจราตรี, สายฟ้า/แสงสีเขียวมรกตของอวาดาเคดาฟรา, กรอบเรืองแสง
// (สี/เลย์เอาต์ออกแบบเอง — ชื่อคาถา Incendio/Stupefy/Protego/Avada Kedavra อ้างอิงจาก Harry Potter
// ใช้เฉพาะงานส่งอาจารย์รายวิชาเดียว ไม่เผยแพร่สาธารณะ/App Store)
export const colors = {
  bgTop: '#102417',
  bgMid: '#07140d',
  bgBottom: '#000000',
  vignette: '#000000',

  parchment: 'rgba(12,26,18,0.92)',
  parchmentDark: 'rgba(5,12,8,0.94)',

  ink: '#e8ffe9',
  inkMuted: '#7fbd92',
  inkFaint: '#466b52',

  border: '#1f8a4c',
  borderLight: '#39ff6e',
  gold: '#39ff6e',
  goldLight: '#9dffc2',

  card: 'rgba(10,22,15,0.92)',
  cardBorder: '#1f8a4c',

  textPrimary: '#e8ffe9',
  textMuted: '#7fbd92',

  spellFire: '#ff6a3d', // Incendio — ไฟส้มแดงลุกโชน
  spellStorm: '#38bdf8', // Stupefy — สายฟ้าสีฟ้าเย็น
  spellWard: '#2dd4a7', // Protego — โล่มรกต
  avada: '#39ff6e', // Avada Kedavra — สายฟ้า/แสงสีเขียวมรณะของลอร์ดเวทมนตร์มืด
  avadaGlow: '#baffd8',

  hpHigh: '#39ff6e',
  hpMid: '#facc15',
  hpLow: '#ff3b3b',

  danger: '#ff3b3b',
  success: '#39ff6e',
};

export const fonts = {
  display: 'PirataOne_400Regular', // หัวข้อแบบโกธิค/คัดลายมือโบราณ
  decorative: 'CinzelDecorative_700Bold', // ตัวเลข/ป้ายสำคัญ
  serif: 'EBGaramond_400Regular', // ตัวอ่านทั่วไป
  serifBold: 'EBGaramond_700Bold',
  serifItalic: 'EBGaramond_500Medium_Italic',
};

export const spellColors = {
  fireball: colors.spellFire,
  lightning: colors.spellStorm,
  shield: colors.spellWard,
  avada: colors.avada,
  fizzle: colors.inkFaint,
};

export const spellLabels = {
  fireball: 'Incendio 🔥',
  lightning: 'Stupefy ⚡',
  shield: 'Protego 🛡️',
  avada: 'Avada Kedavra ☠️',
  fizzle: 'Fizzle 💨',
};

export function hpColor(hp) {
  if (hp > 55) return colors.hpHigh;
  if (hp > 25) return colors.hpMid;
  return colors.hpLow;
}

// บ้านทั้ง 4 แห่งฮอกวอตส์ — เลือกก่อนเข้าเกม (logo: ใส่ require('../assets/images/house-xxx.png')
// ทีหลังได้เลย ถ้าไม่มีภาพจะโชว์ตราสัญลักษณ์อิโมจิ + สีประจำบ้านแทน)
export const houses = {
  gryffindor: {
    key: 'gryffindor',
    name: 'Gryffindor',
    tagline: 'Brave and unyielding',
    symbol: '🦁',
    primary: '#ae0001',
    secondary: '#eeba30',
    logo: null,
  },
  slytherin: {
    key: 'slytherin',
    name: 'Slytherin',
    tagline: 'Ambitious and cunning',
    symbol: '🐍',
    primary: '#2a623d',
    secondary: '#aaaaaa',
    logo: null,
  },
  ravenclaw: {
    key: 'ravenclaw',
    name: 'Ravenclaw',
    tagline: 'Wise and witty',
    symbol: '🦅',
    primary: '#222f5b',
    secondary: '#946b2d',
    logo: null,
  },
  hufflepuff: {
    key: 'hufflepuff',
    name: 'Hufflepuff',
    tagline: 'Just and loyal',
    symbol: '🦡',
    primary: '#ecb939',
    secondary: '#372e29',
    logo: null,
  },
};
