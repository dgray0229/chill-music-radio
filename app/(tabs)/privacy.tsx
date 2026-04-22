import React from 'react';
import { View, Text, ScrollView, Platform, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/constants/Colors';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="text-white text-xl font-bold mb-3">{title}</Text>
      {children}
    </View>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <Text className="text-soft-sky/80 text-base leading-7 mb-4">{children}</Text>;
}

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const isDesktop = Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 768;

  return (
    <View className="flex-1 bg-navy-deep relative overflow-hidden">
      <LinearGradient
        colors={[palette.deepNavy, palette.oceanBlue]}
        className="absolute w-full h-full opacity-30"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: isDesktop ? 60 : Math.max(insets.top + 20, 40),
          paddingBottom: isDesktop ? 60 : insets.bottom + 120,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}
      >
        <View className="w-full max-w-3xl bg-navy-light/80 p-8 rounded-3xl backdrop-blur-md border border-ocean/20">
          <Text style={{ fontFamily: 'Pacifico' }} className="text-4xl text-white mb-2 text-center">
            Privacy Policy
          </Text>
          <Text className="text-soft-sky/50 text-sm text-center mb-8">Last updated: 2026</Text>

          <Section title="Introduction">
            <Para>
              EasyListening.com ("EL", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our radio streaming service at www.EasyListening.com.
            </Para>
          </Section>

          <Section title="Information We Collect">
            <Para>
              We may collect the following types of information:{'\n\n'}
              • Email addresses and contact information from those who communicate with us via email, phone, or other methods{'\n'}
              • Aggregate information on what pages our users access or visit{'\n'}
              • Information volunteered by users, such as survey responses, site registrations, and account signups{'\n'}
              • Music submissions and related materials from artists seeking airplay
            </Para>
          </Section>

          <Section title="How We Use Your Information">
            <Para>
              The information we collect is used to:{'\n\n'}
              • Improve the content and functionality of our website and streaming service{'\n'}
              • Contact individuals and businesses for marketing purposes{'\n'}
              • Process and evaluate music submissions for potential airplay{'\n'}
              • Respond to inquiries and provide customer support{'\n'}
              • Comply with legal obligations
            </Para>
          </Section>

          <Section title="Third-Party Sharing">
            <Para>
              Information we collect may be shared with or used by third parties for purposes including marketing and service improvement. We do not sell your personal information. Third-party content displayed on our site is subject to its own terms and the third party's privacy practices.
            </Para>
          </Section>

          <Section title="Cookies and Tracking">
            <Para>
              Our website may use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user behavior. You can control cookie settings through your browser preferences.
            </Para>
          </Section>

          <Section title="Data Retention">
            <Para>
              We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable laws and regulations. Music submissions may be retained indefinitely as part of our programming library.
            </Para>
          </Section>

          <Section title="Your Rights">
            <Para>
              You have the right to:{'\n\n'}
              • Opt out of marketing communications by sending an email with "UNSUBSCRIBE" in the subject line{'\n'}
              • Request deletion of your submitted materials (note: we cannot guarantee complete removal from third-party devices or repositories){'\n'}
              • Access or update your personal information by contacting us
            </Para>
          </Section>

          <Section title="Children's Privacy">
            <Para>
              Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.
            </Para>
          </Section>

          <Section title="Changes to This Policy">
            <Para>
              We may update this Privacy Policy from time to time. We encourage you to review this page periodically for the latest information on our privacy practices. Your continued use of the site after any changes constitutes your acceptance of the updated policy.
            </Para>
          </Section>

          <Section title="Contact Us">
            <Para>
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </Para>
            <Pressable onPress={() => Linking.openURL('mailto:contact@easylistening.com')}>
              <Text className="text-ocean text-lg font-bold text-center">
                contact@easylistening.com
              </Text>
            </Pressable>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}
