// ============================================================
// SnowRush — Terrain Generator (Procedural Heightmap)
// ============================================================

import { fbm, noise2D, smoothstep, clamp } from '../utils/math';
import { TERRAIN } from '../utils/constants';

export interface ChunkData {
  chunkIndex: number;
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
  obstacles: ObstacleData[];
  coins: CoinData[];
  trees: TreeData[];
  rocks: RockData[];
}

export interface ObstacleData {
  x: number;
  y: number;
  z: number;
  type: 'tree' | 'rock' | 'log' | 'ice';
  scale: number;
  rotation: number;
}

export interface CoinData {
  x: number;
  y: number;
  z: number;
  collected: boolean;
  id: string;
}

export interface TreeData {
  x: number;
  y: number;
  z: number;
  scale: number;
  type: number; // 0-2 for variation
}

export interface RockData {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
}

export function getTerrainHeight(worldX: number, worldZ: number, difficulty: number): number {
  const slopeAngle = TERRAIN.SLOPE_ANGLE + difficulty * 0.1;
  const baseHeight = -worldZ * slopeAngle;

  // Smooth center path
  const centerDist = Math.abs(worldX);
  const pathFactor = smoothstep(TERRAIN.PATH_WIDTH * 0.3, TERRAIN.PATH_WIDTH, centerDist);

  // Noise-based terrain variation
  const noiseVal =
    fbm(worldX * TERRAIN.NOISE_SCALE, worldZ * TERRAIN.NOISE_SCALE, 3) * TERRAIN.NOISE_AMPLITUDE;

  // Gentle moguls on the path, bigger features on the sides
  const pathNoise =
    fbm(worldX * 0.08, worldZ * 0.08, 2) * 0.8;
  const sideNoise = noiseVal * pathFactor;

  return baseHeight + pathNoise * (1 - pathFactor * 0.7) + sideNoise;
}

export function generateChunk(
  chunkIndex: number,
  difficulty: number,
  segmentsX: number = TERRAIN.SEGMENTS_X,
  segmentsZ: number = TERRAIN.SEGMENTS_Z,
): ChunkData {
  const width = TERRAIN.CHUNK_WIDTH;
  const depth = TERRAIN.CHUNK_DEPTH;
  const startZ = -chunkIndex * depth;

  const vertexCount = (segmentsX + 1) * (segmentsZ + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);

  const dx = width / segmentsX;
  const dz = depth / segmentsZ;

  // Generate vertices
  for (let iz = 0; iz <= segmentsZ; iz++) {
    for (let ix = 0; ix <= segmentsX; ix++) {
      const idx = iz * (segmentsX + 1) + ix;
      const worldX = (ix / segmentsX - 0.5) * width;
      const worldZ = startZ - (iz / segmentsZ) * depth;

      const y = getTerrainHeight(worldX, worldZ, difficulty);

      positions[idx * 3] = worldX;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = worldZ;

      uvs[idx * 2] = ix / segmentsX;
      uvs[idx * 2 + 1] = iz / segmentsZ;
    }
  }

  // Compute normals via central differences
  for (let iz = 0; iz <= segmentsZ; iz++) {
    for (let ix = 0; ix <= segmentsX; ix++) {
      const idx = iz * (segmentsX + 1) + ix;
      const worldX = (ix / segmentsX - 0.5) * width;
      const worldZ = startZ - (iz / segmentsZ) * depth;

      const hL = getTerrainHeight(worldX - dx, worldZ, difficulty);
      const hR = getTerrainHeight(worldX + dx, worldZ, difficulty);
      const hD = getTerrainHeight(worldX, worldZ - dz, difficulty);
      const hU = getTerrainHeight(worldX, worldZ + dz, difficulty);

      const nx = hL - hR;
      const ny = 2 * dx;
      const nz = hD - hU;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      normals[idx * 3] = nx / len;
      normals[idx * 3 + 1] = ny / len;
      normals[idx * 3 + 2] = nz / len;
    }
  }

  // Generate indices
  const indexCount = segmentsX * segmentsZ * 6;
  const indices = new Uint32Array(indexCount);
  let indIdx = 0;
  for (let iz = 0; iz < segmentsZ; iz++) {
    for (let ix = 0; ix < segmentsX; ix++) {
      const a = iz * (segmentsX + 1) + ix;
      const b = a + 1;
      const c = a + (segmentsX + 1);
      const d = c + 1;
      indices[indIdx++] = a;
      indices[indIdx++] = c;
      indices[indIdx++] = b;
      indices[indIdx++] = b;
      indices[indIdx++] = c;
      indices[indIdx++] = d;
    }
  }

  // Generate obstacles
  const obstacles: ObstacleData[] = [];
  const obstacleCount = Math.floor(3 + difficulty * 8);
  for (let i = 0; i < obstacleCount; i++) {
    const seed = chunkIndex * 1000 + i;
    const rx = (noise2D(seed * 0.1, seed * 0.2) - 0.5) * (width * 0.7);

    // Don't place right in the center
    if (Math.abs(rx) < 2.5) continue;

    const rz = startZ - noise2D(seed * 0.3, seed * 0.4) * depth;
    const ry = getTerrainHeight(rx, rz, difficulty);

    const typeRand = noise2D(seed * 0.5, seed * 0.6);
    let type: ObstacleData['type'] = 'rock';
    if (typeRand < 0.4) type = 'tree';
    else if (typeRand < 0.65) type = 'rock';
    else if (typeRand < 0.8) type = 'log';
    else type = 'ice';

    obstacles.push({
      x: rx,
      y: ry,
      z: rz,
      type,
      scale: 0.8 + noise2D(seed * 0.7, seed * 0.8) * 0.6,
      rotation: noise2D(seed * 0.9, seed * 1.0) * Math.PI * 2,
    });
  }

  // Generate coins
  const coins: CoinData[] = [];
  const coinLineCount = Math.floor(2 + Math.random() * 3);
  for (let line = 0; line < coinLineCount; line++) {
    const seed = chunkIndex * 500 + line * 50;
    const lineX = (noise2D(seed, seed + 1) - 0.5) * (width * 0.4);
    const lineStartZ = startZ - noise2D(seed + 2, seed + 3) * depth * 0.6;

    for (let c = 0; c < 5; c++) {
      const cz = lineStartZ - c * 3;
      const cy = getTerrainHeight(lineX, cz, difficulty) + 1.2;
      coins.push({
        x: lineX,
        y: cy,
        z: cz,
        collected: false,
        id: `coin_${chunkIndex}_${line}_${c}`,
      });
    }
  }

  // Generate decorative trees (along edges)
  const trees: TreeData[] = [];
  const treeCount = 8 + Math.floor(Math.random() * 6);
  for (let i = 0; i < treeCount; i++) {
    const seed = chunkIndex * 2000 + i;
    const side = noise2D(seed, seed + 1) > 0.5 ? 1 : -1;
    const tx = side * (width * 0.35 + noise2D(seed + 2, seed + 3) * width * 0.15);
    const tz = startZ - noise2D(seed + 4, seed + 5) * depth;
    const ty = getTerrainHeight(tx, tz, difficulty);
    trees.push({
      x: tx,
      y: ty,
      z: tz,
      scale: 0.7 + noise2D(seed + 6, seed + 7) * 0.8,
      type: Math.floor(noise2D(seed + 8, seed + 9) * 3),
    });
  }

  // Generate decorative rocks
  const rocks: RockData[] = [];
  const rockCount = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < rockCount; i++) {
    const seed = chunkIndex * 3000 + i;
    const rx = (noise2D(seed, seed + 1) - 0.5) * width * 0.8;
    const rz = startZ - noise2D(seed + 2, seed + 3) * depth;
    const ry = getTerrainHeight(rx, rz, difficulty);
    rocks.push({
      x: rx,
      y: ry,
      z: rz,
      scale: 0.5 + noise2D(seed + 4, seed + 5) * 1.0,
      rotation: noise2D(seed + 6, seed + 7) * Math.PI * 2,
    });
  }

  return {
    chunkIndex,
    positions,
    normals,
    uvs,
    indices,
    obstacles,
    coins,
    trees,
    rocks,
  };
}
