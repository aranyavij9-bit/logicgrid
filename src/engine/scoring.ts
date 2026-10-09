import type { ScoreBreakdown, ExecutionResult, Challenge } from '@/types';

export function calculateScore(
  challenge: Challenge,
  result: ExecutionResult,
  retries: number,
  hintsUsed: number
): ScoreBreakdown {
  const minMoves = challenge.minMoves;
  const movesUsed = result.movesUsed;
  const energyRemaining = result.energyRemaining;
  const startEnergy = challenge.startEnergy;

  // Efficiency: how close to optimal
  const efficiency = result.success && movesUsed > 0
    ? Math.min(100, Math.round((minMoves / movesUsed) * 100))
    : 0;

  // Base score for solving
  const base = result.success ? 1000 * challenge.difficulty : 0;

  // Efficiency bonus
  const efficiencyBonus = result.success ? Math.round(efficiency * 50 * challenge.difficulty) : 0;

  // Resource bonus
  const resourceRatio = startEnergy > 0 ? energyRemaining / startEnergy : 0;
  const resourceBonus = result.success ? Math.round(resourceRatio * 300) : 0;

  // Speed bonus (fewer retries)
  const speedBonus = result.success ? Math.max(0, 200 - retries * 50) : 0;

  // Penalties
  const retryPenalty = retries * 50;
  const hintPenalty = hintsUsed * 75;
  const excessMoves = Math.max(0, movesUsed - minMoves);
  const excessMovePenalty = excessMoves * 20;

  const total = Math.max(0, base + efficiencyBonus + resourceBonus + speedBonus - retryPenalty - hintPenalty - excessMovePenalty);

  // Stars
  let stars = 0;
  if (result.success) {
    stars = 1;
    if (efficiency >= 75) stars = 2;
    if (efficiency >= 90 && hintsUsed === 0) stars = 3;
  }

  return {
    base,
    efficiencyBonus,
    resourceBonus,
    speedBonus,
    retryPenalty,
    hintPenalty,
    excessMovePenalty,
    total,
    efficiency,
    stars,
  };
}
