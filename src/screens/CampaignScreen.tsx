import { CAMPAIGN_CHAPTERS, getChallengeById, categoryLabel } from '@/engine/challenges';
import type { GameData, Screen } from '@/types';
import { Lock, CheckCircle2, ChevronDown, Play, Trophy, Star } from 'lucide-react';
import { useState } from 'react';

interface CampaignScreenProps {
  data: GameData;
  onNavigate: (screen: Screen) => void;
  onStartChallenge: (challengeId: string) => void;
}

export function CampaignScreen({ data, onStartChallenge }: CampaignScreenProps) {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const completedChapters = Object.values(data.campaignProgress).filter(Boolean).length;
  const totalStars = Object.values(data.records).reduce((sum, r) => sum + (r.stars ?? 0), 0);

  const isChapterUnlocked = (chapterId: string, index: number): boolean => {
    if (index === 0) return true;
    const prevChapter = CAMPAIGN_CHAPTERS[index - 1];
    return !!data.campaignProgress[prevChapter.id];
  };

  const isChapterCompleted = (chapterId: string): boolean => !!data.campaignProgress[chapterId];

  const isChallengeCompleted = (challengeId: string): boolean => !!data.records[challengeId]?.solved;

  const isChapterFullyCompleted = (_chapterId: string, challengeIds: string[]): boolean => {
    return challengeIds.every((id) => isChallengeCompleted(id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">Campaign</h1>
        <p className="text-gray-400">Progress through 8 chapters of computational reasoning challenges.</p>

        {/* Progress overview */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="bg-base-700 rounded-3xl border border-line p-3 text-center shadow-soft">
            <div className="text-2xl font-bold font-display text-accent-400">{completedChapters}/{CAMPAIGN_CHAPTERS.length}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Chapters</div>
          </div>
          <div className="bg-base-700 rounded-3xl border border-line p-3 text-center shadow-soft">
            <div className="text-2xl font-bold font-display text-success-400">{data.stats.totalSolved}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Solved</div>
          </div>
          <div className="bg-base-700 rounded-3xl border border-line p-3 text-center shadow-soft">
            <div className="text-2xl font-bold font-display text-amber-400">{totalStars}★</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Stars</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all duration-700"
              style={{ width: `${(completedChapters / CAMPAIGN_CHAPTERS.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-mono text-accent-400">{Math.round((completedChapters / CAMPAIGN_CHAPTERS.length) * 100)}%</span>
        </div>
      </div>

      {/* Chapter list */}
      <div className="space-y-2">
        {CAMPAIGN_CHAPTERS.map((chapter, index) => {
          const unlocked = isChapterUnlocked(chapter.id, index);
          const completed = isChapterCompleted(chapter.id);
          const fullyCompleted = isChapterFullyCompleted(chapter.id, chapter.challengeIds);
          const expanded = expandedChapter === chapter.id;
          const completedInChapter = chapter.challengeIds.filter(id => isChallengeCompleted(id)).length;

          return (
            <div key={chapter.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
              <button
                onClick={() => unlocked && setExpandedChapter(expanded ? null : chapter.id)}
                disabled={!unlocked}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all text-left ${
                  !unlocked
                    ? 'bg-base-700/30 border-line opacity-50 cursor-not-allowed'
                    : expanded
                    ? 'bg-base-700 border-accent-500/30 shadow-soft'
                    : 'bg-base-700 border-line hover:border-gray-700'
                }`}
              >
                {/* Chapter number / status */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  completed ? 'bg-success-500/15' : unlocked ? 'bg-accent-500/10' : 'bg-base-400'
                }`}>
                  {!unlocked ? (
                    <Lock className="w-4 h-4 text-gray-500" />
                  ) : fullyCompleted ? (
                    <Trophy className="w-5 h-5 text-amber-400" />
                  ) : (
                    <span className="text-sm font-mono font-bold text-accent-400">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${unlocked ? 'text-ink' : 'text-gray-500'}`}>
                      {chapter.title}
                    </h3>
                    {fullyCompleted && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success-500/15 text-success-400 font-medium">Complete</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{chapter.description}</p>
                  {/* Mini progress */}
                  {unlocked && !fullyCompleted && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden max-w-[120px]">
                        <div className="h-full bg-accent-400/60 rounded-full transition-all" style={{ width: `${(completedInChapter / chapter.challengeIds.length) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">{completedInChapter}/{chapter.challengeIds.length}</span>
                    </div>
                  )}
                </div>

                {unlocked && (
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Expanded challenges */}
              {expanded && unlocked && (
                <div className="ml-4 mt-1.5 space-y-1.5 animate-fade-in-down">
                  {chapter.challengeIds.map((challengeId, ci) => {
                    const challenge = getChallengeById(challengeId);
                    if (!challenge) return null;
                    const done = isChallengeCompleted(challengeId);
                    const record = data.records[challengeId];
                    const stars = record?.stars ?? 0;

                    return (
                      <button
                        key={challengeId}
                        onClick={() => onStartChallenge(challengeId)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-base-800 hover:bg-base-700 border border-line hover:border-accent-500/20 transition-all text-left group animate-fade-in-up"
                        style={{ animationDelay: `${ci * 30}ms` }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          done ? 'bg-success-500/15' : 'bg-base-400 group-hover:bg-accent-500/10'
                        }`}>
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-success-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-gray-500 group-hover:text-accent-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${done ? 'text-ink' : 'text-gray-300 group-hover:text-ink'}`}>
                            {challenge.title}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{categoryLabel(challenge.category)}</div>
                        </div>
                        {stars > 0 && (
                          <div className="flex gap-0.5 flex-shrink-0">
                            {[1, 2, 3].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
