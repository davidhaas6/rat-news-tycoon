import { useEffect } from 'react';
import { useGame } from '../stores/useGame';

export const useGameLoop = () => {
  const advance = useGame(s => s.advance);
  const speed = useGame(s => s.tickSpeed);
  const paused = useGame(s => s.paused);

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused) {
        advance(speed);
      }
    }, 1000);   // 1 sec = 1 hr
    return () => clearInterval(id);
  }, [advance, speed, paused]);
};
