import PostHog from 'posthog-js'
import Constants from 'expo-constants'

const apiKey = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined
const isConfigured = !!apiKey && apiKey !== 'phc_your_project_token_here'

if (__DEV__ && !isConfigured) {
  console.warn(
    'PostHog project token not configured. Set POSTHOG_PROJECT_TOKEN in your .env file.'
  )
}

export const posthog = PostHog.init(apiKey || 'placeholder_key', {
  api_host: host || 'https://us.i.posthog.com',
  autocapture: true,
  capture_pageview: false, // Handled manually in _layout.tsx
})
