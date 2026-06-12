import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { usePostHog } from 'posthog-react-native';

const COLORS = {
  ink: '#0B1A2E',
  midnight: '#061222',
  slate: '#142D4F',
  electric: '#4DA6FF',
  mist: '#D8E4F8',
};

const GUIDELINES = [
  'Tracks must be original compositions that you own full rights to.',
  'Accepted genres: Lo-fi, Ambient, Down-tempo, Chillhop, and Dreamy Beats.',
  'Submissions must be high-quality files (WAV/FLAC preferred, 320kbps MP3 minimum).',
  'Include track title, artist name, social links, BPM, and a short bio.',
  'Instrumental tracks are preferred, but vocals are welcome if they match the vibe.',
  'Curation reviews take approximately 1-2 weeks. We will contact you if selected.',
];

export default function RadioPlayScreen() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('music_submission_viewed');
  }, [posthog]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Submit Your Music</Text>

      <View style={styles.section}>
        <Text style={styles.body}>
          Chill Radio is always looking for fresh sounds to add to our rotation.
          If you're an artist or producer creating music that helps people focus,
          relax, or get creative, we want to hear from you.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>How It Works</Text>
        <Text style={styles.body}>
          Submit your tracks for consideration by our curation team. If your
          music is a great fit for one of our stations, we'll add it to rotation
          and credit you as the artist. All featured artists receive exposure to
          our growing listener community.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Submission Guidelines</Text>
        {GUIDELINES.map((guideline, index) => (
          <View key={index} style={styles.guidelineRow}>
            <Text style={styles.bullet}>{(index + 1).toString().padStart(2, '0')}</Text>
            <Text style={styles.guidelineText}>{guideline}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, styles.submitCard]}>
        <Text style={styles.cardTitle}>Ready to Submit?</Text>
        <Text style={styles.cardBody}>
          Send your tracks and artist info to{' '}
          <Text style={styles.emailText}>submissions@chillradio.app</Text>
          {'\n\n'}
          Please use the subject line: "Track Submission — [Your Artist Name]"
        </Text>
      </View>

      <View style={styles.footnoteSection}>
        <Text style={styles.footnote}>
          By submitting your music, you confirm that you hold all necessary
          rights to the tracks and grant Chill Radio a non-exclusive license to
          stream them on our platform.
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
    marginBottom: 12,
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
  guidelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 4,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.electric,
    width: 28,
    marginTop: 4,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
  guidelineText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.mist,
    flex: 1,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
  submitCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.electric,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'DM Sans' : undefined,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.mist,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
  emailText: {
    color: COLORS.electric,
    fontWeight: '700',
  },
  footnoteSection: {
    paddingHorizontal: 12,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.mist,
    opacity: 0.5,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
});
