<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Chill Radio. Here's what was set up:

**Infrastructure:** `posthog-react-native` was already installed. `react-native-svg` (required peer dependency) was installed. A new `app.config.js` was created to expose PostHog config via Expo's `Constants.expoConfig.extra`, and a dedicated `src/config/posthog.ts` client module was created. Environment variables `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` were added to `.env`.

**Provider & screen tracking:** `app/_layout.tsx` was updated to use the typed PostHog client instance, enable autocapture (touches, no automatic screens), and manually track screen changes via `usePathname` + `useGlobalSearchParams` on every route transition.

**Events:** 8 business events were added across 5 files covering the core listener and artist-acquisition journeys.

| Event | Description | File |
|---|---|---|
| `playback_started` | User presses play to start listening | `app/(tabs)/index.tsx` |
| `playback_paused` | User pauses the stream | `app/(tabs)/index.tsx` |
| `track_favorited` | User saves the playing track to favorites | `app/(tabs)/index.tsx` |
| `track_shared` | User shares the playing track | `app/(tabs)/index.tsx` |
| `station_tuned` | User selects a station from the list | `app/(tabs)/stations.tsx` |
| `track_unfavorited` | User removes a track from favorites | `app/(tabs)/favorites.tsx` |
| `music_submission_viewed` | User opened the Submit Your Music page | `app/(tabs)/radio-play.tsx` |
| `schedule_viewed` | User opened the show schedule | `app/(tabs)/schedule.tsx` |

## Next steps

We've built a dashboard and five insights to monitor listener behavior and the artist acquisition funnel:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/466626/dashboard/1705719)
- [Daily playback starts](https://us.posthog.com/project/466626/insights/6IoAspfk)
- [Station popularity](https://us.posthog.com/project/466626/insights/qq5Ag6Uy)
- [Favorites saved vs removed](https://us.posthog.com/project/466626/insights/yvRhb0w5)
- [Track shares](https://us.posthog.com/project/466626/insights/UfxcDUv1)
- [Music submission page visits](https://us.posthog.com/project/466626/insights/szVbyI30)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
