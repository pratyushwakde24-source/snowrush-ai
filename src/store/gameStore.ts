// ============================================================
// SnowRush — Game State Store (Zustand)
// ============================================================

import { create } from 'zustand';

export type GamePhase = 'menu' | 'loading' | 'playing' | 'gameover';

export interface TrickPopup {
  id: number;
  name: string;
  points: number;
  timestamp: number;
}

interface GameState {
  // Game phase
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Score
  score: number;
  addScore: (points: number) => void;

  // Coins
  coins: number;
  sessionCoins: number;
  addCoins: (amount: number) => void;

  // Distance
  distance: number;
  setDistance: (d: number) => void;

  // Speed
  speed: number;
  setSpeed: (s: number) => void;

  // Combo
  combo: number;
  comboTimer: number;
  incrementCombo: () => void;
  resetCombo: () => void;
  setComboTimer: (t: number) => void;

  // Tricks
  trickPopups: TrickPopup[];
  addTrickPopup: (name: string, points: number) => void;
  clearOldPopups: () => void;

  // Boost
  boostMeter: number;
  setBoostMeter: (v: number) => void;
  isBoosting: boolean;
  setIsBoosting: (v: boolean) => void;

  // Difficulty
  difficulty: number;
  setDifficulty: (d: number) => void;

  // Game state flags
  isOnGround: boolean;
  setIsOnGround: (v: boolean) => void;
  isCrashed: boolean;
  setIsCrashed: (v: boolean) => void;

  // Lifecycle
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
}

let popupIdCounter = 0;

export const useGameStore = create<GameState>((set) => ({
  phase: 'menu',
  setPhase: (phase) => set({ phase }),

  score: 0,
  addScore: (points) => set((s) => ({ score: s.score + points })),

  coins: 0,
  sessionCoins: 0,
  addCoins: (amount) =>
    set((s) => ({
      coins: s.coins + amount,
      sessionCoins: s.sessionCoins + amount,
    })),

  distance: 0,
  setDistance: (distance) => set({ distance }),

  speed: 0,
  setSpeed: (speed) => set({ speed }),

  combo: 0,
  comboTimer: 0,
  incrementCombo: () => set((s) => ({ combo: s.combo + 1, comboTimer: 3 })),
  resetCombo: () => set({ combo: 0, comboTimer: 0 }),
  setComboTimer: (comboTimer) => set({ comboTimer }),

  trickPopups: [],
  addTrickPopup: (name, points) =>
    set((s) => ({
      trickPopups: [
        ...s.trickPopups,
        { id: ++popupIdCounter, name, points, timestamp: Date.now() },
      ],
    })),
  clearOldPopups: () =>
    set((s) => ({
      trickPopups: s.trickPopups.filter((p) => Date.now() - p.timestamp < 2000),
    })),

  boostMeter: 0,
  setBoostMeter: (boostMeter) => set({ boostMeter }),
  isBoosting: false,
  setIsBoosting: (isBoosting) => set({ isBoosting }),

  difficulty: 0,
  setDifficulty: (difficulty) => set({ difficulty }),

  isOnGround: true,
  setIsOnGround: (isOnGround) => set({ isOnGround }),
  isCrashed: false,
  setIsCrashed: (isCrashed) => set({ isCrashed }),

  startGame: () =>
    set({
      phase: 'playing',
      score: 0,
      coins: 0,
      sessionCoins: 0,
      distance: 0,
      speed: 0,
      combo: 0,
      comboTimer: 0,
      trickPopups: [],
      boostMeter: 0,
      isBoosting: false,
      difficulty: 0,
      isOnGround: true,
      isCrashed: false,
    }),

  endGame: () => set({ phase: 'gameover' }),

  resetGame: () =>
    set({
      phase: 'menu',
      score: 0,
      coins: 0,
      sessionCoins: 0,
      distance: 0,
      speed: 0,
      combo: 0,
      comboTimer: 0,
      trickPopups: [],
      boostMeter: 0,
      isBoosting: false,
      difficulty: 0,
      isOnGround: true,
      isCrashed: false,
    }),
}));
