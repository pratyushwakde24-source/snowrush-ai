// ============================================================
// SnowRush — Terrain Manager (Chunk Pooling & Infinite Scroll)
// ============================================================

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import TerrainChunk from './TerrainChunk';
import { generateChunk, type ChunkData } from './TerrainGenerator';
import { Obstacles } from './Obstacles';
import { Coins } from './Coins';
import { Decorations } from '../environment/Decorations';
import { TERRAIN } from '../utils/constants';
import { useGameStore } from '../store/gameStore';

interface TerrainManagerProps {
  playerZ: React.MutableRefObject<number>;
  onCoinCollect: (id: string) => void;
  collectedCoins: React.MutableRefObject<Set<string>>;
}

const TerrainManager: React.FC<TerrainManagerProps> = ({
  playerZ,
  onCoinCollect,
  collectedCoins,
}) => {
  const chunksRef = useRef<Map<number, ChunkData>>(new Map());
  const lastChunkIndexRef = useRef(-1);
  const difficulty = useGameStore((s) => s.difficulty);

  const getOrCreateChunk = useCallback(
    (index: number): ChunkData => {
      if (!chunksRef.current.has(index)) {
        const chunk = generateChunk(index, difficulty);
        chunksRef.current.set(index, chunk);
      }
      return chunksRef.current.get(index)!;
    },
    [difficulty],
  );

  const activeChunks = useRef<ChunkData[]>([]);

  useFrame(() => {
    const pz = playerZ.current;
    const currentChunkIndex = Math.floor(-pz / TERRAIN.CHUNK_DEPTH);

    if (currentChunkIndex !== lastChunkIndexRef.current) {
      lastChunkIndexRef.current = currentChunkIndex;

      const newActive: ChunkData[] = [];
      for (
        let i = currentChunkIndex - TERRAIN.CHUNKS_BEHIND;
        i <= currentChunkIndex + TERRAIN.CHUNKS_AHEAD;
        i++
      ) {
        if (i < 0) continue;
        newActive.push(getOrCreateChunk(i));
      }

      // Clean up distant chunks to free memory
      const minKeep = currentChunkIndex - TERRAIN.CHUNKS_BEHIND - 1;
      chunksRef.current.forEach((_, key) => {
        if (key < minKeep) {
          chunksRef.current.delete(key);
        }
      });

      activeChunks.current = newActive;
    }
  });

  // Initial chunks
  const initialChunks = useMemo(() => {
    const chunks: ChunkData[] = [];
    for (let i = 0; i <= TERRAIN.CHUNKS_AHEAD; i++) {
      chunks.push(getOrCreateChunk(i));
    }
    activeChunks.current = chunks;
    return chunks;
  }, [getOrCreateChunk]);

  return (
    <group>
      <ChunkRenderer
        activeChunks={activeChunks}
        initialChunks={initialChunks}
        onCoinCollect={onCoinCollect}
        playerZ={playerZ}
        collectedCoins={collectedCoins}
      />
    </group>
  );
};

interface ChunkRendererProps {
  activeChunks: React.MutableRefObject<ChunkData[]>;
  initialChunks: ChunkData[];
  onCoinCollect: (id: string) => void;
  playerZ: React.MutableRefObject<number>;
  collectedCoins: React.MutableRefObject<Set<string>>;
}

const ChunkRenderer: React.FC<ChunkRendererProps> = ({
  activeChunks,
  initialChunks,
  onCoinCollect,
  playerZ,
  collectedCoins,
}) => {
  const renderChunks = useRef<ChunkData[]>(initialChunks);

  useFrame(() => {
    renderChunks.current = activeChunks.current;
  });

  // Force re-render when chunks change
  const [, setTick] = React.useState(0);
  const lastLength = useRef(0);
  useFrame(() => {
    if (activeChunks.current.length !== lastLength.current ||
        (activeChunks.current[0] && activeChunks.current[0].chunkIndex !== renderChunks.current[0]?.chunkIndex)) {
      lastLength.current = activeChunks.current.length;
      renderChunks.current = [...activeChunks.current];
      setTick((t) => t + 1);
    }
  });

  return (
    <>
      {renderChunks.current.map((chunk) => (
        <group key={`chunk-${chunk.chunkIndex}`}>
          <TerrainChunk data={chunk} />
          <Obstacles obstacles={chunk.obstacles} />
          <Coins
            coins={chunk.coins}
            playerZ={playerZ}
            onCollect={onCoinCollect}
            collectedCoins={collectedCoins}
          />
          <Decorations trees={chunk.trees} rocks={chunk.rocks} />
        </group>
      ))}
    </>
  );
};

export default TerrainManager;
