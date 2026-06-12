import { create } from 'zustand';
import { usePlayerStore } from '@/src/store/usePlayerStore';

interface SleepTimerState {
  remainingMs: number | null;
  isActive: boolean;
  isOpen: boolean;
  start: (durationMs: number) => void;
  cancel: () => void;
  tick: () => void;
  setOpen: (open: boolean) => void;
}

let timerInterval: any = null;
let fadeInterval: any = null;

export const useSleepTimer = create<SleepTimerState>((set, get) => {
  const performFadeOutAndPause = async () => {
    const playerStore = usePlayerStore.getState();
    if (playerStore.playback !== 'playing') {
      playerStore.togglePlay();
      return;
    }

    const startVol = playerStore.volumeLevel;
    const fadeSteps = 50; // 5 seconds, 100ms intervals
    const stepDec = startVol / fadeSteps;
    let currentStep = 0;

    fadeInterval = setInterval(async () => {
      currentStep++;
      const nextVol = Math.max(0, startVol - stepDec * currentStep);
      await playerStore.changeVolume(nextVol);

      if (currentStep >= fadeSteps || nextVol <= 0) {
        clearInterval(fadeInterval);
        fadeInterval = null;
        // Pause playback
        await playerStore.togglePlay();
        // Restore initial volume level
        await playerStore.changeVolume(startVol);
      }
    }, 100);
  };

  return {
    remainingMs: null,
    isActive: false,
    isOpen: false,

    start: (durationMs: number) => {
      // Clear any existing timer or fade-out
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }

      set({ remainingMs: durationMs, isActive: true, isOpen: false });

      timerInterval = setInterval(() => {
        get().tick();
      }, 1000);
    },

    cancel: () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
      set({ remainingMs: null, isActive: false });
    },

    setOpen: (open: boolean) => {
      set({ isOpen: open });
    },

    tick: () => {
      const { remainingMs } = get();
      if (remainingMs === null) return;

      const nextMs = remainingMs - 1000;
      if (nextMs <= 0) {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        set({ remainingMs: 0, isActive: false });
        performFadeOutAndPause();
      } else {
        set({ remainingMs: nextMs });
      }
    },
  };
});
export default useSleepTimer;
