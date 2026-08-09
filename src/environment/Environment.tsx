// ============================================================
// SnowRush — Sky & Environment
// ============================================================

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../utils/constants';

export const Sky: React.FC<{ playerZ: React.MutableRefObject<number> }> = ({ playerZ }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(500, 32, 16);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(COLORS.SKY_TOP) },
        bottomColor: { value: new THREE.Color(COLORS.SKY_BOTTOM) },
        sunColor: { value: new THREE.Color(COLORS.SUN) },
        sunDirection: { value: new THREE.Vector3(0.5, 0.3, -0.8).normalize() },
        offset: { value: 20 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 sunColor;
        uniform vec3 sunDirection;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = max(dir.y + offset * 0.01, 0.0);
          float t = pow(h, exponent);

          vec3 skyColor = mix(bottomColor, topColor, t);

          // Sun glow
          float sunDot = max(dot(dir, sunDirection), 0.0);
          float sunGlow = pow(sunDot, 64.0) * 1.5;
          float sunHalo = pow(sunDot, 8.0) * 0.3;
          skyColor += sunColor * (sunGlow + sunHalo);

          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    return { geometry: geo, material: mat };
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = playerZ.current;
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};

// ─── Lighting Setup ──────────────────────────────────────────

export const Lighting: React.FC<{ playerPosition: React.MutableRefObject<THREE.Vector3> }> = ({ playerPosition }) => {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (dirLightRef.current) {
      const pz = playerPosition.current.z;
      const py = playerPosition.current.y;
      // Position light ahead of the player, shining back up the slope so it hits the terrain normals
      dirLightRef.current.position.set(20, py + 30, pz - 40);
      dirLightRef.current.target.position.set(0, py, pz + 10);
      dirLightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      {/* Hemisphere for ambient fill */}
      <hemisphereLight
        color="#b4d7f0"
        groundColor="#2a3a50"
        intensity={0.6}
      />

      {/* Main directional sunlight */}
      <directionalLight
        ref={dirLightRef}
        color={COLORS.SUN}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={150}
        shadow-bias={-0.001}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-10, 10, 0]}
        color="#8ec5fc"
        intensity={0.3}
      />

      {/* Ambient light */}
      <ambientLight intensity={0.15} color="#c8ddf0" />
    </>
  );
};

// ─── Fog ─────────────────────────────────────────────────────

export const EnvironmentFog: React.FC = () => {
  return <fog attach="fog" args={[COLORS.FOG_COLOR, 30, 150]} />;
};

// ─── Snow Particles ──────────────────────────────────────────

export const SnowParticles: React.FC<{ playerZ: React.MutableRefObject<number> }> = ({
  playerZ,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 400;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      vel[i * 3] = (Math.random() - 0.5) * 0.5;
      vel[i * 3 + 1] = -0.5 - Math.random() * 1.0;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const pz = playerZ.current;

    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3] += velocities[i * 3] * delta;
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      posAttr.array[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Reset if below ground or too far
      if (posAttr.array[i * 3 + 1] < -2) {
        posAttr.array[i * 3] = (Math.random() - 0.5) * 60;
        posAttr.array[i * 3 + 1] = 25 + Math.random() * 10;
        posAttr.array[i * 3 + 2] = pz + (Math.random() - 0.5) * 60;
      }
    }

    // Keep centered on player
    pointsRef.current.position.z = 0;
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.15}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

// ─── Background Mountains ────────────────────────────────────

export const BackgroundMountains: React.FC<{ playerZ: React.MutableRefObject<number> }> = ({
  playerZ,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const mountains = useMemo(() => {
    const data: Array<{ x: number; z: number; scale: number; color: string }> = [];
    for (let i = 0; i < 12; i++) {
      data.push({
        x: (Math.random() - 0.5) * 200,
        z: -50 - Math.random() * 100,
        scale: 15 + Math.random() * 30,
        color: i % 2 === 0 ? '#3a5070' : '#2d4060',
      });
    }
    return data;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z = playerZ.current * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {mountains.map((m, i) => (
        <mesh key={i} position={[m.x, m.scale * 0.4, m.z]} castShadow={false} receiveShadow={false}>
          <coneGeometry args={[m.scale * 0.8, m.scale, 5]} />
          <meshStandardMaterial color={m.color} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
};
