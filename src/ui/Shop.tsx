// ============================================================
// SnowRush — Shop UI
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { useProgressStore, BOARD_SKINS, CHARACTER_SKINS } from '../store/progressStore';
import { audioManager } from '../audio/AudioManager';
import { formatNumber } from '../utils/math';

interface ShopProps {
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ onClose }) => {
  const totalCoins = useProgressStore((s) => s.totalCoins);
  const unlockedBoards = useProgressStore((s) => s.unlockedBoards);
  const unlockedCharacters = useProgressStore((s) => s.unlockedCharacters);
  const selectedBoard = useProgressStore((s) => s.selectedBoard);
  const selectedCharacter = useProgressStore((s) => s.selectedCharacter);
  const selectBoard = useProgressStore((s) => s.selectBoard);
  const selectCharacter = useProgressStore((s) => s.selectCharacter);
  const unlockBoard = useProgressStore((s) => s.unlockBoard);
  const unlockCharacter = useProgressStore((s) => s.unlockCharacter);
  const spendCoins = useProgressStore((s) => s.spendCoins);

  const handleBuyBoard = (id: string, price: number) => {
    if (spendCoins(price)) {
      unlockBoard(id);
      selectBoard(id);
      audioManager.playPurchase();
    }
  };

  const handleBuyCharacter = (id: string, price: number) => {
    if (spendCoins(price)) {
      unlockCharacter(id);
      selectCharacter(id);
      audioManager.playPurchase();
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
        <div style={styles.header}>
          <h2 style={styles.title}>🏂 SHOP</h2>
          <div style={styles.coinDisplay}>
            <span>🪙</span>
            <span style={styles.coinAmount}>{formatNumber(totalCoins)}</span>
          </div>
        </div>

        <div style={styles.scrollArea}>
          <h3 style={styles.sectionTitle}>BOARDS</h3>
          <div style={styles.itemGrid}>
            {BOARD_SKINS.map((board) => {
              const owned = unlockedBoards.includes(board.id);
              const selected = selectedBoard === board.id;
              return (
                <motion.button
                  key={board.id}
                  style={{
                    ...styles.itemCard,
                    borderColor: selected ? '#4fc3f7' : 'rgba(255,255,255,0.1)',
                    background: selected ? 'rgba(79,195,247,0.1)' : 'rgba(255,255,255,0.03)',
                  }}
                  onClick={() => {
                    audioManager.playMenuClick();
                    if (owned) selectBoard(board.id);
                    else handleBuyBoard(board.id, board.price);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div style={{ ...styles.colorSwatch, background: board.color }} />
                  <span style={styles.itemName}>{board.name}</span>
                  {owned ? (
                    selected ? (
                      <span style={styles.equipped}>EQUIPPED</span>
                    ) : (
                      <span style={styles.owned}>OWNED</span>
                    )
                  ) : (
                    <span
                      style={{
                        ...styles.price,
                        color: totalCoins >= board.price ? '#ffd700' : '#ff5252',
                      }}
                    >
                      🪙 {board.price}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <h3 style={styles.sectionTitle}>OUTFITS</h3>
          <div style={styles.itemGrid}>
            {CHARACTER_SKINS.map((char) => {
              const owned = unlockedCharacters.includes(char.id);
              const selected = selectedCharacter === char.id;
              return (
                <motion.button
                  key={char.id}
                  style={{
                    ...styles.itemCard,
                    borderColor: selected ? '#4fc3f7' : 'rgba(255,255,255,0.1)',
                    background: selected ? 'rgba(79,195,247,0.1)' : 'rgba(255,255,255,0.03)',
                  }}
                  onClick={() => {
                    audioManager.playMenuClick();
                    if (owned) selectCharacter(char.id);
                    else handleBuyCharacter(char.id, char.price);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div style={styles.charPreview}>
                    <div style={{ ...styles.charJacket, background: char.jacketColor }} />
                    <div style={{ ...styles.charPants, background: char.pantsColor }} />
                  </div>
                  <span style={styles.itemName}>{char.name}</span>
                  {owned ? (
                    selected ? (
                      <span style={styles.equipped}>EQUIPPED</span>
                    ) : (
                      <span style={styles.owned}>OWNED</span>
                    )
                  ) : (
                    <span
                      style={{
                        ...styles.price,
                        color: totalCoins >= char.price ? '#ffd700' : '#ff5252',
                      }}
                    >
                      🪙 {char.price}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

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
    maxWidth: '480px',
    width: '92%',
    maxHeight: '85vh',
    background: 'rgba(15,30,50,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '24px',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#e8f4fd',
    margin: 0,
  },
  coinDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,215,0,0.1)',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,215,0,0.2)',
  },
  coinAmount: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    color: '#ffd700',
  },
  scrollArea: {
    overflowY: 'auto',
    flex: 1,
    paddingRight: '4px',
  },
  sectionTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#7eb8d4',
    letterSpacing: '2px',
    margin: '12px 0 8px 0',
  },
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  itemCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  colorSwatch: {
    width: '40px',
    height: '10px',
    borderRadius: '5px',
  },
  charPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'center',
  },
  charJacket: {
    width: '24px',
    height: '16px',
    borderRadius: '4px 4px 0 0',
  },
  charPants: {
    width: '24px',
    height: '10px',
    borderRadius: '0 0 4px 4px',
  },
  itemName: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#e8f4fd',
  },
  equipped: {
    fontSize: '0.6rem',
    fontWeight: 700,
    color: '#4fc3f7',
    letterSpacing: '1px',
  },
  owned: {
    fontSize: '0.6rem',
    fontWeight: 500,
    color: '#7eb8d4',
    letterSpacing: '1px',
  },
  price: {
    fontSize: '0.7rem',
    fontWeight: 700,
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

export default Shop;
