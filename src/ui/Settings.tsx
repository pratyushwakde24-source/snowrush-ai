// ============================================================
// SnowRush — Settings UI
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore, type QualityLevel } from '../store/settingsStore';
import { audioManager } from '../audio/AudioManager';
import { resetSave } from '../utils/saveSystem';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const musicVolume = useSettingsStore((s) => s.musicVolume);
  const sfxVolume = useSettingsStore((s) => s.sfxVolume);
  const quality = useSettingsStore((s) => s.quality);
  const setMusicVolume = useSettingsStore((s) => s.setMusicVolume);
  const setSfxVolume = useSettingsStore((s) => s.setSfxVolume);
  const setQuality = useSettingsStore((s) => s.setQuality);

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setMusicVolume(v);
    audioManager.setMusicVolume(v);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setSfxVolume(v);
    audioManager.setSfxVolume(v);
  };

  const handleResetProgress = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      resetSave();
      window.location.reload();
    }
  };

  return (
    <motion.div
      style={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={styles.panel}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <h2 style={styles.title}>⚙️ SETTINGS</h2>

        {/* Music Volume */}
        <div style={styles.setting}>
          <label style={styles.label}>Music Volume</label>
          <div style={styles.sliderRow}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={handleMusicChange}
              style={styles.slider}
            />
            <span style={styles.value}>{Math.round(musicVolume * 100)}%</span>
          </div>
        </div>

        {/* SFX Volume */}
        <div style={styles.setting}>
          <label style={styles.label}>SFX Volume</label>
          <div style={styles.sliderRow}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={handleSfxChange}
              style={styles.slider}
            />
            <span style={styles.value}>{Math.round(sfxVolume * 100)}%</span>
          </div>
        </div>

        {/* Quality */}
        <div style={styles.setting}>
          <label style={styles.label}>Graphics Quality</label>
          <div style={styles.qualityRow}>
            {(['LOW', 'MEDIUM', 'HIGH'] as QualityLevel[]).map((q) => (
              <motion.button
                key={q}
                style={{
                  ...styles.qualityButton,
                  background: quality === q ? 'rgba(79,195,247,0.2)' : 'rgba(255,255,255,0.05)',
                  borderColor: quality === q ? '#4fc3f7' : 'rgba(255,255,255,0.1)',
                  color: quality === q ? '#4fc3f7' : '#7eb8d4',
                }}
                onClick={() => {
                  audioManager.playMenuClick();
                  setQuality(q);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <motion.button
          style={styles.resetButton}
          onClick={handleResetProgress}
          whileHover={{ scale: 1.02, background: 'rgba(255,82,82,0.15)' }}
          whileTap={{ scale: 0.98 }}
        >
          Reset Progress
        </motion.button>

        <motion.button
          style={styles.closeButton}
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          CLOSE
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(10,22,40,0.9)',
    backdropFilter: 'blur(15px)',
    zIndex: 200,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '400px',
    width: '90%',
    background: 'rgba(15,30,50,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '28px',
    gap: '20px',
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#e8f4fd',
    margin: 0,
    textAlign: 'center',
  },
  setting: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#7eb8d4',
    letterSpacing: '1px',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  slider: {
    flex: 1,
  },
  value: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#e8f4fd',
    minWidth: '40px',
    textAlign: 'right',
  },
  qualityRow: {
    display: 'flex',
    gap: '8px',
  },
  qualityButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '0.75rem',
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 600,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  resetButton: {
    padding: '10px',
    background: 'rgba(255,82,82,0.08)',
    border: '1px solid rgba(255,82,82,0.2)',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#ff5252',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  closeButton: {
    padding: '12px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#e8f4fd',
    cursor: 'pointer',
    letterSpacing: '2px',
  },
};

export default Settings;
