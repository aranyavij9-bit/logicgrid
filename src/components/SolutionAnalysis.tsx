import type { ExecutionResult, Challenge } from '@/types';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

interface SolutionAnalysisProps {
  challenge: Challenge;
  result: ExecutionResult;
}

export function SolutionAnalysis({ challenge, result }: SolutionAnalysisProps) {
  const excessMoves = Math.max(0, result.movesUsed - challenge.minMoves);
  const energyWasted = result.energyRemaining;

  return (
    <div className="bg-white shadow-soft rounded-3xl border border-line p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Approach</h3>
        {result.success ? (
          <div className="space-y-2 text-sm text-gray-300">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              You reached the target in {result.movesUsed} moves.
            </p>
            {excessMoves > 0 ? (
              <p className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Most efficient known solution: {challenge.minMoves} moves. You used {excessMoves} additional move{excessMoves !== 1 ? 's' : ''}.
              </p>
            ) : (
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                You found the optimal solution — no excess moves!
              </p>
            )}
            {energyWasted > 0 && (
              <p className="text-gray-500">
                You had {energyWasted} energy remaining. Could a more direct route conserve more?
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-sm text-gray-300">
            <p className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              {result.failReason || 'Solution did not reach all targets.'}
            </p>
            {result.failStepIndex !== undefined && result.steps[result.failStepIndex] && (
              <p className="text-gray-500">
                Failed at action {result.failStepIndex + 1}: {result.steps[result.failStepIndex].action.label}
              </p>
            )}
          </div>
        )}
      </div>

      {result.success && excessMoves > 0 && (
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-sm text-cyan-700">
          Try looking for a route that minimizes unnecessary movements. Check if activating switches in a different order could shorten your path.
        </div>
      )}
    </div>
  );
}
