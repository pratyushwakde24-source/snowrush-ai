// ============================================================
// SnowRush — Progress / Persistence Store
// ============================================================

import { create } from 'zustand';
import { loadSave, saveToDisk } from '../utils/saveSystem';

export interface BoardSkin {
  id: string;
  name: string;
  color: string;
  price: number;
}

export interface CharacterSkin {
  id: string;
  name: string;
  jacketColor: string;
  pantsColor: string;
  price: number;
}

export const BOARD_SKINS: BoardSkin[] = [
  { id: 'default', name: 'Classic Blue', color: '#2563eb', price: 0 },
  { id: 'fire', name: 'Fire Red', color: '#dc2626', price: 500 },
  { id: 'emerald', name: 'Emerald', color: '#059669', price: 500 },
  { id: 'sunset', name: 'Sunset Orange', color: '#ea580c', price: 750 },
  { id: 'purple', name: 'Amethyst', color: '#7c3aed', price: 750 },
  { id: 'gold', name: 'Golden', color: '#d97706', price: 1500 },
  { id: 'neon', name: 'Neon Pink', color: '#ec4899', price: 1000 },
  { id: 'arctic', name: 'Arctic Frost', color: '#06b6d4', price: 1200 },
];

export const CHARACTER_SKINS: CharacterSkin[] = [
  { id: 'default', name: 'Classic Red', jacketColor: '#ef4444', pantsColor: '#1e293b', price: 0 },
  { id: 'cool', name: 'Cool Blue', jacketColor: '#3b82f6', pantsColor: '#1e293b', price: 500 },
  { id: 'forest', name: 'Forest', jacketColor: '#16a34a', pantsColor: '#1e293b', price: 500 },
  { id: 'stealth', name: 'Stealth', jacketColor: '#374151', pantsColor: '#111827', price: 750 },
  { id: 'royal', name: 'Royal Purple', jacketColor: '#7c3aed', pantsColor: '#1e1b4b', price: 1000 },
  { id: 'sunny', name: 'Sunny', jacketColor: '#f59e0b', pantsColor: '#78350f', price: 800 },
];

interface ProgressState {
  totalCoins: number;
  bestScore: number;
  bestDistance: number;
  gamesPlayed: number;
  unlockedBoards: string[];
  unlockedCharacters: string[];
  selectedBoard: string;
  selectedCharacter: string;

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  updateBestScore: (score: number) => boolean;
  updateBestDistance: (distance: number) => boolean;
  incrementGamesPlayed: () => void;
  unlockBoard: (id: string) => void;
  unlockCharacter: (id: string) => void;
  selectBoard: (id: string) => void;
  selectCharacter: (id: string) => void;
  loadFromSave: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => {
  const saved = loadSave();

  return {
    totalCoins: saved.totalCoins,
    bestScore: saved.bestScore,
    bestDistance: saved.bestDistance,
    gamesPlayed: saved.gamesPlayed,
    unlockedBoards: saved.unlockedBoards,
    unlockedCharacters: saved.unlockedCharacters,
    selectedBoard: saved.selectedBoard,
    selectedCharacter: saved.selectedCharacter,

    addCoins: (amount) => {
      const totalCoins = get().totalCoins + amount;
      set({ totalCoins });
      saveToDisk({ totalCoins });
    },

    spendCoins: (amount) => {
      const current = get().totalCoins;
      if (current < amount) return false;
      const totalCoins = current - amount;
      set({ totalCoins });
      saveToDisk({ totalCoins });
      return true;
    },

    updateBestScore: (score) => {
      if (score > get().bestScore) {
        set({ bestScore: score });
        saveToDisk({ bestScore: score });
        return true;
      }
      return false;
    },

    updateBestDistance: (distance) => {
      if (distance > get().bestDistance) {
        set({ bestDistance: distance });
        saveToDisk({ bestDistance: distance });
        return true;
      }
      return false;
    },

    incrementGamesPlayed: () => {
      const gamesPlayed = get().gamesPlayed + 1;
      set({ gamesPlayed });
      saveToDisk({ gamesPlayed });
    },

    unlockBoard: (id) => {
      const unlockedBoards = [...get().unlockedBoards, id];
      set({ unlockedBoards });
      saveToDisk({ unlockedBoards });
    },

    unlockCharacter: (id) => {
      const unlockedCharacters = [...get().unlockedCharacters, id];
      set({ unlockedCharacters });
      saveToDisk({ unlockedCharacters });
    },

    selectBoard: (id) => {
      set({ selectedBoard: id });
      saveToDisk({ selectedBoard: id });
    },

    selectCharacter: (id) => {
      set({ selectedCharacter: id });
      saveToDisk({ selectedCharacter: id });
    },

    loadFromSave: () => {
      const data = loadSave();
      set({
        totalCoins: data.totalCoins,
        bestScore: data.bestScore,
        bestDistance: data.bestDistance,
        gamesPlayed: data.gamesPlayed,
        unlockedBoards: data.unlockedBoards,
        unlockedCharacters: data.unlockedCharacters,
        selectedBoard: data.selectedBoard,
        selectedCharacter: data.selectedCharacter,
      });
    },
  };
});
