import { BlockId } from './blocks';
import { CHUNK_SIZE, WORLD_HEIGHT } from './constants';

export class Chunk {
  readonly blocks: Uint8Array;
  dirty = true;

  constructor(
    public readonly cx: number,
    public readonly cz: number
  ) {
    this.blocks = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);
  }

  index(x: number, y: number, z: number): number {
    return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
  }

  get(x: number, y: number, z: number): BlockId {
    if (x < 0 || z < 0 || y < 0 || x >= CHUNK_SIZE || z >= CHUNK_SIZE || y >= WORLD_HEIGHT) {
      return BlockId.Air;
    }
    return this.blocks[this.index(x, y, z)] as BlockId;
  }

  set(x: number, y: number, z: number, id: BlockId): void {
    if (x < 0 || z < 0 || y < 0 || x >= CHUNK_SIZE || z >= CHUNK_SIZE || y >= WORLD_HEIGHT) {
      return;
    }
    this.blocks[this.index(x, y, z)] = id;
    this.dirty = true;
  }
}
