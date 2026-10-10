import { categoryLabel } from '@/engine/challenges';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Challenge, PlacedAction, ExecutionResult, ActionDef, GateState, SwitchState, ExecutionPosition } from '@/types';
import { executeSolution } from '@/engine/executor';
import { calculateScore } from '@/engine/scoring';
import { GameGrid } from '@/components/GameGrid';
import { SolutionBuilder } from '@/components/SolutionBuilder';
import { ScorePanel } from '@/components/ScorePanel';
import { SolutionAnalysis } from '@/components/SolutionAnalysis';
import { PatternChallengeView, LogicChallengeView } from '@/components/SpecialChallenges';
import { SortingChallengeView } from '@/components/SortingChallenge';
import { Lightbulb, ArrowLeft, Target, Zap, Clock, Lock, AlertCircle, Layers, Keyboard } from 'lucide-react';

interface GameScreenProps {
  challenge: Challenge;
  onExit: () => void;
  onComplete: (challenge: Challenge, result: ExecutionResult, score: ReturnType<typeof calculateScore>, hintsUsed: number) => void;
  onNextChallenge?: () => void;
  soundEnabled: boolean;
  reducedMotion: boolean;
  onPlaySound: (type: 'click' | 'move' | 'success' | 'fail' | 'complete') => void;
}

function findStart(grid: Challenge['grid']): ExecutionPosition {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].type === 'start') return { row: r, col: c };
    }
  }
  return { row: 0, col: 0 };
}

function initState(challenge: Challenge) {
  const gateState: GateState = {};
  const switchState: SwitchState = {};
  for (let r = 0; r < challenge.grid.length; r++) {
    for (let c = 0; c < challenge.grid[r].length; c++) {
      const cell = challenge.grid[r][c];
      if (cell.type === 'gate' && cell.gateId) gateState[cell.gateId] = false;
      if (cell.type === 'switch') switchState[`${r},${c}`] = false;
    }
  }
  return {
    position: findStart(challenge.grid),
    gateState,
    switchState,
    energy: challenge.startEnergy,
    moves: 0,
    targetsReached: [] as string[],
  };
}

export function GameScreen({ challenge, onExit, onComplete, onNextChallenge, soundEnabled: _soundEnabled, reducedMotion, onPlaySound }: GameScreenProps) {
  const [placedActions, setPlacedActions] = useState<PlacedAction[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [retries, setRetries] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintRevealed, setHintRevealed] = useState<string[]>([]);
  const [specialSolved, setSpecialSolved] = useState(false);
  const [pathTrail, setPathTrail] = useState<[number, number][]>([]);
  const [failedCell, setFailedCell] = useState<[number, number] | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState(() => initState(challenge));

  // Reset when challenge changes
  useEffect(() => {
    setPlacedActions([]);
    setIsRunning(false);
    setCurrentStep(-1);
    setExecResult(null);
    setShowScore(false);
    setShowAnalysis(false);
    setRetries(0);
    setHintsUsed(0);
    setHintRevealed([]);
    setSpecialSolved(false);
    setPathTrail([]);
    setFailedCell(null);
    setState(initState(challenge));
  }, [challenge.id]);

  const moveLimit = challenge.constraints.find((c) => c.type === 'moveLimit')?.value;
  const energyLimit = challenge.constraints.find((c) => c.type === 'energyLimit')?.value;

  const isSortingChallenge = challenge.pattern?.ruleType === 'custom' && challenge.pattern?.answerIndex === -1;
  const isPatternChallenge = challenge.pattern !== undefined && !isSortingChallenge;
  const isLogicChallenge = challenge.logic !== undefined;

  const addAction = useCallback((action: ActionDef) => {
    onPlaySound('click');
    setPlacedActions((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: action.type, label: action.label, cost: action.cost },
    ]);
  }, [onPlaySound]);

  const removeAction = useCallback((id: string) => {
    onPlaySound('click');
    setPlacedActions((prev) => prev.filter((a) => a.id !== id));
  }, [onPlaySound]);

  const reorderAction = useCallback((id: string, dir: 'up' | 'down') => {
    setPlacedActions((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx === -1) return prev;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[newIdx]] = [newArr[newIdx], newArr[idx]];
      return newArr;
    });
  }, []);

  const duplicateAction = useCallback((id: string) => {
    onPlaySound('click');
    setPlacedActions((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
      const newArr = [...prev];
      newArr.splice(idx + 1, 0, copy);
      return newArr;
    });
  }, [onPlaySound]);

  const clearActions = useCallback(() => {
    onPlaySound('click');
    setPlacedActions([]);
  }, [onPlaySound]);

  const resetState = useCallback(() => {
    onPlaySound('click');
    setState(initState(challenge));
    setCurrentStep(-1);
    setExecResult(null);
    setShowScore(false);
    setShowAnalysis(false);
    setIsRunning(false);
    setPathTrail([]);
    setFailedCell(null);
  }, [challenge, onPlaySound]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isRunning) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const actionMap: Record<string, ActionDef> = {};
      for (const a of challenge.availableActions) {
        if (a.type === 'moveUp') actionMap['ArrowUp'] = a;
        if (a.type === 'moveDown') actionMap['ArrowDown'] = a;
        if (a.type === 'moveLeft') actionMap['ArrowLeft'] = a;
        if (a.type === 'moveRight') actionMap['ArrowRight'] = a;
        if (a.type === 'activate') actionMap['e'] = a;
        if (a.type === 'jumpUp') actionMap['w'] = a;
        if (a.type === 'jumpDown') actionMap['s'] = a;
        if (a.type === 'jumpLeft') actionMap['a'] = a;
        if (a.type === 'jumpRight') actionMap['d'] = a;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (actionMap[key]) {
        e.preventDefault();
        addAction(actionMap[key]);
      }
      if (key === 'enter' && placedActions.length > 0) {
        e.preventDefault();
        runSolution();
      }
      if (key === 'backspace' && placedActions.length > 0) {
        e.preventDefault();
        setPlacedActions((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [challenge.availableActions, addAction, placedActions.length, isRunning]);

  const runSolution = useCallback(() => {
    if (placedActions.length === 0) return;
    setIsRunning(true);
    setCurrentStep(-1);
    setShowScore(false);
    setShowAnalysis(false);
    setPathTrail([]);
    setFailedCell(null);
    setState(initState(challenge));

    const result = executeSolution(challenge, placedActions);
    const trail: [number, number][] = [];
    const startPos = findStart(challenge.grid);
    trail.push([startPos.row, startPos.col]);

    let step = 0;
    const animate = () => {
      if (step >= result.steps.length) {
        setIsRunning(false);
        setExecResult(result);
        if (result.success) {
          onPlaySound('complete');
          setShowScore(true);
          setShowAnalysis(true);
          const score = calculateScore(challenge, result, retries, hintsUsed);
          onComplete(challenge, result, score, hintsUsed);
        } else {
          onPlaySound('fail');
          setShowAnalysis(true);
        }
        return;
      }

      const stepResult = result.steps[step];
      setCurrentStep(step);
      setState({
        position: stepResult.position,
        gateState: stepResult.gateState,
        switchState: stepResult.switchState,
        energy: stepResult.energyRemaining,
        moves: stepResult.movesUsed,
        targetsReached: stepResult.targetsReached,
      });

      if (stepResult.success) {
        onPlaySound('move');
        if (!trail.some(([r, c]) => r === stepResult.position.row && c === stepResult.position.col)) {
          trail.push([stepResult.position.row, stepResult.position.col]);
          setPathTrail([...trail]);
        }
      } else {
        onPlaySound('fail');
        setFailedCell([stepResult.position.row, stepResult.position.col]);
      }

      step++;
      stepTimeoutRef.current = setTimeout(animate, reducedMotion ? 100 : 350);
    };

    animate();
  }, [placedActions, challenge, retries, hintsUsed, onComplete, onPlaySound, reducedMotion]);

  const stepSolution = useCallback(() => {
    if (isRunning) return;
    if (currentStep === -1) {
      const result = executeSolution(challenge, placedActions);
      setExecResult(result);
      if (result.steps.length === 0) return;
    }

    if (!execResult) return;
    const nextStep = currentStep + 1;

    if (nextStep >= execResult.steps.length) {
      setIsRunning(false);
      if (execResult.success) {
        onPlaySound('complete');
        setShowScore(true);
        setShowAnalysis(true);
        const score = calculateScore(challenge, execResult, retries, hintsUsed);
        onComplete(challenge, execResult, score, hintsUsed);
      } else {
        onPlaySound('fail');
        setShowAnalysis(true);
      }
      return;
    }

    const stepResult = execResult.steps[nextStep];
    setCurrentStep(nextStep);
    setState({
      position: stepResult.position,
      gateState: stepResult.gateState,
      switchState: stepResult.switchState,
      energy: stepResult.energyRemaining,
      moves: stepResult.movesUsed,
      targetsReached: stepResult.targetsReached,
    });

    if (stepResult.success) {
      onPlaySound('move');
      setPathTrail((prev) => {
        if (prev.some(([r, c]) => r === stepResult.position.row && c === stepResult.position.col)) return prev;
        return [...prev, [stepResult.position.row, stepResult.position.col]];
      });
    } else {
      onPlaySound('fail');
      setFailedCell([stepResult.position.row, stepResult.position.col]);
    }
  }, [isRunning, currentStep, execResult, challenge, placedActions, retries, hintsUsed, onComplete, onPlaySound]);

  const useHint = useCallback(() => {
    if (hintsUsed >= 3) return;
    onPlaySound('click');
    const hintIdx = hintsUsed;
    const hint = challenge.hints[hintIdx];
    if (hint) {
      setHintRevealed((prev) => [...prev, hint]);
      setHintsUsed((h) => h + 1);
    }
  }, [hintsUsed, challenge.hints, onPlaySound]);

  const handleSpecialSolved = useCallback(() => {
    if (specialSolved) return;
    setSpecialSolved(true);
    onPlaySound('complete');
    setShowScore(true);
    setShowAnalysis(true);
    const mockResult: ExecutionResult = {
      success: true,
      steps: [],
      finalPosition: { row: 0, col: 0 },
      movesUsed: 1,
      energyUsed: 0,
      energyRemaining: challenge.startEnergy,
      targetsReached: challenge.targets,
    };
    const score = calculateScore(challenge, mockResult, retries, hintsUsed);
    onComplete(challenge, mockResult, score, hintsUsed);
  }, [specialSolved, challenge, retries, hintsUsed, onComplete, onPlaySound]);

  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, []);

  const specialScoreResult: ExecutionResult = {
    success: true,
    steps: [],
    finalPosition: { row: 0, col: 0 },
    movesUsed: 1,
    energyUsed: 0,
    energyRemaining: challenge.startEnergy,
    targetsReached: [],
  };

  // ===== Special challenge rendering =====
  if (isPatternChallenge && challenge.pattern) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
        <GameHeader challenge={challenge} onExit={onExit} />
        <PatternChallengeView
          pattern={challenge.pattern}
          onAnswer={(answer) => {
            if (answer === challenge.pattern!.answer) {
              handleSpecialSolved();
              return true;
            }
            onPlaySound('fail');
            return false;
          }}
          hintsUsed={hintsUsed}
          onUseHint={useHint}
          hintRevealed={hintRevealed}
        />
        {showScore && (
          <ScorePanel
            challenge={challenge}
            result={specialScoreResult}
            score={calculateScore(challenge, specialScoreResult, retries, hintsUsed)}
            onReplay={() => { resetState(); setSpecialSolved(false); setShowScore(false); }}
            onOptimize={() => { resetState(); setSpecialSolved(false); setShowScore(false); }}
            onNext={onNextChallenge}
            isNewRecord={false}
          />
        )}
      </div>
    );
  }

  if (isLogicChallenge && challenge.logic) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
        <GameHeader challenge={challenge} onExit={onExit} />
        <LogicChallengeView
          logic={challenge.logic}
          onSolved={handleSpecialSolved}
          hintsUsed={hintsUsed}
          onUseHint={useHint}
          hintRevealed={hintRevealed}
        />
        {showScore && (
          <ScorePanel
            challenge={challenge}
            result={specialScoreResult}
            score={calculateScore(challenge, specialScoreResult, retries, hintsUsed)}
            onReplay={() => { resetState(); setSpecialSolved(false); setShowScore(false); }}
            onOptimize={() => { resetState(); setSpecialSolved(false); setShowScore(false); }}
            onNext={onNextChallenge}
            isNewRecord={false}
          />
        )}
      </div>
    );
  }

  if (isSortingChallenge && challenge.pattern) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
        <GameHeader challenge={challenge} onExit={onExit} />
        <SortingChallengeView
          pattern={challenge.pattern}
          onSolved={handleSpecialSolved}
          hintsUsed={hintsUsed}
          onUseHint={useHint}
          hintRevealed={hintRevealed}
        />
        {showScore && (
          <ScorePanel
            challenge={challenge}
            result={specialScoreResult}
            score={calculateScore(challenge, specialScoreResult, retries, hintsUsed)}
            onReplay={() => { resetState(); setSpecialSolved(false); setShowScore(false); }}
            onOptimize={() => { resetState(); setSpecialSolved(false); setShowScore(false); }}
            onNext={onNextChallenge}
            isNewRecord={false}
          />
        )}
      </div>
    );
  }

  // ===== Grid-based challenge =====
  const currentStepResult = execResult?.steps[currentStep];
  const highlightCell = currentStepResult && !currentStepResult.success ? currentStepResult.position : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <GameHeader challenge={challenge} onExit={onExit} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-6">
        {/* Left: Grid + Solution Builder */}
        <div className="space-y-4">
          {/* Grid */}
          <div className="flex justify-center overflow-x-auto pb-2">
            <GameGrid
              grid={challenge.grid}
              position={state.position}
              gateState={state.gateState}
              switchState={state.switchState}
              targetsReached={state.targetsReached}
              highlightCell={highlightCell ? [highlightCell.row, highlightCell.col] : null}
              failedCell={failedCell}
              pathTrail={pathTrail}
              reducedMotion={reducedMotion}
            />
          </div>

          {/* Execution log */}
          {isRunning && currentStep >= 0 && execResult && (
            <div className="bg-base-700 rounded-3xl border border-line p-3 max-h-32 overflow-y-auto shadow-soft">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Execution Log</div>
              <div className="space-y-0.5 text-xs font-mono">
                {execResult.steps.slice(0, currentStep + 1).map((s, i) => (
                  <div key={i} className={`flex items-center gap-2 ${i === currentStep ? 'text-accent-400' : 'text-gray-500'}`}>
                    <span className="text-gray-500 w-5">{i + 1}.</span>
                    <span>{s.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error display */}
          {execResult && !execResult.success && showAnalysis && execResult.failReason && (
            <div className="bg-error-500/10 border border-error-500/20 rounded-3xl p-4 flex items-start gap-3 text-sm text-error-600 animate-fade-in-down">
              <div className="w-6 h-6 rounded-lg bg-error-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-error-400" />
              </div>
              <div>
                <div className="font-semibold text-error-400 mb-0.5">Action {execResult.failStepIndex !== undefined ? execResult.failStepIndex + 1 : ''} Failed</div>
                <span className="text-error-700">{execResult.failReason}</span>
              </div>
            </div>
          )}

          {/* Solution Analysis */}
          {showAnalysis && execResult && (
            <SolutionAnalysis challenge={challenge} result={execResult} />
          )}

          {/* Score Panel */}
          {showScore && execResult && (
            <ScorePanel
              challenge={challenge}
              result={execResult}
              score={calculateScore(challenge, execResult, retries, hintsUsed)}
              onReplay={() => { resetState(); setRetries(r => r + 1); }}
              onOptimize={() => { resetState(); setRetries(r => r + 1); }}
              onNext={onNextChallenge}
              isNewRecord={false}
            />
          )}

          {/* Solution Builder */}
          <SolutionBuilder
            availableActions={challenge.availableActions}
            placedActions={placedActions}
            onAddAction={addAction}
            onRemoveAction={removeAction}
            onReorderAction={reorderAction}
            onDuplicateAction={duplicateAction}
            onClear={clearActions}
            onRun={runSolution}
            onStep={stepSolution}
            onReset={resetState}
            isRunning={isRunning}
            currentStep={currentStep}
            energy={state.energy}
            moves={state.moves}
            moveLimit={moveLimit}
            energyLimit={energyLimit}
          />
        </div>

        {/* Right: Objective panel */}
        <div className="space-y-3">
          {/* Objective */}
          <div className="bg-base-700 rounded-3xl border border-line p-4 space-y-3 shadow-soft">
            <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" /> Objective
            </h3>
            <p className="text-sm text-gray-300">{challenge.objective}</p>
            <p className="text-xs text-gray-500">{challenge.description}</p>
          </div>

          {/* Constraints */}
          <div className="bg-base-700 rounded-3xl border border-line p-4 space-y-2.5 shadow-soft">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Constraints
            </h3>
            {challenge.constraints.length === 0 && challenge.targets.length <= 1 ? (
              <p className="text-xs text-gray-600">No special constraints.</p>
            ) : (
              challenge.constraints.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <ConstraintIcon type={c.type} />
                  {c.label}
                </div>
              ))
            )}
            {challenge.targets.length > 1 && (
              <div className="flex items-center gap-2.5 text-sm text-gray-300 pt-1 border-t border-line">
                <Target className="w-4 h-4 text-accent-400" />
                <span>Reach {challenge.targets.length} targets: {challenge.targets.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Keyboard hint */}
          {!isRunning && placedActions.length === 0 && (
            <div className="bg-base-700 rounded-3xl border border-line p-3">
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <Keyboard className="w-3.5 h-3.5 text-gray-500" />
                <span>Use arrow keys to add moves, <kbd className="px-1 py-0.5 rounded bg-base-400 text-[9px] font-mono">Enter</kbd> to run</span>
              </div>
            </div>
          )}

          {/* Hints */}
          {hintsUsed < 3 && (
            <button
              onClick={useHint}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-warning-500/10 hover:bg-warning-500/20 text-warning-400 font-medium text-sm transition-all border border-warning-500/20 hover:scale-[1.02]"
            >
              <Lightbulb className="w-4 h-4" />
              Get Hint ({3 - hintsUsed} remaining)
            </button>
          )}

          {hintRevealed.length > 0 && (
            <div className="space-y-2">
              {hintRevealed.map((h, i) => (
                <div key={i} className="bg-warning-500/5 border border-warning-500/20 rounded-2xl p-3 text-sm text-warning-700 animate-fade-in-up">
                  <span className="font-semibold text-warning-400">Hint {i + 1}:</span> {h}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GameHeader({ challenge, onExit }: { challenge: Challenge; onExit: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="p-2 rounded-full bg-base-400 hover:bg-gray-800 text-gray-400 hover:text-ink transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-ink">{challenge.title}</h2>
          <p className="text-xs text-gray-500 capitalize flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
              {categoryLabel(challenge.category)}
            </span>
            <span className="text-gray-700">·</span>
            <span>Difficulty {challenge.difficulty}/7</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ConstraintIcon({ type }: { type: string }) {
  switch (type) {
    case 'moveLimit': return <Target className="w-4 h-4 text-accent-400" />;
    case 'energyLimit': return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'actionLimit': return <Clock className="w-4 h-4 text-gray-400" />;
    case 'dependency': return <Lock className="w-4 h-4 text-warning-400" />;
    case 'resourceLimit': return <Zap className="w-4 h-4 text-orange-400" />;
    default: return <Target className="w-4 h-4 text-gray-400" />;
  }
}
