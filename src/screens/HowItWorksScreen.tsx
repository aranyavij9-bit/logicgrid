import { useState } from 'react';
import { Target, ListChecks, Wrench, Play, BarChart3, TrendingUp, ChevronRight, ArrowLeft, RotateCcw } from 'lucide-react';
import type { Screen } from '@/types';

interface HowItWorksProps {
  onNavigate: (screen: Screen) => void;
  onStartChallenge: (challengeId: string) => void;
}

const STEPS = [
  { icon: Target, title: 'Read the Objective', desc: 'Each challenge tells you what to achieve and what constraints apply.' },
  { icon: ListChecks, title: 'Identify Constraints', desc: 'Pay attention to move limits, energy limits, and dependencies.' },
  { icon: Wrench, title: 'Plan a Solution', desc: 'Think about the sequence of actions needed to reach your goal.' },
  { icon: Play, title: 'Build Actions', desc: 'Add actions to your solution sequence. Reorder, duplicate, or remove them.' },
  { icon: RotateCcw, title: 'Run the Solution', desc: 'Press Run to execute your plan step-by-step and watch the result.' },
  { icon: BarChart3, title: 'Analyse the Result', desc: 'See what worked and what failed. Learn from the feedback.' },
  { icon: TrendingUp, title: 'Optimise', desc: 'Try again with fewer moves or less energy to earn more stars.' },
];

export function HowItWorksScreen({ onNavigate, onStartChallenge }: HowItWorksProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  if (showTutorial) {
    return <TutorialPuzzle onExit={() => setShowTutorial(false)} onStartChallenge={onStartChallenge} onNavigate={onNavigate} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">How It Works</h1>
        <p className="text-gray-400">The core loop: Understand, Plan, Build, Execute, Analyse, Optimise.</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#0d1117] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{i + 1}</span>
                  <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-700" />}
            </div>
          );
        })}
      </div>

      {/* Try it */}
      <div className="bg-[#0d1117] rounded-xl border border-cyan-500/20 p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Ready to Try?</h3>
        <p className="text-sm text-gray-400 mb-4">Start with a quick tutorial puzzle to see how it works.</p>
        <button
          onClick={() => setShowTutorial(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold transition-all shadow-lg shadow-cyan-500/20"
        >
          <Play className="w-4 h-4" /> Start Tutorial
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={() => onNavigate('campaign')}
          className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
        >
          Or jump straight into the Campaign →
        </button>
      </div>
    </div>
  );
}

function TutorialPuzzle({ onExit, onStartChallenge, onNavigate }: { onExit: () => void; onStartChallenge: (id: string) => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button onClick={onExit} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Guide
      </button>

      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Tutorial: Switch Corridor</h2>
        <p className="text-sm text-gray-400">
          This is a real challenge from the campaign. Your goal is to reach the target (H) on the right side of the grid.
          A gate blocks the direct path — you need to activate a switch first.
        </p>

        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">1.</span>
            <span>Look at the grid. You start at S (left). The target H is on the right.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">2.</span>
            <span>A gate (red lock) blocks the middle. A switch (power icon) is above it.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">3.</span>
            <span>Add actions: Move Up, Move Up, Activate, Move Down, Move Down, Move Right (x3) to reach H.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">4.</span>
            <span>Press Run to execute. Watch your player move through the grid.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-mono">5.</span>
            <span>Try to use fewer moves to earn more stars!</span>
          </div>
        </div>

        <button
          onClick={() => onStartChallenge('switch-corridor')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-semibold transition-all"
        >
          <Play className="w-4 h-4" /> Play Tutorial Challenge
        </button>
      </div>

      <button
        onClick={() => onNavigate('campaign')}
        className="w-full text-center text-sm text-gray-500 hover:text-cyan-400 transition-colors py-2"
      >
        Continue to Campaign →
      </button>
    </div>
  );
}
