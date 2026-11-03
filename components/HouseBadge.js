import { Image, StyleSheet, Text, View } from 'react-native';
import { fonts, houses } from '../theme';

// ป้ายบ้านเล็กๆ ติดชื่อผู้เล่นใน Lobby/Battle — โชว์โลโก้บ้านถ้ามีไฟล์ภาพ ไม่งั้นใช้ตราอิโมจิ+สีประจำบ้านแทน
export default function HouseBadge({ houseKey, size = 20 }) {
  const house = houses[houseKey];
  if (!house) return null;

  return (
    <View style={[styles.badge, { borderColor: house.primary, backgroundColor: house.primary + '2a', width: size + 8, height: size + 8 }]}>
      {house.logo ? (
        <Image source={house.logo} style={{ width: size, height: size, resizeMode: 'contain' }} />
      ) : (
        <Text style={{ fontSize: size * 0.7 }}>{house.symbol}</Text>
      )}
    </View>
  );
}

export function HouseTag({ houseKey }) {
  const house = houses[houseKey];
  if (!house) return null;
  return (
    <View style={[styles.tag, { borderColor: house.primary, backgroundColor: house.primary + '22' }]}>
      <Text style={{ fontSize: 12 }}>{house.symbol}</Text>
      <Text style={[styles.tagText, { color: house.secondary, fontFamily: fonts.serifBold }]}>{house.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  tagText: { fontSize: 11 },
});
