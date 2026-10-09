import type { GameData, Screen } from '@/types';
import { User, Star, TrendingUp, Target, Zap, Award, BarChart3, Edit2, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { resetGameData } from '@/engine/storage';

interface ProfileScreenProps {
  data: GameData;
  onUpdate: (updater: (prev: GameData) => GameData) => void;
  onNavigate: (screen: Screen) => void;
}

export function ProfileScreen({ data, onUpdate }: ProfileScreenProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(data.profile.name);
  const [confirmReset, setConfirmReset] = useState(false);

  const saveName = () => {
    onUpdate((prev) => ({ ...prev, profile: { ...prev.profile, name: nameInput.trim() || 'Player' } }));
    setEditingName(false);
  };

  const handleReset = () => {
    if (confirmReset) {
      const fresh = resetGameData();
      onUpdate(() => fresh);
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  const stats = data.stats;
  const avgMoves = stats.totalSolved > 0 ? Math.round(stats.totalMoves / stats.totalSolved) : 0;

  const skillBars = [
    { label: 'Pattern Recognition', value: Math.min(100, stats.categorySolved.pattern * 10), color: 'bg-cyan-400' },
    { label: 'Planning', value: Math.min(100, stats.categorySolved.pathfinding * 10), color: 'bg-blue-400' },
    { label: 'Resource Management', value: Math.min(100, stats.categorySolved.resource * 10), color: 'bg-yellow-400' },
    { label: 'Optimisation', value: Math.min(100, stats.categorySolved.optimisation * 10), color: 'bg-emerald-400' },
    { label: 'Conditional Logic', value: Math.min(100, stats.categorySolved.logic * 10), color: 'bg-amber-400' },
    { label: 'Algorithmic Thinking', value: Math.min(100, stats.categorySolved.algorithm * 10), color: 'text-violet-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400">Your gameplay statistics and achievements.</p>
      </div>

      {/* Profile header */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="bg-[#1c2230] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-cyan-500/50"
                autoFocus
                maxLength={20}
              />
              <button onClick={saveName} className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{data.profile.name}</h2>
              <button onClick={() => { setEditingName(true); setNameInput(data.profile.name); }} className="p-1 text-gray-500 hover:text-cyan-400">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500">Playing since {new Date(data.profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Target} label="Solved" value={stats.totalSolved.toString()} color="text-cyan-400" />
        <StatCard icon={TrendingUp} label="Best Efficiency" value={`${stats.bestEfficiency}%`} color="text-emerald-400" />
        <StatCard icon={BarChart3} label="Avg Moves" value={avgMoves.toString()} color="text-amber-400" />
        <StatCard icon={Star} label="Total Score" value={stats.totalScore.toLocaleString()} color="text-yellow-400" />
      </div>

      {/* Category breakdown */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {(Object.keys(stats.categorySolved) as (keyof typeof stats.categorySolved)[]).map((cat) => (
            <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-[#1c2230]">
              <span className="text-gray-400 capitalize">{cat}</span>
              <span className="font-mono font-bold text-white">{stats.categorySolved[cat]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gameplay Skills */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Gameplay Skills</h3>
        <div className="space-y-3">
          {skillBars.map((skill) => (
            <div key={skill.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-300">{skill.label}</span>
                <span className="font-mono text-xs text-gray-500">{skill.value}%</span>
              </div>
              <div className="h-1.5 bg-[#1c2230] rounded-full overflow-hidden">
                <div className={`h-full ${skill.color} rounded-full transition-all duration-500`} style={{ width: `${skill.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.achievements.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                a.unlocked
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-[#1c2230] border-white/5 opacity-60'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                a.unlocked ? 'bg-amber-500/15' : 'bg-gray-800'
              }`}>
                <Award className={`w-4 h-4 ${a.unlocked ? 'text-amber-400' : 'text-gray-600'}`} />
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${a.unlocked ? 'text-white' : 'text-gray-500'}`}>{a.title}</div>
                <div className="text-xs text-gray-500 truncate">{a.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-[#0d1117] rounded-xl border border-white/5 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Settings</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white">Sound Effects</div>
            <div className="text-xs text-gray-500">Enable or disable game audio</div>
          </div>
          <button
            onClick={() => onUpdate((prev) => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${data.settings.soundEnabled ? 'bg-cyan-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${data.settings.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white">Reduced Motion</div>
            <div className="text-xs text-gray-500">Minimize animations</div>
          </div>
          <button
            onClick={() => onUpdate((prev) => ({ ...prev, settings: { ...prev.settings, reducedMotion: !prev.settings.reducedMotion } }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${data.settings.reducedMotion ? 'bg-cyan-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${data.settings.reducedMotion ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-[#0d1117] rounded-xl border border-red-500/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white">Reset Progress</div>
            <div className="text-xs text-gray-500">Clear all data and start fresh</div>
          </div>
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              confirmReset
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {confirmReset ? 'Click again to confirm' : 'Reset All Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Star; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 p-4 text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
      <div className="text-2xl font-bold font-mono text-white">{value}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
