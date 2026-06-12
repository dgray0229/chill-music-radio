import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

// ---------- palette ----------
const C = {
  ink: '#0B1A2E',
  slate: '#142D4F',
  electric: '#4DA6FF',
  mist: '#D8E4F8',
  mistDim: 'rgba(216,228,248,0.4)',
  mistVeryFaint: 'rgba(216,228,248,0.2)',
  electricDim: 'rgba(77,166,255,0.15)',
  electricBorder: 'rgba(77,166,255,0.1)',
  white: '#FFFFFF',
  divider: 'rgba(77,166,255,0.1)',
} as const;

// ---------- menu data ----------
interface MenuItem {
  name: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  path: string;
  subtitle?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'Browse',
    items: [
      { name: 'About Us', icon: 'info-circle', path: '/about', subtitle: 'Our story' },
      { name: 'Contact', icon: 'envelope', path: '/contact', subtitle: 'Get in touch' },
      { name: 'Want Radio Play?', icon: 'music', path: '/radio-play', subtitle: 'Submit your music' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { name: 'Terms & Conditions', icon: 'file-text-o', path: '/terms' },
      { name: 'Privacy Policy', icon: 'shield', path: '/privacy' },
    ],
  },
];

// ---------- component ----------
export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.name}
                  onPress={() => router.push(item.path as any)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && styles.menuRowPressed,
                    index < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name={item.icon} size={18} color={C.electric} />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuLabel}>{item.name}</Text>
                    {item.subtitle ? (
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    ) : null}
                  </View>
                  <FontAwesome
                    name="chevron-right"
                    size={12}
                    color={C.mistVeryFaint}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Copyright */}
        <View style={styles.copyrightWrap}>
          <Text style={styles.copyrightText}>
            © 2026 Chill Radio. All rights reserved.{'\n'}
            Licensed with ASCAP, BMI, SESAC
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.ink,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  // --- Section ---
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: C.mistDim,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: 'rgba(20,45,79,0.6)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.electricBorder,
  },

  // --- Menu row ---
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowPressed: {
    backgroundColor: 'rgba(77,166,255,0.1)',
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.electricDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    color: C.white,
    fontWeight: '600',
    fontSize: 16,
  },
  menuSubtitle: {
    color: C.mistDim,
    fontSize: 12,
    marginTop: 2,
  },

  // --- Copyright ---
  copyrightWrap: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  copyrightText: {
    color: C.mistVeryFaint,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
});
