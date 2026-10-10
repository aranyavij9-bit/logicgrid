import type { ActionDef, PlacedAction } from '@/types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Power, PowerOff, Clock, RotateCw, Package, Zap, ArrowUpCircle, ArrowDownCircle, ArrowLeftCircle, ArrowRightCircle, Trash2, Play, SkipForward, X, Copy, ChevronRight } from 'lucide-react';

interface SolutionBuilderProps {
  availableActions: ActionDef[];
  placedActions: PlacedAction[];
  onAddAction: (action: ActionDef) => void;
  onRemoveAction: (id: string) => void;
  onReorderAction: (id: string, dir: 'up' | 'down') => void;
  onDuplicateAction: (id: string) => void;
  onClear: () => void;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  isRunning: boolean;
  currentStep: number;
  energy: number;
  moves: number;
  moveLimit?: number;
  energyLimit?: number;
}

const ACTION_ICONS: Record<string, typeof ArrowUp> = {
  moveUp: ArrowUp,
  moveDown: ArrowDown,
  moveLeft: ArrowLeft,
  moveRight: ArrowRight,
  activate: Power,
  deactivate: PowerOff,
  wait: Clock,
  rotate: RotateCw,
  collect: Package,
  teleport: Zap,
  jumpUp: ArrowUpCircle,
  jumpDown: ArrowDownCircle,
  jumpLeft: ArrowLeftCircle,
  jumpRight: ArrowRightCircle,
};

const ACTION_KEY_HINTS: Record<string, string> = {
  moveUp: '↑',
  moveDown: '↓',
  moveLeft: '←',
  moveRight: '→',
  activate: 'E',
  jumpUp: 'W',
  jumpDown: 'S',
  jumpLeft: 'A',
  jumpRight: 'D',
};

export function SolutionBuilder({
  availableActions,
  placedActions,
  onAddAction,
  onRemoveAction,
  onReorderAction,
  onDuplicateAction,
  onClear,
  onRun,
  onStep,
  onReset,
  isRunning,
  currentStep,
  energy,
  moves,
  moveLimit,
  energyLimit,
}: SolutionBuilderProps) {
  const energyLow = energyLimit !== undefined && energy < energyLimit * 0.25;
  const movesHigh = moveLimit !== undefined && moves > moveLimit * 0.8;
  const totalCost = placedActions.reduce((sum, a) => sum + a.cost, 0);

  return (
    <div className="bg-base-700 rounded-3xl border border-line p-4 space-y-4 shadow-soft">
      {/* Action palette */}
      <div>
        <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Available Actions</h4>
        <div className="flex flex-wrap gap-2">
          {availableActions.map((action) => {
            const Icon = ACTION_ICONS[action.type] || Zap;
            const keyHint = ACTION_KEY_HINTS[action.type];
            return (
              <button
                key={action.type}
                onClick={() => onAddAction(action)}
                disabled={isRunning}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-base-400 hover:bg-accent-500/15 text-gray-300 hover:text-accent-400 text-sm font-medium transition-all border border-line hover:border-accent-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
              >
                <Icon className="w-4 h-4" />
                {action.label}
                {action.cost > 0 && (
                  <span className="text-[10px] text-gray-500 ml-0.5 font-mono">{action.cost}e</span>
                )}
                {keyHint && (
                  <kbd className="hidden sm:inline-block px-1 py-0.5 rounded bg-gray-800 text-[9px] font-mono text-gray-500 group-hover:text-accent-400/60 ml-1">{keyHint}</kbd>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Placed actions sequence */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            Solution Sequence
            {placedActions.length > 0 && (
              <span className="font-mono text-gray-600 normal-case tracking-normal">{placedActions.length} steps · {totalCost}e total</span>
            )}
          </h4>
          {placedActions.length > 0 && (
            <button
              onClick={onClear}
              disabled={isRunning}
              className="text-xs text-gray-500 hover:text-error-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {placedActions.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-line rounded-xl bg-base-800/50">
            <ChevronRight className="w-5 h-5 mx-auto mb-1.5 text-gray-700" />
            Add actions above to build your solution
          </div>
        ) : (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {placedActions.map((action, i) => {
              const Icon = ACTION_ICONS[action.type] || Zap;
              const isCurrent = isRunning && i === currentStep;
              const isPast = isRunning && i < currentStep;
              const isFailed = isRunning && i === currentStep && execFailed(execResult, i);
              return (
                <div
                  key={action.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all animate-slide-up ${
                    isCurrent
                      ? isFailed
                        ? 'bg-error-500/15 border-error-500/50 scale-[1.02]'
                        : 'bg-accent-500/15 border-accent-500/50 scale-[1.02]'
                      : isPast
                      ? 'bg-base-400 border-line opacity-40'
                      : 'bg-base-400 border-line hover:border-gray-700'
                  }`}
                >
                  <span className={`text-xs font-mono w-5 text-center ${isCurrent ? 'text-accent-400' : 'text-gray-600'}`}>{i + 1}</span>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-accent-400' : 'text-accent-400/60'}`} />
                  <span className="text-sm text-gray-300 flex-1">{action.label}</span>
                  {action.cost > 0 && <span className="text-[10px] text-gray-500 font-mono">{action.cost}e</span>}
                  {!isRunning && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => onReorderAction(action.id, 'up')}
                        disabled={i === 0}
                        className="p-1 text-gray-500 hover:text-accent-400 disabled:opacity-20 transition-colors"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onReorderAction(action.id, 'down')}
                        disabled={i === placedActions.length - 1}
                        className="p-1 text-gray-500 hover:text-accent-400 disabled:opacity-20 transition-colors"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDuplicateAction(action.id)}
                        className="p-1 text-gray-500 hover:text-accent-400 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveAction(action.id)}
                        className="p-1 text-gray-500 hover:text-error-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status bar */}
      {(energyLimit !== undefined || moveLimit !== undefined) && (
        <div className="flex items-center gap-4 text-xs">
          {energyLimit !== undefined && (
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${energyLow ? 'text-error-400 animate-pulse' : 'text-yellow-400'}`} />
              <span className="text-gray-500">Energy:</span>
              <div className="flex items-center gap-1.5">
                <span className={`font-mono font-bold ${energyLow ? 'text-error-400' : 'text-ink'}`}>
                  {energy}
                </span>
                <span className="text-gray-600 font-mono">/ {energyLimit}</span>
              </div>
              {/* Energy bar */}
              <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${energyLow ? 'bg-error-500' : 'bg-yellow-400'}`}
                  style={{ width: `${Math.max(0, (energy / energyLimit) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {moveLimit !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Moves:</span>
              <span className={`font-mono font-bold ${movesHigh ? 'text-warning-400' : 'text-ink'}`}>
                {moves}
              </span>
              <span className="text-gray-600 font-mono">/ {moveLimit}</span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={isRunning || placedActions.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-soft hover:scale-[1.02]"
        >
          <Play className="w-4 h-4" />
          Run
          <kbd className="hidden sm:inline-block px-1 py-0.5 rounded bg-ink/10 text-[9px] font-mono opacity-70">↵</kbd>
        </button>
        <button
          onClick={onStep}
          disabled={isRunning || placedActions.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-base-400 hover:bg-gray-800 text-gray-300 font-medium text-sm transition-all border border-line disabled:opacity-40"
        >
          <SkipForward className="w-4 h-4" />
          Step
        </button>
        <button
          onClick={onReset}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-base-400 hover:bg-gray-800 text-gray-300 font-medium text-sm transition-all border border-line disabled:opacity-40"
        >
          <RotateCw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}

// Helper to check if step failed — we don't have execResult here, so we use a simpler check
function execFailed(result: { failStepIndex?: number } | null | undefined, i: number): boolean {
  return result?.failStepIndex === i;
}
