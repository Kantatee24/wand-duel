import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlowButton from './GlowButton';
import { colors, fonts } from '../theme';

// กันแอปล่มทั้งตัวถ้ามีหน้าจอไหน render พังกลางทาง (เช่น sensor/3D ของเครื่องรุ่นแปลกๆ)
// แสดงหน้าจอกู้คืนแทนจอขาว/แอปปิดตัวเอง
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Wand Duel crashed:', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.flex}>
          <View style={styles.container}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>{String(this.state.error?.message ?? this.state.error)}</Text>
            <GlowButton title="Try Again" color={colors.gold} onPress={this.reset} />
          </View>
        </LinearGradient>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 24, color: colors.ink, fontFamily: fonts.display, textAlign: 'center' },
  message: { color: colors.inkMuted, fontFamily: fonts.serif, textAlign: 'center', marginBottom: 8 },
});
