import type { PatternChallenge, LogicChallenge } from '@/types';
import { evaluateLogic, getGateSymbol } from '@/engine/logic';
import { useState } from 'react';
import { Lightbulb, Check, X, GitBranch, Cpu } from 'lucide-react';

interface PatternChallengeProps {
  pattern: PatternChallenge;
  onAnswer: (answer: number | string) => boolean;
  hintsUsed: number;
  onUseHint: () => void;
  hintRevealed: string[];
}

export function PatternChallengeView({ pattern, onAnswer, hintsUsed, onUseHint, hintRevealed }: PatternChallengeProps) {
  const [selected, setSelected] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleSelect = (val: number | string) => {
    setSelected(val);
    const correct = onAnswer(val);
    setFeedback(correct ? 'correct' : 'wrong');
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sequence</h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {pattern.sequence.map((val, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center font-mono text-xl font-bold transition-all ${
                  i === pattern.answerIndex
                    ? 'bg-cyan-500/15 border-2 border-dashed border-cyan-500/50 text-cyan-400'
                    : typeof val === 'number' && isNaN(val as number)
                    ? 'bg-cyan-500/15 border-2 border-dashed border-cyan-500/50 text-cyan-400'
                    : 'bg-[#1c2230] border border-white/5 text-white'
                }`}
              >
                {typeof val === 'number' && isNaN(val as number) ? '?' : val}
              </div>
              {i < pattern.sequence.length - 1 && (
                <span className="text-gray-600 text-xl">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Select the missing value</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pattern.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={feedback === 'correct'}
              className={`h-14 rounded-xl font-mono text-lg font-bold transition-all border-2 ${
                selected === opt
                  ? feedback === 'correct'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-[#1c2230] border-white/5 text-gray-300 hover:border-cyan-500/30 hover:text-cyan-400'
              } disabled:cursor-not-allowed`}
            >
              {opt}
            </button>
          ))}
        </div>
        {feedback === 'wrong' && (
          <p className="text-sm text-red-400 mt-3 flex items-center gap-1.5">
            <X className="w-4 h-4" /> Not quite — try again!
          </p>
        )}
        {feedback === 'correct' && (
          <p className="text-sm text-emerald-400 mt-3 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Correct! The rule is: {pattern.rule}
          </p>
        )}
      </div>

      {hintsUsed < 3 && feedback !== 'correct' && (
        <button
          onClick={onUseHint}
          className="flex items-center gap-2 text-sm text-amber-500/80 hover:text-amber-400 transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
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

interface LogicChallengeProps {
  logic: LogicChallenge;
  onSolved: () => void;
  hintsUsed: number;
  onUseHint: () => void;
  hintRevealed: string[];
}

export function LogicChallengeView({ logic, onSolved, hintsUsed, onUseHint, hintRevealed }: LogicChallengeProps) {
  const [inputStates, setInputStates] = useState<Record<string, boolean>>(
    Object.fromEntries(logic.inputs.map((i) => [i.id, i.defaultState]))
  );

  const results = evaluateLogic(logic.gates, logic.inputs, inputStates);
  const outputValue = results.get(logic.outputGate) ?? false;
  const isSolved = outputValue === logic.expectedOutput;

  const toggleInput = (id: string) => {
    const newStates = { ...inputStates, [id]: !inputStates[id] };
    setInputStates(newStates);
    const newResults = evaluateLogic(logic.gates, logic.inputs, newStates);
    if (newResults.get(logic.outputGate) === logic.expectedOutput) {
      onSolved();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4" /> Logic Circuit
        </h3>

        {/* Inputs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {logic.inputs.map((inp) => (
            <button
              key={inp.id}
              onClick={() => toggleInput(inp.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border-2 ${
                inputStates[inp.id]
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#1c2230] border-white/5 text-gray-400'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${inputStates[inp.id] ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              {inp.label}
            </button>
          ))}
        </div>

        {/* Gates visualization */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-4">
          {logic.gates.map((gate) => {
            const val = results.get(gate.id);
            return (
              <div key={gate.id} className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    {gate.inputs.map((inp) => (
                      <div key={inp} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${results.get(inp) || inputStates[inp] ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                        <span className="text-[10px] font-mono text-gray-500">{inp}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 ${
                    val ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#1c2230] border-white/5'
                  }`}>
                    <span className={`text-2xl font-bold ${val ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {getGateSymbol(gate.type)}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">{gate.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Output */}
        <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-white/5">
          <GitBranch className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-400">Output:</span>
          <div className={`px-4 py-1.5 rounded-lg font-mono font-bold text-sm ${
            outputValue ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-800 text-gray-500'
          }`}>
            {outputValue ? 'TRUE' : 'FALSE'}
          </div>
          <span className="text-sm text-gray-500">Target: {logic.expectedOutput ? 'TRUE' : 'FALSE'}</span>
          {isSolved && (
            <span className="text-sm text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Solved!
            </span>
          )}
        </div>
      </div>

      {hintsUsed < 3 && !isSolved && (
        <button
          onClick={onUseHint}
          className="flex items-center gap-2 text-sm text-amber-500/80 hover:text-amber-400 transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
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
