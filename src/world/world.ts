import { chunkKey, parseChunkKey, worldToChunk, worldToLocal } from '../utils/coords';
import { BlockId } from './blocks';
import { Chunk } from './chunk';
import { CHUNK_SIZE, LOAD_RADIUS, WORLD_HEIGHT } from './constants';
import { TerrainGenerator } from './terrain';

export type BlockMod = { x: number; y: number; z: number; id: BlockId };

export class VoxelWorld {
  readonly chunks = new Map<string, Chunk>();
  readonly modifications = new Map<string, BlockId>();
  readonly terrain: TerrainGenerator;

  constructor(public readonly seed: number) {
    this.terrain = new TerrainGenerator(seed);
  }

  loadAround(px: number, pz: number): { loaded: string[]; unloaded: string[] } {
    const center = worldToChunk(px, pz);
    const needed = new Set<string>();
    for (let dz = -LOAD_RADIUS; dz <= LOAD_RADIUS; dz += 1) {
      for (let dx = -LOAD_RADIUS; dx <= LOAD_RADIUS; dx += 1) {
        const key = chunkKey(center.cx + dx, center.cz + dz);
        needed.add(key);
        if (!this.chunks.has(key)) {
          this.chunks.set(key, this.generateChunk(center.cx + dx, center.cz + dz));
        }
      }
    }

    const unloaded: string[] = [];
    for (const key of this.chunks.keys()) {
      if (!needed.has(key)) {
        this.chunks.delete(key);
        unloaded.push(key);
      }
    }

    return { loaded: [...needed], unloaded };
  }

  generateChunk(cx: number, cz: number): Chunk {
    const chunk = new Chunk(cx, cz);
    for (let z = 0; z < CHUNK_SIZE; z += 1) {
      for (let x = 0; x < CHUNK_SIZE; x += 1) {
        const wx = cx * CHUNK_SIZE + x;
        const wz = cz * CHUNK_SIZE + z;
        for (let y = 0; y < WORLD_HEIGHT; y += 1) {
          const worldBlock = this.getModified(wx, y, wz);
          if (worldBlock !== undefined) {
            chunk.set(x, y, z, worldBlock);
          } else {
            chunk.set(x, y, z, this.terrain.getBlock(wx, y, wz));
          }
        }
      }
    }
    chunk.dirty = true;
    return chunk;
  }

  getModified(x: number, y: number, z: number): BlockId | undefined {
    return this.modifications.get(`${x},${y},${z}`) as BlockId | undefined;
  }

  getBlock(x: number, y: number, z: number): BlockId {
    const local = worldToLocal(x, y, z);
    const cc = worldToChunk(x, z);
    const chunk = this.chunks.get(chunkKey(cc.cx, cc.cz));
    if (!chunk) {
      const modified = this.getModified(x, y, z);
      return modified ?? this.terrain.getBlock(x, y, z);
    }
    return chunk.get(local.lx, local.ly, local.lz);
  }

  setBlock(x: number, y: number, z: number, id: BlockId): void {
    this.modifications.set(`${x},${y},${z}`, id);
    const cc = worldToChunk(x, z);
    const key = chunkKey(cc.cx, cc.cz);
    const chunk = this.chunks.get(key);
    if (chunk) {
      const local = worldToLocal(x, y, z);
      chunk.set(local.lx, local.ly, local.lz, id);
    }

    const local = worldToLocal(x, y, z);
    if (local.lx === 0) {
      this.markDirty(cc.cx - 1, cc.cz);
    }
    if (local.lx === CHUNK_SIZE - 1) {
      this.markDirty(cc.cx + 1, cc.cz);
    }
    if (local.lz === 0) {
      this.markDirty(cc.cx, cc.cz - 1);
    }
    if (local.lz === CHUNK_SIZE - 1) {
      this.markDirty(cc.cx, cc.cz + 1);
    }
  }

  private markDirty(cx: number, cz: number): void {
    const chunk = this.chunks.get(chunkKey(cx, cz));
    if (chunk) {
      chunk.dirty = true;
    }
  }

  serializeMods(): BlockMod[] {
    const mods: BlockMod[] = [];
    for (const [key, id] of this.modifications) {
      const [x, y, z] = key.split(',').map(Number);
      mods.push({ x, y, z, id });
    }
    return mods;
  }

  loadMods(mods: BlockMod[]): void {
    this.modifications.clear();
    for (const mod of mods) {
      this.modifications.set(`${mod.x},${mod.y},${mod.z}`, mod.id);
    }
    for (const key of this.chunks.keys()) {
      const { cx, cz } = parseChunkKey(key);
      this.chunks.set(key, this.generateChunk(cx, cz));
    }
  }
}
