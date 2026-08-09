// ============================================================
// SnowRush — HUD (Heads-Up Display)
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { formatNumber, formatDistance } from '../utils/math';

const HUD: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const score = useGameStore((s) => s.score);
  const sessionCoins = useGameStore((s) => s.sessionCoins);
  const distance = useGameStore((s) => s.distance);
  const speed = useGameStore((s) => s.speed);
  const combo = useGameStore((s) => s.combo);
  const boostMeter = useGameStore((s) => s.boostMeter);
  const isBoosting = useGameStore((s) => s.isBoosting);
  const trickPopups = useGameStore((s) => s.trickPopups);
  const clearOldPopups = useGameStore((s) => s.clearOldPopups);

  useEffect(() => {
    const interval = setInterval(() => clearOldPopups(), 500);
    return () => clearInterval(interval);
  }, [clearOldPopups]);

  if (phase !== 'playing') return null;

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.scoreContainer}>
          <span style={styles.scoreLabel}>SCORE</span>
          <span style={styles.scoreValue}>{formatNumber(score)}</span>
        </div>
        <div style={styles.coinContainer}>
          <span style={styles.coinIcon}>🪙</span>
          <span style={styles.coinValue}>{sessionCoins}</span>
        </div>
      </div>

      {/* Distance */}
      <div style={styles.distanceContainer}>
        <span style={styles.distanceValue}>{formatDistance(distance)}</span>
      </div>

      {/* Speed indicator */}
      <div style={styles.speedContainer}>
        <span style={styles.speedValue}>{Math.floor(speed)}</span>
        <span style={styles.speedUnit}>km/h</span>
      </div>

      {/* Boost meter */}
      {boostMeter > 0 && (
        <div style={styles.boostContainer}>
          <div style={styles.boostBarBg}>
            <motion.div
              style={{
                ...styles.boostBarFill,
                width: `${boostMeter * 100}%`,
              }}
              animate={isBoosting ? { opacity: [0.8, 1, 0.8] } : {}}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </div>
          <span style={styles.boostLabel}>BOOST</span>
        </div>
      )}

      {/* Combo */}
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            style={styles.comboContainer}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            key={combo}
          >
            <span style={styles.comboValue}>{combo}x</span>
            <span style={styles.comboLabel}>COMBO</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trick popups */}
      <div style={styles.trickContainer}>
        <AnimatePresence>
          {trickPopups.map((popup) => (
            <motion.div
              key={popup.id}
              style={styles.trickPopup}
              initial={{ y: 20, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <span style={styles.trickName}>{popup.name}</span>
              <span style={styles.trickPoints}>+{formatNumber(popup.points)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 20,
    padding: 'env(safe-area-inset-top, 16px) 16px 16px 16px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 8px',
  },
  scoreContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  scoreLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '2px',
    color: 'rgba(255,255,255,0.6)',
  },
  scoreValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#ffffff',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  coinContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '20px',
    padding: '6px 14px',
    backdropFilter: 'blur(10px)',
  },
  coinIcon: {
    fontSize: '1.2rem',
  },
  coinValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffd700',
  },
  distanceContainer: {
    position: 'absolute',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  distanceValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    textShadow: '0 1px 5px rgba(0,0,0,0.5)',
  },
  speedContainer: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    opacity: 0.7,
  },
  speedValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  speedUnit: {
    fontSize: '0.7rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.5)',
  },
  boostContainer: {
    position: 'absolute',
    bottom: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  boostBarBg: {
    width: '120px',
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  boostBarFill: {
    height: '100%',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, #f97316, #fbbf24)',
    transition: 'width 0.1s ease',
  },
  boostLabel: {
    fontSize: '0.6rem',
    fontWeight: 600,
    letterSpacing: '2px',
    color: '#f97316',
  },
  comboContainer: {
    position: 'absolute',
    top: '30%',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  comboValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '2rem',
    fontWeight: 900,
    color: '#ff6e40',
    textShadow: '0 0 20px rgba(255,110,64,0.5)',
  },
  comboLabel: {
    fontSize: '0.6rem',
    fontWeight: 600,
    letterSpacing: '2px',
    color: '#ff9e80',
  },
  trickContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  trickPopup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  trickName: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#ffd54f',
    textShadow: '0 0 15px rgba(255,213,79,0.5)',
  },
  trickPoints: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#4fc3f7',
  },
};

export default HUD;
