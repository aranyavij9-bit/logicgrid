import { Grid3x3, Trophy, Calendar, FlaskConical, User, HelpCircle, Play, ChevronRight, ArrowRight, Zap, BarChart3, Star } from 'lucide-react';
import type { Screen, GameData } from '@/types';
import { GridBackground } from '@/components/GridBackground';

interface HomeScreenProps {
  data: GameData;
  onNavigate: (screen: Screen) => void;
  onContinue: () => void;
}

export function HomeScreen({ data, onNavigate, onContinue }: HomeScreenProps) {
  const totalChapters = 8;
  const completedChapters = Object.values(data.campaignProgress).filter(Boolean).length;
  const progress = Math.round((completedChapters / totalChapters) * 100);
  const hasProgress = data.stats.totalSolved > 0;

  const menuItems: { screen: Screen; label: string; desc: string; icon: typeof Trophy; color: string; bg: string }[] = [
    { screen: 'campaign', label: 'Campaign', desc: 'Progress through 8 chapters', icon: Trophy, color: 'text-accent-400', bg: 'group-hover:bg-accent-500/10' },
    { screen: 'daily', label: 'Daily Challenge', desc: "Today's logic puzzle", icon: Calendar, color: 'text-warning-400', bg: 'group-hover:bg-warning-500/10' },
    { screen: 'lab', label: 'Challenge Lab', desc: 'Free play with custom puzzles', icon: FlaskConical, color: 'text-success-400', bg: 'group-hover:bg-success-500/10' },
    { screen: 'profile', label: 'Profile', desc: 'Your stats and achievements', icon: User, color: 'text-secondary-400', bg: 'group-hover:bg-secondary-500/10' },
    { screen: 'student', label: 'Student', desc: 'About the creator', icon: User, color: 'text-gray-400', bg: 'group-hover:bg-gray-500/10' },
    { screen: 'about', label: 'About', desc: 'What is LogicGrid?', icon: HelpCircle, color: 'text-gray-400', bg: 'group-hover:bg-gray-500/10' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      <GridBackground density={35} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in-up">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-secondary-600 mb-6 shadow-xl shadow-accent-500/20 animate-scale-in">
            <Grid3x3 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-3 animate-fade-in-up">
            Logic<span className="text-gradient">Grid</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-2 animate-fade-in-up">Think in Patterns. Solve with Logic.</p>
          <p className="text-sm text-gray-600 max-w-xl mx-auto mb-8 animate-fade-in-up">
            Construct, execute, analyse and optimise solutions to pathfinding, logic, resource, and optimisation challenges.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up">
            <button
              onClick={onContinue}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent-500 to-secondary-600 hover:from-accent-400 hover:to-secondary-500 text-white font-semibold transition-all shadow-lg shadow-accent-500/25 hover:shadow-accent-400/40 hover:scale-105"
            >
              <Play className="w-5 h-5" />
              {hasProgress ? 'Continue Campaign' : 'Start Playing'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('howitworks')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-base-700/80 hover:bg-base-600 text-gray-300 hover:text-white font-medium transition-all border border-white/5 hover:border-white/10"
            >
              <HelpCircle className="w-4 h-4" />
              How It Works
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {hasProgress && (
          <div className="max-w-md mx-auto mb-12 animate-fade-in-up">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="uppercase tracking-wider font-medium">Campaign Progress</span>
              <span className="font-mono text-accent-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2.5 bg-base-400/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 shimmer-bg animate-shimmer relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-secondary-500 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-gray-600 font-mono">
              <span>{completedChapters} chapters completed</span>
              <span>{totalChapters - completedChapters} remaining</span>
            </div>
          </div>
        )}

        {/* Menu grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="group flex items-center gap-4 p-5 rounded-xl bg-base-700/80 backdrop-blur-sm border border-white/5 hover:border-accent-500/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-500/5 text-left animate-fade-in-up"
              >
                <div className={`w-10 h-10 rounded-lg bg-base-400/60 flex items-center justify-center transition-colors ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>

        {/* Quick stats */}
        {hasProgress && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-accent-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold font-mono text-white">{data.stats.totalSolved}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Solved</div>
              </div>
            </div>
            <div className="w-px h-12 bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-warning-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold font-mono text-accent-400">{data.stats.totalScore.toLocaleString()}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Score</div>
              </div>
            </div>
            <div className="w-px h-12 bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold font-mono text-amber-400">{data.achievements.filter(a => a.unlocked).length}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Badges</div>
              </div>
            </div>
          </div>
        )}

        {/* Feature highlights */}
        {!hasProgress && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up">
            <FeatureCard icon={Grid3x3} title="6 Challenge Modes" desc="Patterns, Logic, Pathfinding, Resources, Optimisation, Algorithms" />
            <FeatureCard icon={Zap} title="Solution Builder" desc="Construct action sequences, execute step-by-step, analyse results" />
            <FeatureCard icon={Trophy} title="Star Ratings" desc="Earn up to 3 stars per challenge by finding optimal solutions" />
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Grid3x3; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-xl bg-base-700/60 border border-white/5 text-center">
      <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-accent-400" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  );
}
