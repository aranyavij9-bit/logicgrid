import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import type { PatternChallenge } from '@/types';

interface SortingChallengeProps {
  pattern: PatternChallenge;
  onSolved: () => void;
  hintsUsed: number;
  onUseHint: () => void;
  hintRevealed: string[];
}

export function SortingChallengeView({ pattern, onSolved, hintsUsed, onUseHint, hintRevealed }: SortingChallengeProps) {
  const initial = pattern.sequence as number[];
  const target = [...initial].sort((a, b) => a - b);
  const [items, setItems] = useState<number[]>([...initial]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);

  const sorted = JSON.stringify(items) === JSON.stringify(target);

  const handleSwap = (idx: number) => {
    if (selectedIdx === null) {
      setSelectedIdx(idx);
      return;
    }
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }
    const newItems = [...items];
    [newItems[selectedIdx], newItems[idx]] = [newItems[idx], newItems[selectedIdx]];
    setItems(newItems);
    setSwaps((s) => s + 1);
    setSelectedIdx(null);
    if (JSON.stringify(newItems) === JSON.stringify(target)) {
      onSolved();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort the Sequence</h3>
        <p className="text-sm text-gray-400 mb-4">Click two numbers to swap them. Arrange from smallest to largest.</p>

        <div className="flex flex-wrap gap-2 justify-center">
          {items.map((val, i) => (
            <button
              key={i}
              onClick={() => handleSwap(i)}
              className={`w-14 h-14 rounded-xl font-mono text-xl font-bold transition-all border-2 ${
                selectedIdx === i
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 scale-110'
                  : sorted
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#1c2230] border-white/5 text-gray-300 hover:border-cyan-500/30'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <span>Swaps: <span className="font-mono text-white">{swaps}</span></span>
          <span>Target: <span className="font-mono text-cyan-400">{target.join(', ')}</span></span>
          {sorted && (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Sorted!
            </span>
          )}
        </div>
      </div>

      {hintsUsed < 3 && !sorted && (
        <button
          onClick={onUseHint}
          className="flex items-center gap-2 text-sm text-amber-500/80 hover:text-amber-400 transition-colors"
        >
          Get Hint ({3 - hintsUsed} remaining)
        </button>
      )}

      {hintRevealed.length > 0 && (
        <div className="space-y-2">
          {hintRevealed.map((h, i) => (
            <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-200/80">
              <span className="font-semibold text-amber-400">Hint {i + 1}:</span> {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
