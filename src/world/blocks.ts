export enum BlockId {
  Air = 0,
  Grass = 1,
  Dirt = 2,
  Stone = 3,
  Sand = 4,
  Wood = 5
}

export type BlockDef = {
  id: BlockId;
  name: string;
  color: number;
};

export const BLOCKS: BlockDef[] = [
  { id: BlockId.Air, name: 'Air', color: 0x000000 },
  { id: BlockId.Grass, name: 'Grass', color: 0x4caf50 },
  { id: BlockId.Dirt, name: 'Dirt', color: 0x8d6e63 },
  { id: BlockId.Stone, name: 'Stone', color: 0x9e9e9e },
  { id: BlockId.Sand, name: 'Sand', color: 0xffe082 },
  { id: BlockId.Wood, name: 'Wood', color: 0x8d5a2b }
];

export const PLACEABLE_BLOCKS = [
  BlockId.Grass,
  BlockId.Dirt,
  BlockId.Stone,
  BlockId.Sand,
  BlockId.Wood
];
