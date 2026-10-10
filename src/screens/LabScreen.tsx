import { useState } from 'react';
import { getChallengesByCategoryAndDifficulty, CHALLENGES } from '@/engine/challenges';
import type { ChallengeCategory, Difficulty, GameData, Screen } from '@/types';
import { FlaskConical, Play, Grid3x3, Cpu, Route, Zap, TrendingUp, Code, Star, CheckCircle2 } from 'lucide-react';

interface LabScreenProps {
  data: GameData;
  onNavigate: (screen: Screen) => void;
  onStartChallenge: (challengeId: string) => void;
}

const CATEGORIES: { value: ChallengeCategory; label: string; icon: typeof Grid3x3; desc: string; color: string }[] = [
  { value: 'pattern', label: 'Pattern', icon: Grid3x3, desc: 'Sequence recognition', color: 'text-accent-400' },
  { value: 'logic', label: 'Logic', icon: Cpu, desc: 'Conditional reasoning', color: 'text-warning-400' },
  { value: 'pathfinding', label: 'Pathfinding', icon: Route, desc: 'Route optimization', color: 'text-success-400' },
  { value: 'resource', label: 'Resources', icon: Zap, desc: 'Energy management', color: 'text-yellow-400' },
  { value: 'optimisation', label: 'Optimization', icon: TrendingUp, desc: 'Improve solutions', color: 'text-secondary-400' },
  { value: 'algorithm', label: 'Algorithm', icon: Code, desc: 'Algorithmic thinking', color: 'text-violet-400' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string; bg: string }[] = [
  { value: 1, label: 'Easy', color: 'text-success-400', bg: 'bg-success-500/10' },
  { value: 2, label: 'Medium', color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { value: 3, label: 'Hard', color: 'text-warning-400', bg: 'bg-warning-500/10' },
  { value: 4, label: 'Expert', color: 'text-error-400', bg: 'bg-error-500/10' },
];

export function LabScreen({ data, onStartChallenge }: LabScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const getChallenges = () => {
    if (selectedCategory && selectedDifficulty) {
      let list = getChallengesByCategoryAndDifficulty(selectedCategory, selectedDifficulty);
      if (list.length === 0) {
        list = CHALLENGES.filter((c) => c.category === selectedCategory && c.difficulty <= selectedDifficulty);
      }
      return list;
    }
    if (selectedCategory) {
      return CHALLENGES.filter((c) => c.category === selectedCategory);
    }
    return [];
  };

  const challenges = getChallenges();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">Challenge Lab</h1>
        <p className="text-gray-400">Pick a category and difficulty. Experiment freely with unlimited attempts.</p>
      </div>

      {/* Category selection */}
      <div>
        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(active ? null : cat.value)}
                className={`flex items-center gap-3 p-4 rounded-3xl border transition-all text-left animate-fade-in-up ${
                  active
                    ? 'bg-accent-500/10 border-accent-500/30 scale-[1.02] shadow-soft'
                    : 'bg-base-700 border-line hover:border-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-accent-500/15' : 'bg-base-400'}`}>
                  <Icon className={`w-5 h-5 ${active ? cat.color : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${active ? 'text-ink' : 'text-gray-300'}`}>{cat.label}</div>
                  <div className="text-xs text-gray-500">{cat.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty selection */}
      {selectedCategory && (
        <div className="animate-fade-in">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Difficulty</h3>
          <div className="flex flex-wrap gap-2.5">
            {DIFFICULTIES.map((diff) => {
              const active = selectedDifficulty === diff.value;
              return (
                <button
                  key={diff.value}
                  onClick={() => setSelectedDifficulty(active ? null : diff.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all border ${
                    active
                      ? 'bg-accent-500/15 border-accent-500/30 text-ink scale-105'
                      : 'bg-base-700 border-line text-gray-400 hover:text-ink hover:border-gray-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${diff.bg} ${active ? 'ring-2 ring-offset-2 ring-offset-base-800 ring-current' : ''}`}>
                    <span className={`block w-2 h-2 rounded-full ${diff.color.replace('text-', 'bg-')}`} />
                  </span>
                  <span className={diff.color}>{diff.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Challenge list */}
      {challenges.length > 0 && (
        <div className="animate-fade-in">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Available Challenges ({challenges.length})
          </h3>
          <div className="space-y-2">
            {challenges.map((c, i) => {
              const record = data.records[c.id];
              const solved = !!record?.solved;
              const stars = record?.stars ?? 0;
              return (
                <button
                  key={c.id}
                  onClick={() => onStartChallenge(c.id)}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-base-700 border border-line hover:border-accent-500/20 transition-all text-left group hover:scale-[1.01] animate-fade-in-up"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    solved ? 'bg-success-500/15' : 'bg-base-400 group-hover:bg-accent-500/10'
                  }`}>
                    {solved ? (
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-500 group-hover:text-accent-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.objective}</div>
                  </div>
                  {stars > 0 && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] font-mono text-gray-600">
                    Diff {c.difficulty}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedCategory && challenges.length === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm border border-dashed border-line rounded-2xl bg-base-700/30">
          <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-20" />
          No challenges found for this combination.
          <br />
          <span className="text-gray-600">Try a different difficulty level.</span>
        </div>
      )}
    </div>
  );
}
