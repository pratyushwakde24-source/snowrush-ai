// ============================================================
// SnowRush — Player Component
// ============================================================

import React, { useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { useProgressStore, BOARD_SKINS, CHARACTER_SKINS } from '../store/progressStore';
import { useInput } from '../hooks/useInput';
import { getTerrainHeight } from '../terrain/TerrainGenerator';
import { audioManager } from '../audio/AudioManager';
import { PLAYER, TERRAIN, COINS, SCORING, DIFFICULTY, COLORS } from '../utils/constants';
import { lerp, clamp, damp } from '../utils/math';
import { SnowTrail } from './SnowTrail';

interface PlayerProps {
  playerPositionRef: React.MutableRefObject<THREE.Vector3>;
  playerZRef: React.MutableRefObject<number>;
  collectedCoins: React.MutableRefObject<Set<string>>;
}

const Player: React.FC<PlayerProps> = ({ playerPositionRef, playerZRef, collectedCoins }) => {
  const groupRef = useRef<THREE.Group>(null);
  const boardRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const { inputRef, update: updateInput } = useInput();

  // Player state refs (avoid re-renders)
  const velocity = useRef(new THREE.Vector3(0, 0, -PLAYER.INITIAL_SPEED));
  const position = useRef(new THREE.Vector3(0, 2, 0));
  const isOnGround = useRef(true);
  const jumpCharge = useRef(0);
  const verticalVelocity = useRef(0);
  const turnAngle = useRef(0);
  const boardTilt = useRef(0);
  const bodyLean = useRef(0);
  const boostTimer = useRef(0);
  const crashTimer = useRef(0);
  const isCrashed = useRef(false);
  const airTime = useRef(0);
  const airRotation = useRef(0);
  const wasOnGround = useRef(true);
  const trailPositions = useRef<THREE.Vector3[]>([]);
  const currentSpeed = useRef(PLAYER.INITIAL_SPEED);
  const distanceTraveled = useRef(0);

  // Store actions
  const addScore = useGameStore((s) => s.addScore);
  const addCoins = useGameStore((s) => s.addCoins);
  const setDistance = useGameStore((s) => s.setDistance);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const setBoostMeter = useGameStore((s) => s.setBoostMeter);
  const setIsBoosting = useGameStore((s) => s.setIsBoosting);
  const setIsOnGround = useGameStore((s) => s.setIsOnGround);
  const setIsCrashed = useGameStore((s) => s.setIsCrashed);
  const endGame = useGameStore((s) => s.endGame);
  const addTrickPopup = useGameStore((s) => s.addTrickPopup);
  const incrementCombo = useGameStore((s) => s.incrementCombo);
  const phase = useGameStore((s) => s.phase);
  const difficulty = useGameStore((s) => s.difficulty);

  // Skins
  const selectedBoard = useProgressStore((s) => s.selectedBoard);
  const selectedCharacter = useProgressStore((s) => s.selectedCharacter);
  const boardSkin = BOARD_SKINS.find((b) => b.id === selectedBoard) || BOARD_SKINS[0];
  const charSkin = CHARACTER_SKINS.find((c) => c.id === selectedCharacter) || CHARACTER_SKINS[0];

  // Reset on game start
  useEffect(() => {
    if (phase === 'playing') {
      position.current.set(0, 2, 0);
      velocity.current.set(0, 0, -PLAYER.INITIAL_SPEED);
      currentSpeed.current = PLAYER.INITIAL_SPEED;
      verticalVelocity.current = 0;
      isOnGround.current = true;
      jumpCharge.current = 0;
      turnAngle.current = 0;
      boardTilt.current = 0;
      bodyLean.current = 0;
      boostTimer.current = 0;
      crashTimer.current = 0;
      isCrashed.current = false;
      airTime.current = 0;
      airRotation.current = 0;
      wasOnGround.current = true;
      distanceTraveled.current = 0;
      trailPositions.current = [];
      collectedCoins.current.clear();
    }
  }, [phase, collectedCoins]);

  useFrame((_, delta) => {
    if (phase !== 'playing' || !groupRef.current) return;

    const dt = Math.min(delta, 0.05); // Cap delta
    updateInput();
    const input = inputRef.current;

    // ─── Crash Recovery ────────────────────────────────────
    if (isCrashed.current) {
      crashTimer.current -= dt;
      if (crashTimer.current <= 0) {
        isCrashed.current = false;
        setIsCrashed(false);
        currentSpeed.current = PLAYER.INITIAL_SPEED * 0.5;
      } else {
        // Slide forward slowly during crash
        position.current.z -= currentSpeed.current * 0.3 * dt;
        const groundY = getTerrainHeight(position.current.x, position.current.z, difficulty);
        position.current.y = groundY + PLAYER.GROUND_Y_OFFSET;
        updateVisuals(dt);
        return;
      }
    }

    // ─── Speed / Difficulty ────────────────────────────────
    const targetSpeed = Math.min(
      PLAYER.MAX_SPEED,
      PLAYER.INITIAL_SPEED + distanceTraveled.current * DIFFICULTY.SPEED_INCREASE_RATE * 3,
    );
    currentSpeed.current = lerp(currentSpeed.current, targetSpeed, dt * 0.5);

    const speedMultiplier = boostTimer.current > 0 ? PLAYER.BOOST_MULTIPLIER : 1;
    const effectiveSpeed = currentSpeed.current * speedMultiplier;

    // ─── Turning ───────────────────────────────────────────
    const turnInput = input.turnAxis;
    const turnSpeed = Math.abs(turnInput) > 0.7 ? PLAYER.DRIFT_TURN_SPEED : PLAYER.TURN_SPEED;
    const airMultiplier = isOnGround.current ? 1 : PLAYER.AIR_CONTROL;
    turnAngle.current = damp(turnAngle.current, turnInput * turnSpeed * airMultiplier, 8, dt);

    // ─── Movement ──────────────────────────────────────────
    position.current.x += turnAngle.current * effectiveSpeed * dt * 15;
    position.current.x = clamp(position.current.x, -TERRAIN.CHUNK_WIDTH * 0.45, TERRAIN.CHUNK_WIDTH * 0.45);
    position.current.z -= effectiveSpeed * dt;

    // ─── Ground check ──────────────────────────────────────
    const groundY = getTerrainHeight(position.current.x, position.current.z, difficulty);
    const targetY = groundY + PLAYER.GROUND_Y_OFFSET;

    // ─── Jump ──────────────────────────────────────────────
    if (input.jumpHeld && isOnGround.current && !isCrashed.current) {
      jumpCharge.current = Math.min(jumpCharge.current + dt * PLAYER.JUMP_CHARGE_RATE, PLAYER.MAX_JUMP_CHARGE);
    }

    if (!input.jumpHeld && jumpCharge.current > 0 && isOnGround.current) {
      verticalVelocity.current = PLAYER.JUMP_FORCE * (0.5 + jumpCharge.current * 0.5);
      isOnGround.current = false;
      setIsOnGround(false);
      jumpCharge.current = 0;
      airTime.current = 0;
      airRotation.current = 0;
      audioManager.playJump();
    }

    // ─── Vertical Physics ──────────────────────────────────
    if (!isOnGround.current) {
      verticalVelocity.current += PLAYER.GRAVITY * dt;
      position.current.y += verticalVelocity.current * dt;
      airTime.current += dt;

      // Trick rotation in air
      if (input.trick) {
        airRotation.current += dt * 360;
      }

      // Landing
      if (position.current.y <= targetY) {
        position.current.y = targetY;
        verticalVelocity.current = 0;
        isOnGround.current = true;
        setIsOnGround(true);
        wasOnGround.current = true;

        // Score tricks
        if (airTime.current > 0.3) {
          scoreTricks();
          audioManager.playLand();
        }
        airTime.current = 0;
        airRotation.current = 0;
      }
    } else {
      position.current.y = damp(position.current.y, targetY, 15, dt);
      verticalVelocity.current = 0;
    }

    // ─── Boost ─────────────────────────────────────────────
    if (boostTimer.current > 0) {
      boostTimer.current -= dt;
      if (boostTimer.current <= 0) {
        setIsBoosting(false);
      }
    }
    setBoostMeter(clamp(boostTimer.current / PLAYER.BOOST_DURATION, 0, 1));

    if (input.boost && boostTimer.current > 0) {
      setIsBoosting(true);
    }

    // ─── Distance / Score ──────────────────────────────────
    distanceTraveled.current = Math.abs(position.current.z);
    setDistance(distanceTraveled.current);
    setSpeed(effectiveSpeed);

    const diffLevel = Math.min(1, distanceTraveled.current / 3000);
    setDifficulty(diffLevel);

    addScore(effectiveSpeed * dt * SCORING.DISTANCE_MULTIPLIER);

    // ─── Collision Detection ───────────────────────────────
    checkCollisions();

    // ─── Coin Collection ───────────────────────────────────
    // Handled by coin components checking proximity

    // ─── Update Refs ───────────────────────────────────────
    playerPositionRef.current.copy(position.current);
    playerZRef.current = position.current.z;

    // ─── Trail ─────────────────────────────────────────────
    if (isOnGround.current) {
      trailPositions.current.push(position.current.clone());
      if (trailPositions.current.length > 100) {
        trailPositions.current.shift();
      }
    }

    // ─── Audio ─────────────────────────────────────────────
    audioManager.updateWindIntensity(effectiveSpeed);
    audioManager.updateCarvingIntensity(turnAngle.current, effectiveSpeed);

    // ─── Visuals ───────────────────────────────────────────
    updateVisuals(dt);
  });

  const scoreTricks = useCallback(() => {
    const rotation = Math.abs(airRotation.current);
    let trickName = '';
    let trickScore = 0;

    if (rotation >= 640) {
      trickName = '720° Spin!';
      trickScore = SCORING.SPIN_720;
    } else if (rotation >= 460) {
      trickName = '540° Spin!';
      trickScore = SCORING.SPIN_540;
    } else if (rotation >= 280) {
      trickName = '360° Spin!';
      trickScore = SCORING.SPIN_360;
    } else if (rotation >= 120) {
      trickName = '180° Spin!';
      trickScore = SCORING.SPIN_180;
    }

    if (airTime.current > 1.0) {
      trickName = trickName ? trickName : 'Big Air!';
      trickScore += SCORING.TRICK_BASE * Math.floor(airTime.current);
    }

    if (trickScore > 0) {
      addTrickPopup(trickName, trickScore);
      addScore(trickScore);
      incrementCombo();
      boostTimer.current = Math.min(boostTimer.current + 1, PLAYER.BOOST_DURATION);
      setIsBoosting(true);
      audioManager.playTrickComplete();
    }
  }, [addTrickPopup, addScore, incrementCombo, setIsBoosting]);

  const checkCollisions = useCallback(() => {
    // Simple distance-based collision with obstacles
    // The player's effective collision radius
    const playerRadius = 0.8;
    const px = position.current.x;
    const pz = position.current.z;

    // Check bounds
    if (Math.abs(px) > TERRAIN.CHUNK_WIDTH * 0.48) {
      triggerCrash();
    }
  }, []);

  const triggerCrash = useCallback(() => {
    if (isCrashed.current) return;
    isCrashed.current = true;
    crashTimer.current = PLAYER.CRASH_RECOVERY_TIME;
    setIsCrashed(true);
    audioManager.playCrash();
    currentSpeed.current *= 0.5;
  }, [setIsCrashed]);

  const updateVisuals = (dt: number) => {
    if (!groupRef.current || !boardRef.current || !bodyRef.current) return;

    // Position
    groupRef.current.position.copy(position.current);

    // Board tilt on turn
    const targetTilt = -turnAngle.current * PLAYER.TURN_TILT_ANGLE * 15;
    boardTilt.current = damp(boardTilt.current, targetTilt, 8, dt);
    boardRef.current.rotation.z = boardTilt.current;

    // Body lean
    const targetLean = -turnAngle.current * 0.3 * 15;
    bodyLean.current = damp(bodyLean.current, targetLean, 6, dt);
    bodyRef.current.rotation.z = bodyLean.current * 0.5;

    // Jump squat
    if (jumpCharge.current > 0) {
      bodyRef.current.position.y = -jumpCharge.current * 0.3;
    } else {
      bodyRef.current.position.y = damp(bodyRef.current.position.y, 0, 10, dt);
    }

    // Air trick rotation
    if (!isOnGround.current && airRotation.current > 0) {
      bodyRef.current.rotation.x = (airRotation.current % 360) * (Math.PI / 180);
    } else {
      bodyRef.current.rotation.x = damp(bodyRef.current.rotation.x, 0, 8, dt);
    }

    // Crash visual
    if (isCrashed.current) {
      groupRef.current.rotation.x = Math.sin(crashTimer.current * 10) * 0.5;
      groupRef.current.rotation.z = Math.cos(crashTimer.current * 8) * 0.3;
    } else {
      groupRef.current.rotation.x = damp(groupRef.current.rotation.x, 0, 5, dt);
      groupRef.current.rotation.z = damp(groupRef.current.rotation.z, boardTilt.current * 0.3, 5, dt);
    }
  };

  if (phase !== 'playing') return null;

  return (
    <>
      <group ref={groupRef}>
        {/* Board */}
        <group ref={boardRef} position={[0, -0.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.06, 1.6]} />
            <meshStandardMaterial
              color={boardSkin.color}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
          {/* Board edge details */}
          <mesh position={[0, 0.035, 0]}>
            <boxGeometry args={[0.32, 0.015, 1.55]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.2} />
          </mesh>
        </group>

        {/* Body */}
        <group ref={bodyRef} position={[0, 0.4, 0]}>
          {/* Legs */}
          <mesh position={[-0.1, 0, 0.15]} castShadow>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial color={charSkin.pantsColor} roughness={0.8} />
          </mesh>
          <mesh position={[0.1, 0, -0.15]} castShadow>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial color={charSkin.pantsColor} roughness={0.8} />
          </mesh>

          {/* Torso */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.4, 0.45, 0.25]} />
            <meshStandardMaterial color={charSkin.jacketColor} roughness={0.7} />
          </mesh>

          {/* Arms */}
          <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color={charSkin.jacketColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color={charSkin.jacketColor} roughness={0.7} />
          </mesh>

          {/* Head */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color={COLORS.PLAYER_SKIN} roughness={0.8} />
          </mesh>

          {/* Helmet/Hat */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <sphereGeometry args={[0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={charSkin.jacketColor} roughness={0.6} />
          </mesh>

          {/* Goggles */}
          <mesh position={[0, 0.92, 0.14]} castShadow>
            <boxGeometry args={[0.24, 0.06, 0.05]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.5} />
          </mesh>
        </group>

        {/* Speed lines effect when boosting */}
        {boostTimer.current > 0 && (
          <group>
            <mesh position={[-0.5, 0.5, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 2, 4]} />
              <meshBasicMaterial color={COLORS.BOOST_ORANGE} transparent opacity={0.5} />
            </mesh>
            <mesh position={[0.5, 0.5, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 2, 4]} />
              <meshBasicMaterial color={COLORS.BOOST_ORANGE} transparent opacity={0.5} />
            </mesh>
          </group>
        )}
      </group>

      {/* Snow Trail */}
      <SnowTrail playerPosition={position} isOnGround={isOnGround} turnAngle={turnAngle} />
    </>
  );
};

export default Player;
