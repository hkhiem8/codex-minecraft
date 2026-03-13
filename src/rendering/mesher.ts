import * as THREE from 'three';
import { BLOCKS, BlockId } from '../world/blocks';
import { Chunk } from '../world/chunk';
import { CHUNK_SIZE, WORLD_HEIGHT } from '../world/constants';
import { VoxelWorld } from '../world/world';

const FACES = [
  { dir: [1, 0, 0], verts: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], shade: 0.85 },
  { dir: [-1, 0, 0], verts: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], shade: 0.7 },
  { dir: [0, 1, 0], verts: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], shade: 1.0 },
  { dir: [0, -1, 0], verts: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], shade: 0.55 },
  { dir: [0, 0, 1], verts: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], shade: 0.8 },
  { dir: [0, 0, -1], verts: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], shade: 0.75 }
] as const;

export function buildChunkMesh(world: VoxelWorld, chunk: Chunk): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let indexCursor = 0;

  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let z = 0; z < CHUNK_SIZE; z += 1) {
      for (let x = 0; x < CHUNK_SIZE; x += 1) {
        const block = chunk.get(x, y, z);
        if (block === BlockId.Air) continue;

        const wx = chunk.cx * CHUNK_SIZE + x;
        const wz = chunk.cz * CHUNK_SIZE + z;
        const color = new THREE.Color(BLOCKS[block].color);

        for (const face of FACES) {
          const nx = wx + face.dir[0];
          const ny = y + face.dir[1];
          const nz = wz + face.dir[2];
          if (world.getBlock(nx, ny, nz) !== BlockId.Air) continue;

          for (const v of face.verts) {
            positions.push(wx + v[0], y + v[1], wz + v[2]);
            normals.push(face.dir[0], face.dir[1], face.dir[2]);
            colors.push(color.r * face.shade, color.g * face.shade, color.b * face.shade);
          }

          indices.push(indexCursor, indexCursor + 1, indexCursor + 2);
          indices.push(indexCursor, indexCursor + 2, indexCursor + 3);
          indexCursor += 4;
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}
