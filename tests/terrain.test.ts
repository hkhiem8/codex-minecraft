import { describe, expect, it } from 'vitest';
import { TerrainGenerator } from '../src/world/terrain';

describe('terrain generator', () => {
  it('is deterministic for same seed', () => {
    const a = new TerrainGenerator(123);
    const b = new TerrainGenerator(123);
    expect(a.getHeight(44, -27)).toBe(b.getHeight(44, -27));
  });

  it('varies by position', () => {
    const t = new TerrainGenerator(123);
    expect(t.getHeight(10, 10)).not.toBe(t.getHeight(100, 100));
  });
});
