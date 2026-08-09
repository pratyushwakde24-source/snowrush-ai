// ============================================================
// SnowRush — Main Menu UI
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useProgressStore } from '../store/progressStore';
import { audioManager } from '../audio/AudioManager';
import { formatNumber } from '../utils/math';
import Settings from './Settings';
import Shop from './Shop';

const MainMenu: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const startGame = useGameStore((s) => s.startGame);
  const bestScore = useProgressStore((s) => s.bestScore);
  const totalCoins = useProgressStore((s) => s.totalCoins);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);

  if (phase !== 'menu') return null;

  const handleStart = () => {
    audioManager.init();
    audioManager.ensureResumed();
    audioManager.playMenuClick();
    audioManager.startMusic();
    audioManager.startWind();
    audioManager.startCarving();
    startGame();
  };

  return (
    <div style={styles.container}>
      <AnimatePresence>
        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} />
        )}
        {showShop && (
          <Shop onClose={() => setShowShop(false)} />
        )}
      </AnimatePresence>

      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          style={styles.logoContainer}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <h1 style={styles.logo}>
            <span style={styles.logoSnow}>SNOW</span>
            <span style={styles.logoRush}>RUSH</span>
          </h1>
          <p style={styles.subtitle}>ENDLESS MOUNTAIN RIDE</p>
        </motion.div>

        {/* Stats */}
        {bestScore > 0 && (
          <motion.div
            style={styles.statsRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div style={styles.stat}>
              <span style={styles.statLabel}>BEST</span>
              <span style={styles.statValue}>{formatNumber(bestScore)}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>COINS</span>
              <span style={{ ...styles.statValue, color: '#ffd700' }}>{formatNumber(totalCoins)}</span>
            </div>
          </motion.div>
        )}

        {/* Play Button */}
        <motion.button
          style={styles.playButton}
          onClick={handleStart}
          whileHover={{ scale: 1.05, boxShadow: '0 8px 35px rgba(79, 195, 247, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 4px 20px rgba(79, 195, 247, 0.3)',
              '0 8px 30px rgba(79, 195, 247, 0.5)',
              '0 4px 20px rgba(79, 195, 247, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ▶ PLAY
        </motion.button>

        {/* Sub buttons */}
        <div style={styles.buttonRow}>
          <motion.button
            style={styles.subButton}
            onClick={() => { audioManager.init(); audioManager.playMenuClick(); setShowShop(true); }}
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            🏂 SHOP
          </motion.button>
          <motion.button
            style={styles.subButton}
            onClick={() => { audioManager.init(); audioManager.playMenuClick(); setShowSettings(true); }}
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            ⚙️ SETTINGS
          </motion.button>
        </div>

        {/* Footer */}
        <motion.p
          style={styles.footer}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Press SPACE or tap to start
        </motion.p>
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
    background: 'radial-gradient(ellipse at center, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.95) 100%)',
    pointerEvents: 'auto',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    padding: '40px',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  logo: {
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    letterSpacing: '4px',
    lineHeight: 1.1,
    margin: 0,
    textShadow: '0 0 30px rgba(79, 195, 247, 0.5)',
  },
  logoSnow: {
    color: '#e8f4fd',
  },
  logoRush: {
    color: '#4fc3f7',
    marginLeft: '8px',
  },
  subtitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 300,
    letterSpacing: '6px',
    color: '#7eb8d4',
    marginTop: '8px',
  },
  statsRow: {
    display: 'flex',
    gap: '30px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '2px',
    color: '#7eb8d4',
  },
  statValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#e8f4fd',
  },
  playButton: {
    padding: '18px 60px',
    background: 'linear-gradient(135deg, #4fc3f7, #0288d1)',
    borderRadius: '16px',
    fontSize: '1.3rem',
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700,
    letterSpacing: '3px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(79, 195, 247, 0.3)',
    marginTop: '10px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
  },
  subButton: {
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#e8f4fd',
    cursor: 'pointer',
    letterSpacing: '1px',
  },
  footer: {
    fontSize: '0.8rem',
    color: '#7eb8d4',
    marginTop: '20px',
    letterSpacing: '1px',
  },
};

export default MainMenu;
