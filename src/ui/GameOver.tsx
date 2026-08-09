// ============================================================
// SnowRush — Game Over Screen
// ============================================================

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useProgressStore } from '../store/progressStore';
import { audioManager } from '../audio/AudioManager';
import { formatNumber, formatDistance } from '../utils/math';

const GameOver: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const score = useGameStore((s) => s.score);
  const sessionCoins = useGameStore((s) => s.sessionCoins);
  const distance = useGameStore((s) => s.distance);
  const resetGame = useGameStore((s) => s.resetGame);
  const startGame = useGameStore((s) => s.startGame);

  const bestScore = useProgressStore((s) => s.bestScore);
  const updateBestScore = useProgressStore((s) => s.updateBestScore);
  const updateBestDistance = useProgressStore((s) => s.updateBestDistance);
  const addCoins = useProgressStore((s) => s.addCoins);
  const incrementGamesPlayed = useProgressStore((s) => s.incrementGamesPlayed);

  const [isNewBest, setIsNewBest] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (phase === 'gameover' && !saved) {
      const newBest = updateBestScore(Math.floor(score));
      updateBestDistance(Math.floor(distance));
      addCoins(sessionCoins);
      incrementGamesPlayed();
      setIsNewBest(newBest);
      setSaved(true);

      audioManager.stopMusic();
      audioManager.stopWind();
      audioManager.stopCarving();
    }
    if (phase !== 'gameover') {
      setSaved(false);
      setIsNewBest(false);
    }
  }, [phase, score, distance, sessionCoins, saved, updateBestScore, updateBestDistance, addCoins, incrementGamesPlayed]);

  if (phase !== 'gameover') return null;

  const handleRestart = () => {
    audioManager.playMenuClick();
    audioManager.startMusic();
    audioManager.startWind();
    audioManager.startCarving();
    startGame();
  };

  const handleMenu = () => {
    audioManager.playMenuClick();
    resetGame();
  };

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.panel}
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header */}
        <motion.h2
          style={styles.title}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          GAME OVER
        </motion.h2>

        {/* New Best! */}
        {isNewBest && (
          <motion.div
            style={styles.newBest}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            🏆 NEW BEST SCORE! 🏆
          </motion.div>
        )}

        {/* Stats */}
        <div style={styles.statsGrid}>
          <motion.div
            style={styles.statCard}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span style={styles.statLabel}>SCORE</span>
            <span style={styles.statValue}>{formatNumber(score)}</span>
          </motion.div>

          <motion.div
            style={styles.statCard}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span style={styles.statLabel}>DISTANCE</span>
            <span style={styles.statValue}>{formatDistance(distance)}</span>
          </motion.div>

          <motion.div
            style={styles.statCard}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span style={styles.statLabel}>COINS</span>
            <span style={{ ...styles.statValue, color: '#ffd700' }}>+{sessionCoins}</span>
          </motion.div>

          <motion.div
            style={styles.statCard}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span style={styles.statLabel}>BEST</span>
            <span style={styles.statValue}>{formatNumber(bestScore)}</span>
          </motion.div>
        </div>

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <motion.button
            style={styles.playAgainButton}
            onClick={handleRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            ▶ PLAY AGAIN
          </motion.button>
          <motion.button
            style={styles.menuButton}
            onClick={handleMenu}
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            MENU
          </motion.button>
        </div>
      </motion.div>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    background: 'rgba(10, 22, 40, 0.85)',
    backdropFilter: 'blur(10px)',
    pointerEvents: 'auto',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '36px 48px',
    background: 'rgba(15, 30, 50, 0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    backdropFilter: 'blur(20px)',
    maxWidth: '400px',
    width: '90%',
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#e8f4fd',
    letterSpacing: '4px',
    margin: 0,
  },
  newBest: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#ffd700',
    textShadow: '0 0 15px rgba(255,215,0,0.5)',
    padding: '8px 16px',
    background: 'rgba(255,215,0,0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255,215,0,0.3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '2px',
    color: '#7eb8d4',
  },
  statValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#e8f4fd',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  playAgainButton: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #4fc3f7, #0288d1)',
    borderRadius: '12px',
    fontSize: '1rem',
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700,
    letterSpacing: '2px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(79, 195, 247, 0.3)',
  },
  menuButton: {
    padding: '14px 24px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#e8f4fd',
    cursor: 'pointer',
    letterSpacing: '1px',
  },
};

export default GameOver;
