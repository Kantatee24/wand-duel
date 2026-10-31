import { StyleSheet, View } from 'react-native';
import { spellColors } from '../theme';
import FireBurst from './effects/FireBurst';
import LightningBolt from './effects/LightningBolt';
import ShieldBarrier from './effects/ShieldBarrier';

// เอฟเฟกต์เต็มจอตอนร่ายคาถาติด — effect: { type: 'fireball'|'lightning'|'shield', id: number }
export default function SpellEffectOverlay({ effect }) {
  if (!effect?.type) return null;
  const color = spellColors[effect.type];

  if (effect.type === 'fireball') {
    return <FireBurst triggerId={effect.id} />;
  }

  if (effect.type === 'lightning') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LightningBolt seed={effect.id} delay={0} style={{ left: '18%' }} />
        <LightningBolt seed={effect.id + 0.37} delay={30} style={{ left: '48%' }} />
        <LightningBolt seed={effect.id + 0.71} delay={60} style={{ left: '75%' }} />
      </View>
    );
  }

  if (effect.type === 'shield') {
    return <ShieldBarrier color={color} triggerId={effect.id} />;
  }

  return null;
}
