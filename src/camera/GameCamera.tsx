// ============================================================
// SnowRush — Game Camera (Third-Person Chase)
// ============================================================

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA } from '../utils/constants';
import { damp, lerp, clamp } from '../utils/math';
import { useGameStore } from '../store/gameStore';

interface GameCameraProps {
  playerPosition: React.MutableRefObject<THREE.Vector3>;
}

const GameCamera: React.FC<GameCameraProps> = ({ playerPosition }) => {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 8, 15));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, -8));
  const shakeOffset = useRef(new THREE.Vector3());
  const phase = useGameStore((s) => s.phase);
  const speed = useGameStore((s) => s.speed);
  const isCrashed = useGameStore((s) => s.isCrashed);

  useFrame((state, delta) => {
    if (phase !== 'playing') return;

    const dt = Math.min(delta, 0.05);
    const pp = playerPosition.current;

    // Target position: behind and above player
    const targetPos = new THREE.Vector3(
      pp.x * 0.3, // Slight follow on X for wider view
      pp.y + CAMERA.OFFSET[1],
      pp.z + CAMERA.OFFSET[2],
    );

    // Smooth follow
    currentPos.current.x = damp(currentPos.current.x, targetPos.x, CAMERA.FOLLOW_SPEED, dt);
    currentPos.current.y = damp(currentPos.current.y, targetPos.y, CAMERA.FOLLOW_SPEED * 0.8, dt);
    currentPos.current.z = damp(currentPos.current.z, targetPos.z, CAMERA.FOLLOW_SPEED, dt);

    // Look at target: ahead of player
    const lookTarget = new THREE.Vector3(
      pp.x * 0.5,
      pp.y + 1,
      pp.z + CAMERA.LOOK_OFFSET[2],
    );
    currentLookAt.current.x = damp(currentLookAt.current.x, lookTarget.x, CAMERA.ROTATION_FOLLOW, dt);
    currentLookAt.current.y = damp(currentLookAt.current.y, lookTarget.y, CAMERA.ROTATION_FOLLOW, dt);
    currentLookAt.current.z = damp(currentLookAt.current.z, lookTarget.z, CAMERA.ROTATION_FOLLOW, dt);

    // Camera shake
    shakeOffset.current.set(0, 0, 0);
    if (speed > CAMERA.SHAKE_SPEED_THRESHOLD || isCrashed) {
      const intensity = isCrashed
        ? CAMERA.SHAKE_INTENSITY * 5
        : (speed - CAMERA.SHAKE_SPEED_THRESHOLD) * CAMERA.SHAKE_INTENSITY * 0.05;
      const time = state.clock.elapsedTime;
      shakeOffset.current.set(
        Math.sin(time * 25.1) * intensity,
        Math.cos(time * 31.7) * intensity,
        Math.sin(time * 17.3) * intensity * 0.5,
      );
    }

    // Apply
    camera.position.copy(currentPos.current).add(shakeOffset.current);
    camera.lookAt(currentLookAt.current);

    // Dynamic FOV
    const targetFOV = clamp(
      CAMERA.FOV_BASE + speed * CAMERA.FOV_SPEED_MULTIPLIER,
      CAMERA.FOV_BASE,
      CAMERA.FOV_MAX,
    );
    if ('fov' in camera && camera instanceof THREE.PerspectiveCamera) {
      camera.fov = lerp(camera.fov, targetFOV, dt * 3);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export default GameCamera;
