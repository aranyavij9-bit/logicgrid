import { User, Mail, School, Code, Route, Zap, GitBranch, TrendingUp, Cpu, Gamepad2 } from 'lucide-react';

export function StudentScreen() {
  const exploredTopics = [
    { icon: Code, label: 'Algorithmic Thinking' },
    { icon: Cpu, label: 'Computational Reasoning' },
    { icon: Route, label: 'Pathfinding' },
    { icon: TrendingUp, label: 'Optimisation' },
    { icon: GitBranch, label: 'Constraint Solving' },
    { icon: Gamepad2, label: 'Interactive Simulation' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Student</h1>
        <p className="text-gray-400">The person behind LogicGrid.</p>
      </div>

      {/* Profile card */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Aranya Vij</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <School className="w-4 h-4 text-gray-500" />
              Redmond High School
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
              <Mail className="w-4 h-4 text-gray-500" />
              aranyavij9@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* Statement */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">Project Statement</h3>
        <p className="text-gray-300 leading-relaxed">
          I designed LogicGrid to explore how computational thinking can be turned into an interactive problem-solving
          experience. Instead of simply answering logic questions, players build solutions, test them, identify
          inefficiencies, and refine their approach.
        </p>
      </div>

      {/* What I Explored */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">What I Explored</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exploredTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <div key={topic.label} className="flex items-center gap-3 p-3 rounded-lg bg-[#1c2230]">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm text-gray-300">{topic.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
