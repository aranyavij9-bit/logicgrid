import { Grid3x3, Home, Trophy, Calendar, FlaskConical, User, Info, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import type { Screen, GameData } from '@/types';
import { useState, useEffect } from 'react';

interface NavBarProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  data: GameData;
  onToggleSound: () => void;
  soundEnabled: boolean;
}

const NAV_ITEMS: { screen: Screen; label: string; icon: typeof Home }[] = [
  { screen: 'home', label: 'Home', icon: Home },
  { screen: 'campaign', label: 'Campaign', icon: Trophy },
  { screen: 'daily', label: 'Daily', icon: Calendar },
  { screen: 'lab', label: 'Lab', icon: FlaskConical },
  { screen: 'profile', label: 'Profile', icon: User },
  { screen: 'student', label: 'Student', icon: Info },
  { screen: 'about', label: 'About', icon: HelpCircle },
];

export function NavBar({ screen, onNavigate, onToggleSound, soundEnabled }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (s: Screen) => {
    onNavigate(s);
    setMobileOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-base-800/95 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-base-800/80 backdrop-blur-sm border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 group"
            >
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent-500/20">
                <Grid3x3 className="w-5 h-5 text-white" />
                <div className="absolute inset-0 rounded-lg bg-accent-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
                Logic<span className="text-accent-400">Grid</span>
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = screen === item.screen || (item.screen === 'campaign' && screen === 'game');
                return (
                  <button
                    key={item.screen}
                    onClick={() => handleNav(item.screen)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      active
                        ? 'text-accent-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {active && (
                      <div className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-accent-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSound}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-white/5 px-4 py-3 space-y-1 bg-base-800/95 backdrop-blur-md animate-fade-in-down">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = screen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNav(item.screen)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'bg-accent-500/10 text-accent-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </header>
      <div className="h-14" />
    </>
  );
}
