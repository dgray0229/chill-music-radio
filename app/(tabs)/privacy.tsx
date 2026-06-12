import React from 'react';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';

const COLORS = {
  ink: '#0B1A2E',
  midnight: '#061222',
  slate: '#142D4F',
  electric: '#4DA6FF',
  mist: '#D8E4F8',
};

interface SectionProps {
  title: string;
  children: string;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.subheader}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Privacy Policy</Text>
      <Text style={styles.effective}>Effective Date: June 1, 2026</Text>

      <Section title="1. Introduction">
        Chill Radio ("we," "our," or "us") is committed to protecting your
        privacy. This Privacy Policy explains how we handle information when you
        use the Chill Radio application ("the App").
      </Section>

      <Section title="2. Information We Do Not Collect">
        Chill Radio does not collect, store, or process any personal information.
        We do not require account creation, login credentials, email addresses,
        or any other personally identifiable information to use the App. You can
        enjoy Chill Radio completely anonymously.
      </Section>

      <Section title="3. Analytics Data">
        We may collect anonymous, aggregated analytics data to understand how
        the App is used and to improve the listening experience. This data
        includes general usage patterns such as session duration, station
        popularity, and app performance metrics. This data cannot be used to
        identify individual users.
      </Section>

      <Section title="4. Cookies and Tracking">
        Chill Radio does not use cookies, advertising trackers, or any
        third-party tracking technologies. We do not serve advertisements and
        have no advertising partners.
      </Section>

      <Section title="5. Third-Party Services">
        The App may stream music content through third-party hosting providers.
        These providers do not receive any personal information from Chill Radio
        users. We recommend reviewing the privacy policies of any third-party
        services you interact with independently.
      </Section>

      <Section title="6. Data Security">
        Although we do not collect personal data, we take reasonable measures to
        ensure the security and integrity of our App and its infrastructure.
      </Section>

      <Section title="7. Children's Privacy">
        Chill Radio does not knowingly collect any information from children
        under the age of 13. Since we do not collect personal data from any
        users, the App is safe for listeners of all ages.
      </Section>

      <Section title="8. Changes to This Policy">
        We may update this Privacy Policy from time to time. Any changes will be
        reflected on this page with an updated effective date. We encourage you
        to review this policy periodically.
      </Section>

      <Section title="9. Contact Us">
        If you have any questions or concerns about this Privacy Policy, please
        reach out to us at hello@chillradio.app.
      </Section>

      <Text style={styles.footer}>© 2026 Chill Radio. All rights reserved.</Text>
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
    marginBottom: 4,
    fontFamily: Platform.OS === 'web' ? 'DM Sans' : undefined,
  },
  effective: {
    fontSize: 13,
    color: COLORS.mist,
    opacity: 0.6,
    marginBottom: 24,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
  subheader: {
    fontSize: 17,
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
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORS.mist,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
  footer: {
    fontSize: 12,
    color: COLORS.mist,
    opacity: 0.4,
    textAlign: 'center',
    marginTop: 24,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
});
