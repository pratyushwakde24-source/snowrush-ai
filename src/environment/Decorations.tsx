// ============================================================
// SnowRush — Decorations (Trees, Rocks)
// ============================================================

import React from 'react';
import type { TreeData, RockData } from '../terrain/TerrainGenerator';
import { COLORS } from '../utils/constants';
import * as THREE from 'three';

interface DecorationsProps {
  trees: TreeData[];
  rocks: RockData[];
}

export const Decorations: React.FC<DecorationsProps> = React.memo(({ trees, rocks }) => {
  return (
    <group>
      {trees.map((tree, i) => (
        <DecoTree key={`dt-${i}`} data={tree} />
      ))}
      {rocks.map((rock, i) => (
        <DecoRock key={`dr-${i}`} data={rock} />
      ))}
    </group>
  );
});
Decorations.displayName = 'Decorations';

const DecoTree: React.FC<{ data: TreeData }> = React.memo(({ data }) => {
  const s = data.scale;
  return (
    <group position={[data.x, data.y, data.z]}>
      <mesh position={[0, 1.0 * s, 0]} castShadow>
        <cylinderGeometry args={[0.12 * s, 0.18 * s, 2.0 * s, 5]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.2 * s, 0]} castShadow>
        <coneGeometry args={[1.1 * s, 2.0 * s, 6]} />
        <meshStandardMaterial color={COLORS.TREE_GREEN} roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.2 * s, 0]} castShadow>
        <coneGeometry args={[0.8 * s, 1.6 * s, 6]} />
        <meshStandardMaterial color={COLORS.TREE_GREEN} roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.0 * s, 0]} castShadow>
        <coneGeometry args={[0.5 * s, 1.2 * s, 6]} />
        <meshStandardMaterial color={COLORS.TREE_DARK} roughness={0.85} />
      </mesh>
      {/* Snow */}
      <mesh position={[0, 3.4 * s, 0]}>
        <coneGeometry args={[0.85 * s, 0.2 * s, 6]} />
        <meshStandardMaterial color={COLORS.TREE_SNOW} roughness={0.9} />
      </mesh>
    </group>
  );
});
DecoTree.displayName = 'DecoTree';

const DecoRock: React.FC<{ data: RockData }> = React.memo(({ data }) => {
  return (
    <group position={[data.x, data.y, data.z]} rotation={[0, data.rotation, 0]}>
      <mesh castShadow position={[0, 0.3 * data.scale, 0]}>
        <dodecahedronGeometry args={[0.6 * data.scale, 0]} />
        <meshStandardMaterial color={COLORS.ROCK_GRAY} roughness={0.95} />
      </mesh>
    </group>
  );
});
DecoRock.displayName = 'DecoRock';
