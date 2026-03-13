import { fractalNoise2D } from '../utils/noise';
import { BlockId } from './blocks';
import { WORLD_HEIGHT } from './constants';

export class TerrainGenerator {
  constructor(private readonly seed: number) {}

  getHeight(x: number, z: number): number {
    const h1 = fractalNoise2D(x * 0.01, z * 0.01, this.seed);
    const h2 = fractalNoise2D(x * 0.03, z * 0.03, this.seed + 31);
    const base = 20 + h1 * 20 + h2 * 8;
    return Math.max(1, Math.min(WORLD_HEIGHT - 1, Math.floor(base)));
  }

  getBlock(x: number, y: number, z: number): BlockId {
    if (y < 0 || y >= WORLD_HEIGHT) {
      return BlockId.Air;
    }

    const height = this.getHeight(x, z);
    if (y > height) {
      return BlockId.Air;
    }
    if (y === height) {
      return height < 18 ? BlockId.Sand : BlockId.Grass;
    }
    if (y > height - 3) {
      return BlockId.Dirt;
    }
    return BlockId.Stone;
  }
}
