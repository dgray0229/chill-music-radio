import React from 'react';
import { PostHogProvider as NativePostHogProvider } from 'posthog-react-native';
import { posthog } from './posthog';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <NativePostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
        maxElementsCaptured: 20,
      }}
    >
      {children}
    </NativePostHogProvider>
  );
}
