import { useEffect } from 'react';
import { useGame } from '../stores/useGame';

export const useGameLoop = () => {
  const advance = useGame(s => s.advance);
  useEffect(() => {
    const id = setInterval(() => advance(1), 1000);   // 1 sec = 1 hr
    return () => clearInterval(id);
  }, [advance]);
};
