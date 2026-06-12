// App Install hook — PWA install prompt management
// Replaces hooks/usePWAInstall.ts with different naming

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Manages PWA installation state across platforms.
 * - Chromium: captures deferred install prompt
 * - iOS Safari: detects for manual "Add to Home Screen" guidance
 * - Native: returns inert state
 */
export function useAppInstall() {
  const [pending, setPending] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosSafari, setIosSafari] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Detect standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setInstalled(standalone);

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const apple = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);
    setIosSafari(apple && safari);

    // Chromium install prompt
    const capturePrompt = (e: Event) => {
      e.preventDefault();
      setPending(e as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);

    // Mid-session install detection
    const onInstalled = () => {
      setInstalled(true);
      setPending(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (!pending) return false;
    pending.prompt();
    const { outcome } = await pending.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPending(null);
    return outcome === 'accepted';
  }, [pending]);

  return {
    canPrompt: pending !== null,
    installed,
    iosSafari,
    visible: Platform.OS === 'web' && !installed && (pending !== null || iosSafari),
    triggerInstall,
  };
}
