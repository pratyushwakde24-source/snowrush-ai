// ============================================================
// SnowRush — Utility Constants
// ============================================================

export const PLAYER = {
  INITIAL_SPEED: 12,
  MAX_SPEED: 45,
  ACCELERATION: 0.008,
  SLOPE_ACCELERATION: 0.15,
  TURN_SPEED: 0.065,
  DRIFT_TURN_SPEED: 0.09,
  DECELERATION: 0.97,
  TURN_TILT_ANGLE: 0.35,
  JUMP_FORCE: 8,
  MAX_JUMP_CHARGE: 1.2,
  JUMP_CHARGE_RATE: 3.5,
  AIR_CONTROL: 0.4,
  GRAVITY: -22,
  GROUND_Y_OFFSET: 0.5,
  BOOST_MULTIPLIER: 1.6,
  BOOST_DURATION: 2.5,
  CRASH_RECOVERY_TIME: 1.5,
  LANE_WIDTH: 8,
  COIN_MAGNET_RANGE: 3,
  COIN_MAGNET_SPEED: 15,
  NEAR_MISS_DISTANCE: 1.5,
} as const;

export const TERRAIN = {
  CHUNK_DEPTH: 50,
  CHUNK_WIDTH: 30,
  CHUNKS_AHEAD: 4,
  CHUNKS_BEHIND: 1,
  SEGMENTS_X: 30,
  SEGMENTS_Z: 50,
  NOISE_SCALE: 0.04,
  NOISE_AMPLITUDE: 3,
  SLOPE_ANGLE: 0.25,
  MAX_SLOPE_ANGLE: 0.55,
  PATH_WIDTH: 10,
} as const;

export const CAMERA = {
  OFFSET: [0, 5, 10] as const,
  LOOK_OFFSET: [0, 0, -8] as const,
  FOLLOW_SPEED: 4,
  ROTATION_FOLLOW: 3,
  FOV_BASE: 60,
  FOV_SPEED_MULTIPLIER: 0.3,
  FOV_MAX: 85,
  SHAKE_SPEED_THRESHOLD: 25,
  SHAKE_INTENSITY: 0.02,
} as const;

export const OBSTACLES = {
  MIN_SPACING: 8,
  BASE_DENSITY: 0.15,
  MAX_DENSITY: 0.45,
  TYPES: ['tree', 'rock', 'log', 'ice'] as const,
} as const;

export const COINS = {
  BASE_VALUE: 10,
  LINE_SPACING: 3,
  LINE_COUNT: 5,
  ARC_HEIGHT: 3,
  ROTATION_SPEED: 2,
  COLLECT_DISTANCE: 1.8,
  SPAWN_CHANCE: 0.4,
} as const;

export const SCORING = {
  DISTANCE_MULTIPLIER: 1,
  SPEED_BONUS: 0.5,
  TRICK_BASE: 100,
  COMBO_MULTIPLIER: 0.5,
  PERFECT_LANDING_BONUS: 200,
  NEAR_MISS_BONUS: 50,
  SPIN_180: 150,
  SPIN_360: 350,
  SPIN_540: 600,
  SPIN_720: 1000,
  FLIP: 500,
  GRAB: 200,
} as const;

export const DIFFICULTY = {
  SPEED_INCREASE_RATE: 0.0003,
  OBSTACLE_INCREASE_RATE: 0.00008,
  SLOPE_INCREASE_RATE: 0.00005,
  DISTANCE_THRESHOLDS: [100, 300, 600, 1000, 1500, 2500] as const,
} as const;

export const COLORS = {
  SNOW_WHITE: '#f0f4ff',
  SNOW_SHADOW: '#b8d4e8',
  SNOW_BLUE: '#8eb8d4',
  SKY_TOP: '#1a1a3e',
  SKY_BOTTOM: '#4a6fa5',
  SUN: '#ffe4b5',
  TREE_GREEN: '#1a5c3a',
  TREE_DARK: '#0d3d24',
  TREE_SNOW: '#e8f0f8',
  ROCK_GRAY: '#6b7b8d',
  ROCK_DARK: '#4a5568',
  COIN_GOLD: '#ffd700',
  COIN_GLOW: '#ffed4a',
  ICE_BLUE: '#74c0fc',
  BOARD_DEFAULT: '#2563eb',
  PLAYER_JACKET: '#ef4444',
  PLAYER_PANTS: '#1e293b',
  PLAYER_SKIN: '#fbbf7a',
  TRAIL_COLOR: '#c8ddf0',
  PARTICLE_SNOW: '#ffffff',
  FOG_COLOR: '#a8c4d8',
  BOOST_ORANGE: '#f97316',
} as const;

export const QUALITY = {
  LOW: {
    shadowMapSize: 512,
    particleCount: 50,
    terrainSegments: 15,
    enableBloom: false,
    enableAO: false,
    treeInstances: 20,
    pixelRatio: 0.75,
  },
  MEDIUM: {
    shadowMapSize: 1024,
    particleCount: 150,
    terrainSegments: 25,
    enableBloom: true,
    enableAO: false,
    treeInstances: 50,
    pixelRatio: 1,
  },
  HIGH: {
    shadowMapSize: 2048,
    particleCount: 300,
    terrainSegments: 35,
    enableBloom: true,
    enableAO: true,
    treeInstances: 100,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  },
} as const;
