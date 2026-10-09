import { Grid3x3, Cpu, Route, Zap, GitBranch, TrendingUp, Info } from 'lucide-react';

export function AboutScreen() {
  const coreIdeas = [
    { icon: Grid3x3, label: 'Patterns', desc: 'Recognizing and predicting sequences' },
    { icon: Cpu, label: 'Logic', desc: 'Conditional reasoning and boolean operations' },
    { icon: Route, label: 'Planning', desc: 'Finding efficient paths through constraints' },
    { icon: Zap, label: 'Constraints', desc: 'Working within resource and move limits' },
    { icon: GitBranch, label: 'Dependencies', desc: 'Understanding ordering and relationships' },
    { icon: TrendingUp, label: 'Optimisation', desc: 'Improving solutions toward optimal' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">About LogicGrid</h1>
        <p className="text-gray-400">A computational reasoning game, not a test.</p>
      </div>

      {/* What is LogicGrid */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">What is LogicGrid?</h3>
        <p className="text-gray-300 leading-relaxed">
          LogicGrid is a browser-based computational reasoning game where players solve challenges involving sequences,
          conditional logic, pathfinding, resource allocation, and optimisation. Rather than answering multiple-choice
          questions, players construct solutions using a visual action system, execute them step-by-step, and analyse
          the results to improve their approach.
        </p>
      </div>

      {/* Why it was created */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Why It Was Created</h3>
        <p className="text-gray-300 leading-relaxed">
          The project explores how algorithmic reasoning can be represented visually and interactively. Instead of
          learning computational concepts through text or static diagrams, players engage with them directly — building,
          testing, and refining solutions in real time. The goal is to make computational thinking tangible and
          engaging without feeling like a worksheet or exam.
        </p>
      </div>

      {/* Core Ideas */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Core Ideas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {coreIdeas.map((idea) => {
            const Icon = idea.icon;
            return (
              <div key={idea.label} className="flex items-start gap-3 p-3 rounded-lg bg-[#1c2230]">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{idea.label}</div>
                  <div className="text-xs text-gray-500">{idea.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Note */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">Technical Note</h3>
            <p className="text-sm text-amber-200/70 leading-relaxed">
              LogicGrid is an interactive learning and reasoning experience. It is not a formal assessment of
              intelligence or programming ability. The challenges and scoring system are designed to encourage
              experimentation, pattern recognition, and iterative improvement — not to measure cognitive ability.
              Gameplay statistics reflect experience with specific puzzle types, not broader cognitive traits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
