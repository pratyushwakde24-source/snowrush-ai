// ============================================================
// SnowRush — Settings Store (Zustand + Persistence)
// ============================================================

import { create } from 'zustand';
import { loadSave, saveToDisk } from '../utils/saveSystem';
import { getPreferredQuality } from '../utils/deviceDetection';

export type QualityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
  quality: QualityLevel;
  showFPS: boolean;

  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setQuality: (q: QualityLevel) => void;
  setShowFPS: (v: boolean) => void;
  loadFromSave: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  const saved = loadSave();
  const defaultQuality = getPreferredQuality();

  return {
    musicVolume: saved.musicVolume ?? 0.7,
    sfxVolume: saved.sfxVolume ?? 0.8,
    quality: saved.quality ?? defaultQuality,
    showFPS: false,

    setMusicVolume: (musicVolume) => {
      set({ musicVolume });
      saveToDisk({ musicVolume });
    },

    setSfxVolume: (sfxVolume) => {
      set({ sfxVolume });
      saveToDisk({ sfxVolume });
    },

    setQuality: (quality) => {
      set({ quality });
      saveToDisk({ quality });
    },

    setShowFPS: (showFPS) => set({ showFPS }),

    loadFromSave: () => {
      const data = loadSave();
      set({
        musicVolume: data.musicVolume,
        sfxVolume: data.sfxVolume,
        quality: data.quality ?? defaultQuality,
      });
    },
  };
});
