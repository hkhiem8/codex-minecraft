import * as THREE from 'three';
import { BlockMod } from '../world/world';

export type SaveState = {
  seed: number;
  playerPosition: [number, number, number];
  yaw: number;
  pitch: number;
  selectedBlock: number;
  mods: BlockMod[];
};

const STORAGE_KEY = 'voxel_sandbox_save_v1';

export function saveGame(state: SaveState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGame(): SaveState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveState;
  } catch {
    return null;
  }
}

export function defaultSave(seed: number): SaveState {
  return {
    seed,
    playerPosition: [0, 40, 0],
    yaw: 0,
    pitch: 0,
    selectedBlock: 1,
    mods: []
  };
}

export function vecToTuple(v: THREE.Vector3): [number, number, number] {
  return [v.x, v.y, v.z];
}
