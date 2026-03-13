import * as THREE from 'three';
import { BlockId } from '../world/blocks';
import { VoxelWorld } from '../world/world';

export type RaycastHit = {
  block: THREE.Vector3;
  normal: THREE.Vector3;
};

export function voxelRaycast(
  world: VoxelWorld,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  maxDistance = 8
): RaycastHit | null {
  const pos = origin.clone();
  const step = direction.clone().normalize().multiplyScalar(0.05);
  let last = new THREE.Vector3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));

  for (let traveled = 0; traveled <= maxDistance; traveled += 0.05) {
    pos.add(step);
    const current = new THREE.Vector3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
    if (current.equals(last)) continue;

    if (world.getBlock(current.x, current.y, current.z) !== BlockId.Air) {
      const normal = last.clone().sub(current).clampScalar(-1, 1);
      return { block: current, normal };
    }
    last = current;
  }

  return null;
}
