import { getDailyChallenge } from '@/engine/challenges';
import type { GameData, Screen } from '@/types';
import { Calendar, Zap, Target, Play, Award, CheckCircle2, Flame, Clock } from 'lucide-react';

interface DailyScreenProps {
  data: GameData;
  onNavigate: (screen: Screen) => void;
  onStartChallenge: (challengeId: string, isDaily: boolean) => void;
}

export function DailyScreen({ data, onStartChallenge }: DailyScreenProps) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const challenge = getDailyChallenge(today);
  const dailyId = `daily-${dateStr}`;
  const result = data.dailyResults[dateStr];

  const completedDays = Object.keys(data.dailyResults).length;
  const solvedDays = Object.values(data.dailyResults).filter(r => r.solved).length;
  const allResults = Object.entries(data.dailyResults).sort(([a], [b]) => b.localeCompare(a));

  // Streak calculation
  let streak = 0;
  const sortedDates = allResults.map(([d]) => d).sort().reverse();
  for (const d of sortedDates) {
    const r = data.dailyResults[d];
    if (r?.solved) streak++;
    else break;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Daily Challenge</h1>
        <p className="text-gray-400">A new challenge every day. Everyone gets the same puzzle.</p>
      </div>

      {/* Today's challenge card */}
      <div className="bg-base-700/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-xl shadow-black/20 animate-fade-in-up">
        <div className="bg-gradient-to-r from-accent-500/10 via-secondary-500/5 to-transparent p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-accent-400" />
              <span className="text-sm text-gray-400 font-medium">
                {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            {result?.solved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-500/15 text-success-400 text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{challenge.title}</h2>
          <p className="text-sm text-gray-500 mt-1 capitalize flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
              {challenge.category}
            </span>
            <span className="text-gray-700">·</span>
            <span>Difficulty {challenge.difficulty}/7</span>
          </p>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-300">{challenge.objective}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            {challenge.constraints.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-400/60 text-gray-400 border border-white/5">
                {c.type === 'energyLimit' && <Zap className="w-3.5 h-3.5 text-yellow-400" />}
                {c.type === 'moveLimit' && <Target className="w-3.5 h-3.5 text-accent-400" />}
                {c.type === 'dependency' && <span className="text-warning-400">⚠</span>}
                {c.label}
              </div>
            ))}
          </div>

          {result && (
            <div className="bg-success-500/5 border border-success-500/20 rounded-xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-success-400 font-medium">
                <Award className="w-4 h-4" /> Completed Today!
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-base-500/40 rounded-lg p-2">
                  <div className="text-lg font-bold font-mono text-white">{result.score.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Score</div>
                </div>
                <div className="bg-base-500/40 rounded-lg p-2">
                  <div className="text-lg font-bold font-mono text-accent-400">{result.moves}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Moves</div>
                </div>
                <div className="bg-base-500/40 rounded-lg p-2">
                  <div className="text-lg font-bold font-mono text-amber-400">{result.efficiency}%</div>
                  <div className="text-[10px] text-gray-500 uppercase">Efficiency</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => onStartChallenge(dailyId, true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-accent-500 to-secondary-600 hover:from-accent-400 hover:to-secondary-500 text-white font-semibold transition-all shadow-lg shadow-accent-500/20 hover:scale-[1.02]"
          >
            <Play className="w-4 h-4" />
            {result ? 'Retry Challenge' : 'Start Challenge'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-base-700/60 rounded-xl border border-white/5 p-4 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
          <div className="text-2xl font-bold font-mono text-orange-400">{streak}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Day Streak</div>
        </div>
        <div className="bg-base-700/60 rounded-xl border border-white/5 p-4 text-center">
          <Clock className="w-5 h-5 text-accent-400 mx-auto mb-1.5" />
          <div className="text-2xl font-bold font-mono text-accent-400">{completedDays}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Attempts</div>
        </div>
        <div className="bg-base-700/60 rounded-xl border border-white/5 p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-success-400 mx-auto mb-1.5" />
          <div className="text-2xl font-bold font-mono text-success-400">{solvedDays}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Solved</div>
        </div>
      </div>

      {/* History */}
      {allResults.length > 0 && (
        <div className="bg-base-700/60 rounded-xl border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">History</h3>
          <div className="space-y-1.5">
            {allResults.slice(0, 10).map(([date, r]) => (
              <div key={date} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-base-600/50 transition-colors">
                <span className="text-gray-400 font-mono text-xs">{date}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${r.solved ? 'text-success-400' : 'text-error-400'}`}>
                    {r.solved ? 'Solved' : 'Failed'}
                  </span>
                  <span className="font-mono text-white text-xs">{r.score.toLocaleString()}</span>
                  <span className="font-mono text-gray-500 text-xs w-10 text-right">{r.efficiency}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
