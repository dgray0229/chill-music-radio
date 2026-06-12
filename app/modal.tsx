import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

import { palette } from '@/src/theme/palette';

export default function Modal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(216,228,248,0.5)',
    fontSize: 16,
  },
});
