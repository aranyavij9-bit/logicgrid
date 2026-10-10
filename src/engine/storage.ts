import type { GameData, GameStats, Achievement, ChallengeCategory } from '@/types';

const STORAGE_KEY = 'logicgrid_data_v1';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first-solution', title: 'First Solution', description: 'Solve your first challenge.', unlocked: false },
  { id: 'efficient-thinker', title: 'Efficient Thinker', description: 'Complete a challenge with 90%+ efficiency.', unlocked: false },
  { id: 'pattern-hunter', title: 'Pattern Hunter', description: 'Solve 10 pattern challenges.', unlocked: false },
  { id: 'logic-architect', title: 'Logic Architect', description: 'Solve 10 logic challenges.', unlocked: false },
  { id: 'route-master', title: 'Route Master', description: 'Solve 10 pathfinding challenges.', unlocked: false },
  { id: 'zero-waste', title: 'Zero Waste', description: 'Complete a resource challenge without wasting resources.', unlocked: false },
  { id: 'optimiser', title: 'Optimizer', description: 'Improve the same solution three times.', unlocked: false },
  { id: 'perfect-logic', title: 'Perfect Logic', description: 'Complete a challenge without using a hint.', unlocked: false },
  { id: 'master-grid', title: 'Master Grid', description: 'Complete the advanced campaign.', unlocked: false },
  { id: 'daily-dedicated', title: 'Daily Dedicated', description: 'Complete 5 daily challenges.', unlocked: false },
];

function defaultStats(): GameStats {
  return {
    totalScore: 0,
    totalSolved: 0,
    totalAttempts: 0,
    hintsUsed: 0,
    categorySolved: {
      pattern: 0,
      logic: 0,
      pathfinding: 0,
      resource: 0,
      optimisation: 0,
      algorithm: 0,
    },
    bestEfficiency: 0,
    totalMoves: 0,
  };
}

export function createDefaultGameData(): GameData {
  return {
    profile: {
      name: 'Player',
      createdAt: Date.now(),
    },
    records: {},
    achievements: ACHIEVEMENTS_LIST.map((a) => ({ ...a })),
    dailyResults: {},
    campaignProgress: {},
    unlockedChapters: ['ch1-patterns'],
    settings: {
      soundEnabled: true,
      reducedMotion: false,
    },
    stats: defaultStats(),
  };
}

export function loadGameData(): GameData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultGameData();
    const data = JSON.parse(raw) as GameData;
    // Merge with defaults to handle new fields
    const defaults = createDefaultGameData();
    return {
      ...defaults,
      ...data,
      profile: { ...defaults.profile, ...data.profile },
      settings: { ...defaults.settings, ...data.settings },
      stats: { ...defaults.stats, ...data.stats,
        categorySolved: { ...defaults.stats.categorySolved, ...data.stats?.categorySolved }
      },
      achievements: mergeAchievements(defaults.achievements, data.achievements ?? []),
    };
  } catch {
    return createDefaultGameData();
  }
}

function mergeAchievements(defaults: Achievement[], saved: Achievement[]): Achievement[] {
  return defaults.map((d) => {
    const s = saved.find((s) => s.id === d.id);
    return s ? { ...d, ...s } : d;
  });
}

export function saveGameData(data: GameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game data', e);
  }
}

export function resetGameData(): GameData {
  const fresh = createDefaultGameData();
  saveGameData(fresh);
  return fresh;
}

export function checkAchievements(data: GameData): GameData {
  const achievements = [...data.achievements];
  const stats = data.stats;

  function unlock(id: string) {
    const a = achievements.find((a) => a.id === id);
    if (a && !a.unlocked) {
      a.unlocked = true;
      a.unlockedAt = Date.now();
    }
  }

  if (stats.totalSolved >= 1) unlock('first-solution');
  if (stats.bestEfficiency >= 90) unlock('efficient-thinker');
  if (stats.categorySolved.pattern >= 10) unlock('pattern-hunter');
  if (stats.categorySolved.logic >= 10) unlock('logic-architect');
  if (stats.categorySolved.pathfinding >= 10) unlock('route-master');
  if (stats.categorySolved.resource >= 1) {
    // Check for zero-waste: find a resource challenge solved with full energy
    const resourceRecords = Object.values(data.records).filter((r) => r.bestEnergy >= 0);
    if (resourceRecords.some((r) => r.bestEnergy > 0 && r.solved)) {
      // Approximate: if any resource challenge had energy remaining
      unlock('zero-waste');
    }
  }
  if (Object.keys(data.dailyResults).length >= 5) unlock('daily-dedicated');
  if (data.campaignProgress['ch8-mastery']) unlock('master-grid');

  // Check perfect logic: any solved challenge with 0 hints
  const perfectRecords = Object.values(data.records).filter((r) => r.solved && r.hintsUsed === 0);
  if (perfectRecords.length > 0) unlock('perfect-logic');

  return { ...data, achievements };
}

export function updateStatsForSolve(
  data: GameData,
  challengeId: string,
  category: ChallengeCategory,
  score: number,
  moves: number,
  efficiency: number,
  hintsUsed: number
): GameData {
  const stats = { ...data.stats };
  stats.totalScore += score;
  stats.totalMoves += moves;

  const existingRecord = data.records[challengeId];
  if (!existingRecord || !existingRecord.solved) {
    stats.totalSolved += 1;
    stats.categorySolved = {
      ...stats.categorySolved,
      [category]: stats.categorySolved[category] + 1,
    };
  }
  if (efficiency > stats.bestEfficiency) {
    stats.bestEfficiency = efficiency;
  }
  stats.hintsUsed += hintsUsed;

  return { ...data, stats };
}
