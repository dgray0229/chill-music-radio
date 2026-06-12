import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePlayerStore } from '@/src/store/usePlayerStore';
import { useFavoritesStore } from '@/src/store/useFavoritesStore';
import { STATION_LIST } from '@/src/stations/registry';

export function useKeyboardShortcuts() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when user is typing in inputs or textareas
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const store = usePlayerStore.getState();
      const favStore = useFavoritesStore.getState();

      switch (e.key) {
        case ' ': {
          e.preventDefault();
          store.togglePlay();
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const currentIndex = STATION_LIST.findIndex(s => s.id === store.station.id);
          const nextIndex = (currentIndex + 1) % STATION_LIST.length;
          store.tune(STATION_LIST[nextIndex].id);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const currentIndex = STATION_LIST.findIndex(s => s.id === store.station.id);
          const prevIndex = (currentIndex - 1 + STATION_LIST.length) % STATION_LIST.length;
          store.tune(STATION_LIST[prevIndex].id);
          break;
        }
        case 'f':
        case 'F': {
          e.preventDefault();
          if (store.track) {
            favStore.toggle({
              title: store.track.title,
              artist: store.track.artist,
              artwork: store.coverArt || store.track.artworkUri,
              streamUrl: store.track.streamEndpoint,
            });
          }
          break;
        }
        case 'm':
        case 'M': {
          e.preventDefault();
          store.toggleMute();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const nextVol = Math.min(1, store.volumeLevel + 0.1);
          store.changeVolume(nextVol);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const nextVol = Math.max(0, store.volumeLevel - 0.1);
          store.changeVolume(nextVol);
          break;
        }
        case '?': {
          e.preventDefault();
          store.setShowShortcutOverlay(!store.showShortcutOverlay);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
