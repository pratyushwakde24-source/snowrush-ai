// ============================================================
// SnowRush — Unified Input Hook
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { isTouchDevice } from '../utils/deviceDetection';

export interface InputState {
  left: number;    // -1 to 0
  right: number;   // 0 to 1
  turnAxis: number; // -1 to 1 (combined)
  jump: boolean;
  jumpHeld: boolean;
  boost: boolean;
  trick: boolean;
  pause: boolean;
}

const defaultInput: InputState = {
  left: 0,
  right: 0,
  turnAxis: 0,
  jump: false,
  jumpHeld: false,
  boost: false,
  trick: false,
  pause: false,
};

class InputManager {
  private keys: Set<string> = new Set();
  private prevKeys: Set<string> = new Set();
  private touchStartX: number = 0;
  private touchCurrentX: number = 0;
  private touchActive: boolean = false;
  private touchJump: boolean = false;
  private touchTrick: boolean = false;
  public isTouch: boolean;

  constructor() {
    this.isTouch = isTouchDevice();
    this.setupKeyboard();
    if (this.isTouch) {
      this.setupTouch();
    }
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  private setupTouch(): void {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const screenWidth = window.innerWidth;
      const x = touch.clientX;

      if (x > screenWidth * 0.7) {
        this.touchJump = true;
      } else {
        this.touchStartX = x;
        this.touchCurrentX = x;
        this.touchActive = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || !this.touchActive) return;
      this.touchCurrentX = touch.clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        this.touchActive = false;
        this.touchJump = false;
        this.touchStartX = 0;
        this.touchCurrentX = 0;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  }

  getState(): InputState {
    let turnAxis = 0;

    if (this.isTouch && this.touchActive) {
      const dx = this.touchCurrentX - this.touchStartX;
      const sensitivity = 80;
      turnAxis = Math.max(-1, Math.min(1, dx / sensitivity));
    } else {
      if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) turnAxis -= 1;
      if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) turnAxis += 1;
    }

    const jumpHeld =
      this.keys.has('Space') || this.keys.has('ArrowUp') || this.keys.has('KeyW') || this.touchJump;

    const jump = jumpHeld && !this.wasKeyHeld('Space') && !this.wasKeyHeld('ArrowUp') && !this.wasKeyHeld('KeyW');

    const state: InputState = {
      left: Math.min(0, turnAxis),
      right: Math.max(0, turnAxis),
      turnAxis,
      jump,
      jumpHeld,
      boost: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
      trick:
        this.keys.has('KeyE') ||
        this.keys.has('ArrowDown') ||
        this.keys.has('KeyS') ||
        this.touchTrick,
      pause: this.keys.has('Escape') || this.keys.has('KeyP'),
    };

    this.prevKeys = new Set(this.keys);
    this.touchTrick = false;

    return state;
  }

  private wasKeyHeld(code: string): boolean {
    return this.prevKeys.has(code);
  }

  setTouchJump(v: boolean): void {
    this.touchJump = v;
  }

  setTouchTrick(v: boolean): void {
    this.touchTrick = v;
  }

  setTouchTurn(axis: number): void {
    if (this.isTouch) {
      this.touchActive = axis !== 0;
      this.touchStartX = 0;
      this.touchCurrentX = axis * 80;
    }
  }
}

const inputManagerInstance = new InputManager();

export function useInput() {
  const stateRef = useRef<InputState>({ ...defaultInput });

  const update = useCallback(() => {
    stateRef.current = inputManagerInstance.getState();
  }, []);

  return { inputRef: stateRef, update, manager: inputManagerInstance };
}

export { inputManagerInstance };
