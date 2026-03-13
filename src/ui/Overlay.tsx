import { BLOCKS, PLACEABLE_BLOCKS } from '../world/blocks';

type Props = {
  selectedBlock: number;
  paused: boolean;
};

export function Overlay({ selectedBlock, paused }: Props) {
  return (
    <div className="overlay-root">
      <div className="crosshair">+</div>
      <div className="hotbar">
        {PLACEABLE_BLOCKS.map((id, idx) => (
          <div key={id} className={`slot ${selectedBlock === id ? 'selected' : ''}`}>
            <span>{idx + 1}</span>
            <span>{BLOCKS[id].name}</span>
          </div>
        ))}
      </div>
      {paused && (
        <div className="pause-panel">
          <h3>Paused</h3>
          <p>Click game window to capture mouse.</p>
          <p>WASD move, Space jump, Left click mine, Right click place.</p>
          <p>1-5 change block. Press P to save. Esc toggles pause.</p>
        </div>
      )}
    </div>
  );
}
