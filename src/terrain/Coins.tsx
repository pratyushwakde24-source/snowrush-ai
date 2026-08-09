// ============================================================
// SnowRush — Coin Components (Collectible Coins)
// ============================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CoinData } from './TerrainGenerator';
import { COLORS, COINS, PLAYER } from '../utils/constants';

interface CoinsProps {
  coins: CoinData[];
  playerZ: React.MutableRefObject<number>;
  onCollect: (id: string) => void;
  collectedCoins: React.MutableRefObject<Set<string>>;
}

export const Coins: React.FC<CoinsProps> = React.memo(({ coins, onCollect, collectedCoins }) => {
  return (
    <group>
      {coins.map((coin) => (
        <Coin
          key={coin.id}
          data={coin}
          onCollect={onCollect}
          collectedCoins={collectedCoins}
        />
      ))}
    </group>
  );
});
Coins.displayName = 'Coins';

interface CoinProps {
  data: CoinData;
  onCollect: (id: string) => void;
  collectedCoins: React.MutableRefObject<Set<string>>;
}

const Coin: React.FC<CoinProps> = React.memo(({ data, onCollect, collectedCoins }) => {
  const groupRef = useRef<THREE.Group>(null);
  const collectedRef = useRef(false);
  const scaleRef = useRef(1);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (collectedCoins.current.has(data.id)) {
      if (!collectedRef.current) {
        collectedRef.current = true;
      }
      scaleRef.current *= 0.85;
      if (scaleRef.current < 0.01) {
        groupRef.current.visible = false;
      }
      groupRef.current.scale.setScalar(scaleRef.current);
      return;
    }

    // Rotate
    groupRef.current.rotation.y = state.clock.elapsedTime * COINS.ROTATION_SPEED + data.x;

    // Float up and down
    groupRef.current.position.y =
      data.y + Math.sin(state.clock.elapsedTime * 2 + data.z * 0.5) * 0.2;
  });

  if (collectedRef.current && scaleRef.current < 0.01) return null;

  return (
    <group ref={groupRef} position={[data.x, data.y, data.z]}>
      {/* Coin body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 16]} />
        <meshStandardMaterial
          color={COLORS.COIN_GOLD}
          roughness={0.3}
          metalness={0.8}
          emissive={COLORS.COIN_GOLD}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Glow */}
      <pointLight color={COLORS.COIN_GLOW} intensity={0.5} distance={3} />
    </group>
  );
});
Coin.displayName = 'Coin';
