import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook to manage PWA install prompt.
 * - On Chromium browsers: captures `beforeinstallprompt` and exposes `promptInstall()`.
 * - On iOS Safari: detects the platform so UI can show manual "Add to Home Screen" instructions.
 * - On native apps: returns inert state (everything false/null).
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check if already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS Safari (no beforeinstallprompt support)
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);
    setIsIOSSafari(isIOS && isSafari);

    // Listen for Chromium install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Detect if user installs mid-session
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    /** True when Chromium's install prompt is available */
    canInstall: deferredPrompt !== null,
    /** True when running as an installed PWA */
    isInstalled,
    /** True when on iOS Safari (needs manual "Add to Home Screen" guidance) */
    isIOSSafari,
    /** True when an install option should be shown (either Chromium prompt or iOS Safari guidance) */
    showInstallOption: Platform.OS === 'web' && !isInstalled && (deferredPrompt !== null || isIOSSafari),
    /** Trigger the Chromium install prompt. Returns true if accepted. */
    promptInstall,
  };
}
