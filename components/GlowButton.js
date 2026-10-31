import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

export default function GlowButton({ title, onPress, color = colors.border, outline, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          borderColor: color,
          backgroundColor: outline ? 'transparent' : color + '1a',
          opacity: disabled ? 0.4 : pressed ? 0.65 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: fonts.serifBold, fontSize: 17, letterSpacing: 0.4 },
});
