import * as THREE from 'three';
import { MAX_STEP, PLAYER_HEIGHT, PLAYER_RADIUS } from '../world/constants';
import { BlockId } from '../world/blocks';
import { VoxelWorld } from '../world/world';

function isSolid(world: VoxelWorld, x: number, y: number, z: number): boolean {
  return world.getBlock(x, y, z) !== BlockId.Air;
}

function collides(world: VoxelWorld, pos: THREE.Vector3): boolean {
  const minX = Math.floor(pos.x - PLAYER_RADIUS);
  const maxX = Math.floor(pos.x + PLAYER_RADIUS);
  const minY = Math.floor(pos.y);
  const maxY = Math.floor(pos.y + PLAYER_HEIGHT);
  const minZ = Math.floor(pos.z - PLAYER_RADIUS);
  const maxZ = Math.floor(pos.z + PLAYER_RADIUS);

  for (let y = minY; y <= maxY; y += 1) {
    for (let z = minZ; z <= maxZ; z += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (isSolid(world, x, y, z)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function resolveMotion(world: VoxelWorld, position: THREE.Vector3, delta: THREE.Vector3) {
  const next = position.clone();

  const dx = Math.sign(delta.x) * Math.min(Math.abs(delta.x), MAX_STEP);
  const dy = Math.sign(delta.y) * Math.min(Math.abs(delta.y), MAX_STEP);
  const dz = Math.sign(delta.z) * Math.min(Math.abs(delta.z), MAX_STEP);

  const steps = Math.ceil(Math.max(Math.abs(delta.x), Math.abs(delta.y), Math.abs(delta.z)) / MAX_STEP);
  let grounded = false;

  for (let i = 0; i < steps; i += 1) {
    if (dx !== 0) {
      const tryX = next.clone();
      tryX.x += dx;
      if (!collides(world, tryX)) next.x += dx;
    }
    if (dz !== 0) {
      const tryZ = next.clone();
      tryZ.z += dz;
      if (!collides(world, tryZ)) next.z += dz;
    }
    if (dy !== 0) {
      const tryY = next.clone();
      tryY.y += dy;
      if (!collides(world, tryY)) {
        next.y += dy;
      } else if (delta.y < 0) {
        grounded = true;
      }
    }
  }

  return { position: next, grounded };
}
