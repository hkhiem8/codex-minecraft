import { describe, expect, it } from 'vitest';
import { chunkKey, parseChunkKey, worldToChunk, worldToLocal } from '../src/utils/coords';

describe('coords', () => {
  it('maps negative world positions to chunk coordinates', () => {
    expect(worldToChunk(-1, -1)).toEqual({ cx: -1, cz: -1 });
    expect(worldToChunk(16, 0)).toEqual({ cx: 1, cz: 0 });
  });

  it('converts world to local coordinates', () => {
    expect(worldToLocal(-1, 5, -1)).toEqual({ lx: 15, ly: 5, lz: 15 });
  });

  it('roundtrips chunk keys', () => {
    const key = chunkKey(3, -2);
    expect(parseChunkKey(key)).toEqual({ cx: 3, cz: -2 });
  });
});
