import { useState, useEffect, useCallback } from 'react';
import type { GameData } from '@/types';
import { loadGameData, saveGameData } from '@/engine/storage';

export function useGameData() {
  const [data, setData] = useState<GameData>(() => loadGameData());

  const update = useCallback((updater: (prev: GameData) => GameData) => {
    setData((prev) => {
      const next = updater(prev);
      saveGameData(next);
      return next;
    });
  }, []);

  useEffect(() => {
    saveGameData(data);
  }, [data]);

  return { data, update, setData };
}
