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

export default function TermsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Terms of Service</Text>
      <Text style={styles.effective}>Effective Date: June 1, 2026</Text>

      <Section title="1. Acceptance of Terms">
        By accessing or using the Chill Radio application ("the App"), you agree
        to be bound by these Terms of Service. If you do not agree to these
        terms, please do not use the App.
      </Section>

      <Section title="2. Description of Service">
        Chill Radio provides a free, ad-free internet radio streaming service
        featuring curated music across lofi, ambient, easy listening, and
        related genres. The service is provided "as is" and may be modified,
        suspended, or discontinued at any time without prior notice.
      </Section>

      <Section title="3. User Conduct">
        You agree not to misuse the App or its services. This includes, but is
        not limited to: attempting to reverse-engineer the App, redistributing
        streamed content, using automated tools to access the service, or
        interfering with the App's infrastructure.
      </Section>

      <Section title="4. Intellectual Property">
        All content streamed through Chill Radio, including but not limited to
        music, artwork, logos, and branding, is the property of Chill Radio or
        its licensors. You may not reproduce, distribute, or create derivative
        works from any content without express written permission.
      </Section>

      <Section title="5. Disclaimer of Warranties">
        Chill Radio is provided on an "as is" and "as available" basis. We make
        no warranties, express or implied, regarding the reliability,
        availability, or fitness for a particular purpose of the service.
      </Section>

      <Section title="6. Limitation of Liability">
        To the fullest extent permitted by law, Chill Radio and its operators
        shall not be liable for any indirect, incidental, special, or
        consequential damages arising from your use of or inability to use the
        App.
      </Section>

      <Section title="7. Changes to Terms">
        We reserve the right to update these Terms of Service at any time.
        Continued use of the App after changes constitutes acceptance of the
        revised terms. We encourage you to review this page periodically.
      </Section>

      <Section title="8. Governing Law">
        These terms shall be governed by and construed in accordance with the
        laws of the jurisdiction in which Chill Radio operates, without regard
        to conflict of law principles.
      </Section>

      <Section title="9. Contact">
        If you have questions about these Terms of Service, please contact us at
        hello@chillradio.app.
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
