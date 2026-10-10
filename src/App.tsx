import { useCallback, useMemo } from 'react';
import type { Screen, GameData, Challenge, ChallengeRecord, ChallengeCategory, DailyResult, ExecutionResult, ScoreBreakdown } from '@/types';
import { useGameData } from '@/hooks/useGameData';
import { useNavigation } from '@/hooks/useNavigation';
import { useSound } from '@/hooks/useSound';
import { NavBar } from '@/components/NavBar';
import { HomeScreen } from '@/screens/HomeScreen';
import { CampaignScreen } from '@/screens/CampaignScreen';
import { DailyScreen } from '@/screens/DailyScreen';
import { LabScreen } from '@/screens/LabScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { StudentScreen } from '@/screens/StudentScreen';
import { AboutScreen } from '@/screens/AboutScreen';
import { HowItWorksScreen } from '@/screens/HowItWorksScreen';
import { GameScreen } from '@/components/GameScreen';
import { getChallengeById, getDailyChallenge, CAMPAIGN_CHAPTERS } from '@/engine/challenges';
import { calculateScore } from '@/engine/scoring';
import { checkAchievements, updateStatsForSolve } from '@/engine/storage';

function App() {
  const { data, update } = useGameData();
  const { screen, navigate, activeChallengeId, startChallenge, dailyMode } = useNavigation();
  const { play, soundEnabled, toggleSound } = useSound(data.settings.soundEnabled);

  const handleToggleSound = useCallback(() => {
    toggleSound();
    update((prev) => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } }));
  }, [toggleSound, update]);

  const handleContinue = useCallback(() => {
    // Find the first uncompleted challenge in campaign
    for (const chapter of CAMPAIGN_CHAPTERS) {
      for (const challengeId of chapter.challengeIds) {
        const record = data.records[challengeId];
        if (!record || !record.solved) {
          startChallenge(challengeId);
          return;
        }
      }
    }
    // All completed — go to campaign
    navigate('campaign');
  }, [data.records, startChallenge, navigate]);

  const activeChallenge = useMemo(() => {
    if (!activeChallengeId) return null;
    if (dailyMode) {
      const today = new Date();
      const daily = getDailyChallenge(today);
      return { ...daily, id: activeChallengeId };
    }
    return getChallengeById(activeChallengeId);
  }, [activeChallengeId, dailyMode]);

  const handleComplete = useCallback(
    (challenge: Challenge, result: ExecutionResult, score: ScoreBreakdown, hintsUsed: number) => {
      if (!result.success) return;

      update((prev) => {
        let next: GameData = { ...prev };

        // Update record
        const existing: ChallengeRecord | undefined = prev.records[challenge.id];
        const newRecord: ChallengeRecord = {
          challengeId: challenge.id,
          solved: true,
          bestScore: existing ? Math.max(existing.bestScore, score.total) : score.total,
          bestMoves: existing ? Math.min(existing.bestMoves, result.movesUsed) : result.movesUsed,
          bestEnergy: existing ? Math.max(existing.bestEnergy, result.energyRemaining) : result.energyRemaining,
          stars: existing ? Math.max(existing.stars, score.stars) : score.stars,
          attempts: existing ? existing.attempts + 1 : 1,
          hintsUsed: existing ? Math.min(existing.hintsUsed, hintsUsed) : hintsUsed,
          lastPlayed: Date.now(),
        };
        next = { ...next, records: { ...next.records, [challenge.id]: newRecord } };

        // Update stats
        const category = challenge.category as ChallengeCategory;
        next = updateStatsForSolve(next, challenge.id, category, score.total, result.movesUsed, score.efficiency, hintsUsed);

        // Update campaign progress — mark chapter completed if all challenges done
        for (const chapter of CAMPAIGN_CHAPTERS) {
          if (chapter.challengeIds.includes(challenge.id)) {
            const allDone = chapter.challengeIds.every((id) => next.records[id]?.solved);
            if (allDone) {
              next = { ...next, campaignProgress: { ...next.campaignProgress, [chapter.id]: true } };
              // Unlock next chapter
              const chapterIdx = CAMPAIGN_CHAPTERS.findIndex((c) => c.id === chapter.id);
              if (chapterIdx >= 0 && chapterIdx + 1 < CAMPAIGN_CHAPTERS.length) {
                const nextChapterId = CAMPAIGN_CHAPTERS[chapterIdx + 1].id;
                if (!next.unlockedChapters.includes(nextChapterId)) {
                  next = { ...next, unlockedChapters: [...next.unlockedChapters, nextChapterId] };
                }
              }
            }
          }
        }

        // Daily challenge result
        if (dailyMode) {
          const dateStr = new Date().toISOString().slice(0, 10);
          const existingDaily: DailyResult | undefined = next.dailyResults[dateStr];
          const dailyResult: DailyResult = {
            date: dateStr,
            challengeId: challenge.id,
            solved: true,
            score: existingDaily ? Math.max(existingDaily.score, score.total) : score.total,
            moves: existingDaily ? Math.min(existingDaily.moves, result.movesUsed) : result.movesUsed,
            efficiency: existingDaily ? Math.max(existingDaily.efficiency, score.efficiency) : score.efficiency,
            attempts: existingDaily ? existingDaily.attempts + 1 : 1,
          };
          next = { ...next, dailyResults: { ...next.dailyResults, [dateStr]: dailyResult } };
        }

        // Check achievements
        next = checkAchievements(next);

        return next;
      });
    },
    [update, dailyMode]
  );

  const handleNextChallenge = useCallback(() => {
    if (!activeChallengeId || dailyMode) {
      navigate('campaign');
      return;
    }
    // Find next challenge in campaign
    let foundCurrent = false;
    for (const chapter of CAMPAIGN_CHAPTERS) {
      for (const challengeId of chapter.challengeIds) {
        if (foundCurrent) {
          startChallenge(challengeId);
          return;
        }
        if (challengeId === activeChallengeId) {
          foundCurrent = true;
        }
      }
    }
    // No next challenge — go to campaign
    navigate('campaign');
  }, [activeChallengeId, dailyMode, navigate, startChallenge]);

  // Render current screen
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen data={data} onNavigate={navigate} onContinue={handleContinue} />;
      case 'campaign':
        return <CampaignScreen data={data} onNavigate={navigate} onStartChallenge={(id) => startChallenge(id)} />;
      case 'daily':
        return <DailyScreen data={data} onNavigate={navigate} onStartChallenge={(id, isDaily) => startChallenge(id, isDaily)} />;
      case 'lab':
        return <LabScreen data={data} onNavigate={navigate} onStartChallenge={(id) => startChallenge(id)} />;
      case 'profile':
        return <ProfileScreen data={data} onUpdate={update} onNavigate={navigate} />;
      case 'student':
        return <StudentScreen />;
      case 'about':
        return <AboutScreen />;
      case 'howitworks':
        return <HowItWorksScreen onNavigate={navigate} onStartChallenge={(id) => startChallenge(id)} />;
      case 'game':
        if (!activeChallenge) {
          navigate('home');
          return null;
        }
        return (
          <GameScreen
            challenge={activeChallenge}
            onExit={() => navigate(dailyMode ? 'daily' : 'campaign')}
            onComplete={handleComplete}
            onNextChallenge={handleNextChallenge}
            soundEnabled={soundEnabled}
            reducedMotion={data.settings.reducedMotion}
            onPlaySound={play}
          />
        );
      default:
        return <HomeScreen data={data} onNavigate={navigate} onContinue={handleContinue} />;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <NavBar screen={screen} onNavigate={navigate} data={data} onToggleSound={handleToggleSound} soundEnabled={soundEnabled} />
      {renderScreen()}
    </div>
  );
}

export default App;
