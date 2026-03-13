import { describe, expect, it } from 'vitest';
import { BlockId } from '../src/world/blocks';
import { VoxelWorld } from '../src/world/world';

describe('world persistence', () => {
  it('serializes and loads block modifications', () => {
    const worldA = new VoxelWorld(42);
    worldA.setBlock(1, 2, 3, BlockId.Wood);
    worldA.setBlock(-5, 8, 4, BlockId.Air);

    const mods = worldA.serializeMods();
    const worldB = new VoxelWorld(42);
    worldB.loadMods(mods);

    expect(worldB.getModified(1, 2, 3)).toBe(BlockId.Wood);
    expect(worldB.getModified(-5, 8, 4)).toBe(BlockId.Air);
  });
});
