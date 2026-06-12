import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';

const COLORS = {
  ink: '#0B1A2E',
  midnight: '#061222',
  slate: '#142D4F',
  electric: '#4DA6FF',
  mist: '#D8E4F8',
};

export default function ContactScreen() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:hello@chillradio.app');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Get in Touch</Text>

      <View style={styles.section}>
        <Text style={styles.body}>
          We'd love to hear from you! Whether you have feedback, a question, or
          just want to say hello, don't hesitate to reach out.
        </Text>
      </View>

      <View style={[styles.section, styles.emailSection]}>
        <Text style={styles.cardLabel}>Email Address</Text>
        <Pressable 
          onPress={handleEmailPress}
          style={Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined}
        >
          <Text style={styles.link}>hello@chillradio.app</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Follow Us</Text>
        <Text style={[styles.body, { marginBottom: 16 }]}>
          Stay up to date with new stations, features, and community news.
        </Text>

        <View style={styles.socialsContainer}>
          {(['Twitter / X', 'Instagram', 'Discord', 'YouTube'] as const).map(
            (platform) => (
              <View 
                key={platform} 
                {...({ className: Platform.OS === 'web' ? 'hover-item' : undefined } as any)}
                style={styles.socialCard}
              >
                <Text style={styles.socialText}>{platform}</Text>
                <Text style={styles.socialHandle}>@chillradio</Text>
              </View>
            ),
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Press &amp; Media</Text>
        <Text style={styles.body}>
          For press inquiries, partnerships, or media requests, please email us
          at hello@chillradio.app with the subject line "Press Inquiry."
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
  emailSection: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.electric,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.mist,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(216,228,248,0.5)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
  link: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.electric,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
  socialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialCard: {
    backgroundColor: 'rgba(6, 18, 34, 0.45)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: '45%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.08)',
  },
  socialText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: Platform.OS === 'web' ? 'DM Sans' : undefined,
  },
  socialHandle: {
    fontSize: 13,
    color: COLORS.electric,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
});
