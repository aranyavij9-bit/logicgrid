import type { Grid, GateState, SwitchState, ExecutionPosition } from '@/types';
import { Target, Flag, Lock, LockOpen, Zap, Power, CircleDot, Square, Sparkles, Waves, Diamond } from 'lucide-react';

interface GameGridProps {
  grid: Grid;
  position: ExecutionPosition;
  gateState: GateState;
  switchState: SwitchState;
  targetsReached: string[];
  highlightCell?: [number, number] | null;
  failedCell?: [number, number] | null;
  pathTrail?: [number, number][];
  reducedMotion?: boolean;
}

export function GameGrid({ grid, position, gateState, switchState, targetsReached, highlightCell, failedCell, pathTrail, reducedMotion }: GameGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const trailSet = new Set(pathTrail?.map(([r, c]) => `${r},${c}`) ?? []);

  return (
    <div className="inline-block bg-base-700 rounded-3xl p-3 sm:p-4 border border-line shadow-soft">
      {/* Coordinate labels */}
      <div className="flex items-center gap-1 mb-1 ml-5">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="w-10 sm:w-12 text-center text-[8px] font-mono text-gray-500">
            {String.fromCharCode(65 + c)}
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {/* Row labels */}
        <div className="flex flex-col gap-1">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="w-4 h-10 sm:h-12 flex items-center justify-center text-[8px] font-mono text-gray-500">
              {r + 1}
            </div>
          ))}
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = position.row === r && position.col === c;
              const isHighlighted = highlightCell?.[0] === r && highlightCell?.[1] === c;
              const isFailed = failedCell?.[0] === r && failedCell?.[1] === c;
              const isInTrail = trailSet.has(`${r},${c}`) && !isPlayer;
              const isGateOpen = cell.type === 'gate' && gateState[cell.gateId ?? ''];
              const isSwitchOn = cell.type === 'switch' && switchState[`${r},${c}`];
              const targetReached = cell.type === 'target' && cell.label && targetsReached.includes(cell.label);

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200 cell-hover ${
                    cell.type === 'wall'
                      ? 'bg-gray-700/70 border border-gray-700'
                      : cell.type === 'gate'
                      ? isGateOpen
                        ? 'bg-success-500/10 border border-success-500/30'
                        : 'bg-error-500/10 border border-error-500/40'
                      : cell.type === 'switch'
                      ? isSwitchOn
                        ? 'bg-warning-500/20 border border-warning-500/50 shadow-soft'
                        : 'bg-base-400 border border-gray-700'
                      : cell.type === 'mud'
                      ? 'bg-amber-100/60 border border-amber-300/60'
                      : cell.type === 'energy'
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : cell.type === 'portal'
                      ? 'bg-violet-500/10 border border-violet-500/30'
                      : cell.type === 'target'
                      ? targetReached
                        ? 'bg-success-500/20 border border-success-500/50 shadow-soft'
                        : 'bg-accent-500/10 border border-accent-500/40'
                      : cell.type === 'start'
                      ? 'bg-secondary-500/10 border border-secondary-500/30'
                      : cell.type === 'checkpoint'
                      ? 'bg-base-400 border border-gray-700'
                      : isInTrail
                      ? 'bg-accent-500/5 border border-accent-500/15'
                      : 'bg-base-500 border border-line'
                  } ${
                    isHighlighted ? 'ring-2 ring-accent-400 ring-offset-1 ring-offset-base-700' : ''
                  } ${
                    isFailed ? 'ring-2 ring-error-500 ring-offset-1 ring-offset-base-700 animate-pulse' : ''
                  } ${
                    isPlayer ? 'ring-2 ring-accent-300' : ''
                  }`}
                >
                  {/* Trail dot */}
                  {isInTrail && (
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-accent-400/30" />
                  )}

                  {/* Cell icons */}
                  {cell.type === 'wall' && <Square className="w-4 h-4 text-gray-500 fill-gray-600/30" />}
                  {cell.type === 'start' && <Flag className="w-4 h-4 text-secondary-400" />}
                  {cell.type === 'target' && (
                    <Target className={`w-5 h-5 ${targetReached ? 'text-success-400' : 'text-accent-400'} ${!reducedMotion && targetReached ? 'animate-bounce-in' : ''}`} />
                  )}
                  {cell.type === 'switch' && (
                    <Power className={`w-4 h-4 ${isSwitchOn ? 'text-warning-400' : 'text-gray-500'} `} />
                  )}
                  {cell.type === 'gate' && (
                    isGateOpen
                      ? <LockOpen className="w-4 h-4 text-success-400" />
                      : <Lock className="w-4 h-4 text-error-400" />
                  )}
                  {cell.type === 'mud' && <Waves className="w-4 h-4 text-amber-700/70" />}
                  {cell.type === 'energy' && (
                    <Zap className={`w-4 h-4 text-yellow-400`} />
                  )}
                  {cell.type === 'portal' && (
                    <Diamond className={`w-4 h-4 text-violet-400`} />
                  )}
                  {cell.type === 'checkpoint' && <Sparkles className="w-3 h-3 text-gray-500" />}

                  {/* Cell label */}
                  {cell.label && (
                    <span className="absolute top-0 left-0.5 text-[7px] sm:text-[8px] font-mono text-gray-500 leading-none pointer-events-none">
                      {cell.label}
                    </span>
                  )}

                  {/* Cost indicator for mud */}
                  {cell.type === 'mud' && (
                    <span className="absolute bottom-0 right-0.5 text-[7px] font-mono text-amber-600/60 leading-none">
                      {cell.cost}
                    </span>
                  )}

                  {/* Player token */}
                  {isPlayer && (
                    <div className={`absolute inset-0 rounded-lg bg-accent-400/15 flex items-center justify-center`}>
                      <div className={`w-3.5 h-3.5 rounded-full bg-accent-500 shadow-soft`} />
                      <div className="absolute w-6 h-6 rounded-full border border-accent-400/30" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-line flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-gray-500 font-mono">
        <LegendItem icon={Flag} label="Start" color="text-secondary-400" />
        <LegendItem icon={Target} label="Target" color="text-accent-400" />
        <LegendItem icon={Power} label="Switch" color="text-warning-400" />
        <LegendItem icon={Lock} label="Gate" color="text-error-400" />
        <LegendItem icon={Zap} label="Energy" color="text-yellow-400" />
        <LegendItem icon={Waves} label="Mud" color="text-amber-700" />
        <LegendItem icon={Diamond} label="Portal" color="text-violet-400" />
      </div>
    </div>
  );
}

function LegendItem({ icon: Icon, label, color }: { icon: typeof Flag; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <Icon className={`w-3 h-3 ${color}`} />
      <span>{label}</span>
    </div>
  );
}
