// ============================================================
// SnowRush — LocalStorage Save System
// ============================================================

const SAVE_KEY = 'snowrush_save_v1';

export interface SaveData {
  version: number;
  totalCoins: number;
  bestScore: number;
  bestDistance: number;
  gamesPlayed: number;
  unlockedBoards: string[];
  unlockedCharacters: string[];
  selectedBoard: string;
  selectedCharacter: string;
  musicVolume: number;
  sfxVolume: number;
  quality: 'LOW' | 'MEDIUM' | 'HIGH';
}

const DEFAULT_SAVE: SaveData = {
  version: 1,
  totalCoins: 0,
  bestScore: 0,
  bestDistance: 0,
  gamesPlayed: 0,
  unlockedBoards: ['default'],
  unlockedCharacters: ['default'],
  selectedBoard: 'default',
  selectedCharacter: 'default',
  musicVolume: 0.7,
  sfxVolume: 0.8,
  quality: 'HIGH',
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const data = JSON.parse(raw) as SaveData;
    return { ...DEFAULT_SAVE, ...data };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function saveToDisk(data: Partial<SaveData>): void {
  try {
    const existing = loadSave();
    const merged = { ...existing, ...data };
    localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
  } catch {
    // Storage full or private browsing — fail silently
  }
}

export function resetSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // fail silently
  }
}
