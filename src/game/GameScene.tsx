// ============================================================
// SnowRush — Game Scene (3D World)
// ============================================================

import React, { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Player from '../player/Player';
import TerrainManager from '../terrain/TerrainManager';
import GameCamera from '../camera/GameCamera';
import {
  Sky,
  Lighting,
  EnvironmentFog,
  SnowParticles,
  BackgroundMountains,
} from '../environment/Environment';
import { useGameStore } from '../store/gameStore';
import { audioManager } from '../audio/AudioManager';
import { COINS, TERRAIN } from '../utils/constants';
import { getTerrainHeight } from '../terrain/TerrainGenerator';
import PostProcessing from '../rendering/PostProcessing';

const GameScene: React.FC = () => {
  const playerPositionRef = useRef(new THREE.Vector3(0, 2, 0));
  const playerZRef = useRef(0);
  const collectedCoins = useRef<Set<string>>(new Set());

  const phase = useGameStore((s) => s.phase);
  const addCoins = useGameStore((s) => s.addCoins);
  const addScore = useGameStore((s) => s.addScore);
  const endGame = useGameStore((s) => s.endGame);
  const difficulty = useGameStore((s) => s.difficulty);

  const handleCoinCollect = useCallback(
    (id: string) => {
      if (collectedCoins.current.has(id)) return;
      collectedCoins.current.add(id);
      addCoins(COINS.BASE_VALUE);
      addScore(COINS.BASE_VALUE * 5);
      audioManager.playCoinCollect();
    },
    [addCoins, addScore],
  );

  return (
    <>
      <EnvironmentFog />
      <Lighting playerPosition={playerPositionRef} />
      <Sky playerZ={playerZRef} />
      <BackgroundMountains playerZ={playerZRef} />
      <SnowParticles playerZ={playerZRef} />

      {phase === 'playing' && (
        <>
          <TerrainManager
            playerZ={playerZRef}
            onCoinCollect={handleCoinCollect}
            collectedCoins={collectedCoins}
          />
          <Player
            playerPositionRef={playerPositionRef}
            playerZRef={playerZRef}
            collectedCoins={collectedCoins}
          />
          <GameCamera playerPosition={playerPositionRef} />
          <CoinCollisionChecker
            playerPosition={playerPositionRef}
            playerZ={playerZRef}
            collectedCoins={collectedCoins}
            onCollect={handleCoinCollect}
            difficulty={difficulty}
          />
          <ObstacleCollisionChecker
            playerPosition={playerPositionRef}
            difficulty={difficulty}
            onCrash={() => {
              endGame();
            }}
          />
        </>
      )}

      {phase === 'menu' && <MenuCamera />}
      <PostProcessing />
    </>
  );
};

// ─── Coin Collision Checker ────────────────────────────────────

interface CoinCollisionCheckerProps {
  playerPosition: React.MutableRefObject<THREE.Vector3>;
  playerZ: React.MutableRefObject<number>;
  collectedCoins: React.MutableRefObject<Set<string>>;
  onCollect: (id: string) => void;
  difficulty: number;
}

const CoinCollisionChecker: React.FC<CoinCollisionCheckerProps> = ({
  playerPosition,
  playerZ,
  collectedCoins,
  onCollect,
  difficulty,
}) => {
  const checkCounter = useRef(0);

  useFrame(() => {
    // Check every other frame for performance
    checkCounter.current++;
    if (checkCounter.current % 2 !== 0) return;

    const pp = playerPosition.current;
    const pz = playerZ.current;
    const currentChunkIndex = Math.floor(-pz / TERRAIN.CHUNK_DEPTH);

    // Check coins in nearby chunks (simplified — checking against terrain generator data)
    for (let ci = currentChunkIndex - 1; ci <= currentChunkIndex + 1; ci++) {
      if (ci < 0) continue;
      // Generate coin positions for this chunk to check against
      const startZ = -ci * TERRAIN.CHUNK_DEPTH;
      const coinLineCount = 2 + Math.floor(Math.abs(Math.sin(ci * 7.3)) * 3);

      for (let line = 0; line < coinLineCount; line++) {
        const seed = ci * 500 + line * 50;
        const nx = Math.sin(seed * 0.1 + (seed + 1) * 0.2) * 0.5 + 0.5;
        const lineX = (nx - 0.5) * (TERRAIN.CHUNK_WIDTH * 0.4);
        const nz = Math.sin((seed + 2) * 0.3 + (seed + 3) * 0.4) * 0.5 + 0.5;
        const lineStartZ = startZ - nz * TERRAIN.CHUNK_DEPTH * 0.6;

        for (let c = 0; c < 5; c++) {
          const coinId = `coin_${ci}_${line}_${c}`;
          if (collectedCoins.current.has(coinId)) continue;

          const cz = lineStartZ - c * 3;
          const cx = lineX;

          const dx = pp.x - cx;
          const dz = pp.z - cz;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < COINS.COLLECT_DISTANCE) {
            onCollect(coinId);
          }
        }
      }
    }
  });

  return null;
};

// ─── Obstacle Collision Checker ────────────────────────────────

interface ObstacleCollisionCheckerProps {
  playerPosition: React.MutableRefObject<THREE.Vector3>;
  difficulty: number;
  onCrash: () => void;
}

const ObstacleCollisionChecker: React.FC<ObstacleCollisionCheckerProps> = ({
  playerPosition,
  difficulty,
  onCrash,
}) => {
  const checkCounter = useRef(0);
  const crashCooldown = useRef(0);

  useFrame((_, delta) => {
    if (crashCooldown.current > 0) {
      crashCooldown.current -= delta;
      return;
    }

    checkCounter.current++;
    if (checkCounter.current % 3 !== 0) return;

    const pp = playerPosition.current;
    const pz = pp.z;
    const currentChunkIndex = Math.floor(-pz / TERRAIN.CHUNK_DEPTH);

    for (let ci = currentChunkIndex; ci <= currentChunkIndex + 1; ci++) {
      if (ci < 0) continue;
      const startZ = -ci * TERRAIN.CHUNK_DEPTH;
      const obstacleCount = Math.floor(3 + difficulty * 8);

      for (let i = 0; i < obstacleCount; i++) {
        const seed = ci * 1000 + i;
        const nx = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453123;
        const rx = (nx - Math.floor(nx) - 0.5) * (TERRAIN.CHUNK_WIDTH * 0.7);

        if (Math.abs(rx) < 2.5) continue;

        const nz2 = Math.sin(seed * 0.3 * 127.1 + seed * 0.4 * 311.7) * 43758.5453123;
        const rz = startZ - (nz2 - Math.floor(nz2)) * TERRAIN.CHUNK_DEPTH;

        const dx = pp.x - rx;
        const dz = pp.z - rz;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 1.2) {
          crashCooldown.current = 2.0;
          onCrash();
          return;
        }
      }
    }
  });

  return null;
};

// ─── Menu Camera (slow orbit) ──────────────────────────────────

const MenuCamera: React.FC = () => {
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.15;
    state.camera.position.set(
      Math.sin(t) * 15,
      8 + Math.sin(t * 0.5) * 2,
      Math.cos(t) * 15,
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

export default GameScene;
