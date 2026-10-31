// ธีม "สถาบันเวทมนตร์โบราณ" — กระดาษ parchment เก่า, หมึกน้ำตาล, กรอบทองเดินเส้น
// (สี/เลย์เอาต์ออกแบบเอง — ชื่อคาถา Incendio/Stupefy/Protego อ้างอิงจาก Harry Potter
// ใช้เฉพาะงานส่งอาจารย์รายวิชาเดียว ไม่เผยแพร่สาธารณะ/App Store)
export const colors = {
  bgTop: '#ead9b0',
  bgMid: '#dcc48c',
  bgBottom: '#b99a68',
  vignette: '#6b4a2a',

  parchment: '#f3e6c4',
  parchmentDark: '#e4d2a3',

  ink: '#3b2a1a',
  inkMuted: '#6b5338',
  inkFaint: '#8a7256',

  border: '#6b4423',
  borderLight: '#9c7039',
  gold: '#a6790f',
  goldLight: '#cf9f3f',

  card: 'rgba(243,230,196,0.92)',
  cardBorder: '#6b4423',

  textPrimary: '#3b2a1a',
  textMuted: '#6b5338',

  spellFire: '#8a2d20', // Incendio — แดงอิฐ/ทอง
  spellStorm: '#1f4e6b', // Stupefy — น้ำเงินเข้ม/บรอนซ์
  spellWard: '#2f5a3d', // Protego — เขียวเข้ม/เงิน

  hpHigh: '#3d7a4f',
  hpMid: '#a6790f',
  hpLow: '#8a2d20',

  danger: '#8a2d20',
  success: '#3d7a4f',
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
  fizzle: colors.inkFaint,
};

export const spellLabels = {
  fireball: 'Incendio 🔥',
  lightning: 'Stupefy ⚡',
  shield: 'Protego 🛡️',
  fizzle: 'มนตร์เพี้ยน 💨',
};

export function hpColor(hp) {
  if (hp > 55) return colors.hpHigh;
  if (hp > 25) return colors.hpMid;
  return colors.hpLow;
}
