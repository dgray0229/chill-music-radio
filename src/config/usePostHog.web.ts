import { posthog } from './posthog.web';

// posthog-js is a singleton — usePostHog returns the global instance
export function usePostHog() {
  return posthog;
}
