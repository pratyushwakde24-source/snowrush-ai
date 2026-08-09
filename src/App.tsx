// ============================================================
// SnowRush — Main App Component
// ============================================================

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import GameScene from './game/GameScene';
import MainMenu from './ui/MainMenu';
import HUD from './ui/HUD';
import GameOver from './ui/GameOver';
import TouchControls from './ui/TouchControls';
import { useSettingsStore } from './store/settingsStore';
import { QUALITY } from './utils/constants';
import { getPixelRatio } from './utils/deviceDetection';

const LoadingScreen: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a1628',
      zIndex: 1000,
      gap: '20px',
    }}
  >
    <div
      style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '2rem',
        fontWeight: 800,
        color: '#e8f4fd',
        letterSpacing: '4px',
      }}
    >
      <span style={{ color: '#e8f4fd' }}>SNOW</span>
      <span style={{ color: '#4fc3f7' }}>RUSH</span>
    </div>
    <div
      style={{
        width: '120px',
        height: '3px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '40%',
          height: '100%',
          background: 'linear-gradient(90deg, #4fc3f7, #0288d1)',
          borderRadius: '2px',
          animation: 'loadSlide 1.2s ease-in-out infinite',
        }}
      />
    </div>
    <style>{`
      @keyframes loadSlide {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(200%); }
        100% { transform: translateX(-100%); }
      }
    `}</style>
  </div>
);

const App: React.FC = () => {
  const quality = useSettingsStore((s) => s.quality);
  const qualitySettings = QUALITY[quality];
  const pixelRatio = getPixelRatio();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Canvas */}
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          className="game-canvas"
          dpr={Math.min(pixelRatio, qualitySettings.pixelRatio)}
          shadows={quality !== 'LOW'}
          camera={{ fov: 60, near: 0.1, far: 500, position: [0, 8, 15] }}
          gl={{
            antialias: quality !== 'LOW',
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <GameScene />
        </Canvas>
      </Suspense>

      {/* UI Layer */}
      <div className="ui-overlay">
        <MainMenu />
        <HUD />
        <GameOver />
        <TouchControls />
      </div>
    </div>
  );
};

export default App;
