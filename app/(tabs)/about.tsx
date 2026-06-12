import React from 'react';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';

const COLORS = {
  ink: '#0B1A2E',
  midnight: '#061222',
  slate: '#142D4F',
  electric: '#4DA6FF',
  mist: '#D8E4F8',
};

export default function AboutScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>About Chill Radio</Text>

      <View style={styles.section}>
        <Text style={styles.body}>
          Chill Radio is your 24/7 curated radio experience, designed to help
          you focus, relax, and unlock your creativity. Whether you're working,
          studying, or simply unwinding, we've got the perfect soundtrack for
          every moment.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>What We Play</Text>
        <Text style={styles.body}>
          Our stations feature a carefully curated blend of lofi, easy listening,
          and ambient genres. Every track is hand-selected by our team to ensure
          a seamless, immersive listening experience — no jarring transitions, no
          awkward silences.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>No Interruptions. Ever.</Text>
        <Text style={styles.body}>
          Chill Radio is completely free of commercial interruptions. No ads, no
          sponsors breaking your flow. Just continuous, high-quality music
          streaming around the clock.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Our Mission</Text>
        <Text style={styles.body}>
          We believe that the right music can transform your day. Our mission is
          to provide an effortless, always-on radio experience that enhances
          focus, promotes relaxation, and inspires creativity — all without
          distractions.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Built for You</Text>
        <Text style={styles.body}>
          Chill Radio is crafted with care for listeners who appreciate
          thoughtful music curation. We're constantly evolving our stations and
          adding new genres to keep your experience fresh and inspiring.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ink,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    fontFamily: Platform.OS === 'web' ? 'DM Sans' : undefined,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.electric,
    marginBottom: 10,
    fontFamily: Platform.OS === 'web' ? 'DM Sans' : undefined,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: 'rgba(20, 45, 79, 0.35)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.08)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      },
      default: {},
    }),
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.mist,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
});
