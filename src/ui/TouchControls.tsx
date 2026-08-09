// ============================================================
// SnowRush — Touch Controls Overlay
// ============================================================

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { inputManagerInstance } from '../hooks/useInput';
import { isTouchDevice } from '../utils/deviceDetection';
import { useGameStore } from '../store/gameStore';

const TouchControls: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const isTouch = isTouchDevice();
  const jumpActive = useRef(false);

  const handleJumpStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    jumpActive.current = true;
    inputManagerInstance.setTouchJump(true);
  }, []);

  const handleJumpEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    jumpActive.current = false;
    inputManagerInstance.setTouchJump(false);
  }, []);

  const handleTrickStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    inputManagerInstance.setTouchTrick(true);
  }, []);

  if (!isTouch || phase !== 'playing') return null;

  return (
    <div style={styles.container}>
      {/* Left side: steering zone (handled by global touch in useInput) */}
      <div style={styles.steerZone}>
        <span style={styles.steerHint}>← STEER →</span>
      </div>

      {/* Right side: jump button */}
      <div style={styles.buttonZone}>
        <motion.div
          style={styles.jumpButton}
          onTouchStart={handleJumpStart}
          onTouchEnd={handleJumpEnd}
          whileTap={{ scale: 0.9, background: 'rgba(79,195,247,0.4)' }}
        >
          <span style={styles.buttonLabel}>JUMP</span>
        </motion.div>

        <motion.div
          style={styles.trickButton}
          onTouchStart={handleTrickStart}
          whileTap={{ scale: 0.9, background: 'rgba(255,213,79,0.4)' }}
        >
          <span style={styles.buttonLabel}>TRICK</span>
        </motion.div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '40%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '20px',
    zIndex: 15,
    pointerEvents: 'none',
  },
  steerZone: {
    width: '50%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    opacity: 0.3,
  },
  steerHint: {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '2px',
  },
  buttonZone: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'auto',
  },
  jumpButton: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'rgba(79,195,247,0.2)',
    border: '2px solid rgba(79,195,247,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  trickButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(255,213,79,0.15)',
    border: '2px solid rgba(255,213,79,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    alignSelf: 'center',
  },
  buttonLabel: {
    fontSize: '0.6rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '1px',
  },
};

export default TouchControls;
