// ============================================================
// SnowRush — Terrain Chunk (React Three Fiber Component)
// ============================================================

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { ChunkData } from './TerrainGenerator';
import { COLORS } from '../utils/constants';

interface TerrainChunkProps {
  data: ChunkData;
}

const TerrainChunk: React.FC<TerrainChunkProps> = React.memo(({ data }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(data.uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    return geo;
  }, [data]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(COLORS.SNOW_WHITE),
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false,
      side: THREE.FrontSide,
    });
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} receiveShadow castShadow />
  );
});

TerrainChunk.displayName = 'TerrainChunk';

export default TerrainChunk;
