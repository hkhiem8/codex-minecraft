import { CHUNK_SIZE } from '../world/constants';

export type ChunkCoord = { cx: number; cz: number };

export function floorDiv(n: number, d: number): number {
  return Math.floor(n / d);
}

export function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

export function worldToChunk(x: number, z: number): ChunkCoord {
  return {
    cx: floorDiv(Math.floor(x), CHUNK_SIZE),
    cz: floorDiv(Math.floor(z), CHUNK_SIZE)
  };
}

export function worldToLocal(x: number, y: number, z: number) {
  return {
    lx: mod(Math.floor(x), CHUNK_SIZE),
    ly: Math.floor(y),
    lz: mod(Math.floor(z), CHUNK_SIZE)
  };
}

export function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

export function parseChunkKey(key: string): ChunkCoord {
  const [cx, cz] = key.split(',').map(Number);
  return { cx, cz };
}
