import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';
import { colors, fonts, houses } from '../theme';
import { playSfx } from '../utils/sound';

const ORDER = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];

// หน้าแรกสุดก่อนเข้าเกม — เลือกบ้านประจำตัว 1 ใน 4 หลังของฮอกวอตส์
// (โลโก้จริงยังไม่มี ใส่ house.logo = require(...) ใน theme.js ทีหลังได้เลย ไม่ต้องแก้ไฟล์นี้)
export default function HouseSelectScreen({ onSelect }) {
  return (
    <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Choose Your House</Text>
        <Text style={styles.subtitle}>Your house stays with you for the whole duel</Text>

        <View style={styles.grid}>
          {ORDER.map((key) => (
            <HouseCard key={key} house={houses[key]} onPress={() => {
              Haptics.selectionAsync();
              playSfx('tap');
              onSelect(key);
            }} />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function HouseCard({ house, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: house.primary,
          backgroundColor: house.primary + '1f',
          shadowColor: house.primary,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <View style={[styles.crest, { borderColor: house.secondary, backgroundColor: house.primary + '33' }]}>
        {house.logo ? (
          <Image source={house.logo} style={styles.crestImg} resizeMode="contain" />
        ) : (
          <Text style={styles.crestSymbol}>{house.symbol}</Text>
        )}
      </View>
      <Text style={[styles.houseName, { color: house.secondary }]}>{house.name}</Text>
      <Text style={styles.houseTagline}>{house.tagline}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 36,
    color: colors.ink,
    textAlign: 'center',
    fontFamily: fonts.display,
    textShadowColor: colors.gold,
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: { color: colors.inkMuted, textAlign: 'center', marginTop: 8, marginBottom: 28, fontFamily: fonts.serifItalic },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, width: '100%' },
  card: {
    width: '45%',
    minWidth: 140,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
  },
  crest: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  crestImg: { width: 48, height: 48 },
  crestSymbol: { fontSize: 34 },
  houseName: { fontFamily: fonts.decorative, fontSize: 17, textAlign: 'center' },
  houseTagline: { color: colors.inkMuted, fontSize: 11, marginTop: 4, textAlign: 'center', fontFamily: fonts.serifItalic },
});
