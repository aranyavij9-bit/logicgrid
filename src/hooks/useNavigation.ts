import { useState, useEffect } from 'react';
import type { Screen } from '@/types';

export function useNavigation(initial: Screen = 'home') {
  const [screen, setScreen] = useState<Screen>(initial);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [dailyMode, setDailyMode] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  function navigate(to: Screen) {
    setScreen(to);
  }

  function startChallenge(challengeId: string, isDaily = false) {
    setActiveChallengeId(challengeId);
    setDailyMode(isDaily);
    setScreen('game');
  }

  return { screen, navigate, activeChallengeId, startChallenge, dailyMode };
}
