// ============================================================
// SnowRush — Obstacle Components (Trees, Rocks, Logs, Ice)
// ============================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { ObstacleData } from './TerrainGenerator';
import { COLORS } from '../utils/constants';

interface ObstaclesProps {
  obstacles: ObstacleData[];
}

export const Obstacles: React.FC<ObstaclesProps> = React.memo(({ obstacles }) => {
  return (
    <group>
      {obstacles.map((obs, i) => (
        <Obstacle key={`obs-${i}`} data={obs} />
      ))}
    </group>
  );
});
Obstacles.displayName = 'Obstacles';

const Obstacle: React.FC<{ data: ObstacleData }> = React.memo(({ data }) => {
  switch (data.type) {
    case 'tree':
      return <ObstacleTree data={data} />;
    case 'rock':
      return <ObstacleRock data={data} />;
    case 'log':
      return <ObstacleLog data={data} />;
    case 'ice':
      return <ObstacleIce data={data} />;
    default:
      return null;
  }
});
Obstacle.displayName = 'Obstacle';

// ─── Pine Tree ───────────────────────────────────────────────

const ObstacleTree: React.FC<{ data: ObstacleData }> = React.memo(({ data }) => {
  const scale = data.scale;
  return (
    <group position={[data.x, data.y, data.z]} rotation={[0, data.rotation, 0]}>
      {/* Trunk */}
      <mesh position={[0, 1.2 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.2 * scale, 2.4 * scale, 6]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      {/* Bottom foliage */}
      <mesh position={[0, 2.5 * scale, 0]} castShadow>
        <coneGeometry args={[1.3 * scale, 2.2 * scale, 6]} />
        <meshStandardMaterial color={COLORS.TREE_GREEN} roughness={0.8} />
      </mesh>
      {/* Middle foliage */}
      <mesh position={[0, 3.6 * scale, 0]} castShadow>
        <coneGeometry args={[1.0 * scale, 1.8 * scale, 6]} />
        <meshStandardMaterial color={COLORS.TREE_GREEN} roughness={0.8} />
      </mesh>
      {/* Top foliage */}
      <mesh position={[0, 4.5 * scale, 0]} castShadow>
        <coneGeometry args={[0.6 * scale, 1.4 * scale, 6]} />
        <meshStandardMaterial color={COLORS.TREE_DARK} roughness={0.8} />
      </mesh>
      {/* Snow caps */}
      <mesh position={[0, 3.8 * scale, 0]}>
        <coneGeometry args={[1.05 * scale, 0.3 * scale, 6]} />
        <meshStandardMaterial color={COLORS.TREE_SNOW} roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.8 * scale, 0]}>
        <coneGeometry args={[0.5 * scale, 0.15 * scale, 6]} />
        <meshStandardMaterial color={COLORS.TREE_SNOW} roughness={0.9} />
      </mesh>
    </group>
  );
});
ObstacleTree.displayName = 'ObstacleTree';

// ─── Rock ────────────────────────────────────────────────────

const ObstacleRock: React.FC<{ data: ObstacleData }> = React.memo(({ data }) => {
  const geo = useMemo(() => {
    const g = new THREE.DodecahedronGeometry(0.8 * data.scale, 1);
    // Distort vertices for natural look
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const noise = Math.sin(x * 5) * Math.cos(z * 3) * 0.15;
      pos.setXYZ(i, x + noise, Math.max(0, y * 0.7), z + noise);
    }
    g.computeVertexNormals();
    return g;
  }, [data.scale]);

  return (
    <group position={[data.x, data.y + 0.3 * data.scale, data.z]}>
      <mesh geometry={geo} castShadow receiveShadow rotation={[0, data.rotation, 0]}>
        <meshStandardMaterial color={COLORS.ROCK_GRAY} roughness={0.95} metalness={0.1} />
      </mesh>
      {/* Snow on top */}
      <mesh position={[0, 0.4 * data.scale, 0]}>
        <sphereGeometry args={[0.5 * data.scale, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={COLORS.SNOW_WHITE} roughness={0.9} />
      </mesh>
    </group>
  );
});
ObstacleRock.displayName = 'ObstacleRock';

// ─── Log ─────────────────────────────────────────────────────

const ObstacleLog: React.FC<{ data: ObstacleData }> = React.memo(({ data }) => {
  return (
    <group position={[data.x, data.y + 0.25 * data.scale, data.z]} rotation={[0, data.rotation, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.25 * data.scale, 0.3 * data.scale, 3 * data.scale, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      {/* Snow on log */}
      <mesh position={[0, 0.28 * data.scale, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.5 * data.scale, 0.08, 3 * data.scale]} />
        <meshStandardMaterial color={COLORS.SNOW_WHITE} roughness={0.9} />
      </mesh>
    </group>
  );
});
ObstacleLog.displayName = 'ObstacleLog';

// ─── Ice Patch ───────────────────────────────────────────────

const ObstacleIce: React.FC<{ data: ObstacleData }> = React.memo(({ data }) => {
  return (
    <group position={[data.x, data.y + 0.02, data.z]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, data.rotation]}>
        <circleGeometry args={[1.5 * data.scale, 8]} />
        <meshStandardMaterial
          color={COLORS.ICE_BLUE}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
});
ObstacleIce.displayName = 'ObstacleIce';
