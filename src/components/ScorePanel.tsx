import { categoryLabel } from '@/engine/challenges';
import { useState, useEffect, useRef } from 'react';
import type { ScoreBreakdown, ExecutionResult, Challenge } from '@/types';
import { Star, TrendingUp, Zap, RotateCcw, Target, Award, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ScorePanelProps {
  challenge: Challenge;
  result: ExecutionResult;
  score: ScoreBreakdown;
  onReplay: () => void;
  onOptimize: () => void;
  onNext?: () => void;
  isNewRecord: boolean;
  previousBest?: number;
}

export function ScorePanel({ challenge, result, score, onReplay, onOptimize, onNext, isNewRecord, previousBest }: ScorePanelProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showStars, setShowStars] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animated score counter
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    let raf = 0;
    const animate = (t: number) => {
      const elapsed = t - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score.total * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score.total]);

  // Delayed star animation
  useEffect(() => {
    const timer = setTimeout(() => setShowStars(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={panelRef} className="bg-base-700 rounded-3xl border border-success-500/20 p-6 space-y-5 animate-bounce-in shadow-soft">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-500/10 border border-success-500/20 text-success-400 text-xs font-medium mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Challenge Solved
        </div>
        <h3 className="text-2xl font-bold text-ink mb-0.5">{challenge.title}</h3>
        <p className="text-xs text-gray-500 capitalize">{categoryLabel(challenge.category)} · Difficulty {challenge.difficulty}</p>
      </div>

      {/* Stars */}
      <div className="flex items-center justify-center gap-3 py-1">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`transition-all duration-500 ${
              showStars && s <= score.stars
                ? 'scale-100 opacity-100'
                : 'scale-50 opacity-30'
            }`}
            style={{ transitionDelay: `${s * 150}ms` }}
          >
            <Star
              className={`w-10 h-10 ${
                s <= score.stars
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-500'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Score */}
      <div className="text-center">
        <div className="text-5xl font-semibold font-display text-accent-500 tabular-nums">{displayScore.toLocaleString()}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Score</div>
        {isNewRecord && (
          <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-success-500/15 text-success-400 text-xs font-medium">
            <Award className="w-3 h-3" /> New Record!
          </div>
        )}
        {previousBest !== undefined && !isNewRecord && (
          <div className="text-xs text-gray-500 mt-1">Previous best: {previousBest.toLocaleString()}</div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Stat label="Efficiency" value={`${score.efficiency}%`} icon={TrendingUp} color={score.efficiency >= 90 ? 'text-success-400' : score.efficiency >= 75 ? 'text-warning-400' : 'text-gray-300'} />
        <Stat label="Moves" value={`${result.movesUsed}/${challenge.minMoves}`} icon={Target} color="text-ink" />
        <Stat label="Energy Left" value={`${result.energyRemaining}`} icon={Zap} color="text-yellow-400" />
        <Stat label="Stars" value={`${score.stars}/3`} icon={Star} color="text-amber-400" />
      </div>

      {/* Breakdown */}
      <div className="bg-base-500 rounded-2xl p-3.5 space-y-1.5 text-xs font-mono">
        <BreakdownRow label="Base Score" value={score.base} />
        <BreakdownRow label="Efficiency Bonus" value={score.efficiencyBonus} positive />
        <BreakdownRow label="Resource Bonus" value={score.resourceBonus} positive />
        <BreakdownRow label="Speed Bonus" value={score.speedBonus} positive />
        {score.retryPenalty > 0 && <BreakdownRow label="Retry Penalty" value={-score.retryPenalty} />}
        {score.hintPenalty > 0 && <BreakdownRow label="Hint Penalty" value={-score.hintPenalty} />}
        {score.excessMovePenalty > 0 && <BreakdownRow label="Excess Move Penalty" value={-score.excessMovePenalty} />}
        <div className="border-t border-line pt-1.5 mt-1.5 flex items-center justify-between">
          <span className="text-gray-400 font-semibold">Total</span>
          <span className="text-accent-400 font-bold text-sm">{score.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onOptimize}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent-500/15 hover:bg-accent-500/25 text-accent-400 font-medium text-sm transition-all border border-accent-500/20 hover:scale-105"
        >
          <BarChart3 className="w-4 h-4" /> Optimize
        </button>
        <button
          onClick={onReplay}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-base-400 hover:bg-gray-800 text-gray-300 font-medium text-sm transition-all border border-line"
        >
          <RotateCcw className="w-4 h-4" /> Replay
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-success-500/15 hover:bg-success-500/25 text-success-400 font-medium text-sm transition-all border border-success-500/20 hover:scale-105"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Star; color: string }) {
  return (
    <div className="bg-base-500 rounded-2xl p-3 flex items-center gap-2.5">
      <div className="flex-shrink-0">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] text-gray-500 uppercase tracking-wider truncate">{label}</div>
        <div className={`font-mono font-bold text-sm ${color}`}>{value}</div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={value > 0 ? (positive ? 'text-success-400' : 'text-ink') : 'text-error-400'}>
        {value > 0 ? '+' : ''}{value.toLocaleString()}
      </span>
    </div>
  );
}
