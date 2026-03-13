import { useEffect, useRef, useState } from 'react';
import { Game, UIState } from './game/Game';
import { Overlay } from './ui/Overlay';

export default function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [ui, setUI] = useState<UIState>({ selectedBlock: 1, paused: false });

  useEffect(() => {
    if (!hostRef.current) return;
    const game = new Game(hostRef.current, setUI);
    gameRef.current = game;
    game.start();

    const onUnload = () => game.persist();
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('beforeunload', onUnload);
      game.persist();
      game.dispose();
    };
  }, []);

  return (
    <div className="app-root">
      <div ref={hostRef} className="game-host" />
      <Overlay selectedBlock={ui.selectedBlock} paused={ui.paused} />
    </div>
  );
}
