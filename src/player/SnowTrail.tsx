// ============================================================
// SnowRush — Snow Trail Effect
// ============================================================

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../utils/constants';

interface SnowTrailProps {
  playerPosition: React.MutableRefObject<THREE.Vector3>;
  isOnGround: React.MutableRefObject<boolean>;
  turnAngle: React.MutableRefObject<number>;
}

export const SnowTrail: React.FC<SnowTrailProps> = ({ playerPosition, isOnGround, turnAngle }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const MAX_POINTS = 80;

  const { geometry, positions, opacities } = useMemo(() => {
    const pos = new Float32Array(MAX_POINTS * 3 * 2); // Two strips (left/right edge)
    const opac = new Float32Array(MAX_POINTS * 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('opacity', new THREE.Float32BufferAttribute(opac, 1));
    const indices: number[] = [];
    for (let i = 0; i < MAX_POINTS - 1; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }
    geo.setIndex(indices);
    return { geometry: geo, positions: pos, opacities: opac };
  }, []);

  const pointIndex = useRef(0);
  const lastZ = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;

    const pos = playerPosition.current;
    const onGround = isOnGround.current;
    const turn = turnAngle.current;

    // Add new trail points when moving
    if (onGround && Math.abs(pos.z - lastZ.current) > 0.3) {
      lastZ.current = pos.z;

      const boardWidth = 0.18 + Math.abs(turn) * 0.1;

      // Shift all points back
      for (let i = MAX_POINTS - 1; i > 0; i--) {
        positions[i * 6] = positions[(i - 1) * 6];
        positions[i * 6 + 1] = positions[(i - 1) * 6 + 1];
        positions[i * 6 + 2] = positions[(i - 1) * 6 + 2];
        positions[i * 6 + 3] = positions[(i - 1) * 6 + 3];
        positions[i * 6 + 4] = positions[(i - 1) * 6 + 4];
        positions[i * 6 + 5] = positions[(i - 1) * 6 + 5];
        opacities[i * 2] = opacities[(i - 1) * 2] * 0.97;
        opacities[i * 2 + 1] = opacities[(i - 1) * 2 + 1] * 0.97;
      }

      // Set newest point
      positions[0] = pos.x - boardWidth;
      positions[1] = pos.y - 0.45;
      positions[2] = pos.z;
      positions[3] = pos.x + boardWidth;
      positions[4] = pos.y - 0.45;
      positions[5] = pos.z;
      opacities[0] = 0.6;
      opacities[1] = 0.6;

      pointIndex.current = Math.min(pointIndex.current + 1, MAX_POINTS);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.opacity.needsUpdate = true;
  });

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(COLORS.TRAIL_COLOR),
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  );

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};
