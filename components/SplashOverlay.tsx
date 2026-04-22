import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Platform, Animated, Image, useWindowDimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const desktopBg = require('@/assets/images/easylistening-bg-desktop.png');
const mobileBg = require('@/assets/images/easylistening-bg-mobile.png');

interface SplashOverlayProps {
  onDismiss: () => void;
}

export function SplashOverlay({ onDismiss }: SplashOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    // Fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        opacity: fadeAnim,
        backgroundColor: '#001a3a',
      }}
    >
      {/* Background image */}
      <Image
        source={isDesktop ? desktopBg : mobileBg}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.3,
        }}
        resizeMode="cover"
      />

      {/* Gradient overlay for readability */}
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,15,40,0.6)',
        }}
      />

      {/* Content */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <FontAwesome name="headphones" size={isDesktop ? 48 : 40} color="#589BE3" />
          <Text
            style={{
              fontFamily: 'Pacifico',
              fontSize: isDesktop ? 52 : 40,
              color: '#fff',
              marginLeft: 16,
            }}
          >
            EasyListening
          </Text>
        </View>

        {/* Tagline */}
        <Text
          style={{
            color: 'rgba(228,235,252,0.7)',
            fontSize: isDesktop ? 22 : 18,
            textAlign: 'center',
            marginBottom: 8,
            maxWidth: 500,
            lineHeight: isDesktop ? 32 : 28,
          }}
        >
          No commercials, only great music!
        </Text>

        <Text
          style={{
            color: 'rgba(228,235,252,0.4)',
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          Some of the greatest songs ever recorded
        </Text>

        {/* Start button */}
        <Pressable
          onPress={handleDismiss}
          style={{
            backgroundColor: '#589BE3',
            paddingHorizontal: 40,
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
          }}
        >
          <FontAwesome name="play" size={18} color="#fff" style={{ marginRight: 12 }} />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            Start Listening
          </Text>
        </Pressable>

        {/* Licensing badge */}
        <Text
          style={{
            position: 'absolute',
            bottom: 40,
            color: 'rgba(228,235,252,0.25)',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          Licensed with ASCAP • BMI • SESAC{'\n'}© 2026 EasyListening.com
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
