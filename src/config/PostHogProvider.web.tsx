import React from 'react';
import { posthog } from './posthog.web';

// posthog-js is a global singleton — no provider wrapper needed.
// We export a component so the import in _layout.tsx works on both platforms.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
