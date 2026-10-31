import { Image } from 'react-native';

// รูปไม้กายสิทธิ์จริงแทนอิโมจิ 🪄 — ใช้แทนปุ่มร่ายคาถาทั้งใน Battle และ Practice
export default function WandIcon({ size = 56, style }) {
  return (
    <Image
      source={require('../assets/images/wand.png')}
      style={[{ width: size, height: size * 1.35, resizeMode: 'contain', transform: [{ rotate: '-12deg' }] }, style]}
    />
  );
}
